# Governance Simplification ADR

Status: accepted for Phase 1 remediation.

## Context

The audit found that custom scripts, source-contract tests, and phrase-policed docs had become part
of the architecture control plane. That made the repo harder to change without necessarily improving
runtime behavior.

## Decision

Effective immediately, new one-off governance scripts are under moratorium. A new governance
mechanism needs Platform-owner approval and must satisfy at least one condition:

- It extends `scripts/lib/repo-tools.mjs` or `scripts/tooling.mjs`.
- It replaces or consolidates an existing custom check.
- It enforces a runtime, package, schema, TypeScript, ESLint, or CI contract that cannot be covered
  by an existing tool.

Docs are support artifacts. They may describe architecture, operations, release process, and
runbooks, but harmless prose wording must not be the only reason CI fails.

## Deletion And Consolidation List

Track these until removed or structurally replaced:

- Regex import checks that are now covered by ESLint import boundaries.
- README phrase checks that only prove wording, not behavior.
- Source-text design-system tests that duplicate package `exports` or generated catalogs.
- Generated docs that duplicate package manifests.
- Any script with local root/env/tool discovery duplicated from `scripts/lib`.

## Metrics

Each remediation sprint reports:

- Root `scripts/*.mjs` count.
- Root package-script count.
- New scripts added, scripts deleted, and scripts migrated to `scripts/tooling.mjs`.
- Governance docs count or docs LOC for architecture-control docs.
- Time spent maintaining governance code versus product/runtime code.

## Ownership

- Platform owns the shared tooling foundation, command manifest, CI script wiring, and this ADR.
- App Architecture owns runtime dependency boundaries.
- Design System owns visual/token/component proof.
- Release / QE owns e2e flow scope and visual baseline approval.
- Data owns seed/reset and Supabase test-project contracts.

## Freshness Cadence

Critical docs are reviewed once per release train:

- `docs/CONFIG_CONTRACT.md`
- `docs/TEST_TAXONOMY.md`
- `docs/PLATFORM_TOOLING_RUNBOOK.md`
- `docs/PACKAGE_EXTRACTION_STRATEGY.md`
- Operational runbooks tied to release, backup, restore, and security incidents

Non-critical docs are updated when touched by a feature or deleted when they no longer describe a
live contract.
