# TileMaster — Complete Testing Master Plan

**Date:** 2026-03-31
**Objective:** Reach 100% coverage in Unit, Integration, E2E, and Database test types
**Principle:** Real Supabase is hit in integration and database tests — no mock substitutes for production behavior verification

---

## Part 1: Current State Scorecard

### 1.1 Coverage by Test Type

| Test Type                | Present                                     | Absent                     | % Present |
| ------------------------ | ------------------------------------------- | -------------------------- | --------- |
| **Unit Tests**           | ~56 source files covered                    | ~35 source files uncovered | **~62%**  |
| **Integration Tests**    | 3 flows (invoice create, payment, stock op) | 5 critical flows missing   | **38%**   |
| **E2E Tests (Maestro)**  | 2 flows (create invoice, dashboard)         | ~16 user journeys missing  | **11%**   |
| **Database Tests (SQL)** | 4 pgTAP suites                              | ~10 RPCs/triggers untested | **29%**   |

### 1.2 Unit Test Coverage by Layer

| Layer         | Total Files | With Tests | %        | Status |
| ------------- | ----------- | ---------- | -------- | ------ |
| Services      | 12          | 12         | **100%** | ✅     |
| Repositories  | 11          | 8          | **73%**  | ⚠️     |
| Stores        | 9           | 7          | **78%**  | ⚠️     |
| Hooks         | 6           | 5          | **83%**  | ✅     |
| Atoms         | 10          | 7          | **70%**  | ⚠️     |
| Molecules     | 5           | 3          | **60%**  | ⚠️     |
| Organisms     | 4           | 2          | **50%**  | ⚠️     |
| Features (UI) | 4           | 0          | **0%**   | ❌     |
| Utils         | 10          | 6          | **60%**  | ⚠️     |
| Schemas       | 7           | 4          | **57%**  | ⚠️     |
| **Total**     | **82**      | **54**     | **~66%** | ⚠️     |

### 1.3 UI Screen Coverage

| Screen Route                    | Test Exists | Status  |
| ------------------------------- | ----------- | ------- |
| `(auth)/login.tsx`              | ✅          | Present |
| `(auth)/setup.tsx`              | ✅          | Present |
| `(tabs)/index.tsx` — Dashboard  | ✅          | Present |
| `(tabs)/inventory.tsx`          | ❌          | Missing |
| `(tabs)/invoices.tsx`           | ❌          | Missing |
| `(tabs)/more.tsx`               | ❌          | Missing |
| `(tabs)/scan.tsx`               | ❌          | Missing |
| `customers/index.tsx`           | ✅          | Present |
| `customers/add.tsx`             | ✅          | Present |
| `customers/[id].tsx`            | ❌          | Missing |
| `customers/aging.tsx`           | ❌          | Missing |
| `finance/index.tsx`             | ❌          | Missing |
| `finance/expenses.tsx`          | ✅          | Present |
| `finance/purchases.tsx`         | ✅          | Present |
| `finance/payments.tsx`          | ❌          | Missing |
| `finance/profit-loss.tsx`       | ❌          | Missing |
| `inventory/[id].tsx`            | ✅          | Present |
| `inventory/add.tsx`             | ✅          | Present |
| `inventory/stock-op.tsx`        | ✅          | Present |
| `invoices/[id].tsx`             | ✅          | Present |
| `invoices/create.tsx`           | ✅          | Present |
| `orders/index.tsx`              | ✅          | Present |
| `orders/import.tsx`             | ✅          | Present |
| `orders/[id].tsx`               | ❌          | Missing |
| `settings/index.tsx`            | ❌          | Missing |
| `settings/business-profile.tsx` | ❌          | Missing |
| `settings/lock.tsx`             | ❌          | Missing |
| `suppliers/index.tsx`           | ❌          | Missing |
| `suppliers/[id].tsx`            | ❌          | Missing |
| **Total**                       | **16/29**   | **55%** |

### 1.4 What Is Specifically Absent

**Critical Gaps (P0 — business-logic correctness)**

- `gstCalculator.ts` — test file exists but in wrong location, NOT discovered by Jest
- `validation.ts` — used in forms app-wide, zero tests
- `createPaginatedStore.ts` — shared factory underpinning every paginated store, zero tests
- `CustomerStep.tsx`, `LineItemsStep.tsx`, `PaymentStep.tsx`, `InvoiceCreateScreen.tsx` — the entire invoice creation wizard UI is untested

**High Priority (P1 — functional coverage)**

- `supplierRepository.ts` + both supplier screens
- `notificationRepository.ts` + `notificationStore.ts`
- `businessProfile.schema.ts` + `expense.schema.ts`
- `DashboardHeader.tsx`, `QuickActionsGrid.tsx`, `TileSetCard.tsx` organisms
- `ListItem.tsx`, `StatCard.tsx` molecules
- Integration tests: customer flow, expense flow, order import flow, auth session flow, business profile setup flow

**Low Priority (P2 — completeness)**

- `Divider.tsx`, `Screen.tsx`, `ThemedText.tsx` atoms
- `imageTransform.ts`, `logger.ts` utilities
- `useThemeTokens.ts` hook

---

## Part 2: Infrastructure Fixes (Pre-Requisite for Any Phase)

These MUST be resolved before writing new tests or coverage numbers will be misleading.

### FIX-001: Move `gstCalculator.test.ts` to correct location

