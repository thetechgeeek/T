# Phase 1 Governance Inventory

Status: active inventory for replacing custom governance with structural checks.

## Regex Import Scanners

| Source                                                  | Import scanner class                                                           | Structural replacement                                                               |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `scripts/check-design-system-guardrails.mjs`            | Design-system product-layer imports and public self-imports                    | ESLint `no-restricted-imports` for `src/design-system/**` source files               |
| `scripts/check-ui-shell-guardrails.mjs`                 | UI shell product imports, private shell imports, private design-system imports | ESLint `no-restricted-imports` for `src/ui-shell/**` and consumer files              |
| `scripts/check-inventory-app-ui-contract.mjs`           | Consumer private package imports                                               | ESLint `no-restricted-imports` for app and feature UI consumers                      |
| `scripts/check-workspace-packages.mjs`                  | Package manifest and mapper shape, not import syntax                           | Keep custom check until package exports plus project references cover it             |
| `scripts/check-ui-tokens.mjs`                           | Token usage, raw numbers, ScrollView allowlist                                 | Keep custom check until lint rules or typed token APIs cover every case              |
| `src/design-system/__tests__/componentContract.test.ts` | Component contract source shape                                                | Prefer generated catalog and component registry; keep only behavior assertions       |
| `src/design-system/__tests__/boundary.test.ts`          | Design-system boundary source shape                                            | Covered first by ESLint import boundaries; remaining non-import checks are temporary |

## Markdown Phrase Checks

| Source                                                      | Phrase-check target                            | Classification                                | Replacement path                                                     |
| ----------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| `scripts/check-design-system-guardrails.mjs`                | Design-system README and companion docs        | Review checklist / stale guardrail mix        | Move to owner review and freshness cadence                           |
| `scripts/check-ui-shell-guardrails.mjs`                     | UI shell README                                | Review checklist                              | Move to package README ownership                                     |
| `scripts/check-inventory-app-ui-contract.mjs`               | Inventory app UI checklist                     | Review checklist                              | Move to PR template or owner review                                  |
| `scripts/check-package-release-discipline.mjs`              | Release discipline doc plus changelog headings | Contract for package release                  | Keep changelog/version checks, demote prose phrase checks            |
| `scripts/check-ui-package-extraction-readiness.mjs`         | Extraction readiness docs                      | Review checklist                              | Covered by `docs/PACKAGE_EXTRACTION_STRATEGY.md` and package exports |
| `src/design-system/__tests__/companionDocsContract.test.ts` | Companion docs                                 | Review checklist                              | Move to docs freshness cadence                                       |
| `src/design-system/__tests__/readmeContract.test.ts`        | README links                                   | Generated-doc verification / review checklist | Keep generated links only if derived from source                     |

## Current Structural Coverage

ESLint now blocks these before custom scanners run:

- Raw Supabase client imports in route and feature UI code.
- Repository imports in route and feature UI code.
- Mock product data imports in route and feature UI code.
- Private UI shell imports by consumers.
- Product-layer imports from design-system source.
- Product-layer imports from UI shell source.
- Public self-imports from design-system source.
- Private design-system deep imports from UI shell source.

## Custom Checks Still Retained

Retain custom scripts only for contracts that are not currently expressible through ESLint,
TypeScript, package exports, or schema checks:

- Expo route collision detection.
- Runtime boundary baseline ratchet while route extraction is still underway.
- Workspace package manifest shape until project references or package build output are adopted.
- Token generation and visual baseline comparison.
- ScrollView and raw-token usage until stable lint rules replace them.
- Package release changelog/migration contract.

Every retained custom check should be reachable through `scripts/tooling.mjs`.
