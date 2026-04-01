# Test Coverage Analysis — TileMaster Application

**Generated:** 2026-03-31
**Framework:** Jest v29.7.0 (jest-expo preset) + Maestro for E2E
**Total Test Files:** 78
**Total Source Files:** ~104 (non-test)

---

## 1. Overall Coverage by Test Type

| Test Type         | Files   | % of Total Tests | Coverage of Source   |
| ----------------- | ------- | ---------------- | -------------------- |
| Unit Tests        | 58      | 74%              | ~54% of source files |
| Component Tests   | 13      | 17%              | ~54% of components   |
| Integration Tests | 3       | 4%               | 3 critical flows     |
| UI Tests (Screen) | 16      | 21%              | ~80% of screens      |
| E2E (Maestro)     | 2 flows | —                | 2 user journeys      |

> **Overall source file coverage (has a test file): ~54% (56/104 files)**

---

## 2. Coverage by Layer

### Services — 100% ✅

All 12 service files have dedicated test files.

| Service                | Test File                      | Status |
| ---------------------- | ------------------------------ | ------ |
| authService            | authService.test.ts            | ✅     |
| businessProfileService | businessProfileService.test.ts | ✅     |
| customerService        | customerService.test.ts        | ✅     |
| dashboardService       | dashboardService.test.ts       | ✅     |
| exportService          | exportService.test.ts          | ✅     |
| financeService         | financeService.test.ts         | ✅     |
| inventoryService       | inventoryService.test.ts       | ✅     |
| invoiceService         | invoiceService.test.ts         | ✅     |
| orderService           | orderService.test.ts           | ✅     |
| paymentService         | paymentService.test.ts         | ✅     |
| pdfService             | pdfService.test.ts             | ✅     |
| reportService          | reportService.test.ts          | ✅     |

### Repositories — 73% ⚠️

8 of 11 repositories have tests.

| Repository             | Status     |
| ---------------------- | ---------- |
| baseRepository         | ✅         |
| customerRepository     | ✅         |
| expenseRepository      | ✅         |
| financeRepository      | ✅         |
| inventoryRepository    | ✅         |
| invoiceRepository      | ✅         |
| orderRepository        | ✅         |
| paymentRepository      | ✅         |
| notificationRepository | ❌ MISSING |
| supplierRepository     | ❌ MISSING |
| index (barrel)         | ❌ N/A     |

### Stores — 78% ⚠️

7 of 9 store files have tests.

| Store                | Status     |
| -------------------- | ---------- |
| authStore            | ✅         |
| customerStore        | ✅         |
| dashboardStore       | ✅         |
| financeStore         | ✅         |
| inventoryStore       | ✅         |
| invoiceStore         | ✅         |
| orderStore           | ✅         |
| createPaginatedStore | ❌ MISSING |
| notificationStore    | ❌ MISSING |

### Components — 54% ⚠️

13 of 21 component files have tests.

#### Atoms — 73% (8/11)

| Component     | Status     |
| ------------- | ---------- |
| Badge         | ✅         |
| Button        | ✅         |
| Card          | ✅         |
| Chip          | ✅         |
| ErrorBoundary | ✅         |
| OfflineBanner | ✅         |
| QueryBoundary | ✅         |
| TextInput     | ✅         |
| Divider       | ❌ MISSING |
| Screen        | ❌ MISSING |
| ThemedText    | ❌ MISSING |

#### Molecules — 60% (3/5)

| Component  | Status     |
| ---------- | ---------- |
| EmptyState | ✅         |
| FormField  | ✅         |
| SearchBar  | ✅         |
| ListItem   | ❌ MISSING |
| StatCard   | ❌ MISSING |

#### Organisms — 40% (2/5)

| Component          | Status     |
| ------------------ | ---------- |
| PaymentModal       | ✅         |
| RecentInvoicesList | ✅         |
| DashboardHeader    | ❌ MISSING |
| QuickActionsGrid   | ❌ MISSING |
| TileSetCard        | ❌ MISSING |

### Hooks — 83% ✅

5 of 6 hooks have tests.

| Hook              | Status     |
| ----------------- | ---------- |
| useConfirmBack    | ✅         |
| useDebounce       | ✅         |
| useLocale         | ✅         |
| useNetworkStatus  | ✅         |
| useRefreshOnFocus | ✅         |
| useThemeTokens    | ❌ MISSING |

### Utils — 60% ⚠️

6 of 10 utility files have tests.

