# TDD Quality Review — Staff QA Engineer Perspective
> App: TileMaster (React Native / Expo)
> Reviewed on: 2026-03-29
> Reviewer Role: Staff QA Engineer (FAANG)

---

## Summary

The codebase has a reasonable test scaffold in place — service, store, utility, and UI layers each have at least some coverage. However, from a FAANG Staff QA perspective, there are significant gaps in coverage depth, test quality, configuration, and architectural consistency that would block a production ship. Issues are grouped by category and ranked within each group by severity.

---

## 1. TEST COVERAGE GAPS

### 1.1 Entire Repository Layer Has Zero Tests
- `baseRepository.ts`, `customerRepository.ts`, `expenseRepository.ts`, `financeRepository.ts`, `inventoryRepository.ts`, `invoiceRepository.ts`, `notificationRepository.ts`, `orderRepository.ts`, `paymentRepository.ts`, `supplierRepository.ts` — **none of these have test files**.
- Repositories are the direct database boundary. Untested repos mean DB query construction, error handling, and RPC calls are never exercised in isolation.

### 1.2 Critical Services with No Tests
- `pdfService.ts` — No test file. This service calls an LLM for document parsing, a high-risk, non-deterministic operation.
- `reportService.ts` — No test file. Finance reports are a compliance-critical feature.

### 1.3 Custom Hooks Are Completely Untested
None of the following hooks have tests:
- `useConfirmBack` — navigation guard logic
- `useDebounce` — timing-sensitive
- `useNetworkStatus` — side-effect heavy
- `useRefreshOnFocus` — lifecycle behaviour
- `useThemeTokens` — theme correctness
- `useLocale` — i18n + currency/date formatting pipeline

### 1.4 Zod Schemas Have No Dedicated Tests
Schemas for `businessProfile`, `customer`, `expense`, `inventory`, and `payment` have no tests. The `InvoiceInputSchema` and `InvoiceLineItemSchema` are tested indirectly via `invoiceService`, but their validation boundaries (regex edge cases, optional vs required fields, enum values) are never explicitly exercised.

### 1.5 Feature-Level Components (Organisms / Molecules) Have No Tests
The following components have zero test coverage:
- `PaymentModal.tsx` — Modal with payment recording logic
- `RecentInvoicesList.tsx` — Renders invoice data on dashboard
- `QuickActionsGrid.tsx` — Navigational actions
- `DashboardHeader.tsx`
- `TileSetCard.tsx`
- `FormField.tsx`
- `SearchBar.tsx`
- `ListItem.tsx`
- `StatCard.tsx`
- `EmptyState.tsx`

Atom components with no tests: `Chip.tsx`, `Divider.tsx`, `OfflineBanner.tsx`, `Screen.tsx`, `ThemedText.tsx`.

### 1.6 Missing Screen-Level Tests
- Dashboard screen (main tab) — No tests.
- `inventory/[id].tsx` (item detail) — No tests.
- `inventory/add.tsx` — No tests.
- `finance/purchases.tsx` — While there is a `purchases.test.tsx` file present, its contents should be independently verified.
- `useInvoiceCreateFlow.ts` — The core wizard hook driving a critical business flow has no unit tests.
- `CustomerStep.tsx`, `LineItemsStep.tsx`, `PaymentStep.tsx` — No individual component tests.

### 1.7 `createPaginatedStore.ts` Has Zero Coverage
This generic pagination factory is used across multiple stores (inventory, customers, invoices). No test covers its page-increment logic, `hasMore` flag, or filter-reset behaviour.

### 1.8 `notificationStore.ts` Has No Tests
Notifications are user-facing signals. No coverage for push notification state management.

---

## 2. TEST QUALITY ISSUES

### 2.1 Skipped / Placeholder Tests Left in Codebase
- `src/__tests__/ui/InvoiceCreateFlow.test.tsx` — Entire `describe` block is `describe.skip(...)`. All 5 test bodies contain only `expect(true).toBe(true)`. This represents dead test code that gives a false sense of coverage and must be either implemented or deleted.

