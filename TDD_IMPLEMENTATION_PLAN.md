# TDD Implementation Plan — TileMaster (React Native / Expo)
> Based on: TDD_QA_REVIEW.md (reviewed 2026-03-29)
> Target: Close all P0/P1/P2 gaps, harden configuration, achieve production-ready test suite

---

## Phase 0 — Jest Configuration Hardening

*These are config file changes only. No other phase modifies `jest.config.js` or related config files.*

### jest.config.js

- [x] Fix in `jest.config.js`: Change `testEnvironment: 'node'` to remove it entirely (let `jest-expo` preset supply the correct environment). If `jest-expo` preset is not yet active, set `testEnvironment: 'jsdom'` as an interim fix. This resolves QA issue 4.1.

- [x] Fix in `jest.config.js`: Replace the current `preset: 'ts-jest'` (or equivalent manual preset) with `preset: 'jest-expo'`. Remove any manually maintained `transformIgnorePatterns` that `jest-expo` now handles automatically. Confirm `jest-expo` v54 is in `devDependencies`. This resolves QA issue 4.2.

- [x] Add to `jest.config.js`: Add a `coverageThreshold` block:
  ```js
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    './src/services/': { lines: 80 },
    './src/repositories/': { lines: 80 },
    './src/utils/': { lines: 85 },
  }
  ```
  This enforces per-directory gates and resolves QA issue 4.3.

- [x] Add to `jest.config.js`: Add `collectCoverage: false` (so coverage only runs with `--coverage` flag) and `collectCoverageFrom` array:
  ```js
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/config/**',
    '!src/types/**',
    '!app/**',
  ]
  ```

- [x] Add to `jest.config.js`: Add `coverageReporters: ['text', 'lcov', 'html']` so CI can parse `lcov.info` and local engineers can open `coverage/index.html`.

- [x] Add to `jest.config.js`: Add `coverageDirectory: '<rootDir>/coverage'` explicitly.

- [x] Add to `jest.config.js`: Add `testMatch` to explicitly scope test discovery:
  ```js
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}',
  ]
  ```
  This resolves QA issue 4.4 by making the pattern explicit.

- [x] Add to `jest.config.js`: Add `testPathIgnorePatterns: ['<rootDir>/src/__tests__/ui/']` to exclude the stale skipped-test directory from CI runs until it is cleaned up in Phase 10. This prevents false-green CI.

- [x] Fix in `jest.config.js`: Update `moduleNameMapper` to add `'^@/(.*)$': '<rootDir>/src/$1'` so that `@/services/invoiceService` resolves to `src/services/invoiceService`. Verify every existing import that uses `@/src/...` and determine whether to keep both mappings or migrate. Document the canonical alias convention in a comment inside the config. This resolves QA issue 4.5. **Decision**: All existing imports use `@/src/...` or `@/app/...` — the single mapping `'^@/(.*)$': '<rootDir>/$1'` resolves both correctly. Canonical alias is documented in a comment in jest.config.js.

- [x] Add to `jest.config.js`: Add `setupFilesAfterFramework: ['<rootDir>/jest.setup.ts']` if not already present (verify the key is `setupFilesAfterFramework` not `setupFiles`, as the latter runs before the framework installs React Native globals). **Note**: Correct Jest key is `setupFilesAfterEnv` (not `setupFilesAfterFramework`). Config uses `setupFilesAfterEnv` which is correct.

---

## Phase 1 — Global Mock Infrastructure Fixes (jest.setup.ts)

*Fix the shared mock file. Every test in the suite depends on this. Complete this phase before writing any new test.*

### FlatList Mock

- [x] Fix in `jest.setup.ts`: Replace the minimal `FlatList` mock with one that handles all props used in the codebase. The new mock must: render each item in `data` via `renderItem`, render `ListHeaderComponent` if provided, render `ListFooterComponent` if provided, render `ListEmptyComponent` if `data` is empty or `data.length === 0`, call `onEndReached` when a `data-testid="flatlist-end-trigger"` element is pressed (or expose it via a ref-style helper), and pass `refreshing` to a `ScrollView`-like wrapper. Example structure:
  ```tsx
  const FlatList = ({ data, renderItem, keyExtractor, ListHeaderComponent, ListFooterComponent, ListEmptyComponent, onEndReached, onRefresh, refreshing }: any) => (
    <View>
      {ListHeaderComponent ? <View>{typeof ListHeaderComponent === 'function' ? <ListHeaderComponent /> : ListHeaderComponent}</View> : null}
      {data && data.length > 0
        ? data.map((item: any, index: number) => <View key={keyExtractor ? keyExtractor(item, index) : index}>{renderItem({ item, index })}</View>)
        : (ListEmptyComponent ? (typeof ListEmptyComponent === 'function' ? <ListEmptyComponent /> : ListEmptyComponent) : null)
      }
      {ListFooterComponent ? <View>{typeof ListFooterComponent === 'function' ? <ListFooterComponent /> : ListFooterComponent}</View> : null}
      <TouchableOpacity testID="flatlist-end-trigger" onPress={onEndReached} />
    </View>
  );
  ```
  This resolves QA issue 3.6.

### Modal Mock

- [x] Fix in `jest.setup.ts`: Replace the `Modal` mock so it conditionally renders children only when `visible === true`:
  ```tsx
  const Modal = ({ children, visible, ...props }: any) =>
    visible ? React.createElement('Modal', props, children) : null;
  ```
  This resolves QA issue 3.7 and prevents false positives in `PaymentModal` tests.

### useLocalSearchParams Mock

- [x] Fix in `jest.setup.ts`: Remove the hardcoded `useLocalSearchParams: () => ({ id: '123' })` global override from `jest.setup.ts`. Instead, add a per-file configurable approach: export a `mockSearchParams` object from a test utility file (`__tests__/utils/mockSearchParams.ts`) that individual test files can populate via `jest.mock` before each test. Document this pattern at the top of `jest.setup.ts` in a comment. This resolves QA issue 3.3.

### react-i18next Mock

- [x] Fix in `jest.setup.ts`: Replace the static key-to-string map in the `useTranslation` mock with a fallback function that returns the last segment of the key if it is not in the static map:
  ```ts
  const t = (key: string, opts?: any) => {
    const staticMap: Record<string, string> = { /* keep existing keys */ };
    if (staticMap[key]) return staticMap[key];
    // Return the last segment so 'invoice.status.paid' → 'paid'
    const fallback = key.split('.').pop() ?? key;
    return opts?.defaultValue ?? fallback;
  };
  ```
  This resolves QA issue 3.4 and prevents tests from asserting on raw key strings.

### Platform Mock

- [x] Fix in `jest.setup.ts`: Replace the static `Platform = { OS: 'ios', ... }` with a mock that allows per-test override:
  ```ts
  jest.mock('react-native/Libraries/Utilities/Platform', () => {
    const platform = { OS: 'ios', Version: 1, select: (obj: any) => obj[platform.OS] ?? obj.default };
    return platform;
  });
  ```
  Add a helper to `__tests__/utils/platformHelpers.ts` that allows `setPlatformOS('android')` and `resetPlatformOS()` for use in individual tests. This resolves QA issue 3.5.

### Global Supabase Mock

- [x] Fix in `jest.setup.ts`: Remove the global `jest.mock('./src/config/supabase', ...)` from `jest.setup.ts` entirely. Each test file that needs a Supabase mock must declare its own local `jest.mock('../config/supabase', ...)`. Add a shared typed chainable mock builder to `__tests__/utils/supabaseMock.ts` (see Phase 2) so there is no duplication. Document at the top of `jest.setup.ts` that Supabase is NOT globally mocked and each test file is responsible for its own mock. This resolves QA issue 3.1.

---

## Phase 2 — Typed Test Fixture Factories

*Create shared typed test data builders. All subsequent test files import from here. These files are never modified after creation — only extended.*

### Invoice Fixtures

- [x] Create `__tests__/fixtures/invoiceFixtures.ts`: Export `makeInvoiceLineItemInput(overrides?: Partial<InvoiceLineItemInput>): InvoiceLineItemInput` with defaults `{ item_id: 'item-uuid-001', design_name: 'GLOSSY WHITE 60x60', category: 'GLOSSY', quantity: 10, rate_per_unit: 500, gst_rate: 18, discount: 0 }`. Import the `InvoiceLineItemInput` type from `src/schemas/invoiceSchema.ts` (or wherever it lives).

- [x] Add to `__tests__/fixtures/invoiceFixtures.ts`: Export `makeInvoiceInput(overrides?: Partial<InvoiceInput>): InvoiceInput` with defaults `{ customer_name: 'Test Customer', customer_gstin: '', invoice_date: '2026-01-15', place_of_supply: '27', is_inter_state: false, payment_status: 'unpaid', amount_paid: 0, payment_mode: 'cash', notes: '', reverse_charge: false, line_items: [makeInvoiceLineItemInput()] }`.

- [x] Add to `__tests__/fixtures/invoiceFixtures.ts`: Export `makeInvoice(overrides?: Partial<Invoice>): Invoice` with defaults including `id: 'inv-uuid-001'`, `invoice_number: 'TM/2025-26/0001'`, `grand_total: 5900`, `created_at: '2026-01-15T10:00:00.000Z'`, and a spread of `makeInvoiceInput()` fields.

- [x] Add to `__tests__/fixtures/invoiceFixtures.ts`: Export `makeInvoiceListItem(overrides?: Partial<InvoiceListItem>): InvoiceListItem` — the slim type used in `fetchInvoices` list view, with `customer: { name: 'Test Customer', phone: '9876543210' }`.

### Customer Fixtures

- [x] Create `__tests__/fixtures/customerFixtures.ts`: Export `makeCustomer(overrides?: Partial<Customer>): Customer` with defaults `{ id: 'cust-uuid-001', name: 'Test Customer', phone: '9876543210', email: 'test@example.com', gstin: '', address: '123 Test St', city: 'Mumbai', state: 'Maharashtra', created_at: '2026-01-01T00:00:00.000Z' }`.

- [x] Add to `__tests__/fixtures/customerFixtures.ts`: Export `makeCustomerInput(overrides?: Partial<CustomerInput>): CustomerInput` — same shape minus `id` and `created_at`.

### Inventory Fixtures

- [x] Create `__tests__/fixtures/inventoryFixtures.ts`: Export `makeInventoryItem(overrides?: Partial<InventoryItem>): InventoryItem` with defaults `{ id: 'item-uuid-001', design_name: 'GLOSSY WHITE 60x60', base_item_number: '10526', category: 'GLOSSY', box_count: 50, selling_price: 500, created_at: '2026-01-01T00:00:00.000Z' }`.

- [x] Add to `__tests__/fixtures/inventoryFixtures.ts`: Export `makeInventoryItemInput(overrides?: Partial<InventoryItemInput>): InventoryItemInput`.

### Payment Fixtures

- [x] Create `__tests__/fixtures/paymentFixtures.ts`: Export `makePaymentInput(overrides?: Partial<PaymentInput>): PaymentInput` with defaults `{ invoice_id: 'inv-uuid-001', customer_id: 'cust-uuid-001', amount: 1000, payment_mode: 'cash', payment_date: '2026-01-15', notes: '' }`.

- [x] Add to `__tests__/fixtures/paymentFixtures.ts`: Export `makePayment(overrides?: Partial<Payment>): Payment` with `id: 'pay-uuid-001'` and spread of `makePaymentInput()`.

### Order Fixtures

- [x] Create `__tests__/fixtures/orderFixtures.ts`: Export `makeOrderItem(overrides?: Partial<OrderItem>): OrderItem` with defaults `{ design_name: 'GLOSSY WHITE 60x60', quantity: 5, base_item_number: '10526' }`.

- [x] Add to `__tests__/fixtures/orderFixtures.ts`: Export `makeOrder(overrides?: Partial<Order>): Order` with defaults `{ id: 'order-uuid-001', party_name: 'Test Party', status: 'pending', items: [makeOrderItem()], created_at: '2026-01-01T00:00:00.000Z' }`.

### Finance Fixtures

- [x] Create `__tests__/fixtures/financeFixtures.ts`: Export `makeExpense(overrides?: Partial<Expense>): Expense` with defaults `{ id: 'exp-uuid-001', category: 'Transport', amount: 500, expense_date: '2026-01-15', notes: '', created_at: '2026-01-15T00:00:00.000Z' }`.

