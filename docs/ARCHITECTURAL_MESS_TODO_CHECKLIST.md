# Architectural Mess Todo Checklist

Source: `docs/ARCHITECTURAL_MESS_AUDIT.md`

Date created: 2026-05-04

Purpose: convert every issue, risk, release blocker, recommendation, target-state rule, exit
criterion, and threat-model finding from the audit into a dense implementation checklist.

Review expectation: another reviewer should be able to compare this file against the audit section by
section and verify that every actionable concern has an owner-ready todo.

## Current Implementation Progress

This section summarizes implementation progress so reviewers do not have to infer it from the
ownership and coverage-map scaffolding at the top of the file.

- [x] P0-001 Fractional Stock Truncation is closed by the numeric stock migration, DB test,
      TypeScript database contract artifact, service/regression tests, and reconciliation runbook.
- [x] P0-002 Broken Purchase Drill-Down From Reports is closed by the plural purchase route fix,
      shared route helper, unit coverage, UI navigation smoke coverage, and route audit.
- [x] P0-003 False Security Promise In Settings is closed for this release by removing the false
      biometric and auto-lock UI instead of exposing unenforced controls.
- [x] P0-004 Silent Supabase Misconfiguration Failure is closed by fail-fast Supabase config
      validation, repository guardrails, docs, and startup-health tests.
- [!] P0-005 Immediate Security Scanning Gate is active in CI, with a documented vulnerability
  baseline; `npm audit fix` remains blocked because the compatible path requires peer, engine, and
  major Expo/Jest dependency decisions.
- [~] Phase 1 has a completed config/tooling/package/local-machine/governance slice: TOOL-003,
  TOOL-008, TOOL-009, and TOOL-010 are closed, package scripts route through the platform
  entrypoint, and the remaining Phase 1 work is explicitly marked `[~]` inside TOOL-002,
  TOOL-004, TOOL-005, TOOL-006, and TOOL-007.
- [x] Phase 2 complete: RUNTIME-001 through RUNTIME-014 are closed by the expanded runtime-boundary
      ratchet, zero app raw-Supabase/repository/mock imports, normalized service/store errors,
      store/auth orchestrators, feature-owned route workflows, typed repository table names, and
      server-authoritative invoice totals.
- [x] Phase 3 reached: PERF-003 is closed by memoizing invoice line-item totals and covering 10-line,
      50-line, quantity, rate, discount, and GST-rate changes.
- [ ] The unchecked ownership, coverage-map, and later-phase items below are still live work unless
      explicitly marked `[!]` or `[r]`.

## How To Use This Checklist

- [ ] Treat every unchecked item as live work until it is either implemented or explicitly accepted as
      risk by the appropriate owner.
- [ ] Keep the audit open while executing this checklist; each section below names the audit area it
      covers.
- [ ] Before changing code, refresh file paths and line numbers because the audit was written against a
      repo snapshot from 2026-04-24.
- [ ] Do not close a task just because a related guardrail exists; close it only after the runtime,
      operational, and verification behavior is fixed.
- [ ] Do not add new one-off governance scripts while executing this checklist unless the task
      explicitly calls for replacing or consolidating existing scripts.
- [ ] Prefer structural enforcement through packages, TypeScript, lint rules, schemas, database
      constraints, and CI over regex checks and phrase checks.
- [ ] For every P0/P1 task, add a regression test or operational check that would have caught the
      audited defect.
- [ ] For every security, data-integrity, backup, or release-compatibility task, document the rollback
      and support path before marking the task done.
- [ ] Use this status key consistently: `[ ]` not started, `[~]` in progress, `[x]` done, `[!]`
      blocked, `[r]` risk accepted.
- [ ] Preserve the strengths called out in the audit while reducing the custom governance surface.

## Ownership Tracks

- [ ] Assign an App Architecture owner for route boundaries, feature modules, stores, auth orchestration,
      and screen-level accessibility.
- [ ] Assign a Data owner for Supabase schema, RLS, indexes, RPC integrity, generated database types,
      rollback plans, and data reconciliation.
- [ ] Assign a Platform owner for scripts, CI, environment/config resolution, package extraction, and
      shared tooling.
- [ ] Assign a Security owner for dependency hygiene, secret management, token storage, local data
      encryption, scanning, threat-model closure, and false-security UI removal.
- [ ] Assign a Release / QE owner for regression coverage, e2e paths, compatibility checks, release
      gates, and evidence collection.
- [ ] Assign a Reliability owner for observability, alerting, backup/restore drills, incident runbooks,
      and recovery targets.
- [ ] Add each owner to `CODEOWNERS` once that file exists.
- [ ] Create a single remediation board or issue epic with IDs matching this checklist.
- [ ] Require each merged remediation PR to update the relevant checklist items.
- [ ] Require explicit risk-acceptance notes for any audit issue intentionally deferred.

## Audit Coverage Map

- [ ] Covered: Executive Summary.
- [ ] Covered: Quantitative Snapshot.
- [ ] Covered: Immediate Release-Blocking Defects.
- [ ] Covered: Part I, section 1, bespoke internal toolchain.
- [ ] Covered: Part I, section 2, fragmented configuration resolution.
- [ ] Covered: Part I, section 3, non-hermetic test environment.
- [ ] Covered: Part I, section 4, muddled test pyramid.
- [ ] Covered: Part I, section 5, regex and file-scan architecture enforcement.
- [ ] Covered: Part I, section 6, documentation as required build artifact.
- [ ] Covered: Part I, section 7, hybrid package extraction story.
- [ ] Covered: Part I, section 8, local-machine-dependent tooling.
- [ ] Covered: Part II, section 9, Supabase client silent landmine.
- [ ] Covered: Part II, section 10, inconsistent error handling.
- [ ] Covered: Part II, section 11, type-safety gaps.
- [ ] Covered: Part II, section 11A, route-layer architecture violations.
- [ ] Covered: Part II, section 11B, mock-backed product surfaces.
- [ ] Covered: Part II, section 12, state-management scaling problems.
- [ ] Covered: Part II, section 12A, auth lifecycle listener accumulation.
- [ ] Covered: Part II, section 13, barrel exports and tree-shaking.
- [ ] Covered: Part II, section 13A, fat route files.
- [ ] Covered: Part III, section 14, re-render risks.
- [ ] Covered: Part III, section 15, missing lazy loading and eager preloading.
- [ ] Covered: Part III, section 16, missing database indexes.
- [ ] Covered: Part IV, section 17, security strengths to preserve.
- [ ] Covered: Part IV, section 18, false security signals and unencrypted local storage.
- [ ] Covered: Part IV, section 19, permissive RLS.
- [ ] Covered: Part IV, section 20, irreversible destructive migrations.
- [ ] Covered: Part V, section 21, dangerous operational paths.
- [ ] Covered: Part V, section 22, offline write queue edge cases.
- [ ] Covered: Part V, section 22A, production observability gap.
- [ ] Covered: Part V, section 22B, mobile release compatibility gap.
- [ ] Covered: Part V, section 22C, backup/restore/incident-response gap.
- [ ] Covered: Part VI, section 23, governance through accretion.
- [ ] Covered: Symptoms Versus Root Cause.
- [ ] Covered: What Is Good Here.
- [ ] Covered: Recommended Direction, items 1 through 23.
- [ ] Covered: Recommended Direction section 1, stop the bleeding.
- [ ] Covered: Recommended Direction section 2, re-establish one runtime architecture.
- [ ] Covered: Recommended Direction section 2A, decide server-authoritative workflows.
- [ ] Covered: Recommended Direction section 3, fix the silent failure chain.
- [ ] Covered: Recommended Direction section 4, standardize error handling.
- [ ] Covered: Recommended Direction section 5, separate auth/session startup from store state.
- [ ] Covered: Recommended Direction section 6, complete, hide, or downgrade mock-backed surfaces.
- [ ] Covered: Recommended Direction section 7, create a real internal tooling foundation.
- [ ] Covered: Recommended Direction section 8, centralize environment resolution.
- [ ] Covered: Recommended Direction section 8A, add a mobile compatibility contract.
- [ ] Covered: Recommended Direction section 9, break apart fat routes into feature modules.
- [ ] Covered: Recommended Direction section 10, redesign the test pyramid.
- [ ] Covered: Recommended Direction section 11, decide whether extracted packages are real.
- [ ] Covered: Recommended Direction section 12, productionize observability.
- [ ] Covered: Recommended Direction section 12A, productionize backup, restore, and incident runbooks.
- [ ] Covered: Recommended Direction section 13, fix performance low-hanging fruit.
- [ ] Covered: Recommended Direction section 14, complete or remove incomplete security features.
- [ ] Covered: Recommended Direction section 15, address barrel exports and dependency boundaries.
- [ ] Covered: Recommended Direction section 16, demote docs from enforcement primitives.
- [ ] Covered: Recommended Direction section 17, fix the database type mismatch.
- [ ] Covered: Recommended Direction section 18, add security scanning to CI.
- [ ] Covered: Recommended Direction section 19, complete or scope i18n.
- [ ] Covered: Recommended Direction section 20, add team process infrastructure.
- [ ] Covered: Recommended Direction section 21, manage store lifecycle explicitly.
- [ ] Covered: Recommended Direction section 22, scope RLS policies.
- [ ] Covered: Recommended Direction section 23, fix known correctness defects.
- [ ] Covered: Target-State Architecture.
- [ ] Covered: Execution Plan And Ownership Model.
- [ ] Covered: Elite Enterprise Exit Criteria.
- [ ] Covered: Part VII, section 24, design-system accessibility strengths.
- [ ] Covered: Part VII, section 25, app-level accessibility gaps.
- [ ] Covered: Part VIII, section 26, i18n infrastructure strengths.
- [ ] Covered: Part VIII, section 27, hardcoded strings.
- [ ] Covered: Part VIII, section 28, untranslatable error messages.
- [ ] Covered: Part VIII, section 29, missing pluralization.
- [ ] Covered: Part IX, section 30, CI strengths.
- [ ] Covered: Part IX, section 31, missing security scanning.
- [ ] Covered: Part IX, section 32, missing team process infrastructure.
- [ ] Covered: Part IX, section 33, `--legacy-peer-deps` risk.
- [ ] Covered: Part X, section 34, database strengths.
- [ ] Covered: Part X, section 35, critical numeric type mismatch.
- [ ] Covered: Part X, section 36, uniformly permissive RLS policies.
- [ ] Covered: Part X, section 37, migration 015 numbering conflict.
- [ ] Covered: Part X, section 38, missing indexes and FK coverage.
- [ ] Covered: Part X, section 39, missing rollback migrations.
- [ ] Covered: Part X, section 40, denormalization intent.
- [ ] Covered: Part XI, section 41, memory cleanup strengths.
- [ ] Covered: Part XI, section 42, module-level eventBus subscriptions.
- [ ] Covered: Part XI, section 43, auth subscription teardown.
- [ ] Covered: Part XI, section 44, FlatList virtualization strengths.
- [ ] Covered: Part XI, section 45, offline queue edge cases.
- [ ] Covered: Part XII, section 46, current direct dependencies.
- [ ] Covered: Part XII, section 47, unpatched transitive vulnerabilities.
- [ ] Covered: Part XII, section 48, missing dependency hygiene.
- [ ] Covered: Part XIII, section 49, invoice list re-render budget.
- [ ] Covered: Part XIII, section 50, dashboard inline allocations.
- [ ] Covered: Part XIII, section 51, line-item computation on each keystroke.
- [ ] Covered: Part XIII, section 52, `forwardRef` molecules without `React.memo`.
- [ ] Covered: Part XIII, section 53, startup API-call budget.
- [ ] Covered: Part XIII, section 54, query timing aggregation gap.
- [ ] Covered: Part XIV, section 55, focus management gaps.
- [ ] Covered: Part XIV, section 56, missing semantic structure.
- [ ] Covered: Part XIV, section 57, unlabeled destructive and interactive icons.
- [ ] Covered: Part XIV, section 58, helper text and contrast gaps.
- [ ] Covered: Part XIV, section 59, pagination and dynamic-content announcements.
- [ ] Covered: Part XV, section 60, STRIDE findings.
- [ ] Covered: Part XV, section 61, OWASP Mobile Top 10 mapping.
- [ ] Covered: Part XV, section 62, threat-model summary.
- [ ] Covered: What I Would Tell Leadership.
- [ ] Covered: Bottom Line.

## Phase 0: Release-Blocking Correctness And Trust

Audit refs: Immediate Release-Blocking Defects, Recommended Direction 17 and 23, Execution Plan
Phase 0.

### P0-001 Fractional Stock Truncation

- [x] Confirm current definitions of `stock_operations.quantity_change`, `stock_operations.previous_quantity`,
      `stock_operations.new_quantity`, and `inventory_items.box_count`.
- [x] Confirm whether any later migration already changed those fields to `NUMERIC`.
- [x] Add a new forward migration that changes `stock_operations.quantity_change` to `NUMERIC`.
- [x] Add a new forward migration that changes `stock_operations.previous_quantity` to `NUMERIC`.
- [x] Add a new forward migration that changes `stock_operations.new_quantity` to `NUMERIC`.
- [x] Add a new forward migration that changes `inventory_items.box_count` to `NUMERIC`.
- [x] Update the original `create_invoice_with_items()` definition path if still relevant to stop casting
      invoice quantities to `INTEGER`.
- [x] Update the active replacement `create_invoice_with_items()` function in the latest RPC migration path
      to cast quantities to `NUMERIC`.
- [x] Search all Supabase SQL for `quantity')::INTEGER`, `quantity::INTEGER`, and `quantity_change INTEGER`.
- [x] Search service and repository code for assumptions that stock quantities are integers.
- [x] Update TypeScript database types after the migration.
- [x] Add a database test for selling `2.5` units and deducting exactly `2.5`.
- [x] Add a service-level test for fractional invoice quantities flowing through stock deduction.
- [x] Add a reconciliation query that detects invoices with fractional quantities created before the fix.
- [x] Produce a one-time backfill or reconciliation plan for affected inventory records.
- [x] Document the customer-support path for correcting inventory drift caused by historical truncation.
- [x] Add an alert or migration note that this is a P0 data-integrity remediation.
- [x] Mark the task done only after database, TypeScript, service, and regression-test layers agree.

