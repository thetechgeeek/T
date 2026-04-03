# Full Test Implementation Plan: 936 → 2,800+ Tests

---

## At a Glance

| Phase  | Name                                          | Type          | New Tests | Running Total | Prerequisite         |
| ------ | --------------------------------------------- | ------------- | --------- | ------------- | -------------------- |
| **0**  | Rescue — fix the 3 mislabeled chain tests     | Structural    | ~20       | 956           | None — do this first |
| **1**  | Store layer — loading/error/race/reset        | Unit          | +217      | 1,173         | None                 |
| **2**  | Navigation wiring — every tappable element    | Unit          | +130      | 1,303         | None                 |
| **3**  | Loading & error UI states — per screen        | Unit          | +170      | 1,473         | Phase 1              |
| **4**  | Component variants — props, dark mode, edge   | Unit          | +185      | 1,658         | None                 |
| **5**  | Service & repository gaps                     | Unit          | +151      | 1,809         | None                 |
| **6**  | Real DB — constraints, RPCs, triggers, schema | Integration   | +120      | 1,929         | Phase 0              |
| **7**  | Cross-screen state — action A → screen B      | Integration   | +70       | 1,999         | Phase 1              |
| **8**  | Visual regression — screen snapshots          | Visual        | +120      | 2,119         | Phase 4              |
| **9**  | Colour/contrast — WCAG programmatic           | Visual        | +60       | 2,179         | None                 |
| **10** | Safe area & layout — real device insets       | Visual        | +50       | 2,229         | Phase 4              |
| **11** | E2E — Maestro happy path + error + edge       | E2E           | +250      | 2,479         | All phases done      |
| **12** | Accessibility — labels, roles, touch targets  | Accessibility | +100      | 2,579         | Phase 4              |
| **13** | Performance — renders, debounce, pagination   | Performance   | +30       | 2,609         | Phase 1              |
| **14** | Offline & network resilience                  | Resilience    | +50       | 2,659         | Phase 5              |
| **15** | Chain test suite expansion                    | Unit          | +100      | 2,759         | Phase 0              |
| **16** | Schema/migration integrity                    | Integration   | +50       | 2,809         | Phase 6              |

---

## Phase 0 — Rescue: Fix the 3 Mislabeled Chain Tests

**Problem**: `invoiceCreationFlow.test.ts`, `paymentRecordingFlow.test.ts`,
`stockOperationFlow.test.ts` sit in `__tests__/integration/` and call
`jest.mock('@/src/config/supabase', ...)` — so even when run via
`jest.integration.config.js`, they never touch the DB. The other 11
integration files correctly use `integrationHelpers.ts` and hit the real DB.

### Step 0.1 — Create `__tests__/chain/` directory

Move the 3 files there verbatim. Rename for clarity:

- `__tests__/chain/invoiceCreationChain.test.ts`
- `__tests__/chain/paymentRecordingChain.test.ts`
- `__tests__/chain/stockOperationChain.test.ts`

These verify Store → Service → Repository → Supabase _call shape_. They belong
with unit tests, not integration tests.

### Step 0.2 — Update `jest.config.js`

- Add `'<rootDir>/__tests__/chain/**'` to `testMatch`
- Remove `__tests__/chain/` from `testPathIgnorePatterns`
- No other changes — Supabase is still mocked per-file in these chain tests

### Step 0.3 — Update `jest.integration.config.js`

- `testMatch` already points to `__tests__/integration/**` only — no change needed
- Verify `setupFilesAfterEnv` uses `integrationSetup.ts` (not the RN mock setup) — already correct

### Step 0.4 — Write real DB replacements for the 3 moved files (~20 new tests)

**`__tests__/integration/invoiceCreation.real.test.ts`** — using `integrationHelpers.ts` pattern:

- Creates invoice via `invoiceRepository.createAtomic` → verifies returned `id`
  and `invoice_number` are non-null strings
- Verifies `invoice_line_items` rows exist for that invoice `id` in DB
- Verifies `inventory_items.box_count` was decremented by the line item quantity
- Calls `createAtomic` twice → second call gets a _different_ `invoice_number`
  (sequence is per-business, not global)
- Submits an RPC call with a missing required field → error returned, `AppError`
  thrown with code `RPC_ERROR`
- Verifies atomicity: if line items are invalid, no invoice row is left behind

**`__tests__/integration/paymentRecording.real.test.ts`**:

- Seeds an invoice with `payment_status: 'unpaid'` and `total_amount: 1000`
- Records payment of 500 → DB row created, `payment_status` becomes `partial`,
  `amount_paid` = 500
- Records second payment of 500 → `payment_status` becomes `paid`,
  `amount_paid` = 1000
- Records payment with no `invoice_id` (customer-level) → payment row created,
  invoice status unchanged

**`__tests__/integration/stockOperation.real.test.ts`**:

- Seeds item with `box_count: 50`
- `performStockOperation(id, 'stock_in', 10)` → DB `box_count` is exactly 60
- `performStockOperation(id, 'stock_out', 5)` → DB `box_count` is exactly 55
- `performStockOperation` with non-existent item ID → RPC error, `AppError` thrown
- Verifies `stock_logs` table has a record for each operation with correct fields

---

## Phase 1 — Unit: Store Layer (83 → 300)

**Principle**: Every store action must have 5 test cases minimum: success path,
loading flag lifecycle, error flag lifecycle, race condition guard, and reset.

