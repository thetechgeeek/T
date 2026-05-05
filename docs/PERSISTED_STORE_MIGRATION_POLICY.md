# Persisted Store Migration Policy

Status: active Phase 5 mobile compatibility contract.

## Inventory

Business persisted stores:

- `invoice-storage`
- `customer-storage`
- `inventory-storage`
- `finance-storage`
- `dashboard-storage`

These keys are registered in `src/stores/persistedStoreRegistry.ts` and cleared on logout.

## Rules

- Every business persisted store must declare `version`.
- Every business persisted store must declare `migrate`.
- Migrations must tolerate missing optional fields from older releases.
- Future persisted versions must not crash the app. If the app cannot safely hydrate a future version,
  it must fall back to a minimal empty cache and refetch from the server.
- Persisted data is cache state, not an audit source of truth.

## Test Expectations

Store changes that alter persisted shape need tests for:

- old snapshots from at least the previous mobile release,
- missing fields,
- unknown future versions where feasible,
- logout cleanup through `clearPersistedBusinessStores()`.