### P0-002 Broken Purchase Drill-Down From Reports

- [x] Confirm the current purchase detail route file path.
- [x] Confirm the route currently produced by `app/(app)/reports/all-transactions.tsx`.
- [x] Replace `/(app)/finance/purchase/${p.id}` with the actual plural route shape if still broken.
- [x] Add a route-construction helper or typed route constant for finance purchase detail paths.
- [x] Search the app for singular `finance/purchase/` route strings.
- [x] Search the app for other hardcoded route strings that differ from filesystem route names.
- [x] Add a unit test for all-transactions purchase-row navigation.
- [x] Add an e2e or UI navigation smoke test that opens a purchase from reports.
- [x] Include this case in the top 10 business-critical navigation regression suite.
- [x] Mark the task done only after the report drill-down reaches the detail screen in test.

### P0-003 False Security Promise In Settings

- [x] Inventory every control in `app/(app)/settings/security.tsx`.
- [x] Confirm whether `expo-local-authentication` is called anywhere.
- [x] Confirm whether auto-lock enforcement exists anywhere.
- [x] Remove the biometric toggle if enforcement is not being implemented in the same release.
- [x] Remove the auto-lock timer UI if enforcement is not being implemented in the same release.
- [x] Not applicable this release: biometric enforcement was not implemented because the false UI was
      removed instead.
- [x] Not applicable this release: auto-lock triggers were not implemented because the false UI was
      removed instead.
- [x] Not applicable this release: no new auto-lock metadata is persisted because the feature is hidden.
- [x] Add tests proving removed security controls cannot drift as local-only component state.
- [x] Add copy that avoids implying protection until enforcement is active.
- [x] Add product/release approval before any security control is exposed in live settings.
- [x] Mark the task done only after the UI and enforcement path cannot drift independently.

### P0-004 Silent Supabase Misconfiguration Failure

- [x] Replace `{} as ReturnType<typeof createClient>` in `src/config/supabase.ts`.
- [x] Replace empty-object fallback behavior in `src/repositories/baseRepository.ts`.
- [x] Define a typed startup configuration error for missing Supabase URL.
- [x] Define a typed startup configuration error for missing Supabase anon key.
- [x] Ensure missing config fails at startup with a clear message.
- [x] Ensure tests can inject a fake client without relying on missing-env fallbacks.
- [x] Add a unit test proving missing URL throws the expected configuration error.
- [x] Add a unit test proving missing anon key throws the expected configuration error.
- [x] Add a test proving repositories cannot call `.from()` on an empty object.
- [x] Add an app startup health check that validates Supabase configuration once.
- [x] Update developer docs to explain required env variables and failure modes.
- [x] Mark the task done only after no runtime path can export a fake Supabase client.

### P0-005 Immediate Security Scanning Gate

- [x] Add `npm audit --audit-level=high` to CI as a required check.
- [x] Decide whether the first security gate should fail immediately or run in reporting mode for one
      short remediation branch.
- [x] Run `npm audit` locally and store the current vulnerability baseline in the security issue.
- [!] Apply `npm audit fix` for fixable lodash and forge vulnerabilities if compatible; dry-run showed the
  remaining fixes are entangled with peer-resolution, Node engine, or major Expo/Jest movements.
- [x] Create explicit issues for no-fix vulnerabilities, especially `xlsx` and Handlebars chains.
- [x] Add secret scanning to CI before the next release branch.
- [x] Confirm `.env.test` remains ignored.
- [x] Add `.env.example` with safe placeholder values.
- [x] Move all CI test credentials into GitHub Secrets or the chosen secret manager.
- [x] Mark the task done only after CI fails on new high/critical vulnerabilities or leaked secrets.

## Phase 1: Tooling, Scripts, And Meta-Architecture

Audit refs: Part I sections 1 through 8, Part VI section 23, Recommended Direction 1, 7, 8, 11,
15, and 16.

### TOOL-001 Baseline The Bespoke Toolchain

- [x] Recount root `package.json` scripts and compare with the audit baseline of 41.
- [x] Recount root `scripts/*.mjs` files and compare with the audit baseline of 19.
- [x] Recount total `scripts/*.mjs` LOC and compare with the audit baseline of 4,806.
- [x] List every script and its current owner.
- [x] Classify every script as build, test, e2e, design-system governance, package governance,
      environment, seed/reset, visual regression, or release.
- [x] Identify scripts that parse CLI args manually.
- [x] Identify scripts that walk the filesystem manually.
- [x] Identify scripts that shell out directly.
- [x] Identify scripts that read source files as plain text.
- [x] Identify scripts that read docs as plain text.
- [x] Identify duplicated root-discovery logic across scripts.
- [x] Identify duplicated env-loading logic across scripts.
- [x] Identify duplicated structured-output or violation-reporting logic across scripts.
- [x] Create a script inventory table in a platform issue.
- [x] Define the target maximum number of one-off scripts after consolidation.

### TOOL-002 Create A Shared Internal Tooling Foundation

- [x] Create a shared internal Node tooling module location.
- [x] Add a common CLI parser helper.
- [x] Add a common repository-root resolver.
- [x] Add a common environment loader.
- [x] Add a typed config resolver for script contexts.
- [x] Add a common filesystem walker that supports ignore patterns.
- [x] Add a common command runner wrapper with structured errors.
- [x] Add a common violation format with severity, file path, line, rule, and message.
- [x] Add JSON output support for scripts that produce machine-readable results.
- [x] Add human-readable output support for local developer use.
- [x] Add dry-run support for destructive or baseline-updating scripts.
- [x] Add tests for root resolution from nested working directories.
- [x] Add tests for missing prerequisite tools.
- [x] Add tests for structured violation output.
- [x] Migrate one low-risk script first as a proof of pattern.
- [~] Migrate the remaining scripts in small batches.
- [x] Delete duplicated helper logic after each script migration.
- [x] Update package scripts to call the consolidated entry points.
- [x] Mark done only when new governance scripts can be built by extending the shared module.

### TOOL-003 Centralize Configuration Resolution

- [x] Define explicit config modes: `dev`, `test`, `integration`, `e2e`, `ci`, and `production`.
- [x] Build one typed config module used by app runtime where possible.
- [x] Build one typed config module used by Node scripts.
- [x] Decide whether app and Node config share a package or share generated schema definitions.
- [x] Remove implicit fallback from `EXPO_PUBLIC_*` to `SUPABASE_TEST_*` in app runtime.
- [x] Remove global test credential loading from unit-test setup.
- [x] Remove `process.env` mutation from `jest.integration.config.js` once a typed config adapter exists.
- [x] Remove manual `.env.test` parsing from `scripts/run-expo-e2e.mjs`.
- [x] Remove manual `.env.test` parsing from `scripts/run-maestro-suite.mjs`.
- [x] Add mode-explicit env validation at each command entry point.
- [x] Add fail-fast errors for ambiguous config, missing config, or mixed mode variables.
- [x] Add `.env.example` documenting all required public app variables.
- [x] Add `.env.example` documenting all required integration/e2e variables without secrets.
- [x] Document where real test credentials live outside the repo.
- [x] Add tests proving unit tests do not inherit integration credentials.
- [x] Add tests proving integration tests fail clearly when test credentials are missing.
- [x] Add tests proving e2e launch fails clearly when bundle env variables are missing.
- [x] Mark done only after every execution context uses one config contract.

### TOOL-004 Make The Test Environment Hermetic

- [x] Shrink `jest.setup.ts` toward a target under 200 lines.
- [x] Split unit, integration, visual, and e2e setup responsibilities.
- [x] Remove global `.env.test` loading from unit tests.
- [~] Remove global Supabase mocking from tests that do not need Supabase.
- [x] Fix contradictory comments about Supabase mocking.
- [x] Remove or isolate the global `console.error` interception.
- [x] Remove or isolate the global `console.warn` interception.
- [x] Remove or isolate the monkey patch of `jest.spyOn`.
- [~] Move native registry logic into a dedicated per-suite helper.
- [x] Move large React Native mocks into explicit setup modules.
- [~] Move `@shopify/flash-list` mocking into suites that render virtualized lists.
- [~] Move `expo-router` mocking into router-aware test helpers.
- [~] Move i18next mocking into i18n-aware test helpers.
- [x] Avoid loading real `en.json` at global module load unless the test explicitly needs it.
- [x] Add a smoke test proving a pure unit test starts without app env variables.
- [x] Add a smoke test proving an integration test uses the integration setup.
- [x] Add documentation for which setup file belongs to which test layer.
- [~] Mark done only when test setup no longer behaves like an alternate runtime.

### TOOL-005 Redesign The Test Pyramid

- [x] Create a test taxonomy document with unit, integration, e2e, visual, source-contract, and script
      test definitions.
- [~] Move static source-shape rules to ESLint, TypeScript, package tooling, or purpose-built static
  checks.
- [~] Keep Jest tests focused on runtime behavior unless a source-contract test is explicitly justified.
- [~] Split `__tests__/visual/snapshots.test.tsx` into smaller owned suites.
- [~] Remove hand-maintained visual-suite mocks that duplicate application runtime logic where possible.
- [x] Make `jest-image-snapshot` availability deterministic in CI.
- [x] Update integration-test docs to use the actual package manager and script names.
- [x] Add explicit owners for visual baselines.
- [x] Reduce e2e coverage to critical workflows plus smoke tests, not broad UI duplication.
- [x] Define top 10 business-critical workflows for regression coverage.
- [x] Define which failures block PRs and which failures are nightly-only.
- [x] Add a CI job matrix that makes each layer visible as its own responsibility.
- [~] Mark done only after test count communicates confidence instead of hiding overlap.

### TOOL-006 Replace Regex Boundary Enforcement With Structural Boundaries

- [x] Inventory every regex import scanner in `scripts/check-design-system-guardrails.mjs`.
- [x] Inventory every regex import scanner in `scripts/check-ui-shell-guardrails.mjs`.
- [x] Inventory every regex import scanner in `scripts/check-inventory-app-ui-contract.mjs`.
- [x] Inventory every regex import scanner in `scripts/check-workspace-packages.mjs`.
- [x] Inventory every regex import scanner in `scripts/check-ui-tokens.mjs`.
- [x] Inventory source-text contract checks in `src/design-system/__tests__/componentContract.test.ts`.
- [x] Inventory source-text contract checks in `src/design-system/__tests__/boundary.test.ts`.
- [x] Replace import-boundary checks with ESLint `no-restricted-imports` where possible.
- [x] Replace package-boundary checks with workspace package `exports` where possible.
- [x] Not needed in this slice: defer TypeScript project references until package boundaries need
      compile-time enforcement beyond package exports and ESLint.
- [x] Add dependency graph enforcement through existing tooling where possible.
- [~] Keep only those custom scanners that cannot be represented structurally.
- [x] Add tests for custom ESLint rules if new custom rules are created.
- [~] Delete redundant scanner rules after structural replacements land.
- [~] Mark done only when satisfying a regex is no longer the primary proof of architecture.

### TOOL-007 Demote Documentation From Build Artifact To Support Artifact

- [x] Inventory every script and test that requires exact markdown phrases.
- [x] Classify each phrase check as contract, generated-doc verification, stale guardrail, or removable.
- [~] Replace phrase checks with schema checks where the doc describes structured data.
- [~] Replace phrase checks with generated docs where the doc is derived from code.
- [x] Replace phrase checks with PR review checklist items where human judgment is required.
- [~] Remove build failures caused only by harmless prose wording changes.
- [x] Keep docs that explain architecture and operational runbooks.
- [~] Delete obsolete docs that duplicate active source-of-truth files.
- [x] Add a docs ownership policy.
- [x] Add a docs freshness review cadence for critical docs only.
- [~] Mark done only when docs support architecture instead of acting as the control plane.

### TOOL-008 Decide Package Extraction Strategy

- [x] Decide whether `src/design-system` is a real package or an internal module with extraction intent.
- [x] Decide whether `src/ui-shell` is a real package or an internal module with extraction intent.
- [x] Decide whether `examples/ops-console` is a true second consumer or a proof fixture.
- [x] Not required for source workspaces in this slice: package build outputs or TypeScript project
      references are deferred until publishing or supporting a non-Expo consumer.
- [x] If real packages, make package `exports` the boundary rather than source scanners.
- [x] If real packages, ensure consumers import through package names, not internal source paths.
- [x] If internal modules, reduce extraction-readiness guardrails to a lighter policy.
- [x] Remove hybrid claims that require constant script policing.
- [x] Fix token provenance so foundations do not point back into legacy app surfaces unless intentional.
- [x] Define measurable extraction exit criteria.
- [x] Mark done only after package status is explicit and enforcement matches that status.

### TOOL-009 Remove Hidden Local-Machine Assumptions

- [x] Inventory references to `~/.nvm/nvm.sh`.
- [x] Inventory direct `npx supabase` calls.
- [x] Inventory `bash -lc command -v` tool discovery.
- [x] Inventory `/opt/homebrew/bin/maestro`.
- [x] Inventory `/usr/bin/open`.
- [x] Inventory `xcrun simctl` assumptions.
- [x] Add prerequisite validation at script entry points.
- [x] Prefer PATH-based tool discovery with clear installation instructions.
- [x] Add CI-friendly non-interactive behavior for all scripts.
- [x] Add platform checks for macOS-only commands.
- [x] Add fallback instructions when optional tools are absent.
- [x] Add dry-run mode for commands that mutate simulator, filesystem, or baselines.
- [x] Consider container or CI parity for scripts that must be portable.
- [x] Mark done only when a new engineer can run the core commands without reverse-engineering the
      local machine setup.

### TOOL-010 Stop Governance Accretion