### Step 1.1 — `inventoryStore.test.ts` — extend to ~120 cases for this store alone

**`fetchItems`**:

- Sets `loading=true` before any await, `loading=false` after success
- On service error: `loading=false`, `error` set to error message, `items` unchanged
- Called while `loading=true`: returns immediately, no duplicate service call
  (spy `inventoryService.fetchItems`, assert called once not twice)
- `fetchItems(reset=true)` replaces `items` array entirely, resets `page` to 1
- Page 2 (no reset): appends new items, does not re-add duplicates (seed store with
  existing item, return same item from page 2 — assert array length doesn't grow)
- When `hasMore=false` and `reset=false`: returns immediately, no service call

**`setFilters`**:

- `setFilters({ search: 'abc' })` resets `page` to 1 before fetching
- `setFilters({ category: 'GLOSSY' })` triggers `fetchItems(true)` — assert service
  called with new filter
- `setFilters` while a fetch is in-flight: assert only one service call fires

**`createItem`**:

- Success: new item prepended to `items`, `totalCount` incremented, `loading=false`
- Error: `loading=false`, `error` set, `items` unchanged, error re-thrown
- Emits `STOCK_CHANGED` event on success (spy `eventBus.emit`)

**`performStockOperation`**:

- Success: calls `fetchItemById` after RPC, updated item replaces old one in `items`
  at same index
- `fetchItemById` failing after successful RPC: `loading=false`, `error` set
  (this is the infinite spinner bug)
- Error from RPC: `loading=false`, `error` set, `items` unchanged, re-thrown
- Emits `STOCK_CHANGED` on success

**`deleteItem`**:

- Success: item removed from `items`, `totalCount` decremented, `loading=false`
- Error: `loading=false`, `error` set, `items` length unchanged

**`reset`**:

- After seeding items/page/filters: returns state to exact `DEFAULT_FILTERS`,
  `items=[]`, `page=1`, `hasMore=true`, `error=null`, `loading=false`

### Step 1.2 — `invoiceStore.test.ts` — extend to ~40 tests

**`createInvoice`**:

- Success: result available, eventBus `INVOICE_CREATED` emitted, `loading=false`
- Validation error (empty `customer_name`): throws before RPC, `loading=false`,
  `error` set
- RPC error: `loading=false`, `error` set, re-thrown as `AppError`
- Concurrent call prevention (race guard)

**`fetchInvoices`**:

- Applies all filter fields correctly (spy service, assert exact filter args)
- Pagination: page 2 appended without replacing page 1
- `reset=true` replaces list
- Error path: `loading=false`, `error` set

**`reset`**: all fields return to defaults

### Step 1.3 — `customerStore.test.ts` — extend to ~40 tests

- `fetchCustomers` loading/error/pagination (same pattern)
- `createCustomer`: success prepends, `totalCount` incremented, emits event
- `updateCustomer`: updated item replaces old one in array at same index
- Error on update: `loading=false`, `error` set, original item unchanged in array
- `refreshBalance(id)`: updates only that customer's balance, does not trigger
  full re-fetch of all customers
- `reset`

### Step 1.4 — `financeStore.test.ts` — extend to ~25 tests

- `fetchSummary`: loading lifecycle, error, data set correctly
- `fetchSummary` called twice rapidly: only one in-flight (race guard — second call
  returns immediately)
- Stale summary retained until new fetch succeeds (not wiped to null during loading)
- Error: `loading=false`, `error` set, `summary` retains previous value

### Step 1.5 — `authStore.test.ts` — extend to ~25 tests

- `signIn`: `loading=true` during call, session set on success, `loading=false`
- `signIn` with wrong credentials: `error` set, `session` remains null,
  `loading=false`
- `signOut`: clears session, clears user, loading lifecycle
- `initialize`: reads session from Supabase on mount, sets `user` if present,
  handles null session gracefully

### Step 1.6 — `dashboardStore.test.ts` — ~15 tests

- `fetchStats`: loading lifecycle, all stat fields updated on success, error path
- `fetchStats` during existing fetch: race guard
- `reset`

### Step 1.7 — `notificationStore.test.ts` — ~15 tests

- `fetchNotifications`: loading/error/data
- `markAsRead(id)`: single notification marked, others unchanged
- `markAllRead`: all notifications have `read=true`
- `clearAll`: `notifications=[]`

### Step 1.8 — `orderStore.test.ts` — ~15 tests

- `fetchOrders`: loading/error/pagination
- `createOrder`: success/error
- `reset`

---

## Phase 2 — Unit: Navigation Wiring (scattered 26 → 130 dedicated)

**Principle**: One `it()` per tappable interactive element on every screen.
Assert the exact route string passed to `router.push`, not just "router called."

### Step 2.1 — Create `__tests__/ui/navigation/` with one file per screen

**`financeIndex.nav.test.tsx`** (4 tests):

- Press "Expenses" ListItem → `router.push('/(app)/finance/expenses')` called
- Press "Purchases" ListItem → `router.push('/finance/purchases')` called
- Press "Aging Report" ListItem → `router.push('/customers/aging')` called
- Press "Profit & Loss" ListItem → **this test will fail immediately**, proving the
  `() => {}` bug — the fix is required before this test can pass

**`inventoryTab.nav.test.tsx`** (3 tests):

- Press FAB (+) → `router.push('/(app)/inventory/add')` called
- Press a `TileSetCard` item → `router.push('/(app)/inventory/${item.id}')` called
- Category chip press does not call router (no navigation)

**`invoiceList.nav.test.tsx`** (2 tests):

- Press create button → correct create route called
- Press invoice row → `router.push('/(app)/invoices/${invoice.id}')` called

**`invoiceDetail.nav.test.tsx`** (3 tests):

- Press "Record Payment" → `PaymentModal` becomes visible (modal state, not a route)
- Press back → `router.back()` called
- Press edit (if exists) → correct edit route

**`customerList.nav.test.tsx`** (2 tests):

- Press add button → `router.push('/(app)/customers/add')` called
- Press customer row → `router.push('/(app)/customers/${id}')` called

**`customerDetail.nav.test.tsx`** (4 tests):

- Press "Record Payment" → PaymentModal visible
- Press back → `router.back()`
- Press "View Invoice" from payment entry → invoice detail route
- Press ledger entry (if navigable) → correct route

**`stockOp.nav.test.tsx`** (2 tests):

- Press close (X) → `router.back()` called
- After successful submit → `router.back()` called (not `router.push`)

**`inventoryDetail.nav.test.tsx`** (3 tests):

- Press "Stock In" → `router.push('/(app)/inventory/stock-op?id=X&type=stock_in')`
- Press "Stock Out" → correct route with `type=stock_out`
- Press back → `router.back()`

**`settingsMore.nav.test.tsx`** (5+ tests):

- Every menu item navigates to its declared route

### Step 2.2 — Remaining screens

One file each for: `auth/login`, `orders/`, `expenses/add`, `suppliers/` — every
interactive element with an `onPress` that is supposed to navigate.

---

## Phase 3 — Unit: Loading & Error UI States (scattered 32 → 200 dedicated)

**Principle**: Three mandatory tests per screen with async operations:
(A) spinner visible while loading, (B) error UI visible when error set,
(C) no spinner when fetch fails — never an infinite loading state.

### Step 3.1 — `__tests__/ui/loading-states/` — one file per screen

**`stockOp.loading.test.tsx`** — the critical bug #3 scenario:

```
it('shows ActivityIndicator while item is loading')
  → mock fetchItemById to never resolve (return new Promise(() => {}))
  → render StockOpScreen with valid id and type params
  → assert ActivityIndicator is present

it('shows error state — NOT infinite spinner — when fetchItemById rejects')
  → mock fetchItemById to reject with Error('Network Error')
  → render StockOpScreen
  → assert ActivityIndicator is NOT present
  → assert some error text or retry button IS present
  (THIS TEST WILL FAIL until the bug is fixed)

it('renders form when item loads successfully')
  → mock fetchItemById to resolve with mockItem
  → render StockOpScreen
  → assert ActivityIndicator NOT present
  → assert item.design_name visible
  → assert Quantity input present
```

**`inventory.loading.test.tsx`**:

```
it('shows ActivityIndicator on initial load when items=[] and loading=true')
it('hides ActivityIndicator when loading=false')
it('shows empty state when items=[] and loading=false')
it('does NOT show empty state while loading=true')
it('shows error Alert when fetchItems throws')
it('setFilters called while loading=true: fetchItems not called twice')
```

**`paymentModal.loading.test.tsx`**:

```
it('Record Payment button shows "Processing..." while loading=true')
it('Record Payment button is disabled while loading=true')
it('loading=false and modal stays open after recordPayment throws')
it('loading=false and modal closes after recordPayment succeeds')
it('amount=0: button press does nothing, loading state never entered')
```

**`inventoryAdd.loading.test.tsx`**:

```
it('Add button disabled while submitting')
it('shows error if createItem fails, form remains visible')
it('loading state clears after error')
```

Apply same pattern to: `invoiceList.loading.test.tsx`, `customerList.loading.test.tsx`,
`financeOverview.loading.test.tsx`, `expenseList.loading.test.tsx`,
`customerDetail.loading.test.tsx`, `invoiceDetail.loading.test.tsx`.

---

## Phase 4 — Unit: Component Variants (337 → 520)

### Step 4.1 — `TextInput` deep tests

- Renders with `label` prop → label text visible
- Renders without `label` → no label element in tree
- `error` prop → border turns error colour, helper text visible,
  `Error: X` in `accessibilityHint`
- `leftIcon` → icon renders inside container
- `rightIcon` → renders on right
- Focus: `onFocus` fires, border colour changes to primary
- Blur: `onBlur` fires, border colour reverts
- `value` prop controlled correctly (assert displayed text)
- `keyboardType="numeric"` → prop passed through to `RNTextInput`
- `multiline` → prop passed through
- Dark mode: `c.onSurface` text colour contrasts against `c.surface` background

### Step 4.2 — `PaymentModal` variant tests

- `invoiceNumber` provided → shows "Invoice: INV-001" not customer name
- `invoiceNumber` absent → shows "Customer: Name"
- `totalAmount=1500` → amount input pre-filled with "1500"
- `totalAmount=0` → amount input empty string
- `customerId` and `invoiceId` both undefined → modal renders without crash
- Each payment mode button: pressing it sets that mode as active
- Pressing already-active mode → stays active (no toggle-off)
- All visible in dark mode

### Step 4.3 — `Button` component variants

- `variant="primary"`: background = `c.primary`, text = `c.onPrimary`
- `variant="outline"`: transparent background, border visible
- `variant="ghost"`: no background, no border
- `loading=true`: renders ActivityIndicator, `onPress` does not fire when pressed
- `disabled=true`: `onPress` does not fire
- `leftIcon` renders to left of title
- `size="sm"` / `size="lg"`: renders without crash

### Step 4.4 — `Screen` component safe area variants

- `safeAreaEdges=['top', 'bottom']`: `paddingTop = insets.top`,
  `paddingBottom = insets.bottom`
- `safeAreaEdges=[]`: `paddingTop = 0`, `paddingBottom = 0`
  (confirms PaymentModal bug — padding is 0 regardless of device insets)
- `safeAreaEdges=['top']`: only top inset applied, bottom = 0
- `scrollable=true`: `ScrollView` rendered instead of `View`
- `withKeyboard=true`: `KeyboardAvoidingView` wraps content

### Step 4.5 — All remaining components

For every component in `src/components/`: ensure every exported prop combination
has at least one test. Specifically add tests for:
`Chip`, `Card`, `StatCard`, `TileSetCard`, `ListItem`, `Divider`, `Badge`,
`EmptyState`, `OfflineBanner`, `SearchBar`, `FormField`.

---

## Phase 5 — Unit: Service & Repository Gaps (199 → 350)

### Step 5.1 — Service error paths

**`invoiceService`**:

- `createInvoice` with `customer_name: ''` → `validateWith` throws,
  `repo.createAtomic` is NOT called (assert via spy)
- `createInvoice` with `line_items: []` → validation error
- `fetchInvoices` with all filter combinations: `payment_status`, `dateFrom`+`dateTo`,
  `customer_id`, all together — assert each filter applied in query
- `fetchInvoices` when Supabase returns error → throws

**`inventoryService`**:

- `fetchItems` with `lowStockOnly: true` → correct query built
- `createItem` with missing required field → throws before Supabase call
- `performStockOperation` with `qty=0` → validation or early return
- `fetchItemById` when not found → AppError thrown

**`paymentService`**:

- Every `payment_mode` value: accepted and passed through
- `amount <= 0` → validation error before RPC
- `customer_id` and `supplier_id` both set → validation error
- RPC error propagated as `AppError`

**`financeService`**:

- Date range where `dateFrom > dateTo` → correct handling defined and tested
- Empty date range → service still calls RPC (no short-circuit)
- RPC returns null data → handled gracefully, no crash

### Step 5.2 — Repository error propagation

For every repository method, test that when Supabase returns
`{ data: null, error: { message: 'X', code: 'PGRST301' } }`:

- An `AppError` is thrown (not a raw Supabase error leaked to caller)
- `AppError.message` matches the Supabase error message
- `AppError.code` matches the Supabase error code
- `AppError.cause` is the original error object

Target methods: `invoiceRepository.findWithLineItems`,
`invoiceRepository.createAtomic`, `inventoryRepository` all methods,
`customerRepository` all methods, `paymentRepository.recordWithInvoiceUpdate`,
all `baseRepository` CRUD methods.

---

## Phase 6 — Real DB Integration Tests: Deep Coverage (92 shallow → 200)

The existing 11 real DB test files test CRUD. They need extending for constraints,
RPC side effects, and atomic guarantees.

### Step 6.1 — Extend `inventoryFlow.test.ts`

- `stock_in` RPC: `box_count` increases by exactly the specified quantity
- `stock_out` below zero: error returned or `box_count` floors at 0
  (whichever is the intended contract — this test defines it)
- Two sequential stock ops: final `box_count` reflects both in correct order
- `stock_logs` table: one row per operation with correct `quantity_change` and
  `operation_type`

### Step 6.2 — Extend `invoiceCreation.real.test.ts` (new from Phase 0)

- Line items written atomically: partial DB failure → invoice row does NOT exist
- `invoice_number` format matches expected pattern (`TM/YYYY-YY/NNNN`)
- Two invoices created sequentially → invoice numbers are sequential
- `inventory_items.box_count` decremented by line item `quantity`
- Creating invoice with non-existent `item_id` → RPC error, no rows left behind

### Step 6.3 — Extend `paymentRecording.real.test.ts` (new from Phase 0)

- Full pay → `payment_status = 'paid'`
- Partial pay → `payment_status = 'partial'`, `amount_paid` = recorded amount
- Overpayment → define and assert expected behaviour
- `payments` row has correct `direction`, `payment_date`, `customer_id`, `invoice_id`
- Customer balance reflects new payment (if a DB view exists)

### Step 6.4 — Add `__tests__/integration/concurrency.real.test.ts`

- Two parallel invoice creation calls: both succeed, each gets unique `invoice_number`
- Two parallel payments on same invoice: correct final `amount_paid`
- Two parallel stock ops: correct final `box_count`

### Step 6.5 — Extend all existing flow tests with error paths

For each of the 11 existing real DB test files, add:

- One test: operation on non-existent ID → correct `AppError` thrown
- One test: operation with invalid data → correct error, no partial data in DB

---

## Phase 7 — Cross-Screen State Tests (0 → 70)

**Approach**: Seed the store, perform the action via store method, then render
the destination screen and assert it shows updated state.

### Step 7.1 — `__tests__/cross-screen/` directory

**`stockOp-to-itemDetail.test.tsx`** (the exact bug #2 scenario):

```
it('item detail shows updated box_count after performStockOperation')
  → seed inventoryStore with item { id: X, box_count: 50 }
  → mock inventoryService.performStockOperation to succeed
  → mock inventoryService.fetchItemById to return { box_count: 60 }
  → call useInventoryStore.getState().performStockOperation(X, 'stock_in', 10)
  → render inventory/[id] screen for item X
  → assert '60 Boxes' visible (not '50 Boxes')

it('item detail does NOT show stale box_count after navigating back')
  → same setup, render [id] screen showing 50
  → perform op
  → simulate navigation back (re-render)
  → assert shows 60
```

**`invoiceCreate-to-customerList.test.tsx`** (the exact bug #5 scenario):

```
it('customer appears in customer list after invoice creation with new customer name')
  → THIS TEST WILL FAIL — invoiceService never calls customerService
  → failure defines the required fix

it('customer count in customerStore is unchanged after invoice creation')
  → documents the current broken behaviour explicitly
```

**`invoiceCreate-to-invoiceList.test.tsx`**:

```
it('created invoice appears at top of invoice list')
  → invoke invoiceStore.createInvoice
  → render invoice list
  → assert new invoice is first item

it('dashboard today_invoice_count increments after invoice creation')
  → spy dashboardStore.fetchStats
  → invoke invoiceStore.createInvoice
  → waitFor dashboardStore.fetchStats to have been called
```

**`payment-to-invoiceStatus.test.tsx`**:

```
it('invoice shows as paid after full payment recorded')
it('invoice shows as partial after partial payment recorded')
it('customer balance updates in customer detail after payment')
```

**`setFilters-race-condition.test.tsx`** (the exact bug #4 scenario):

```
it('setting search filter while loading does not cause stuck loading state')
  → mock inventoryService.fetchItems to hang on first call (never resolve)
  → call fetchItems() → loading=true
  → call setFilters({ search: 'abc' }) → triggers fetchItems(true)
  → fetchItems(true) hits the race guard and returns immediately
  → loading stays true forever — THIS DEFINES THE BUG
  → fix required: setFilters should either cancel in-flight fetch or bypass guard
```

---

## Phase 8 — Visual Regression: Screen Snapshots (0 → 120)

**Tooling**: `jest-image-snapshot`.
Install: `npm install --save-dev jest-image-snapshot`.

### Step 8.1 — Setup

Create `__tests__/visual/setup/renderToSnapshot.tsx`:

- Wraps component in `ThemeProvider`, `SafeAreaProvider`, mocked navigation
- Two exports: `renderLight(component)` and `renderDark(component)`
- Committed baselines live in `__tests__/visual/snapshots/`

Add `snapshotResolver` to `jest.config.js` pointing to the visual directory.

### Step 8.2 — Snapshot test files (`__tests__/visual/screens/`)

One file per screen, 4 snapshots each (light/dark × normal/loading):

- `dashboard.visual.test.tsx`
- `inventoryTab.visual.test.tsx` — normal, loading, empty list, list with items
- `invoiceList.visual.test.tsx` — normal, loading, empty, paid filter, unpaid filter
- `invoiceDetail.visual.test.tsx` — line items expanded
- `invoiceCreate.visual.test.tsx` — each wizard step separately
- `customerList.visual.test.tsx`
- `customerDetail.visual.test.tsx` — with ledger entries
- `financeOverview.visual.test.tsx`
- `expenseList.visual.test.tsx`
- `stockOp.visual.test.tsx` — loading (item not fetched yet), loaded
- `paymentModal.visual.test.tsx` — with invoice number, without, loading state
- `settings.visual.test.tsx`

---

## Phase 9 — Colour/Contrast: WCAG Programmatic (0 → 60)

**Tooling**: `npm install --save-dev color` (has `.contrast()` method).

### Step 9.1 — `__tests__/visual/contrast/contrastRatios.test.ts`

```typescript
import Color from 'color';
import { lightTheme, darkTheme } from '@/src/theme';

function assertContrast(fg: string, bg: string, minRatio = 4.5) {
	const ratio = Color(fg).contrast(Color(bg));
	expect(ratio).toBeGreaterThanOrEqual(minRatio);
}
```

**Test every pair in light theme**:

- `onSurface` against `surface`
- `onSurfaceVariant` against `surface`
- `onSurfaceVariant` against `surfaceVariant`
- `placeholder` against `surface` (AA Large minimum: 3.0)
- `onPrimary` against `primary`
- `onError` against `error`
- `onSuccess` against `success`
- Primary button label (`onPrimary`) against button bg (`primary`)
- Outline button label (`primary`) against white background
- Error helper text (`error`) against `background`
- Badge text against badge background
- Chip label (selected) against chip selected bg
- Chip label (unselected) against chip unselected bg

**Repeat all pairs in dark theme** — same assertions, different colour values.

**TextInput-specific**:

- Input text (`onSurface`) against input bg (`surface`) — light mode
- Input text (`onSurface`) against input bg (`surface`) — dark mode
  (this is the exact bug #8)
- Placeholder (`placeholder`) against input bg — light
- Placeholder (`placeholder`) against input bg — dark

---

## Phase 10 — Safe Area & Layout (0 → 50)

**Tooling**: Configure `react-native-safe-area-context` jest mock to return
specific inset values per test.

### Step 10.1 — `__tests__/visual/safeArea/`

**`paymentModal.safeArea.test.tsx`** (the exact bug #6 scenario):

```
it('PaymentModal content does not overlap status bar on iPhone 14 Pro (top=59)')
  → mock useSafeAreaInsets to return { top: 59, bottom: 34, left: 0, right: 0 }
  → render PaymentModal
  → measure computed paddingTop of the Screen wrapper
  → assert paddingTop >= 59
  (THIS TEST WILL FAIL — safeAreaEdges=[] means paddingTop is always 0)

it('PaymentModal clears home indicator (bottom inset 34px)')
  → assert paddingBottom of scrollable content >= 34

it('PaymentModal clears Android navigation bar (bottom inset 48px)')
  → mock insets { bottom: 48 }
  → assert paddingBottom >= 48
```

**`screens.safeArea.test.tsx`** — for every screen:

- Render with `{ top: 59, bottom: 34 }` insets
- Assert `Screen` wrapper `paddingTop >= 59` when `safeAreaEdges` includes `'top'`
- Assert `paddingBottom >= 34` when `safeAreaEdges` includes `'bottom'`

**`modals.safeArea.test.tsx`**:

- Every `Modal` component: assert content does not start at y=0 when top inset > 0

---

## Phase 11 — E2E: Maestro (0 → 250)

**Tooling**: Maestro. Install: `npm install -g @maestro/cli`

### Step 11.1 — Setup

```
.maestro/
  config.yaml          # appId: com.tilemaster.app
  helpers/
    signIn.yaml        # reusable sign-in subflow
    createInvoice.yaml # reusable invoice creation subflow
  flows/
    auth/
    invoice/
    inventory/
    payment/
    customer/
    finance/
    errors/
    keyboard/
```

Create `scripts/seed-e2e-db.ts` — creates a known test account with baseline
inventory data before the E2E suite runs.

### Step 11.2 — Happy Path Flows (~30 flows, run on iOS + Android = 60 test runs)

`.maestro/flows/auth/login-success.yaml`:

```yaml
- launchApp
- tapOn: 'Email'
- inputText: 'test@tilemaster.dev'
- tapOn: 'Password'
- inputText: 'TestPass123!'
- tapOn: 'Sign In'
- assertVisible: 'Dashboard'
- assertVisible:
      id: 'stat-gross-profit'
```

`.maestro/flows/invoice/create-invoice-full.yaml`:

```yaml
- runFlow: '../../helpers/signIn.yaml'
- tapOn: 'Invoices'
- tapOn:
      id: 'create-invoice-button'
- inputText: 'Rajesh Tiles'
- tapOn: 'Next'
- tapOn: 'Add Item'
- tapOn: 'GVT6001'
- inputText: '10'
- tapOn: 'Add to Invoice'
- tapOn: 'Review'
- assertVisible: '₹'
- tapOn: 'Create Invoice'
- assertVisible: 'TM/'
- assertVisible: 'Rajesh Tiles'
```

Additional happy path flows:

- `stock/stock-in.yaml` — navigate to item, tap Stock In, enter qty, confirm, assert new count
- `stock/stock-out.yaml`
- `inventory/add-item.yaml` — add new item, assert appears in list
- `payment/record-payment-from-customer.yaml` — open customer, record payment,
  assert status change on invoice
- `customer/add-customer.yaml`
- `expense/add-expense.yaml`
- `finance/view-expenses.yaml`
- `auth/logout.yaml`
- `dashboard/refresh-stats.yaml` — pull to refresh, assert loading indicator,
  assert stats visible

### Step 11.3 — Error & Edge Flows (~40 flows ×2 platforms = 80)

`.maestro/flows/errors/login-invalid.yaml`:

```yaml
- launchApp
- tapOn: 'Email'
- inputText: 'wrong@email.com'
- tapOn: 'Password'
- inputText: 'wrongpass'
- tapOn: 'Sign In'
- assertVisible: 'Invalid credentials'
- assertNotVisible: 'Dashboard'
```

`.maestro/flows/errors/invoice-empty-customer.yaml`:

- Navigate to create invoice
- Leave customer name empty
- Press Next
- Assert inline validation error visible
- Assert still on customer step (not advanced)

`.maestro/flows/errors/profit-loss-button.yaml`:

- Navigate to Finance
- Tap "Profit & Loss"
- Assert navigated to Profit & Loss screen
  (THIS WILL FAIL — reveals the `() => {}` bug)

`.maestro/flows/errors/payment-zero-amount.yaml`:

- Open payment modal
- Clear amount, leave as 0
- Tap "Record Payment"
- Assert nothing happens / validation message shown

`.maestro/flows/errors/inventory-search-no-results.yaml`:

- Go to Inventory
- Search "zzz-nonexistent-zzz"
- Assert empty state shown (NOT infinite loading)
- Clear search
- Assert items return

`.maestro/flows/errors/inventory-search-loading-clears.yaml`:

- Search something valid
- Assert results appear
- Change search
- Assert loading spinner clears (not stuck)

Additional error flows:

- Back-press during invoice wizard → assert data not lost
- Session timeout → redirect to login
- Payment > outstanding amount → expected behaviour shown
- Stock out exceeding available quantity → expected error

### Step 11.4 — Keyboard & Touch Flows (~30 ×2 platforms = 60)

`.maestro/flows/keyboard/payment-amount-tap-anywhere.yaml`:

```yaml
- runFlow: '../../helpers/signIn.yaml'
- openLink: 'tilemaster://customers/test-customer-id'
- tapOn: 'Record Payment'
- tapOn:
      text: 'Amount (₹)' # tap the label text, not the input itself
- assertVisible:
      id: 'keyboard'
- hideKeyboard
- tapOn:
      id: 'payment-amount-input'
      point: '5%,50%' # tap the left edge of the container
- assertVisible:
      id: 'keyboard'
```

`.maestro/flows/keyboard/form-next-key-focus.yaml`:

- Open invoice creation
- Fill customer name, press Next key on keyboard
- Assert phone field is now focused
- Press Next → GSTIN focused

`.maestro/flows/keyboard/input-touch-target-size.yaml`:

- Tap each form field at top edge, bottom edge, left edge, right edge
- Assert keyboard appears on each tap

---

## Phase 12 — Accessibility (7 → 100)

**Tooling**: `@testing-library/react-native` `getByRole`, `getByLabelText`,
`getByHint`. Touch target size asserted via component style inspection.

### Step 12.1 — `__tests__/accessibility/` — one file per screen

**`financeOverview.a11y.test.tsx`**:

```
it('all menu items have accessibilityLabel')
it('all menu items have accessibilityHint')
it('all menu items have role=button')
it('Profit & Loss button is not disabled')
it('stat cards are announced with correct values')
```

**`paymentModal.a11y.test.tsx`**:

```
it('Amount input has accessibilityLabel="payment-amount-input"')
it('Amount input has accessibilityHint describing expected input')
it('each payment mode button has unique accessibilityLabel')
it('close button has accessibilityLabel="close-payment-modal"')
it('modal is announced as modal via accessibilityViewIsModal=true')
it('Record Payment button has accessibilityLabel')
```

**`inventoryTab.a11y.test.tsx`**:

```
it('search input has accessibilityLabel and accessibilityHint')
it('each category chip has accessibilityLabel="category-chip-X"')
it('filter button has accessibilityLabel')
it('FAB has accessibilityLabel="add-inventory-button"')
```

Apply same pattern to every remaining screen.

### Step 12.2 — Touch target size tests

`__tests__/accessibility/touchTargets.test.tsx`:

- For every button/touchable in every screen: assert computed `height >= 44`
  and `width >= 44`

---

## Phase 13 — Performance (0 → 30)

**Tooling**: `jest.useFakeTimers()`, manual timing with `performance.now()`,
spy on render counts.

### Step 13.1 — `__tests__/performance/`

**`inventoryList.perf.test.tsx`**:

```
it('renders 500 inventory items in under 500ms')
  → seed store with 500 mock items
  → measure render time
  → assert < 500ms

it('groupedSets memo does not recompute when loading flag changes')
  → spy on grouping function
  → set loading=true (items unchanged)
  → assert memo not recomputed

it('search debounce: setFilters called once per input burst, not per character')
  → render inventory tab
  → type 'A', 'B', 'C', 'D' in rapid succession (fake timers)
  → advance timers by debounce duration
  → assert inventoryService.fetchItems called exactly once with 'ABCD'
```

**`pagination.perf.test.tsx`**:

```
it('page 2 append does not re-render page 1 items')
  → spy on TileSetCard render
  → load page 1 (20 items)
  → trigger onEndReached (page 2)
  → assert TileSetCard called for new items only, NOT re-called for page 1

it('hasMore=false prevents service call on scroll')
  → seed store with hasMore=false
  → trigger onEndReached
  → assert inventoryService.fetchItems NOT called
```

**`storeSubscriber.perf.test.tsx`**:

```
it('eventBus STOCK_CHANGED fires exactly once per performStockOperation')
  → spy eventBus.subscribe callback
  → call performStockOperation
  → assert callback fired exactly once
```

---

## Phase 14 — Offline & Network Resilience (0 → 50)

**Tooling**: Mock `global.fetch` or use `jest-fetch-mock`. Mock
`useNetworkStatus` hook.

### Step 14.1 — `__tests__/resilience/`

**`networkError.test.ts`**:

```
it('inventoryStore: network error sets error state and clears loading')
  → mock inventoryService.fetchItems to throw 'Network request failed'
  → call store.fetchItems()
  → assert loading=false, error='Network request failed'

it('paymentService.recordPayment network error → Alert shown, modal stays open')
  → render PaymentModal
  → mock recordPayment to throw
  → press Record Payment
  → assert Alert.alert called with error message
  → assert modal is still visible

it('inventoryStore: loading=false after network error — never stuck')
  → mock service to throw
  → call fetchItems()
  → assert loading === false after rejection settles
```

**`offlineBanner.test.tsx`**:

```
it('OfflineBanner visible when useNetworkStatus returns false')
it('OfflineBanner hidden when useNetworkStatus returns true')
it('OfflineBanner shows "No connection" message')
```

**`retry.test.ts`**:

```
it('retryWithBackoff retries 3 times before throwing')
  → mock service to fail twice, succeed third
  → assert result is the successful response

it('store provides retry: calling fetchItems again after error succeeds')
  → first fetch fails, error set
  → mock now succeeds
  → call fetchItems() again
  → assert items loaded, error cleared
```

---

## Phase 15 — Chain Test Suite Expansion (107 → 210)

Now living in `__tests__/chain/`, the 3 moved files need more scenarios.

**`invoiceCreationChain.test.ts`** additions:

- Invoice with 5 line items: all 5 passed to RPC in correct shape
- Invoice with `is_inter_state=true`: `igst_amount > 0`, `cgst_amount = 0`
  in line items sent to RPC
- Invoice with discount: `taxable_amount` correctly reduced in payload
- `createInvoice` error → `invoiceStore.error` set, `invoiceStore.loading=false`
- Dashboard eventBus: after invoice created, `dashboardStore.fetchStats` called

**`paymentRecordingChain.test.ts`** additions:

- Payment with notes: notes field present in RPC payload
- Payment with `direction='paid'` (outgoing): RPC called with correct direction
- Payment recording error → `Alert.alert` called (spy it)
- Loading state: `loading=true` while RPC is in-flight, `false` after settle

**`stockOperationChain.test.ts`** additions:

- `stock_out` type: `p_operation_type='stock_out'` in RPC payload
- Reason field optional: if `reason=undefined`, called without `p_reason`
  or with `null` (assert which)
- After success: `fetchItemById` called with same item ID
- Error from RPC: error propagated to caller, `router.back()` NOT called

**Add new chain files**:

- `customerCreationChain.test.ts` — full store→service→repo→Supabase shape
- `expenseCreationChain.test.ts`
- `authChain.test.ts` — sign-in/out full call chain

---

## Phase 16 — Schema/Migration Integrity (0 → 50)

**Tooling**: Real Supabase test DB via `jest.integration.config.js`.

### Step 16.1 — `__tests__/integration/schemaIntegrity.real.test.ts`

**Table existence** (select with LIMIT 0 to verify columns without returning data):

```
it('invoices table has expected columns: id, invoice_number, customer_id,
    payment_status, total_amount, amount_paid')
it('invoice_line_items has: id, invoice_id, item_id, quantity, line_total')
it('payments table has: id, amount, payment_mode, direction, customer_id, invoice_id')
it('inventory_items has: id, box_count, design_name, base_item_number')
it('customers table has: id, name, phone, city, state, type')
it('expenses table has: id, amount, description, category, expense_date')
it('stock_logs table has: id, item_id, operation_type, quantity_change')
```

**RPC existence** (call with valid minimal payload, assert no "function does not exist"):

```
it('create_invoice_with_items_v1 RPC exists and is callable')
it('perform_stock_operation_v1 RPC exists')
it('record_payment_with_invoice_update_v1 RPC exists')
it('get_profit_loss_v1 RPC exists')
```

**Unique constraints**:

```
it('invoice_number is unique per business — sequential invoices differ')
  → create two invoices → assert different invoice_numbers

it('duplicate direct insert of same invoice_number → postgres error code 23505')
  → direct insert bypassing RPC
  → assert error.code === '23505'
```

**Row Level Security**:

```
it('unauthenticated request to invoices returns 0 rows or error')
  → Supabase client with no session
  → SELECT from invoices
  → assert data.length === 0 or error present

it('authenticated user only sees their own business rows')
  → sign in as test user
  → all fetched invoice rows have correct business_id
```

**Trigger behaviour**:

```
it('creating invoice via RPC decrements inventory box_count')
  → seed item with box_count=100
  → create invoice with line item quantity=10
  → fetch item → assert box_count=90

it('invoice payment_status updates atomically with payment insert')
  → create unpaid invoice
  → record full payment via RPC
  → fetch invoice in same transaction boundary
  → assert payment_status='paid'
```

---

## Execution Order & Dependencies

```
Phase 0  (fix structure — do this first, unblocks everything)
    ├── Phase 1  (store states)
    │       ├── Phase 3  (loading UI states)
    │       ├── Phase 7  (cross-screen state)
    │       └── Phase 13 (performance)
    ├── Phase 2  (navigation wiring — standalone)
    ├── Phase 4  (component variants)
    │       ├── Phase 8  (visual regression)
    │       ├── Phase 10 (safe area)
    │       └── Phase 12 (accessibility)
    ├── Phase 5  (service/repo gaps)
    │       └── Phase 14 (offline resilience)
    ├── Phase 6  (real DB deep)
    │       └── Phase 16 (schema integrity)
    ├── Phase 9  (colour/contrast — fully standalone)
    └── Phase 15 (chain expansion — standalone)

Phase 11 (E2E Maestro — run last, validates the entire fixed system)
```

Phases 0, 2, 5, 9, 15 have zero dependencies and can start in parallel on day one.
Phase 11 should be last.

---

## Bug → Test Mapping (each reported bug needs at least one RED test before fix)

| Bug                                      | Phase | Test that catches it                                                         |
| ---------------------------------------- | ----- | ---------------------------------------------------------------------------- |
| Duplicate invoice number constraint      | 0 / 6 | `invoiceCreation.real.test.ts` — second insert hits unique constraint        |
| Boxes in stock not refreshed             | 7     | `stockOp-to-itemDetail.test.tsx` — item detail shows stale count             |
| Add Stock button infinite loading        | 3     | `stockOp.loading.test.tsx` — `fetchItemById` failure shows error not spinner |
| Inventory search infinite loading        | 7     | `setFilters-race-condition.test.tsx` — loading stuck true after race         |
| Customer not added after invoice         | 7     | `invoiceCreate-to-customerList.test.tsx` — customer missing from list        |
| Payment screen overlaps notification bar | 10    | `paymentModal.safeArea.test.tsx` — paddingTop is 0 with inset 59             |
| Keyboard only on placeholder tap         | 11    | `payment-amount-tap-anywhere.yaml` — tap edge of container, no keyboard      |
| Dark text on dark background             | 9     | `contrastRatios.test.ts` — `onSurface` vs `surface` in dark theme            |
| P&L button does nothing                  | 2     | `financeIndex.nav.test.tsx` — press P&L, assert router.push called           |
