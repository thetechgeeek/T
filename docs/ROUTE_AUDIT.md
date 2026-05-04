# Route Audit

Status: P0 purchase drill-down follow-up.

Date: 2026-05-04

## Findings

- The broken report route was caused by a singular purchase path: `/(app)/finance/purchase/${id}`.
- The filesystem route is plural: `app/(app)/finance/purchases/[id].tsx`.
- A scan for `finance/purchase/` found no remaining singular purchase detail strings after the fix.
- A wider scan still finds many hardcoded route strings across `app/` and navigation tests. Those are not all broken, but they are now tracked by the runtime architecture route-boundary work instead of being hidden inside the P0 fix.

## P0 Control

- `src/navigation/routes.ts` now owns the purchase detail route constructor.
- `app/(app)/reports/all-transactions.tsx` uses that constructor for purchase report rows.
- `__tests__/ui/navigation/reportPurchaseDrilldown.nav.test.tsx` is the critical navigation smoke test for opening a purchase from reports.

## Follow-Up Candidates

These files still contain route strings that should move to typed route helpers during the Phase 2 architecture work:

- `app/(app)/(tabs)/index.tsx`
- `app/(app)/(tabs)/inventory.tsx`
- `app/(app)/(tabs)/invoices.tsx`
- `app/(app)/(tabs)/more.tsx`
- `app/(app)/customers/index.tsx`
- `app/(app)/finance/index.tsx`
- `app/(app)/finance/payments/[id].tsx`
- `app/(app)/inventory/[id].tsx`
- `app/(app)/reports/all-parties.tsx`
- `src/features/invoice-create/useInvoiceCreateFlow.ts`