- [x] Add a temporary moratorium on new one-off governance scripts.
- [x] Require platform-owner approval for new scripts.
- [x] Require each new governance mechanism to replace or consolidate an existing one where feasible.
- [x] Create a deletion list for redundant docs, scripts, generated artifacts, and source-contract tests.
- [x] Track net script count per remediation sprint.
- [x] Track net docs count or docs LOC for governance docs.
- [x] Track time spent maintaining governance code separately from product code.
- [x] Add an architecture decision record for the governance simplification strategy.
- [x] Mark done only when the control surface is stable or shrinking.

## Phase 2: Runtime Architecture And Code Quality

Audit refs: Part II sections 9 through 13A, Recommended Direction 2 through 6, 9, 15, 21, 23,
Target-State Architecture.

### RUNTIME-001 Enforce The Target Dependency Graph

- [x] Adopt this graph: routes/screens -> feature modules/view models -> services/use cases ->
      repositories/read models -> typed backend interface.
- [x] Define the simple-read lane for list/detail queries and low-risk CRUD.
- [x] Define the server-authoritative lane for money, stock, ledger, compliance, imports, exports, and
      auth-adjacent security flows.
- [x] Create lint boundaries for route files.
- [x] Create lint boundaries for feature modules.
- [x] Create lint boundaries for stores.
- [x] Create lint boundaries for services.
- [x] Create lint boundaries for repositories.
- [x] Add examples of allowed imports per layer.
- [x] Add examples of disallowed imports per layer.
- [x] Add a CI check that fails on new raw Supabase imports from `app/`.
- [x] Add a CI check that fails on new repository imports from `app/`.
- [x] Add a CI check that fails on live-route imports from `src/mocks`.
- [x] Mark done only when the dependency graph is enforceable without tribal knowledge.

### RUNTIME-002 Remove Raw Supabase From Route Files

- [x] Search `app/` for imports from the Supabase config/client.
- [x] Refactor `app/(app)/inventory/[id].tsx` to stop mixing raw Supabase with services.
- [x] Refactor `app/(app)/finance/purchases/[id].tsx` to stop reading purchases via raw Supabase.
- [x] Refactor `app/(app)/finance/purchases/[id].tsx` to stop deleting purchases via raw Supabase.
- [x] Add service/use-case methods for any missing purchase detail operations.
- [x] Add service/use-case methods for any missing inventory detail operations.
- [x] Normalize errors from the new service methods.
- [x] Add tests for each extracted service/use-case method.
- [x] Add route tests proving the screens use the service/view-model path.
- [x] Mark done only when raw Supabase imports in `app/` are zero.

### RUNTIME-003 Remove Direct Repository Access From Route Files

- [x] Search `app/` for direct repository imports.
- [x] Refactor `app/(app)/reports/all-parties.tsx` so it does not combine store access with
      `supplierRepository.findMany()` in the route.
- [x] Refactor `app/(app)/suppliers/index.tsx` to use a service, view model, or store.
- [x] Refactor `app/(app)/finance/payments/make.tsx` so supplier lookup is not direct repository access
      from UI code.
- [x] Add read-model or service APIs for supplier lookups if needed.
- [x] Document whether routes may use read models directly; default answer should be no unless explicitly
      adopted.
- [x] Add lint rules for route-level repository imports.
- [x] Add regression tests for the refactored supplier and payment screens.
- [x] Mark done only when direct repository imports in route files are zero or formally allowed by a
      documented read-model exception.

### RUNTIME-004 Complete Or Hide Mock-Backed Product Surfaces

- [x] Search `app/` for imports from `src/mocks`.
- [x] Build an inventory of all mock-backed app screens.
- [x] Confirm the audit-listed screens still import mock data: `reports/gstr1.tsx`.
- [x] Confirm the audit-listed screens still import mock data: `reports/gstr3b.tsx`.
- [x] Confirm the audit-listed screens still import mock data: `finance/cash.tsx`.
- [x] Confirm the audit-listed screens still import mock data: `reports/party-statement.tsx`.
- [x] Confirm the audit-listed screens still import mock data: `finance/bank-accounts/index.tsx`.
- [x] Identify all placeholder export actions.
- [x] Identify all placeholder save actions.
- [x] Identify all placeholder share actions.
- [x] For finance screens, either wire real data or hide from live navigation.
- [x] For statutory reporting screens, either wire real data or hide from live navigation.
- [x] For beta surfaces, add a feature flag and visible beta state.
- [x] For coming-soon surfaces, remove operational actions that look functional.
- [x] Add a live-navigation test that fails if a screen imports `src/mocks`.
- [x] Add a product-release checklist item for mock-backed surfaces.
- [x] Mark done only when live navigation exposes zero completed-looking mock-backed workflows.

### RUNTIME-005 Standardize Service Error Handling

- [x] Define the single rule: service boundaries normalize errors using `toAppError()` or its successor.
- [x] Search services for `throw error`.
- [x] Search services for `throw new Error`.
- [x] Search services for untyped `catch (error)` blocks.
- [x] Update `paymentService.ts` and `invoiceService.ts` to type caught errors as `unknown` if needed.
- [x] Update `orderService.ts` so raw Supabase errors do not escape.
- [x] Update `businessProfileService` to validate and normalize errors.
- [x] Ensure service methods expose typed errors to stores.
- [x] Add tests proving Supabase errors map to the intended `AppError`.
- [x] Add tests for non-Error thrown values.
- [x] Add tests for validation errors.
- [x] Mark done only when raw persistence errors do not cross upward into stores or screens.

### RUNTIME-006 Standardize Store Error Handling

- [x] Search stores for `(error as Error).message`.
- [x] Replace casts with a shared safe error-message extractor or pre-normalized `AppError`.
- [x] Search stores for empty `catch {}` blocks.
- [x] Replace swallowed errors in `authStore.ts` with telemetry and user-appropriate state.
- [x] Ensure stores never need to know Supabase error shapes.
- [x] Add store tests for non-Error thrown values.
- [x] Add store tests for missing error messages.
- [x] Ensure user-visible errors are translatable once i18n error work lands.
- [x] Mark done only when store error states are consistent and debuggable.

### RUNTIME-007 Close Type-Safety Gaps

- [x] Search production code for `as unknown as`.
- [x] Remove the double cast in `invoiceService.ts` around `repo.createAtomic`.
- [x] Align `invoiceData` shape with the repository create input.
- [x] Remove the export-service row casts if the rows are already typed.
- [x] Link `InvoiceInputSchema` and `InvoiceInput` with `z.infer`.
- [x] Link other Zod schemas and TypeScript types where drift is possible.
- [x] Add tests or type assertions that fail when schema and type drift.
- [x] Generate Supabase TypeScript types from the database schema.
- [x] Use generated table types for repository inputs and outputs.
- [x] Replace string table names with typed table-name keys.
- [x] Add compile-time checks for repository table names.
- [x] Mark done only when the audited casts are gone or justified with narrow comments.

### RUNTIME-008 Move Business Orchestration Out Of Stores

- [x] Inventory business logic currently living in stores.
- [x] Move conflict-resolution state machines from stores into services or feature orchestrators.
- [x] Move debounce policy out of stores when it represents UI behavior.
- [x] Move data transformation out of stores when it represents business rules.
- [x] Keep stores focused on cached server state, UI/session state, and derived selectors.
- [x] Add service tests for moved business rules.
- [x] Add store tests proving stores dispatch actions but do not own persistence policy.
- [x] Mark done only when stores are lifecycle-aware state containers, not hidden business engines.

### RUNTIME-009 Replace Module-Scope Store Side Effects

- [x] Search stores for module-level `eventBus.subscribe`.
- [x] Capture the current six module-level subscriptions listed in the audit.
- [x] Design a `StoreOrchestrator` or React lifecycle owner for store invalidation.
- [x] Move `customerStore.ts` event reactions into the orchestrator.
- [x] Move `dashboardStore.ts` event reactions into the orchestrator.
- [x] Move `invoiceStore.ts` event reactions into the orchestrator.
- [x] Move `financeStore.ts` event reactions into the orchestrator.
- [x] Move `notificationStore.ts` event reactions into the orchestrator.
- [x] Move `inventoryStore.ts` event reactions into the orchestrator.
- [x] Store unsubscribe callbacks from every eventBus subscription.
- [x] Add teardown tests for the orchestrator.
- [x] Add Fast Refresh development tests or manual validation for duplicate handler prevention.
- [x] Document why event reactions live in the orchestrator.
- [x] Mark done only when importing a store does not register global business behavior.

### RUNTIME-010 Remove Global Mutable Store Races

- [x] Review `inventoryStore.ts` module-level `pendingResetFetch`.
- [x] Replace shared module flag with store state, request identity, or service-level dedupe.
- [x] Review `customerStore.ts` module-level debounce instance.
- [x] Replace shared debounce with component-level or orchestrator-level debounce.
- [x] Add concurrent-use tests for inventory fetching semantics.
- [x] Add concurrent-use tests for customer search/debounce semantics.
- [x] Mark done only when independent UI contexts cannot affect each other through module globals.

### RUNTIME-011 Separate Auth Session Orchestration From Store State

- [x] Create a dedicated auth/session orchestrator.
- [x] Ensure exactly one startup path owns `onAuthStateChange`.
- [x] Capture the subscription returned by `authService.onAuthStateChange`.
- [x] Add explicit unsubscribe semantics.
- [x] Call unsubscribe on logout.
- [x] Call unsubscribe on app teardown if applicable.
- [x] Separate foreground resume validation from long-lived subscription setup.
- [x] Remove repeated listener registration from `authStore.initialize()`.
- [x] Make `ShellAuthGate` call the orchestrator rather than owning listener details.
- [x] Make shell environment resume hooks call validation rather than initialization.
- [x] Add tests proving duplicate initialize calls do not create duplicate listeners.
- [x] Add tests proving logout tears down the subscription.
- [x] Add telemetry for auth churn and listener errors.
- [x] Mark done only when auth listener ownership is singular and teardown-tested.

### RUNTIME-012 Fix Barrel Exports And Tree-Shaking Boundaries

- [x] Inventory barrel imports from `src/repositories/index.ts`.
- [x] Inventory barrel imports from `src/design-system/components/molecules/index.ts`.
- [x] Decide whether direct imports or package export maps are the preferred solution.
- [x] If using direct imports, update app imports of `ListItem` and other molecules to module paths.
- [x] If using export maps, verify Metro honors them for React Native bundling.
- [x] Add ESLint rules banning app-level imports from heavy barrel modules.
- [x] Add exceptions only for package public APIs that are intentionally stable.
- [x] Measure bundle or startup impact before and after high-volume import changes.
- [x] Mark done only when importing one molecule does not evaluate the entire molecule layer.

### RUNTIME-013 Break Apart Fat Route Files

- [x] Refresh the list of app files over 300 LOC.
- [x] Refresh the list of app files over 500 LOC.
- [x] Start with `app/(app)/inventory/add.tsx`.
- [x] Extract inventory-add form state into a feature hook.
- [x] Extract inventory-add validation/request shaping into a feature module.
- [x] Extract inventory-add view components where useful.
- [x] Add tests for the inventory-add feature hook.
- [x] Continue with `app/(auth)/setup.tsx`.
- [x] Extract setup workflow state into a feature hook.
- [x] Extract setup request shaping and validation into services or feature modules.
- [x] Add tests for the setup flow.
- [x] Continue with `app/(app)/invoices/[id].tsx`.
- [x] Extract invoice detail actions into a feature hook or view model.
- [x] Extract invoice detail rendering helpers into local components.
- [x] Add tests for invoice detail actions.
- [x] Copy the healthier `src/features/invoice-create` pattern where appropriate.
- [x] Define a route-file budget and review exceptions intentionally.
- [x] Mark done only when routes compose workflows instead of owning them end to end.

### RUNTIME-014 Make Critical Writes Server-Authoritative

- [x] Classify invoice creation as server-authoritative.
- [x] Classify invoice edits that affect totals or stock as server-authoritative.
- [x] Classify payment recording and ledger updates as server-authoritative.
- [x] Classify stock mutations and reconciliation as server-authoritative.
- [x] Classify compliance/report exports as server-authoritative or auditable.
- [x] Classify file parsing/import pipelines as server-authoritative where trust matters.
- [x] Classify auth-adjacent security flows as server-owned policy.
- [x] Ensure clients send intent and draft values, not trusted final totals.
- [x] Ensure the server recomputes totals and tax invariants.
- [x] Ensure the server validates stock invariants.
- [x] Ensure the server writes audit records.
- [x] Ensure the server enforces idempotency.
- [x] Add tests proving tampered client totals are rejected or recomputed.
- [x] Mark done only when money, stock, ledger, and compliance mutations do not trust the client.

## Phase 3: Performance And Startup Ownership

Audit refs: Part III sections 14 through 16, Part XIII sections 49 through 54, Recommended Direction 13.

### PERF-001 Fix Invoice List Re-Render Budget

- [ ] Review `app/(app)/(tabs)/invoices.tsx` for the audited inline arrow functions.
- [ ] Memoize `renderItem` with `useCallback`.
- [ ] Move inline style objects into `StyleSheet.create` or memoized values.
- [ ] Memoize date-chip render callbacks.
- [ ] Memoize status-chip render callbacks.
- [ ] Keep key extractors stable.
- [ ] Add `getItemLayout` if invoice rows have a fixed or predictable height.
- [ ] Add `removeClippedSubviews` if safe for the target platforms.
- [ ] Split expensive row UI into memoized row components.
- [ ] Add profiling before/after data for a list with at least 50 invoices.
- [ ] Add a regression test or profiler note documenting expected render behavior.
- [ ] Mark done only when list updates do not recreate unnecessary functions/styles per row.

### PERF-002 Memoize Dashboard Allocations

- [ ] Wrap `quickActions` in `useMemo`.
- [ ] Wrap `dashboardStats` in `useMemo`.
- [ ] Wrap `recentInvoices = invoices.slice(0, 5)` in `useMemo`.
- [ ] Stabilize dashboard action handlers with `useCallback` where they are passed to children.
- [ ] Review store subscriptions and use shallow selectors where appropriate.
- [ ] Add a render-count check or profiling note for dashboard updates.
- [ ] Mark done only when background store refreshes do not recreate all dashboard arrays unnecessarily.

### PERF-003 Optimize Line Item Totals