### 2.2 Duplicate / Redundant Test Directories
There are three separate UI test locations:
- `__tests__/ui/` — Active tests (auth, customers, finance, inventory, invoices, orders)
- `src/__tests__/ui/` — Stale/skipped tests (`InvoiceCreateFlow`, `InventoryScreen`, `InvoicesScreen`)
- `src/components/atoms/__tests__/` — Component tests

The stale `src/__tests__/ui/` folder is never cleaned up, creating ambiguity about which tests are canonical. This will confuse engineers and can create false positives in coverage reports.

### 2.3 Duplicate Assertion in `inventoryStore.test.ts`
```ts
// Line 37
expect(state.loading).toBe(false);
expect(state.loading).toBe(false); // exact duplicate
```
This is a copy-paste error. The duplicate adds no value and suggests the test was not reviewed.

### 2.4 Fragile Element Selection by Index in `login.test.tsx`
```ts
const signInButton = getAllByText('Sign In')[1]; // Second one is the button
```
Selecting by positional index is brittle. If the component structure changes (e.g., a third "Sign In" label is added), the index silently shifts and the test breaks or tests the wrong element. Use `getByRole('button', { name: 'Sign In' })` or a `testID` instead.

### 2.5 Shallow `invoiceService` Tests
`invoiceService.test.ts` has only 2 tests, both for `createInvoice`. Missing:
- `fetchInvoices` — No tests for search filter construction, date range filtering, pagination (`page`, `limit`, `range()`), sort direction, or `payment_status` filter.
- `fetchInvoiceDetail` — Zero tests.
- `createInvoice` error path — No test for when the RPC itself returns `{ data: null, error: {...} }`.
- Full RPC payload assertion — The success test only checks `customer_name`, `is_inter_state`, `payment_status`. Fields like `customer_id`, `place_of_supply`, `reverse_charge`, line-item tax fields (`cgst_amount`, `sgst_amount`, `igst_amount`, `taxable_amount`) are never asserted.

### 2.6 `customerService.test.ts` Tests Are Minimal and Inconsistent
- Only 2 tests, both for `createCustomer`. `fetchCustomers` is never tested.
- The `createCustomer` failure test asserts `rejects.toEqual(mockError)` — the raw Supabase error object. This is inconsistent with `authService`, which wraps errors in `AppError`. If the service ever adds error wrapping, this test will catch the regression — but only if someone writes the wrapping logic. The inconsistency itself is a design bug.

### 2.7 `financeService.test.ts` Is Incomplete
- `fetchExpenses` test only verifies that filters are applied but **never asserts on the returned data**.
- `fetchPurchases` — No tests.
- `createExpense` — No tests.
- No error-path test for `fetchExpenses`.

### 2.8 `paymentService.test.ts` Missing Edge Cases
- `amount = 0` — Not tested. Is zero a valid payment amount?
- Both `customer_id` and `supplier_id` absent — Not tested. The schema likely requires one of them.
- `fetchPayments` is mocked but **never tested**.
- Network/DB error from `repo.recordWithInvoiceUpdate` — Not tested.