- **Current:** `src/utils/__tests__/gstCalculator.test.ts` (or wherever it is, not in Jest's discovery path)
- **Fix:** Place at `src/utils/gstCalculator.test.ts` OR inside `src/utils/__tests__/gstCalculator.test.ts` (verify the testMatch pattern includes this path)
- **Verification:** `npx jest --listTests | grep gstCalculator` must return the file

### FIX-002: Integration test environment — Real Supabase config

- Create `jest.integration.config.js` separate from unit config
- This config runs tests tagged with `@integration` or in `__tests__/integration/`
- Reads `.env.test` with a dedicated **test Supabase project** credentials (never production)
- Sets `testTimeout: 30000` (network calls are slow)
- Does NOT apply Supabase mock setup from `jest.setup.ts`
- After each integration test suite, run cleanup SQL to delete test data using a known test prefix (e.g. `test-` in names)

### FIX-003: Enforce coverage thresholds in CI

- Add `"test:coverage": "jest --coverage --coverageThreshold ..."` to `package.json`
- Coverage check must run as a required step in the pipeline before any merge

### FIX-004: Fix `.then()` mock anti-pattern in existing tests

- Several tests do `mockFn.mockImplementation(() => ({ then: ... }))` which breaks Promise chain semantics
- Replace with `mockFn.mockResolvedValue(...)` / `mockFn.mockRejectedValue(...)`
- Affects: inventoryService.test.ts, orderService.test.ts, financeService.test.ts

### FIX-005: Platform coverage gap

- `Platform.OS` is hardcoded to `'ios'` globally in `jest.setup.ts`
- Create `platformHelpers.ts` tests that toggle `'android'` and assert platform-specific UI branches (biometric label, status bar, etc.)

---

## Part 3: Unit Test Implementation Plan (Target: 100%)

### UNIT-001: `gstCalculator.ts`

**File:** `src/utils/__tests__/gstCalculator.test.ts`

All test cases must test the pure function with zero mocks.

| #   | Test Case                                                      | Assertion                                  |
| --- | -------------------------------------------------------------- | ------------------------------------------ |
| 1   | Intra-state (same GSTIN state code) 18% GST                    | CGST = 9%, SGST = 9%, IGST = 0             |
| 2   | Inter-state (different GSTIN state code) 18% GST               | CGST = 0, SGST = 0, IGST = 18%             |
| 3   | 12% GST slab intra-state                                       | CGST = 6%, SGST = 6%                       |
| 4   | 5% GST slab inter-state                                        | IGST = 5%                                  |
| 5   | 28% GST slab (luxury tiles)                                    | Correct split                              |
| 6   | Zero-rated supply (0% GST, export)                             | All tax fields = 0                         |
| 7   | Exempt supply                                                  | All tax fields = 0                         |
| 8   | Unregistered buyer (no GSTIN) defaults to intra-state          | CGST+SGST split                            |
| 9   | Reverse charge flag = true                                     | reverse_charge field set on output         |
| 10  | Fractional quantity (2.5 boxes)                                | Correct proportional tax                   |
| 11  | High value invoice (₹10,00,000)                                | No floating point precision errors         |
| 12  | Invalid GST rate (17%)                                         | Throws ValidationError                     |
| 13  | Negative taxable value                                         | Throws ValidationError                     |
| 14  | GSTIN state code extraction correct for all Indian state codes | Parameterized test over all 37 state codes |
| 15  | Composition dealer (no tax collected)                          | All tax = 0, composition flag set          |

### UNIT-002: `validation.ts`

**File:** `src/utils/__tests__/validation.test.ts`

| #   | Test Case                                                              |
| --- | ---------------------------------------------------------------------- |
| 1   | Valid GSTIN format passes (15 char alphanum, correct checksum)         |
| 2   | Invalid GSTIN — wrong length fails with message                        |
| 3   | Invalid GSTIN — non-alphanumeric chars fails                           |
| 4   | Invalid GSTIN — invalid state code (00, 38+) fails                     |
| 5   | Valid Indian mobile number (10 digits, starts with 6-9)                |
| 6   | Invalid mobile — too short                                             |
| 7   | Invalid mobile — starts with 5                                         |
| 8   | Valid PAN format                                                       |
| 9   | Invalid PAN format                                                     |
| 10  | Valid pincode (6 digits)                                               |
| 11  | Invalid pincode (5 digits, letters)                                    |
| 12  | Email validation — valid and invalid formats                           |
| 13  | Non-empty string trimming strips whitespace-only as empty              |
| 14  | Currency amount — accepts positive numbers with 2 decimal places       |
| 15  | Currency amount — rejects negative, rejects > 10 crore (business rule) |

### UNIT-003: `createPaginatedStore.ts`

**File:** `src/stores/__tests__/createPaginatedStore.test.ts`

| #   | Test Case                                                                      |
| --- | ------------------------------------------------------------------------------ |
| 1   | Initial state: items=[], page=1, hasMore=true, loading=false, error=null       |
| 2   | `loadPage(1)` sets loading=true during fetch, then loading=false on completion |
| 3   | `loadPage(1)` populates items with response data                               |
| 4   | `loadPage(1)` when response.length < pageSize sets hasMore=false               |
| 5   | `loadPage(2)` appends to existing items (infinite scroll)                      |
| 6   | `loadPage(1)` when already loading does not duplicate fetch                    |
| 7   | `refreshPage()` resets to page=1 and replaces items (not appends)              |
| 8   | `setFilter()` triggers reset and re-fetch with new filter                      |
| 9   | Fetch throws error → error state set, loading=false                            |
| 10  | `clearError()` resets error to null                                            |
| 11  | `reset()` returns all fields to initial state                                  |
| 12  | Multiple concurrent `loadPage()` calls — only one fetch fires (deduplication)  |
| 13  | `loadPage()` when hasMore=false does nothing                                   |
| 14  | Used as factory: two instances are fully independent (no shared state)         |

### UNIT-004: `notificationRepository.ts`

**File:** `src/repositories/__tests__/notificationRepository.test.ts`

| #   | Test Case                                                                         |
| --- | --------------------------------------------------------------------------------- |
| 1   | `fetchUnread()` — calls Supabase with `read=false` filter and user_id             |
| 2   | `fetchUnread()` — returns correctly mapped notification objects                   |
| 3   | `markAsRead(id)` — calls Supabase update with `read=true`                         |
| 4   | `markAllAsRead()` — calls Supabase update for all records for user                |
| 5   | `fetchUnread()` Supabase error → throws AppError                                  |
| 6   | `markAsRead()` with non-existent id → throws AppError (0 rows updated)            |
| 7   | Notification types: 'low_stock', 'payment_received', 'order_received' all handled |

### UNIT-005: `notificationStore.ts`

**File:** `src/stores/__tests__/notificationStore.test.ts`

| #   | Test Case                                                                                  |
| --- | ------------------------------------------------------------------------------------------ |
| 1   | Initial state: notifications=[], unreadCount=0                                             |
| 2   | `fetchNotifications()` populates state from service                                        |
| 3   | `markAsRead(id)` removes item from unread list and decrements count                        |
| 4   | `markAllAsRead()` sets unreadCount=0                                                       |
| 5   | Low-stock notification arrives via Supabase realtime → appended to list, count incremented |
| 6   | Fetch error → error state set, notifications unchanged                                     |
| 7   | `clearNotifications()` resets to initial state                                             |

### UNIT-006: `supplierRepository.ts`

**File:** `src/repositories/__tests__/supplierRepository.test.ts`

| #   | Test Case                                                               |
| --- | ----------------------------------------------------------------------- |
| 1   | `fetchSuppliers()` — returns list with correct field mapping            |
| 2   | `fetchSuppliers({ search })` — applies ilike filter on name/GSTIN       |
| 3   | `fetchById(id)` — returns single supplier                               |
| 4   | `fetchById(nonExistentId)` — throws AppError                            |
| 5   | `createSupplier(input)` — calls insert with correct payload             |
| 6   | `updateSupplier(id, input)` — calls update on correct row               |
| 7   | `deleteSupplier(id)` — calls delete on correct row                      |
| 8   | Supabase error on any operation → throws AppError with original message |

### UNIT-007: `businessProfile.schema.ts`

**File:** `src/schemas/__tests__/businessProfile.schema.test.ts`

| #   | Test Case                                                  |
| --- | ---------------------------------------------------------- |
| 1   | Valid full profile (all optional fields populated) passes  |
| 2   | Minimal required fields only (business_name, gstin) passes |
| 3   | Missing business_name → ZodError on that field             |
| 4   | Invalid GSTIN format → ZodError with clear message         |
| 5   | Invalid PAN format → ZodError                              |
| 6   | Phone number with country code (+91) → accepted            |
| 7   | Phone number without country code → accepted               |
| 8   | Invalid phone (too short) → ZodError                       |
| 9   | address fields: state must be a valid Indian state name    |
| 10  | pincode must be 6 digits                                   |
| 11  | logo_url must be a valid URL or null                       |
| 12  | financial_year_start must be 'april' or 'january'          |

### UNIT-008: `expense.schema.ts`

**File:** `src/schemas/__tests__/expense.schema.test.ts`

| #   | Test Case                                                                                          |
| --- | -------------------------------------------------------------------------------------------------- |
| 1   | Valid expense input passes                                                                         |
| 2   | amount ≤ 0 → ZodError                                                                              |
| 3   | Future date on expense → validation passes (credit note scenario) or blocked (business rule check) |
| 4   | Invalid category (not in enum) → ZodError                                                          |
| 5   | Missing description → ZodError (if required) or passes (if optional)                               |
| 6   | Valid purchase order with supplier_id                                                              |
| 7   | Expense without supplier_id (direct expense) — passes                                              |
| 8   | invoice_number format validation                                                                   |

### UNIT-009: `DashboardHeader.tsx`

**File:** `src/components/organisms/__tests__/DashboardHeader.test.tsx`

| #   | Test Case                                                     |
| --- | ------------------------------------------------------------- |
| 1   | Renders business name from businessProfile store              |
| 2   | Renders today's date in correct locale format                 |
| 3   | Shows notification bell icon                                  |
| 4   | Unread notification count badge visible when count > 0        |
| 5   | No badge shown when unreadCount = 0                           |
| 6   | Badge shows '9+' when count > 9                               |
| 7   | Pressing notification bell navigates to notifications screen  |
| 8   | Renders correctly on Android (no iOS-specific styling issues) |

### UNIT-010: `QuickActionsGrid.tsx`

**File:** `src/components/organisms/__tests__/QuickActionsGrid.test.tsx`

| #   | Test Case                                                                                 |
| --- | ----------------------------------------------------------------------------------------- |
| 1   | Renders all 4 quick action buttons (New Invoice, Add Stock, New Customer, Record Payment) |
| 2   | Pressing "New Invoice" calls navigation push to invoice create                            |
| 3   | Pressing "Add Stock" calls navigation push to stock-op                                    |
| 4   | Pressing "New Customer" calls navigation push to customer add                             |
| 5   | Pressing "Record Payment" opens PaymentModal or navigates to payments                     |
| 6   | All icons render without crashing (correct icon names)                                    |
| 7   | Buttons disabled when offline (useNetworkStatus returns false)                            |
| 8   | Disabled state shows visual feedback (opacity/color change)                               |

### UNIT-011: `TileSetCard.tsx`

**File:** `src/components/organisms/__tests__/TileSetCard.test.tsx`

| #   | Test Case                                                               |
| --- | ----------------------------------------------------------------------- |
| 1   | Renders design name, category, and current stock                        |
| 2   | Stock displayed in correct unit (boxes)                                 |
| 3   | Low-stock indicator (warning color/icon) visible when stock ≤ threshold |
| 4   | Normal stock renders without warning indicator                          |
| 5   | Out-of-stock (stock=0) renders distinct state                           |
| 6   | Press callback fires with correct item id                               |
| 7   | Renders thumbnail image when imageUrl provided                          |
| 8   | Renders placeholder when no imageUrl                                    |
| 9   | Long design name truncated with ellipsis                                |

### UNIT-012: `ListItem.tsx`

**File:** `src/components/molecules/__tests__/ListItem.test.tsx`

| #   | Test Case                              |
| --- | -------------------------------------- |
| 1   | Renders title and subtitle             |
| 2   | Renders right accessory when provided  |
| 3   | Renders left icon when provided        |
| 4   | onPress callback fires on tap          |
| 5   | Disabled state prevents onPress        |
| 6   | Renders divider line by default        |
| 7   | hideDivider prop hides divider         |
| 8   | Renders badge/chip in right slot       |
| 9   | Long title wraps or truncates per prop |

### UNIT-013: `StatCard.tsx`

**File:** `src/components/molecules/__tests__/StatCard.test.tsx`

| #   | Test Case                                        |
| --- | ------------------------------------------------ |
| 1   | Renders label and value                          |
| 2   | Value formatted as currency when type='currency' |
| 3   | Value formatted as count when type='count'       |
| 4   | Positive trend shows green up arrow              |
| 5   | Negative trend shows red down arrow              |
| 6   | No trend indicator when trend=undefined          |
| 7   | Loading skeleton visible when loading=true       |
| 8   | Zero value renders as '₹0' not empty             |

### UNIT-014: Invoice Creation Feature UI Components

#### UNIT-014a: `CustomerStep.tsx`

**File:** `src/features/invoice-create/__tests__/CustomerStep.test.tsx`

| #   | Test Case                                                            |
| --- | -------------------------------------------------------------------- |
| 1   | Renders customer search input                                        |
| 2   | Typing in search debounces and calls fetchCustomers                  |
| 3   | Customer search results rendered in list                             |
| 4   | Selecting a customer highlights it and calls onSelect callback       |
| 5   | "Add New Customer" button visible and navigates to add customer flow |
| 6   | Empty search results show EmptyState component                       |
| 7   | Search error shows error message                                     |
| 8   | Loading state shows skeleton while searching                         |
| 9   | Previously selected customer shown as pre-selected on re-render      |
| 10  | "Continue" button disabled until customer selected                   |
| 11  | "Continue" button enabled after selection, calls onNext              |
| 12  | Billing address preview shown after selection                        |

#### UNIT-014b: `LineItemsStep.tsx`

**File:** `src/features/invoice-create/__tests__/LineItemsStep.test.tsx`

| #   | Test Case                                                      |
| --- | -------------------------------------------------------------- |
| 1   | Renders initial empty line items with "Add Item" button        |
| 2   | Pressing "Add Item" adds a new empty row                       |
| 3   | Selecting inventory item in row populates design name and rate |
| 4   | Entering quantity calculates line total (qty × rate)           |
| 5   | GST selection changes tax amounts correctly                    |
| 6   | Adding second item shows cumulative total                      |
| 7   | Remove item button removes row and recalculates total          |
| 8   | Attempting qty > available stock shows inline error            |
| 9   | Zero quantity on a row blocks "Continue" with error            |
| 10  | Negative quantity blocked at input level                       |
| 11  | Total summary shows subtotal, CGST, SGST/IGST, grand total     |
| 12  | At least one line item required — "Continue" blocked on empty  |
| 13  | Inventory search within row debounces                          |
| 14  | Out-of-stock items shown greyed out in dropdown                |
| 15  | GST rate auto-populated from inventory item's default GST rate |

#### UNIT-014c: `PaymentStep.tsx`

**File:** `src/features/invoice-create/__tests__/PaymentStep.test.tsx`

| #   | Test Case                                                     |
| --- | ------------------------------------------------------------- |
| 1   | Shows invoice total and "Amount Received" input               |
| 2   | Payment mode selector shows: Cash, UPI, Bank Transfer, Cheque |
| 3   | Selecting "Fully Paid" fills amount = total                   |
| 4   | Partial amount can be entered manually                        |
| 5   | Amount > total shows validation error ("Cannot overpay")      |
| 6   | Amount = 0 allowed (mark as unpaid / credit)                  |
| 7   | Cheque mode shows additional cheque number field              |
| 8   | UPI mode shows UPI reference field                            |
| 9   | Payment date defaults to today                                |
| 10  | Payment date cannot be future                                 |
| 11  | Summary shows: amount due, amount received, balance           |
| 12  | "Create Invoice" button fires onSubmit with correct payload   |
| 13  | Loading spinner shown during creation                         |
| 14  | Error toast on creation failure                               |

#### UNIT-014d: `InvoiceCreateScreen.tsx`

**File:** `src/features/invoice-create/__tests__/InvoiceCreateScreen.test.tsx`

| #   | Test Case                                                                  |
| --- | -------------------------------------------------------------------------- |
| 1   | Renders step 1 (CustomerStep) by default                                   |
| 2   | Progress indicator shows current step (1/3, 2/3, 3/3)                      |
| 3   | Back navigation from step 2 goes back to step 1 with state preserved       |
| 4   | Back navigation from step 1 shows confirmation dialog ("Discard invoice?") |
| 5   | Confirming discard navigates back to invoice list                          |
| 6   | Canceling discard stays on step 1                                          |
| 7   | Completing step 1 advances to step 2 with customer data                    |
| 8   | Completing step 2 advances to step 3 with line items data                  |
| 9   | Successful creation navigates to new invoice detail screen                 |
| 10  | Success toast shown after creation                                         |
| 11  | Hardware back button on Android shows confirmation dialog                  |
| 12  | Screen title updates per step                                              |

### UNIT-015: Missing Atom Components

#### UNIT-015a: `Divider.tsx`

| #   | Test Case                                    |
| --- | -------------------------------------------- |
| 1   | Renders horizontal divider by default        |
| 2   | Vertical divider when orientation='vertical' |
| 3   | Custom color applied via style prop          |
| 4   | Custom thickness applied                     |

#### UNIT-015b: `Screen.tsx`

| #   | Test Case                                |
| --- | ---------------------------------------- |
| 1   | Renders children                         |
| 2   | Applies SafeAreaView insets              |
| 3   | ScrollView wrapping when scrollable=true |
| 4   | KeyboardAvoidingView active on iOS       |
| 5   | Custom background color applied          |

#### UNIT-015c: `ThemedText.tsx`

| #   | Test Case                                       |
| --- | ----------------------------------------------- |
| 1   | Renders children text                           |
| 2   | `variant='h1'` applies correct font size/weight |
| 3   | `variant='body'` applies correct style          |
| 4   | `variant='caption'` applies correct style       |
| 5   | Color prop overrides theme color                |

### UNIT-016: Missing UI Screen Tests

#### UNIT-016a: `customers/[id].tsx` — Customer Detail

| #   | Test Case                                         |
| --- | ------------------------------------------------- |
| 1   | Loads customer data by route param id             |
| 2   | Shows customer name, GSTIN, phone, address        |
| 3   | Shows outstanding balance / credit                |
| 4   | Shows list of recent invoices for this customer   |
| 5   | Edit button navigates to edit form                |
| 6   | Delete button shows confirmation dialog           |
| 7   | Confirming delete navigates back to customer list |
| 8   | Customer not found shows error state              |

#### UNIT-016b: `customers/aging.tsx` — Aging Report

| #   | Test Case                                                                    |
| --- | ---------------------------------------------------------------------------- |
| 1   | Renders customers grouped by overdue duration (0-30, 31-60, 61-90, 90+ days) |
| 2   | Each bucket shows total outstanding amount                                   |
| 3   | Clicking customer row navigates to customer detail                           |
| 4   | Empty state when all accounts are current                                    |
| 5   | Total outstanding shown as summary                                           |

#### UNIT-016c: `finance/index.tsx` — Finance Hub

| #   | Test Case                                                        |
| --- | ---------------------------------------------------------------- |
| 1   | Renders navigation cards for: Expenses, Purchases, Payments, P&L |
| 2   | Each card shows a summary stat (count or total)                  |
| 3   | Pressing Expenses card navigates to expenses screen              |
| 4   | Pressing Payments card navigates to payments screen              |

#### UNIT-016d: `finance/payments.tsx` — Payments List

| #   | Test Case                                                |
| --- | -------------------------------------------------------- |
| 1   | Fetches and renders payment records                      |
| 2   | Each payment shows: date, customer, amount, payment mode |
| 3   | Filter by payment mode (cash, upi, bank, cheque)         |
| 4   | Filter by date range                                     |
| 5   | Search by customer name                                  |
| 6   | Empty state when no payments                             |
| 7   | Total collected shown in header                          |

#### UNIT-016e: `finance/profit-loss.tsx` — P&L Report

| #   | Test Case                                     |
| --- | --------------------------------------------- |
| 1   | Fetches P&L data for current financial year   |
| 2   | Shows Revenue, COGS, Gross Profit, Net Profit |
| 3   | Financial year selector changes data period   |
| 4   | Monthly breakdown chart renders               |
| 5   | Export button triggers share sheet            |
| 6   | Loading state during data fetch               |

#### UNIT-016f: `orders/[id].tsx` — Order Detail

| #   | Test Case                                                                          |
| --- | ---------------------------------------------------------------------------------- |
| 1   | Loads order by id from route params                                                |
| 2   | Shows order items, quantities, customer                                            |
| 3   | "Convert to Invoice" button visible on pending orders                              |
| 4   | Pressing "Convert to Invoice" initiates invoice creation flow with pre-filled data |
| 5   | Already-converted order shows linked invoice number                                |

#### UNIT-016g: `settings/index.tsx` — Settings

| #   | Test Case                                                      |
| --- | -------------------------------------------------------------- |
| 1   | Renders: Business Profile, App Lock, Notifications, About      |
| 2   | Pressing Business Profile navigates to business-profile screen |
| 3   | Pressing App Lock navigates to lock screen                     |
| 4   | App version shown in About section                             |
| 5   | Logout button visible and calls authStore.signOut              |
| 6   | Logout confirmation dialog shown before sign out               |

#### UNIT-016h: `settings/business-profile.tsx` — Business Profile Setup

| #   | Test Case                                                                |
| --- | ------------------------------------------------------------------------ |
| 1   | Loads existing profile if already saved                                  |
| 2   | Pre-fills form with existing data                                        |
| 3   | Editing GSTIN triggers live format validation                            |
| 4   | Invalid GSTIN shows inline error                                         |
| 5   | Logo upload button triggers image picker                                 |
| 6   | Logo preview shown after selection                                       |
| 7   | Save button calls service with correct payload                           |
| 8   | Success toast on save                                                    |
| 9   | Error toast if save fails                                                |
| 10  | Multi-step form: step 1 (basic info), step 2 (address), step 3 (banking) |

#### UNIT-016i: `settings/lock.tsx` — App Lock / Biometrics

| #   | Test Case                                                          |
| --- | ------------------------------------------------------------------ |
| 1   | Shows biometric toggle                                             |
| 2   | Toggle ON initiates biometric enrollment                           |
| 3   | Biometric not available → shows informational message (not toggle) |
| 4   | Toggle OFF disables biometric login                                |
| 5   | On iOS shows "Face ID" label; on Android shows "Fingerprint" label |

#### UNIT-016j: `suppliers/index.tsx` — Suppliers List

| #   | Test Case                                           |
| --- | --------------------------------------------------- |
| 1   | Fetches and renders supplier list                   |
| 2   | Each item shows: name, GSTIN, phone                 |
| 3   | Search by name filters results                      |
| 4   | "Add Supplier" FAB navigates to supplier add screen |
| 5   | Pressing supplier row navigates to [id] screen      |
| 6   | Empty state shown when no suppliers                 |
| 7   | Pull-to-refresh reloads data                        |

#### UNIT-016k: `suppliers/[id].tsx` — Supplier Detail

| #   | Test Case                                   |
| --- | ------------------------------------------- |
| 1   | Loads supplier by id                        |
| 2   | Shows name, GSTIN, contact, address         |
| 3   | Shows list of purchases from this supplier  |
| 4   | Total spend shown                           |
| 5   | Edit supplier button navigates to edit form |
| 6   | Delete supplier shows confirmation          |

#### UNIT-016l: Tab navigation screens

- `(tabs)/inventory.tsx` — assert tab container renders InventoryList, has correct tab bar behavior
- `(tabs)/invoices.tsx` — assert tab container renders InvoiceList
- `(tabs)/more.tsx` — assert menu items: Customers, Suppliers, Finance, Settings, Orders
- `(tabs)/scan.tsx` — assert camera permission prompt; scan result navigates to inventory item

### UNIT-017: `useThemeTokens.ts`

| #   | Test Case                                        |
| --- | ------------------------------------------------ |
| 1   | Returns correct color tokens for 'light' theme   |
| 2   | Returns correct color tokens for 'dark' theme    |
| 3   | Spacing tokens are positive numbers              |
| 4   | Font size tokens are ordered (sm < md < lg < xl) |
| 5   | Hook updates when system theme changes           |

### UNIT-018: `imageTransform.ts`

| #   | Test Case                                                     |
| --- | ------------------------------------------------------------- |
| 1   | Resizes image to max dimension while maintaining aspect ratio |
| 2   | Image already smaller than max → returned unchanged           |
| 3   | Converts PNG to JPEG when format='jpeg'                       |
| 4   | Returns base64 string in correct format                       |
| 5   | Handles null/undefined input gracefully                       |

### UNIT-019: `logger.ts`

| #   | Test Case                                               |
| --- | ------------------------------------------------------- |
| 1   | In `__DEV__=true`, console.log is called                |
| 2   | In `__DEV__=false`, console.log is NOT called           |
| 3   | Error level always logs (even in production)            |
| 4   | Log includes timestamp and level prefix                 |
| 5   | Sensitive keys (password, token) redacted in log output |

---

## Part 4: Integration Test Implementation Plan (Real Supabase — Target: 100% of critical flows)

> **Setup requirement:** All integration tests in this section use a **dedicated test Supabase project** (not production). Each test suite creates data with unique test identifiers and cleans up after `afterAll`. Tests run against `jest.integration.config.js` separately from unit tests via `npm run test:integration`.

> **Environment:** `.env.test` must have `SUPABASE_TEST_URL` and `SUPABASE_TEST_ANON_KEY` pointing to the test project. Integration tests import the real `supabase` client (not the mock).

### INT-001: Authentication Flow

**File:** `__tests__/integration/authFlow.test.ts`

| #   | Test Case                                                 | What's Verified in Real Supabase                           |
| --- | --------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | Sign up with valid email/password                         | New row in `auth.users`, session returned with JWT         |
| 2   | Sign up with already-used email                           | Supabase returns 422, AuthError thrown                     |
| 3   | Sign in with correct credentials                          | Session returned, `access_token` and `refresh_token` valid |
| 4   | Sign in with wrong password                               | Supabase returns 400 with "Invalid login credentials"      |
| 5   | Sign in with non-existent email                           | Same 400 error (no user enumeration)                       |
| 6   | Token refresh — expired access token, valid refresh token | New `access_token` returned                                |
| 7   | Sign out                                                  | Session invalidated on Supabase, local session cleared     |
| 8   | Sign out clears AsyncStorage                              | Re-initializing client returns no session                  |
| 9   | Protected API call with no auth                           | Supabase returns RLS 403, error propagates                 |
| 10  | Password too short (< 8 chars)                            | Supabase validation error returned                         |

### INT-002: Business Profile Setup Flow

**File:** `__tests__/integration/businessProfileFlow.test.ts`

| #   | Test Case                                       | Verified in Real DB                       |
| --- | ----------------------------------------------- | ----------------------------------------- |
| 1   | Create business profile for new user            | Row inserted in `business_profile` table  |
| 2   | Fetch profile for existing user                 | Returns correct profile data              |
| 3   | Update existing profile                         | Row updated, `updated_at` changes         |
| 4   | Create with invalid GSTIN                       | Supabase check constraint rejects insert  |
| 5   | Only one profile per user (unique constraint)   | Second insert throws constraint violation |
| 6   | Fetch profile for user with no profile          | Returns null, no error                    |
| 7   | RLS: User A cannot fetch User B's profile       | Returns null when authenticated as User A |
| 8   | Profile logo URL stored and retrieved correctly | URL string preserved in DB                |

### INT-003: Customer Management Flow

**File:** `__tests__/integration/customerFlow.test.ts`

| #   | Test Case                                       | Verified in Real DB                                                                             |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | Create customer with all fields                 | Row in `customers` table, id returned                                                           |
| 2   | Create customer with minimal fields (name only) | Insert succeeds                                                                                 |
| 3   | Fetch customers list                            | Returns paginated results in correct order                                                      |
| 4   | Search customers by name (partial match)        | ilike filter returns correct subset                                                             |
| 5   | Search customers by GSTIN                       | Exact match search works                                                                        |
| 6   | Fetch customer by id                            | Returns single correct customer                                                                 |
| 7   | Update customer name and phone                  | DB row updated                                                                                  |
| 8   | Delete customer with no invoices                | Row deleted                                                                                     |
| 9   | Delete customer WITH invoices                   | FK constraint violation returned (or soft delete)                                               |
| 10  | Duplicate phone number                          | Insert succeeds (phone is not unique) or fails (if constraint added) — verify actual constraint |
| 11  | RLS: Can only see own user's customers          | Cross-user isolation verified                                                                   |

### INT-004: Inventory Management Flow

**File:** `__tests__/integration/inventoryFlow.test.ts`

| #   | Test Case                                               | Verified in Real DB                                                                 |
| --- | ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | Create inventory item                                   | Row in `inventory_items`, stock=0                                                   |
| 2   | Stock-in operation                                      | `stock_operations` row created, `inventory_items.stock_quantity` incremented by RPC |
| 3   | Stock-out operation                                     | `stock_operations` row created, stock decremented                                   |
| 4   | Stock-out more than available → DB check constraint     | Error returned, stock unchanged                                                     |
| 5   | Fetch inventory list (no filter)                        | Returns all items for user                                                          |
| 6   | Fetch with category filter                              | Returns correct subset                                                              |
| 7   | Fetch with design name search                           | ilike filter works                                                                  |
| 8   | Fetch low stock items (stock ≤ threshold)               | Correct items returned                                                              |
| 9   | Update item rate                                        | DB updated                                                                          |
| 10  | Delete item with no stock operations                    | Row deleted                                                                         |
| 11  | Delete item WITH stock operations                       | FK constraint or soft delete behavior verified                                      |
| 12  | Concurrent stock-out: two simultaneous ops on same item | Final stock is consistent (no race condition lost update)                           |
| 13  | Stock quantity fractional (2.5 boxes)                   | Stored and retrieved as decimal                                                     |

### INT-005: Invoice Creation Flow (extends existing)

**File:** `__tests__/integration/invoiceCreationFlow.test.ts` _(extend existing file)_

Existing tests cover happy path. Add:

| #   | Test Case                                                      | Verified in Real DB                                                           |
| --- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 4   | Create invoice — intra-state GST (CGST+SGST)                   | `invoice_line_items.cgst_amount` and `sgst_amount` populated, `igst_amount=0` |
| 5   | Create invoice — inter-state GST (IGST)                        | `igst_amount` populated, cgst/sgst = 0                                        |
| 6   | Create invoice with zero-rated line item                       | Tax = 0 on that line                                                          |
| 7   | Create invoice → stock auto-deducted                           | `inventory_items.stock_quantity` decremented atomically                       |
| 8   | Invoice number format: TM/YYYY-YY/NNNN                         | Generated number matches format                                               |
| 9   | Sequential invoice numbers                                     | Second invoice number = first + 1                                             |
| 10  | Financial year rollover: invoice after April 1 resets sequence | Sequence resets to 0001                                                       |
| 11  | Invoice creation fails midway (simulate DB constraint)         | Rollback: no invoice, no line items, stock unchanged                          |
| 12  | Create invoice with insufficient stock                         | RPC returns error, nothing committed                                          |
| 13  | GST reverse charge invoice                                     | `reverse_charge=true` in DB                                                   |
| 14  | Invoice with discount                                          | Discount amount stored, totals correct                                        |
| 15  | Fetch invoice list with all filters (date, status, customer)   | Correct filtering                                                             |
| 16  | Fetch invoice by id includes line items                        | Joins work, full object returned                                              |

### INT-006: Payment Recording Flow (extends existing)

**File:** `__tests__/integration/paymentRecordingFlow.test.ts` _(extend)_

Add:

| #   | Test Case                                            | Verified in Real DB                      |
| --- | ---------------------------------------------------- | ---------------------------------------- |
| 4   | Full payment: invoice status changes to 'paid'       | `invoices.payment_status = 'paid'` in DB |
| 5   | Partial payment: status = 'partial', balance updated | `payment_status = 'partial'`             |
| 6   | Second payment covering remainder: status = 'paid'   | Status transitions correctly             |
| 7   | Payment amount > outstanding → DB RPC rejects        | Error returned, no state change          |
| 8   | Two payments race condition                          | Final total is consistent                |
| 9   | Payment with cheque number stored                    | `payments.reference_number` populated    |
| 10  | Fetch payments filtered by customer_id               | Returns correct payments                 |
| 11  | Fetch payments filtered by date range                | Returns correct payments                 |
| 12  | Payment direction='paid' (to supplier)               | Stored with correct direction            |

### INT-007: Order Import Flow

**File:** `__tests__/integration/orderImportFlow.test.ts`

| #   | Test Case                                                                       | Verified in Real DB              |
| --- | ------------------------------------------------------------------------------- | -------------------------------- |
| 1   | Parse CSV with correct headers → creates order records                          | Rows in `orders` table           |
| 2   | CSV with extra/unknown columns → ignored gracefully                             |
| 3   | CSV with missing required column (design_name) → validation error before insert |
| 4   | Duplicate order detection (same CSV uploaded twice)                             | No duplicate rows (idempotent)   |
| 5   | Large CSV (500 rows) completes without timeout                                  |
| 6   | PDF order parsed via Edge Function (parse-order-pdf) → data returned            | Real Edge Function invoked       |
| 7   | Convert order to invoice: invoice created with order's line items               | invoice row and line items in DB |
| 8   | Converted order shows link to invoice_id                                        | `orders.invoice_id` populated    |
| 9   | Fetch orders list with status filter (pending, converted)                       |
| 10  | Fetch order by id returns full detail                                           |

### INT-008: Expense / Purchase Recording Flow

**File:** `__tests__/integration/expenseFlow.test.ts`

| #   | Test Case                                        | Verified in Real DB                    |
| --- | ------------------------------------------------ | -------------------------------------- |
| 1   | Create expense (category=utilities, no supplier) | Row in `expenses`                      |
| 2   | Create purchase order (with supplier_id)         | Row in `expenses` or `purchase_orders` |
| 3   | Fetch expenses filtered by date range            |
| 4   | Fetch expenses filtered by category              |
| 5   | Update expense description/amount                |
| 6   | Delete expense                                   |
| 7   | Total expenses for month computed correctly      |
| 8   | Expense with GST: input tax credit recorded      |

### INT-009: Dashboard Stats Flow

**File:** `__tests__/integration/dashboardStatsFlow.test.ts`

| #   | Test Case                                                                                 | Verified in Real DB |
| --- | ----------------------------------------------------------------------------------------- | ------------------- |
| 1   | `get_dashboard_stats` RPC returns correct today_sales after creating an invoice for today |
| 2   | `outstanding_credit` matches sum of unpaid invoices                                       |
| 3   | `invoice_count_today` increments after creating invoice                                   |
| 4   | `low_stock_count` matches items with stock ≤ threshold                                    |
| 5   | Stats are user-isolated (User A's stats don't include User B's data)                      |
| 6   | Dashboard with zero data (new user) returns 0s, no errors                                 |
| 7   | Stats after payment received: outstanding_credit decrements                               |

### INT-010: Notification Flow

**File:** `__tests__/integration/notificationFlow.test.ts`

| #   | Test Case                                                                           | Verified in Real DB |
| --- | ----------------------------------------------------------------------------------- | ------------------- |
| 1   | Stock-out that drops below threshold triggers DB trigger → notification row created |
| 2   | Fetch unread notifications returns newly created notification                       |
| 3   | Mark one notification as read → `read=true` in DB                                   |
| 4   | Mark all as read → all rows for user have `read=true`                               |
| 5   | Realtime subscription: new notification pushed to client without polling            |

### INT-011: Report Generation Flow

**File:** `__tests__/integration/reportFlow.test.ts`

| #   | Test Case                                                                     | Verified in Real DB |
| --- | ----------------------------------------------------------------------------- | ------------------- |
| 1   | GSTR-1 report — fetches correct invoices for period                           |
| 2   | GSTR-1 export CSV — structure matches GST return format (B2B, B2C sections)   |
| 3   | P&L report — revenue = sum of paid invoices, expenses = sum of expense rows   |
| 4   | Monthly revenue chart data — 12 data points for financial year                |
| 5   | Financial year boundary: April 1 cutoff correct                               |
| 6   | PDF export — `expo-print` receives correct HTML (integration with mock print) |

---

## Part 5: E2E Test Implementation Plan (Maestro — Target: 100% of critical journeys)

> **Setup requirement:** E2E tests run against a staging environment connected to the test Supabase project. A seed script populates baseline data (one user, sample customers, inventory items) before each run. Maestro YAML files live in `.maestro/`. Run via `npm run test:e2e`.

### E2E-001: Authentication Flows

**File:** `.maestro/auth_login.yaml`

| Journey                    | Steps                                                                             |
| -------------------------- | --------------------------------------------------------------------------------- |
| Login — success            | Launch app → fill email + password → tap Sign In → assert Dashboard visible       |
| Login — wrong password     | Fill wrong password → tap Sign In → assert error toast "Invalid credentials"      |
| Login — empty fields       | Tap Sign In with empty fields → assert inline validation errors                   |
| Session persistence        | Login → background app → foreground app → assert still on Dashboard (no re-login) |
| Logout                     | Dashboard → More tab → Settings → Logout → confirm → assert Login screen shown    |
| Session expiry (simulated) | Clear stored session → open app → assert redirected to Login                      |

**File:** `.maestro/auth_signup.yaml`

| Journey                         | Steps                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| New user signup                 | Fill email + password on signup → tap Register → assert Business Profile Setup shown |
| Signup → Business profile setup | Complete signup → fill GSTIN + business name → tap Save → assert Dashboard           |
| Duplicate email                 | Signup with existing email → assert error toast                                      |

### E2E-002: Dashboard

**File:** `.maestro/dashboard_full.yaml` _(replace existing minimal flow)_

| Journey                        | Steps                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------- |
| Dashboard loads with real data | Assert: Today's Sales shows correct ₹ amount (matches seeded invoices)       |
| Dashboard KPI cards tappable   | Tap "Outstanding Credit" card → assert navigates to payments/invoices screen |
| Pull-to-refresh                | Pull down on dashboard → assert loading indicator → data reloads             |
| Low stock alert visible        | Assert low-stock count matches seeded items                                  |
| Quick action: New Invoice      | Tap "New Invoice" quick action → assert CustomerStep screen shown            |
| Quick action: Add Stock        | Tap "Add Stock" → assert Stock Operation screen                              |
| Recent invoices list           | Assert at least 3 recent invoices visible in list                            |
| Recent invoice tap             | Tap invoice row → assert Invoice Detail screen                               |

### E2E-003: Invoice Creation — Full Wizard

**File:** `.maestro/invoice_create_full.yaml` _(replace existing)_

| Journey                         | Steps                                                                                                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Complete happy path             | Step 1: Search + select customer → Step 2: Add 2 line items with different GST → Step 3: Enter payment → tap Create → assert success screen → invoice appears in list |
| Back navigation preserves state | Go to step 2 → tap back → assert customer still selected → re-select items → assert items still filled                                                                |
| Discard invoice                 | Step 1 → tap back → assert discard dialog → confirm → assert Invoice List                                                                                             |
| Cancel discard                  | Step 1 → tap back → cancel discard → assert still on Step 1                                                                                                           |
| Stock insufficient              | Attempt to create invoice with qty > stock → assert error on line item step                                                                                           |
| Partial payment                 | Enter partial amount in step 3 → create → assert invoice status = "Partial"                                                                                           |
| Unpaid invoice                  | Enter 0 amount → create → assert status = "Unpaid"                                                                                                                    |
| Invoice detail after creation   | Create invoice → navigate to detail → assert all amounts, customer, line items correct                                                                                |
| Inter-state invoice             | Select inter-state customer → line items show IGST, not CGST/SGST                                                                                                     |

### E2E-004: Invoice List & Detail

**File:** `.maestro/invoice_list_detail.yaml`

| Journey                         | Steps                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| Filter by status                | Tap "Unpaid" filter → assert only unpaid invoices shown                                   |
| Filter by date range            | Set custom date range → assert filtered results                                           |
| Search by customer              | Type customer name → assert filtered results                                              |
| Invoice detail shows line items | Open invoice → assert line item table visible with correct values                         |
| Invoice detail — GST breakdown  | Open invoice → scroll to tax summary → assert CGST/SGST/IGST amounts                      |
| Record payment from detail      | Open unpaid invoice → tap "Record Payment" → fill amount → submit → assert status updated |
| PDF export from detail          | Open invoice → tap Share/PDF → assert share sheet opens (expo-sharing called)             |

### E2E-005: Inventory Management

**File:** `.maestro/inventory_management.yaml`

| Journey                     | Steps                                                                           |
| --------------------------- | ------------------------------------------------------------------------------- |
| Browse inventory            | Open Inventory tab → assert list of tile designs with stock counts              |
| Add new item                | Tap FAB → fill design name, category, rate → save → assert item in list         |
| Item detail                 | Tap inventory item → assert name, stock, operations history visible             |
| Stock-in operation          | Item detail → tap "Stock In" → enter quantity → save → assert stock increased   |
| Stock-out operation         | Item detail → tap "Stock Out" → enter valid qty → save → assert stock decreased |
| Stock-out exceeds available | Attempt stock-out with qty > stock → assert error message                       |
| Low stock visual indicator  | Item with stock ≤ threshold → assert warning badge visible                      |
| Search inventory            | Type design name in search → assert filtered results                            |
| Filter by category          | Select category chip → assert only that category shown                          |
| Edit item rate              | Item detail → edit rate → save → assert new rate displayed                      |
| Delete item                 | Item detail → delete → confirm → assert item removed from list                  |

### E2E-006: Customer Management

**File:** `.maestro/customer_management.yaml`

| Journey              | Steps                                                              |
| -------------------- | ------------------------------------------------------------------ |
| Browse customers     | Customers tab → assert list visible                                |
| Add customer         | Tap FAB → fill name, phone, GSTIN → save → assert customer in list |
| Invalid GSTIN on add | Fill invalid GSTIN → assert inline error                           |
| Customer detail      | Tap customer → assert name, contact, outstanding balance           |
| Customer invoices    | Customer detail → assert recent invoices for this customer         |
| Edit customer        | Customer detail → edit → change phone → save → assert updated      |
| Search customer      | Type partial name → assert filtered results                        |
| Aging report         | More → Finance → Customers Aging → assert grouped by days overdue  |

### E2E-007: Payments

**File:** `.maestro/payments.yaml`

| Journey                             | Steps                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| Record payment — cash               | Invoice detail → Record Payment → Cash mode → amount → save → status updated |
| Record payment — UPI with reference | UPI mode → fill UPI ref → save                                               |
| Record payment — cheque             | Cheque mode → fill cheque number → save                                      |
| Partial then full payment           | Record 50% → status Partial → record remaining → status Paid                 |
| Payments list                       | Finance → Payments → assert list of all payments                             |
| Filter payments by mode             | Select "Cash" filter → only cash payments                                    |
| Payment cannot exceed balance       | Enter amount > balance → assert error                                        |

### E2E-008: Expense & Finance

**File:** `.maestro/finance.yaml`

| Journey            | Steps                                                                     |
| ------------------ | ------------------------------------------------------------------------- |
| Log expense        | Finance → Expenses → Add → fill amount, category → save → appears in list |
| Log purchase order | Finance → Purchases → Add → fill supplier, amount → save                  |
| P&L report         | Finance → P&L → assert revenue, expense, profit numbers visible           |
| Filter P&L by year | Change financial year → assert different data                             |
| Export report      | P&L → Export → assert share sheet triggered                               |

### E2E-009: Order Import

**File:** `.maestro/order_import.yaml`

| Journey                  | Steps                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------- |
| Import from CSV          | Orders → Import → pick CSV file → map columns → import → assert orders in list         |
| Import from PDF          | Orders → Import → pick PDF → wait for parse → review → confirm → assert orders in list |
| Convert order to invoice | Order detail → Convert to Invoice → assert invoice create wizard pre-filled            |
| Invalid CSV format       | Import malformed CSV → assert error message                                            |

### E2E-010: Settings & Business Profile

**File:** `.maestro/settings.yaml`

| Journey                                   | Steps                                                       |
| ----------------------------------------- | ----------------------------------------------------------- |
| View business profile                     | Settings → Business Profile → assert pre-filled data        |
| Edit business name                        | Change name → save → assert update toast → verify in header |
| Upload logo                               | Tap logo → pick image → assert preview → save               |
| Enable app lock (biometric)               | Settings → App Lock → enable → assert confirmation          |
| Re-enter app after background (biometric) | Background → foreground → assert biometric prompt on iOS    |

### E2E-011: Offline Behavior

**File:** `.maestro/offline_mode.yaml`

| Journey                  | Steps                                                                     |
| ------------------------ | ------------------------------------------------------------------------- |
| Offline banner visible   | Disable device network → app shows offline banner                         |
| Creating invoice offline | Tap New Invoice → assert error or queued state (define expected behavior) |
| Inventory browse offline | List still shows cached data offline                                      |
| Reconnect sync           | Re-enable network → assert data reloads, banner disappears                |

### E2E-012: Navigation & Tab Flows

**File:** `.maestro/navigation.yaml`

| Journey                     | Steps                                                               |
| --------------------------- | ------------------------------------------------------------------- |
| All bottom tabs reachable   | Tap each tab → assert correct screen renders                        |
| Deep link to invoice detail | Navigate via deep link to `/invoices/[id]` → assert correct invoice |
| Back stack works            | Navigate 3 levels deep → back button returns to each level          |
| Rapid tab switching         | Tap tabs quickly → no crash, correct screen shown                   |

---

## Part 6: Database Test Implementation Plan (pgTAP / SQL — Target: 100% of RPCs and triggers)

> **Setup:** These run via `supabase test db` against a local Supabase instance (`supabase start`). They use `pgTAP` for assertions. Located in `supabase/tests/`.

### DB-001: `01_stock_operation.sql` _(extend existing)_

| #        | Test Case                                                                        |
| -------- | -------------------------------------------------------------------------------- |
| Existing | stock_in increases quantity                                                      |
| Existing | stock_out decreases quantity                                                     |
| Add      | Concurrent stock_out: use advisory locks, verify final quantity                  |
| Add      | Stock-out triggers low_stock notification when quantity ≤ threshold              |
| Add      | Stock-out exactly to 0 allowed                                                   |
| Add      | Stock-out below 0 rejected by check constraint                                   |
| Add      | stock_operation row captures: user_id, timestamp, operation_type, delta_quantity |
| Add      | Audit log row created for each operation                                         |

### DB-002: `02_invoice_creation.sql` _(extend existing)_

| #        | Test Case                                                                |
| -------- | ------------------------------------------------------------------------ |
| Existing | Invoice created with line items atomically                               |
| Add      | Invoice number format: `TM/YYYY-YY/NNNN`                                 |
| Add      | Invoice sequence auto-increments per user per financial year             |
| Add      | New FY resets sequence to 0001                                           |
| Add      | Rollback on constraint violation: verify nothing committed               |
| Add      | Stock deducted for each line item (check inventory_items.stock_quantity) |
| Add      | Insufficient stock triggers rollback                                     |
| Add      | GST amounts (cgst, sgst, igst) computed and stored correctly             |
| Add      | Reverse charge flag stored correctly                                     |
| Add      | RLS: can only create invoices for own user_id                            |

### DB-003: `03_dashboard_stats.sql` _(extend existing)_

| #        | Test Case                                             |
| -------- | ----------------------------------------------------- |
| Existing | today_sales correct                                   |
| Add      | outstanding_credit = SUM of unpaid + partial invoices |
| Add      | outstanding_credit excludes paid invoices             |
| Add      | invoice_count_today counts only today's invoices      |
| Add      | low_stock_count uses configurable threshold           |
| Add      | Stats scoped to authenticated user only (RLS)         |
| Add      | Materialized view refresh correctness                 |

### DB-004: `04_payment_recording.sql` _(extend existing)_

| #        | Test Case                                               |
| -------- | ------------------------------------------------------- |
| Existing | Payment recorded and invoice status updated             |
| Add      | Full payment → status = 'paid'                          |
| Add      | Partial payment → status = 'partial'                    |
| Add      | Second payment completing the balance → status = 'paid' |
| Add      | Overpayment rejected at DB level                        |
| Add      | RLS: cannot record payment on another user's invoice    |
| Add      | Audit log row created for payment                       |

### DB-005: `05_rls_policies.sql` _(new)_

| #   | Test Case                                                          |
| --- | ------------------------------------------------------------------ |
| 1   | User A cannot SELECT invoices belonging to User B                  |
| 2   | User A cannot INSERT invoice with user_id = User B                 |
| 3   | User A cannot UPDATE User B's inventory                            |
| 4   | User A cannot DELETE User B's customers                            |
| 5   | Unauthenticated request to any table returns 0 rows (not 403 leak) |
| 6   | business_profile: only owner can read/write                        |
| 7   | Service role key bypasses RLS (used in edge functions)             |

### DB-006: `06_notifications.sql` _(new)_

| #   | Test Case                                                                 |
| --- | ------------------------------------------------------------------------- |
| 1   | Trigger fires when stock_quantity ≤ low_stock_threshold                   |
| 2   | Trigger does NOT fire when stock > threshold                              |
| 3   | Notification row contains: user_id, type='low_stock', item_id, read=false |
| 4   | Marking notification as read updates read=true                            |
| 5   | Marking all as read updates all rows for user                             |

### DB-007: `07_audit_log.sql` _(new)_

| #   | Test Case                                                              |
| --- | ---------------------------------------------------------------------- |
| 1   | Create invoice → audit_log row with action='create', table='invoices'  |
| 2   | Update customer → audit_log row with action='update', old/new values   |
| 3   | Delete inventory item → audit_log row with action='delete'             |
| 4   | Audit log not writable by regular users (RLS: insert only via trigger) |
| 5   | audit_log.user_id matches authenticated user                           |

### DB-008: `08_materialized_views.sql` _(new)_

| #   | Test Case                                                         |
| --- | ----------------------------------------------------------------- |
| 1   | monthly_revenue view returns 12 rows for current FY               |
| 2   | Revenue month matches invoice date month                          |
| 3   | REFRESH MATERIALIZED VIEW completes without error                 |
| 4   | View updates correctly after new invoice inserted (after refresh) |

---

## Part 7: Implementation Sequence & Phases

### Phase 0 — Infrastructure (Week 1)

1. FIX-001: Move gstCalculator.test.ts + verify Jest discovery
2. FIX-002: Create `jest.integration.config.js` + `.env.test` + `package.json` scripts
3. FIX-003: Add coverage check to CI (`npm run test:coverage`)
4. FIX-004: Fix `.then()` mock pattern in existing tests
5. Set up test Supabase project (free tier, separate from production)
6. Write seed script for integration/E2E data (`scripts/seed-test-data.ts`)
7. Write cleanup hooks (`afterAll` helpers in `__tests__/utils/integrationHelpers.ts`)

### Phase 1 — Critical Unit Tests (Week 1–2)

**Priority: Business logic correctness**

- UNIT-001: `gstCalculator.ts` (all 15 cases)
- UNIT-002: `validation.ts` (all 15 cases)
- UNIT-003: `createPaginatedStore.ts` (all 14 cases)
- UNIT-014a–d: All 4 invoice creation UI components

### Phase 2 — Repository & Store Completion (Week 2)

- UNIT-004: notificationRepository
- UNIT-005: notificationStore
- UNIT-006: supplierRepository
- UNIT-007: businessProfile.schema
- UNIT-008: expense.schema

### Phase 3 — Component Coverage (Week 2–3)

- UNIT-009–013: DashboardHeader, QuickActionsGrid, TileSetCard, ListItem, StatCard
- UNIT-015a–c: Divider, Screen, ThemedText
- UNIT-017–019: useThemeTokens, imageTransform, logger

### Phase 4 — Missing Screen Tests (Week 3)

- UNIT-016a–l: All 13 missing screen tests

### Phase 5 — Integration Tests with Real Supabase (Week 3–4)

- INT-001: Auth flow (all 10 cases)
- INT-002: Business profile (all 8 cases)
- INT-003: Customer flow (all 11 cases)
- INT-004: Inventory flow (all 13 cases)
- INT-005: Invoice creation extended (12 new cases)
- INT-006: Payment extended (9 new cases)
- INT-007: Order import (10 cases)
- INT-008: Expense flow (8 cases)
- INT-009: Dashboard stats (7 cases)
- INT-010: Notification flow (5 cases)
- INT-011: Report generation (6 cases)

### Phase 6 — E2E Tests with Maestro (Week 4–5)

- E2E-001: Auth login + signup
- E2E-002: Dashboard full
- E2E-003: Invoice creation wizard (replace existing)
- E2E-004: Invoice list + detail
- E2E-005: Inventory management
- E2E-006: Customer management
- E2E-007: Payments
- E2E-008: Finance & expenses
- E2E-009: Order import
- E2E-010: Settings & business profile
- E2E-011: Offline behavior
- E2E-012: Navigation

### Phase 7 — Database Tests (Week 5)

- DB-001 to DB-008: All 8 suites
- Run via `supabase test db`

---

## Part 8: Target Coverage Thresholds (Post-Implementation)

Update `jest.config.js` to enforce:

```javascript
coverageThreshold: {
  global: {
    branches: 90,
    functions: 95,
    lines: 95,
    statements: 95,
  },
  './src/services/': { lines: 100, branches: 95 },
  './src/repositories/': { lines: 100, branches: 95 },
  './src/utils/': { lines: 100, branches: 95 },
  './src/schemas/': { lines: 100, branches: 95 },
  './src/stores/': { lines: 95, branches: 90 },
},
```

---

## Part 9: Test File Naming & Location Conventions

```
src/
  utils/
    gstCalculator.ts
    gstCalculator.test.ts        ← co-located unit test

  stores/
    createPaginatedStore.ts
    __tests__/
      createPaginatedStore.test.ts

  features/invoice-create/
    CustomerStep.tsx
    __tests__/
      CustomerStep.test.tsx

__tests__/
  integration/                   ← Real Supabase (jest.integration.config.js)
    authFlow.test.ts
    customerFlow.test.ts
    ...

  ui/                            ← Mocked Supabase (jest.config.js)
    customers/[id].test.tsx
    finance/payments.test.tsx
    ...

supabase/tests/                  ← pgTAP SQL (supabase test db)
  01_stock_operation.sql
  05_rls_policies.sql
  ...

.maestro/                        ← Maestro E2E YAML
  auth_login.yaml
  inventory_management.yaml
  ...
```

---

## Part 10: Test Data Strategy

### Seed data for E2E / Integration

`scripts/seed-test-data.ts` creates:

- 1 test user: `test@tilemaster.dev` / `TestPass123!`
- Business profile: Rupesh Tiles, GSTIN `27AABCU9603R1ZX`
- 5 customers (mix of GSTIN and non-GSTIN, intra + inter-state)
- 10 inventory items (2 low-stock, 1 out-of-stock, variety of categories)
- 5 invoices (mix of paid/partial/unpaid)
- 3 payments
- 2 suppliers
- 3 expenses

### Cleanup strategy

Each integration test uses a unique `test_run_id = uuid()` prefix on created data names. `afterAll` deletes all rows where name starts with `test_run_id`.

```typescript
// __tests__/utils/integrationHelpers.ts
const TEST_PREFIX = `e2e-${Date.now()}-`;

export function testName(base: string) {
	return `${TEST_PREFIX}${base}`;
}

export async function cleanupTestData(supabase: SupabaseClient) {
	await supabase.from('invoices').delete().like('notes', `${TEST_PREFIX}%`);
	await supabase.from('customers').delete().like('name', `${TEST_PREFIX}%`);
	// ... etc
}
```

---

## Summary: What Needs to Be Built

| Category                                        | New Test Files     | New Test Cases          |
| ----------------------------------------------- | ------------------ | ----------------------- |
| Unit — Utils (gst, validation, logger, image)   | 4                  | ~55                     |
| Unit — Stores (paginated, notification)         | 2                  | ~21                     |
| Unit — Repos (supplier, notification)           | 2                  | ~15                     |
| Unit — Schemas (businessProfile, expense)       | 2                  | ~20                     |
| Unit — Components (6 components)                | 6                  | ~45                     |
| Unit — Feature UI (4 invoice wizard components) | 4                  | ~47                     |
| Unit — Screens (13 missing screens)             | 13                 | ~90                     |
| Unit — Hooks (1 missing)                        | 1                  | ~5                      |
| Integration (Real Supabase)                     | 8 new + 2 extended | ~95                     |
| E2E Maestro (10 new flows)                      | 10                 | ~65 journeys            |
| Database pgTAP (4 new + 4 extended)             | 4 new              | ~40                     |
| **TOTAL**                                       | **~58 new files**  | **~498 new test cases** |

---

_All integration and E2E tests hit the real Supabase test project. No mock substitutes for network behavior, RLS policies, RPC atomicity, or trigger execution. The mock Supabase in `jest.setup.ts` is strictly for unit tests only._