- [x] Wrap subtotal/GST/grand-total calculation in `useMemo`.
- [x] Compute line subtotal once per line item.
- [x] Compute subtotal and GST in a single pass.
- [x] Preserve exact 2-decimal financial rounding rules.
- [x] Add tests for 10-line and 50-line invoices if the calculation helper is extracted.
- [x] Verify calculations update correctly after quantity changes.
- [x] Verify calculations update correctly after rate changes.
- [x] Verify calculations update correctly after discount changes.
- [x] Verify calculations update correctly after GST-rate changes.
- [x] Mark done only when every keystroke does no duplicate reduction work.

### PERF-004 Add React.memo To High-Value Molecules

- [ ] Confirm the current count of molecule components using `forwardRef`.
- [ ] Confirm which `forwardRef` components already use `React.memo`.
- [ ] Prioritize `ListItem`.
- [ ] Prioritize `FormField`.
- [ ] Prioritize `SearchBar`.
- [ ] Prioritize `PaginatedList`.
- [ ] Prioritize `VirtualizedList`.
- [ ] Prioritize `StatCard`.
- [ ] Prioritize `TableRow`.
- [ ] Prioritize `SwipeableRow`.
- [ ] Prioritize `SegmentedControl`.
- [ ] Prioritize `SettingsCard`.
- [ ] Add display names after memo-wrapping.
- [ ] Ensure refs still forward correctly after memo-wrapping.
- [ ] Add tests for ref behavior where components expose refs.
- [ ] Measure render reduction in invoice list and dashboard after top components are memoized.
- [ ] Mark done only when high-traffic molecule children bail out on stable props.

### PERF-005 Rework Startup Prefetch Ownership

- [ ] Map all startup calls in `app/_layout.tsx`.
- [ ] Map all startup calls in `app/(app)/_layout.tsx`.
- [ ] Confirm the audited startup budget of 1 auth call, 2 critical calls, and 6 deferred calls.
- [ ] Decide which calls are required for first meaningful paint.
- [ ] Move tab-specific data loading to tab ownership where possible.
- [ ] Remove eager load for hidden `customers` tab if the tab remains hidden.
- [ ] Define a cache warmup policy with owner, trigger, and stop conditions.
- [ ] Ensure foreground resume does not repeat global work without cache policy.
- [ ] Add telemetry for startup call count and duration.
- [ ] Add a startup performance test or manual profile note.
- [ ] Mark done only when startup work is intentional rather than global by default.

### PERF-006 Add Lazy Loading Where It Matters

- [ ] Inventory report screens that are rarely used.
- [ ] Inventory settings screens that are rarely used.
- [ ] Inventory utility screens that are rarely used.
- [ ] Check whether Expo Router already performs route-level splitting for the current app target.
- [ ] Where supported, lazy-load rarely used flows.
- [ ] Avoid loading the design-system workbench in normal app startup paths.
- [ ] Ensure lazy-loaded screens have loading and error states.
- [ ] Measure bundle/startup impact after changes.
- [ ] Mark done only when rarely used surfaces are not part of unnecessary startup cost.

### PERF-007 Add Missing Database Indexes

- [ ] Profile Supabase dashboard for top screen-load queries.
- [ ] Add or verify index for `orders.supplier_id`.
- [ ] Add or verify index for `payments.purchase_id`.
- [ ] Add or verify index for `stock_operations.reference_id`.
- [ ] Add composite index for `invoices(customer_id, payment_status, created_at)` if query patterns confirm.
- [ ] Add composite index for `customers(name, type)` if query patterns confirm.
- [ ] Add composite index for `inventory_items(category_id, box_count)` if query patterns confirm.
- [ ] Add migration comments explaining each index.
- [ ] Add `EXPLAIN` evidence or Supabase dashboard evidence to the PR.
- [ ] Verify write overhead is acceptable.
- [ ] Mark done only when the top 5 screen-load query patterns have supporting indexes.

### PERF-008 Aggregate Query Timing

- [ ] Keep existing query timing instrumentation in `baseRepository.ts`.
- [ ] Route query timing metrics to the production telemetry sink once it exists.
- [ ] Tag query metrics by table.
- [ ] Tag query metrics by operation.
- [ ] Tag query metrics by screen/load context where possible.
- [ ] Track p50 query duration.
- [ ] Track p95 query duration.
- [ ] Add slow-query alert threshold, initially p95 greater than 500ms.
- [ ] Connect slow query events to release tags.
- [ ] Mark done only when query timings are actionable outside local console output.

## Phase 4: Security, Threat Model, And Data Protection

Audit refs: Part IV sections 17 through 20, Part XV sections 60 through 62, Recommended Direction 14,
18, 22.

### SEC-001 Preserve Existing Security Strengths

- [ ] Preserve env-based Supabase anon key loading.
- [ ] Preserve no-hardcoded-secret convention in client code.
- [ ] Preserve Zod validation at critical service entry points.
- [ ] Preserve structured logging conventions that avoid casual `console.log`.
- [ ] Preserve token refresh retry limits and backoff.
- [ ] Preserve auth event handling for `TOKEN_REFRESHED`, `SIGNED_IN`, `INITIAL_SESSION`, and
      `SIGNED_OUT`.
- [ ] Preserve storage bucket user scoping while fixing business-table RLS.
- [ ] Add regression checks so security improvements do not remove existing fundamentals.

### SEC-002 Move Auth Tokens Out Of AsyncStorage

- [ ] Confirm Supabase auth currently uses AsyncStorage.
- [ ] Select `expo-secure-store`, `react-native-keychain`, or another approved secure storage layer.
- [ ] Build a Supabase-compatible secure storage adapter.
- [ ] Migrate existing sessions safely where possible.
- [ ] Define forced re-login behavior if migration is not safe.
- [ ] Store refresh tokens in secure storage.
- [ ] Store access/session tokens in secure storage.
- [ ] Add tests for read/write/remove behavior in the storage adapter.
- [ ] Add logout tests proving tokens are removed.
- [ ] Add release notes for session migration behavior.
- [ ] Mark done only when JWT and refresh tokens are no longer persisted in plaintext AsyncStorage.

### SEC-003 Encrypt Or Minimize Local Business Data

- [ ] Inventory every Zustand persisted store.
- [ ] Inventory invoice data persisted to AsyncStorage.
- [ ] Inventory customer data persisted to AsyncStorage.
- [ ] Inventory inventory data persisted to AsyncStorage.
- [ ] Inventory finance metrics persisted to AsyncStorage.
- [ ] Inventory offline mutation payloads persisted to AsyncStorage.
- [ ] Decide which business data must persist offline.
- [ ] Remove persistence for data that does not need offline survival.
- [ ] Encrypt business data that must persist.
- [ ] Store encryption keys in Keychain/SecureStore.
- [ ] Add cache TTLs for persisted business data.
- [ ] Clear all persisted business data on logout.
- [ ] Add tests proving logout clears business caches.
- [ ] Add tests proving encrypted data is not plain JSON in storage.
- [ ] Mark done only when device theft or backup extraction no longer reveals full business records.

### SEC-004 Sign Offline Mutations

- [ ] Define payload canonicalization for offline mutations.
- [ ] Generate or retrieve a device key from secure storage.
- [ ] Add HMAC signing for queued mutation payloads.
- [ ] Verify HMAC before replay.
- [ ] Reject tampered queued mutations.
- [ ] Surface tamper rejection to telemetry.
- [ ] Decide whether to surface tamper rejection to the user.
- [ ] Rotate or recreate device keys safely on logout.
- [ ] Add tests proving modified amount fails verification.
- [ ] Add tests proving modified stock quantity fails verification.
- [ ] Add tests proving idempotency key alone is not treated as payload integrity.
- [ ] Mark done only when offline mutation tampering is detectable before sync.

### SEC-005 Add Certificate Pinning Or Document A Risk Exception

- [ ] Evaluate certificate pinning options compatible with Expo/React Native and Supabase.
- [ ] Decide whether pinning is feasible in the current build workflow.
- [ ] If feasible, pin Supabase API endpoints.
- [ ] Add a rotation plan for certificates.
- [ ] Add failure UX for pinning failures.
- [ ] Add tests or manual QA for successful API calls with pinning enabled.
- [ ] Add tests or manual QA for rejected MITM certificates where possible.
- [ ] If not feasible, document the accepted risk and compensating controls.
- [ ] Mark done only when the MITM risk is either reduced or explicitly owned.

### SEC-006 Add OTP Attempt Limiting

- [ ] Review `authService.verifyOtp()`.
- [ ] Add client-side attempt tracking for OTP verification.
- [ ] Set a maximum of 5 attempts per 15 minutes unless product/security chooses otherwise.
- [ ] Persist attempt state carefully without leaking sensitive data.
- [ ] Reset attempts after successful verification.
- [ ] Display translatable user feedback when rate limited.
- [ ] Confirm Supabase backend OTP rate limits are configured.
- [ ] Add tests for attempt counting.
- [ ] Add tests for cooldown expiry.
- [ ] Add telemetry for OTP rate-limit events.
- [ ] Mark done only when brute-force resistance is not entirely assumed from backend defaults.

### SEC-007 Add PII Redaction To Logger

- [ ] Define PII fields: phone, GSTIN, email, address, customer name, supplier name, invoice payloads,
      tokens, OTPs, and service-role keys.
- [ ] Add a redaction layer before logger metadata reaches any sink.
- [ ] Redact nested objects.
- [ ] Redact arrays of payloads.
- [ ] Redact known token formats.
- [ ] Add tests for phone redaction.
- [ ] Add tests for GSTIN redaction.
- [ ] Add tests for nested payload redaction.
- [ ] Add tests proving safe metadata remains useful.
- [ ] Require redaction before wiring Sentry, Datadog, or another sink.
- [ ] Mark done only when production telemetry cannot leak PII by default.

### SEC-008 Scope RLS Policies

- [ ] Add `business_id` or `user_id` ownership columns to all business tables.
- [ ] Backfill ownership columns safely.
- [ ] Add NOT NULL constraints only after backfill validation.
- [ ] Replace blanket `USING (true) WITH CHECK (true)` policies on business tables.
- [ ] Scope policies to `auth.uid()` or business membership.
- [ ] Remove unauthenticated public SELECT on master data tables unless explicitly public.
- [ ] Scope `item_categories`.
- [ ] Scope `item_units`.
- [ ] Scope `item_batches`.
- [ ] Scope `item_serials`.
- [ ] Scope `item_party_rates`.
- [ ] Add RLS tests for cross-user read denial.
- [ ] Add RLS tests for cross-user write denial.
- [ ] Add RLS tests for allowed owner access.
- [ ] Add migration rollback or emergency-disable plan.
- [ ] Mark done only when future multi-tenancy is not one column away from a breach.

### SEC-009 Expand Audit Logging

- [ ] Confirm audit triggers currently cover invoices.
- [ ] Confirm audit triggers currently cover payments.
- [ ] Confirm audit triggers currently cover inventory_items.
- [ ] Confirm audit triggers currently cover expenses.
- [ ] Add audit triggers for customers.
- [ ] Add audit triggers for suppliers.
- [ ] Add audit triggers for stock_operations.
- [ ] Add audit triggers for business_profile.
- [ ] Add audit triggers for purchases.
- [ ] Add audit triggers for purchase_line_items.
- [ ] Consider audit triggers for remaining tables up to all 19 tables.
- [ ] Restrict manual audit-log insertion by authenticated users.
- [ ] Add `SET search_path` to `SECURITY DEFINER` audit functions.
- [ ] Evaluate a tamper-evident hash chain for audit entries.
- [ ] Add tests proving key table changes write audit entries.
- [ ] Mark done only when important business changes cannot happen without an audit trail.

### SEC-010 Validate Deep Links And Query Parameters

- [ ] Inventory deep link schemes `easystock://` and `easydesign://`.
- [ ] Inventory routes that consume deep link parameters.
- [ ] Add Zod validation for route parameters that can arrive from deep links.
- [ ] Reject malformed UUIDs before they reach services.
- [ ] Reject unexpected enum values.
- [ ] Reject oversized string parameters.
- [ ] Add safe fallback navigation for invalid deep links.
- [ ] Add tests for crafted invalid URIs.
- [ ] Mark done only when deep links cannot inject unexpected route state.

### SEC-011 Validate API Query Limits And Sorts

- [ ] Add max page-size validation in inventory service queries.
- [ ] Add max page-size validation in invoice service queries.
- [ ] Add max page-size validation in customer service queries.
- [ ] Add max page-size validation anywhere a page-size argument crosses a service boundary.
- [ ] Whitelist allowed sort column names.
- [ ] Reject unrecognized sort columns.
- [ ] Add tests for `pageSize=10000`.
- [ ] Add tests for invalid sort fields.
- [ ] Mark done only when bypassing UI controls cannot create huge queries or unsafe sort behavior.

### SEC-012 Replace False Or Incomplete Security Features

- [ ] Wire or remove biometric authentication UI.
- [ ] Wire or remove auto-lock UI.
- [ ] Add secure-screen handling if sensitive data should be hidden in app switcher screenshots.
- [ ] Add root/jailbreak detection if the security owner accepts that control.
- [ ] If root/jailbreak detection is added, show a user warning rather than silently blocking unless
      product/security approves stronger behavior.
- [ ] Confirm `expo-dev-client` is not active in production builds unless intentionally allowed.
- [ ] Add a security-release checklist preventing UI-only security controls.
- [ ] Mark done only when visible security settings map to real enforcement.

### SEC-013 Replace Vulnerable XLSX Dependency

- [ ] Confirm all current uses of `xlsx`.
- [ ] Select a maintained replacement such as `exceljs` or another approved library.
- [ ] Port read workflows.
- [ ] Port export workflows.
- [ ] Add tests for existing spreadsheet import behavior.
- [ ] Add tests for existing spreadsheet export behavior.
- [ ] Remove `xlsx` from dependencies.
- [ ] Run `npm audit` to confirm the direct no-fix vulnerability is gone.
- [ ] Mark done only when SheetJS no-fix vulnerability is removed from the tree.

### SEC-014 Close STRIDE Threats

