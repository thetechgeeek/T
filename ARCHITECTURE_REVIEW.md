# TileMaster — Senior Staff Engineer Architecture Review

**Reviewer**: Senior Staff Engineer
**Date**: 2026-03-28
**Scope**: Full-stack codebase audit — Frontend (React Native/Expo), Backend (Supabase/Postgres), State Management, Testing, DevOps
**Goal**: Refactor toward a codebase where adding tens/hundreds of features in any direction requires only **surgical additions** — not edits. Bugs are found via `grep`, fixed surgically. TDD is first-class.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Critical: Data Integrity & Transactional Safety](#2-critical-data-integrity--transactional-safety)
3. [Architecture: Service Layer Redesign](#3-architecture-service-layer-redesign)
4. [Architecture: Store Layer Redesign](#4-architecture-store-layer-redesign)
5. [Type System: Close the Escape Hatches](#5-type-system-close-the-escape-hatches)
6. [Database: Schema & Migration Hygiene](#6-database-schema--migration-hygiene)
7. [Testing: TDD Infrastructure](#7-testing-tdd-infrastructure)
8. [Frontend: Component & Screen Patterns](#8-frontend-component--screen-patterns)
9. [Validation: Zod Integration (Currently Unused)](#9-validation-zod-integration-currently-unused)
10. [Security & RLS](#10-security--rls)
11. [DevOps & DX](#11-devops--dx)
12. [Error Handling Strategy](#12-error-handling-strategy)
13. [i18n Gaps](#13-i18n-gaps)
14. [Frontend: Component-Level Deep Dive](#14-frontend-component-level-deep-dive)
15. [Screen-Level Anti-Patterns & Fixes](#15-screen-level-anti-patterns--fixes)
16. [Theme System: Performance & Structural Issues](#16-theme-system-performance--structural-issues)
17. [Utility Functions: Bugs, Edge Cases & Missing Coverage](#17-utility-functions-bugs-edge-cases--missing-coverage)
18. [PDF Generation: Fragility & XSS](#18-pdf-generation-fragility--xss)
19. [Data Loading: Waterfall & Stale State](#19-data-loading-waterfall--stale-state)
20. [Accessibility & UX Gaps](#20-accessibility--ux-gaps)
21. [Constants & Enums: Source-of-Truth Drift](#21-constants--enums-source-of-truth-drift)
22. [Hooks Layer: Missing Abstractions](#22-hooks-layer-missing-abstractions)
23. [Scalability](#23-scalability)
24. [Reliability & Resilience](#24-reliability--resilience)
25. [Observability](#25-observability)
26. [Performance](#26-performance)
27. [Security (Extended)](#27-security-extended)
28. [Compliance](#28-compliance)
29. [Portability & Interoperability](#29-portability--interoperability)
30. [Extensibility](#30-extensibility)
31. [Prioritized Refactoring Roadmap](#31-prioritized-refactoring-roadmap)

---

## 1. Executive Summary

### What's Good
- **Atomic Design** component structure (atoms/molecules/organisms) is well-established
- **Zustand + Immer** is a pragmatic, lightweight choice for state management
- **Domain-driven file organization** (types, services, stores per domain) scales well
- **GST calculation logic** is correctly separated and unit-tested
- **Database schema** is well-normalized with proper FK relationships, triggers, and RPC functions
- **i18n** is integrated from day one (EN/HI) — rare for an MVP

### What Must Change

| Severity | Issue | Impact |
|----------|-------|--------|
| **P0 — Critical** | No transactional safety on invoice creation | Silent data corruption: invoices created without stock deduction, orphaned line items |
| **P0 — Critical** | RLS policies are `USING (true)` — no tenant isolation | Any authenticated user sees all data; blocks multi-tenant future |
| **P1 — High** | Types leak `any` in 14+ locations | Defeats TypeScript's purpose; bugs hide at compile-time |
| **P1 — High** | No runtime validation (Zod is installed but unused) | Malformed data reaches DB; errors surface as Postgres errors |
| **P1 — High** | Tests mock Supabase at wrong layer — zero business logic coverage | Tests verify "did we call supabase.from()?" not "did we calculate correctly?" |
| **P2 — Medium** | Services are singletons with hardcoded `supabase` import | Cannot inject test doubles, cannot switch backends, cannot add middleware |
| **P2 — Medium** | Stores mix concerns: UI state + async orchestration + cross-store coupling | Adding features requires editing store files; violates Open/Closed |
| **P2 — Medium** | Screens contain business logic, raw state management, inline styles | Each new screen rewrites the same patterns |
| **P3 — Low** | No CI/CD, no linting, no pre-commit hooks | Quality regresses with every PR |

---

## 2. Critical: Data Integrity & Transactional Safety

### The Problem

`invoiceService.createInvoice()` (lines 55-143) performs **4 sequential, non-transactional operations**:

```
1. RPC: generate_invoice_number()     ← succeeds
2. INSERT: invoices                    ← succeeds
3. INSERT: invoice_line_items          ← fails? → orphaned invoice, wasted number
4. LOOP RPC: perform_stock_operation() ← partial failure? → stock inconsistency
```

The code itself acknowledges this:
```typescript
// Ideally roll back, but REST is not transactional.
// Alternatively, we could write a single RPC that does everything.
```

Similarly, `paymentService.recordPayment()` does 3 non-atomic steps (insert payment → read invoice → update invoice). A concurrent payment could overwrite another.

### The Fix: Server-Side Transaction RPC

**Create a single Postgres function** that does the entire invoice creation atomically:

```sql
-- New migration: 008_transactional_invoice.sql
CREATE OR REPLACE FUNCTION create_invoice_with_items(
  p_invoice JSONB,
  p_line_items JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_invoice_number TEXT;
  v_invoice_id UUID;
  v_item JSONB;
  v_result JSONB;
BEGIN
  -- 1. Generate invoice number (locked row)
  v_invoice_number := generate_invoice_number();

  -- 2. Insert invoice
  INSERT INTO invoices (invoice_number, invoice_date, customer_id, ...)
  VALUES (v_invoice_number, ...)
  RETURNING id INTO v_invoice_id;

  -- 3. Insert all line items
  INSERT INTO invoice_line_items (invoice_id, item_id, ...)
  SELECT v_invoice_id, ...
  FROM jsonb_array_elements(p_line_items) AS item;

  -- 4. Stock deductions (all or nothing)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_line_items)
  LOOP
    PERFORM perform_stock_operation(
      (v_item->>'item_id')::UUID,
      'stock_out',
      -(v_item->>'quantity')::INTEGER,
      'Invoice #' || v_invoice_number,
      'invoice',
      v_invoice_id
    );
  END LOOP;

  -- If ANY step fails, the entire transaction rolls back automatically
  RETURN jsonb_build_object('id', v_invoice_id, 'invoice_number', v_invoice_number);
END;
$$ LANGUAGE plpgsql;
```

**Do the same for `record_payment_with_invoice_update()`.**

### Impact
- Invoice creation becomes a single `supabase.rpc()` call
- Zero chance of partial state
- Service layer simplifies to ~10 lines

---

## 3. Architecture: Service Layer Redesign

### Current Problem

Services are **object literals** with hardcoded `supabase` imports:

```typescript
// Current: untestable, rigid
import { supabase } from '../config/supabase';
export const invoiceService = {
  async fetchInvoices(filters, page, limit) {
    let query = supabase.from('invoices').select(...)
    // 30 lines of query building
  }
};
```

**Issues:**
1. Cannot inject a test double without `jest.mock()` gymnastics
2. Cannot add cross-cutting concerns (logging, analytics, retry, offline queue) without editing every method
3. Filter-building logic duplicated across services (customer, invoice, inventory all do the same `.ilike()` / `.gte()` / `.range()` pattern)

### Proposed: Repository Pattern + Service Composition

```
┌──────────────────────────────────────────────────────┐
│ Screen (UI)                                          │
│   └─ calls Store action                             │
│        └─ calls Service (business logic + validation)│
│             └─ calls Repository (data access only)   │
│                  └─ Supabase client                  │
└──────────────────────────────────────────────────────┘
```

**Step 1: Extract a base repository with shared query utilities**

```typescript
// src/repositories/baseRepository.ts
export function createRepository<T>(tableName: string) {
  return {
    async findMany(options: QueryOptions): Promise<PaginatedResult<T>> {
      let query = supabase.from(tableName).select('*', { count: 'exact' });
      query = applyFilters(query, options.filters);
      query = applySorting(query, options.sort);
      query = applyPagination(query, options.pagination);
      const { data, count, error } = await query;
      if (error) throw new AppError(error.message, error.code);
      return { data: data as T[], total: count ?? 0 };
    },

    async findById(id: UUID): Promise<T> { ... },
    async create(payload: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> { ... },
    async update(id: UUID, payload: Partial<T>): Promise<T> { ... },
  };
}
```

**Step 2: Domain repositories extend the base**

```typescript
// src/repositories/invoiceRepository.ts
const base = createRepository<Invoice>('invoices');

export const invoiceRepository = {
  ...base,
  async findWithCustomer(id: UUID) {
    return supabase.from('invoices')
      .select('*, line_items:invoice_line_items(*)')
      .eq('id', id).single();
  },
  async createAtomic(input: InvoiceInput) {
    return supabase.rpc('create_invoice_with_items', { ... });
  }
};
```

**Step 3: Services contain only business logic**

```typescript
// src/services/invoiceService.ts
export function createInvoiceService(repo = invoiceRepository) {
  return {
    async create(input: InvoiceInput): Promise<Invoice> {
      // 1. Validate (Zod)
      const validated = InvoiceInputSchema.parse(input);
      // 2. Calculate totals
      const totals = calculateInvoiceTotals(validated.line_items, validated.is_inter_state);
      // 3. Delegate to repo (atomic)
      return repo.createAtomic({ ...validated, ...totals });
    }
  };
}
```

### Benefits
- **Adding a feature** (e.g., invoice approval workflow): add a new service method, don't edit existing ones
- **Testing**: inject a mock repository — test business logic without Supabase
- **Offline support**: swap repository implementation without touching services
- **Logging/analytics**: add middleware at the repository layer once

---

## 4. Architecture: Store Layer Redesign

### Current Problems

**4.1: Cross-store coupling via `require()`**

```typescript
// invoiceStore.ts:87 — dynamic require inside store action
const { useInventoryStore } = require('./inventoryStore');
useInventoryStore.getState().fetchItems(true);
```

This creates a hidden dependency graph. When you add a new store that depends on invoices, you must edit the invoice store.

**Fix**: Event-based decoupling

```typescript
// src/events/appEvents.ts
import { create } from 'zustand';

type AppEvent =
  | { type: 'INVOICE_CREATED'; invoiceId: string }
  | { type: 'PAYMENT_RECORDED'; paymentId: string; invoiceId?: string }
  | { type: 'STOCK_CHANGED'; itemId: string };

// Simple pub/sub — stores subscribe to events they care about
export const useEventBus = create<{ emit: (event: AppEvent) => void }>(...);
```

Now `invoiceStore` emits `INVOICE_CREATED`, and `inventoryStore` subscribes to it independently. Adding a new "analytics store" or "notification store" requires zero edits to existing stores.

**4.2: Every store reinvents the same pagination/loading/error pattern**

Compare `inventoryStore` and `invoiceStore` — they have near-identical boilerplate for:
- `loading`, `error`, `page`, `hasMore`, `totalCount`
- `setFilters()` → reset page → fetch
- `fetchItems(reset?)` → append or replace
- Error handling try/catch → set error

**Fix**: Extract a generic paginated store factory

```typescript
// src/stores/createPaginatedStore.ts
export function createPaginatedStore<T, F extends Record<string, unknown>>(config: {
  fetchFn: (filters: F, page: number, pageSize: number) => Promise<PaginatedResult<T>>;
  defaultFilters: F;
  pageSize?: number;
}) {
  return create<PaginatedState<T, F>>()(immer((set, get) => ({
    items: [],
    totalCount: 0,
    loading: false,
    error: null,
    filters: config.defaultFilters,
    page: 1,
    hasMore: true,

    setFilters: (newFilters: Partial<F>) => { /* shared logic */ },
    fetch: async (reset = false) => { /* shared logic */ },
    reset: () => { /* shared logic */ },
  })));
}

// Usage — entire store definition in 5 lines:
export const useInventoryStore = createPaginatedStore<InventoryItem, InventoryFilters>({
  fetchFn: inventoryRepository.findMany,
  defaultFilters: { search: '', category: 'ALL', lowStockOnly: false, sortBy: 'created_at', sortDir: 'desc' },
});
```

**4.3: `any` types in store interfaces**

```typescript
// inventoryStore.ts:19-20
createItem: (item: any) => Promise<InventoryItem>;
updateItem: (id: UUID, updates: any) => Promise<InventoryItem>;
```

These should be `InventoryItemInsert` and `Partial<InventoryItemInsert>`.

---

## 5. Type System: Close the Escape Hatches

### 5.1: `any` Audit

| File | Line(s) | Issue |
|------|---------|-------|
| `invoiceService.ts` | 36 | `data as any[]` — return type should be typed |
| `inventoryStore.ts` | 19-20 | `createItem: (item: any)` / `updateItem: (id, updates: any)` |
| `financeService.ts` | 75 | `(p.suppliers as any)?.name` — needs typed join |
| `orderService.ts` | 17 | `raw_llm_response: any` — define a LLM response type |
| `invoiceStore.ts` | 87 | `require('./inventoryStore')` — untyped dynamic import |
| `app/_layout.tsx` | 36 | `useTheme() as any` — theme type not inferred |
| Screens (multiple) | various | `catch (e: any)` — should use typed `AppError` |

### 5.2: Duplicate Type Definitions

`financeService.ts` defines its own `Expense`, `Purchase`, and `ProfitLossSummary` interfaces (lines 4-30) despite `src/types/finance.ts` existing. These will drift apart.

**Fix**: Single source of truth in `src/types/`, re-export from services if needed.

### 5.3: Missing Discriminated Unions for State

```typescript
// Current: boolean soup
interface InventoryState {
  loading: boolean;
  error: string | null;
  items: InventoryItem[];
}
// Problem: nothing stops `loading: true` AND `error: "something"` simultaneously

// Better: discriminated union
type InventoryState =
  | { status: 'idle'; items: InventoryItem[] }
  | { status: 'loading'; items: InventoryItem[] }
  | { status: 'error'; error: AppError; items: InventoryItem[] }
  | { status: 'success'; items: InventoryItem[]; totalCount: number };
```

### 5.4: Brand Types for Critical IDs

```typescript
// Current: all IDs are `string` — easy to pass customer_id where invoice_id is expected
type UUID = string;

// Better: branded types
type CustomerId = string & { __brand: 'CustomerId' };
type InvoiceId = string & { __brand: 'InvoiceId' };
// Compile-time error: cannot pass CustomerId to a function expecting InvoiceId
```

---

## 6. Database: Schema & Migration Hygiene

### 6.1: RLS is a No-Op

```sql
-- 007_views_functions_rls.sql:195
CREATE POLICY "auth_full_access" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)
```

Every authenticated user can read/write every row in every table. This is fine for single-user, but:
- **Blocks multi-tenant** (multiple businesses on same Supabase project)
- **Blocks role-based access** (owner vs. staff vs. read-only)
- **Security risk**: if anon key leaks, all data is accessible

**Fix (when ready for multi-tenant)**:
```sql
-- Add user_id to all tables
ALTER TABLE customers ADD COLUMN user_id UUID NOT NULL DEFAULT auth.uid();
CREATE POLICY "own_data" ON customers
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### 6.2: `get_profit_loss()` Has Redundant Subqueries

The function runs **the same subquery 3 times** for revenue and **3 times** for COGS:

```sql
-- Lines 98, 106, 116: same SUM(grand_total) query
COALESCE((SELECT SUM(grand_total) FROM invoices WHERE invoice_date BETWEEN p_start AND p_end), 0)
```

**Fix**: Use CTEs or local variables:

```sql
CREATE OR REPLACE FUNCTION get_profit_loss(p_start DATE, p_end DATE)
RETURNS TABLE (...) AS $$
DECLARE
  v_revenue NUMERIC;
  v_cogs NUMERIC;
  v_expenses NUMERIC;
BEGIN
  SELECT COALESCE(SUM(grand_total), 0) INTO v_revenue
  FROM invoices WHERE invoice_date BETWEEN p_start AND p_end;

  SELECT COALESCE(SUM(ili.quantity * ii.cost_price), 0) INTO v_cogs
  FROM invoice_line_items ili
  JOIN invoices inv ON inv.id = ili.invoice_id
  JOIN inventory_items ii ON ii.id = ili.item_id
  WHERE inv.invoice_date BETWEEN p_start AND p_end;

  SELECT COALESCE(SUM(amount), 0) INTO v_expenses
  FROM expenses WHERE expense_date BETWEEN p_start AND p_end;

  RETURN QUERY SELECT v_revenue, v_cogs, v_revenue - v_cogs, v_expenses, v_revenue - v_cogs - v_expenses;
END;
```

### 6.3: Missing Indexes

```sql
-- payments table: frequently queried by customer_id, direction, and date
CREATE INDEX idx_payments_customer ON payments (customer_id, direction);
CREATE INDEX idx_payments_date ON payments (payment_date DESC);

-- expenses table: frequently queried by date range
CREATE INDEX idx_expenses_date ON expenses (expense_date DESC);

-- invoice_line_items: frequently JOINed for P&L (cost_price lookup)
CREATE INDEX idx_invoice_line_items_item ON invoice_line_items (item_id);
```

### 6.4: `invoice_line_items.quantity` is `INTEGER`

But tiles can be sold in fractional box quantities (e.g., 2.5 boxes). This should be `NUMERIC`.

### 6.5: No `updated_at` Trigger on Some Tables

`invoice_line_items`, `stock_operations`, `expenses`, `payments` lack `moddatetime` triggers. Apply consistently.

### 6.6: `purchases` Table Referenced But Migration Missing

`financeService.ts` queries a `purchases` table and `007_views_functions_rls.sql` references it (line 180), but `006_finance.sql` likely defines it. The `supplier_ledger_summary` view references `pu.grand_total` and `pu.amount_paid`, but the `Purchase` TypeScript type also has these fields. Verify the migration includes all columns referenced in code.

---

## 7. Testing: TDD Infrastructure

### 7.1: Current Tests Are Structural, Not Behavioral

```typescript
// financeService.test.ts — this test verifies:
it('calls supabase with correct filters', async () => {
  await financeService.fetchExpenses(filters);
  expect(supabase.from).toHaveBeenCalledWith('expenses');
  expect(mockQuery.ilike).toHaveBeenCalledWith('category', '%Office%');
});
```

This tests **implementation details** ("did you call `.ilike()`?"), not behavior ("given expenses in the DB matching 'Office', does the service return them?").

If you refactor the query (e.g., switch to `or()` for multi-field search), the test breaks — even though behavior is unchanged. **These tests have negative ROI.**

### 7.2: Recommended Testing Strategy

```
┌──────────────────────────────────────────────────────────────┐
│ Layer              │ What to Test           │ How             │
├──────────────────────────────────────────────────────────────┤
│ Utils/Calculators  │ Pure logic             │ Unit tests      │
│ (gstCalculator,    │ Input → Output         │ No mocks needed │
│  currency, date)   │ Edge cases             │ Fast, reliable  │
├──────────────────────────────────────────────────────────────┤
│ Services           │ Business rules         │ Inject mock     │
│ (validation,       │ Orchestration logic    │ repository      │
│  calculation,      │ Error handling         │ (not supabase)  │
│  transformation)   │                        │                 │
├──────────────────────────────────────────────────────────────┤
│ Stores             │ State transitions      │ Real store,     │
│                    │ Filter→fetch→update    │ mock service    │
│                    │ Event emissions        │                 │
├──────────────────────────────────────────────────────────────┤
│ Repositories       │ Query correctness      │ Integration     │
│                    │ Data mapping           │ tests w/ test   │
│                    │                        │ Supabase or     │
│                    │                        │ local Postgres  │
├──────────────────────────────────────────────────────────────┤
│ Screens            │ User flows             │ Testing Library │
│                    │ Form validation        │ Mock stores     │
│                    │ Navigation triggers    │                 │
├──────────────────────────────────────────────────────────────┤
│ DB Functions       │ Transactions, RLS      │ pgTAP or raw    │
│ (RPC, triggers)    │ Edge cases             │ SQL tests       │
└──────────────────────────────────────────────────────────────┘
```

### 7.3: Example — TDD for Invoice Creation

```typescript
// invoiceService.test.ts — testing BEHAVIOR, not implementation
describe('InvoiceService.create', () => {
  const mockRepo = {
    createAtomic: jest.fn().mockResolvedValue({ id: '123', invoice_number: 'TM/2026-27/0001' }),
  };
  const service = createInvoiceService(mockRepo);

  it('calculates correct GST totals for intra-state invoice', async () => {
    const input = {
      customer_name: 'Test',
      is_inter_state: false,
      line_items: [{ gst_rate: 18, quantity: 10, rate_per_unit: 100, discount: 0, design_name: 'TEST-001' }],
      // ...
    };
    await service.create(input);
    expect(mockRepo.createAtomic).toHaveBeenCalledWith(
      expect.objectContaining({
        subtotal: 1000,
        cgst_total: 90,
        sgst_total: 90,
        igst_total: 0,
        grand_total: 1180,
      })
    );
  });

  it('rejects invoice with no line items', async () => {
    await expect(service.create({ ...validInput, line_items: [] }))
      .rejects.toThrow('Invoice must have at least one line item');
  });

  it('rejects negative quantities', async () => {
    await expect(service.create({
      ...validInput,
      line_items: [{ ...validItem, quantity: -5 }]
    })).rejects.toThrow();
  });
});
```

### 7.4: Missing Test Coverage

| Area | Current | Target |
|------|---------|--------|
| `gstCalculator` | Has tests | Expand edge cases (0% rate, 100% discount, floating point) |
| `currency.ts` | No tests | Needs tests (negative amounts, lakhs/crores, zero) |
| `dateUtils.ts` | No tests | Needs tests (FY boundary, leap year, timezone) |
| `itemNameParser.ts` | No tests | Needs tests (various suffix patterns) |
| Services (business logic) | Mock-the-world tests | Rewrite with injected repos |
| Stores | Mock-the-world tests | Rewrite with injected services |
| Screens | `__tests__/ui/` exists | Verify coverage of happy + error paths |
| DB functions | Zero | Add pgTAP tests for RPC functions |

---

## 8. Frontend: Component & Screen Patterns

### 8.1: Screens Mix Concerns

`expenses.tsx` (165 lines) contains:
- Data fetching (`useEffect → fetchExpenses`)
- Form state management (4 `useState` calls)
- Business logic (`parseFloat(amount)`, date formatting)
- Modal open/close state
- UI rendering
- Inline styles mixed with StyleSheet

Every new screen rewrites all of this. This makes screens **hard to add** and **hard to fix**.

**Fix**: Establish a screen pattern

```
src/
  features/
    expenses/
      useExpenseForm.ts       ← form logic hook (react-hook-form + zod)
      useExpenseList.ts       ← data fetching hook (wraps store)
      ExpenseListScreen.tsx   ← pure UI, receives data via hooks
      ExpenseFormModal.tsx    ← pure UI, receives form via hook
      __tests__/
        useExpenseForm.test.ts
        ExpenseListScreen.test.ts
```

### 8.2: No Form Validation

`react-hook-form` and `zod` are installed dependencies but **never imported in any screen**. All forms use raw `useState`:

```typescript
// Current (expenses.tsx:37-39)
const handleSave = async () => {
  if (!amount || !category) return;  // That's the entire validation
  await addExpense({ amount: parseFloat(amount), ... });
};
```

What's missing:
- Amount must be > 0
- Category must be from the predefined list (EXPENSE_CATEGORIES constant exists but isn't used here)
- `parseFloat("12.34.56")` returns `12.34` — no error shown to user
- No GSTIN format validation on customer forms
- No phone number format validation

**Fix**: Create Zod schemas for every form

```typescript
// src/schemas/expense.ts
import { z } from 'zod';
import { EXPENSE_CATEGORIES } from '../constants/paymentModes';

export const ExpenseSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.enum(EXPENSE_CATEGORIES.map(c => c.value) as [string, ...string[]]),
  notes: z.string().max(500).optional(),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
```

### 8.3: No Loading/Error Boundary Pattern

Every screen handles loading/error independently:

```typescript
// Pattern repeated in every screen
if (loading) return <ActivityIndicator />;
if (error) return <Text>{error}</Text>;
```

**Fix**: Create a `<QueryBoundary>` component

```typescript
// src/components/atoms/QueryBoundary.tsx
function QueryBoundary({ loading, error, empty, children, onRetry, emptyState }) {
  if (loading && !children) return <LoadingSpinner />;
  if (error) return <ErrorCard message={error} onRetry={onRetry} />;
  if (empty) return emptyState || <EmptyState />;
  return children;
}
```

### 8.4: Inconsistent Navigation Patterns

Some screens use `router.push()`, others use `router.replace()`. Some pass params via URL, others via store state. Standardize:

- **List → Detail**: `router.push('/invoices/[id]')` with ID in URL
- **Create flows**: `router.push('/invoices/create')` with form state in store or params
- **Back from create**: `router.back()` after success, not `router.replace()`

### 8.5: `theme.layout.rowBetween` Used as Inline Style

```typescript
<View style={theme.layout.rowBetween}>
```

This accesses theme at render time for static layout. If the theme object changes identity on re-render (it does — it's recreated), this causes unnecessary re-renders of every child.

**Fix**: Use `useMemo` in ThemeProvider for the theme object, or use StyleSheet.create for layout utilities.

---

## 9. Validation: Zod Integration (Currently Unused)

`zod ^4.3.6` is in `package.json` but **imported nowhere in the codebase**. This is the single highest-leverage improvement for preventing bugs.

### Implementation Plan

```typescript
// src/schemas/index.ts — central schema registry
export { InvoiceInputSchema, InvoiceLineItemSchema } from './invoice';
export { CustomerInsertSchema } from './customer';
export { ExpenseSchema } from './expense';
export { PaymentInputSchema } from './payment';
export { InventoryItemInsertSchema } from './inventory';
```

```typescript
// src/schemas/invoice.ts
import { z } from 'zod';

export const InvoiceLineItemSchema = z.object({
  item_id: z.string().uuid().optional(),
  design_name: z.string().min(1, 'Design name is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  rate_per_unit: z.number().positive('Rate must be positive'),
  discount: z.number().min(0).default(0),
  gst_rate: z.number().refine(r => [0, 5, 12, 18, 28].includes(r), 'Invalid GST rate'),
});

export const InvoiceInputSchema = z.object({
  invoice_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  customer_name: z.string().min(1),
  customer_gstin: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/).optional().or(z.literal('')),
  is_inter_state: z.boolean(),
  line_items: z.array(InvoiceLineItemSchema).min(1, 'At least one line item required'),
  payment_status: z.enum(['paid', 'partial', 'unpaid']),
  amount_paid: z.number().min(0).default(0),
});
```

**Where to validate:**
1. **Service layer** (primary): `InvoiceInputSchema.parse(input)` before any DB call
2. **Form layer** (secondary): `zodResolver(InvoiceInputSchema)` with react-hook-form for instant UI feedback
3. **DB layer** (tertiary): CHECK constraints already exist for some fields — keep as safety net

---

## 10. Security & RLS

### 10.1: SQL Injection via `.ilike()` / `.or()`

```typescript
// invoiceService.ts:12
query = query.or(`invoice_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`);
```

If `filters.search` contains `,` or `.`, this can break the query syntax or produce unexpected results. Supabase's PostgREST generally sanitizes, but **constructing filter strings via interpolation is an anti-pattern**.

**Fix**: Use parameterized filter builders

```typescript
// Safer approach
if (filters.search) {
  query = query.or(
    `invoice_number.ilike.%${filters.search.replace(/[%_]/g, '\\$&')}%,` +
    `customer_name.ilike.%${filters.search.replace(/[%_]/g, '\\$&')}%`
  );
}
```

Or better, use `textSearch` with `pg_trgm` index (already enabled):
```typescript
query = query.textSearch('design_name', filters.search, { type: 'websearch' });
```

### 10.2: `.env` in Git

`.env` is present in the repo with Supabase credentials. Even though they're `EXPO_PUBLIC_` (publishable), this sets a bad precedent. The `.gitignore` only ignores `.env*.local`.

**Fix**: Add `.env` to `.gitignore`, provide `.env.example` instead.

### 10.3: No Rate Limiting or Abuse Protection

The app calls Supabase directly. A malicious client could:
- Generate thousands of invoice numbers (exhausting the sequence)
- Create millions of stock operations
- Enumerate all customers

**Fix (when needed)**: Add Supabase Edge Function middleware or use pgbouncer connection limits.

---

## 11. DevOps & DX

### 11.1: Missing Entirely

| Tool | Status | Impact |
|------|--------|--------|
| ESLint | Not configured | Inconsistent code style, no unused import detection |
| Prettier | Not configured | Formatting inconsistencies |
| Husky + lint-staged | Not configured | Bad code merges to main |
| CI/CD (GitHub Actions) | Not configured | No automated testing |
| TypeScript strict checks | `strict: true` | Good — keep this |

### 11.2: Recommended `package.json` Additions

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "validate": "npm run typecheck && npm run lint && npm run test"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### 11.3: Recommended GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v4
```

---

## 12. Error Handling Strategy

### Current: Inconsistent

| Layer | Pattern | Problem |
|-------|---------|---------|
| Services | `throw error` (raw Supabase error) | Leaks DB details to UI |
| Stores | `catch (err: any) { set({ error: err.message }) }` | Loses error context, type unsafe |
| Screens | `Alert.alert('Error', e.message)` | Not all screens do this; some silently fail |

### Proposed: Typed Error Hierarchy

```typescript
// src/errors/AppError.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly userMessage: string, // Safe to show in UI
    public readonly cause?: unknown,
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(public readonly fieldErrors: Record<string, string[]>) {
    super('Validation failed', 'VALIDATION_ERROR', 'Please check your input');
  }
}

export class NetworkError extends AppError {
  constructor(cause: unknown) {
    super('Network request failed', 'NETWORK_ERROR', 'Please check your connection and try again', cause);
  }
}

export class InsufficientStockError extends AppError {
  constructor(itemName: string, available: number, requested: number) {
    super(
      `Insufficient stock for ${itemName}`,
      'INSUFFICIENT_STOCK',
      `Only ${available} boxes of ${itemName} available (requested ${requested})`,
    );
  }
}
```

**Repository layer** catches Supabase errors and wraps them:
```typescript
if (error) throw new AppError(error.message, error.code, 'Something went wrong. Please try again.', error);
```

**Store layer** preserves the typed error:
```typescript
catch (err) {
  const appError = err instanceof AppError ? err : new AppError('Unknown error', 'UNKNOWN', 'An unexpected error occurred', err);
  set({ status: 'error', error: appError });
}
```

**UI layer** shows `error.userMessage` (safe), logs `error.message` + `error.cause` (detailed).

---

## 13. i18n Gaps

### 13.1: Hardcoded Strings in Code

```typescript
// invoiceService.ts:130
p_reason: `Invoice #${invoice_number}`,

// orderService.ts:103
`Imported from Order ${orderId}`,

// paymentService.ts:40
let newStatus = 'partial';  // DB enum, fine — but UI displays raw value
```

Audit all user-facing strings and ensure they go through `t()`.

### 13.2: Expense Categories Are Hardcoded in `constants/paymentModes.ts`

```typescript
export const EXPENSE_CATEGORIES = [
  { value: 'Rent', label_en: 'Rent', label_hi: 'किराया' },
  // ...
];
```

But `expenses.tsx` uses a freeform text input for category. This means:
- Users can type anything → inconsistent data
- No i18n in the DB-stored category value
- Cannot aggregate by category reliably

**Fix**: Use the constant as a picker/dropdown, store the `value` key, display via i18n.

### 13.3: Currency Formatting Assumes INR

`useLocale.ts` hardcodes `₹` and Indian number formatting. If the app ever needs to support other currencies (export invoices in USD), the formatting layer needs abstraction.

---

## 14. Frontend: Component-Level Deep Dive

### 14.1: `TextInput` — Focus State is Dead Code

```typescript
// TextInput.tsx:30
const isFocused = false; // We can add onFocus/onBlur state if needed
const borderColor = error ? c.error : (isFocused ? c.primary : c.border);
```

The `isFocused` branch is **dead code** — the input border never turns primary-colored on focus. This is a UX regression: users get no visual feedback that a field is active.

**Fix**:
```typescript
const [isFocused, setIsFocused] = useState(false);
// ...
<RNTextInput
  ref={ref}
  onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
  onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
  // ...
/>
```

### 14.2: `Screen` Component — `as any` Type Escape

```typescript
// Screen.tsx:61
<Content {...(contentProps as any)}>
```

`Content` is conditionally `ScrollView` or `View`, and their prop types differ. The `as any` masks type mismatches. If you pass `refreshControl` to a non-scrollable `Screen`, it silently drops.

**Fix**: Split into two explicit branches:

```typescript
if (scrollable) {
  return (
    <KeyboardAvoidingView style={containerStyle} behavior={...}>
      <ScrollView {...scrollViewProps} contentContainerStyle={[styles.scrollContent, contentContainerStyle]}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
return (
  <KeyboardAvoidingView style={containerStyle} behavior={...}>
    <View style={[styles.flex, contentContainerStyle]}>{children}</View>
  </KeyboardAvoidingView>
);
```

### 14.3: `Button` — No `accessibilityRole` or `accessibilityLabel`

The `Button` component wraps `TouchableOpacity` but never sets `accessibilityRole="button"` or `accessibilityLabel`. Screen readers cannot announce it properly.

```typescript
// Button.tsx — missing:
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={title}
  accessibilityState={{ disabled: isDisabled, busy: loading }}
  // ...
>
```

Same issue exists in `Chip`, `ListItem`, and all `TouchableOpacity` usages in screens.

### 14.4: `Badge` — Color Construction via String Concatenation

```typescript
// Badge.tsx — pattern used for light backgrounds:
backgroundColor: c.primary + '20'   // Appends '20' hex opacity
```

This works for 6-char hex (`#C1440E20`) but **breaks for named colors**, `rgb()`, or `rgba()` values. If the theme ever uses non-hex colors, every Badge crashes.

**Fix**: Use a proper opacity utility:

```typescript
// src/utils/color.ts
export function withOpacity(color: string, opacity: number): string {
  // Parse hex, rgb, or named color → return rgba
}
```

This pattern appears in `QuickActionsGrid.tsx:49`, `DashboardHeader.tsx:41`, `invoices/create.tsx:136`, `invoices/create.tsx:182`, and `invoices/create.tsx:308` — at least 8 locations.

### 14.5: `PaymentModal` — Silent Error Swallowing

```typescript
// PaymentModal.tsx:57-58
} catch (e) {
  console.error(e);  // That's it. User sees nothing.
}
```

When a payment fails to record, the modal silently closes (or stays open with no feedback). The user believes the payment succeeded.

**Fix**: Show an Alert or inline error:
```typescript
} catch (e: unknown) {
  const message = e instanceof Error ? e.message : 'An unexpected error occurred';
  Alert.alert('Payment Failed', message);
}
```

### 14.6: `DashboardHeader` — Hardcoded Locale for Date

```typescript
// DashboardHeader.tsx:19
const today = new Date().toLocaleDateString('hi-IN', { ... });
```

The date is always formatted in Hindi (`hi-IN`) regardless of the user's language setting. When the app is in English mode, the dashboard header still shows Hindi date text.

**Fix**: Use the `currentLanguage` from `useLocale()`:
```typescript
const { currentLanguage } = useLocale();
const locale = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
const today = new Date().toLocaleDateString(locale, { ... });
```

### 14.7: Molecules & Organisms Have Zero Tests

| Component | Test File | Status |
|-----------|-----------|--------|
| `StatCard` | — | ❌ No tests |
| `SearchBar` | — | ❌ No tests |
| `FormField` | — | ❌ No tests |
| `ListItem` | — | ❌ No tests |
| `EmptyState` | — | ❌ No tests |
| `DashboardHeader` | — | ❌ No tests |
| `QuickActionsGrid` | — | ❌ No tests |
| `RecentInvoicesList` | — | ❌ No tests |
| `TileSetCard` | — | ❌ No tests |
| `PaymentModal` | — | ❌ No tests |

Only 4 atom tests exist (`Badge`, `Button`, `Card`, `TextInput`), and even those are smoke tests — they verify rendering, not behavior. The `Button.test.tsx` tests for `ActivityIndicator` by `testID` that the implementation doesn't set.

### 14.8: Unused StyleSheet Keys Across Components

Multiple `StyleSheet.create()` definitions contain keys never referenced:

```typescript
// QuickActionsGrid.tsx:63-69
const styles = StyleSheet.create({
  section: {},        // empty, unused
  sectionTitle: {},   // empty, unused
  actionBtn: {},      // empty, unused
  actionIcon: {},     // empty, unused
  actionLabel: {},    // empty, unused
});

// inventory.tsx:213
const styles = StyleSheet.create({
  header: {},         // empty, unused
});

// PaymentModal.tsx:155-170
title: { fontSize: 20 },      // never referenced
subtitle: { fontSize: 14 },   // never referenced
label: { ... },                // never referenced (uses ThemedText instead)
```

These are dead code. They add bundle weight and confuse future developers about which styles are active.

---

## 15. Screen-Level Anti-Patterns & Fixes

### 15.1: `create.tsx` — The 359-Line God Screen

`app/(app)/invoices/create.tsx` is the worst offender in the codebase. A single file contains:

- **11 `useState` hooks** (step, customer, lineItems, amountPaid, paymentMode, isAddingItem, searchQuery, selectedItem, inputQuantity, inputDiscount, isInterState, submitting)
- **Business logic**: GST calculation, payment status derivation, inventory search debouncing
- **3 complete screen UIs** jammed into conditional `{step === N && ...}` blocks
- **Direct store access**: `useInventoryStore.getState().fetchItems()` called imperatively in `useEffect`
- **Inline object styles**: `style={{ marginTop: s.lg, padding: s.md, backgroundColor: ... }}` on 20+ elements
- **`any` casts**: `setCustomer(prev => ({ ...prev, id: prev?.id, name: text } as any))` — lines 115, 123, 131
- **`paymentMode` typed as `any`** (line 39) despite `PaymentMode` type existing

This screen is the #1 barrier to adding features. Any change to the invoice flow (add a GST rate picker, add attachment support, add customer search-as-you-type) requires editing this monolith.

**Fix**: Decompose into a feature module:

```
src/features/invoice-create/
  ├── useInvoiceCreateFlow.ts     ← state machine (step, navigation, submission)
  ├── useCustomerStep.ts          ← customer form state (react-hook-form + zod)
  ├── useLineItemsStep.ts         ← line items CRUD, inventory search
  ├── usePaymentStep.ts           ← payment state, total calculation
  ├── CustomerStep.tsx            ← pure UI
  ├── LineItemsStep.tsx           ← pure UI
  ├── PaymentStep.tsx             ← pure UI
  ├── InvoiceCreateScreen.tsx     ← thin orchestrator
  ├── schemas.ts                  ← Zod schemas for all steps
  └── __tests__/
      ├── useInvoiceCreateFlow.test.ts
      ├── useLineItemsStep.test.ts
      └── InvoiceCreateScreen.test.tsx
```

Each step becomes independently testable, the flow logic is unit-testable without rendering, and adding a new step (e.g., "4. Attachments") is a surgical addition.

### 15.2: `inventory.tsx` — Mixed Tab-Level and Feature-Level Indentation

The inventory tab uses 4-space indentation while most other files use 2-space. More importantly, it has mixed coding conventions:

```typescript
// Line 31 — direct store access in useEffect (fine)
if (items.length === 0 && !loading && page === 1) {
    fetchItems(true).catch(...)
}

// Line 91 — hardcoded English fallback despite i18n
'Try adjusting your search or filters.'
```

### 15.3: Dashboard — Client-Side Aggregation of Server Data

```typescript
// app/(app)/(tabs)/index.tsx:42-58
const todaySales = useMemo(() => {
  return invoices
    .filter(inv => inv.invoice_date === today)
    .reduce((sum, inv) => sum + inv.grand_total, 0);
}, [invoices, today]);

const outstandingCredit = useMemo(() => {
  return invoices.reduce((sum, inv) => sum + (inv.grand_total - (inv.amount_paid || 0)), 0);
}, [invoices]);
```

**Problem**: These calculations are performed on **only the first page of invoices** (page 1, 20 items). If a business has 200 invoices, the dashboard shows wildly incorrect totals. The `outstandingCredit` is off by the sum of all invoices not on page 1.

A Postgres RPC `get_dashboard_stats()` **already exists** (migration 007, lines 129-167) that correctly aggregates across the full dataset.

**Fix**: Use the existing RPC:

```typescript
// dashboardService.ts
export async function fetchDashboardStats() {
  const { data, error } = await supabase.rpc('get_dashboard_stats');
  if (error) throw error;
  return data as DashboardStats;
}
```

### 15.4: `more.tsx` — Hardcoded "More" Tab Title

```typescript
// (tabs)/_layout.tsx:75
title: 'More',  // not using t('...')
```

Every other tab title uses i18n. This one doesn't.

### 15.5: Operator Precedence Bug in Step Navigation

```typescript
// invoices/create.tsx:329
disabled={step === 1 && !customer || step === 2 && lineItems.length === 0}
```

Due to JavaScript operator precedence (`&&` binds tighter than `||`), this evaluates as:
```
(step === 1 && !customer) || (step === 2 && lineItems.length === 0)
```

This means the "Next" button is **enabled** at step 3 (where it should be hidden, though it is — via the `step < 3` ternary above). But if someone were to add a step 4, this logic would silently break.

**Fix**: Always use explicit parentheses:
```typescript
disabled={(step === 1 && !customer) || (step === 2 && lineItems.length === 0)}
```

### 15.6: Every Screen Re-Derives Theme Tokens

```typescript
// This exact pattern appears in EVERY screen:
const { theme } = useTheme();
const c = theme.colors;
const s = theme.spacing;
const r = theme.borderRadius;
```

4 lines of boilerplate × 20+ screens = 80+ lines of meaningless repetition.

**Fix**: Create a `useThemeTokens()` hook:
```typescript
export function useThemeTokens() {
  const { theme } = useTheme();
  return { theme, c: theme.colors, s: theme.spacing, r: theme.borderRadius, typo: theme.typography };
}
```

---

## 16. Theme System: Performance & Structural Issues

### 16.1: Theme Object Recreated on Every Render

```typescript
// ThemeProvider.tsx:55
const theme = buildTheme(isDark);
```

`buildTheme()` is called **on every render** of `ThemeProvider`. Since `ThemeProvider` wraps the entire app, any state change anywhere causes a new `theme` object to be created. This means every `useTheme()` consumer re-renders, because the context value has a new object reference.

**Fix**: Memoize the theme:
```typescript
const theme = useMemo(() => buildTheme(isDark), [isDark]);
```

This is a single-line fix with cascading performance improvement across the entire app.

### 16.2: `shadows` Typed as `object` — Loses All Type Safety

```typescript
// theme/index.ts:104-108
shadows: {
  sm: object;
  md: object;
  lg: object;
};
```

Consumers must cast: `...(theme.shadows.md as object)` — which appears in `QuickActionsGrid.tsx:44`, `TileSetCard.tsx`, `inventory.tsx:196`, and others.

**Fix**: Type the shadow properly:
```typescript
import type { ViewStyle } from 'react-native';

shadows: {
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
};
```

### 16.3: `layout` Utilities Are Static — Shouldn't Be in Theme Context

```typescript
// colors.ts:135-141
const LAYOUT: Theme['layout'] = {
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // ...
};
```

These never change between light/dark mode. They are **static layout constants** sitting inside a dynamic theme context. Every time `isDark` changes, these identical objects are recreated.

**Fix**: Extract to a separate `StyleSheet.create()`:
```typescript
// src/theme/layout.ts
export const layout = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  center: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
```

Import directly instead of pulling from context. Saves re-render overhead and is semantically correct.

### 16.4: `touchTarget: 48` Is Defined but Never Enforced

```typescript
// theme/colors.ts:187
touchTarget: 48,
```

No component reads `theme.touchTarget` to enforce minimum hit area. Some interactive elements are smaller:

```typescript
// PaymentModal.tsx:177-179
modeButton: { flex: 1, minWidth: '45%' }  // height defaults to Button 'sm' = 36px < 48px

// inventory.tsx:215
filterBtn: { width: 44, height: 44 }  // 44 < 48
```

**Fix**: Either enforce `minHeight: theme.touchTarget` in all interactive atoms, or update the token to match actual usage. Apple HIG recommends 44pt; Material Design recommends 48dp. Pick one and enforce it.

---

## 17. Utility Functions: Bugs, Edge Cases & Missing Coverage

### 17.1: `formatINR` — Negative Number Bug

```typescript
// currency.ts:12-13
const lastThree = String(Math.abs(num)).slice(-3);
const rest = String(Math.abs(num)).slice(0, -3);
```

Line 18: `const sign = num < 0 ? '-' : '';`

But line 7: `const fixed = amount.toFixed(decimals);` — then `parseInt(intPart, 10)` — this loses the sign for `-0.50`:
- `(-0.50).toFixed(2)` = `"-0.50"`
- `parseInt("-0", 10)` = `-0` (negative zero)
- `num < 0` is `false` for `-0` in JavaScript
- **Result**: `-₹0.50` is displayed as `₹0.50`

**Fix**: Check `amount < 0` instead of `num < 0`:
```typescript
const sign = amount < 0 ? '-' : '';
```

### 17.2: `numberToIndianWords` — Missing Space Before "Thousand"

```typescript
// currency.ts:60
if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + convert(n % 1000);
```

`convert(2)` returns `"Two "`, so `2000` becomes `"Two Thousand "` — correct. But `12000` returns `"Twelve Thousand "` (correct) while `112000` returns `"One Hundred Twelve Thousand "` which is correct. However, `1000` returns `"One Thousand "` but the PDF invoice uses a **different** function:

```typescript
// pdfService.ts:289-291
function convertNumberToWords(amount: number): string {
  return Math.floor(amount).toString();  // Returns "1000" not "One Thousand"
}
```

`pdfService.ts` has its own **non-functional stub** while `currency.ts` has the real implementation. The PDF invoice shows `"Amount in words: Rupees 154000 Only"` instead of `"Rupees One Lakh Fifty Four Thousand Only"`.

**Fix**: Import `numberToIndianWords` from `currency.ts` in `pdfService.ts`:
```typescript
import { numberToIndianWords } from '../utils/currency';
// In generateInvoiceHTML:
Amount in words: ${numberToIndianWords(invoice.grand_total)}
```

### 17.3: `extractBaseItemNumber` — Regex Doesn't Handle Lowercase

```typescript
// itemNameParser.ts:17
const suffixPattern = /(-(?:HL(?:-\d+(?:-[A-Z])?)?|ELE(?:VATION)?|[DLFABCM]\d*)).*$/i;
```

The `i` flag makes the regex case-insensitive, but the character class `[DLFABCM]` only lists uppercase. Since `i` flag is on, this correctly matches lowercase — fine.

But the **PostgreSQL function** (migration 003) has a different regex:
```sql
regexp_replace(design_name, '-(?:HL(?:-\d+(?:-[A-Z])?)?|ELEVATION|ELE|[DLFABCM]\d*).*$', '', 'i')
```

The PostgreSQL regex uses `ELEVATION|ELE` (two alternations) while the TypeScript uses `ELE(?:VATION)?` (one with optional group). These are functionally equivalent, but **maintaining two implementations of the same business logic** in two languages is a drift risk.

**Fix**: Move all name parsing to the DB trigger (already exists), and the frontend should read `base_item_number` from the response rather than re-parsing. The client-side `extractBaseItemNumber` should only be used for offline/preview scenarios, with a comment marking it as a mirror of the DB function.

### 17.4: `formatRelativeDate` — "Today" and "Yesterday" Are English-Only

```typescript
// dateUtils.ts:18-19
if (isToday(date)) return 'Today';
if (isYesterday(date)) return 'Yesterday';
```

When the app is in Hindi mode, the dashboard still shows "Today" and "Yesterday" in English.

**Fix**: Use i18n keys:
```typescript
if (isToday(date)) return i18n.t('common.today');
if (isYesterday(date)) return i18n.t('common.yesterday');
```

### 17.5: `lowStockOnly` Filter Is Broken

```typescript
// inventoryService.ts:24
query = query.lte('box_count', 'low_stock_threshold');
```

Supabase's `.lte()` compares a column to a **literal value**, not another column. This passes the string `"low_stock_threshold"` as the comparison value, not the column reference. The query effectively becomes `WHERE box_count <= 'low_stock_threshold'`, which Postgres will try to cast as an integer and fail.

**Fix**: Use a raw filter or a database view:

```typescript
// Option 1: Raw PostgREST filter
query = query.or('box_count.lte.low_stock_threshold');
// This still won't work — PostgREST doesn't support cross-column comparison

// Option 2 (correct): Use the existing `low_stock_items` VIEW (migration 007)
if (filters.lowStockOnly) {
  query = supabase.from('low_stock_items').select('*', { count: 'exact' });
  // Apply remaining filters to the view
}

// Option 3: Add an RPC
// CREATE FUNCTION fetch_low_stock_items() RETURNS SETOF inventory_items ...
```

This is a **data correctness bug** — the low stock filter on the inventory screen likely returns zero results or errors.

---

## 18. PDF Generation: Fragility & XSS

### 18.1: HTML Template Injection (XSS in Generated PDFs)

```typescript
// pdfService.ts:136
<p><strong>${invoice.customer_name}</strong></p>
${invoice.customer_address ? `<p>${invoice.customer_address}</p>` : ''}
```

If `customer_name` contains `<script>alert('xss')</script>` or `<img src=x onerror=...>`, the generated HTML will execute it in the print WebView context. While the risk is lower than browser XSS (the PDF is generated locally), it can:
- Break the PDF layout with injected HTML tags
- Potentially access the WebView context on Android

**Fix**: Escape all interpolated values:
```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Usage:
`<p><strong>${escapeHtml(invoice.customer_name)}</strong></p>`
```

### 18.2: `pdfService.ts` Has a Dead `useLocale` Import

```typescript
// pdfService.ts:7
import { useLocale } from '../hooks/useLocale';
```

`useLocale` is a React hook. `pdfService.ts` is a plain service object — **not a React component**. This import never causes a crash because it's never called, but it signals confusion about the module's nature and will trigger an ESLint rule once configured.

### 18.3: `generateInvoiceHTML` Receives `businessProfile: any`

```typescript
// pdfService.ts:29
generateInvoiceHTML(invoice: Invoice, businessProfile: any) {
```

The `any` type means typos in property access (`bp.phone_number` vs `bp.phone`) silently produce `undefined` in the PDF. Define the `BusinessProfile` type in `src/types/`.

### 18.4: `convertNumberToWords` Stub — Invoice Compliance Risk

As noted in 17.2, the PDF invoice renders:
```
Amount in words: Rupees 154000 Only.
```

Under GST rules, Indian tax invoices **must** display the amount in words. Showing digits defeats the purpose and may be flagged during audit.

---

## 19. Data Loading: Waterfall & Stale State

### 19.1: Prefetch Waterfall in App Layout

```typescript
// app/(app)/_layout.tsx:14-31
React.useEffect(() => {
  const prefetchData = async () => {
    await Promise.all([
      useInventoryStore.getState().fetchItems(true),
      useInvoiceStore.getState().fetchInvoices(1),
      useCustomerStore.getState().fetchCustomers(true),
      useFinanceStore.getState().fetchExpenses(),
      useFinanceStore.getState().fetchPurchases(),
      useFinanceStore.getState().fetchSummary(),
      useOrderStore.getState().fetchOrders(),
    ]);
  };
  prefetchData();
}, []);
```

**Issues**:
1. **7 parallel API calls on app launch** — on slow 3G, this saturates the connection and delays first meaningful paint by seconds
2. **No error handling per-call** — if customers fail, the entire `Promise.all` rejects, and `catch` logs one generic error. The user sees stale data with no indication
3. **No staleness management** — if the user backgrounds the app for 2 hours and returns, all data is from the initial load. No refresh-on-foreground logic exists
4. **Finance fetches 3 separate calls** (`fetchExpenses`, `fetchPurchases`, `fetchSummary`) — these should be batched into a single store action

**Fix**:
```typescript
// 1. Use Promise.allSettled for independent error handling
const results = await Promise.allSettled([...]);
results.forEach((r, i) => {
  if (r.status === 'rejected') console.warn(`Prefetch ${i} failed:`, r.reason);
});

// 2. Prioritize: fetch dashboard data first, defer deep data
// Critical path: invoices (for dashboard stats) + inventory (for low stock)
// Deferred: finance, orders (only needed when user navigates to those tabs)

// 3. Add AppState listener for refresh-on-foreground
import { AppState } from 'react-native';
AppState.addEventListener('change', (state) => {
  if (state === 'active') refreshStaleData();
});
```

### 19.2: Individual Screens Re-Fetch Data Already in Store

```typescript
// inventory.tsx:29-35
useEffect(() => {
  if (items.length === 0 && !loading && page === 1) {
    fetchItems(true).catch(...)
  }
}, []);
```

The `_layout.tsx` already fetched inventory. This `useEffect` checks `items.length === 0` but it may fire before the layout's `Promise.all` resolves. This causes a **duplicate fetch** on first mount.

**Fix**: Track "has initial fetch completed" in the store:
```typescript
interface InventoryState {
  initialized: boolean;
  // ...
}
```

### 19.3: No Optimistic Updates

When creating an invoice, stock operation, or payment, the user must wait for the full round-trip before seeing the result. For operations that rarely fail (stock adjustments), optimistic updates would make the app feel instant:

```typescript
// Optimistic pattern:
createItem: async (itemPayload) => {
  const tempId = `temp-${Date.now()}`;
  const optimistic = { ...itemPayload, id: tempId };
  set((s) => { s.items.unshift(optimistic); }); // Show immediately
  try {
    const real = await inventoryService.createItem(itemPayload);
    set((s) => { s.items = s.items.map(i => i.id === tempId ? real : i); }); // Replace with real
  } catch (err) {
    set((s) => { s.items = s.items.filter(i => i.id !== tempId); }); // Rollback
    throw err;
  }
};
```

---

## 20. Accessibility & UX Gaps

### 20.1: No `accessibilityRole` Anywhere

Zero components in the codebase set `accessibilityRole`. This means screen readers treat everything as generic "element":

| Component | Should Have |
|-----------|-------------|
| `Button` | `accessibilityRole="button"` |
| `TextInput` | `accessibilityRole="none"` (RN auto-handles) |
| `Chip` | `accessibilityRole="togglebutton"` + `accessibilityState={{ selected }}` |
| `ListItem` | `accessibilityRole="button"` |
| `Badge` | `accessibilityRole="text"` |
| `StatCard` | `accessibilityRole="summary"` |
| Tab icons | Already handled by Expo Router |

### 20.2: No Haptic Feedback on Critical Actions

Successful invoice creation, payment recording, and stock operations have zero haptic feedback. On iOS, adding `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` significantly improves UX for financial confirmations.

### 20.3: No Skeleton Loaders

All loading states show either `ActivityIndicator` or nothing. Skeleton screens (shimmer placeholders matching the content shape) prevent layout shift and feel more polished.

### 20.4: No Pull-to-Refresh on Customer/Finance/Order Screens

Dashboard and inventory have `RefreshControl`. Customer list, finance screens, and order list do not — the user has no way to refresh stale data without navigating away and back.

### 20.5: Keyboard Not Dismissed on Scroll

In `invoices/create.tsx`, scrolling the line items list or review step doesn't dismiss the keyboard. The `ScrollView` lacks `keyboardDismissMode="on-drag"`.

---

## 21. Constants & Enums: Source-of-Truth Drift

### 21.1: Three Definitions of Tile Categories

| Location | Definition |
|----------|------------|
| `001_extensions_enums.sql` | `CREATE TYPE tile_category AS ENUM ('GLOSSY', 'FLOOR', 'MATT', 'SATIN', 'WOODEN', 'ELEVATION', 'OTHER')` |
| `src/types/inventory.ts` | `type TileCategory = 'GLOSSY' \| 'FLOOR' \| 'MATT' \| 'SATIN' \| 'WOODEN' \| 'ELEVATION' \| 'OTHER'` |
| `src/constants/categories.ts` | `TILE_CATEGORIES` array with `value`, `labelEn`, `labelHi`, `icon` |
| `inventory.tsx:15` | `const CATEGORIES = ['ALL', 'GLOSSY', 'MATT', 'ELEVATION', 'FLOOR', 'WOODEN', 'OTHER']` — **missing 'SATIN'** |

The inventory screen's `CATEGORIES` constant is **missing 'SATIN'**. Any items categorized as SATIN are unfilterable in the UI.

**Fix**: Derive all frontend category lists from the single `constants/categories.ts` source:
```typescript
import { TILE_CATEGORIES } from '@/src/constants/categories';
const CATEGORIES = ['ALL', ...TILE_CATEGORIES.map(c => c.value)];
```

### 21.2: Three Definitions of Payment Modes

| Location | Values |
|----------|--------|
| `001_extensions_enums.sql` | `'cash', 'upi', 'bank_transfer', 'credit', 'cheque'` |
| `src/types/invoice.ts` | `PaymentMode = 'cash' \| 'upi' \| 'bank_transfer' \| 'credit' \| 'cheque'` |
| `PaymentModal.tsx:64` | `['cash', 'upi', 'bank_transfer', 'cheque']` — **missing 'credit'** |
| `invoices/create.tsx:295` | `['cash', 'upi', 'bank_transfer', 'cheque']` — **missing 'credit'** |
| `constants/paymentModes.ts` | Full list with labels |

The `credit` payment mode is defined in the DB enum and TypeScript type but **excluded from both UIs** that render payment mode selectors. If a customer wants to pay on credit, there is no way to select it.

**Fix**: Derive from the constant:
```typescript
import { PAYMENT_MODES } from '@/src/constants/paymentModes';
const modes = PAYMENT_MODES.map(m => m.value);
```

### 21.3: GST Rate Hardcoded as `18` in Invoice Creation

```typescript
// invoices/create.tsx:244
gst_rate: 18, // Default
```

The app has a `GST_RATES` constant (`[5, 12, 18, 28]`) and `DEFAULT_GST_RATE = 18` in `constants/gst.ts`, but the invoice creation screen:
1. Hardcodes `18` instead of using the constant
2. Never lets the user pick a different GST rate per line item
3. Items in the database have their own `gst_rate` field, but it's ignored during invoice creation

This means invoices for 5% GST items (e.g., ceramic articles under HSN 6914) are always calculated at 18%.

**Fix**: Read `selectedItem.gst_rate` from inventory:
```typescript
gst_rate: selectedItem.gst_rate || DEFAULT_GST_RATE,
```

And provide a rate picker in the line item form for override.

---

## 22. Hooks Layer: Missing Abstractions

### 22.1: Only 1 Custom Hook Exists

The entire `src/hooks/` directory contains one file: `useLocale.ts`. The app needs at minimum:

| Hook | Purpose | Removes Duplication From |
|------|---------|--------------------------|
| `useThemeTokens()` | Destructure theme colors/spacing/radius | Every screen (20+ files) |
| `useDebounce(value, delay)` | Debounce search inputs | `inventory.tsx`, `create.tsx` (manual `setTimeout`) |
| `usePagination(fetchFn)` | Handle infinite scroll state | `inventory.tsx`, `invoices.tsx`, `customers/index.tsx` |
| `useForm(schema)` | Wrap `react-hook-form` + `zod` | Every form screen (8+ files) |
| `useRefreshOnFocus()` | Refresh stale data when screen focused | Every list screen |
| `useConfirmBack()` | Prevent accidental back during unsaved forms | `invoices/create.tsx`, `inventory/add.tsx` |

### 22.2: Search Debounce is Hand-Rolled Everywhere

```typescript
// invoices/create.tsx:52-58
React.useEffect(() => {
  if (!isAddingItem) return;
  const timer = setTimeout(() => {
    setFilters({ search: searchQuery });
  }, 400);
  return () => clearTimeout(timer);
}, [searchQuery, isAddingItem]);
```

This exact pattern with minor variations exists in inventory search and customer search. Extract a `useDebounce` hook:

```typescript
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Usage:
const debouncedSearch = useDebounce(searchQuery, 400);
useEffect(() => { setFilters({ search: debouncedSearch }); }, [debouncedSearch]);
```

---

## 23. Scalability

### 23.1 Data Growth — No Pagination Ceiling

Every list screen (invoices, inventory, customers, expenses) loads the first page and offers infinite scroll via `hasMore` flags. However, the implementation fetches with `.range(from, to)` on the Supabase REST API without server-side cursors:

```
// Typical pattern in all stores
const { data } = await supabase.from('invoices')
  .select('*')
  .order('invoice_date', { ascending: false })
  .range(from, to);
```

**Problem**: `OFFSET/LIMIT` pagination is O(n) in PostgreSQL — as `from` grows into the thousands, the database still scans all skipped rows. For a tile business generating ~20 invoices/day, this breaks down at ~10K rows (~18 months).

**Fix**: Switch to **keyset (cursor) pagination** on all paginated queries:

```typescript
// Keyset cursor — O(1) seek regardless of page depth
const { data } = await supabase.from('invoices')
  .select('*')
  .order('invoice_date', { ascending: false })
  .order('id', { ascending: false })
  .lt('invoice_date', cursor.lastDate)
  .limit(PAGE_SIZE);
```

### 23.2 Unbounded `SELECT *` in Views

The `customer_ledger_summary` and `supplier_ledger_summary` views (migration 007) aggregate across the *entire* invoice/purchase history with no date bounds:

```sql
-- Scans ALL invoices for ALL customers, every time
SELECT c.id, c.name,
  COALESCE(SUM(i.grand_total), 0) AS total_invoiced ...
FROM customers c LEFT JOIN invoices i ON ...
GROUP BY c.id, c.name;
```

At 50K invoices × 500 customers, this is a full table scan on every dashboard load. Options:
1. **Materialized view** refreshed on a schedule (`REFRESH MATERIALIZED VIEW CONCURRENTLY`).
2. **Denormalized balance column** on the `customers` table, updated atomically inside the invoice/payment transaction RPCs.
3. **Date-bounded variant** — only aggregate the current financial year, with carried-forward opening balances.

### 23.3 Image Storage & Bandwidth

`tile_image_url` in `inventory_items` points to Supabase Storage. The app loads full-resolution images in list views (`TileSetCard`, invoice line items). With 2000+ SKUs, list scrolling will stall.

**Fix**: Use Supabase Storage's image transformation API or a CDN resize proxy:
```
// Instead of full-res:
`${SUPABASE_URL}/storage/v1/object/public/tile-images/${path}`
// Use transform:
`${SUPABASE_URL}/storage/v1/render/image/public/tile-images/${path}?width=200&quality=75`
```

Pair with `expo-image` (already in the ecosystem) for disk caching and progressive loading.

### 23.4 Edge Function Cold Start & Payload Size

`parse-order-pdf` sends base64-encoded PDFs in the request body. A 5 MB PDF becomes ~6.7 MB base64. Supabase Edge Functions have a **2 MB request body limit** by default.

**Fix**: Upload the PDF to Supabase Storage first, pass the storage path to the Edge Function, and have the function fetch it server-side. This also avoids re-uploading on retry.

### 23.5 Store-Level Scaling

All stores are global singletons holding entire datasets in memory. As data grows:
- `inventoryStore` holds all 2000+ items in `items[]`.
- `invoiceStore` holds paginated but never evicts old pages.
- No LRU or windowed caching.

**Fix**: Introduce a `QueryCache` layer (or adopt `@tanstack/react-query`) that evicts stale entries, deduplicates in-flight requests, and provides window-based retention for list data.

---

## 24. Reliability & Resilience

### 24.1 No Retry Logic on Network Failures

Every service call is fire-and-forget with a single try/catch. On flaky mobile networks (common in Indian Tier 2/3 cities where tile businesses operate), a single dropped packet kills the operation:

```typescript
// Current: one shot, then error
try {
  await addExpense({ ... });
} catch (e) {
  Alert.alert('Error', e.message);
}
```

**Fix**: Add an exponential-backoff retry wrapper for idempotent reads, and a retry-with-confirmation for writes:

```typescript
// src/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxAttempts = 3, baseDelay = 1000 } = {}
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try { return await fn(); }
    catch (e) {
      if (attempt === maxAttempts) throw e;
      await new Promise(r => setTimeout(r, baseDelay * 2 ** (attempt - 1)));
    }
  }
  throw new Error('Unreachable');
}
```

### 24.2 No Offline Capability

The app has zero offline support. If the network drops mid-use:
- Unsaved form data is lost.
- List screens show stale data with no indicator.
- The `fetchExpenses` call in `useEffect` silently fails, leaving an empty screen.

**Fix (incremental)**:
1. **Optimistic local state** — write to the store first, sync to Supabase in background, reconcile on response.
2. **Network status hook** — show a banner when offline (using `@react-native-community/netinfo`).
3. **Pending operation queue** — persist failed writes to AsyncStorage, retry on reconnect.

### 24.3 `Promise.all` Launch Waterfall

`app/(app)/_layout.tsx` fires 7 API calls in `Promise.all`. If *any one* fails, the entire `catch` block triggers, but the error is only logged — the user sees a partially loaded app with no indication of what failed:

```typescript
await Promise.all([
  useInventoryStore.getState().fetchItems(true),
  useInvoiceStore.getState().fetchInvoices(1),
  // ... 5 more
]);
```

**Fix**: Use `Promise.allSettled` and surface per-domain failure states:

```typescript
const results = await Promise.allSettled([...]);
results.forEach((result, i) => {
  if (result.status === 'rejected') {
    console.error(`Prefetch ${domainNames[i]} failed:`, result.reason);
    // Set domain-specific error state for UI banners
  }
});
```

### 24.4 No Circuit Breaker for External APIs

The Gemini API call in `parse-order-pdf` has no timeout, no circuit breaker, and no fallback. If Gemini is down, the Edge Function hangs until the Deno runtime kills it.

**Fix**: Add `AbortController` with a timeout, and return a user-friendly error:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30_000);
const response = await fetch(apiEndpoint, { signal: controller.signal, ... });
clearTimeout(timeout);
```

### 24.5 Invoice Number Sequence Gap Risk

`generate_invoice_number()` increments `invoice_sequence` with `FOR UPDATE` lock but commits independently from invoice insertion. If the invoice insert fails *after* sequence increment, the sequence has a gap — which may violate GST audit trail requirements (see §28).

**Fix**: Move `generate_invoice_number()` inside the transactional invoice creation RPC so both increment and insert share the same transaction boundary.

---

## 25. Observability

### 25.1 Console-Only Logging

The entire codebase relies on `console.log`, `console.error`, and `console.warn`. In production RN builds, these are no-ops on iOS and limited on Android. There is no structured logging, no log levels, and no remote log aggregation.

**Fix**: Introduce a thin logging abstraction:

```typescript
// src/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => { /* ... */ },
  info:  (msg: string, meta?: Record<string, unknown>) => { /* ... */ },
  warn:  (msg: string, meta?: Record<string, unknown>) => { /* ... */ },
  error: (msg: string, error?: Error, meta?: Record<string, unknown>) => { /* ... */ },
};

export default logger;
```

Wire to Sentry, Datadog, or even a simple Supabase `app_logs` table for production visibility.

### 25.2 No Error Boundary

There is no `ErrorBoundary` component wrapping the app or individual screens. An uncaught JS error in any component crashes the entire app with a white screen.

**Fix**: Add a top-level `ErrorBoundary` in `app/_layout.tsx` and per-tab boundaries:

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function FallbackScreen({ error, resetErrorBoundary }) {
  return (
    <Screen>
      <ThemedText variant="h2">Something went wrong</ThemedText>
      <ThemedText>{error.message}</ThemedText>
      <Button title="Try Again" onPress={resetErrorBoundary} />
    </Screen>
  );
}
```

### 25.3 No Performance Monitoring

There are no performance traces, no screen render timing, and no API latency tracking. With Supabase as the sole backend, API latency from Indian mobile networks to a potentially US/Singapore Supabase region can be 200-500ms — and there's no visibility into it.

**Fix**: Instrument with `expo-updates` analytics or a lightweight custom solution:
```typescript
// Wrap all service calls
const start = performance.now();
const result = await supabase.from('invoices').select('*');
logger.info('api_call', { table: 'invoices', duration_ms: performance.now() - start });
```

### 25.4 Edge Function Logging

`parse-order-pdf` uses `console.error` for logging, which goes to Supabase Edge Function logs. However, there's no request ID, no structured metadata, and no way to correlate a user's failed parse with the server-side error.

**Fix**: Generate a request ID client-side, pass it as a header, and include it in all Edge Function log lines:

```typescript
// Client
const requestId = crypto.randomUUID();
const { data } = await supabase.functions.invoke('parse-order-pdf', {
  body: { base64Data, mimeType },
  headers: { 'x-request-id': requestId },
});
// Edge Function
const requestId = req.headers.get('x-request-id') ?? 'unknown';
console.error(`[${requestId}] Gemini Error:`, errText);
```

### 25.5 Database Query Visibility

No `pg_stat_statements` extension is enabled, and there are no slow query alerts. As data grows, queries like the unbounded `customer_ledger_summary` view will silently degrade.

**Fix**: Enable `pg_stat_statements` in Supabase dashboard, set up alerts for queries exceeding 500ms, and add `EXPLAIN ANALYZE` for all RPC functions during development.

---

## 26. Performance

### 26.1 List Rendering — No Virtualization

`expenses.tsx` (and other list screens) renders items inside a `ScrollView` with `.map()`:

```tsx
<ScrollView>
  {expenses.map((exp) => (
    <Card key={exp.id} ... />
  ))}
</ScrollView>
```

For 100+ items, this mounts all Card components at once — O(n) mount time, O(n) memory. React Native's `FlatList` or `FlashList` (from Shopify) virtualizes the list, rendering only visible items.

**Fix**: Replace `ScrollView` + `.map()` with `FlashList` across all list screens:

```tsx
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={expenses}
  renderItem={({ item }) => <ExpenseCard expense={item} />}
  estimatedItemSize={80}
  refreshControl={<RefreshControl ... />}
/>
```

### 26.2 Theme Rebuild on Every Render (Reinforcement)

Previously noted in §16 — `buildTheme(isDark)` runs every render. The fix (`useMemo`) is trivial but the impact is significant: every component that calls `useTheme()` receives a new object reference, defeating `React.memo` across the entire tree. This is the single highest-impact performance fix available.

### 26.3 Unnecessary Re-renders from Store Subscriptions

Zustand stores expose entire state objects. Components subscribing with `useFinanceStore()` re-render on *any* state change, even for unrelated fields:

```typescript
// This re-renders when expenses, purchases, summary, OR loading changes
const { expenses, loading } = useFinanceStore();
```

**Fix**: Use Zustand selectors to subscribe to minimal slices:

```typescript
const expenses = useFinanceStore(s => s.expenses);
const loading = useFinanceStore(s => s.loading);
```

For computed values, use `useShallow` from `zustand/shallow`:

```typescript
import { useShallow } from 'zustand/react/shallow';
const { expenses, loading } = useFinanceStore(useShallow(s => ({
  expenses: s.expenses,
  loading: s.loading,
})));
```

### 26.4 Bundle Size — Unused Dependencies

`zod` (~13KB minified) and `react-hook-form` (~25KB) are installed but effectively unused. `date-fns` tree-shakes well, but only if imported selectively (the codebase does `import { format } from 'date-fns'` — correct).

**Fix**: Either wire `zod` + `react-hook-form` (recommended — see §9) or remove them. Run `npx expo-doctor` and `npx react-native-bundle-visualizer` to identify other bloat.

### 26.5 PDF Generation Blocks the UI Thread

`pdfService.ts` builds a large HTML string and passes it to `expo-print`. For invoices with 20+ line items, the HTML string concatenation and `Print.printToFileAsync()` both run on the JS thread, blocking UI for 1-3 seconds.

**Fix**: Move HTML generation to a Web Worker (via `expo-modules` or `react-native-webview` bridge), or at minimum show a full-screen loading overlay during generation to prevent interaction jank.

### 26.6 Database: Missing Indexes on Hot Paths

Several frequently-queried columns lack indexes:

| Table | Column | Query Pattern | Impact |
|-------|--------|---------------|--------|
| `payments` | `direction` | `WHERE direction = 'received'` in ledger view | Full scan on payments |
| `expenses` | `category` | Group-by in finance reports | Full scan on expenses |
| `purchases` | `supplier_id` | Supplier ledger lookups | Full scan on purchases |
| `invoice_line_items` | `item_id` | Stock history/COGS calculation | Full scan on line items |

**Fix**: Add a new migration:

```sql
CREATE INDEX idx_payments_direction ON payments (direction);
CREATE INDEX idx_expenses_category ON expenses (category);
CREATE INDEX idx_purchases_supplier ON purchases (supplier_id);
CREATE INDEX idx_line_items_item ON invoice_line_items (item_id);
```

---

## 27. Security (Extended)

### 27.1 Client-Supplied API Key Injection

The `parse-order-pdf` Edge Function accepts a client-provided `aiKey` parameter:

```typescript
const geminiKey = aiKey || Deno.env.get('GEMINI_API_KEY');
```

This means *any* authenticated user can inject an arbitrary API key, which:
- Could be a stolen key used to launder API calls through the app's infrastructure.
- Bypasses server-side key rotation — if the server key is rotated, clients with hardcoded keys continue working.
- Leaks the key to the Edge Function's logs if error responses include the request payload.

**Fix**: Remove `aiKey` from the client payload entirely. Use only `Deno.env.get('GEMINI_API_KEY')`. If per-user keys are needed, store them encrypted in the database and fetch server-side.

### 27.2 CORS Wildcard on Edge Functions

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
};
```

This allows any website to call the Edge Function if it obtains a valid auth token. For a mobile-only app, restrict to the app's origin or remove CORS headers entirely (native apps don't enforce CORS):

```typescript
'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '',
```

### 27.3 No Rate Limiting

There is no rate limiting at any layer:
- **Auth**: No brute-force protection on `login()`. Supabase has built-in rate limits, but they're generous (30 requests/minute on free tier).
- **Edge Functions**: No per-user call limit on `parse-order-pdf`. A malicious user could burn through the Gemini API quota.
- **Service layer**: No throttling on write operations.

**Fix**:
1. Enable Supabase's built-in auth rate limiting (configure in dashboard).
2. Add a `rate_limits` table or use Supabase Edge Function middleware:
```typescript
const { count } = await supabaseClient
  .from('api_usage')
  .select('*', { count: 'exact' })
  .eq('user_id', user.id)
  .gte('created_at', new Date(Date.now() - 3600000).toISOString());

if (count > 10) return errorResponse('Rate limit exceeded', 429);
```

### 27.4 No Input Sanitization on Edge Function

The `parse-order-pdf` function passes `base64Data` directly to the Gemini API without validating:
- Maximum size (memory exhaustion).
- Actual MIME type vs declared `mimeType` (type confusion).
- Whether the base64 is valid (malformed payload → cryptic Gemini error).

**Fix**: Validate before processing:

```typescript
if (base64Data.length > 10_000_000) return errorResponse('File too large (max 7.5MB)', 413);
if (!['application/pdf', 'image/png', 'image/jpeg'].includes(mimeType)) {
  return errorResponse('Unsupported file type', 415);
}
```

### 27.5 Session Management Gaps

The Supabase client is configured with `autoRefreshToken: true` and `persistSession: true`, which is correct. However:
- No session expiry UI — if the token expires and refresh fails, API calls silently fail.
- No biometric re-authentication before sensitive operations (despite `expo-local-authentication` being listed in `app.json` plugins).
- No forced logout on auth state change (e.g., password reset from another device).

**Fix**: Add an auth state listener that redirects to login on session loss:

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED' && !session) {
    // Force logout
    useAuthStore.getState().logout();
  }
  if (event === 'SIGNED_OUT') {
    router.replace('/(auth)/login');
  }
});
```

### 27.6 Supabase Anon Key in Client Bundle

`EXPO_PUBLIC_SUPABASE_ANON_KEY` is embedded in the JavaScript bundle. This is by design (anon key + RLS), but the current RLS policies are `USING (true)` — meaning the anon key provides *full read/write access to all tables* for any authenticated user, regardless of data ownership.

This is acceptable only for a single-user/single-tenant deployment. If multi-tenancy is ever planned, this is a P0 data isolation breach. See §10 for RLS fixes.

---

## 28. Compliance

### 28.1 GST Invoice Requirements

Indian GST law mandates specific fields on tax invoices. Current coverage:

| Required Field | Present | Notes |
|---------------|---------|-------|
| Supplier name, address, GSTIN | ✅ | From `business_profile` |
| Recipient name, address, GSTIN | ⚠️ | GSTIN optional in schema; address not always populated |
| Invoice number (sequential, unique) | ✅ | `generate_invoice_number()` |
| Date of issue | ✅ | `invoice_date` |
| HSN code | ✅ | `hsn_code` per line item |
| Description of goods | ✅ | `design_name` |
| Quantity and unit | ⚠️ | `quantity` is INTEGER — fractional boxes not supported |
| Taxable value | ✅ | `taxable_amount` |
| CGST/SGST or IGST rate + amount | ✅ | Properly split |
| Place of supply | ❌ | **Missing** — required for inter-state determination |
| Reverse charge applicability | ❌ | **Missing** — required field (even if "No") |
| Signature / digital signature | ❌ | Not present on generated PDFs |

**Fix**: Add `place_of_supply` (state code) to the `invoices` table. Add a "Reverse Charge: No" line to the PDF template. Consider digital signature integration for e-invoice compliance.

### 28.2 Invoice Sequence Gaps

As noted in §24.5, the sequence can have gaps if an invoice creation fails after the sequence increment. GST rules require sequential, gapless invoice numbering within a financial year. Gaps trigger audit flags.

### 28.3 Financial Year Boundary

`generate_invoice_number()` calculates the financial year dynamically but does **not reset the sequence** on April 1. After the first financial year, invoice numbers will continue incrementing (e.g., TM/2027-28/1457 instead of TM/2027-28/0001).

**Fix**: Add financial year tracking to the sequence:

```sql
-- Check if FY has changed since last invoice
IF v_current_fy <> v_last_fy THEN
  v_seq := 1;
ELSE
  v_seq := v_seq + 1;
END IF;
```

### 28.4 Audit Trail Gaps

There is no audit trail for:
- Invoice edits or deletions (no soft delete).
- Payment modifications.
- Price changes on inventory items.
- User actions (who did what, when).

GST audits require maintaining records for 6 years. Without immutable audit logs, the business is exposed.

**Fix**: Add an `audit_log` table with trigger-based logging:

```sql
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 28.5 Data Retention & Export

No mechanism exists for:
- Exporting data in GSTR-1/GSTR-3B format for GST filing.
- Bulk CSV/Excel export for accountants.
- Data backup/export for business continuity.

These are not just compliance nice-to-haves — they're operational necessities for a tile business filing quarterly GST returns.

---

## 29. Portability & Interoperability

### 29.1 Supabase Vendor Lock-in

The codebase is tightly coupled to Supabase at every layer:
- Services import `supabase` directly and call `.from()`, `.rpc()`, `.functions.invoke()`.
- Auth uses `supabase.auth.signInWithPassword()`.
- Storage uses `supabase.storage.from()`.

The proposed Repository pattern (§3) mitigates this for data access. For complete portability:

```typescript
// src/adapters/database.ts — interface
export interface DatabaseAdapter {
  query<T>(table: string, options: QueryOptions): Promise<T[]>;
  insert<T>(table: string, data: Partial<T>): Promise<T>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;
  rpc<T>(functionName: string, params: Record<string, unknown>): Promise<T>;
}

// src/adapters/supabaseAdapter.ts — implementation
export class SupabaseAdapter implements DatabaseAdapter { ... }
```

### 29.2 Platform-Specific Gaps

The app targets iOS and Android via Expo. Web is listed in `app.json` (`"bundler": "metro"`) but is not actively tested. Platform-specific considerations:

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| `expo-print` (PDF gen) | ✅ | ✅ | ❌ (no native print) |
| `expo-sharing` | ✅ | ✅ | ❌ (Web Share API needed) |
| `expo-camera` | ✅ | ✅ | ⚠️ (works but UX differs) |
| `expo-local-authentication` | ✅ (Face ID) | ✅ (Fingerprint) | ❌ |
| `AsyncStorage` | ✅ | ✅ | ✅ (localStorage) |

**Fix**: Add `Platform.OS` guards for features that don't work on all platforms, or exclude web from the build config.

### 29.3 Deno Runtime Pinning

The Edge Function pins to `deno.land/std@0.177.0` (released early 2023). Supabase Edge Functions now use Deno 1.40+ with native npm support. The old import map style is deprecated.

**Fix**: Migrate to modern Deno imports:

```typescript
// Before
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// After — use built-in Deno.serve
Deno.serve(async (req: Request) => { ... });
```

### 29.4 No API Versioning

Supabase RPC functions have no versioning. If `perform_stock_operation` or `generate_invoice_number` changes signature, all running app versions break simultaneously.

**Fix**: Version RPC functions (`perform_stock_operation_v2`) and maintain backward compatibility for at least one prior version. Deprecate old versions via `NOTICE` messages:

```sql
CREATE OR REPLACE FUNCTION perform_stock_operation_v1(...)
RETURNS INTEGER AS $$
BEGIN
  RAISE NOTICE 'perform_stock_operation_v1 is deprecated, use v2';
  RETURN perform_stock_operation_v2(...);
END;
$$ LANGUAGE plpgsql;
```

---

## 30. Extensibility

### 30.1 Adding a New Domain Entity

To add a new domain (e.g., "Purchase Returns"), the current codebase requires touching:

1. `supabase/migrations/` — new table + indexes + RLS policy
2. `src/types/` — new type file
3. `src/services/` — new service file (copy-paste from existing service)
4. `src/stores/` — new store file (copy-paste pagination boilerplate)
5. `app/(app)/` — new screen files
6. `app/(app)/(tabs)/_layout.tsx` — add tab if needed
7. `src/i18n/locales/en.json` + `hi.json` — new translation keys

Steps 3 and 4 involve copying ~80 lines of boilerplate each. This is the strongest signal that the codebase needs the `createPaginatedStore` factory (§4.3) and Repository base class (§3.2). With those in place, adding a new entity requires:

```typescript
// 1. Type (5 lines)
export interface PurchaseReturn { id: UUID; ... }

// 2. Repository (3 lines)
export const purchaseReturnRepo = createRepository<PurchaseReturn>('purchase_returns');

// 3. Service (10 lines — only domain-specific logic)
export const purchaseReturnService = {
  async createReturn(data: CreatePurchaseReturnInput) {
    return purchaseReturnRepo.create(data);
  },
};

// 4. Store (5 lines — factory handles pagination, loading, error)
export const usePurchaseReturnStore = createPaginatedStore('purchase_returns', purchaseReturnService);
```

### 30.2 Adding a New Report

Adding a new financial report currently requires:
1. A new PostgreSQL function (migration).
2. A new service method to call `.rpc()`.
3. A new store action + state.
4. A new screen.

The report query logic is split between PostgreSQL (good for aggregation) and TypeScript (used for the dashboard — bad). Standardize: **all report logic lives in PostgreSQL RPC functions**, called via a thin `reportService.ts`:

```typescript
// src/services/reportService.ts
export const reportService = {
  getDashboardStats: () => supabase.rpc('get_dashboard_stats'),
  getProfitLoss: (start: string, end: string) => supabase.rpc('get_profit_loss', { p_start: start, p_end: end }),
  getAgingReport: (customerId?: string) => supabase.rpc('get_aging_report', { p_customer_id: customerId }),
  // New reports are one-liners here
};
```

### 30.3 Plugin Points for Business Logic

Tile businesses vary — some need transport cost tracking, some need shade/lot management, some need multi-warehouse support. The current codebase has no extension points.

**Fix**: Design critical entities with a `metadata JSONB` column for business-specific extensions without schema changes:

```sql
ALTER TABLE inventory_items ADD COLUMN metadata JSONB DEFAULT '{}';
-- Usage: { "shade": "L1", "lot": "2024-A", "warehouse": "godown-2" }
```

On the frontend, render metadata fields dynamically:

```tsx
{Object.entries(item.metadata ?? {}).map(([key, value]) => (
  <FormField key={key} label={key} value={String(value)} />
))}
```

### 30.4 Feature Flags

There is no feature flag system. Every feature is always on. For a business app that might need gradual rollout or A/B testing:

```typescript
// src/config/featureFlags.ts
export const Features = {
  PURCHASE_RETURNS: false,
  AI_ORDER_PARSING: true,
  MULTI_WAREHOUSE: false,
  GST_E_INVOICE: false,
} as const;

// Usage
if (Features.PURCHASE_RETURNS) {
  // Show purchase returns tab
}
```

Start with compile-time flags; migrate to remote config (Supabase `app_config` table or a dedicated service) when needed.

### 30.5 Notification & Webhook System

No mechanism exists for:
- Low stock alerts (despite tracking `low_stock_threshold`).
- Payment due reminders.
- Order status change notifications.

**Fix**: Add a `notifications` table and a Supabase Database Webhook that fires on relevant events:

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'low_stock', 'payment_due', 'order_received'
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: auto-create notification when stock drops below threshold
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.box_count <= NEW.low_stock_threshold AND OLD.box_count > OLD.low_stock_threshold THEN
    INSERT INTO notifications (type, title, body, metadata)
    VALUES ('low_stock', 'Low Stock Alert',
      NEW.design_name || ' has only ' || NEW.box_count || ' boxes left',
      jsonb_build_object('item_id', NEW.id, 'current_stock', NEW.box_count));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 31. Prioritized Refactoring Roadmap

### Phase 1: Stop the Bleeding (Week 1-2)

| # | Task | Files | Effort |
|---|------|-------|--------|
| 1.1 | **Transactional invoice creation RPC** (include `generate_invoice_number` in same txn — §24.5) | New migration, `invoiceService.ts` | 1 day |
| 1.2 | **Transactional payment recording RPC** | New migration, `paymentService.ts` | 0.5 day |
| 1.3 | **Remove all `any` types** | 14+ locations across services/stores | 1 day |
| 1.4 | **Move duplicate types from `financeService.ts` to `src/types/`** | 2 files | 0.5 day |
| 1.5 | **Add `.env` to `.gitignore`**, create `.env.example` | 2 files | 10 min |
| 1.6 | **Fix `get_profit_loss()` redundant subqueries** | 1 migration | 0.5 day |
| 1.7 | **Fix `lowStockOnly` filter** — use `low_stock_items` view | `inventoryService.ts` | 0.5 day |
| 1.8 | **Fix `convertNumberToWords`** — import from `currency.ts` | `pdfService.ts` | 10 min |
| 1.9 | **Fix dashboard stats** — use existing `get_dashboard_stats()` RPC | `(tabs)/index.tsx` | 0.5 day |
| 1.10 | **Memoize theme** — `useMemo(() => buildTheme(isDark), [isDark])` | `ThemeProvider.tsx` | 5 min |
| 1.11 | **Fix GST rate hardcoded to 18** — read from `selectedItem.gst_rate` | `invoices/create.tsx` | 15 min |
| 1.12 | **Fix missing 'SATIN' category** — derive from `constants/categories.ts` | `inventory.tsx` | 10 min |
| 1.13 | **Fix missing 'credit' payment mode** — derive from `constants/paymentModes.ts` | `PaymentModal.tsx`, `invoices/create.tsx` | 15 min |
| 1.14 | **Remove client-supplied `aiKey`** from Edge Function (§27.1) | `parse-order-pdf/index.ts` | 15 min |
| 1.15 | **Add `ErrorBoundary`** at app root and per-tab (§25.2) | `_layout.tsx`, new component | 0.5 day |
| 1.16 | **Replace `Promise.all` with `Promise.allSettled`** in app prefetch (§24.3) | `(app)/_layout.tsx` | 30 min |
| 1.17 | **Add input validation on Edge Function** — size, MIME type (§27.4) | `parse-order-pdf/index.ts` | 30 min |

### Phase 2: Foundation for Scale (Week 3-4)

| # | Task | Files | Effort |
|---|------|-------|--------|
| 2.1 | **Extract Repository pattern** — `baseRepository.ts` + domain repos | ~8 new files | 2 days |
| 2.2 | **Refactor services to use repos** — inject dependencies | ~7 service files | 2 days |
| 2.3 | **Create Zod schemas** for all forms/inputs | ~6 new schema files | 1 day |
| 2.4 | **Wire react-hook-form + zod** in all form screens | ~8 screen files | 2 days |
| 2.5 | **Extract `createPaginatedStore` factory** | 1 new file, refactor 4 stores | 1 day |
| 2.6 | **Add event bus** for cross-store communication | 1 new file, update 3 stores | 1 day |
| 2.7 | **Extract common hooks** — `useDebounce`, `useThemeTokens`, `usePagination` | 3 new files | 0.5 day |
| 2.8 | **Decompose `invoices/create.tsx`** into feature module | 8+ new files, delete 1 | 2 days |
| 2.9 | **Add `escapeHtml` utility** + apply to PDF generation | 1 new file, update `pdfService.ts` | 0.5 day |
| 2.10 | **Add `withOpacity` color utility** — replace string concatenation | 1 new file, update 8+ files | 0.5 day |
| 2.11 | **Replace `ScrollView` + `.map()` with `FlashList`** on all list screens (§26.1) | ~6 screen files | 1 day |
| 2.12 | **Add Zustand selectors** — replace bare `useXStore()` with slice selectors (§26.3) | ~10 screen files | 1 day |
| 2.13 | **Add `withRetry` wrapper** for idempotent service calls (§24.1) | 1 new file, update services | 0.5 day |
| 2.14 | **Add structured logger** (`src/utils/logger.ts`) — replace all `console.*` (§25.1) | 1 new file, update ~20 files | 1 day |

### Phase 3: Testing & DX (Week 5-6)

| # | Task | Files | Effort |
|---|------|-------|--------|
| 3.1 | **Rewrite service tests** with injected mock repos | ~7 test files | 2 days |
| 3.2 | **Add unit tests** for `currency.ts`, `dateUtils.ts`, `itemNameParser.ts` | 3 new test files | 1 day |
| 3.3 | **Add store tests** with mock services | ~6 test files | 2 days |
| 3.4 | **Add molecule/organism component tests** | 10 new test files | 2 days |
| 3.5 | **Configure ESLint + Prettier** (catches dead imports, unused styles) | 3 config files | 0.5 day |
| 3.6 | **Configure Husky + lint-staged** | 2 config files | 0.5 day |
| 3.7 | **Add GitHub Actions CI** | 1 workflow file | 0.5 day |
| 3.8 | **Add pgTAP tests** for DB functions (`get_profit_loss`, `perform_stock_operation`, `generate_invoice_number`) | 3 test files | 1 day |

### Phase 4: Polish & Patterns (Week 7-8)

| # | Task | Files | Effort |
|---|------|-------|--------|
| 4.1 | **Create `AppError` hierarchy** | 1 new file, update all catch blocks | 1 day |
| 4.2 | **Create `<QueryBoundary>` component** | 1 new file, update screens | 1 day |
| 4.3 | **Add accessibility** — roles, labels, states to all interactive components | ~12 files | 1 day |
| 4.4 | **Add missing DB indexes** — payments, expenses, purchases, line items (§26.6) | 1 migration | 0.5 day |
| 4.5 | **Audit and fix i18n hardcoded strings** | ~10 files | 0.5 day |
| 4.6 | **Add `RefreshControl` to all list screens** | 4 screens | 0.5 day |
| 4.7 | **Add `AppState` foreground refresh logic** | `_layout.tsx` | 0.5 day |
| 4.8 | **Extract layout utilities from theme context** to static `StyleSheet` | `theme/layout.ts`, update ~20 screens | 1 day |
| 4.9 | **Clean up dead StyleSheet keys** and unused imports | ~10 files | 0.5 day |
| 4.10 | **RLS policies with `user_id`** (if multi-tenant planned) | 1 migration | 1 day |
| 4.11 | **Add `TextInput` focus state** tracking | `TextInput.tsx` | 15 min |

### Phase 5: Production Readiness (Week 9-10)

| # | Task | Files | Effort |
|---|------|-------|--------|
| 5.1 | **Add `audit_log` table + triggers** for GST compliance (§28.4) | New migration | 1 day |
| 5.2 | **Add `place_of_supply` and reverse charge fields** to invoices (§28.1) | Migration, `invoiceService.ts`, PDF template | 1 day |
| 5.3 | **Fix FY sequence reset** in `generate_invoice_number` (§28.3) | Migration | 0.5 day |
| 5.4 | **Switch to keyset pagination** on all paginated queries (§23.1) | Services, stores | 1.5 days |
| 5.5 | **Materialize ledger summary views** or add denormalized balances (§23.2) | Migration | 1 day |
| 5.6 | **Add network status banner** + pending operation queue (§24.2) | 2 new files, `_layout.tsx` | 1.5 days |
| 5.7 | **Add image transforms** for list view thumbnails (§23.3) | `TileSetCard`, image utility | 0.5 day |
| 5.8 | **Upgrade Edge Function** to modern `Deno.serve` (§29.3) | `parse-order-pdf/index.ts` | 0.5 day |
| 5.9 | **Add feature flags system** (§30.4) | 1 new file | 0.5 day |
| 5.10 | **Add low stock notification triggers** (§30.5) | Migration, new component | 1 day |
| 5.11 | **Enable `pg_stat_statements`** + slow query baseline (§25.5) | Supabase dashboard, docs | 0.5 day |
| 5.12 | **Add performance instrumentation** on critical API paths (§25.3) | `src/utils/logger.ts`, services | 0.5 day |

---

## Appendix A: File-Level Issue Index

For quick `grep`-and-fix workflows:

```
# ─── CRITICAL (Data Corruption / Wrong Results) ──────────────

invoiceService.ts:55-143   → non-transactional multi-step operation
paymentService.ts:29-54    → non-transactional read-modify-write (race condition)
inventoryService.ts:24     → lowStockOnly filter broken (compares column to string literal)
(tabs)/index.tsx:42-58     → dashboard stats calculated on page 1 only (ignores rest of dataset)
invoices/create.tsx:244    → GST rate hardcoded to 18% (ignores item's actual gst_rate)

# ─── HIGH (Type Safety / Silent Failures) ────────────────────

invoiceService.ts:36       → as any[] return type
invoiceService.ts:130      → hardcoded English string in stock reason
invoiceService.ts:136      → silent failure on stock deduction (console.error only)
inventoryStore.ts:19-20    → any types in interface (createItem, updateItem)
invoiceStore.ts:87         → dynamic require() cross-store coupling
financeService.ts:4-30     → duplicate type definitions (should be in src/types/)
financeService.ts:75       → as any cast for join result
orderService.ts:17         → raw_llm_response: any
orderService.ts:91-94      → exact-match duplicate detection (case sensitive)
pdfService.ts:7            → dead import (useLocale hook in non-React file)
pdfService.ts:29           → businessProfile: any parameter
pdfService.ts:289-291      → convertNumberToWords stub returns digits, not words
PaymentModal.tsx:57-58     → error swallowed (console.error only, no user feedback)
Screen.tsx:61              → as any cast for ScrollView/View prop union

# ─── MEDIUM (UX / Consistency / Drift) ───────────────────────

app/_layout.tsx:2           → duplicate useCallback import
app/_layout.tsx:36          → useTheme() as any
(tabs)/_layout.tsx:75       → hardcoded "More" (not i18n'd)
inventory.tsx:15            → missing 'SATIN' category
inventory.tsx:91            → hardcoded English fallback string
invoices/create.tsx:39      → paymentMode typed as any
invoices/create.tsx:44      → selectedItem typed as any
invoices/create.tsx:115,123,131 → customer mutation via `as any` casts
invoices/create.tsx:329     → operator precedence ambiguity in disabled prop
DashboardHeader.tsx:19      → date hardcoded to 'hi-IN' locale
PaymentModal.tsx:64         → missing 'credit' payment mode
dateUtils.ts:18-19          → "Today"/"Yesterday" hardcoded in English
ThemeProvider.tsx:55        → theme object recreated every render (missing useMemo)
theme/index.ts:104-108     → shadows typed as `object` (should be ViewStyle)
colors.ts:135-141           → static layout utilities inside dynamic theme context

# ─── LOW (Dead Code / Polish) ─────────────────────────────────

QuickActionsGrid.tsx:63-69  → 5 empty unused StyleSheet keys
PaymentModal.tsx:155-170    → 3 unused StyleSheet keys (title, subtitle, label)
inventory.tsx:213           → empty unused StyleSheet key (header)
TextInput.tsx:30            → isFocused hardcoded to false (dead focus state)
Badge.tsx + 8 locations     → color + '20' string concatenation (breaks for non-hex)
currency.ts:18              → negative zero bug in formatINR
007_views_functions_rls.sql:98-127 → redundant subqueries in P&L function
007_views_functions_rls.sql:195    → USING (true) RLS policies

# ─── SCALABILITY ─────────────────────────────────────────────

All stores                  → OFFSET/LIMIT pagination, degrades at 10K+ rows (§23.1)
007_views_functions_rls.sql:4-16  → unbounded customer_ledger_summary view, full scan (§23.2)
007_views_functions_rls.sql:18-27 → unbounded supplier_ledger_summary view, full scan (§23.2)
expenses.tsx + list screens → ScrollView + .map() instead of FlatList/FlashList (§26.1)
All stores                  → bare useXStore() subscriptions cause unnecessary re-renders (§26.3)
parse-order-pdf/index.ts    → base64 payload hits 2MB Edge Function limit on large PDFs (§23.4)

# ─── RELIABILITY / RESILIENCE ────────────────────────────────

All services                → no retry logic on network failures (§24.1)
Entire app                  → zero offline support (§24.2)
(app)/_layout.tsx:17-28     → Promise.all fails atomically, partial state on error (§24.3)
parse-order-pdf/index.ts:86 → no timeout/circuit breaker on Gemini API call (§24.4)
005_invoicing.sql:4-30      → invoice sequence gap risk on failed inserts (§24.5)
Entire app                  → no ErrorBoundary, uncaught errors = white screen (§25.2)

# ─── SECURITY ────────────────────────────────────────────────

parse-order-pdf/index.ts:61 → accepts client-supplied aiKey (API key injection, §27.1)
parse-order-pdf/index.ts:9  → CORS Allow-Origin: * on mobile-only app (§27.2)
Entire app                  → no rate limiting at any layer (§27.3)
parse-order-pdf/index.ts:55 → no input size/MIME validation on base64Data (§27.4)
authStore.ts / authService.ts → no session expiry UI, no biometric re-auth (§27.5)
login.tsx:22-31             → no email validation, no brute force protection (§27.3)

# ─── COMPLIANCE (GST) ───────────────────────────────────────

invoices table              → missing place_of_supply (required for inter-state, §28.1)
invoices table              → missing reverse_charge field (required even if "No", §28.1)
005_invoicing.sql:67        → quantity is INTEGER, fractional boxes unsupported (§28.1)
005_invoicing.sql:4-30      → no FY sequence reset on April 1 (§28.3)
Entire app                  → no audit trail for edits/deletes (§28.4)
Entire app                  → no GSTR-1/GSTR-3B export capability (§28.5)

# ─── MISSING ─────────────────────────────────────────────────

expenses.tsx:37-39          → parseFloat without validation, freeform category
customerService.ts:19       → search only on name field (should include phone)
All interactive components   → missing accessibilityRole
Customer/Finance/Order lists → missing RefreshControl (pull-to-refresh)
All screens                  → no skeleton loading states
All forms                    → zod + react-hook-form not wired (installed but unused)
Entire app                  → no structured logging (console.* only, §25.1)
Entire app                  → no performance monitoring (§25.3)
Entire app                  → no feature flag system (§30.4)
Entire app                  → no low-stock notification system (§30.5)
Database                    → missing indexes on payments.direction, expenses.category,
                              purchases.supplier_id, invoice_line_items.item_id (§26.6)
```

## Appendix B: Dependency Audit

| Package | Version | Status |
|---------|---------|--------|
| expo | 54.0.0 | Current |
| react | 19.1.0 | Current |
| react-native | 0.81.5 | Current |
| zustand | ^5.0.12 | Current |
| zod | ^4.3.6 | **Installed, unused** — zero imports in codebase |
| react-hook-form | ^7.72.0 | **Installed, underused** — only in `setup.tsx` |
| @supabase/supabase-js | ^2.99.3 | Current |
| date-fns | ^4.1.0 | Current |
| immer | ^11.1.4 | Current |
| expo-print / expo-sharing | Current | Used for PDF generation |
| expo-camera | Current | Used for QR scanner |
| expo-document-picker | Current | Used for PDF import |
| lucide-react-native | Current | Icon system |
| i18next / react-i18next | Current | i18n framework |
| react-native-keyboard-controller | Current | Keyboard avoidance |

No outdated or vulnerable dependencies detected. `zod` and `react-hook-form` are dead weight until wired in.

## Appendix C: Component Test Coverage Matrix

| Layer | Component | Has Tests | Test Quality |
|-------|-----------|-----------|--------------|
| **Atoms** | `Button` | ✅ | Smoke only — loading state test broken (missing testID) |
| | `Badge` | ✅ | Smoke only — single variant tested |
| | `Card` | ✅ | Smoke only — children render |
| | `TextInput` | ✅ | Decent — label, placeholder, error, onChangeText |
| | `Chip` | ❌ | — |
| | `Divider` | ❌ | — |
| | `ThemedText` | ❌ | — |
| | `Screen` | ❌ | — |
| **Molecules** | `StatCard` | ❌ | — |
| | `SearchBar` | ❌ | — |
| | `FormField` | ❌ | — |
| | `ListItem` | ❌ | — |
| | `EmptyState` | ❌ | — |
| **Organisms** | `DashboardHeader` | ❌ | — |
| | `QuickActionsGrid` | ❌ | — |
| | `RecentInvoicesList` | ❌ | — |
| | `TileSetCard` | ❌ | — |
| | `PaymentModal` | ❌ | — |
| **Services** | `financeService` | ✅ | Structural — tests implementation, not behavior |
| **Stores** | `customerStore` | ✅ | Structural — tests mock interactions |
| **Utils** | `gstCalculator` | ✅ | Good — tests actual calculations |
| | `currency` | ❌ | — |
| | `dateUtils` | ❌ | — |
| | `itemNameParser` | ❌ | — |

**Estimated current coverage**: ~8% of meaningful code paths.
**Target**: 60% by end of Phase 3, 80% by end of Phase 5.

---

*End of review. Happy to discuss any section in detail or pair on implementation of any phase.*
