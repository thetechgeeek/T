# Route File Budget

Status: Phase 2 runtime architecture contract.

## Budget

Expo route files should compose navigation, shell chrome, route params, and feature entry points.

- Target: under 300 LOC.
- Review threshold: 300 LOC.
- Exception threshold: 500 LOC.

Files over 300 LOC need an explicit reason or an extraction issue. Files over 500 LOC must be
treated as feature-extraction work before new behavior is added.

## Audited Extractions Completed

The Phase 2 audit called out three initial routes. They now delegate to feature-owned screens and
workflow modules:

- `app/(app)/inventory/add.tsx` -> `src/features/inventory-add/InventoryAddScreen.tsx`
- `app/(auth)/setup.tsx` -> `src/features/setup/SetupScreen.tsx`
- `app/(app)/invoices/[id].tsx` -> `src/features/invoice-detail/InvoiceDetailScreen.tsx`

The feature modules own the workflow state and action/request shaping:

- `src/features/inventory-add/useInventoryAddFlow.ts`
- `src/features/inventory-add/inventoryAddFormModel.ts`
- `src/features/setup/useSetupFlow.ts`
- `src/features/setup/setupFlowModel.ts`
- `src/features/invoice-detail/useInvoiceDetailController.ts`

## Current Route Inventory

Current scan command:

`find app -name '*.tsx' -print0 | xargs -0 wc -l | sort -nr`

Largest remaining route files over 500 LOC:

- `app/(app)/settings/business-profile.tsx`
- `app/(app)/(tabs)/inventory.tsx`
- `app/(app)/finance/purchases/[id].tsx`
- `app/(app)/orders/import.tsx`
- `app/(app)/inventory/[id].tsx`
- `app/(app)/settings/expense-categories.tsx`
- `app/(app)/finance/purchases/create.tsx`
- `app/(app)/(tabs)/invoices.tsx`

These are tracked as follow-up route-budget work outside the first Phase 2 extraction slice. New
work should not make them larger without extracting feature hooks, view models, or local
components.