- [ ] Spoofing: remove JWT token storage from AsyncStorage.
- [ ] Spoofing: decide on certificate pinning.
- [ ] Spoofing: add OTP attempt limiting.
- [ ] Tampering: sign offline mutation queue payloads.
- [ ] Tampering: move trusted invoice totals and stock deductions server-side.
- [ ] Tampering: protect persisted data against local modification where feasible.
- [ ] Repudiation: extend audit triggers beyond 4 of 19 tables.
- [ ] Repudiation: restrict audit-log insert policy.
- [ ] Repudiation: evaluate tamper-evident audit chain.
- [ ] Information disclosure: encrypt or remove local plaintext business caches.
- [ ] Information disclosure: redact logger metadata.
- [ ] Information disclosure: stop leaking raw schema details through user-facing errors.
- [ ] Information disclosure: clear business data on logout.
- [ ] Denial of service: cap page sizes.
- [ ] Denial of service: review materialized-view refresh in hot RPC paths.
- [ ] Elevation of privilege: add RBAC or business membership model before multi-user support.
- [ ] Elevation of privilege: constrain `SECURITY DEFINER` functions with `SET search_path`.
- [ ] Elevation of privilege: protect service-role key access in seed scripts.
- [ ] Mark done only when every STRIDE row has an implemented fix or risk exception.

### SEC-015 Close OWASP Mobile Top 10 Findings

- [ ] M1: remove plaintext credential usage.
- [ ] M1: reduce offline mutation credential/payload risk.
- [ ] M2: add supply-chain scanning and dependency automation.
- [ ] M3: strengthen authentication and RLS authorization.
- [ ] M4: validate deep links, page sizes, sort columns, and service inputs.
- [ ] M5: decide certificate pinning and reduce schema leakage.
- [ ] M6: add privacy controls for local caches and logging.
- [ ] M7: review binary protections, dev-client usage, and root/jailbreak detection.
- [ ] M8: fix AsyncStorage token storage, audit-log policy, and `SECURITY DEFINER` search paths.
- [ ] M9: encrypt or remove sensitive local storage and clear on logout.
- [ ] M10: add HMAC for offline mutations and secure key storage.
- [ ] Mark done only when each OWASP category has a mapped closure issue.

## Phase 5: Operations, Observability, Backup, And Compatibility

Audit refs: Part V sections 21 through 22C, Recommended Direction 8A, 12, 12A, 21, Execution Plan.

### OPS-001 Add Barriers Around Destructive Automation

- [ ] Review `scripts/test-seed.shared.mjs` deletion scope.
- [ ] Review `scripts/test-seed-reset.mjs` service-role hydration behavior.
- [ ] Review fallback from service-role access to authenticated user path.
- [ ] Add explicit environment verification before seed reset runs.
- [ ] Add project-id allowlist for destructive test operations.
- [ ] Require confirmation for local destructive operations unless `CI=true` and test env is verified.
- [ ] Print target Supabase URL/project before destructive work.
- [ ] Block destructive scripts against production-like env names.
- [ ] Add dry-run support for seed reset.
- [ ] Add structured logs for destructive script execution.
- [ ] Review `scripts/check-design-system-visual-regression.mjs` baseline/diff directory clearing.
- [ ] Add dry-run and confirmation for visual baseline updates.
- [ ] Add path guards so visual scripts cannot clear arbitrary directories.
- [ ] Mark done only when destructive automation has explicit environment barriers.

### OPS-002 Productionize Logger And Telemetry

- [ ] Select a crash/error sink.
- [ ] Wire `logger.error` to the sink.
- [ ] Wire warning/error-level events with release tags.
- [ ] Keep dev console behavior where useful.
- [ ] Add PII redaction before external sink activation.
- [ ] Add auth failure telemetry.
- [ ] Add token refresh failure telemetry.
- [ ] Add sync failure telemetry.
- [ ] Add offline queue backlog telemetry.
- [ ] Add dead-letter queue telemetry.
- [ ] Add invoice-create success/failure funnel telemetry.
- [ ] Add payment-record success/failure funnel telemetry.
- [ ] Add stock-mutation success/failure telemetry.
- [ ] Add destructive script misuse telemetry where possible.
- [ ] Add dashboards for release health.
- [ ] Add alerts for critical runtime regressions.
- [ ] Assign telemetry hygiene ownership.
- [ ] Mark done only when production failures are visible before users report them manually.

### OPS-003 Make Offline Queue Failures Operationally Visible

- [ ] Surface queue-full errors to users consistently.
- [ ] Surface queue-full events to telemetry.
- [ ] Surface dead-letter entries to users or support tools.
- [ ] Surface dead-letter events to telemetry.
- [ ] Persist sync diagnostics for replay attempts.
- [ ] Persist last replay error safely.
- [ ] Add TTL cleanup for dead-letter queue items, initially 7 days unless product chooses otherwise.
- [ ] Catch AsyncStorage quota errors during queue writes.
- [ ] Add recovery UX for storage overflow.
- [ ] Document the current single-threaded assumption behind non-atomic AsyncStorage queue operations.
- [ ] Evaluate a transactional storage option for queue operations.
- [ ] Add tests for interruption between status update and full queue write-back if feasible.
- [ ] Mark done only when sync failures are diagnosable and user-visible where appropriate.

### OPS-004 Add Mobile Release Compatibility Contract

- [ ] Define the supported mobile-client window.
- [ ] Require backend schema changes to be additive across the supported window.
- [ ] Require RPC changes to preserve the current release and one rollback release.
- [ ] Add owners for every deprecated RPC.
- [ ] Add deprecation dates for every deprecated RPC.
- [ ] Add migration notes for every deprecated RPC.
- [ ] Add retirement approval requirements.
- [ ] Add a compatibility checklist to backend migration PRs.
- [ ] Add previous-supported-client smoke tests against latest backend.
- [ ] Include invoice creation in the compatibility suite.
- [ ] Include payment recording in the compatibility suite.
- [ ] Include stock mutation in the compatibility suite.
- [ ] Include auth/session startup in the compatibility suite.
- [ ] Include persisted-store hydration in the compatibility suite.
- [ ] Mark done only when backend deploys cannot silently strand older installed clients.

### OPS-005 Add Persisted Store Migrations

- [ ] Inventory every `zustand/persist` store.
- [ ] Add `version` to invoice store persistence.
- [ ] Add `migrate` to invoice store persistence.
- [ ] Add `version` to customer store persistence.
- [ ] Add `migrate` to customer store persistence.
- [ ] Add `version` to inventory store persistence.
- [ ] Add `migrate` to inventory store persistence.
- [ ] Add `version` to finance store persistence.
- [ ] Add `migrate` to finance store persistence.
- [ ] Add `version` to dashboard store persistence if persisted.
- [ ] Add `migrate` to dashboard store persistence if persisted.
- [ ] Add tests for old persisted snapshots.
- [ ] Add tests for unknown future versions.
- [ ] Document persisted-store migration policy for app releases.
- [ ] Mark done only when app upgrades cannot strand users on incompatible cached state.

### OPS-006 Backup, Restore, And Incident Response

- [ ] Define RPO for business data.
- [ ] Define RTO for business data.
- [ ] Define RPO/RTO for auth/session recovery if applicable.
- [ ] Define RPO/RTO for derived views and summaries.
- [ ] Create a backup runbook in `docs/`.
- [ ] Create a restore runbook in `docs/`.
- [ ] Create a bad migration rollback runbook.
- [ ] Create a bad mobile build response runbook.
- [ ] Create a corrupted derived-data refresh runbook.
- [ ] Create a financial reconciliation runbook for stock and invoice drift.
- [ ] Create an incident severity model.
- [ ] Define incident owner and escalation path.
- [ ] Run the first restore drill.
- [ ] Record restore drill date, environment, steps, and result.
- [ ] Schedule quarterly restore drills.
- [ ] Add support-safe procedures for correcting customer data.
- [ ] Mark done only when recovery is practiced, not merely described.

### OPS-007 Release And Regression Ownership

- [ ] Define the top 10 business-critical navigation and mutation paths.
- [ ] Include login/session startup.
- [ ] Include dashboard load.
- [ ] Include inventory search/filter.
- [ ] Include invoice creation.
- [ ] Include invoice detail.
- [ ] Include customer creation.
- [ ] Include payment receive.
- [ ] Include payment make.
- [ ] Include purchase drill-down from reports.
- [ ] Include logout/data cleanup.
- [ ] Add telemetry to each path.
- [ ] Add automated tests to each path where feasible.
- [ ] Add manual release checklist steps for paths not automated.
- [ ] Mark done only when correctness fixes and architecture work improve user-visible workflows every sprint.

## Phase 6: Database Schema And Data Layer Integrity

Audit refs: Part X sections 34 through 40, Immediate Release-Blocking Defects, Recommended Direction
17 and 22.

### DB-001 Preserve Existing Database Strengths

- [ ] Preserve UUID primary keys.
- [ ] Preserve TIMESTAMPTZ timestamp usage.
- [ ] Preserve NUMERIC monetary fields.
- [ ] Preserve enum definitions where they clarify domain behavior.
- [ ] Preserve `moddatetime` triggers.
- [ ] Preserve atomic RPC structure for critical operations while fixing authority gaps.
- [ ] Preserve materialized views where they are justified by query performance.
- [ ] Preserve idempotency keys.
- [ ] Preserve API version aliases while adding stronger compatibility policy.
- [ ] Preserve audit trail triggers while expanding coverage.
- [ ] Add database regression tests so refactors do not remove these strengths.

### DB-002 Fix Numeric Quantity Types End To End

- [ ] Complete P0-001 database type migration.
- [ ] Update generated Supabase types.
- [ ] Update repository models that still type quantities as integers.
- [ ] Update service schemas that still type quantities as integers.
- [ ] Update UI validation that rejects fractional stock where fractional stock is valid.
- [ ] Update inventory display formatting for fractional quantities.
- [ ] Update stock operation history formatting for fractional quantities.
- [ ] Update import/export code that assumes integer quantities.
- [ ] Add database tests for fractional purchase quantities.
- [ ] Add database tests for fractional stock operations.
- [ ] Add end-to-end invoice test with fractional quantity and exact stock deduction.
- [ ] Mark done only when fractional quantities work from UI through database and reports.

### DB-003 Resolve Migration Numbering Conflict

- [ ] Confirm both `015_fix_audit_log_rls.sql` and `015_low_stock_notification.sql` still exist.
- [ ] Confirm Supabase migration history in deployed environments.
- [ ] Decide whether to rename one migration or add an explanatory process note.
- [ ] If renaming, ensure already-applied environments are not broken.
- [ ] Add migration naming policy.
- [ ] Add CI check for duplicate migration prefixes.
- [ ] Mark done only when future duplicate migration numbers fail before merge.

### DB-004 Add Generated Database Types To CI

- [ ] Add `supabase gen types typescript` or equivalent to the developer workflow.
- [ ] Commit generated types in a stable location if that is the chosen policy.
- [ ] Add CI check that generated types are up to date.
- [ ] Wire repository table names and row types to generated types.
- [ ] Add docs for regenerating types after migrations.
- [ ] Mark done only when schema/type drift is caught before runtime.

### DB-005 Add Rollback And Data-Impact Discipline

- [ ] Inventory all 24 existing forward migrations.
- [ ] Mark migrations with destructive or irreversible data impact.
- [ ] Document rollback procedure for migration 020 phone backfill.
- [ ] Document rollback/recovery procedure for migration 024 duplicate-phone overwrite.
- [ ] Add a template for future migration comments describing data impact.
- [ ] Require every destructive migration PR to include rollback or recovery steps.
- [ ] Require every destructive migration PR to include a backup checkpoint.
- [ ] Add database migration review owner to CODEOWNERS.
- [ ] Mark done only when destructive database changes have an operational recovery story.

### DB-006 Document Denormalization Intent

- [ ] Preserve invoice customer snapshot fields as legal/audit snapshots.
- [ ] Document why `invoices.customer_name` is denormalized.
- [ ] Document why `invoices.customer_gstin` is denormalized.
- [ ] Document why `invoices.customer_phone` is denormalized.
- [ ] Document why `invoices.customer_address` is denormalized.
- [ ] Decide whether `orders.party_name` is an immutable snapshot or should track current party state.
- [ ] If snapshot, document snapshot semantics for `orders.party_name`.
- [ ] If current state, replace or supplement with a foreign key.
- [ ] Decide whether `inventory_items.party_name` is an immutable snapshot or should track current party
      state.
- [ ] If snapshot, document snapshot semantics for `inventory_items.party_name`.
- [ ] If current state, replace or supplement with a foreign key.
- [ ] Add tests or data-contract checks for chosen semantics.
- [ ] Mark done only when denormalization is intentional and documented.

### DB-007 Review Materialized View Refresh In Hot Paths

- [ ] Inspect `refresh_ledger_summaries()` calls inside invoice RPCs.
- [ ] Inspect `refresh_ledger_summaries()` calls inside payment RPCs.
- [ ] Measure lock contention under concurrent invoice creation.
- [ ] Measure lock contention under concurrent payment recording.
- [ ] Decide whether refresh should be synchronous, deferred, or incremental.
- [ ] Add telemetry for refresh duration if kept synchronous.
- [ ] Add rollback plan for changing refresh semantics.
- [ ] Mark done only when hot-path summary refresh does not create hidden DoS risk.

## Phase 7: Accessibility And Screen Reader Remediation

Audit refs: Part VII sections 24 and 25, Part XIV sections 55 through 59.

### A11Y-001 Preserve Design-System Accessibility Strengths

- [ ] Preserve atom-level `accessibilityRole` coverage.
- [ ] Preserve state announcements via `announceForScreenReader()`.
- [ ] Preserve 48px touch target enforcement.
- [ ] Preserve focus ring utilities.
- [ ] Preserve decorative-content hiding.
- [ ] Preserve Toast live-region behavior.
- [ ] Preserve accessibility actions for gesture-heavy components.
- [ ] Preserve FormField error alert behavior.
- [ ] Preserve contrast validation across theme presets.
- [ ] Preserve color-blindness distinguishability tests.
- [ ] Preserve role/label-based tests.
- [ ] Add regression tests when refactoring design-system components.

