# Performance Profiling Notes

Date: 2026-05-05

## Invoice List Render Budget

- Scope: `app/(app)/(tabs)/invoices.tsx`.
- Static before-state: date chips, status chips, invoice rows, empty state, key extractors, row press handlers, and several style objects were recreated during each parent render.
- After-state:
    - `renderItem` callbacks are stabilized with `useCallback`.
    - Date and status chip rows are split into memoized components.
    - Invoice cards are split into `InvoiceRow` with `React.memo`.
    - Key extractors are module-level functions.
    - Common style objects moved into `StyleSheet.create` or memoized style arrays.
    - `removeClippedSubviews` is enabled on the invoice list.
- `getItemLayout` was intentionally not added because invoice rows have variable height: customer names, translated status text, dynamic date text, and accessibility font scaling can change row height.
- Manual 50-row profile note: re-filtering, pull-to-refresh state changes, and search typing should no longer recreate per-row renderer functions or per-row card style arrays from the parent component. A device-level React Profiler pass is still required for precise before/after frame timings.

## Dashboard Allocation Budget

- Scope: `app/(app)/(tabs)/index.tsx`.
- Static before-state: `quickActions`, `dashboardStats`, and `recentInvoices` were rebuilt on every render.
- After-state:
    - `quickActions` is memoized by theme colors and locale.
    - `dashboardStats` is memoized by the individual stat fields, colors, currency formatter, and locale.
    - `recentInvoices`, `recentTransactions`, and the visible transaction slice are memoized.
    - Low-stock and view-all navigation handlers are stable callbacks.
- Store subscriptions already use `useShallow`, so background refreshes should not recreate dashboard arrays unless their actual dependencies changed.

## Startup Budget

- Scope: `app/_layout.tsx` and `app/(app)/_layout.tsx`.
- Current app-shell startup ownership:
    - Auth/session orchestration: owned by `ShellAuthGate` through `startAuthSessionOrchestrator`.
    - Notifications unread fetch: owned by root app shell.
    - Store orchestration: owned by root app shell.
- Current app-data warmup ownership:
    - Critical mount budget: 2 calls, dashboard stats and inventory first page.
    - Deferred mount budget: 3 calls, invoices first page, finance summary initialization, and orders.
    - Hidden customers tab prefetch was removed from startup warmup; customer data is now tab/screen-owned.
    - Foreground resume uses a 60 second TTL to avoid repeating global work during quick app switches.
- Telemetry: `startup_warmup` logs phase, source, call count, budget, duration, and over-budget state.

## Database Query Timing

- Scope: `src/repositories/baseRepository.ts` and `src/utils/queryMetrics.ts`.
- Repository operations now record table, operation, optional context, duration, release tag, p50, p95, slow count, and slow threshold.
- Default slow threshold: 500 ms.
- Current sink: structured logger metadata. Production observability still needs to forward logger output to the selected sink.

## Database Index Profile

- Added migration: `supabase/migrations/027_performance_query_indexes.sql`.
- Added pgTAP smoke test: `supabase/tests/11_performance_query_indexes.sql`.
- Top query patterns covered:
    - Supplier-scoped order lookup: `orders.supplier_id`.
    - Purchase payment lookup: `payments.purchase_id`.
    - Stock history by reference: `stock_operations.reference_id`.
    - Customer/status/date invoice list: `invoices(customer_id, payment_status, invoice_date, created_at)`.
    - Typed customer list ordered by name: `customers(type, name)`.
    - Category/supplier inventory list with stock/date ordering.
- Write overhead note: these indexes add maintenance cost to invoice, inventory, payment, order, customer, and stock-operation writes. They are intentionally narrow and match app-visible list/detail filters rather than indexing every nullable column.
