# Test Taxonomy

Status: active Phase 1 test-pyramid contract.

## Layers

| Layer           | Purpose                                                                                                                       | Location                                                          | Blocks PRs                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| Unit            | Pure functions, services, reducers, view models, and small components with explicit mocks.                                    | `src/**/*.test.ts`, `__tests__/components`, focused feature tests | Yes                                                                  |
| Integration     | Store/service/repository flows against the Supabase test project.                                                             | `__tests__/integration`                                           | Yes after seed reset                                                 |
| E2E critical    | Device-level smoke for the highest-risk workflows.                                                                            | `.maestro/critical`                                               | Yes                                                                  |
| E2E full        | Broader device regression and exploratory flows.                                                                              | `.maestro/*.yaml` outside `critical`                              | Nightly                                                              |
| Visual          | Snapshot and pixel checks for design-system and selected screens.                                                             | `__tests__/visual`, design-system proof artifacts                 | PR for deterministic Jest snapshots, nightly/device for native proof |
| Source contract | Static architecture or source-shape checks that cannot yet be represented by TypeScript, ESLint, package exports, or schemas. | `__tests__/scripts`, remaining guardrail scripts                  | Yes only when structural replacement is not available                |
| Script          | Tooling entrypoints, structured output, config failures, and dry-run behavior.                                                | `__tests__/scripts`                                               | Yes                                                                  |

## Top 10 Business-Critical Workflows

1. Login with seeded integration user.
2. Dashboard loads after auth and shows seeded data.
3. Inventory search and filter.
4. Create invoice with stock deduction.
5. Open invoice detail from list.
6. Create customer and open detail.
7. Record payment against unpaid invoice.
8. Purchase/report drill-down from transactions.
9. Navigation smoke across primary tabs and settings.
10. Logout and return to auth.

The first seven are covered by `.maestro/critical`. Purchase drill-down is covered by Jest navigation
regression and should be promoted to critical e2e when the next device-flow pass is scheduled.

## Ownership

- Unit and feature tests: owning feature or service team.
- Integration tests and seed data: Data owner plus Release / QE.
- E2E critical and full suites: Release / QE.
- Visual baselines: Design System owner.
- Script and source-contract checks: Platform owner.

## Setup Boundaries

- Unit tests use `jest.setup.ts`; it must stay env-free.
- Integration tests use `jest.integration.config.js`, `__tests__/utils/integrationEnv.js`, and
  `__tests__/utils/integrationSetup.ts`.
- E2E tests use `scripts/tooling.mjs e2e:expo`, `scripts/tooling.mjs e2e:maestro`, and seed
  commands through the platform entrypoint.
- Visual Jest tests use `__tests__/visual/setup`; native proof uses Maestro and screenshot artifacts.

## CI Visibility

`ci.yml` exposes separate jobs for secret scan, validation, backend integration, iOS critical e2e,
Android critical e2e, design-system native proof, and nightly full suite. PR checks stop at critical
coverage; scheduled CI owns broad device duplication.