### A11Y-002 Fix App-Level List Semantics

- [ ] Add `accessibilityLabel` to `PaginatedList` FlatList containers.
- [ ] Add appropriate list or region role where React Native supports it.
- [ ] Add list context labels on invoice lists.
- [ ] Add list context labels on customer lists.
- [ ] Add list context labels on inventory lists.
- [ ] Add list context labels on reports lists.
- [ ] Add tests for list labels with screen-reader queries where possible.
- [ ] Mark done only when screen reader users know which list they are in.

### A11Y-003 Add Heading And Group Semantics

- [ ] Define heading hierarchy rules for app screens.
- [ ] Ensure screen titles use header semantics.
- [ ] Add `accessibilityRole="group"` to `FormSection`.
- [ ] Give `FormSection` an accessible label from the section title.
- [ ] Add group context to dashboard stats grid.
- [ ] Add group context to settings sections.
- [ ] Add group context to recent activity list.
- [ ] Add tests for grouped form sections.
- [ ] Add tests for settings section context if feasible.
- [ ] Mark done only when visual grouping has semantic grouping.

### A11Y-004 Fix Focus Management

- [ ] Add initial focus to `ActionMenuSheet` on open.
- [ ] Compare behavior with `ConfirmationModal`.
- [ ] Compare behavior with `BottomSheetPicker`.
- [ ] Restore focus after deleting a category in `settings/item-categories.tsx`.
- [ ] Announce invoice creation success before navigation or on destination screen.
- [ ] Add focus tests where supported by the test environment.
- [ ] Add manual VoiceOver verification for ActionMenuSheet.
- [ ] Add manual TalkBack verification for ActionMenuSheet.
- [ ] Mark done only when modal/sheet and post-delete flows do not leave focus undefined.

### A11Y-005 Label Icon-Only And Destructive Controls

- [ ] Add `accessibilityRole="button"` to delete icon pressables in item categories.
- [ ] Add destructive `accessibilityLabel` to delete icon pressables.
- [ ] Add `accessibilityHint` to destructive delete actions where useful.
- [ ] Add labels to edit icon pressables in item categories.
- [ ] Replace `more-options` label in invoice detail with human text such as `More actions`.
- [ ] Add labels to dashboard transaction icons or hide decorative icons from the a11y tree.
- [ ] Audit every icon-only `Pressable`.
- [ ] Audit every icon-only `TouchableOpacity`.
- [ ] Add tests preventing unlabeled icon-only interactive controls.
- [ ] Mark done only when VoiceOver never announces an actionable control as only `Button`.

### A11Y-006 Add Accessible Chip Selection Semantics

- [ ] Add role to inventory add category chips.
- [ ] Add role to inventory add unit chips.
- [ ] Add `accessibilityState={{ selected: ... }}` to selectable chips.
- [ ] Add accessible labels that include the option and group context.
- [ ] Ensure selected/unselected state is announced.
- [ ] Add tests for selected chip state.
- [ ] Mark done only when chip groups communicate option role and selected state.

### A11Y-007 Make Helper Text Accessible

- [ ] Review `FormField` helper text accessibility behavior.
- [ ] Stop hiding non-error helper text when it provides input guidance.
- [ ] Include helper text in the input hint where appropriate.
- [ ] Keep visual-only helper text hidden only when it is truly redundant.
- [ ] Add tests proving GSTIN format helper text is available to screen readers.
- [ ] Ensure error text remains an alert.
- [ ] Mark done only when input guidance is not invisible to screen-reader users.

### A11Y-008 Validate Disabled Button Contrast

- [ ] Add contrast tests for disabled button `surfaceVariant` background and `placeholder` text.
- [ ] Validate disabled contrast in every theme preset.
- [ ] Validate disabled contrast in light mode.
- [ ] Validate disabled contrast in dark mode.
- [ ] Adjust disabled tokens if contrast fails.
- [ ] Add visual regression coverage for disabled buttons.
- [ ] Mark done only when disabled controls meet the required contrast policy.

### A11Y-009 Announce Dynamic Content Changes

- [ ] Announce pull-to-refresh completion on invoice lists.
- [ ] Announce load-more completion on invoice lists.
- [ ] Add a reusable announcement helper for list refresh/load-more events.
- [ ] Announce network offline transitions.
- [ ] Announce network online transitions.
- [ ] Announce sync queue status changes where user-visible.
- [ ] Announce dead-letter or sync-failure states where user-visible.
- [ ] Add tests or manual QA steps for dynamic announcements.
- [ ] Mark done only when visual status changes have screen-reader feedback.

### A11Y-010 Add Platform Accessibility Declarations And Device Walkthroughs

- [ ] Review `app.json` for iOS accessibility declarations.
- [ ] Add `UIAccessibilityReduceTransparency` support if applicable.
- [ ] Review Android accessibility service declarations if applicable.
- [ ] Add launch-time accessibility detection only if it drives behavior.
- [ ] Define top 5 VoiceOver walkthrough journeys.
- [ ] Define top 5 TalkBack walkthrough journeys.
- [ ] Run quarterly VoiceOver audits.
- [ ] Run quarterly TalkBack audits.
- [ ] Store walkthrough evidence in the release/QE process.
- [ ] Mark done only when app-level accessibility is tested, not only component-level accessibility.

## Phase 8: Internationalization

Audit refs: Part VIII sections 26 through 29, Recommended Direction 19, Elite Exit Criteria.

### I18N-001 Preserve I18n Strengths

- [ ] Preserve i18next and react-i18next infrastructure.
- [ ] Preserve expo-localization device locale detection.
- [ ] Preserve fallback to English.
- [ ] Preserve runtime language switching.
- [ ] Preserve AsyncStorage language preference.
- [ ] Preserve Indian currency grouping in `formatINR()`.
- [ ] Preserve language-aware short INR suffixes.
- [ ] Preserve `numberToIndianWords()` in English and Hindi.
- [ ] Preserve locale-aware date formatting.
- [ ] Preserve RTL infrastructure even if current languages are LTR.
- [ ] Preserve existing translation test coverage.

### I18N-002 Remove Hardcoded Settings Strings

- [ ] Extract `app/(app)/settings/items.tsx` title strings.
- [ ] Extract `Item Settings`.
- [ ] Extract `General`.
- [ ] Extract `Pricing`.
- [ ] Extract `Display`.
- [ ] Extract `Tracking`.
- [ ] Extract `Items Module`.
- [ ] Extract `Master switch for all item features`.
- [ ] Extract `Barcode Scanning`.
- [ ] Extract `Track Stock by Default`.
- [ ] Extract `app/(app)/settings/reminders.tsx` title strings.
- [ ] Extract `Payment Reminders`.
- [ ] Extract `Auto Reminders`.
- [ ] Extract `Reminder Schedule`.
- [ ] Extract `First reminder after`.
- [ ] Extract `Second reminder after`.
- [ ] Extract `Third reminder after`.
- [ ] Extract `Channel`.
- [ ] Extract `WhatsApp`.
- [ ] Extract `SMS`.
- [ ] Extract `Both`.
- [ ] Move hardcoded Hindi reminder default template into translation JSON.
- [ ] Extract `app/(app)/settings/firms.tsx` strings.
- [ ] Extract `Add Business`.
- [ ] Extract `Manage Businesses`.
- [ ] Extract `My Business`.
- [ ] Extract `app/(app)/settings/business-profile.tsx` strings.
- [ ] Extract `Business Profile`.
- [ ] Extract `Business Description (max 200 chars)`.
- [ ] Extract `Business Logo`.
- [ ] Add English and Hindi keys for each extracted string.
- [ ] Mark done only when settings screens have no unapproved hardcoded user-facing strings.

### I18N-003 Remove Hardcoded Form Strings

- [ ] Extract `app/(app)/suppliers/add.tsx` strings.
- [ ] Extract `Add Supplier`.
- [ ] Extract `Supplier Name`.
- [ ] Extract `Contact Person`.
- [ ] Extract `Phone`.
- [ ] Extract `Email`.
- [ ] Extract `GST Type`.
- [ ] Extract `GST Details`.
- [ ] Extract `Address`.
- [ ] Extract `Terms & Notes`.
- [ ] Extract `Save Supplier`.
- [ ] Extract dropdown labels `Regular`, `Composition`, and `Unregistered`.
- [ ] Extract `app/(app)/inventory/add.tsx` section strings.
- [ ] Extract `Basic Info`.
- [ ] Extract `Pricing`.
- [ ] Extract `Track Stock`.
- [ ] Extract unit labels `Pcs`, `Box`, `Kg`, `Meter`, `Sq.ft`, `Sq.meter`, and `Set`.
- [ ] Extract `app/(app)/customers/add.tsx` strings.
- [ ] Extract `Customer Type`.
- [ ] Extract `Individual`.
- [ ] Extract `Business`.
- [ ] Replace `t('customer.gstin') + ' ' + t('order.detailsMissing')` with interpolation.
- [ ] Add English and Hindi translations.
- [ ] Mark done only when form screens do not bypass i18n.

### I18N-004 Make App Errors Translatable

- [ ] Replace hardcoded `ValidationError` message with translation key.
- [ ] Replace hardcoded `NetworkError` message with translation key.
- [ ] Replace hardcoded `InsufficientStockError` message with translation key plus interpolation.
- [ ] Replace hardcoded `NotFoundError` message with translation key plus interpolation.
- [ ] Replace hardcoded `FK_VIOLATION` message with translation key.
- [ ] Replace inline Hindi `RLS_VIOLATION` source string with translation keys.
- [ ] Ensure AppError can carry `translationKey` and interpolation values.
- [ ] Ensure UI renders translated AppError messages using current locale.
- [ ] Add tests for English AppError output.
- [ ] Add tests for Hindi AppError output.
- [ ] Add tests for interpolation values.
- [ ] Mark done only when error source code does not hardcode language-specific user messages.

### I18N-005 Make Zod Validation Translatable

- [ ] Convert schema creation to factory pattern where messages need translation.
- [ ] Add `getInventorySchema(t)`.
- [ ] Add `getInvoiceSchema(t)`.
- [ ] Add `getPaymentSchema(t)`.
- [ ] Update supplier inline schema in `app/(app)/suppliers/add.tsx`.
- [ ] Extract `Design name is required`.
- [ ] Extract `Stock cannot be negative`.
- [ ] Extract `Low stock threshold cannot be negative`.
- [ ] Extract `Date must be in YYYY-MM-DD format`.
- [ ] Extract `Customer name is required`.
- [ ] Extract `Name is required`.
- [ ] Audit all schemas for the remaining 30+ hardcoded messages.
- [ ] Add tests for schema messages in English.
- [ ] Add tests for schema messages in Hindi.
- [ ] Mark done only when validation errors use current locale.

### I18N-006 Implement Pluralization

- [ ] Add i18next plural forms for English.
- [ ] Add i18next plural forms for Hindi.
- [ ] Replace manual `itemSingular` / `itemPlural` workarounds.
- [ ] Search translation JSON for singular/plural manual pairs.
- [ ] Update UI to call `t(key, { count })`.
- [ ] Add tests for count 0.
- [ ] Add tests for count 1.
- [ ] Add tests for count 2.
- [ ] Add tests for Hindi plural behavior.
- [ ] Mark done only when pluralization is handled by i18next rules.

### I18N-007 Close Translation Coverage Gaps

- [ ] Add missing Hindi translation for `customer.invalidPhone`.
- [ ] Add missing Hindi translation for `invoice.add`.
- [ ] Add missing Hindi translation for `invoice.errors.noSellingPrice`.
- [ ] Add missing Hindi translation for `invoice.noResults`.
- [ ] Add CI check that English and Hindi key sets stay aligned.
- [ ] Add hardcoded-string detection for live app screens.
- [ ] Maintain an allowlist for true constants, units, brand names, and technical codes.
- [ ] Mark done only when live-screen hardcoded user-facing strings trend to zero.

## Phase 9: CI/CD, Team Process, And Dependency Supply Chain

Audit refs: Part IX sections 30 through 33, Part XII sections 46 through 48, Recommended Direction 18
and 20.

### CI-001 Preserve Existing CI Strengths

- [ ] Preserve typecheck in CI.
- [ ] Preserve lint in CI.
- [ ] Preserve test coverage in CI.
- [ ] Preserve integration tests with Supabase test env.
- [ ] Preserve iOS e2e critical path.
- [ ] Preserve Android e2e critical path.
- [ ] Preserve design-system visual regression.
- [ ] Preserve nightly full suite.
- [ ] Preserve pre-commit UI token checks.
- [ ] Preserve pre-push validation.
- [ ] Preserve `npm run test:pr` or its successor.
- [ ] Preserve `npm run validate` or its successor while reducing unnecessary coupling.

### CI-002 Add Security Automation

- [ ] Add `npm audit --audit-level=high` to PR CI.
- [ ] Add Dependabot or Renovate.
- [ ] Configure weekly security update schedule.
- [ ] Add CodeQL, Snyk, SonarQube, or another SAST tool.
- [ ] Add GitHub secret scanning or equivalent.
- [ ] Add Gitleaks or `detect-secrets` if GitHub Advanced Security is unavailable.
- [ ] Add lockfile integrity verification.
- [ ] Decide whether DAST is relevant for the current architecture.
- [ ] Add security scan status to PR template.
- [ ] Mark done only when security automation is a required release signal.

### CI-003 Add Team Process Infrastructure

