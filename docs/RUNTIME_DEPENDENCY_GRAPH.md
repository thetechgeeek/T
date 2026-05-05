# Runtime Dependency Graph

Status: Phase 2 architecture contract.

## Target Graph

Routes/screens -> feature modules/view models -> services/use cases -> repositories/read models -> typed backend interface.

Routes compose screens, own navigation, and hold screen-local presentation state. They do not import raw Supabase clients, repositories, platform env parsing, or mock product data.

Feature modules own workflow state, request shaping, and optimistic UI. They may call services and stores, but they do not own global subscriptions or backend clients.

Services and use cases own business rules, transactions, error normalization, and server-authoritative write boundaries.

Repositories and read models own persistence details and query translation.

Routes do not use read models or repositories directly. Simple read-model access should be exposed
through a service, feature view model, or store selector so route files stay composition-only.

## Lanes

Simple-read lane:

- list/detail reads
- low-risk lookup data
- local filtering/sorting where the backend result is already safe
- no money, stock, ledger, compliance, auth policy, import, or export decisions

Server-authoritative lane:

- invoice totals and stock side effects
- invoice edits that affect totals or stock
- payment recording and ledger updates
- stock mutations and reconciliation
- compliance/report exports
- file parsing/import pipelines where trust matters
- auth-adjacent security policy

Clients in the server-authoritative lane send intent and draft values. The server recomputes totals, validates invariants, writes audit-grade side effects, and enforces idempotency.

## Allowed Imports

- `app/**` may import `src/features/**`, `src/services/**` only through explicit view/use-case APIs, stores, design-system modules, hooks, and navigation helpers.
- `src/features/**` may import services, stores, schemas, hooks, and presentational components.
- `src/services/**` may import repositories, schemas, errors, and platform utilities.
- `src/repositories/**` may import the typed Supabase client and database types.
- `src/stores/**` may import services or orchestration modules, but not repositories directly after migration.
- package-level public APIs are allowed when they are intentionally stable and lightweight.

## Disallowed Imports

- `app/**` must not import `@/src/config/supabase`.
- `app/**` must not import `@/src/repositories/**`.
- live route files must not import `@/src/mocks/**`.
- feature modules must not import raw backend clients.
- feature modules must not import repositories directly.
- stores must not import repositories or raw backend clients directly.
- services must not import route modules or screen-local UI state.
- repositories must not import routes, stores, or presentation modules.
- app and feature modules must not import heavy internal barrels such as `src/repositories/index.ts`
  or `src/design-system/components/molecules/index.ts`.

## Enforcement

`scripts/check-runtime-boundaries.mjs` scans route, feature, store, service, and repository imports
and compares them with `scripts/baselines/runtime-boundaries.json`.

The baseline is the current debt list. The check fails on any new raw Supabase import, route-level
repository import, live-route mock import, feature/store repository import, service-to-store import,
or repository-to-service/store/app import. When an existing violation is removed, delete its
baseline key in the same change.

The current runtime-boundary baseline is intentionally empty. New exceptions require an explicit
architecture decision, not a silent baseline addition.