### 2.9 `exportService.test.ts` Coverage Is Narrow
- No test for when `Sharing.isAvailableAsync()` returns `false`.
- No test for B2C invoice content validation (test only checks that `'B2C Large'` appears in CSV; doesn't validate column structure or row data).
- No test for intra-state vs inter-state IGST/CGST column differences in the export.
- No test for the `exportGSTR1` function with a truly empty date range.

### 2.10 `authStore.test.ts` Missing Failure and Loading State Tests
- No test for `login` failure path (service throws).
- No test for `register` method.
- Loading state transitions are never verified (`loading: true` during the async call is not asserted for any action).

### 2.11 `invoiceStore.test.ts` Missing Error and Loading State Tests
- No test for `createInvoice` failure (service rejects) — does the store set `error` correctly?
- `fetchInvoices` test does not check the `loading: true` intermediate state before the call resolves.
- No tests for filter changes or pagination state.

### 2.12 `inventoryStore.test.ts` Missing Store Action Tests
- `createItem`, `updateItem`, `deleteItem` store actions are mocked in the service mock but **never exercised** in any test.
- `performStockOperation` error path — Not tested at the store level.

### 2.13 GST Calculator Missing Boundary Tests
- `gst_rate = 0` (zero-rated goods) — Not tested.
- `gst_rate = 5` — Not tested.
- `gst_rate = 28` — Not tested.
- `quantity = 0` — Not tested (edge: taxable amount = 0).
- `discount > gross amount` — Not tested (should produce 0 taxable, not negative).
- `calculateInvoiceTotals` for **intra-state** — Only inter-state (`isInterState = true`) is tested. No test with `isInterState = false` for a multi-item invoice.
- Floating-point precision with recurring decimals (e.g., `gst_rate = 18` on `rate_per_unit = 333.33`).

### 2.14 Date Utility Tests Have Timezone Sensitivity
- `formatDate(new Date('2025-01-01'))` — `new Date('2025-01-01')` parses as UTC midnight, which resolves to December 31 in UTC-based environments. This test will produce different results in CI environments running UTC vs IST.
- `formatRelativeDate` function exists in the source but has no tests despite its mock being set up in the test file.

### 2.15 Currency Utility Missing Robustness Tests
- `formatINR(NaN)` — Not tested.
- `formatINR(Infinity)` — Not tested.
- `parseINR('not a number')` — Not tested.
- `numberToIndianWords` for crore+ amounts not tested.
- `formatINR(-500)` returns `'₹-500.00'` — the test asserts this format, but the symbol-before-minus format may be a locale bug (`₹-500` vs `-₹500`). No explicit assertion on the correct negative format per Indian accounting standards.

### 2.16 `setup.test.tsx` Bypasses Service Abstraction
The setup screen test mocks `supabase` directly instead of mocking `businessProfileService`. This couples the UI test to the infrastructure layer and violates the separation-of-concerns principle. If `businessProfileService` changes its internal table name, this test will break even though the service interface is unchanged.

### 2.17 `ErrorBoundary.test.tsx` — "Reset" Test Does Not Truly Test Reset
The "Try Again" test verifies that after pressing the button, the error screen still appears (because the child still throws). This **does not verify** that the boundary's internal state was reset (i.e., that `hasError` was set to `false` before the child re-threw). The test comment acknowledges this limitation but it remains as-is, providing false confidence.

### 2.18 Hardcoded Future Date in `paymentService.test.ts`
```ts
payment_date: '2026-03-29',  // hardcoded to "today"
```
This date is hardcoded to today's date. If any validation logic is added that checks `payment_date` must not be in the future, and the codebase is maintained past this date without updating tests, the test will either silently break or pass for the wrong reason.

---

## 3. MOCK DESIGN ISSUES

### 3.1 Global Supabase Mock Conflicts with Per-Test Mocks
`jest.setup.ts` globally mocks `./src/config/supabase` with a chainable mock. Many service test files **also** call `jest.mock('../config/supabase', ...)` locally. Jest's module registry means the local mock wins, but this creates confusion: engineers may not realise the global mock exists and write redundant per-test mocks, or may rely on the global and miss setting up the local one.

### 3.2 The `.then()` Mock Pattern Is Semantically Broken
Used in `inventoryService.test.ts`, `orderService.test.ts`, and `financeService.test.ts`:
```ts
then: jest.fn((resolve) => resolve({ data: [], error: null, count: 0 })),
```
This mocks the `then` method on the query builder object directly. Problems:
- It breaks standard Promise/thenable semantics — `catch` and `finally` handlers won't chain correctly.
- It does not replicate Supabase's actual `PostgrestBuilder` which resolves the full promise chain at the end of the query.
- If any test code uses `await query` in a try/catch and expects rejection, this pattern silently succeeds.
- Tests using this pattern are testing a fake object that doesn't behave like real Supabase.

### 3.3 `useLocalSearchParams` Globally Hardcoded to `{ id: '123' }`
In `jest.setup.ts`:
```ts
useLocalSearchParams: () => ({ id: '123' }),
```
This global default leaks into every test that doesn't explicitly override it. Tests for screens that use different params (e.g., `type: 'stock_in'` for StockOpScreen) must remember to override this in their file-level mock — easy to forget and produces silent wrong-param bugs.

### 3.4 `react-i18next` Mock Has Sparse Translation Map
Only 8 keys are mapped in the global mock. Any test that renders a component with a translation key not in this map will receive the raw key string (e.g., `'invoice.status.paid'`) as the rendered text. Tests asserting on UI text are then implicitly asserting on translation key names, not user-visible strings. A key rename would break the test in the wrong direction.

### 3.5 `Platform.OS` Hardcoded to `'ios'`
```ts
Platform = { OS: 'ios', select: jest.fn((o) => o.ios || o.default), Version: 1 }
```
All platform-conditional code paths for Android are never exercised. Any `Platform.select` that has an `android` branch not covered by `o.ios || o.default` silently returns `undefined`.

### 3.6 `FlatList` Mock Ignores Header/Footer/Empty Components
```ts
const FlatList = ({ data, renderItem, keyExtractor }: any) => { ... }
```
The mock only renders `data` items. `ListHeaderComponent`, `ListFooterComponent`, `ListEmptyComponent`, `onEndReached`, `onRefresh`, `refreshing` are all silently discarded. Tests for screens with pull-to-refresh or "load more" pagination will never trigger these code paths.

### 3.7 `Modal` Mock Always Renders Children Regardless of `visible` Prop
```ts
const Modal = ({ children, ...props }: any) => React.createElement('Modal', props, children);
```
The `visible` prop is passed through but not used to conditionally render children. A test that checks "modal is not visible" will still find the modal's children in the DOM, causing false positives.

---

## 4. TEST CONFIGURATION ISSUES

### 4.1 `testEnvironment: 'node'` Is Wrong for a React Native App
`jest.config.js` sets `testEnvironment: 'node'`. React Native tests should use `jsdom` or the environment provided by `jest-expo`. Using `node` means DOM APIs (even polyfilled ones) behave differently, and any RN-specific global polyfills may not be set up correctly.

### 4.2 `jest-expo` Is Installed but Not Used
`jest-expo` (v54) is in `devDependencies` but the `jest.config.js` uses `ts-jest` as the preset instead. `jest-expo` provides React Native module transforms, the correct test environment, and mock configurations out of the box. Maintaining a manual `transformIgnorePatterns` and react-native mock in `jest.setup.ts` duplicates work that `jest-expo` would handle automatically.

### 4.3 No Coverage Thresholds Configured
`jest.config.js` has no `coverageThreshold`. There is no `collectCoverage`, no `coverageDirectory`, no `coverageReporters`. At FAANG, coverage gates (typically 80%+ for business-critical paths) are a CI requirement. Without thresholds, coverage regressions go undetected.

### 4.4 No `testMatch` or `testPathIgnorePatterns` Configured
Tests are spread across three locations (`__tests__/`, `src/__tests__/`, and co-located `*.test.ts`). Without explicit `testMatch` rules, Jest picks them all up by default — including the stale skipped tests in `src/__tests__/ui/`. This means CI passes tests that are `describe.skip`-ed and gives a false green.

### 4.5 `moduleNameMapper` Maps `@/` to `<rootDir>/` Not `<rootDir>/src/`
All imports use `@/src/...` which resolves to `<rootDir>/src/...`. The alias could be cleaner as `@/` → `src/` to allow `@/services/...` instead of `@/src/services/...`. The current mapping is functional but inconsistent — `@/app/...` resolves to the `app/` directory, while `@/src/...` resolves to `src/`. A FAANG codebase would define this explicitly.

---

## 5. ARCHITECTURAL / STRUCTURAL ISSUES

### 5.1 No Integration Test Layer
There are no true integration tests that exercise service + store + UI together without mocking the intermediate layers. The invoice creation flow is the most critical business workflow and the only test for it (`InvoiceCreateFlow.test.tsx`) is entirely skipped. The `__tests__/ui/invoices/create.test.tsx` test is good but mocks the store, so the service layer is never exercised end-to-end.

### 5.2 No E2E Test Infrastructure
No Detox, Maestro, or Playwright configuration exists. For a financial app handling GST invoices and payments, E2E tests covering happy-path invoice creation → payment recording → dashboard refresh are mandatory before any production deployment.

### 5.3 Inconsistent Mocking Strategy Across UI Tests
Some UI tests mock the store (e.g., `list.test.tsx`, `create.test.tsx`), while others mock the service directly (e.g., `[id].test.tsx` for invoices mocks `invoiceService`). This inconsistency means different layers are tested depending on which file you look at, and there is no clear contract for what "UI test" means in this codebase.

### 5.4 Event Bus Tests Are Flaky
In `dashboardStore.test.ts`:
```ts
eventBus.emit({ type: 'INVOICE_CREATED', invoiceId: 'inv-1' });
await Promise.resolve(); // flush microtasks
expect(dashboardService.fetchDashboardStats).toHaveBeenCalledTimes(1);
```
`await Promise.resolve()` flushes one microtask tick but does not guarantee that all async operations triggered by the event have completed. If the event handler is `async`, the `fetchDashboardStats` call may happen on a later tick. This test is **non-deterministically flaky** and should use `waitFor`.

### 5.5 Event Listener Leak in `dashboardStore.test.ts`
The `dashboardStore` subscribes to the `eventBus` on initialisation. Test-level `eventBus.emit()` calls add listeners that are never cleaned up between test files. If tests run in the same process (default for Jest), residual listeners can fire during unrelated tests and cause false positives or mysterious call-count failures.

### 5.6 No Tests for `createPaginatedStore` Factory
`createPaginatedStore.ts` is used as the foundation for multiple stores, yet has zero tests. If the pagination logic has a bug (off-by-one in `page` increment, incorrect `hasMore` calculation, filter-reset not clearing previous results), that bug propagates silently across all stores that use it.

---

## 6. MISSING CRITICAL BUSINESS LOGIC TESTS

### 6.1 GST Compliance
- Invoice number format (`TM/YYYY-YY/NNNN`) is never validated in tests.
- GSTIN regex is in the schema but boundary cases are not tested (valid 15-char GSTINs, invalid length, wrong state code prefix).
- Reverse charge mechanism — The `reverse_charge` field exists in the schema but no test exercises this code path.
- Zero-rated (`gst_rate = 0`) supplies — Not tested in GST calculator.
- Multiple GST slabs in a single invoice (e.g., 12% + 18% items) — Only partially tested; the `slabBreakdown` sort order is asserted but individual slab amounts are not individually validated.

### 6.2 Payment Status Transitions
- `partial` payment status — The `paymentService` validates against `['paid', 'partial', 'unpaid']` but no test exercises the `partial` status path or verifies that paying less than `grand_total` correctly sets `partial`.
- Over-payment (`amount_paid > grand_total`) — Not tested. Should this be allowed?
- Payment status auto-update when full amount is paid — No test for the `new_status` returned from `recordWithInvoiceUpdate`.

### 6.3 Inventory Stock Safety
- Stock out exceeding available stock — `performStockOperation` with `quantity_change` greater than `box_count` is never tested. The RPC presumably handles this, but the store/service contract for this failure is untested.
- Concurrent stock operations — No test for race conditions when two operations fire simultaneously.

### 6.4 Auth Edge Cases
- Session expiry / token refresh — No test for how the app behaves when the session expires mid-use.
- `signOut` in `authService` — Mocked but never tested.
- `onAuthStateChange` callback — Mocked but never tested. State transitions driven by auth events (e.g., user logs in on another device) have no test coverage.

---

## 7. SPECIFIC CODE SMELLS IN TESTS

### 7.1 `as any` Usage to Bypass TypeScript in Tests
Found in multiple files:
- `invoiceService.test.ts`: `invoiceService.createInvoice({...} as any)` — 3 occurrences
- `invoiceStore.test.ts`: `createInvoice({} as any)`
- `inventoryService.test.ts`: `inventoryService.createItem(newItem as any)`
- `orderService.test.ts`: `orderService.importOrder(partyName, items as any, {})`

At FAANG, `as any` in test code is a red flag. Tests should use properly typed fixtures. If the type is hard to construct, it signals a design problem with the type (too complex) or the function (accepts too many optional fields). Typed test factories or builders should be used instead.

### 7.2 `// @ts-ignore` in UI Tests
```ts
// @ts-ignore
useInventoryStore.getState = jest.fn().mockReturnValue({...})
// @ts-ignore
useInvoiceStore.getState = jest.fn().mockReturnValue({...})
```
Found in `__tests__/ui/invoices/create.test.tsx`. These suppress TypeScript errors without explaining why. The proper fix is to type the mock correctly.

### 7.3 Inconsistent Error Assertion Styles
Some tests use:
```ts
await expect(fn()).rejects.toBeInstanceOf(ValidationError);  // paymentService
await expect(fn()).rejects.toEqual(mockError);               // customerService
await expect(fn()).rejects.toThrow('DB error');              // businessProfileService
```
Three different error assertion patterns across the same codebase. A FAANG standard would require a consistent approach — typically `rejects.toThrow()` for message checks and `rejects.toBeInstanceOf()` for type checks, never `rejects.toEqual()` for raw error objects (which is fragile to error structure changes).

### 7.4 `require()` Inside Test Bodies
Several tests call `require()` inside test bodies instead of using imports at the top:
```ts
const { Alert } = require('react-native');
const { eventBus } = require('../events/appEvents');
const { ValidationError } = require('../errors/AppError');
```
This is an anti-pattern — it obscures dependencies and can cause issues with module caching. All dependencies should be imported at the module level.

### 7.5 `mockTable.select_single` Unused Dead Property
In `customerService.test.ts`:
```ts
const mockTable = {
  ...
  select_single: jest.fn(), // for .select().single()
};
```
`select_single` is never used or called in any test. It's a dead property that adds noise and confusion.

---

## 8. PRIORITY MATRIX

| Priority | Issue | Category |
|----------|-------|----------|
| P0 | Repository layer has zero tests — direct DB boundary untested | Coverage |
| P0 | `InvoiceCreateFlow.test.tsx` is fully skipped with placeholder `expect(true).toBe(true)` | Test Quality |
| P0 | No coverage thresholds — regressions go undetected in CI | Config |
| P0 | `testEnvironment: 'node'` incorrect for React Native | Config |
| P1 | `pdfService` and `reportService` have no tests | Coverage |
| P1 | `createPaginatedStore` has no tests — foundation of multiple stores | Coverage |
| P1 | Event-driven dashboard tests use `Promise.resolve()` flush — flaky | Test Quality |
| P1 | `.then()` mock pattern breaks promise semantics | Mock Design |
| P1 | `Modal` mock ignores `visible` prop — false positives possible | Mock Design |
| P1 | No E2E test infrastructure for a financial app | Architecture |
| P1 | GST compliance edge cases missing (reverse charge, zero-rated, slab validation) | Business Logic |
| P2 | All custom hooks untested | Coverage |
| P2 | `FlatList` mock discards `onEndReached`, `ListEmptyComponent` | Mock Design |
| P2 | `as any` and `@ts-ignore` in test files | Code Quality |
| P2 | Duplicate assertions, fragile index-based selectors | Test Quality |
| P2 | `jest-expo` installed but unused | Config |
| P3 | Three separate test directories with no clear convention | Architecture |
| P3 | Inconsistent error assertion styles | Code Quality |
| P3 | `require()` inside test bodies | Code Quality |
| P3 | Stale `src/__tests__/ui/` directory not cleaned up | Architecture |