- [ ] Add `CODEOWNERS`.
- [ ] Map `app/` to App Architecture owner.
- [ ] Map `src/stores/` to App Architecture owner.
- [ ] Map `src/services/` to App Architecture owner and Data owner where appropriate.
- [ ] Map `src/repositories/` to Data owner.
- [ ] Map `supabase/` to Data owner.
- [ ] Map `scripts/` to Platform owner.
- [ ] Map `.github/` to Platform and Release/QE owners.
- [ ] Map security-sensitive files to Security owner.
- [ ] Add `.github/PULL_REQUEST_TEMPLATE.md`.
- [ ] Include tests-passing checkbox in PR template.
- [ ] Include accessibility checkbox in PR template.
- [ ] Include i18n-keys checkbox in PR template.
- [ ] Include no-hardcoded-strings checkbox in PR template.
- [ ] Include security-impact checkbox in PR template.
- [ ] Add issue templates.
- [ ] Add commitlint.
- [ ] Add conventional commits policy.
- [ ] Add automated changelog or release notes generation.
- [ ] Add `CHANGELOG.md` if release notes are repo-owned.
- [ ] Add branch protection documentation if settings cannot be codified.
- [ ] Mark done only when ownership and PR quality are not dependent on memory.

### CI-004 Add EAS Build Profiles

- [ ] Create `eas.json`.
- [ ] Add development build profile.
- [ ] Add preview build profile.
- [ ] Add production build profile.
- [ ] Ensure env variable requirements differ by profile.
- [ ] Ensure production profile does not include dev-client behavior unless intentional.
- [ ] Document release channel or update-channel strategy.
- [ ] Add build-profile validation to release checklist.
- [ ] Mark done only when staging/production build behavior is explicit.

### CI-005 Audit `--legacy-peer-deps`

- [ ] Count every `npm ci --legacy-peer-deps` usage in CI.
- [ ] Run `npm ci` without `--legacy-peer-deps` locally to capture actual conflicts.
- [ ] Document each peer dependency conflict.
- [ ] Determine whether each conflict is React Native ecosystem noise or a real compatibility issue.
- [ ] Pin or upgrade packages to remove conflicts where possible.
- [ ] Add comments in CI explaining any remaining `--legacy-peer-deps`.
- [ ] Create an expiry review date for every remaining exception.
- [ ] Mark done only when peer conflict suppression is documented and temporary.

### DEP-001 Close Known Vulnerabilities

- [ ] Run a fresh `npm audit`.
- [ ] Verify the audited count of 28 vulnerabilities or update the baseline.
- [ ] Fix lodash vulnerabilities where compatible.
- [ ] Fix forge vulnerabilities where compatible.
- [ ] Replace direct `xlsx` dependency.
- [ ] Investigate Handlebars transitive chain.
- [ ] Remove or update the package bringing vulnerable Handlebars if possible.
- [ ] Investigate `xmldom` transitive chain.
- [ ] Remove or update the package bringing vulnerable `xmldom` if possible.
- [ ] Track no-fix vulnerabilities with risk owner and mitigation.
- [ ] Define SLA for high vulnerabilities.
- [ ] Define SLA for critical vulnerabilities.
- [ ] Mark done only when high/critical vulnerabilities have no silent pass path.

### DEP-002 Keep Dependencies Current Safely

- [ ] Preserve current direct dependency hygiene.
- [ ] Configure Dependabot/Renovate grouping for low-risk patch updates.
- [ ] Configure separate PRs for major React Native/Expo updates.
- [ ] Require CI green before dependency auto-merge.
- [ ] Add release notes review for native dependency changes.
- [ ] Add native dependency budget review for design-system additions.
- [ ] Mark done only when dependency health is automated without making upgrades reckless.

## Phase 10: Product Completeness And UX Truthfulness

Audit refs: Executive Summary, Immediate Release-Blocking Defects, Part II section 11B, Recommended
Direction 6 and 23, Bottom Line.

### PRODUCT-001 Inventory Completion State Of Live Screens

- [ ] Build a live navigation map.
- [ ] Mark every screen as real-data, mock-backed, placeholder, beta, or hidden.
- [ ] Mark every action as implemented, placeholder, disabled, beta, or hidden.
- [ ] Pay special attention to finance screens.
- [ ] Pay special attention to statutory reporting screens.
- [ ] Pay special attention to exports.
- [ ] Pay special attention to sharing.
- [ ] Pay special attention to save actions.
- [ ] Review product wording for any screen that appears complete but is not operational.
- [ ] Add product owner sign-off for every live incomplete surface.
- [ ] Mark done only when UI completeness matches operational completeness.

### PRODUCT-002 Remove Placeholder Operational Actions

- [ ] Search app code for TODOs in reports.
- [ ] Search app code for TODOs in finance.
- [ ] Remove placeholder export buttons unless export is implemented.
- [ ] Remove placeholder share buttons unless sharing is implemented.
- [ ] Remove placeholder save buttons unless save is implemented.
- [ ] Disable unavailable actions with accessible explanations where hiding is not appropriate.
- [ ] Ensure disabled explanations are translatable.
- [ ] Ensure unavailable actions emit no fake success toasts.
- [ ] Add tests for hidden/disabled behavior.
- [ ] Mark done only when users cannot mistake placeholders for working workflows.

### PRODUCT-003 Add Feature Flags For Incomplete Surfaces

- [ ] Add or choose a feature-flag mechanism.
- [ ] Flag beta finance surfaces.
- [ ] Flag beta statutory-reporting surfaces.
- [ ] Flag beta bank-account surfaces.
- [ ] Flag beta cash surfaces.
- [ ] Hide flagged surfaces from primary navigation by default.
- [ ] Add explicit beta labels if product chooses to expose them.
- [ ] Add tests proving disabled flags hide screens/actions.
- [ ] Mark done only when incomplete surfaces cannot accidentally ship as complete.

## Phase 11: Target-State Architecture Gates

Audit refs: Target-State Architecture, Hard Architectural Rules, What elite looks like in code,
Elite Enterprise Exit Criteria.

### TARGET-001 Enforce Hard Rules

- [ ] Rule 1: `app/` must not import raw Supabase clients.
- [ ] Rule 2: `app/` must not import repositories directly.
- [ ] Rule 3: live routes must not import `src/mocks`.
- [ ] Rule 4: only one module may own auth subscriptions.
- [ ] Rule 5: all service boundaries normalize to `AppError` or successor before crossing upward.
- [ ] Rule 6: event subscriptions must be lifecycle-owned and teardown-capable.
- [ ] Rule 7: environment resolution must be typed, fail-fast, and mode-explicit.
- [ ] Rule 8: docs describe architecture and do not enforce it through phrase checks unless no stronger
      control exists.
- [ ] Rule 9: financially significant writes must be server-authoritative and server-recomputed.
- [ ] Rule 10: backend contracts must remain compatible across the supported mobile release window.
- [ ] Rule 11: persisted stores must declare `version` and `migrate`.
- [ ] Rule 12: destructive or irreversible data operations must have a tested recovery path and runbook.
- [ ] Add a CI or review gate for every rule.
- [ ] Mark done only when violations are rare, obvious, and blocked.

### TARGET-002 Validate Layer Responsibilities

- [ ] Routes own navigation, composition, and screen-level presentation state only.
- [ ] Routes may depend on feature modules, design system, and presentation hooks.
- [ ] Routes must not depend on raw Supabase, repositories, env parsing, or `src/mocks`.
- [ ] Feature modules own workflow orchestration, form state, request shaping, and optimistic UI.
- [ ] Feature modules may depend on services, schemas, and stores as view/cache state.
- [ ] Feature modules must not depend on raw Supabase, global event wiring, or platform env reads.
- [ ] Services own business rules, transactions, and error normalization.
- [ ] Services may depend on repositories, schemas, and `toAppError`.
- [ ] Services must not depend on router, screen state, or direct UI concerns.
- [ ] Stores own cached server state, UI/session state, and derived selectors.
- [ ] Stores may depend on services or orchestrators.
- [ ] Stores must not depend on repositories, raw Supabase, or module-scope subscriptions.
- [ ] Repositories own persistence and query translation.
- [ ] Repositories may depend on typed Supabase client and generated DB types.
- [ ] Repositories must not depend on router, stores, or presentation logic.
- [ ] Platform owns config, auth/session, telemetry, queue, and feature flags.
- [ ] Platform must not depend on route-specific workflows.
- [ ] Mark done only when the dependency model is visible in code review and tooling.

### TARGET-003 Validate Elite Code Outcomes

- [ ] New routes are mostly composition and rendering.
- [ ] New business flows are added as feature modules with tests.
- [ ] Persistence refactors do not require editing screens.
- [ ] Missing env vars fail with one clear startup error.
- [ ] Mock-backed surfaces cannot ship as complete.
- [ ] Security/compliance UI cannot appear without enforcement.
- [ ] Invoice workflows are trusted because the server recomputes and validates them.
- [ ] Payment workflows are trusted because the server recomputes and validates them.
- [ ] Stock workflows are trusted because the server enforces invariants.
- [ ] Previous supported mobile builds work against today's backend.
- [ ] Restore drills recover business data inside declared targets.
- [ ] Mark done only when these statements are demonstrably true, not aspirational.

## Phase 12: Execution Model And Exit Criteria

Audit refs: Execution Plan And Ownership Model, Elite Enterprise Exit Criteria.

### EXIT-001 Phase 0 Exit Criteria

- [ ] Fractional stock bug fixed.
- [ ] Broken report purchase route fixed.
- [ ] Supabase config fails fast.
- [ ] False security toggles removed or implemented.
- [ ] `npm audit` added to CI.
- [ ] Secret scanning added to CI.
- [ ] No open P0 data-integrity bugs.
- [ ] CI fails on new high/critical vulnerabilities or accepted baseline violations.
- [ ] No fake security controls visible.

### EXIT-002 Phase 1 Exit Criteria

- [ ] Single runtime architecture adopted.
- [ ] Auth/session orchestrator exists.
- [ ] Store orchestration layer exists.
- [ ] First three fat routes extracted.
- [ ] Raw Supabase imports in `app/` equal zero.
- [ ] Direct repository imports in route files equal zero or have formal exceptions.
- [ ] Auth subscription ownership is singular.
- [ ] Auth teardown is tested.
- [ ] Critical writes no longer trust client-computed final values.

### EXIT-003 Phase 2 Exit Criteria

- [ ] Live screens importing `src/mocks` equal zero.
- [ ] Placeholder export/share/save actions are hidden, disabled, or implemented.
- [ ] Core funnels emit telemetry.
- [ ] `logger.error` has real sink.
- [ ] `jest.setup.ts` is below 300 LOC, then continues toward 200 LOC.
- [ ] Top 10 journeys have tests or explicit manual release checks.
- [ ] Hardcoded live-screen strings trend toward zero.
- [ ] Previous-supported-client smoke checks pass.

### EXIT-004 Phase 3 Exit Criteria

- [ ] Shared tooling core exists.
- [ ] Package-boundary decision is codified.
- [ ] Blanket RLS policies on business tables equal zero.
- [ ] Composite DB indexes support top query patterns.
- [ ] Rollback playbooks exist.
- [ ] Dependency automation is active.
- [ ] Backup/restore drills are evidenced.
- [ ] Persisted-store migrations exist.
- [ ] Deprecation policy is documented and enforced.

### EXIT-005 Enterprise Exit Criteria

- [ ] Runtime architecture: `app/` has zero raw Supabase imports and zero repository imports.
- [ ] Runtime architecture: all new screens follow the target dependency graph.
- [ ] Backend authority: all financially significant writes are server-authoritative.
- [ ] Backend authority: server recomputes totals and invariants.
- [ ] Backend authority: server owns audit-grade side effects.
- [ ] Product completeness: live navigation exposes zero mock-backed screens.
- [ ] Product completeness: live navigation exposes zero placeholder export/share/save actions.
- [ ] Correctness: no open P0 data-integrity defects.
- [ ] Correctness: stock movement supports fractional quantities end to end.
- [ ] Security: CI runs audit, SAST, and secret scanning.
- [ ] Security: no false-security UI.
- [ ] Security: no business table uses blanket `USING (true)` policies.
- [ ] Config/test hygiene: one typed config module exists.
- [ ] Config/test hygiene: unit tests do not load `.env.test`.
- [ ] Config/test hygiene: `jest.setup.ts` is minimal and layer-specific.
- [ ] Release compatibility: latest backend supports previous mobile release.
- [ ] Release compatibility: persisted stores have versioned migrations.
- [ ] Release compatibility: deprecations have enforced policy.
- [ ] Operability: `logger.error` is wired to a real sink.
- [ ] Operability: release dashboards exist for auth, sync, queue backlog, and critical funnels.
- [ ] Reliability: RPO/RTO are defined.
- [ ] Reliability: restore drills are evidenced.
- [ ] Reliability: rollback and reconciliation runbooks exist.
- [ ] Accessibility/i18n: live screens have zero unapproved hardcoded user-facing strings.
- [ ] Accessibility/i18n: app-level screen semantics are enforced.
- [ ] Platform tooling: shared tooling library exists.
- [ ] Platform tooling: script count is stable or shrinking.
- [ ] Platform tooling: docs are informative rather than phrase-policed.
- [ ] Dependency hygiene: Dependabot/Renovate is active.
- [ ] Dependency hygiene: high/critical vulnerability SLA exists.
- [ ] Dependency hygiene: `--legacy-peer-deps` exceptions are documented and temporary.

## Named Audit Artifact Traceability Index

Use this index only as a reviewer aid. The real work lives in the phase checklists above.

- [ ] Trace: `Release / QE owner` is covered by Ownership Tracks and OPS-007.
- [ ] Trace: `auth/session orchestrator` is covered by RUNTIME-011 and TARGET-001.
- [ ] Trace: `routes/screens -> feature modules/view models -> services/use cases -> repositories/read models -> typed backend interface` is covered by RUNTIME-001 and TARGET-002.
- [ ] Trace: `workspaces: ["src/design-system", "src/ui-shell", "examples/*"]` is covered by
      TOOL-008 and DEP-002.
- [ ] Trace: `import { ListItem } from '@/design-system/components/molecules/ListItem'` is covered by
      RUNTIME-012.