- [x] Add to `__tests__/fixtures/financeFixtures.ts`: Export `makeDashboardStats(overrides?: Partial<DashboardStats>): DashboardStats` with defaults `{ today_sales: 10000, total_outstanding_credit: 25000, low_stock_count: 3, monthly_revenue: 150000 }`.

### Auth Fixtures

- [x] Create `__tests__/fixtures/authFixtures.ts`: Export `makeUser(overrides?: Partial<User>): User` with defaults `{ id: 'user-uuid-001', email: 'admin@tilemaster.in', created_at: '2026-01-01T00:00:00.000Z' }`.

- [x] Add to `__tests__/fixtures/authFixtures.ts`: Export `makeSession(overrides?: Partial<Session>): Session` with defaults `{ access_token: 'mock-access-token', refresh_token: 'mock-refresh-token', user: makeUser() }`.

### Shared Render Utility

- [x] Create `__tests__/utils/renderWithTheme.tsx`: Export a single `renderWithTheme(ui: React.ReactElement, options?: RenderOptions)` function that wraps the component in any required providers (ThemeProvider, SafeAreaProvider, NavigationContainer if needed). This replaces the duplicated `renderWithTheme` defined locally inside each UI test file. Export the result of `render(...)` so callers get the full `@testing-library/react-native` query API.

### Supabase Mock Builder

- [x] Create `__tests__/utils/supabaseMock.ts`: Export `createSupabaseMock()` that returns a fully typed chainable mock object. The mock must support the full Supabase query builder chain: `.from(table)` → returns a builder with `.select()`, `.insert()`, `.update()`, `.delete()`, `.upsert()`, each returning a builder with `.eq()`, `.neq()`, `.gte()`, `.lte()`, `.ilike()`, `.or()`, `.in()`, `.is()`, `.order()`, `.range()`, `.single()`, `.maybeSingle()`, `.limit()` — all returning the builder itself for chaining. The terminal call (`.single()`, `.maybeSingle()`, or any awaited call) resolves via `mockResolvedValue({ data: null, error: null })` by default. Also export `mockRpc` for `.rpc()` calls. Use `jest.fn()` for every method so calls can be asserted.

### Zustand Store Reset Helper

