# Target-State Architecture Gates

Status: active Phase 11 architecture contract.

This file maps the hard target-state rules to enforceable checks. The CI entrypoint is
`npm run check:target-architecture`; the review entrypoint is the pull request template.

## Hard Rules

| Rule                                                                                        | Gate                                                                                                                                                          |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/` must not import raw Supabase clients.                                                | `npm run check:runtime-boundaries` blocks route imports from `src/config/supabase`.                                                                           |
| `app/` must not import repositories directly.                                               | `npm run check:runtime-boundaries` blocks route imports from `src/repositories`.                                                                              |
| Live routes must not import `src/mocks`.                                                    | `npm run check:runtime-boundaries` and `npm run check:product-surfaces` block mock-backed or fake operational surfaces.                                       |
| Only one module may own auth subscriptions.                                                 | `npm run check:target-architecture` allows `onAuthStateChange` only through `authService` and `authSessionOrchestrator`, with teardown required.              |
| Service boundaries normalize errors to `AppError` or a successor.                           | `npm run check:target-architecture` requires backend-touching services to import an AppError normalizer or AppError subtype.                                  |
| Event subscriptions are lifecycle-owned and teardown-capable.                               | `npm run check:target-architecture` allows `eventBus.subscribe` only in `storeOrchestrator` and requires a stop path.                                         |
| Environment resolution is typed, fail-fast, and mode-explicit.                              | `src/config/runtimeConfig.ts` owns runtime env resolution; `npm run check:target-architecture` blocks direct env reads outside approved platform sinks.       |
| Docs describe architecture and do not enforce phrase checks when a stronger control exists. | CI uses runtime, product, target, migration, DB type, i18n, and package-boundary checks; docs are supporting evidence.                                        |
| Financially significant writes are server-authoritative and server-recomputed.              | `docs/CRITICAL_WRITE_POLICY.md`, transactional RPC migrations, and DB tests cover invoice, payment, and stock writes.                                         |
| Backend contracts remain compatible across the supported mobile release window.             | `docs/MOBILE_RELEASE_COMPATIBILITY_CONTRACT.md`, versioned RPC aliases, persisted store migrations, and PR migration checks gate changes.                     |
| Persisted stores declare `version` and `migrate`.                                           | `npm run check:target-architecture` scans persisted Zustand stores for both fields.                                                                           |
| Destructive or irreversible data operations have a tested recovery path and runbook.        | `docs/BACKUP_RESTORE_INCIDENT_RUNBOOK.md`, `docs/DATABASE_ROLLBACK_AND_DATA_IMPACT.md`, destructive-op tests, and PR migration checks gate recovery evidence. |

## Layer Responsibilities

Routes own navigation, screen composition, and screen-local presentation state. Feature modules own
workflow state, form state, request shaping, and optimistic UI. Services own business rules,
transactions, server-authoritative boundaries, and error normalization. Stores own cached server
state, session/UI state, and derived selectors. Repositories own persistence and query translation.
Platform modules own config, auth/session, telemetry, queue, and feature flags.

The target dependency graph is documented in `docs/RUNTIME_DEPENDENCY_GRAPH.md` and enforced by
`check:runtime-boundaries` plus `check:target-architecture`.