- [ ] Trace: `{ ListItem } from '@/design-system/components/molecules'` is covered by RUNTIME-012.
- [ ] Trace: `\` code-block escape artifacts in the audit are non-actionable and do not represent a
      remediation target.
- [ ] Trace: `.github/workflows/ci.yml` is covered by CI-001, CI-002, CI-005, and EXIT-005.
- [ ] Trace: `.github/ISSUE_TEMPLATE/` is covered by CI-003.
- [ ] Trace: `.github/PULL_REQUEST_TEMPLATE.md` is covered by CI-003.
- [ ] Trace: `.husky/pre-commit` is covered by CI-001.
- [ ] Trace: `.husky/pre-push` is covered by CI-001.
- [ ] Trace: `__tests__/` is covered by TOOL-004 and TOOL-005.
- [ ] Trace: `__tests__/integration/authFlow.test.ts` is covered by TOOL-005.
- [ ] Trace: `__tests__/scripts/*.test.ts` is covered by TOOL-005.
- [ ] Trace: `__tests__/visual/snapshots.test.tsx` is covered by TOOL-005.
- [ ] Trace: `__tests__/visual/setup/renderToSnapshot.tsx` is covered by TOOL-005.
- [ ] Trace: `accessibilityAuditContract.test.ts` is covered by A11Y-001.
- [ ] Trace: `app.json` is covered by A11Y-010 and SEC-012.
- [ ] Trace: `app/(app)/(tabs)/index.tsx` is covered by PERF-002, A11Y-003, A11Y-005, and
      OPS-007.
- [ ] Trace: `app/(app)/(tabs)/invoices.tsx` is covered by PERF-001 and A11Y-009.
- [ ] Trace: `app/(app)/_layout.tsx` is covered by PERF-005.
- [ ] Trace: `app/_layout.tsx` is covered by PERF-005.
- [ ] Trace: `app/(app)/customers/add.tsx` is covered by I18N-003.
- [ ] Trace: `app/(app)/finance/bank-accounts/index.tsx` is covered by RUNTIME-004 and
      PRODUCT-003.
- [ ] Trace: `app/(app)/finance/cash.tsx` is covered by RUNTIME-004 and PRODUCT-003.
- [ ] Trace: `app/(app)/finance/payments/make.tsx` is covered by RUNTIME-003.
- [ ] Trace: `app/(app)/finance/purchases/[id].tsx` is covered by RUNTIME-002 and OPS-007.
- [ ] Trace: `app/(app)/inventory/[id].tsx` is covered by RUNTIME-002.
- [ ] Trace: `app/(app)/inventory/add.tsx` is covered by RUNTIME-013, A11Y-006, and I18N-003.
- [ ] Trace: `app/(app)/invoices/[id].tsx` is covered by RUNTIME-013 and A11Y-005.
- [ ] Trace: `app/(app)/reports/all-parties.tsx` is covered by RUNTIME-003.
- [ ] Trace: `app/(app)/reports/all-transactions.tsx` is covered by P0-002.
- [ ] Trace: `app/(app)/reports/gstr1.tsx` is covered by RUNTIME-004 and PRODUCT-003.
- [ ] Trace: `app/(app)/reports/gstr3b.tsx` is covered by RUNTIME-004 and PRODUCT-003.
- [ ] Trace: `app/(app)/reports/party-statement.tsx` is covered by RUNTIME-004 and PRODUCT-003.
- [ ] Trace: `app/(app)/settings/business-profile.tsx` is covered by I18N-002.
- [ ] Trace: `app/(app)/settings/firms.tsx` is covered by I18N-002.
- [ ] Trace: `app/(app)/settings/index.tsx` is covered by A11Y-003.
- [ ] Trace: `app/(app)/settings/item-categories.tsx` is covered by A11Y-004 and A11Y-005.
- [ ] Trace: `app/(app)/settings/items.tsx` is covered by I18N-002.
- [ ] Trace: `app/(app)/settings/reminders.tsx` is covered by I18N-002.
- [ ] Trace: `app/(app)/settings/security.tsx` is covered by P0-003 and SEC-012.
- [ ] Trace: `app/(app)/suppliers/add.tsx` is covered by I18N-003 and I18N-005.
- [ ] Trace: `app/(app)/suppliers/index.tsx` is covered by RUNTIME-003.
- [ ] Trace: `app/(auth)/setup.tsx` is covered by RUNTIME-013.
- [ ] Trace: `contrastPolicy.test.ts` is covered by A11Y-001 and A11Y-008.
- [ ] Trace: `src/` production code scanning is covered by TOOL-006, RUNTIME-001, RUNTIME-007, and
      I18N-007.
- [ ] Trace: `src/config/supabase.ts` is covered by P0-004, TOOL-003, SEC-002, and SEC-005.
- [ ] Trace: `src/config/supabase.ts:5` is covered by SEC-001 and SEC-014.
- [ ] Trace: `src/config/supabase.ts:27` is covered by SEC-002.
- [ ] Trace: `src/design-system/` is covered by TOOL-006, TOOL-008, and A11Y-001.
- [ ] Trace: `src/design-system/__tests__/boundary.test.ts` is covered by TOOL-006.
- [ ] Trace: `src/design-system/__tests__/componentContract.test.ts` is covered by TOOL-006.
- [ ] Trace: `src/design-system/components/atoms/Button.tsx` is covered by A11Y-008.
- [ ] Trace: `src/design-system/components/molecules/ActionMenuSheet.tsx` is covered by A11Y-004.
- [ ] Trace: `src/design-system/components/molecules/FormField.tsx` is covered by PERF-004, A11Y-007,
      and RUNTIME-012.
- [ ] Trace: `src/design-system/components/molecules/FormSection.tsx` is covered by A11Y-003.
- [ ] Trace: `src/design-system/components/molecules/ListItem` import paths are covered by
      RUNTIME-012 and PERF-004.
- [ ] Trace: `src/design-system/components/molecules/PaginatedList.tsx` is covered by A11Y-002 and
      PERF-004.
- [ ] Trace: `src/design-system/components/molecules/VirtualizedList.tsx` is covered by PERF-004 and
      DB/PERF preservation tasks.
- [ ] Trace: `src/design-system/foundation/theme/layoutMetrics.ts` is covered by A11Y-001.
- [ ] Trace: `src/errors/AppError.ts` is covered by RUNTIME-005, RUNTIME-006, I18N-004, and SEC-007.
- [ ] Trace: `src/errors/AppError.ts:72-123` is covered by I18N-004 and SEC-014.
- [ ] Trace: `src/events/appEvents.ts:17-22` is covered by RUNTIME-009.
- [ ] Trace: `src/features/invoice-create/InvoiceCreateScreen.tsx` is covered by RUNTIME-013 and
      OPS-007.
- [ ] Trace: `src/features/invoice-create/LineItemsStep.tsx` is covered by PERF-003.
- [ ] Trace: `src/features/invoice-create/useInvoiceCreateFlow.ts` is covered by A11Y-004 and OPS-007.
- [ ] Trace: `src/hooks/useLocale.ts` is covered by I18N-001.
- [ ] Trace: `src/hooks/useNetworkStatus.ts` is covered by A11Y-009 and DB/MEM preservation tasks.
- [ ] Trace: `src/i18n/__tests__/rtl.test.ts` is covered by I18N-001.
- [ ] Trace: `src/i18n/polyfills.ts` is covered by I18N-001.
- [ ] Trace: `src/i18n/rtl.ts` is covered by I18N-001.
- [ ] Trace: `src/mocks` live usage is covered by RUNTIME-004, PRODUCT-001, PRODUCT-002, and
      PRODUCT-003.
- [ ] Trace: `src/repositories/baseRepository.ts` is covered by P0-004, PERF-008, RUNTIME-007,
      SEC-010, and SEC-011.
- [ ] Trace: `src/repositories/baseRepository.ts:24-27` is covered by SEC-011 and SEC-014.
- [ ] Trace: `src/repositories/index.ts` is covered by RUNTIME-012.
- [ ] Trace: `src/schemas/inventory.ts` is covered by I18N-005 and RUNTIME-007.
- [ ] Trace: `src/schemas/invoice.ts` is covered by I18N-005 and RUNTIME-007.
- [ ] Trace: `src/schemas/payment.ts` is covered by I18N-005 and RUNTIME-007.
- [ ] Trace: `src/services/authService.ts:73-81` is covered by SEC-006.
- [ ] Trace: `src/services/invoiceService.ts:50-144` is covered by RUNTIME-014 and SEC-014.
- [ ] Trace: `src/services/writeQueueService.ts` is covered by OPS-003, SEC-004, and SEC-014.
- [ ] Trace: `src/services/writeQueueService.ts:24` is covered by OPS-003 and SEC-011.
- [ ] Trace: `src/services/writeQueueService.ts:73-89` is covered by SEC-004.
- [ ] Trace: `src/stores/authStore.ts:101-108` is covered by RUNTIME-011 and SEC-003.
- [ ] Trace: `src/theme/__tests__/accessibilityPolicy.test.ts` is covered by A11Y-001.
- [ ] Trace: `src/theme/__tests__/contrastPolicy.test.ts` is covered by A11Y-001 and A11Y-008.
- [ ] Trace: `src/theme/designTokens.ts` is covered by TOOL-008.
- [ ] Trace: `src/ui-shell` is covered by TOOL-008.
- [ ] Trace: `src/utils/currency.ts` is covered by I18N-001.
- [ ] Trace: `src/utils/dateUtils.ts` is covered by I18N-001.
- [ ] Trace: `src/utils/logger.ts` is covered by OPS-002 and SEC-007.
- [ ] Trace: `src/utils/logger.ts:9-26` is covered by SEC-007.
- [ ] Trace: `supabase/migrations/003_orders_inventory.sql:62` is covered by P0-001 and DB-002.
- [ ] Trace: `supabase/migrations/004_stock_operations.sql` is covered by P0-001 and DB-002.
- [ ] Trace: `supabase/migrations/004_stock_operations.sql:7` is covered by P0-001 and DB-002.
- [ ] Trace: `supabase/migrations/007_views_functions_rls.sql:195` is covered by SEC-008.
- [ ] Trace: `009_missing_indexes.sql` is covered by PERF-007.
- [ ] Trace: `supabase/migrations/009_missing_indexes.sql` is covered by PERF-007.
- [ ] Trace: `supabase/migrations/011_transactional_invoice.sql` is covered by P0-001 and DB-002.
- [ ] Trace: `supabase/migrations/014_audit_log.sql:33` is covered by SEC-009 and SEC-014.
- [ ] Trace: `supabase/migrations/014_audit_log.sql:35-46` is covered by SEC-009.
- [ ] Trace: `supabase/migrations/015_fix_audit_log_rls.sql` is covered by DB-003 and SEC-009.
- [ ] Trace: `supabase/migrations/015_fix_audit_log_rls.sql:5-8` is covered by SEC-009.
- [ ] Trace: `supabase/migrations/015_low_stock_notification.sql` is covered by DB-003.
- [ ] Trace: `supabase/migrations/021_refresh_summaries_in_rpcs.sql` is covered by P0-001, DB-002, and
      DB-007.
- [ ] Trace: `zustand/middleware` persistence is covered by OPS-005.
- [ ] Trace: `scripts/check-design-system-guardrails.mjs` is covered by TOOL-006.
- [ ] Trace: `scripts/check-design-system-visual-regression.mjs` is covered by OPS-001.
- [ ] Trace: `scripts/check-inventory-app-ui-contract.mjs` is covered by TOOL-006.
- [ ] Trace: `scripts/check-package-release-discipline.mjs` is covered by TOOL-001 and TOOL-002.
- [ ] Trace: `scripts/check-ui-package-extraction-readiness.mjs` is covered by TOOL-001, TOOL-002, and
      TOOL-008.
- [ ] Trace: `scripts/check-ui-shell-guardrails.mjs` is covered by TOOL-006.
- [ ] Trace: `scripts/check-ui-tokens.mjs` is covered by TOOL-006 and CI-001.
- [ ] Trace: `scripts/check-workspace-packages.mjs` is covered by TOOL-006 and TOOL-008.
- [ ] Trace: `scripts/generate-design-tokens.mjs` is covered by TOOL-001, TOOL-002, and TOOL-008.
- [ ] Trace: `scripts/run-design-system-proof.mjs` is covered by TOOL-001, TOOL-002, and CI-001.
- [ ] Trace: `scripts/run-expo-e2e.mjs` is covered by TOOL-003 and TOOL-009.
- [ ] Trace: `scripts/run-maestro-suite.mjs` is covered by TOOL-003 and TOOL-009.
- [ ] Trace: `scripts/test-seed-reset.mjs` is covered by OPS-001 and SEC-014.
- [ ] Trace: `scripts/test-seed.shared.mjs` is covered by OPS-001.
- [ ] Trace: `AppError.ts` shorthand is covered by `src/errors/AppError.ts` tasks.
- [ ] Trace: `PaginatedList.tsx` shorthand is covered by
      `src/design-system/components/molecules/PaginatedList.tsx` tasks.
- [ ] Trace: `VirtualizedList.tsx` shorthand is covered by
      `src/design-system/components/molecules/VirtualizedList.tsx` tasks.
- [ ] Trace: `supabase.ts` shorthand is covered by `src/config/supabase.ts` tasks.
- [ ] Trace: `useInvoiceCreateFlow.ts` shorthand is covered by
      `src/features/invoice-create/useInvoiceCreateFlow.ts` tasks.

## Verification Checklist For This Todo File

- [ ] Verify every numbered audit section from 1 through 62 appears in the coverage map.
- [ ] Verify every Immediate Release-Blocking Defect has a P0 checklist.
- [ ] Verify every Recommended Direction item from 1 through 23 maps to at least one checklist section.
- [ ] Verify every Target-State hard rule maps to an enforcement checklist item.
- [ ] Verify every Elite Enterprise Exit Criterion appears under EXIT-005.
- [ ] Verify every STRIDE table row maps to SEC-014 or a more specific security task.
- [ ] Verify every OWASP category maps to SEC-015 or a more specific security task.
- [ ] Verify every named file in the audit appears in at least one relevant remediation task or inventory
      task.
- [ ] Verify positive audit findings are represented as preservation tasks, not ignored.
- [ ] Verify no task asks engineers to add another one-off guardrail when structural enforcement is
      available.
- [ ] Verify no task closes an issue by documentation alone when runtime behavior is the audited problem.
- [ ] Verify remediation produces user-visible correctness improvements, not only architectural cleanup.