- [x] Create `__tests__/utils/mockStore.ts`: Export `resetAllStores()` that calls the `.getState().reset()` (or Zustand's `useStore.setState(initialState)`) for each store used in tests. Export individual `resetInvoiceStore()`, `resetInventoryStore()`, `resetCustomerStore()`, `resetAuthStore()`, `resetFinanceStore()`, `resetDashboardStore()` helpers. Call these in `afterEach` blocks in relevant test files.

---

## Phase 3 — Pure Utility Tests (Gap-Filling)

*Tests for stateless pure functions. No dependencies on DB, network, or async side effects. Written once, never revisited.*

### gstCalculator.test.ts

- [x] Add to `src/utils/__tests__/gstCalculator.test.ts`: Test `calculateLineItem` with `gst_rate = 0` (zero-rated): assert `taxable_amount === gross`, `cgst_amount === 0`, `sgst_amount === 0`, `igst_amount === 0`, `line_total === taxable_amount`.

- [x] Add to `src/utils/__tests__/gstCalculator.test.ts`: Test `calculateLineItem` with `gst_rate = 5`, `is_inter_state = false`: assert `cgst_amount === taxable_amount * 0.025`, `sgst_amount === taxable_amount * 0.025`, `igst_amount === 0`. Use exact numeric values to avoid floating-point ambiguity (e.g., `rate_per_unit = 1000`, `quantity = 1` → `taxable_amount = 1000`, `cgst_amount = 25`).

- [x] Add to `src/utils/__tests__/gstCalculator.test.ts`: Test `calculateLineItem` with `gst_rate = 28`, `is_inter_state = true`: assert `igst_amount === taxable_amount * 0.28`, `cgst_amount === 0`, `sgst_amount === 0`.

- [x] Add to `src/utils/__tests__/gstCalculator.test.ts`: Test `calculateLineItem` with `discount` exactly equal to `gross_amount` (`rate_per_unit * quantity`): assert `taxable_amount === 0`, all tax fields `=== 0`, `line_total === 0`.

- [x] Add to `src/utils/__tests__/gstCalculator.test.ts`: Test `calculateLineItem` with `discount` greater than `gross_amount`: assert `taxable_amount` is clamped to `0` (not negative), all tax values `=== 0`, `line_total === 0`. Verifies the guard against negative taxable amounts.

- [x] Add to `src/utils/__tests__/gstCalculator.test.ts`: Test `calculateLineItem` with `quantity = 0`: assert all monetary output fields (`taxable_amount`, `cgst_amount`, `sgst_amount`, `igst_amount`, `line_total`) equal `0`.

- [x] Add to `src/utils/__tests__/gstCalculator.test.ts`: Test floating-point precision: call `calculateLineItem({ rate_per_unit: 333.33, quantity: 3, gst_rate: 18, discount: 0, is_inter_state: false })`. Assert `line_total` is a finite number, `Number.isFinite(result.line_total) === true`, and `result.line_total === parseFloat(result.line_total.toFixed(2))` (no drift beyond 2 decimal places).

- [x] Add to `src/utils/__tests__/gstCalculator.test.ts`: Test `calculateInvoiceTotals` with `isInterState = false` and two line items with different GST rates (e.g., one at 12%, one at 18%): assert `cgst_total > 0`, `sgst_total > 0`, `igst_total === 0`. Verify that `cgst_total + sgst_total === total_tax`.

- [x] Add to `src/utils/__tests__/gstCalculator.test.ts`: Test `calculateInvoiceTotals` sort order of `slabBreakdown`: pass three line items with `gst_rate` values `[28, 5, 18]` in that order. Assert `slabBreakdown[0].rate === 5`, `slabBreakdown[1].rate === 18`, `slabBreakdown[2].rate === 28` (ascending sort).

- [x] Add to `src/utils/__tests__/gstCalculator.test.ts`: Test `calculateInvoiceTotals` with a single line item of `gst_rate = 0`: assert `slabBreakdown.length === 1`, `slabBreakdown[0].rate === 0`, `slabBreakdown[0].total_tax === 0`.

- [x] Add to `src/utils/__tests__/gstCalculator.test.ts`: Test `calculateInvoiceTotals` with an empty `line_items` array `[]`: assert `subtotal === 0`, `total_tax === 0`, `grand_total === 0`, `cgst_total === 0`, `sgst_total === 0`, `igst_total === 0`, `slabBreakdown` is an empty array `[]`.

### dateUtils.test.ts

- [x] Fix in `src/utils/__tests__/dateUtils.test.ts`: Replace `new Date('2025-01-01')` with `new Date(Date.UTC(2025, 0, 1))` in the existing `formatDate` test to avoid UTC-vs-local timezone drift. Update the expected output string to match. This resolves QA issue 2.14.

- [x] Add to `src/utils/__tests__/dateUtils.test.ts`: Test `formatRelativeDate` returns `'Today'` when called with today's ISO date string. Use `jest.useFakeTimers()` and `jest.setSystemTime(new Date('2026-03-29T12:00:00.000Z'))` before the assertion, then call `formatRelativeDate('2026-03-29')` and assert the result equals `'Today'`. Restore real timers in `afterEach`.

- [x] Add to `src/utils/__tests__/dateUtils.test.ts`: Test `formatRelativeDate` returns `'Yesterday'` when called with yesterday's ISO date string. With system time set to `2026-03-29`, call `formatRelativeDate('2026-03-28')` and assert `=== 'Yesterday'`.

- [x] Add to `src/utils/__tests__/dateUtils.test.ts`: Test `formatRelativeDate` with a date more than 1 day in the past. With system time set to `2026-03-29`, call `formatRelativeDate('2024-01-15')` and assert the result is a formatted date string (not `'Today'` or `'Yesterday'`). Assert `result !== 'Today'` and `result !== 'Yesterday'` and `result.length > 0`.

- [x] Add to `src/utils/__tests__/dateUtils.test.ts`: Test `getFinancialYearStart` on the exact April 1 boundary. Call `getFinancialYearStart(new Date(Date.UTC(2026, 3, 1)))` (April 1 2026 UTC) and assert it returns a date whose month is April (month index 3) and year is 2026, not 2025. This verifies same-day inclusion logic.

### currency.test.ts

- [x] Add to `src/utils/__tests__/currency.test.ts`: Test `formatINR(NaN)`: assert the result is either `'₹0.00'` or that the function throws a `TypeError`. Document which behavior is expected in the test description. Whichever behavior is currently implemented, assert it explicitly — do not leave this as implicit.

- [x] Add to `src/utils/__tests__/currency.test.ts`: Test `formatINR(Infinity)`: assert the result is `'₹0.00'` or that the function throws. Same pattern as the `NaN` test — pick one documented behavior.

- [x] Add to `src/utils/__tests__/currency.test.ts`: Test `parseINR('not-a-number')`: assert the return value is `0`. This guards against `NaN` propagation into financial calculations.

- [x] Add to `src/utils/__tests__/currency.test.ts`: Test `parseINR('₹-500.00')`: assert the return value is `-500`. Verifies that negative formatted strings are parsed correctly.

- [x] Add to `src/utils/__tests__/currency.test.ts`: Test `numberToIndianWords(10000000)`: assert the result contains `'Crore'` (or `'crore'` — match the actual casing). This verifies crore-scale formatting works.

- [x] Add to `src/utils/__tests__/currency.test.ts`: Test `numberToIndianWords(10000000000)`: assert the result contains `'Arab'` or `'Hundred Crore'` — document what the function currently returns for 10 billion and assert that exact output.

- [x] Add to `src/utils/__tests__/currency.test.ts`: Fix the existing `formatINR(-500)` test: replace the current assertion (if it asserts `'₹-500.00'`) with `expect(result.startsWith('-₹')).toBe(true)`. This verifies the minus sign precedes the rupee symbol per standard Indian accounting notation. This resolves QA issue 2.15.

### retry.test.ts

- [x] Add to `src/utils/__tests__/retry.test.ts` (create if missing): Test `withRetry` with `maxAttempts = 1`: call `withRetry(jest.fn().mockRejectedValue(new Error('fail')), { maxAttempts: 1 })`. Assert the function was called exactly once and the returned promise rejects with the original error.

- [x] Add to `src/utils/__tests__/retry.test.ts`: Test exponential backoff timing: use `jest.useFakeTimers()`. Set up `withRetry(fn, { maxAttempts: 3, baseDelay: 100 })` where `fn` always rejects. After the first failure, advance timers by 99ms and assert the second attempt has NOT been made yet. Advance by 1ms more (total 100ms) and assert the second attempt IS made. This verifies `baseDelay` is respected.

- [x] Add to `src/utils/__tests__/retry.test.ts`: Test `withRetry` success on third attempt: create `fn` that rejects twice then resolves with `'success'`. Call `withRetry(fn, { maxAttempts: 3 })`. Assert `fn` was called exactly 3 times and the promise resolves with `'success'`.

### itemNameParser.test.ts

- [x] Add to `src/utils/__tests__/itemNameParser.test.ts` (create if missing): Test `extractBaseItemNumber` with whitespace-padded input `'  10526-D  '`: assert the result is `'10526'` (or whatever the function currently extracts — document and assert the trimming behavior).

- [x] Add to `src/utils/__tests__/itemNameParser.test.ts`: Test `groupByBaseItemNumber` where one item has a `design_name` with no numeric block (e.g., `'BRAND'`): assert the item is grouped under key `'BRAND'` (or the fallback key the function uses). This prevents silent `undefined` key grouping.

### html.test.ts and color.test.ts

- [x] Check `src/utils/__tests__/html.test.ts` (create if missing): Enumerate all exported functions from `src/utils/html.ts` (likely `stripHtml`, `sanitizeHtml`, or similar). Add a test for each exported function that does not already have one. Minimum: one happy-path and one empty-string test per function.

- [x] Check `src/utils/__tests__/color.test.ts` (create if missing): Enumerate all exported functions from `src/utils/color.ts`. Add tests for any function not already covered. Minimum: verify that color utility functions handle both valid hex and invalid inputs gracefully.

---

## Phase 4 — Schema Validation Tests (New Files)

*Zod schema tests. Pure validation logic — no DB, no network, no async. Written once, never revisited.*

### Invoice Schema Tests

- [x] Create `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceLineItemSchema.parse(validInput)` with a fully valid input object — assert it parses without throwing and returns the parsed object.

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceLineItemSchema.safeParse({ ...valid, item_id: 'not-a-uuid' })`: assert `success === false` and `error.issues[0].path` contains `'item_id'`.

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceLineItemSchema.safeParse({ ...valid, quantity: 0 })`: assert `success === false` and `error.issues[0].message` contains `'at least 1'` (or the exact Zod message defined in the schema).

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceLineItemSchema.safeParse({ ...valid, quantity: -1 })`: assert `success === false`.

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceLineItemSchema.safeParse({ ...valid, rate_per_unit: 0 })`: assert `success === false` and message contains `'positive'` (or equivalent).

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceLineItemSchema.safeParse({ ...valid, gst_rate: 7 })` (not in allowed enum `[0, 5, 12, 18, 28]`): assert `success === false` and message contains `'Invalid GST rate'` or `'Invalid enum value'`.

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceLineItemSchema.safeParse({ ...valid, gst_rate: 0 })`: assert `success === true`. Zero is a valid GST rate for zero-rated supplies.

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceLineItemSchema.safeParse({ ...valid, discount: undefined })`: assert `success === true` and `result.data.discount === 0` (default applied).

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceInputSchema.safeParse(validFullInput)` with all required fields: assert `success === true`.

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceInputSchema.safeParse({ ...valid, invoice_date: '28-03-2026' })` (wrong date format DD-MM-YYYY): assert `success === false` and message references `'YYYY-MM-DD'`.

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceInputSchema.safeParse({ ...valid, customer_name: '' })`: assert `success === false` and message contains `'required'` or `'empty'`.

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceInputSchema.safeParse({ ...valid, customer_gstin: 'INVALIDGSTIN' })` (not matching the GSTIN regex): assert `success === false` and message references `'GSTIN'` or `'Invalid format'`.

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceInputSchema.safeParse({ ...valid, customer_gstin: '' })`: assert `success === true`. Empty GSTIN is allowed (not all customers are GST registered).

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceInputSchema.safeParse({ ...valid, customer_gstin: '27AAAAA0000A1Z5' })` (valid 15-char GSTIN): assert `success === true`.

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceInputSchema.safeParse({ ...valid, line_items: [] })`: assert `success === false` and message contains `'at least one'` or `'min'`.

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceInputSchema.safeParse({ ...valid, payment_status: 'bounced' })` (invalid enum value): assert `success === false`.

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceInputSchema.safeParse({ ...valid, notes: 'x'.repeat(1001) })` (exceeds 1000-char limit): assert `success === false`.

- [x] Add to `src/schemas/__tests__/invoice.schema.test.ts`: Test `InvoiceInputSchema.safeParse({ ...valid, amount_paid: undefined })`: assert `success === true` and `result.data.amount_paid === 0` (default applied).

### Payment Schema Tests

- [x] Create `src/schemas/__tests__/payment.schema.test.ts`: Test `PaymentSchema.safeParse(validPaymentInput)` with all required fields: assert `success === true`.

- [x] Add to `src/schemas/__tests__/payment.schema.test.ts`: Test `PaymentSchema.safeParse({ ...valid, amount: 0 })`: document the intended behavior (is 0 valid?) and assert it. If 0 is invalid, assert `success === false`. If 0 is valid, assert `success === true`. The test description must state the business rule.

- [x] Add to `src/schemas/__tests__/payment.schema.test.ts`: Test `PaymentSchema.safeParse({ ...valid, amount: -1 })`: assert `success === false`.

- [x] Add to `src/schemas/__tests__/payment.schema.test.ts`: Test `PaymentSchema.safeParse({ ...valid, payment_mode: 'bitcoin' })` (invalid mode): assert `success === false`.

- [x] Add to `src/schemas/__tests__/payment.schema.test.ts`: Test `PaymentSchema.safeParse({ ...valid, payment_date: '29-03-2026' })` (wrong date format): assert `success === false`.

- [x] Add to `src/schemas/__tests__/payment.schema.test.ts`: Test `PaymentSchema.safeParse({ ...valid, customer_id: undefined, supplier_id: undefined })` (neither provided): assert `success === false` if the schema enforces mutual exclusion at the schema level. If the schema does not enforce this, document that the check is at the service layer and skip this test.

- [x] Add to `src/schemas/__tests__/payment.schema.test.ts`: Test `PaymentSchema.safeParse({ ...valid, customer_id: 'cust-001', supplier_id: 'supp-001' })` (both provided): assert `success === false` if the schema enforces mutual exclusion.

### Inventory Schema Tests

- [x] Create `src/schemas/__tests__/inventory.schema.test.ts`: Test `InventoryItemSchema.safeParse(validItem)`: assert `success === true`.

- [x] Add to `src/schemas/__tests__/inventory.schema.test.ts`: Test `InventoryItemSchema.safeParse({ ...valid, design_name: '' })`: assert `success === false`.

- [x] Add to `src/schemas/__tests__/inventory.schema.test.ts`: Test `InventoryItemSchema.safeParse({ ...valid, box_count: -1 })`: assert `success === false`.

- [x] Add to `src/schemas/__tests__/inventory.schema.test.ts`: Test `InventoryItemSchema.safeParse({ ...valid, selling_price: -100 })`: assert `success === false`.

### Customer Schema Tests

- [x] Create `src/schemas/__tests__/customer.schema.test.ts`: Test `CustomerSchema.safeParse(validCustomer)`: assert `success === true`.

- [x] Add to `src/schemas/__tests__/customer.schema.test.ts`: Test `CustomerSchema.safeParse({ ...valid, name: '' })`: assert `success === false`.

- [x] Add to `src/schemas/__tests__/customer.schema.test.ts`: Test phone format validation if applicable: `CustomerSchema.safeParse({ ...valid, phone: 'not-a-phone' })` — assert `success === false` if phone format is validated in the schema.

- [x] Add to `src/schemas/__tests__/customer.schema.test.ts`: Test `CustomerSchema.safeParse({ ...valid, gstin: '27AAAAA0000A1Z5' })` (valid 15-char GSTIN): assert `success === true`.

- [x] Add to `src/schemas/__tests__/customer.schema.test.ts`: Test `CustomerSchema.safeParse({ ...valid, gstin: '27AAAAA0000A1Z' })` (14-char GSTIN): assert `success === false`.

---

## Phase 5 — Repository Layer Tests (All New Files)

*New test files only — nothing existing is modified in this phase. Each file mocks Supabase locally using the builder from Phase 2's `__tests__/utils/supabaseMock.ts`.*

### Invoice Repository Tests

- [x] Create `src/repositories/__tests__/invoiceRepository.test.ts`: Import `createSupabaseMock` from `__tests__/utils/supabaseMock.ts`. At the top of each test, call `jest.mock('../../config/supabase', () => ({ supabase: createSupabaseMock() }))`.

- [x] Add to `src/repositories/__tests__/invoiceRepository.test.ts`: Test `InvoiceRepository.findWithLineItems(id)` success path: configure the mock's `.from('invoices').select('*, line_items(*)').eq('id', id).single()` to resolve with `{ data: makeInvoice(), error: null }`. Assert that `supabase.from` was called with `'invoices'`, `.select` was called with a string containing `'line_items'`, `.eq` was called with `('id', id)`, and `.single()` was called.

- [x] Add to `src/repositories/__tests__/invoiceRepository.test.ts`: Test `InvoiceRepository.findWithLineItems(id)` error path: configure `.single()` to resolve with `{ data: null, error: { message: 'Not found', code: 'PGRST116' } }`. Assert the method throws (or rejects with) that error.

- [x] Add to `src/repositories/__tests__/invoiceRepository.test.ts`: Test `InvoiceRepository.findWithLineItems(id)` null-data path: configure `.single()` to resolve with `{ data: null, error: null }`. Assert the method returns `null` or throws — document and assert whichever behavior is implemented.

- [x] Add to `src/repositories/__tests__/invoiceRepository.test.ts`: Test `InvoiceRepository.createAtomic(invoiceData, lineItems)`: configure `supabase.rpc('create_invoice_with_items_v1', ...)` to resolve with `{ data: { id: 'inv-001', invoice_number: 'TM/2025-26/0001' }, error: null }`. Assert `supabase.rpc` was called with `'create_invoice_with_items_v1'` and an object containing keys `p_invoice` and `p_line_items`.

- [x] Add to `src/repositories/__tests__/invoiceRepository.test.ts`: Test `InvoiceRepository.createAtomic` error path: configure `rpc` to resolve with `{ data: null, error: { message: 'RPC failed' } }`. Assert the method throws that error.

- [x] Add to `src/repositories/__tests__/invoiceRepository.test.ts`: Test `InvoiceRepository.createAtomic` return value: configure `rpc` to resolve with `{ data: { id: 'new-id', invoice_number: 'TM/2025-26/0002' }, error: null }`. Assert the returned object has `id === 'new-id'` and `invoice_number === 'TM/2025-26/0002'`.

### Customer Repository Tests

- [x] Create `src/repositories/__tests__/customerRepository.test.ts`: Test `CustomerRepository.findById(id)` success: configure `.from('customers').select('*').eq('id', id).single()` to resolve with `{ data: makeCustomer(), error: null }`. Assert each chained call was made with the correct argument.

- [x] Add to `src/repositories/__tests__/customerRepository.test.ts`: Test `CustomerRepository.findById(id)` returns customer data on success: assert the returned value deep-equals `makeCustomer()`.

- [x] Add to `src/repositories/__tests__/customerRepository.test.ts`: Test `CustomerRepository.findById(id)` error path: configure `.single()` to resolve with `{ data: null, error: { message: 'DB error' } }`. Assert the method throws.

- [x] Add to `src/repositories/__tests__/customerRepository.test.ts`: Test `CustomerRepository.findAll({ search: 'Raj' })`: configure the mock chain and assert `.ilike` was called with a pattern containing `'%Raj%'`.

- [x] Add to `src/repositories/__tests__/customerRepository.test.ts`: Test `CustomerRepository.findAll({ type: 'retail' })`: assert `.eq` was called with `('type', 'retail')`.

- [x] Add to `src/repositories/__tests__/customerRepository.test.ts`: Test `CustomerRepository.findAll({})` return shape: configure the mock to return `{ data: [makeCustomer()], error: null, count: 1 }`. Assert the returned value is `{ data: [makeCustomer()], count: 1 }`.

- [x] Add to `src/repositories/__tests__/customerRepository.test.ts`: Test `CustomerRepository.create(input)`: assert `.from('customers').insert(input).select().single()` chain was called. Assert the returned value is the created customer.

- [x] Add to `src/repositories/__tests__/customerRepository.test.ts`: Test `CustomerRepository.update(id, data)`: assert `.from('customers').update(data).eq('id', id).select().single()` chain was called.

### Inventory Repository Tests

- [x] Create `src/repositories/__tests__/inventoryRepository.test.ts`: Test `InventoryRepository.findById(id)`: assert chain `.from('inventory_items').select('*').eq('id', id).single()` was called and returns the item.

- [x] Add to `src/repositories/__tests__/inventoryRepository.test.ts`: Test `InventoryRepository.findAll({ category: 'GLOSSY' })`: assert `.eq('category', 'GLOSSY')` was called.

- [x] Add to `src/repositories/__tests__/inventoryRepository.test.ts`: Test `InventoryRepository.findAll({ category: 'ALL' })`: assert `.eq` was NOT called with `'category'` argument (ALL means no filter).

- [x] Add to `src/repositories/__tests__/inventoryRepository.test.ts`: Test `InventoryRepository.findAll({ search: 'white' })`: assert `.or` was called with a string containing `'%white%'` and referencing both `design_name` and `base_item_number` columns.

- [x] Add to `src/repositories/__tests__/inventoryRepository.test.ts`: Test `InventoryRepository.findAll({ lowStock: true })`: assert `.lte('box_count', threshold)` was called with some numeric threshold.

- [x] Add to `src/repositories/__tests__/inventoryRepository.test.ts`: Test `InventoryRepository.create(input)`: assert `.from('inventory_items').insert(input).select().single()` was called.

- [x] Add to `src/repositories/__tests__/inventoryRepository.test.ts`: Test `InventoryRepository.update(id, data)`: assert `.from('inventory_items').update(data).eq('id', id).select().single()` was called.

- [x] Add to `src/repositories/__tests__/inventoryRepository.test.ts`: Test `InventoryRepository.delete(id)`: assert `.from('inventory_items').delete().eq('id', id)` was called.

### Payment Repository Tests

- [x] Create `src/repositories/__tests__/paymentRepository.test.ts`: Test `PaymentRepository.recordWithInvoiceUpdate(input)`: configure `supabase.rpc('record_payment_v1', ...)` to return `{ data: { id: 'pay-001', new_status: 'paid' }, error: null }`. Assert `rpc` was called with `'record_payment_v1'` and an object whose keys include the expected param names.

- [x] Add to `src/repositories/__tests__/paymentRepository.test.ts`: Test `PaymentRepository.recordWithInvoiceUpdate` returns `{ id, new_status }`: assert the returned object has `id === 'pay-001'` and `new_status === 'paid'`.

- [x] Add to `src/repositories/__tests__/paymentRepository.test.ts`: Test `PaymentRepository.recordWithInvoiceUpdate` error path: configure `rpc` to return `{ data: null, error: { message: 'RPC failed' } }`. Assert the method throws.

- [x] Add to `src/repositories/__tests__/paymentRepository.test.ts`: Test `PaymentRepository.fetchPayments({})`: assert `.from('payments')` was called and the query terminates with the correct select.

- [x] Add to `src/repositories/__tests__/paymentRepository.test.ts`: Test `PaymentRepository.fetchPayments({ customer_id: 'cust-001' })`: assert `.eq('customer_id', 'cust-001')` was called.

- [x] Add to `src/repositories/__tests__/paymentRepository.test.ts`: Test `PaymentRepository.fetchPayments({ dateFrom: '2026-01-01', dateTo: '2026-03-31' })`: assert `.gte('payment_date', '2026-01-01')` and `.lte('payment_date', '2026-03-31')` were called.

### Finance Repository Tests

- [x] Create `src/repositories/__tests__/financeRepository.test.ts`: Test `FinanceRepository.fetchDashboardStats()`: assert `supabase.rpc` was called with the correct RPC function name (look up the actual name in `financeRepository.ts`). Configure it to return `{ data: makeDashboardStats(), error: null }`.

- [x] Add to `src/repositories/__tests__/financeRepository.test.ts`: Test `FinanceRepository.fetchDashboardStats` returns stats object: assert the returned value matches `makeDashboardStats()`.

- [x] Add to `src/repositories/__tests__/financeRepository.test.ts`: Test `FinanceRepository.fetchDashboardStats` error path: configure `rpc` to return `{ data: null, error: { message: 'RPC error' } }`. Assert the method throws.

### Expense Repository Tests

- [x] Create `src/repositories/__tests__/expenseRepository.test.ts`: Test `ExpenseRepository.create(input)`: assert `.from('expenses').insert(input).select().single()` was called. Assert the returned value contains an `id`.

- [x] Add to `src/repositories/__tests__/expenseRepository.test.ts`: Test `ExpenseRepository.findAll({ search: 'Transport' })`: assert `.ilike` was called with a pattern containing `'%Transport%'` on the `category` column.

- [x] Add to `src/repositories/__tests__/expenseRepository.test.ts`: Test `ExpenseRepository.findAll({ dateFrom: '2026-01-01', dateTo: '2026-01-31' })`: assert `.gte('expense_date', '2026-01-01')` and `.lte('expense_date', '2026-01-31')` were called.

- [x] Add to `src/repositories/__tests__/expenseRepository.test.ts`: Test `ExpenseRepository.findAll({})` return shape: configure mock to return `{ data: [makeExpense()], error: null, count: 1 }`. Assert the returned value is `{ data: [makeExpense()], count: 1 }`.

### Order Repository Tests

- [x] Create `src/repositories/__tests__/orderRepository.test.ts`: Test `OrderRepository.create(input)`: assert `.from('orders').insert(input).select().single()` was called and returns the new order.

- [x] Add to `src/repositories/__tests__/orderRepository.test.ts`: Test `OrderRepository.findAll({ status: 'received' })`: assert `.eq('status', 'received')` was called.

- [x] Add to `src/repositories/__tests__/orderRepository.test.ts`: Test `OrderRepository.findAll({})` returns an array: configure mock to return `{ data: [makeOrder()], error: null }`. Assert the returned value is `[makeOrder()]`.

### Base Repository Tests

- [x] Create `src/repositories/__tests__/baseRepository.test.ts`: Instantiate `BaseRepository` (or a minimal concrete subclass) and assert that `this.supabase` is the imported Supabase client instance. This verifies dependency injection is wired correctly.

- [x] Add to `src/repositories/__tests__/baseRepository.test.ts`: If `BaseRepository` exposes shared methods such as `paginate(query, page, limit)` or `withCount(query)`, add one test per shared method verifying correct `.range()` or `.select('*', { count: 'exact' })` calls.

---

## Phase 6 — Service Layer Gap-Filling Tests

*Modify existing service test files. Each sub-section modifies exactly ONE file. Build on the mock patterns established in Phases 1 and 5.*

### invoiceService.test.ts

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test `fetchInvoices({})` default call: verify `supabase.from('invoices')` called, `.select` called with a string containing both `'*'` and `'customer:customers(name, phone)'`, `.order` called with `('created_at', { ascending: false })`, `.range` called with `(0, 19)`.

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test `fetchInvoices({ search: 'marble' })`: verify `.or` was called with a string containing `'%marble%'` referencing `invoice_number` and `customer_name`.

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test SQL injection protection — `fetchInvoices({ search: 'mar%ble' })`: verify the `%` character in the search term is escaped to `\%` in the `.or` call so it is treated as a literal percent sign, not a SQL wildcard.

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test SQL injection protection — `fetchInvoices({ search: 'mar_ble' })`: verify `_` is escaped to `\_` in the `.or` call.

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test `fetchInvoices({ payment_status: 'paid' })`: verify `.eq('payment_status', 'paid')` was called.

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test `fetchInvoices({ payment_status: 'ALL' })`: verify `.eq` was NOT called with `'payment_status'` as the first argument. `'ALL'` is the sentinel value for "no filter".

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test `fetchInvoices({ dateFrom: '2026-01-01', dateTo: '2026-03-31' })`: verify `.gte('invoice_date', '2026-01-01')` and `.lte('invoice_date', '2026-03-31')` were both called.

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test pagination — `fetchInvoices({}, 3, 10)` (page=3, limit=10): verify `.range(20, 29)` was called. Offset = `(3-1) * 10 = 20`, end = `20 + 10 - 1 = 29`.

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test `fetchInvoices({ sortBy: 'invoice_date', sortDir: 'asc' })`: verify `.order('invoice_date', { ascending: true })` was called.

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test `fetchInvoices` error path: configure supabase mock to return `{ data: null, error: { message: 'DB error' }, count: null }`. Assert the returned promise rejects.

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test `fetchInvoiceDetail('some-uuid')`: mock `invoiceRepository.findWithLineItems` and assert it was called with `'some-uuid'`. Assert the service returns the repository result.

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test `createInvoice` full payload — verify the `p_invoice` object passed to `rpc` includes: `place_of_supply`, `reverse_charge`, `payment_mode`, `notes`, `subtotal`, `total_tax`, `grand_total`, `cgst_total`, `sgst_total`, `igst_total`. Use `expect.objectContaining({...})`.

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test `createInvoice` line item payload — verify `p_line_items[0]` includes `cgst_amount`, `sgst_amount`, `igst_amount`, `taxable_amount`, `line_total`, and `sort_order: 0`.

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test `createInvoice` RPC error — configure `rpc` to return `{ data: null, error: { message: 'RPC failed' } }`. Assert the returned promise rejects with that error.

- [x] Add to `src/services/__tests__/invoiceService.test.ts`: Test `createInvoice` with no discount provided: verify the `p_line_items[0]` object in the RPC call contains `discount: 0`.

### customerService.test.ts

- [x] Add to `src/services/__tests__/customerService.test.ts`: Test `fetchCustomers({})`: verify `supabase.from('customers')` called, `.select` called, result contains `{ data: [...], count: N }`.

- [x] Add to `src/services/__tests__/customerService.test.ts`: Test `fetchCustomers({ search: 'John' })`: verify the search filter is applied (e.g., `.ilike` or `.or` called with `'%John%'`).

- [x] Add to `src/services/__tests__/customerService.test.ts`: Test `fetchCustomers` error path: configure mock to return an error. Assert the returned promise rejects.

- [x] Fix in `src/services/__tests__/customerService.test.ts`: Replace `rejects.toEqual(mockError)` in the existing `createCustomer` error test with `rejects.toMatchObject({ code: 'PGRST205' })` (or `rejects.toBeInstanceOf(AppError)` if the service wraps errors). This makes the assertion less brittle to error object structure changes.

- [x] Add to `src/services/__tests__/customerService.test.ts`: Test `updateCustomer(id, data)`: verify `.from('customers').update(data).eq('id', id)` was called and the service returns the updated customer.

- [x] Fix in `src/services/__tests__/customerService.test.ts`: Remove the unused `select_single` property from the `mockTable` object. This cleans up QA issue 7.5.

### inventoryService.test.ts

- [x] Add to `src/services/__tests__/inventoryService.test.ts`: Test `fetchItems({ category: 'GLOSSY' })`: verify `.eq('category', 'GLOSSY')` was called on the query builder.

- [x] Add to `src/services/__tests__/inventoryService.test.ts`: Test `fetchItems({ lowStock: true })`: verify `.lte('box_count', <threshold>)` was called with a numeric threshold.

- [x] Add to `src/services/__tests__/inventoryService.test.ts`: Test `updateItem(id, data)`: verify `.from('inventory_items').update(data).eq('id', id)` was called and the service returns the updated item.

- [x] Add to `src/services/__tests__/inventoryService.test.ts`: Test `deleteItem(id)`: verify `.from('inventory_items').delete().eq('id', id)` was called.

- [x] Add to `src/services/__tests__/inventoryService.test.ts`: Test `fetchStockHistory(itemId)`: verify the correct stock history table is queried with `.eq('item_id', itemId)` and `.order('created_at', { ascending: false })`.

- [x] Add to `src/services/__tests__/inventoryService.test.ts`: Test `getLowStockItems()`: verify `.lte('box_count', threshold)` is called and the result is returned.

- [x] Add to `src/services/__tests__/inventoryService.test.ts`: Test `performStockOperation` error path: configure `supabase.rpc` to reject. Assert the service propagates the rejection.

- [x] Fix in `src/services/__tests__/inventoryService.test.ts`: Replace any test that uses the `mockQuery.then` pattern (QA issue 3.2) for `fetchItemById` with a proper `.single().mockResolvedValue({ data: makeInventoryItem(), error: null })` chain. This resolves the broken thenable mock.

### financeService.test.ts

- [x] Add to `src/services/__tests__/financeService.test.ts`: Test `fetchExpenses({})` return value: configure mock to return `{ data: [makeExpense()], error: null, count: 1 }`. Assert the service returns an object containing `data` matching the mock data. The current test only checks filter calls — add the return value assertion.

- [x] Add to `src/services/__tests__/financeService.test.ts`: Test `fetchExpenses` error path: configure mock to return an error. Assert the returned promise rejects.

- [x] Add to `src/services/__tests__/financeService.test.ts`: Test `fetchPurchases({})`: verify the correct purchases/orders table is queried, returns `{ data: [...], count: N }`.

- [x] Add to `src/services/__tests__/financeService.test.ts`: Test `fetchPurchases({ search: 'Kajaria' })`: verify the search filter is applied on the correct column (design_name or party_name — check the actual implementation).

- [x] Add to `src/services/__tests__/financeService.test.ts`: Test `createExpense(data)`: verify `.from('expenses').insert(data).select().single()` was called.

- [x] Add to `src/services/__tests__/financeService.test.ts`: Test `createExpense` returns saved expense: configure mock to return `{ data: makeExpense(), error: null }`. Assert the return value has an `id` field.

- [x] Add to `src/services/__tests__/financeService.test.ts`: Test `createExpense` error path: configure mock to return an error. Assert the returned promise rejects.

### paymentService.test.ts

- [x] Fix in `src/services/__tests__/paymentService.test.ts`: Replace the hardcoded `payment_date: '2026-03-29'` in the test fixture with a dynamically computed date using `new Date().toISOString().split('T')[0]` or with a date known to always be in the past. This resolves QA issue 2.18.

- [x] Add to `src/services/__tests__/paymentService.test.ts`: Test `recordPayment` DB error propagation: configure `repo.recordWithInvoiceUpdate` to reject with `new Error('DB error')`. Assert the service propagates the error (does not swallow it).

- [x] Add to `src/services/__tests__/paymentService.test.ts`: Test `recordPayment` with `amount = 0`: check whether `PaymentSchema` allows zero. Assert either `ValidationError` is thrown (if 0 is invalid) or the RPC is called (if 0 is valid). The test description must state the business rule.

- [x] Add to `src/services/__tests__/paymentService.test.ts`: Test `recordPayment` with both `customer_id` and `supplier_id` absent: assert `ValidationError` is thrown (or `ZodError`) before the repository is called.

- [x] Add to `src/services/__tests__/paymentService.test.ts`: Test `fetchPayments({})`: mock `repo.fetchPayments` and assert it was called with the correct arguments. Assert the service returns the repo result.

### authService.test.ts

- [x] Add to `src/services/__tests__/authService.test.ts`: Test `signOut()`: mock `supabase.auth.signOut` to resolve with `{ error: null }`. Assert `supabase.auth.signOut` was called. Assert the method returns `undefined` (void).

- [x] Add to `src/services/__tests__/authService.test.ts`: Test `onAuthStateChange(callback)`: mock `supabase.auth.onAuthStateChange` to return a mock subscription object `{ data: { subscription: { unsubscribe: jest.fn() } } }`. Call `authService.onAuthStateChange(jest.fn())`. Assert `supabase.auth.onAuthStateChange` was called with the callback. Assert the subscription is returned to the caller.

- [x] Add to `src/services/__tests__/authService.test.ts`: Test `signIn` network error (rejected promise, not an auth error object): configure `supabase.auth.signInWithPassword` to reject with `new Error('Network request failed')`. Assert the service wraps this in `AppError` (or at minimum that the rejection propagates). This verifies network-level errors are handled, not just Supabase-level auth errors.

### exportService.test.ts

- [x] Add to `src/services/__tests__/exportService.test.ts`: Test `exportGSTR1` when `Sharing.isAvailableAsync()` returns `false`: assert `Sharing.shareAsync` is NOT called. Assert the method either shows an alert, resolves gracefully, or throws — document and assert whichever behavior is correct.

- [x] Add to `src/services/__tests__/exportService.test.ts`: Test `exportGSTR1` B2C row column structure: provide a single B2C invoice in the test data. Capture the CSV string passed to the file writer. Split by newline, find the row for this invoice, and assert it contains the expected values in the expected columns (invoice number, date, customer name, total value, GST rate, taxable value, IGST, CGST, SGST).

- [x] Add to `src/services/__tests__/exportService.test.ts`: Test `exportGSTR1` B2B row has GSTIN: provide a B2B invoice with `customer_gstin = '27AAAAA0000A1Z5'`. Assert the GSTIN column in the CSV row is `'27AAAAA0000A1Z5'`, not empty.

- [x] Add to `src/services/__tests__/exportService.test.ts`: Test `exportGSTR1` intra-state invoice: provide an invoice with `is_inter_state = false`. Assert the CGST and SGST columns are non-zero and the IGST column is `0` in the CSV row.

### orderService.test.ts

- [x] Add to `src/services/__tests__/orderService.test.ts`: Test `importOrder` when inventory item does NOT exist: mock `inventoryService.fetchItems` to return `{ data: [], count: 0 }`. Assert that `inventoryService.createItem` is called (a new item is created), and then `inventoryService.performStockOperation` is called.

- [x] Add to `src/services/__tests__/orderService.test.ts`: Test `importOrder` when order creation fails: mock `orderRepository.create` to reject. Assert the rejection propagates and `inventoryService.performStockOperation` is NOT called.

- [x] Add to `src/services/__tests__/orderService.test.ts`: Test `fetchOrders({ status: 'received' })`: verify `.eq('status', 'received')` is called on the query.

- [x] Add to `src/services/__tests__/orderService.test.ts`: Test `fetchOrders({})`: verify `.eq` is NOT called with a `'status'` argument when status is not provided.

- [x] Fix in `src/services/__tests__/orderService.test.ts`: Replace any test that uses the `mockQuery.then` pattern (QA issue 3.2) with a proper `mockResolvedValue(...)` on the terminal query method. This eliminates the broken thenable mock.

---

## Phase 7 — Store Layer Gap-Filling Tests

*Modify existing store test files. Each sub-section touches exactly ONE test file.*

### invoiceStore.test.ts

- [x] Add to `src/stores/__tests__/invoiceStore.test.ts`: Test `fetchInvoices` loading state — use a deferred promise: `let resolve; const p = new Promise(r => { resolve = r; }); mockFetchInvoices.mockReturnValue(p);`. Call `store.fetchInvoices({})` (do not await). Immediately assert `store.getState().loading === true`. Then `resolve([])` and await the store action. Assert `loading === false`.

- [x] Add to `src/stores/__tests__/invoiceStore.test.ts`: Test `fetchInvoices` failure: configure `invoiceService.fetchInvoices` to reject with `new Error('Network error')`. Await the store action. Assert `store.getState().error === 'Network error'` (or whatever string the store extracts), `store.getState().loading === false`, and `store.getState().invoices` remains unchanged from initial state.

- [x] Add to `src/stores/__tests__/invoiceStore.test.ts`: Test `createInvoice` failure: configure `invoiceService.createInvoice` to reject. Await the action. Assert `store.getState().error` is set, `loading === false`, and `store.getState().totalCount` is unchanged.

- [x] Add to `src/stores/__tests__/invoiceStore.test.ts`: Test filter update — call `store.getState().setFilters({ payment_status: 'paid' })`. Assert `store.getState().filters.payment_status === 'paid'`. Assert `invoiceService.fetchInvoices` was called with the updated filter object.

- [x] Fix in `src/stores/__tests__/invoiceStore.test.ts`: Add `fetchInvoiceDetail` to the `invoiceService` mock at the top of the file. Add a test: mock `invoiceService.fetchInvoiceDetail` to return `makeInvoice()`. Call `store.getState().fetchInvoiceDetail('inv-001')`. Assert the service was called with `'inv-001'` and `store.getState().selectedInvoice` equals the returned invoice.

### inventoryStore.test.ts

- [x] Fix in `src/stores/__tests__/inventoryStore.test.ts`: Remove the duplicate `expect(state.loading).toBe(false)` on line 37. Keep only one assertion. This resolves QA issue 2.3.

- [x] Add to `src/stores/__tests__/inventoryStore.test.ts`: Test `createItem(data)` success: mock `inventoryService.createItem` to return `makeInventoryItem({ id: 'new-item' })`. Await `store.getState().createItem(makeInventoryItemInput())`. Assert `store.getState().items[0].id === 'new-item'` (prepended), `store.getState().totalCount` incremented by 1, `loading === false`.

- [x] Add to `src/stores/__tests__/inventoryStore.test.ts`: Test `createItem(data)` failure: configure `inventoryService.createItem` to reject. Assert `store.getState().error` is set, `loading === false`, and `items` array is unchanged.

- [x] Add to `src/stores/__tests__/inventoryStore.test.ts`: Test `updateItem(id, data)` success: seed the store with `[makeInventoryItem({ id: 'item-1', box_count: 10 })]`. Mock `inventoryService.updateItem` to return `makeInventoryItem({ id: 'item-1', box_count: 20 })`. Await `store.getState().updateItem('item-1', { box_count: 20 })`. Assert `store.getState().items[0].box_count === 20` (in-place update, same index), `loading === false`.

- [x] Add to `src/stores/__tests__/inventoryStore.test.ts`: Test `deleteItem(id)` success: seed the store with two items. Mock `inventoryService.deleteItem` to resolve. Await `store.getState().deleteItem('item-1')`. Assert the item with id `'item-1'` is no longer in `items`, `totalCount` decremented by 1.

- [x] Add to `src/stores/__tests__/inventoryStore.test.ts`: Test `performStockOperation` failure: configure `inventoryService.performStockOperation` to reject. Assert `store.getState().error` is set, `loading === false`, and the target item's `box_count` is NOT modified.

### authStore.test.ts

- [x] Add to `src/stores/__tests__/authStore.test.ts`: Test `login` failure path: configure `authService.signIn` to reject with `new Error('Invalid credentials')`. Await `store.getState().login('a@b.com', 'wrong')`. Assert `store.getState().isAuthenticated === false`, `store.getState().user === null`, `store.getState().loading === false`.

- [x] Add to `src/stores/__tests__/authStore.test.ts`: Test `login` loading state: use deferred promise pattern. Call `store.getState().login(...)` (do not await). Assert `store.getState().loading === true` synchronously. Resolve the deferred promise. Assert `loading === false`.

- [x] Add to `src/stores/__tests__/authStore.test.ts`: Test `register(email, password)`: mock `authService.signUp` to return `{ user: makeUser(), session: makeSession() }`. Await `store.getState().register('a@b.com', 'password')`. Assert `authService.signUp` was called with `('a@b.com', 'password')` and `store.getState().user` is not null.

- [x] Add to `src/stores/__tests__/authStore.test.ts`: Test `logout`: mock `authService.signOut` to resolve. Await `store.getState().logout()`. Assert `authService.signOut` was called and `store.getState().isAuthenticated === false`.

### customerStore.test.ts

- [x] Add to `src/stores/__tests__/customerStore.test.ts`: Test `fetchCustomers({})` success: configure `customerService.fetchCustomers` to return `{ data: [makeCustomer()], count: 1 }`. Await `store.getState().fetchCustomers({})`. Assert `store.getState().customers` has length 1, `store.getState().totalCount === 1`, `loading === false`.

- [x] Add to `src/stores/__tests__/customerStore.test.ts`: Test `fetchCustomers` failure: configure service to reject. Assert `store.getState().error` is set, `loading === false`, and `customers` array is unchanged.

- [x] Add to `src/stores/__tests__/customerStore.test.ts`: Test `createCustomer` loading state: use deferred promise. Call (do not await). Assert `loading === true`. Resolve. Assert `loading === false`.

### financeStore.test.ts

- [x] Add to `src/stores/__tests__/financeStore.test.ts`: Test `fetchExpenses` failure: configure `financeService.fetchExpenses` to reject. Assert `store.getState().error` is set, `loading === false`.

- [x] Add to `src/stores/__tests__/financeStore.test.ts`: Test `fetchPurchases({})` success: configure `financeService.fetchPurchases` to return `{ data: [], count: 0 }`. Await `store.getState().fetchPurchases({})`. Assert `store.getState().purchases` is updated.

- [x] Add to `src/stores/__tests__/financeStore.test.ts`: Test `addExpense` failure: configure `financeService.createExpense` to reject. Assert `store.getState().error` is set and `store.getState().expenses` is NOT modified.

### orderStore.test.ts

- [x] Add to `src/stores/__tests__/orderStore.test.ts`: Test `fetchOrders` failure: configure `orderService.fetchOrders` to reject. Assert `store.getState().error` is set, `loading === false`.

- [x] Add to `src/stores/__tests__/orderStore.test.ts`: Test `importParsedData` failure: configure `orderService.importOrder` to reject. Assert `store.getState().error` is set.

### dashboardStore.test.ts

- [x] Fix in `src/stores/__tests__/dashboardStore.test.ts`: Replace all `await Promise.resolve()` microtask-flush patterns with `await waitFor(() => expect(dashboardService.fetchDashboardStats).toHaveBeenCalled())` from `@testing-library/react-native`. This resolves the flaky async test pattern described in QA issue 5.4.

- [x] Add to `src/stores/__tests__/dashboardStore.test.ts`: Test event listener cleanup — after calling the store teardown (or the unsubscribe function returned from the event bus), emit `{ type: 'INVOICE_CREATED', invoiceId: 'inv-1' }` again. Assert `dashboardService.fetchDashboardStats` was NOT called an additional time. This resolves QA issue 5.5.

- [x] Add `afterEach` cleanup to `src/stores/__tests__/dashboardStore.test.ts`: Store the unsubscribe function returned when the store subscribes to the eventBus. In `afterEach`, call that unsubscribe function to remove the listener. If the store does not expose the unsubscribe function, mock `eventBus.on` to capture and return a mock unsubscriber. This prevents listener leaks between tests.

---

## Phase 8 — Custom Hook Tests (All New Files)

*Standalone new test files. No modifications to existing tests.*

### useDebounce

- [x] Create `src/hooks/__tests__/useDebounce.test.ts`: Test initial value: render `useDebounce('initial', 300)` with `renderHook`. Assert the returned value equals `'initial'` immediately without advancing timers.

- [x] Add to `src/hooks/__tests__/useDebounce.test.ts`: Test value does NOT update before delay: call `renderHook` with initial `value = 'first'`, then `rerender` with `value = 'second'`. Use `jest.useFakeTimers()` and `jest.advanceTimersByTime(299)`. Assert the returned value is still `'first'`.

- [x] Add to `src/hooks/__tests__/useDebounce.test.ts`: Test value updates after delay: advance timers by 1ms more (total 300ms). Assert the returned value is now `'second'`.

- [x] Add to `src/hooks/__tests__/useDebounce.test.ts`: Test rapid updates — only the final value is applied: change value to `'a'`, `'b'`, `'c'` in quick succession without advancing timers. Advance by 300ms. Assert the returned value is `'c'` (intermediate values `'a'` and `'b'` were debounced away).

- [x] Add to `src/hooks/__tests__/useDebounce.test.ts`: Test changing delay resets the timer: start with `delay = 300`. Change `value` to `'new'`. Advance by 200ms. Change `delay` to `500`. Assert value is still `'initial'`. Advance by 499ms. Assert still `'initial'`. Advance by 1ms (total 500ms from delay change). Assert value is `'new'`.

### useNetworkStatus

- [x] Create `src/hooks/__tests__/useNetworkStatus.test.ts`: Test initial connected state: mock `@react-native-community/netinfo` to emit an initial event with `isConnected: true`. Render `useNetworkStatus`. Assert the returned `isConnected` is `true`.

- [x] Add to `src/hooks/__tests__/useNetworkStatus.test.ts`: Test disconnection: capture the NetInfo event listener registered by the hook. Emit `{ isConnected: false }` via the mock listener. Assert `isConnected` becomes `false` using `act()`.

- [x] Add to `src/hooks/__tests__/useNetworkStatus.test.ts`: Test reconnection: after emitting disconnected, emit `{ isConnected: true }`. Assert `isConnected` returns to `true`.

- [x] Add to `src/hooks/__tests__/useNetworkStatus.test.ts`: Test listener cleanup on unmount: capture the `removeEventListener` (or `unsubscribe`) call on the NetInfo mock. `unmount()` the hook. Assert `unsubscribe` or `removeEventListener` was called. This verifies no memory leak.

### useRefreshOnFocus

- [x] Create `src/hooks/__tests__/useRefreshOnFocus.test.ts`: Test refetch is NOT called on initial render: pass a `refetch = jest.fn()` to `useRefreshOnFocus`. Assert `refetch` was not called immediately after render.

- [x] Add to `src/hooks/__tests__/useRefreshOnFocus.test.ts`: Test refetch IS called when screen comes into focus: mock `@react-navigation/native`'s `useFocusEffect` so the registered callback is captured. Simulate a focus event by calling the captured callback. Assert `refetch` was called once.

- [x] Add to `src/hooks/__tests__/useRefreshOnFocus.test.ts`: Test refetch is NOT called when screen loses focus: simulate a blur/unfocus event via the mock. Assert `refetch` remains uncalled (or not called an additional time if it was called on prior focus).

### useConfirmBack

- [x] Create `src/hooks/__tests__/useConfirmBack.test.ts`: Test clean form (no changes) — pressing back navigates immediately: render `useConfirmBack({ isDirty: false })`. Trigger the hardware back press event (simulate via the `BackHandler` mock). Assert `router.back()` or `navigation.goBack()` was called without showing an `Alert`.

- [x] Add to `src/hooks/__tests__/useConfirmBack.test.ts`: Test dirty form — pressing back shows confirmation Alert: render `useConfirmBack({ isDirty: true })`. Trigger back press. Assert `Alert.alert` was called. Assert navigation was NOT called yet.

- [x] Add to `src/hooks/__tests__/useConfirmBack.test.ts`: Test confirming alert triggers navigation: capture the `Alert.alert` call. Find the confirm button's `onPress` handler in the `Alert.alert` call arguments. Call it. Assert `router.back()` or equivalent was then called.

- [x] Add to `src/hooks/__tests__/useConfirmBack.test.ts`: Test cancelling alert does NOT navigate: find the cancel button's `onPress` handler. Call it. Assert `router.back()` was NOT called.

### useLocale

- [x] Create `src/hooks/__tests__/useLocale.test.ts`: Test `formatCurrency(1000)`: render `useLocale` with `renderHook`. Call `result.current.formatCurrency(1000)`. Assert the result equals `'₹1,000.00'` (or `'₹1,000'` — match the actual output and document the expected format).

- [x] Add to `src/hooks/__tests__/useLocale.test.ts`: Test `formatDate('2026-03-29')`: call `result.current.formatDate('2026-03-29')`. Assert the result is a non-empty human-readable string (e.g., `'29 Mar 2026'` or `'March 29, 2026'` — assert the actual format).

- [x] Add to `src/hooks/__tests__/useLocale.test.ts`: Test `toggleLanguage()`: assert initial `currentLanguage === 'en'`. Call `result.current.toggleLanguage()`. Assert `currentLanguage === 'hi'`. Call again. Assert `currentLanguage === 'en'`.

- [x] Add to `src/hooks/__tests__/useLocale.test.ts`: Test `t('common.save')` returns a translated string: assert `result.current.t('common.save')` is not the raw key string `'common.save'` but a human-readable value like `'Save'`.

---

## Phase 9 — Component Tests (All New Files)

*New test files for untested components. All use `renderWithTheme` from Phase 2.*

### Atom Components

- [ ] Create `src/components/atoms/__tests__/Badge.test.tsx`: Import `makeTestId` if the component uses testIDs. Test renders label text: `render(<Badge label="Paid" variant="success" />)`. Assert `getByText('Paid')` is present.

- [ ] Add to `src/components/atoms/__tests__/Badge.test.tsx`: Test `variant="success"` applies green color: use `renderWithTheme` and `getByTestId` (add `testID="badge"` to the component if missing). Assert the component's style contains a green background or text color token.

- [ ] Add to `src/components/atoms/__tests__/Badge.test.tsx`: Test `variant="error"` applies red color: same pattern, assert red color token.

- [ ] Add to `src/components/atoms/__tests__/Badge.test.tsx`: Test `variant="warning"` applies amber/yellow color.

- [ ] Create `src/components/atoms/__tests__/Chip.test.tsx`: Test renders label text: `render(<Chip label="GST 18%" />)`. Assert `getByText('GST 18%')`.

- [ ] Add to `src/components/atoms/__tests__/Chip.test.tsx`: Test `onPress` called when pressed: `const onPress = jest.fn(); render(<Chip label="test" onPress={onPress} />); fireEvent.press(getByText('test')); expect(onPress).toHaveBeenCalledTimes(1)`.

- [ ] Add to `src/components/atoms/__tests__/Chip.test.tsx`: Test `disabled=true` — `onPress` NOT called: render with `disabled={true}`. Fire press event. Assert `onPress` was not called.

- [ ] Add to `src/components/atoms/__tests__/Chip.test.tsx`: Test `selected=true` applies selected styling: assert the wrapper element has a different background color or border token compared to the unselected state.

- [ ] Create `src/components/atoms/__tests__/OfflineBanner.test.tsx`: Test does NOT render when `isConnected=true`: `render(<OfflineBanner isConnected={true} />)`. Assert `queryByText(/offline/i)` returns `null`.

- [ ] Add to `src/components/atoms/__tests__/OfflineBanner.test.tsx`: Test DOES render when `isConnected=false`: render with `isConnected={false}`. Assert `getByText(/offline/i)` (or the actual offline message text) is present.

- [ ] Add to existing `src/components/atoms/__tests__/TextInput.test.tsx` (or create): Test `onChangeText` called when user types: `fireEvent.changeText(getByTestId('input'), 'hello')`. Assert `onChangeText` was called with `'hello'`.

- [ ] Add to `src/components/atoms/__tests__/TextInput.test.tsx`: Test error message shown when `error` prop provided: render with `error="This field is required"`. Assert `getByText('This field is required')` is present.

- [ ] Add to `src/components/atoms/__tests__/TextInput.test.tsx`: Test error text NOT shown when `error` is undefined: render without `error` prop. Assert `queryByText(/required/i)` returns `null`.

- [ ] Add to `src/components/atoms/__tests__/TextInput.test.tsx`: Test `secureTextEntry=true`: assert the input element has the `secureTextEntry` prop set to `true` (inspect via `toHaveAccessibilityValue` or `getByDisplayValue` with masked output).

### Molecule Components

- [ ] Create `src/components/molecules/__tests__/SearchBar.test.tsx`: Test renders with placeholder text: `render(<SearchBar placeholder="Search invoices..." value="" onChangeText={jest.fn()} />)`. Assert `getByPlaceholderText('Search invoices...')` is present.

- [ ] Add to `src/components/molecules/__tests__/SearchBar.test.tsx`: Test calls `onChangeText` with typed value: `fireEvent.changeText(getByPlaceholderText('Search invoices...'), 'marble')`. Assert `onChangeText` called with `'marble'`.

- [ ] Add to `src/components/molecules/__tests__/SearchBar.test.tsx`: Test clear button NOT visible when value is empty: render with `value=""`. Assert `queryByTestId('search-clear-button')` (or equivalent) returns `null`.

- [ ] Add to `src/components/molecules/__tests__/SearchBar.test.tsx`: Test clear button IS visible when value is non-empty: render with `value="marble"`. Assert the clear button is present.

- [ ] Add to `src/components/molecules/__tests__/SearchBar.test.tsx`: Test pressing clear button calls `onClear` (or sets value to `''`): render with `value="marble"` and `onClear={jest.fn()}`. Press the clear button. Assert `onClear` was called.

- [ ] Create `src/components/molecules/__tests__/FormField.test.tsx`: Test renders label text: `render(<FormField label="Invoice Date"><TextInput /></FormField>)`. Assert `getByText('Invoice Date')` is present.

- [ ] Add to `src/components/molecules/__tests__/FormField.test.tsx`: Test renders children: assert the child `TextInput` (or `getByTestId`) is present inside the rendered output.

- [ ] Add to `src/components/molecules/__tests__/FormField.test.tsx`: Test renders error message below when `error` prop provided: render with `error="Date is required"`. Assert `getByText('Date is required')` is present.

- [ ] Add to `src/components/molecules/__tests__/FormField.test.tsx`: Test does NOT render error slot when no error: render without `error`. Assert no error text appears in the output.

- [ ] Create `src/components/molecules/__tests__/EmptyState.test.tsx`: Test renders title text: `render(<EmptyState title="No invoices yet" />)`. Assert `getByText('No invoices yet')`.

- [ ] Add to `src/components/molecules/__tests__/EmptyState.test.tsx`: Test renders subtitle when provided: render with `subtitle="Create your first invoice"`. Assert `getByText('Create your first invoice')`.

- [ ] Add to `src/components/molecules/__tests__/EmptyState.test.tsx`: Test renders action button when `actionLabel` and `onAction` provided: render with `actionLabel="Create Invoice"` and `onAction={jest.fn()}`. Assert `getByText('Create Invoice')` is present.

- [ ] Add to `src/components/molecules/__tests__/EmptyState.test.tsx`: Test action button calls `onAction` when pressed: press the button. Assert `onAction` was called once.

- [ ] Add to `src/components/molecules/__tests__/EmptyState.test.tsx`: Test no action button when `actionLabel` not provided: render without `actionLabel`. Assert `queryByRole('button')` returns `null`.

### Organism Components

- [ ] Create `src/components/organisms/__tests__/PaymentModal.test.tsx`: Test does NOT render content when `visible=false`: render with `visible={false}`. Assert the modal content (e.g., `queryByText('Record Payment')`) returns `null`. This depends on the Modal mock fix from Phase 1.

- [ ] Add to `src/components/organisms/__tests__/PaymentModal.test.tsx`: Test DOES render content when `visible=true`: render with `visible={true}` and a test invoice. Assert `getByText('Record Payment')` (or the modal title) is present.

- [ ] Add to `src/components/organisms/__tests__/PaymentModal.test.tsx`: Test renders the invoice total amount: render with `invoice={{ grand_total: 5900, ... }}`. Assert `getByText('₹5,900.00')` or equivalent is present.

- [ ] Add to `src/components/organisms/__tests__/PaymentModal.test.tsx`: Test calls `onRecordPayment` with correct amount and mode when submitted: fill in the amount field with `'2000'`, select payment mode `'UPI'`, press Submit. Assert `onRecordPayment` was called with `{ amount: 2000, payment_mode: 'upi' }`.

- [ ] Add to `src/components/organisms/__tests__/PaymentModal.test.tsx`: Test shows validation error when amount is empty and submit pressed: clear the amount field, press Submit. Assert an error message (e.g., `'Amount is required'`) is visible and `onRecordPayment` was NOT called.

- [ ] Add to `src/components/organisms/__tests__/PaymentModal.test.tsx`: Test calls `onClose` when cancel button pressed: press the Cancel button. Assert `onClose` was called.

- [ ] Create `src/components/organisms/__tests__/RecentInvoicesList.test.tsx`: Test renders invoice items with invoice number, customer name, and amount: render with `invoices={[makeInvoiceListItem()]}`. Assert `getByText('TM/2025-26/0001')`, `getByText('Test Customer')`, and the formatted amount are present.

- [ ] Add to `src/components/organisms/__tests__/RecentInvoicesList.test.tsx`: Test calls `onPressInvoice(id)` when row is tapped: render with one invoice. `fireEvent.press(getByText('TM/2025-26/0001'))`. Assert `onPressInvoice` was called with `'inv-uuid-001'`.

- [ ] Add to `src/components/organisms/__tests__/RecentInvoicesList.test.tsx`: Test renders `EmptyState` when invoices array is empty: render with `invoices={[]}`. Assert the `EmptyState` component or an "no invoices" text message is present.

- [ ] Add to `src/components/organisms/__tests__/RecentInvoicesList.test.tsx`: Test correct Badge variant for `payment_status='paid'`: render with an invoice where `payment_status = 'paid'`. Assert the Badge component has `variant='success'` (or inspect via the text content of the badge).

- [ ] Add to `src/components/organisms/__tests__/RecentInvoicesList.test.tsx`: Test Badge variant for `payment_status='unpaid'`: assert `variant='error'` or equivalent.

- [ ] Add to `src/components/organisms/__tests__/RecentInvoicesList.test.tsx`: Test Badge variant for `payment_status='partial'`: assert `variant='warning'` or equivalent.

---

## Phase 10 — Screen / Feature Tests (Fixes and New Files)

*Fix existing UI tests and add new screen tests. All use fixtures from Phase 2 and `renderWithTheme` from Phase 2.*

### Replace Local renderWithTheme in All Existing UI Tests

- [ ] Fix in `__tests__/ui/auth/login.test.tsx`: Remove the local `renderWithTheme` definition at the top of the file. Replace with `import { renderWithTheme } from '../../utils/renderWithTheme'`. Verify all tests pass.

- [ ] Fix in `__tests__/ui/auth/setup.test.tsx`: Same — remove local `renderWithTheme`, import from shared utility.

- [ ] Fix in `__tests__/ui/customers/add.test.tsx`: Same.

- [ ] Fix in `__tests__/ui/customers/index.test.tsx`: Same.

- [ ] Fix in `__tests__/ui/finance/expenses.test.tsx`: Same.

- [ ] Fix in `__tests__/ui/inventory/list.test.tsx`: Same.

- [ ] Fix in `__tests__/ui/inventory/stock-op.test.tsx`: Same.

- [ ] Fix in `__tests__/ui/invoices/create.test.tsx`: Same.

- [ ] Fix in `__tests__/ui/invoices/list.test.tsx`: Same.

- [ ] Fix in `__tests__/ui/invoices/[id].test.tsx`: Same.

- [ ] Fix in `__tests__/ui/orders/import.test.tsx`: Same.

- [ ] Fix in `__tests__/ui/orders/index.test.tsx`: Same.

### Fix login.test.tsx

- [ ] Fix in `__tests__/ui/auth/login.test.tsx`: Replace `getAllByText('Sign In')[1]` with `getByRole('button', { name: 'Sign In' })`. If the component does not have an accessible role on the button, add `accessibilityRole="button"` to the submit button in the component and add `testID="login-submit-button"` as a fallback. Update the test to use `getByTestId('login-submit-button')` if `getByRole` is not feasible. This resolves QA issue 2.4.

### Fix setup.test.tsx

- [ ] Fix in `__tests__/ui/auth/setup.test.tsx`: Replace any direct `supabase` mock calls with a mock of `businessProfileService.upsert` (i.e., `jest.mock('../../services/businessProfileService', () => ({ upsert: jest.fn() }))`). Adjust test assertions to verify `businessProfileService.upsert` is called rather than a specific Supabase table insert. This resolves QA issue 2.16.

- [ ] Add to `__tests__/ui/auth/setup.test.tsx`: Test `register` failure — mock `register` (from `authStore`) to reject. Submit the setup form. Assert an error message is displayed to the user and the screen remains on step 1 (does not advance).

### Fix invoices/create.test.tsx

- [ ] Fix in `__tests__/ui/invoices/create.test.tsx`: Remove both `// @ts-ignore` comments. Type the store mock correctly using `jest.mocked(useInventoryStore)` and `jest.mocked(useInvoiceStore)`. This resolves QA issue 7.2.

- [ ] Fix in `__tests__/ui/invoices/create.test.tsx`: Replace all `as any` usages in `mockCreateInvoice` calls with properly typed `makeInvoiceInput()` from Phase 2 fixtures. This resolves QA issue 7.1.

- [ ] Add to `__tests__/ui/invoices/create.test.tsx`: Test pressing "Next" on Step 1 with empty customer name does NOT advance to Step 2: render the create screen, clear the customer name field, press the "Next" button. Assert the Step 1 form is still visible (not Step 2).

- [ ] Add to `__tests__/ui/invoices/create.test.tsx`: Test pressing "Next" on Step 2 with no line items does NOT advance to Step 3: navigate to Step 2 (fill in valid customer data), do not add any line items, press "Next". Assert Step 2 is still visible.

- [ ] Add to `__tests__/ui/invoices/create.test.tsx`: Test `payment_status` is `'unpaid'` when `amount_paid = 0`: complete the full 3-step flow with `amount_paid = 0`. Assert `invoiceStore.createInvoice` was called with a payload where `payment_status === 'unpaid'`.

### Fix / Create inventory/[id].test.tsx

- [ ] Fix or create `__tests__/ui/inventory/[id].test.tsx`: Test renders item `design_name`, `box_count`, and `category`: mock `inventoryStore.selectedItem` with `makeInventoryItem()`. Render the screen. Assert `getByText('GLOSSY WHITE 60x60')`, `getByText('50')` (or formatted box count), and `getByText('GLOSSY')` are present.

- [ ] Add to `__tests__/ui/inventory/[id].test.tsx`: Test renders stock history entries: mock stock history with 2 entries. Assert both entries appear in the list.

- [ ] Add to `__tests__/ui/inventory/[id].test.tsx`: Test "Stock In" button navigates to stock-op screen: press the "Stock In" button. Assert `router.push` was called with a path containing `'stock-op'`, the item `id`, and `type=stock_in`.

- [ ] Add to `__tests__/ui/inventory/[id].test.tsx`: Test "Stock Out" button navigates with `type=stock_out`.

### Create inventory/add.test.tsx

- [ ] Create `__tests__/ui/inventory/add.test.tsx`: Test form renders with all required fields: assert `getByPlaceholderText` (or `getByLabelText`) for design_name, category selector, and selling_price fields are all present.

- [ ] Add to `__tests__/ui/inventory/add.test.tsx`: Test submitting with empty design_name shows validation error and does NOT call `createItem`: clear the design_name field, press Submit. Assert an error message is shown. Assert `inventoryStore.createItem` was NOT called.

- [ ] Add to `__tests__/ui/inventory/add.test.tsx`: Test submitting valid form calls `inventoryStore.createItem` with correct data: fill in `design_name = 'NEW TILE'`, `selling_price = '800'`, select a `category`. Press Submit. Assert `inventoryStore.createItem` was called with an object containing `{ design_name: 'NEW TILE', selling_price: 800 }`.

- [ ] Add to `__tests__/ui/inventory/add.test.tsx`: Test on success navigates back: mock `createItem` to resolve. Submit form. Assert `router.back()` was called.

- [ ] Add to `__tests__/ui/inventory/add.test.tsx`: Test on failure shows alert: mock `createItem` to reject with `new Error('DB error')`. Submit form. Assert `Alert.alert` was called with a message containing `'DB error'` or an error indicator.

### Create finance/purchases.test.tsx

- [ ] Create `__tests__/ui/finance/purchases.test.tsx` (or verify and expand if existing): Test renders list of purchase entries: mock `financeStore.purchases` with `[makeOrder()]`. Render the screen. Assert `getByText('Test Party')` (or whatever the order party name is).

- [ ] Add to `__tests__/ui/finance/purchases.test.tsx`: Test shows empty state when no purchases: mock `financeStore.purchases` as `[]`. Assert the `EmptyState` component or "no purchases" text is present.

- [ ] Add to `__tests__/ui/finance/purchases.test.tsx`: Test calls `fetchPurchases` on mount: render the screen. Assert `financeStore.fetchPurchases` was called.

### Create dashboard/index.test.tsx

- [ ] Create `__tests__/ui/dashboard/index.test.tsx`: Test renders `today_sales` stat: mock `dashboardStore.stats` with `makeDashboardStats({ today_sales: 12345 })`. Render. Assert `getByText('₹12,345.00')` or the formatted value is present.

- [ ] Add to `__tests__/ui/dashboard/index.test.tsx`: Test renders `total_outstanding_credit` stat: assert the credit stat value from `makeDashboardStats()` is visible.

- [ ] Add to `__tests__/ui/dashboard/index.test.tsx`: Test renders `low_stock_count` stat: assert `getByText('3')` (or the formatted low stock count) is visible.

- [ ] Add to `__tests__/ui/dashboard/index.test.tsx`: Test renders loading state while fetching: mock `dashboardStore.loading = true`. Assert a loading indicator (`ActivityIndicator` or skeleton) is present.

- [ ] Add to `__tests__/ui/dashboard/index.test.tsx`: Test renders error state if fetch fails: mock `dashboardStore.error = 'Failed to load'`. Assert the error message is displayed.

- [ ] Add to `__tests__/ui/dashboard/index.test.tsx`: Test calls `fetchStats` on mount: render the screen. Assert `dashboardStore.fetchStats` (or equivalent action) was called.

### Clean Up Stale Tests

- [ ] Fix `src/__tests__/ui/InvoiceCreateFlow.test.tsx`: Either delete the file entirely (preferred — all its cases are now covered by `__tests__/ui/invoices/create.test.tsx`) OR remove the `describe.skip(...)` wrapper, remove every `expect(true).toBe(true)` placeholder, and write real assertions for each test case. Do NOT leave `describe.skip` with placeholder bodies in the codebase. This resolves QA issues 2.1 and 2.2.

- [ ] Clean up `src/__tests__/ui/` directory: open `src/__tests__/ui/InventoryScreen.test.tsx` and `src/__tests__/ui/InvoicesScreen.test.tsx`. If they contain only `describe.skip` blocks or placeholder tests, delete both files. If they contain real tests not duplicated elsewhere, migrate them to `__tests__/ui/` following the established directory convention, then delete the originals from `src/__tests__/ui/`.

- [ ] After cleanup: remove `testPathIgnorePatterns: ['<rootDir>/src/__tests__/ui/']` from `jest.config.js` (added in Phase 0) once the directory is empty or fully migrated.

---

## Phase 11 — Feature Hook Tests

*New test file only for the invoice create wizard hook.*

### useInvoiceCreateFlow

- [ ] Create `src/features/invoice-create/__tests__/useInvoiceCreateFlow.test.ts`: Test initial state — render `renderHook(() => useInvoiceCreateFlow())`. Assert `result.current.step === 1`, `result.current.customerData === null`, `result.current.lineItems` is an empty array `[]`, `result.current.paymentData === null`.

- [ ] Add to `src/features/invoice-create/__tests__/useInvoiceCreateFlow.test.ts`: Test `goToStep(2)` without customerData — call `act(() => result.current.goToStep(2))`. Assert `result.current.step === 1` (guard prevents advancement).

- [ ] Add to `src/features/invoice-create/__tests__/useInvoiceCreateFlow.test.ts`: Test `setCustomerData` then `goToStep(2)` — call `act(() => result.current.setCustomerData({ name: 'John', phone: '9876543210' }))`. Then `act(() => result.current.goToStep(2))`. Assert `result.current.step === 2`.

- [ ] Add to `src/features/invoice-create/__tests__/useInvoiceCreateFlow.test.ts`: Test `goToStep(3)` without lineItems — from step 2, call `act(() => result.current.goToStep(3))`. Assert `result.current.step === 2` (no line items means cannot advance).

- [ ] Add to `src/features/invoice-create/__tests__/useInvoiceCreateFlow.test.ts`: Test `addLineItem(item)` — call `act(() => result.current.addLineItem(makeInvoiceLineItemInput()))`. Assert `result.current.lineItems.length === 1`. Call again. Assert `result.current.lineItems.length === 2`.

- [ ] Add to `src/features/invoice-create/__tests__/useInvoiceCreateFlow.test.ts`: Test `removeLineItem(index)` — add two items, then `act(() => result.current.removeLineItem(0))`. Assert `result.current.lineItems.length === 1` and the remaining item is the one that was originally at index 1.

- [ ] Add to `src/features/invoice-create/__tests__/useInvoiceCreateFlow.test.ts`: Test `updateLineItem(index, data)` — add two items. Update index 0 with `{ quantity: 99 }`. Assert `result.current.lineItems[0].quantity === 99` and `result.current.lineItems[1]` is unchanged.

- [ ] Add to `src/features/invoice-create/__tests__/useInvoiceCreateFlow.test.ts`: Test `submitInvoice` calls `invoiceStore.createInvoice` with merged data: mock `invoiceStore.createInvoice`. Set customer data, add a line item, set payment data. Call `act(async () => result.current.submitInvoice())`. Assert `invoiceStore.createInvoice` was called with an object containing the customer data, line items, and payment data merged together.

- [ ] Add to `src/features/invoice-create/__tests__/useInvoiceCreateFlow.test.ts`: Test `submitInvoice` sets `submitting=true` during submission: use deferred promise for `invoiceStore.createInvoice`. Call `submitInvoice()` (do not await). Assert `result.current.submitting === true`. Resolve the deferred. Assert `result.current.submitting === false`.

- [ ] Add to `src/features/invoice-create/__tests__/useInvoiceCreateFlow.test.ts`: Test `submitInvoice` on failure — mock `invoiceStore.createInvoice` to reject with `new Error('Submit failed')`. Await the submit call. Assert `result.current.submitting === false` and `result.current.error === 'Submit failed'` (or the error message).

---

## Phase 12 — Integration Tests

*New test files that cross service + store + event bus. Mock only the Supabase boundary.*

### Invoice Creation Flow Integration

- [ ] Create `__tests__/integration/invoiceCreationFlow.test.ts`: Setup: mock only `../../src/config/supabase` (the true DB boundary) and `expo-router`. Import real `invoiceStore`, `invoiceService`, `invoiceRepository` (not mocked). Configure the Supabase `rpc` mock to return `{ data: { id: 'new-inv', invoice_number: 'TM/2025-26/0001' }, error: null }`.

- [ ] Add to `__tests__/integration/invoiceCreationFlow.test.ts`: Test full call chain: call `useInvoiceStore.getState().createInvoice(makeInvoiceInput())`. Assert `supabase.rpc` was called with `'create_invoice_with_items_v1'`. Assert the call traversed: `store.createInvoice` → `invoiceService.createInvoice` → `invoiceRepository.createAtomic` → `supabase.rpc`.

- [ ] Add to `__tests__/integration/invoiceCreationFlow.test.ts`: Test event propagation: after `createInvoice` resolves, assert that `eventBus` emitted `INVOICE_CREATED` and that the `dashboardStore.fetchStats` was subsequently called (mock `dashboardService.fetchDashboardStats` and verify it was triggered by the event).

- [ ] Add to `__tests__/integration/invoiceCreationFlow.test.ts`: Test ValidationError propagation: call `useInvoiceStore.getState().createInvoice({ ...makeInvoiceInput(), customer_name: '' })` (invalid input). Assert the promise rejects with a `ValidationError` (or Zod error) and `invoiceStore.getState().error` is set. Assert `supabase.rpc` was NOT called.

### Stock Operation Flow Integration

- [ ] Create `__tests__/integration/stockOperationFlow.test.ts`: Setup: mock only `supabase`. Configure `supabase.rpc('perform_stock_operation_v1', ...)` to return `{ data: { new_box_count: 60 }, error: null }`.

- [ ] Add to `__tests__/integration/stockOperationFlow.test.ts`: Test `useInventoryStore.getState().performStockOperation('item-1', 'stock_in', 10, 'Purchase arrival')` → calls `inventoryService.performStockOperation` → calls `supabase.rpc('perform_stock_operation_v1', ...)` with params containing `p_item_id`, `p_operation_type`, `p_quantity_change`, `p_reason`. Assert all params are passed correctly.

- [ ] Add to `__tests__/integration/stockOperationFlow.test.ts`: Test event emitted after stock operation: after `performStockOperation` resolves, assert `eventBus` emitted `STOCK_CHANGED` and `dashboardStore.fetchStats` was called in response.

### Payment Recording Flow Integration

- [ ] Create `__tests__/integration/paymentRecordingFlow.test.ts`: Setup: mock only `supabase`. Configure `supabase.rpc('record_payment_v1', ...)` to return `{ data: { id: 'pay-001', new_status: 'paid' }, error: null }`.

- [ ] Add to `__tests__/integration/paymentRecordingFlow.test.ts`: Test `paymentService.recordPayment(makePaymentInput())` → calls `paymentRepository.recordWithInvoiceUpdate` → calls `supabase.rpc`. Assert the full chain fires with correct params.

- [ ] Add to `__tests__/integration/paymentRecordingFlow.test.ts`: Test event and dashboard refresh: after recording the payment, assert `eventBus` emitted a payment-related event and `dashboardStore.fetchStats` was triggered.

---

## Phase 13 — E2E Infrastructure Setup

*Pure setup and configuration. No test logic implemented yet — scaffold only.*

### Installation and Directory Setup

- [ ] Add Maestro CLI to the project: run `npm install --save-dev @maestro/cli` (or add to `devDependencies` in `package.json` if using a local install). Alternatively, document in the project that Maestro must be installed globally via `brew install maestro` and add a `pretest:e2e` script that checks for the binary. Prefer Maestro over Detox for Expo Go compatibility.

- [ ] Create the `e2e/` directory at the project root: `mkdir -p e2e/flows`. This is the canonical location for all E2E test definitions.

- [ ] Add `"test:e2e": "maestro test e2e/"` to the `scripts` section of `package.json`.

- [ ] Add `"test:e2e:ci": "maestro test e2e/ --format junit --output e2e-results.xml"` to `package.json` scripts for CI JUnit output.

### E2E Flow Stubs

- [ ] Create `e2e/flows/authFlow.yaml`: Maestro YAML with a stubbed happy-path test: launch the app, wait for the login screen to appear, tap the email field, type a test email, tap the password field, type a test password, tap "Sign In", assert the dashboard screen is visible. Add a comment `# TODO: Use test account credentials from environment variables`.

- [ ] Create `e2e/flows/invoiceCreation.yaml`: Stubbed happy-path: launch app → (assumes already logged in) → navigate to Invoices tab → tap Create button → Step 1: fill in customer name, tap Next → Step 2: add one line item (design name, quantity, rate), tap Next → Step 3: set payment mode to Cash, tap Create Invoice → assert the new invoice number appears in the invoices list.

- [ ] Create `e2e/flows/paymentRecording.yaml`: Stubbed flow: navigate to an existing unpaid invoice → tap "Record Payment" → enter amount → confirm → assert invoice status changes to "paid" or "partial".

### Configuration

- [ ] Add `.maestro/` to `.gitignore` to prevent Maestro's local runner cache from being committed.

- [ ] Create `e2e/README.md`: Document prerequisites (Maestro version, emulator/device requirements), how to run locally (`maestro test e2e/flows/invoiceCreation.yaml`), how to run all flows (`maestro test e2e/`), and the CI setup instructions. Note which flows require a seeded test database vs. can run against a fresh install.

- [ ] Add `e2e-results.xml` to `.gitignore` to prevent CI output files from being committed.

---

## Appendix — Issue Cross-Reference

The following table maps each QA issue to the phase that resolves it.

| QA Issue | Phase |
|----------|-------|
| 4.1 testEnvironment: 'node' | Phase 0 |
| 4.2 jest-expo unused | Phase 0 |
| 4.3 No coverage thresholds | Phase 0 |
| 4.4 No testMatch/testPathIgnorePatterns | Phase 0 |
| 4.5 moduleNameMapper @/ alias | Phase 0 |
| 3.6 FlatList mock missing props | Phase 1 |
| 3.7 Modal mock ignores visible | Phase 1 |
| 3.3 useLocalSearchParams hardcoded | Phase 1 |
| 3.4 react-i18next sparse mock | Phase 1 |
| 3.5 Platform.OS hardcoded to ios | Phase 1 |
| 3.1 Global supabase mock conflicts | Phase 1 |
| 7.1 as any in test files | Phase 2 + 10 |
| 7.2 @ts-ignore in UI tests | Phase 10 |
| 2.13 GST calculator missing boundary tests | Phase 3 |
| 2.14 Date timezone sensitivity | Phase 3 |
| 2.15 Currency utility robustness | Phase 3 |
| 1.4 Zod schemas untested | Phase 4 |
| 1.1 Repository layer zero tests | Phase 5 |
| 3.2 .then() mock pattern broken | Phase 6 |
| 2.5 invoiceService shallow tests | Phase 6 |
| 2.6 customerService minimal tests | Phase 6 |
| 2.7 financeService incomplete | Phase 6 |
| 2.8 paymentService edge cases | Phase 6 |
| 2.9 exportService narrow coverage | Phase 6 |
| 2.10 authStore missing failure/loading tests | Phase 7 |
| 2.11 invoiceStore missing error/loading tests | Phase 7 |
| 2.12 inventoryStore missing actions | Phase 7 |
| 2.3 Duplicate assertion inventoryStore | Phase 7 |
| 5.4 Event bus tests flaky | Phase 7 |
| 5.5 Event listener leak | Phase 7 |
| 1.3 Custom hooks untested | Phase 8 |
| 1.5 Organisms/molecules untested | Phase 9 |
| 2.4 Fragile index-based selector | Phase 10 |
| 2.16 setup.test bypasses service layer | Phase 10 |
| 2.1 Skipped placeholder tests | Phase 10 |
| 2.2 Duplicate test directories | Phase 10 |
| 7.3 Inconsistent error assertion styles | Phase 6 (addressed per service) |
| 7.4 require() inside test bodies | Phase 6 + 7 (fix while editing each file) |
| 7.5 Dead mockTable property | Phase 6 |
| 1.6 useInvoiceCreateFlow untested | Phase 11 |
| 5.1 No integration test layer | Phase 12 |
| 5.2 No E2E test infrastructure | Phase 13 |
| 2.18 Hardcoded future date | Phase 6 |
