# Architectural Remediation Epic

Status: active issue epic for `docs/ARCHITECTURAL_MESS_TODO_CHECKLIST.md`.

## Owner Tracks

| Track            | Owner handle              | Scope                                                                 |
| ---------------- | ------------------------- | --------------------------------------------------------------------- |
| App Architecture | `@app-architecture-owner` | Route boundaries, features, stores, auth orchestration, screen a11y.  |
| Data             | `@data-owner`             | Supabase schema, RLS, indexes, RPCs, generated types, rollback plans. |
| Platform         | `@platform-owner`         | Scripts, CI, config, package extraction, shared tooling.              |
| Security         | `@security-owner`         | Dependency hygiene, secrets, token storage, local data, threat model. |
| Release / QE     | `@release-qe-owner`       | Regression coverage, e2e paths, release gates, evidence collection.   |
| Reliability      | `@reliability-owner`      | Observability, alerts, backup/restore drills, incident runbooks.      |

`/.github/CODEOWNERS` maps these role handles to the relevant repository areas. Replace placeholder
role handles with named people or teams before opening the repository to broader contributors.

## Issue IDs

All remediation issues must use one of the checklist IDs from the audit todo file:

- `P0-*` for release-blocking correctness and trust defects.
- `TOOL-*` for tooling, scripts, packages, CI meta-architecture, and test-pyramid work.
- `RUNTIME-*` for runtime architecture and code-quality work.
- `PERF-*` for performance, startup, and query-timing work.
- `SEC-*` for security, threat-model, and local-data-protection work.
- `OPS-*` for operations, observability, backup, release compatibility, and support paths.
- `DB-*` for database schema and data-layer integrity work.
- `A11Y-*` for accessibility and screen-reader remediation.
- `I18N-*` for internationalization and localization work.
- `CI-*`, `DEP-*`, `TARGET-*`, and `EXIT-*` for enterprise readiness gates.

The `.github/ISSUE_TEMPLATE/architecture_remediation.yml` issue template requires a checklist
reference and owner. Use that template for every remediation issue rather than inventing parallel
tracking labels.

## Pull Request Rules

Every remediation PR must:

- update `docs/ARCHITECTURAL_MESS_TODO_CHECKLIST.md` for each checklist ID it changes;
- include verification commands or an explicit reason a command was not run;
- link risk acceptance for any `[r]` item with owner, expiry, mitigation, and rollback/support path;
- avoid closing runtime, security, data-integrity, backup, or release-compatibility issues by
  documentation alone when behavior or automation is the audited defect.

## Risk Acceptance

Risk acceptance is valid only when it includes:

- checklist ID;
- owner handle;
- expiry or review date;
- user/business impact;
- compensating controls;
- rollback or support path;
- evidence that a true implementation is blocked, unsafe, or intentionally deferred.