| Utility        | Status                                   |
| -------------- | ---------------------------------------- |
| color          | ✅                                       |
| currency       | ✅                                       |
| dateUtils      | ✅                                       |
| html           | ✅                                       |
| itemNameParser | ✅                                       |
| retry          | ✅                                       |
| gstCalculator  | ❌ MISSING (test file in wrong location) |
| imageTransform | ❌ MISSING                               |
| logger         | ❌ MISSING                               |
| validation     | ❌ MISSING                               |

### Schemas — 57% ⚠️

4 of 7 schema files have tests.

| Schema          | Status     |
| --------------- | ---------- |
| customer        | ✅         |
| inventory       | ✅         |
| invoice         | ✅         |
| payment         | ✅         |
| businessProfile | ❌ MISSING |
| expense         | ❌ MISSING |
| index (barrel)  | ❌ N/A     |

### Features — 20% ❌

Only 1 of 5 feature files (the hook) has a test. UI components are untested.

| Feature File         | Status     |
| -------------------- | ---------- |
| useInvoiceCreateFlow | ✅         |
| CustomerStep         | ❌ MISSING |
| InvoiceCreateScreen  | ❌ MISSING |
| LineItemsStep        | ❌ MISSING |
| PaymentStep          | ❌ MISSING |

---

## 3. Integration Tests (3 flows) — Partial ⚠️

Located in `__tests__/integration/`:

| Flow                           | What's Tested                                                 | What's Missing                                 |
| ------------------------------ | ------------------------------------------------------------- | ---------------------------------------------- |
| `invoiceCreationFlow.test.ts`  | Store → Service → Repository → Supabase RPC, eventBus refresh | Negative flows, partial failures               |
| `paymentRecordingFlow.test.ts` | Payment recording workflow                                    | Error paths, duplicate prevention              |
| `stockOperationFlow.test.ts`   | stock_in / stock_out RPC, store state updates                 | Low stock notifications, validation edge cases |

**Missing Integration Flows:**

- Customer creation flow
- Order import flow
- Expense recording flow
- Business profile setup flow
- Auth session refresh flow

---

## 4. E2E Tests (Maestro) — Minimal ❌

Located in `.maestro/`:

| Flow File                   | Covers                                             |
| --------------------------- | -------------------------------------------------- |
| `create_invoice_flow.yaml`  | Launch → Invoices → 4-step create wizard → success |
| `dashboard_visibility.yaml` | Dashboard initial load and widget visibility       |

**Missing E2E Flows (critical user journeys with no coverage):**

- Login / logout / session expiry
- Inventory add + stock operation
- Customer create + search
- Payment recording from invoice
- Report generation and export
- Order import from CSV
- Offline mode behavior
- PDF generation and sharing

---

## 5. Screen-Level UI Tests — ~80% ✅

Located in `__tests__/ui/`, covering expo-router screens:

| Screen            | Test File                   | Status     |
| ----------------- | --------------------------- | ---------- |
| Login             | auth/login.test.tsx         | ✅         |
| Setup             | auth/setup.test.tsx         | ✅         |
| Customer List     | customers/index.test.tsx    | ✅         |
| Add Customer      | customers/add.test.tsx      | ✅         |
| Dashboard         | dashboard/index.test.tsx    | ✅         |
| Expenses          | finance/expenses.test.tsx   | ✅         |
| Purchases         | finance/purchases.test.tsx  | ✅         |
| Inventory List    | inventory/list.test.tsx     | ✅         |
| Inventory Details | inventory/[id].test.tsx     | ✅         |
| Add Inventory     | inventory/add.test.tsx      | ✅         |
| Stock Operation   | inventory/stock-op.test.tsx | ✅         |
| Invoice List      | invoices/list.test.tsx      | ✅         |
| Invoice Details   | invoices/[id].test.tsx      | ✅         |
| Create Invoice    | invoices/create.test.tsx    | ✅         |
| Order Import      | orders/import.test.tsx      | ✅         |
| Orders List       | orders/index.test.tsx       | ✅         |
| Supplier screens  | —                           | ❌ MISSING |
| Reports screen    | —                           | ❌ MISSING |
| Profile/Settings  | —                           | ❌ MISSING |
| Notifications     | —                           | ❌ MISSING |

---

## 6. What's Well-Covered ✅

