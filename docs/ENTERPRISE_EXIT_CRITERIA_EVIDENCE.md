# Enterprise Exit Criteria Evidence

Status: active Phase 12 evidence map.

## Runtime Architecture

- `npm run check:runtime-boundaries` keeps route raw Supabase imports, route repository imports, live
  route mock imports, feature/store repository imports, service-store imports, and repository-route
  imports at zero unless an explicit baseline is added.
- `npm run check:target-architecture` keeps auth subscriptions, event subscriptions, env reads,
  service error normalization, persisted store migrations, and scoped RLS evidence from regressing.

## Backend Authority And Security

- Invoice, payment, and stock writes use versioned server RPCs and are covered by
  `docs/CRITICAL_WRITE_POLICY.md`.
- Business-table RLS is scoped by `supabase/migrations/029_scope_business_rls.sql` and guarded by
  `supabase/tests/15_scoped_business_rls.sql`.
- Audit-grade side effects are expanded in `supabase/migrations/028_expand_audit_logging.sql`.

## Product Completeness And Operability

- `docs/PRODUCT_SURFACE_INVENTORY.md` records live, beta, hidden, unavailable, and real-data states.
- `npm run check:product-surfaces` blocks placeholder operational actions in product routes.
- `docs/OBSERVABILITY_TELEMETRY_RUNBOOK.md` names required auth, queue, invoice, payment, and stock
  events plus release dashboard and alert ownership.

## Release Compatibility And Recovery

- `docs/MOBILE_RELEASE_COMPATIBILITY_CONTRACT.md` defines the current, rollback, and
  release-candidate support window.
- `docs/PERSISTED_STORE_MIGRATION_POLICY.md` requires versioned persisted-store migrations.
- `docs/BACKUP_RESTORE_INCIDENT_RUNBOOK.md` and `docs/DATABASE_ROLLBACK_AND_DATA_IMPACT.md` define
  recovery targets, rollback evidence, and reconciliation steps.

## CI And Review Gates

- CI runs security audit, secret scanning, CodeQL, runtime boundaries, target architecture, product
  surfaces, migration naming, DB type contracts, strict Jest coverage, seeded integration tests,
  critical Maestro flows, and design-system proof lanes.
- The pull request template requires runtime, target architecture, product, i18n, migration, DB type,
  security, compatibility, previous-client smoke, rollback, and release-note checks.
