# Tooling Inventory

Status: Phase 1 baseline for the bespoke script/toolchain audit.

Date: 2026-05-05

## Counts

- Root `package.json` scripts: 43. Audit baseline: 41. Difference: +2 from `audit:security` and
  `check:runtime-boundaries`.
- Root `scripts/*.mjs` files: 21. Audit baseline: 19. Difference: +2 from the runtime-boundary
  ratchet and the consolidated `scripts/tooling.mjs` entrypoint.
- Root `scripts/*.mjs` LOC: 5,291. Audit baseline: 4,806. Difference: +485 after adding the
  runtime-boundary ratchet, consolidated platform entrypoint, dry-run support, and e2e prerequisite
  cleanup.

## Target

Target one-off script count after consolidation: 12 or fewer root `scripts/*.mjs` files, with shared
behavior in `scripts/lib/` and package scripts routed through `scripts/tooling.mjs`.

## Inventory

| Script                                      | Owner            | Class                    | Args | Walks FS | Shells Out | Reads Source | Reads Docs | Env / Root Notes                         |
| ------------------------------------------- | ---------------- | ------------------------ | ---- | -------- | ---------- | ------------ | ---------- | ---------------------------------------- |
| `check-design-system-guardrails.mjs`        | Design System    | design-system governance | yes  | yes      | no         | yes          | yes        | custom root/env                          |
| `check-design-system-visual-regression.mjs` | Design System    | visual regression        | yes  | yes      | no         | no           | no         | `process.cwd()`                          |
| `check-expo-route-collisions.mjs`           | Platform         | route governance         | yes  | yes      | no         | no           | no         | migrated to `scripts/lib/repo-tools.mjs` |
| `check-inventory-app-ui-contract.mjs`       | App Architecture | package governance       | yes  | yes      | no         | yes          | yes        | custom root/env                          |
| `check-no-hex.mjs`                          | Design System    | design-system governance | no   | yes      | no         | yes          | no         | local root logic                         |
| `check-package-release-discipline.mjs`      | Platform         | release                  | yes  | no       | no         | yes          | yes        | custom root/env                          |
| `check-runtime-boundaries.mjs`              | App Architecture | runtime governance       | yes  | yes      | no         | yes          | no         | uses shared tooling and baseline ratchet |
| `check-ui-package-extraction-readiness.mjs` | Platform         | package governance       | yes  | yes      | yes        | yes          | yes        | custom root/env                          |
| `check-ui-shell-guardrails.mjs`             | UI Shell         | package governance       | yes  | yes      | no         | yes          | yes        | custom root/env                          |
| `check-ui-tokens.mjs`                       | Design System    | design-system governance | yes  | yes      | yes        | yes          | no         | custom root/env and staged mode          |
| `check-workspace-packages.mjs`              | Platform         | package governance       | yes  | no       | no         | yes          | yes        | custom root/env                          |
| `generate-component-catalog.mjs`            | Design System    | build                    | no   | no       | no         | yes          | no         | fixed paths                              |
| `generate-design-tokens.mjs`                | Design System    | build                    | no   | no       | no         | yes          | no         | fixed paths                              |
| `generate-ui-library-catalog.mjs`           | UI Shell         | build                    | no   | no       | no         | yes          | no         | fixed paths                              |
| `run-design-system-proof.mjs`               | Release / QE     | e2e                      | yes  | no       | yes        | no           | no         | PATH tools plus dry-run                  |
| `run-expo-e2e.mjs`                          | Release / QE     | e2e                      | yes  | no       | yes        | no           | no         | uses shared e2e config                   |
| `run-maestro-suite.mjs`                     | Release / QE     | e2e                      | yes  | yes      | yes        | yes          | no         | PATH discovery and shared e2e config     |
| `test-seed-reset.mjs`                       | Data             | seed/reset               | yes  | no       | yes        | no           | no         | shared config plus dry-run               |
| `test-seed-verify.mjs`                      | Data             | seed/reset               | no   | no       | no         | no           | no         | imports shared seed helper               |
| `test-seed.shared.mjs`                      | Data             | seed/reset               | no   | no       | no         | no           | no         | uses `scripts/lib/script-config.cjs`     |
| `tooling.mjs`                               | Platform         | platform entrypoint      | yes  | no       | yes        | no           | no         | consolidated package-script dispatcher   |

## Duplication Clusters

- Manual CLI parsing: at least 13 scripts inspect `process.argv` directly.
- Manual filesystem walking: at least 10 scripts call `readdirSync` recursively or scan directories.
- Direct shell execution: at least 6 scripts call `spawn`, `spawnSync`, `execFile`, or `execFileSync`.
- Plain-text source reads: at least 14 scripts read source files directly.
- Plain-text docs reads: at least 7 scripts read docs as an enforcement input.
- Duplicated root resolution: guardrail scripts repeatedly derive roots through `__dirname`, `process.cwd()`, or custom `--root` parsing.
- Duplicated env loading: e2e and seed scripts now use `scripts/lib/script-config.cjs`; remaining
  custom env/root parsing belongs to non-migrated guardrail scripts.
- Duplicated violation reporting: guardrail scripts each define their own violation shape and console formatting.

## First Consolidation Slice

`scripts/lib/repo-tools.mjs` now provides:

- repository root resolution
- CLI parsing
- `.env` file loading
- script config resolution
- filesystem walking with ignore patterns
- prerequisite tool checks
- command execution with structured errors
- structured violation creation
- human and JSON violation output
- dry-run flag interpretation

`scripts/tooling.mjs` is the package-script entrypoint for checks, generators, seed commands, e2e
runners, and design-system proof commands. `scripts/check-expo-route-collisions.mjs` remains the
first fully migrated scanner proof of pattern; e2e and seed scripts now share the config module.