1. **All 12 services** — comprehensive unit tests with Supabase mocked at the boundary
2. **8/11 repositories** — CRUD operations and RPC calls tested
3. **7/9 stores** — Zustand state management tested with real store + mocked services
4. **5/6 hooks** — behavior tested including async network calls
5. **All 16 primary screens** — rendering, interaction, and data loading tested
6. **4 critical schemas** — Zod validation rules tested
7. **3 integration flows** — multi-layer flow tests covering the most common user paths
8. **Test infrastructure** — supabaseMock, renderWithTheme, fixtures, platformHelpers all present and reusable

---

## 7. What's Absent / Needs Attention ❌

### Critical Gaps

| Area                       | Files Missing Tests | Risk                                     |
| -------------------------- | ------------------- | ---------------------------------------- |
| `validation.ts` utility    | 1                   | HIGH — used in forms app-wide            |
| `gstCalculator.ts` utility | 1                   | HIGH — business-critical calculation     |
| Invoice-create UI steps    | 4 screen components | HIGH — complex multi-step wizard         |
| `createPaginatedStore`     | 1                   | HIGH — shared factory used by all stores |

### Medium Priority

| Area                                                                | Files Missing Tests | Risk                                    |
| ------------------------------------------------------------------- | ------------------- | --------------------------------------- |
| `supplierRepository`                                                | 1                   | MEDIUM — supplier features untested     |
| `notificationRepository` + `notificationStore`                      | 2                   | MEDIUM — notification logic unverified  |
| `businessProfile.schema`, `expense.schema`                          | 2                   | MEDIUM — validation edge cases untested |
| Organism components: DashboardHeader, QuickActionsGrid, TileSetCard | 3                   | MEDIUM — dashboard UI untested          |
| StatCard, ListItem molecules                                        | 2                   | MEDIUM — UI display logic untested      |

### Low Priority

| Area                                    | Files | Risk                           |
| --------------------------------------- | ----- | ------------------------------ |
| `imageTransform.ts`, `logger.ts`        | 2     | LOW — utility/side-effect code |
| `Divider`, `Screen`, `ThemedText` atoms | 3     | LOW — presentational only      |
| `useThemeTokens` hook                   | 1     | LOW — theme read-only          |

### E2E Coverage Gaps

The most significant gap is in E2E testing — only 2 Maestro flows exist for what is clearly a multi-screen business application. The following critical user journeys have no automated E2E coverage:

- Authentication (login, logout, session expiry)
- Full inventory management cycle
- End-to-end payment collection
- Report generation and PDF export
- Offline + sync behavior

---

## 8. Coverage Thresholds Configured

From `jest.config.js`:

| Scope                 | Branches | Functions | Lines | Statements |
| --------------------- | -------- | --------- | ----- | ---------- |
| Global                | 70%      | 75%       | 75%   | 75%        |
| `src/services/**`     | —        | —         | 80%   | —          |
| `src/repositories/**` | —        | —         | 80%   | —          |
| `src/utils/**`        | —        | —         | 85%   | —          |

These thresholds enforce minimum quality for high-value code paths, but are only checked when `--coverage` flag is passed.

---

## 9. Summary Table

| Category          | Total Files | Tested | Coverage |
| ----------------- | ----------- | ------ | -------- |
| Services          | 12          | 12     | **100%** |
| Repositories      | 11          | 8      | **73%**  |
| Stores            | 9           | 7      | **78%**  |
| Hooks             | 6           | 5      | **83%**  |
| Utils             | 10          | 6      | **60%**  |
| Schemas           | 7           | 4      | **57%**  |
| Components (all)  | 21          | 13     | **62%**  |
| Features          | 5           | 1      | **20%**  |
| **Total**         | **81**      | **56** | **~69%** |
| Integration Flows | 8 critical  | 3      | **38%**  |
| E2E User Journeys | ~12         | 2      | **17%**  |

---

## 10. Recommendations (Priority Order)

1. **Add `createPaginatedStore` tests** — it's a shared factory; bugs here affect all stores.
2. **Test `validation.ts` and `gstCalculator.ts`** — business-critical logic that affects data integrity.
3. **Add integration tests for customer, order, expense flows** — currently only invoice/payment/stock are covered.
4. **Test `InvoiceCreateScreen` and step components** — the most complex multi-step UI in the app.
5. **Add Maestro flows for login and inventory** — the two most-used user journeys after dashboard.
6. **Test organism components** (DashboardHeader, QuickActionsGrid) — they aggregate data display logic.
7. **Test supplierRepository and notificationStore** — both are standalone features with no coverage at all.
8. **Fix `gstCalculator.test.ts` file location** — it exists but is placed incorrectly, likely not being picked up by Jest.
