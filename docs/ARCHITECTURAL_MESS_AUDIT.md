# Architectural Mess Audit

Date: 2026-04-24 (fourth revision: corrected factual gaps, refreshed quantitative snapshot, and added target-state architecture plus execution gates)

Scope: Full-depth architecture, code quality, security, performance, operational, product-readiness, accessibility, internationalization, CI/CD pipeline, dependency supply chain, memory lifecycle, and database schema review. This covers the custom `scripts/*.mjs` layer, test harnesses, environment/config handling, route-layer boundaries, runtime code quality, data layer, state management, security posture, performance characteristics, incomplete product surfaces, production observability, WCAG compliance, i18n coverage, CI/CD maturity, dependency health, app lifecycle management, and Supabase schema integrity.

Perspective: Senior staff / principal engineer review (15+ YOE, FAANG enterprise products). The standard applied is not "does it work on one laptop today," but "is this an enterprise-grade system that scales safely across engineers, CI, new products, and future refactors."

Revision note: a prior version of this audit overstated one security issue. `.env.test` is currently ignored by `.gitignore` in this repo, which is good. The remaining risk is not an active committed-secret incident; it is unmanaged secret handling conventions, plaintext local env files, and the absence of automated secret scanning / codified CI secret management.

---

## Executive Summary

The codebase has accumulated the symptoms of a repo that is trying to become a platform without actually committing to platform engineering discipline.

At a high level:

1. The repo now contains a bespoke internal tooling platform implemented as ad hoc Node scripts.
2. Architecture policy is enforced primarily through regex scanners, fixture-based script tests, and required documentation phrases instead of through stronger module, package, and build boundaries.
3. The test system is broad but not cleanly layered. It mixes unit, source-contract, filesystem-contract, real-backend integration, visual snapshot, and device automation concerns in ways that increase maintenance cost faster than confidence.
4. The route layer does not honor a single architectural stack. Screens mix raw Supabase calls, repositories, services, and stores based on local convenience rather than system design.
5. Significant user-facing surfaces are still mock-backed or placeholder-driven, especially in reports and finance, which means product completeness is lower than the UI surface suggests.
6. The runtime code has meaningful type safety gaps, inconsistent error handling, state management patterns that will not scale, and auth lifecycle wiring that is more brittle than it looks.
7. The performance story has unaddressed re-render risks, eager global preloading, missing memoization in hot paths, and no meaningful lazy-loading strategy.
8. Security fundamentals are sound, but there are incomplete implementations (biometric auth UI with no backend) and unencrypted local storage of business data.
9. Production observability is not yet enterprise-grade. The repo has a structured logger interface, but no real crash/error sink or operational telemetry.
10. The backend authority model is incomplete. Critical financial workflows still rely too heavily on client-constructed payloads instead of a clearly defined server-authoritative contract.

11. Accessibility is a genuine strength. The design system enforces WCAG 2.2 AA compliance with proper roles, states, announcements, touch targets, and contrast — but app-level screens do not uniformly inherit this discipline.
12. Internationalization infrastructure exists (i18next, two languages, locale-aware formatting) but 40+ hardcoded strings, untranslated error messages, and untranslated Zod validation messages undermine it.
13. The CI/CD pipeline is structurally sound (6 jobs, matrix testing, design-system regression) but has zero security scanning, no automated dependency updates, no CODEOWNERS, and no codified secret-management path for local or CI test credentials.
14. The Supabase schema has a critical type mismatch: `stock_operations.quantity_change` is INTEGER while `invoice_line_items.quantity` is NUMERIC, and the live `create_invoice_with_items()` RPC still casts invoice quantities to INTEGER during stock deduction.
15. Memory lifecycle is mostly clean (timers, keyboard listeners, AppState all properly cleaned up) but 6 module-level `eventBus.subscribe()` calls across stores never unsubscribe, and the auth subscription is never torn down.
16. Mobile release discipline is not yet explicit enough. The repo has versioned RPC aliases, but no formal compatibility policy for old app versions, persisted store migrations, or backend deprecation windows.
17. Backup, restore, and incident-response maturity are below enterprise standard. There is no visible restore drill, no RPO/RTO target, and no codified runbook path for bad releases or destructive data mistakes.
18. There are already concrete correctness defects, not just architectural smells. Example: `app/(app)/reports/all-transactions.tsx` routes purchases to `/(app)/finance/purchase/${p.id}` while the actual detail route is `app/(app)/finance/purchases/[id].tsx`.

The result is a system with high quality intent but low structural leverage. Engineers are spending increasing effort proving architecture claims rather than benefiting from architecture that is naturally hard to violate, and some of the biggest gaps now live in route boundaries and unfinished product surfaces rather than only in meta-tooling.

---

## Quantitative Snapshot

These numbers are directionally important because they show where the complexity is living.

| Surface                                                     |   Size | Why it matters                                                               |
| ----------------------------------------------------------- | -----: | ---------------------------------------------------------------------------- |
| Root `package.json` scripts                                 |     41 | Very large command surface for a single app repo                             |
| Root `scripts/*.mjs` files                                  |     19 | This repo has effectively built a custom internal tooling layer              |
| Total `scripts/*.mjs` LOC                                   |  4,806 | A non-trivial maintenance burden on its own                                  |
| Test files under `__tests__/`                               |    114 | Large external test surface                                                  |
| Test files under `src/`                                     |    193 | Significant internal/package-level test surface                              |
| Total test/spec files                                       |    314 | Broad but hard to reason about as one system                                 |
| Approximate total test LOC                                  | 34,050 | Test code is now a substantial subsystem                                     |
| Test/spec files under `src/design-system/`                  |     93 | Design-system governance is a first-class maintenance axis                   |
| Script-specific test files                                  |      7 | Only a subset of custom scripts have dedicated validation                    |
| Top-level docs                                              |     35 | Heavy documentation footprint                                                |
| Approximate total doc LOC                                   | 25,429 | Documentation is large enough to become a product in itself                  |
| `as unknown` casts in production code                       |     17 | Type safety gaps at service boundaries                                       |
| `eslint-disable` comments                                   |     43 | Localized rule suppression and repeated rule escape hatches                  |
| TODO comments                                               |     32 | 31 in `app/`, concentrated in reports and finance screens                    |
| App screens importing mock data directly                    |     15 | Significant user-facing surfaces remain stubbed                              |
| App files importing repositories directly                   |      7 | UI layer bypasses service/store orchestration                                |
| App files importing raw Supabase directly                   |      2 | Some routes skip abstractions entirely                                       |
| Files over 300 LOC in `app/`                                |     58 | Many screens are carrying too much responsibility                            |
| Files over 500 LOC in `app/`                                |     14 | Route files are carrying feature logic that should live elsewhere            |
| Files over 500 LOC in `src/`                                |     18 | Several modules need decomposition                                           |
| Supabase tables                                             |     19 | Moderate schema complexity                                                   |
| `jest.setup.ts` LOC                                         |  1,046 | The test harness is itself a non-trivial system                              |
| Hardcoded UI strings bypassing i18n                         |    40+ | Settings, supplier, inventory screens worst offenders                        |
| Untranslated Zod validation messages                        |    30+ | All schemas use English-only error strings                                   |
| `npm audit` vulnerabilities                                 |     28 | 1 critical, 5 high — zero scanning in CI                                     |
| Module-level eventBus subscriptions (no cleanup)            |      6 | Across customer, dashboard, invoice, finance, notification, inventory stores |
| Supabase migrations                                         |     24 | 1 numbering conflict (015 duplicated), 0 rollback scripts                    |
| Fractional-quantity breakpoints                             |      5 | 4 INTEGER schema fields plus 1 INTEGER cast in the invoice RPC chain         |
| RLS policies with `USING (true)`                            |     17 | All tables allow any authenticated user full access                          |
| Accessibility test files using `getByRole`/`getByLabelText` |     58 | Strong design-system coverage                                                |
| Files using `useLocale()`/`useTranslation()`                |    127 | Good adoption but inconsistent (includes tests and docs)                     |
| CI pipeline jobs                                            |      6 | Validate, integration, iOS e2e, Android e2e, design-system iOS/Android       |
| Security scanning steps in CI                               |      0 | No npm audit, no SAST, no secret scanning, no Dependabot                     |

Largest individual files are also revealing:

- `jest.setup.ts`: 1,046 LOC
- `scripts/run-maestro-suite.mjs`: 791 LOC
- `scripts/check-design-system-guardrails.mjs`: 707 LOC
- `scripts/generate-design-tokens.mjs`: 574 LOC
- `__tests__/visual/snapshots.test.tsx`: 941 LOC
- `app/(app)/inventory/add.tsx`: 925 LOC
- `app/(auth)/setup.tsx`: 915 LOC

This is not "normal glue code." This is a secondary architecture.

---

## Immediate Release-Blocking Defects

These are worth calling out separately because they are not abstract architectural concerns. They are concrete defects or misleading product behaviors already discoverable in the current repo snapshot.

| Defect                                 | Evidence                                                                                                                                                           | Why it matters                                                                  | Required action                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Fractional stock truncation            | `supabase/migrations/004_stock_operations.sql` + `supabase/migrations/021_refresh_summaries_in_rpcs.sql` cast invoice quantities to INTEGER during stock deduction | Real stock can silently drift from reality and from financial records           | Fix schema + RPC casts first, then backfill / reconcile affected inventory |
| Broken purchase drill-down from report | `app/(app)/reports/all-transactions.tsx` routes to `/(app)/finance/purchase/${p.id}` while the actual screen is `app/(app)/finance/purchases/[id].tsx`             | Users can reach a dead path from a core reporting workflow                      | Fix route construction and add a regression test                           |
| False security promise in settings     | `app/(app)/settings/security.tsx` exposes biometric and auto-lock controls without actual enforcement                                                              | Users can believe the app is protected when it is not                           | Wire the feature or remove / clearly mark it unavailable                   |
| Silent misconfiguration failure        | `src/config/supabase.ts` and `src/repositories/baseRepository.ts` can export `{}` cast as a client                                                                 | Missing env/config yields cryptic runtime failures instead of fail-fast startup | Replace casts with startup exceptions and health checks                    |

---

## Part I: Tooling, Scripts, and Meta-Architecture

### 1. The Repo Has Built a Bespoke Internal Toolchain

The project has crossed the line from "a few helper scripts" into "a custom build/governance platform."

Examples:

- `scripts/run-maestro-suite.mjs`
- `scripts/run-expo-e2e.mjs`
- `scripts/run-design-system-proof.mjs`
- `scripts/check-design-system-guardrails.mjs`
- `scripts/check-ui-shell-guardrails.mjs`
- `scripts/check-inventory-app-ui-contract.mjs`
- `scripts/check-workspace-packages.mjs`
- `scripts/check-ui-package-extraction-readiness.mjs`
- `scripts/check-package-release-discipline.mjs`
- `scripts/generate-design-tokens.mjs`

This matters because custom tooling is real product code. It needs ownership, shared libraries, versioned contracts, predictable behavior, and a coherent execution model. Today it is mostly a collection of standalone scripts with repeated patterns:

- each script parses CLI args manually
- many scripts walk the filesystem themselves
- many scripts shell out directly
- many scripts read docs and source files as plain text
- there is no shared CLI/util library for common behaviors

In a quick scan of the root scripts alone, there are:

- 8 direct child-process shell execution sites
- roughly 60 occurrences of directory walking / `existsSync` / `readdirSync` / custom walk logic

That makes every new governance rule more expensive than it should be. Instead of extending a platform, the repo copies another 100-300 lines of script logic and another test fixture.

Enterprise-grade benchmark:

- one shared tooling library for file walking, arg parsing, root discovery, environment loading, structured error output, and JSON reporting
- strict ownership over "platform tooling" as a subsystem
- preferably fewer scripts with stronger composition, not more scripts with overlapping responsibilities

### 2. Configuration Resolution Is Fragmented Across Execution Contexts

There are multiple configuration models depending on where code runs:

- app runtime in `src/config/supabase.ts`
- unit test runtime in `jest.setup.ts`
- integration test runtime in `jest.integration.config.js`
- seed/reset scripts in `scripts/test-seed.shared.mjs`
- Expo e2e launcher in `scripts/run-expo-e2e.mjs`
- Maestro orchestration in `scripts/run-maestro-suite.mjs`

These systems do not share one authoritative configuration layer.

Concrete problems:

- `src/config/supabase.ts` has fallback logic from `EXPO_PUBLIC_*` to `SUPABASE_TEST_*`
- `jest.integration.config.js` rewrites `SUPABASE_TEST_*` into `EXPO_PUBLIC_*` via `process.env` mutation
- `scripts/run-expo-e2e.mjs` manually parses `.env.test` and rewrites `EXPO_PUBLIC_*`
- `scripts/run-maestro-suite.mjs` manually parses `.env.test` again and separately validates the Expo bundle
- `jest.setup.ts` loads `.env.test` globally for all Jest tests, not just real integration tests
- No `.env.example` file exists. Engineers must discover required environment variables by reading code.

The `jest.integration.config.js` env rewrite is order-dependent: it only works if this config is required before `supabase.ts` loads. If another test file requires supabase first, it gets the wrong config.

Enterprise-grade benchmark:

- one typed configuration module
- explicit environment modes such as `dev`, `test`, `e2e`, `ci`
- fail-fast behavior when config is ambiguous
- no separate per-context fallback logic unless absolutely required
- unit tests should not silently inherit integration/e2e credentials
- `.env.example` documenting all required variables

### 3. The Test Environment Is Not Hermetic

`jest.setup.ts` is 1,046 lines. It is not just "test setup"; it is effectively an alternate runtime:

- sets `__DEV__ = true` globally
- loads `.env.test`
- globally intercepts `console.error` and `console.warn`
- monkey-patches `jest.spyOn`
- attaches `unhandledRejection` and `uncaughtException` process handlers
- provides a consolidated `react-native` mock (~400 lines)
- maintains a custom native registry for text inputs and scroll views
- mocks 33+ modules globally including `@shopify/flash-list`, `expo-router`, `i18next`
- loads the real `en.json` translation file at module load time
- contains contradictory comments about Supabase mocking (line 613 says "NOT globally mocked" but the mock IS there)

This creates a non-trivial gap between the test runtime and the production runtime. It also means any engineer debugging a flaky or misleading test must understand framework-level behavior encoded in `jest.setup.ts`, not just the test under inspection.

Enterprise-grade benchmark:

- minimal global setup
- per-layer setup only where needed
- unit tests should be mostly hermetic and environment-light
- integration/e2e tests should have explicit setup, not global bleed-through

### 4. The Test Pyramid Is Muddled

The repo has many test layers, but the boundaries between them are not clean:

- unit tests
- UI tests
- `ui-live` tests
- integration tests against real Supabase
- visual snapshot tests
- script tests
- source contract tests
- filesystem contract tests
- architecture boundary tests
- design-system governance tests

The problem is not that there are many tests. The problem is that too many of them are verifying overlapping things in different ways.

Examples:

- `__tests__/visual/snapshots.test.tsx` is a 941-line monolithic suite with hand-maintained mocks for translations, router, stores, services, network, and native modules
- `__tests__/visual/setup/renderToSnapshot.tsx` opportunistically enables `jest-image-snapshot` if available, which means test fidelity depends on environment capabilities
- `__tests__/integration/authFlow.test.ts` hits a real backend but still carries hard-coded fallback credentials and comments that have drifted from the actual npm script surface (tells engineers to use `yarn test:integration` when repo uses npm)
- `__tests__/scripts/*.test.ts` validates CLI scripts using temporary filesystem fixtures and command execution, which is useful, but mostly validates script output rather than architecture health
- `src/design-system/__tests__/componentContract.test.ts` is effectively a regex linter expressed as a Jest test

This creates a confidence illusion:

- the repo feels heavily tested
- but a meaningful portion of the tests are testing source text, docs, registries, or file existence rather than runtime behavior

Enterprise-grade benchmark:

- clear layer ownership
- unit tests for behavior
- integration tests for subsystem boundaries
- e2e tests for critical user journeys
- lint/static analysis for source-shape rules
- a smaller number of carefully owned visual tests

### 5. Architecture Is Being Enforced by Regex and File Scans Instead of Real Boundaries

The design-system and package-boundary enforcement mechanisms rely heavily on scanning source files and docs as text:

- `scripts/check-design-system-guardrails.mjs`
- `scripts/check-ui-shell-guardrails.mjs`
- `scripts/check-inventory-app-ui-contract.mjs`
- `scripts/check-workspace-packages.mjs`
- `scripts/check-ui-tokens.mjs`
- `src/design-system/__tests__/componentContract.test.ts`
- `src/design-system/__tests__/boundary.test.ts`

Typical patterns include:

- `fs.readdirSync(...)`
- `fs.existsSync(...)`
- `fs.readFileSync(...)`
- regexes over imports, props, docs, and source contents
- required phrase lists for markdown files

This tells me the architecture is not truly encoded in the package graph, TS project layout, lint rules, or build configuration. Instead, it is encoded in repo-specific text conventions.

That has three major downsides:

1. It is brittle. Source can satisfy the regex while still being structurally wrong.
2. It is expensive. Every new rule adds more custom parser-like logic.
3. It does not compose well. Scripts overlap in scope and drift independently.

Enterprise-grade benchmark:

- package exports and TS project references for boundary enforcement
- ESLint custom rules where text-level pattern matching is truly needed
- dependency graph enforcement through tooling, not bespoke grep logic
- fewer contract tests over source text

### 6. Documentation Has Become a Required Build Artifact

The repo does not merely document architecture. It requires documentation to exist and contain specific phrases for tests and checks to pass.

There are at least 20 explicit doc/readme phrase-enforcement sites across the reviewed scripts and design-system contract tests.

That is risky because:

- docs become another form of configuration
- phrasing changes can break builds
- engineering work now requires synchronized edits across source, scripts, tests, generated artifacts, and docs
- documentation volume grows faster than engineer trust in documentation freshness

The repo currently has 34 top-level markdown docs totaling roughly 24k lines. That is more than enough volume for documentation to become a separate maintenance system with its own drift.

Enterprise-grade benchmark:

- docs should explain the system
- architecture should not depend on specific prose strings unless the docs are generated from source or are formal schemas
- enforcement should target structural truth, not word choice

### 7. The Packaging and Extraction Story Is Aspirational, Not Yet Structurally Real

The repo wants `src/design-system`, `src/ui-shell`, and `examples/ops-console` to behave like extractable packages. That is a reasonable goal. The nuance is that these are not imaginary packages: `src/design-system` and `src/ui-shell` do have workspace `package.json` files and `exports`.

The issue is that the extraction story is still hybrid:

- package manifests exist, but they point directly at source files
- package boundaries still require repo-specific guardrail scripts and source-contract tests to stay intact
- some foundations still point back into legacy app surfaces (for example token provenance still references `src/theme/designTokens.ts`)

That means the repo is spending effort proving extractability instead of gaining the leverage that real package boundaries should provide automatically.

Enterprise-grade benchmark:

- either these are real packages with strong package-level boundaries
- or they are internal modules and should be treated as such
- trying to operate in both modes for too long multiplies guardrail complexity

### 8. The Tooling Is Too Dependent on the Local Machine

Several scripts make strong assumptions about the host environment:

- `~/.nvm/nvm.sh`
- `npx supabase`
- `bash -lc command -v ...`
- `/opt/homebrew/bin/maestro`
- `/usr/bin/open`
- `xcrun simctl ...`

Enterprise-grade benchmark:

- explicit runtime prerequisites
- environment validation at entry
- portable tool discovery strategy
- fewer hidden shell assumptions
- where possible, CI/containerized parity

---

## Part II: Runtime Code Quality

### 9. The Supabase Client Is a Silent Landmine

`src/config/supabase.ts` (lines 4-33) has a critical design flaw:

```typescript
const finalUrl = supabaseUrl || process.env.SUPABASE_TEST_URL || '';
const finalKey = supabaseAnonKey || process.env.SUPABASE_TEST_ANON_KEY || '';

export const supabase =
    finalUrl && finalKey
        ? createClient(finalUrl, finalKey, {...})
        : ({} as ReturnType<typeof createClient>);
```

When both URL and key are missing, the module exports `{}` type-cast as a Supabase client. Any call to `supabase.from()` will fail at runtime with a cryptic `TypeError: supabase.from is not a function` instead of a clear configuration error.

The `baseRepository.ts` compounds this with a dynamic `require()` (line 82-93) that falls back to `{}` again:

```typescript
function getClient() {
	try {
		const mod = require('../config/supabase');
		return mod.supabase || defaultClient || ({} as Record<string, unknown>);
	} catch {
		return defaultClient || ({} as Record<string, unknown>);
	}
}
```

This creates a chain of silent failures: config missing → empty object returned → queries fail with unhelpful runtime errors.

Enterprise-grade benchmark: fail loudly at startup if required config is missing. Never export a castled empty object as a valid client.

### 10. Error Handling Is Inconsistent Across Layers

The codebase has four different error handling patterns used inconsistently:

**Pattern A — Service layer wraps errors:**

```typescript
// paymentService.ts, invoiceService.ts
} catch (error) {
    throw toAppError(error);  // error is untyped (implicit any)
}
```

**Pattern B — Stores cast unsafely:**

```typescript
// invoiceStore.ts, inventoryStore.ts
} catch (error: unknown) {
    set({ error: (error as Error).message, loading: false });
}
```

If `error` is not an Error object, `.message` is `undefined` and the actual error is lost.

**Pattern C — Errors silently swallowed:**

```typescript
// authStore.ts
} catch {
    set({ loading: false }); // Error swallowed, user never sees it
}
```

**Pattern D — Raw Supabase errors thrown:**

```typescript
// orderService.ts
const { data, error } = await query;
if (error) throw error; // Throws raw Supabase error, not toAppError
```

The `businessProfileService` skips validation entirely and throws raw `new Error(error.message)` instead of using `toAppError()`.

Enterprise-grade benchmark: one error transformation pattern, applied consistently at the service boundary. Stores should never need to know about error shapes.

### 11. Type Safety Has Meaningful Gaps

While the ESLint config properly bans `as any` in production code (0 occurrences in `src/`), there are 16 `as unknown` double-casts that indicate type system friction:

- `invoiceService.ts:136`: `invoiceData as unknown as Parameters<typeof repo.createAtomic>[0]` — double cast hides a schema/type mismatch
- `exportService.ts:171-172`: `b2bRows as unknown as Record<string, string | number>[]` — rows are already typed but cast anyway

The Zod schemas and TypeScript types can diverge silently. The `InvoiceInputSchema` and `InvoiceInput` type are not linked at the type level — adding a field to one does not enforce adding it to the other.

The repository layer has no type-level table name safety: `tableName` is a string, so typos like `'invoices'` vs `'invoice'` won't fail until runtime.

Enterprise-grade benchmark: derive TypeScript types from Zod schemas (using `z.infer<>`) to eliminate drift. Use Supabase's generated types for table-level type safety.

### 11A. The Route Layer Violates the Intended Architecture

For a repo that has services, repositories, stores, and extracted UI packages, route files should mostly orchestrate presentation and feature modules. In practice, many screens bypass that expectation and choose their own data-access path:

- `app/(app)/inventory/[id].tsx` mixes `inventoryService`, `itemPartyRateService`, and raw `supabase`
- `app/(app)/finance/purchases/[id].tsx` reads and deletes purchases via raw `supabase`
- `app/(app)/reports/all-parties.tsx` combines `useCustomerStore()` with `supplierRepository.findMany()`
- `app/(app)/suppliers/index.tsx` calls `supplierRepository` directly from UI code
- `app/(app)/finance/payments/make.tsx` mixes `supplierRepository` lookup with `paymentService.recordPayment()`

This is more important than style. It means loading policy, retry policy, permission checks, error normalization, and data contracts are being decided ad hoc per route. It also guarantees that repository/service refactors fan outward into screens.

Enterprise-grade benchmark: route files compose feature modules and view models. Raw database clients do not appear in screens, and screens do not choose between repository and service access on their own.

### 11B. Significant Product Surfaces Are Still Mock-Backed

The TODO count understates the problem. At least 15 app screens import mock data directly from `src/mocks`, including finance and statutory-reporting surfaces:

- `app/(app)/reports/gstr1.tsx`
- `app/(app)/reports/gstr3b.tsx`
- `app/(app)/finance/cash.tsx`
- `app/(app)/reports/party-statement.tsx`
- `app/(app)/finance/bank-accounts/index.tsx`

Several of these screens also expose actions such as export, save, or sharing that are placeholders rather than implemented workflows. That creates a dangerous gap between UI completeness and operational completeness.

Enterprise-grade benchmark: incomplete product surfaces should be behind feature flags, hidden from primary navigation, or explicitly labeled beta/coming soon. Mock-backed financial or compliance flows should not read like finished features.

### 12. State Management Has Scaling Problems

**Module-scope side effects in stores:**

`invoiceStore.ts` (lines 144-160) subscribes to the event bus at module scope:

```typescript
eventBus.subscribe((event) => {
	if (event.type === 'PAYMENT_RECORDED' && event.invoiceId) {
		useInvoiceStore.getState().fetchInvoices(1);
	}
});
```

This subscription lives forever — no cleanup, no unsubscribe. The same pattern exists in `customerStore.ts` (lines 211-221). In a React Native app, modules aren't unloaded, so this is technically safe, but it is architecturally wrong: business logic (event reactions) is encoded as a global side effect of importing a store module.

**Global mutable state outside React:**

`inventoryStore.ts` has `let pendingResetFetch = false` at module scope (line 72). This is a global flag shared across all consumers. If two components use the store concurrently with different fetch semantics, this flag creates race conditions.

`customerStore.ts` creates a single debounce instance at module scope (line 40-42). All component instances share it, which means debounce timing can leak across unrelated UI contexts.

**Business logic in stores:**

Stores contain conflict resolution state machines, debounce logic, event bus subscriptions, and data transformation. This makes stores hard to test in isolation and creates tight coupling between state shape and business rules.

Enterprise-grade benchmark: stores should hold state and expose actions. Business logic should live in services. Event subscriptions should be managed in React lifecycle or a dedicated orchestration layer.

### 12A. Auth Lifecycle Wiring Can Accumulate Global Listeners

`authStore.initialize()` registers `authService.onAuthStateChange(...)` inside the store action. That same `initialize` function is invoked from `ShellAuthGate` on mount and is also supplied as session validation in the shell environment when the app resumes.

This means auth startup, foreground resume validation, and long-lived auth listener ownership are coupled to a store action that can be called more than once and never explicitly unsubscribes. Even if the current call graph avoids duplication most of the time, the design is brittle and easy to regress.

Enterprise-grade benchmark: one startup-owned auth subscription, explicit unsubscribe/teardown semantics, and a dedicated session orchestration layer for foreground validation.

### 13. Barrel Exports Block Tree-Shaking

`src/repositories/index.ts` re-exports 11 modules via `export *`. `src/design-system/components/molecules/index.ts` re-exports all 53 molecule components.

When any screen imports `{ ListItem } from '@/design-system/components/molecules'`, the bundler must evaluate all 53 components. Metro bundler (React Native) does not tree-shake effectively with barrel re-exports.

Enterprise-grade benchmark: direct imports to specific modules (`import { ListItem } from '@/design-system/components/molecules/ListItem'`), or configure ESLint to ban barrel imports in app code.

### 13A. Route Files Are Carrying Too Much Feature Logic

There are 57 app files over 300 lines and 13 over 500 lines. The biggest route files are not just large; they mix helpers, async effects, form state, business orchestration, and full-screen rendering:

- `app/(app)/inventory/add.tsx` (~925 LOC)
- `app/(auth)/setup.tsx` (~915 LOC)
- `app/(app)/invoices/[id].tsx` (~887 LOC)

The repo already contains a better pattern in `src/features/invoice-create/InvoiceCreateScreen.tsx` plus `useInvoiceCreateFlow.ts`, which makes the inconsistency more obvious. The codebase knows what “better” looks like, but has not applied it consistently.

Enterprise-grade benchmark: route files should be thin composition layers. Complex workflows, form orchestration, and request shaping belong in feature modules with testable hooks/builders.

---

## Part III: Performance

### 14. Re-Render Risks in List-Heavy Screens

The invoice list screen (`app/(app)/(tabs)/invoices.tsx`) has several re-render-triggering patterns:

- `renderItem` is an inline arrow function (line 376), recreated every render. This breaks FlatList's internal memoization.
- Inside `renderItem`, inline style objects are created (lines 263-283, 310-330), forcing re-renders of child components even when data hasn't changed.
- `ListItem` and `FormField` components use `forwardRef` but are NOT wrapped in `React.memo()`, so parent re-renders cascade to every list item.

The dashboard screen (`app/(app)/(tabs)/index.tsx`) creates `quickActions` and `dashboardStats` arrays inline on every render (lines 92-98, 123-144) — should be `useMemo`.

The invoice creation form (`src/features/invoice-create/LineItemsStep.tsx`, lines 40-68) computes subtotal, GST, and grand total on every render without `useMemo`. With dynamic line items, this recalculates on every keystroke.

FlatLists are missing `getItemLayout` everywhere, forcing React to measure every item.

Enterprise-grade benchmark: memoize `renderItem` with `useCallback`, wrap list item components in `React.memo`, use `useMemo` for computed data, provide `getItemLayout` for fixed-height items.

### 15. No Code Splitting or Lazy Loading, Plus Eager Global Preloading

All screens are statically imported. There are zero uses of `React.lazy` or dynamic `import()` in the app directory. The 5 tabs are all eagerly initialized including a `customers` tab that is hidden (`href: null`) — dead weight.

For a mobile app, this is less critical than web (no network roundtrip for code), but it means app startup loads the full JavaScript bundle including all 14+ report screens, all finance sub-screens, and the entire design system workbench.

Separately, `app/(app)/_layout.tsx` prefetches dashboard and inventory data on mount, then warms invoices, customers, finance, and orders after interactions, and repeats that pattern on app foreground resume. That may improve one happy path, but it also turns app startup into global work and makes tab-level ownership less clear.

Enterprise-grade benchmark: lazy-load rarely-used screens (reports, settings, utilities), move warmup behind explicit cache policy, and avoid global prefetch that hides unclear ownership.

### 16. Missing Database Indexes for Common Queries

The dashboard and list screens frequently query `invoices` filtered by `customer_id`, `payment_status`, and `created_at`. There is no composite index for this pattern. Similarly, `customers(name, type)` is searched frequently but only has a single-column phone index.

The migration `009_missing_indexes.sql` added basic indexes but missed the composite patterns that would accelerate the most common screens.

Enterprise-grade benchmark: profile actual query patterns from Supabase dashboard, add composite indexes for the top 5 screen-load queries.

---

## Part IV: Security

### 17. Security Fundamentals Are Sound

The security posture is reasonable for a mobile business app:

- No hardcoded secrets in client code
- Supabase anon keys (intentionally public per Expo convention) loaded from env vars
- RLS policies enabled on all tables with per-user scoping for storage buckets
- Input validation via Zod schemas at many critical service entry points
- Structured logging conventions reduce accidental sensitive data logging (`console.log` is absent in production code)
- An error abstraction layer (`toAppError`) exists to map Postgres error codes to user-friendly messages, even though not every service uses it consistently yet
- Token refresh with exponential backoff and 3-attempt max
- Auth state properly tracked across `TOKEN_REFRESHED`, `SIGNED_IN`, `INITIAL_SESSION`, `SIGNED_OUT` events

### 18. Incomplete Implementations Create False Security Signals

**Biometric authentication is UI-only:**

`app/(app)/settings/security.tsx` (lines 65-80) renders a "Use Biometric Authentication" toggle, but the state is purely local — no actual biometric check is wired up. The `expo-local-authentication` plugin is declared in `app.json` but never called. An auto-lock timer UI exists with options (1 min, 5 min, etc.) but has no implementation.

This is worse than having no biometric feature at all: it gives users the impression their app is secured by biometrics when it isn't.

**AsyncStorage is unencrypted:**

Zustand persists invoice data, inventory items, and the offline write queue to AsyncStorage in plaintext. The write queue contains full mutation payloads (customer phones, payment amounts). On a rooted/jailbroken device, this data is readable.

Enterprise-grade benchmark: complete or remove the biometric feature. Use `react-native-keychain` for session tokens and consider `react-native-encrypted-async-storage` for business data.

### 19. RLS Policies Are Overly Permissive

Migration 007 creates:

```sql
CREATE POLICY "auth_full_access" ON table FOR ALL TO authenticated USING (true) WITH CHECK (true)
```

This means any authenticated user can read/modify any other user's data. For a single-user-per-business app this is acceptable, but it is one RLS policy away from being a data breach in a multi-tenant future.

Enterprise-grade benchmark: scope RLS to `auth.uid()` on all tables, not just storage buckets.

### 20. Destructive Migrations Are Irreversible

Migration 020 backfills NULL phone numbers with `'0000000000'` and adds `NOT NULL` constraint. Migration 024 overwrites duplicate phone numbers with synthetic values and creates a unique index. Neither migration is reversible without data loss. No rollback scripts exist.

Enterprise-grade benchmark: document data impact in migration comments, provide rollback procedures for destructive migrations.

---

## Part V: Operational Risks

### 21. Some Operational Paths Are More Dangerous Than They Look

- `scripts/test-seed.shared.mjs` deletes broad table contents during reset
- `scripts/test-seed-reset.mjs` hydrates a service role key via Supabase CLI when missing
- seed reset falls back to an authenticated user path if service-role access is unavailable
- `scripts/check-design-system-visual-regression.mjs` clears entire baseline or diff directories when updating

Some of this is acceptable in a tightly controlled test environment. The problem is that the safeguards depend heavily on the env/config discipline described earlier. In a system with ambiguous environment resolution, destructive automation deserves more explicit barriers.

### 22. The Offline Write Queue Has Subtle Failure Modes

`src/services/writeQueueService.ts` is well-designed overall (idempotency keys, exponential backoff, dead-letter queue). However:

- AsyncStorage operations between reading the queue (line 115) and writing back (line 178) are not atomic. Another process could modify the queue between read and write.
- `enqueue()` correctly throws when the queue reaches `MAX_QUEUE_SIZE`, but callers still need consistent user-facing handling and telemetry or the condition becomes easy to miss in practice.
- Replay updates mutation status and later writes the full queue back. If the process is interrupted between those writes, stale status and weak debug trails make sync failures harder to reason about.

Enterprise-grade benchmark: surface queue-full and dead-letter conditions to users and telemetry, add atomic queue operations or a transactional store, and persist sync diagnostics for debugging.

### 22A. Production Observability Is Not Yet Real

`src/utils/logger.ts` is a good abstraction boundary, but it still writes to console and explicitly says to wire a real sink later. The shell exposes analytics adapters, but there is no evidence of release health, crash reporting, or alerting for critical failures such as auth churn, sync failure, queue growth, or destructive script misuse.

For a local-team app this is survivable. For an enterprise standard it is not. Without production telemetry, many architecture problems stay anecdotal until users report them.

Enterprise-grade benchmark: wire `logger.error` to a real sink, tag errors by release, instrument core business funnels, and add dashboards/alerts for auth, sync, and queue health.

### 22B. Mobile Release Compatibility Is Not Yet a First-Class Contract

This is a mobile app talking to a backend that can change independently of what users have installed. That creates a class of risk the repo partially acknowledges but does not yet manage explicitly.

Positive signal:

- migration 017 introduces `_v1` RPC aliases, which shows awareness of API compatibility

Gaps:

- there is no codified policy that database and RPC changes must remain additive for the currently released app version plus an overlap window
- persisted Zustand stores do not declare `version` + `migrate`, so app upgrades can strand users on incompatible cached state
- there is no visible compatibility suite that proves "previous mobile build still works against latest backend"
- deprecation appears ad hoc rather than governed by a retirement window, ownership, and rollback path

For a web app this would still matter. For a mobile app it matters more because clients lag production for days or weeks, and app-store review delays make emergency fixes slower.

Enterprise-grade benchmark:

- additive backend changes by default
- explicit support window for at least the current mobile release and one rollback release
- versioned RPCs with deprecation dates and retirement owners
- persisted store migrations on every schema-affecting release
- CI coverage for previous-supported-client against latest backend

### 22C. Backup, Restore, and Incident Response Are Not Yet Operationally Real

The repo discusses migrations, seed resets, and destructive automation, but there is no visible end-to-end recovery story:

- no backup/restore runbook in `docs/`
- no restore-drill evidence
- no documented RPO/RTO target
- no release rollback runbook for bad mobile builds, bad migrations, or corrupted derived data
- no support-safe playbook for reconciling financial drift after defects such as the fractional-stock bug

That is acceptable for an internal prototype. It is not acceptable for an elite enterprise system handling inventory, invoices, payments, and business records.

Enterprise-grade benchmark:

- defined RPO/RTO targets
- quarterly restore drills with evidence
- migration rollback / backfill playbooks
- incident severity model, ownership, and escalation path
- customer-safe reconciliation procedures for financial/data-integrity incidents

---

## Part VI: Meta-Architecture

### 23. The Repo Is Optimized for Governance Through Accretion

This is the meta-finding underneath everything above.

When a new architecture concern appears, the repo tends to add:

- a markdown doc
- a custom script
- a script test
- sometimes a source-contract test
- sometimes a generated artifact
- sometimes a second guardrail script for consumers

This scales poorly. It produces local confidence in the moment, but globally it creates a repo where every change has to pass through a widening belt of process artifacts.

A strong architecture reduces the need for governance code. A weak architecture attracts governance code.

---

## Symptoms Versus Root Cause

The visible mess is the scripts, docs, and tests. The root cause is deeper:

- the repo is pursuing multiple strategic moves at once
    - app delivery
    - design-system extraction
    - UI shell extraction
    - second-consumer proof
    - visual proof
    - contract enforcement
    - release governance

Those are all valid goals. But they are being implemented inside one app repo mostly through custom tooling rather than through a more formal platform architecture.

That creates a mismatch between ambition and mechanism.

---

## What Is Good Here

This audit would be incomplete without acknowledging the strengths:

- there is clear quality intent
- the team cares about accessibility, visual quality, and package boundaries
- the repo is trying to make behavior explicit rather than tribal
- there is already a habit of testing tooling, not just product code
- the design-system and shell extractions are being treated seriously, and they do exist as real workspace packages with manifests and exports
- ESLint config is well-structured: `as any` is banned in production code (0 occurrences), magic numbers are controlled, test files are appropriately relaxed
- Zustand store subscriptions use `useShallow` correctly across 62 files, preventing unnecessary re-renders from broad store access
- Zod validation is applied at many critical service boundaries
- Financial calculations use proper 2-decimal rounding and handle GST slabs correctly
- The structured logger is a sensible abstraction boundary even though the production sink is not wired yet
- An error abstraction layer exists and is directionally correct where it is used
- Keyset (cursor-based) pagination in repositories avoids the OFFSET performance cliff for deep pages
- Race guards in stores prevent concurrent fetches
- The offline write queue has good foundational ideas: idempotency, retries, and a dead-letter queue
- `src/features/invoice-create` shows a healthier feature-sliced direction that the rest of the app can copy
- `expo-image` used correctly for native caching with `recyclingKey` for list virtualization
- design-system accessibility is genuinely enterprise-grade: WCAG 2.2 AA compliance, proper roles/states/announcements, 48px touch targets, color contrast validation including color-blindness simulation, focus ring utilities
- i18n infrastructure is well-designed: i18next + expo-localization, runtime language switching, locale-aware currency formatting with Indian grouping, locale-aware date formatting, RTL support infrastructure
- CI pipeline covers the right axes: typecheck, lint, test coverage, integration tests, iOS/Android e2e, design-system visual regression, nightly full suite
- database schema uses correct types (UUID PKs, TIMESTAMPTZ, NUMERIC for money), atomic RPC functions with row-level locking, materialized views for reporting, audit trail triggers, idempotency keys, API versioning via `_v1` aliases
- timer and listener cleanup is consistently correct across all React hooks and components
- FlashList virtualization with proper tuning (`estimatedItemSize`, `windowSize`, `removeClippedSubviews`)
- offline write queue has idempotency, exponential backoff, dead-letter queue, priority ordering, and deduplication
- all major dependencies are on current versions with no deprecated APIs

The problem is not lack of rigor.

The problem is that rigor is being expressed as control layers on top of complexity, rather than as simplification of the underlying architecture.

---

## Recommended Direction

If I were accountable for stabilizing this codebase, I would prioritize in this order.

### 1. Stop the bleeding

For a short period, do not add new one-off governance scripts unless they replace an existing one or close a production-critical gap.

Goal: slow the growth of the meta-system.

### 2. Re-establish one runtime architecture for the app layer

Decide and enforce a single path:

- routes
- feature modules / orchestration hooks
- services
- repositories
- Supabase client

Rules:

- no raw Supabase access in route files
- no direct repository access from route files unless the app intentionally introduces a read-model layer and documents it
- stores should not quietly absorb business orchestration that belongs in services or feature modules

Goal: make boundary violations rare, obvious, and enforceable.

### 2A. Decide Which Workflows Must Be Server-Authoritative

The repo should not treat every data flow the same. Simple reads and low-risk CRUD can remain thin and direct. Financially significant or security-sensitive writes should not trust the client as the final authority.

At minimum, these workflows should cross a server-owned boundary (versioned RPC, Edge Function, or BFF-style use case):

- invoice creation and invoice edits that affect totals or stock
- payment recording and ledger updates
- stock mutations and reconciliation
- compliance/report exports that must be auditable
- file parsing/import pipelines such as order PDF parsing
- auth-adjacent security flows where policy must live off-device

Rule: the client may send intent and draft values, but the server recomputes trusted totals, validates invariants, writes audit data, and enforces idempotency.

### 3. Fix the silent failure chain

Replace the `{} as SupabaseClient` pattern in `supabase.ts` and `baseRepository.ts` with hard failures. If config is missing, throw at startup. This single change will prevent an entire class of cryptic runtime errors.

### 4. Standardize error handling

Pick one pattern: `toAppError()` at the service boundary, every service, every time. Stores receive already-transformed errors. No raw Supabase errors escape services. No `(error as Error).message` casts.

### 5. Separate auth/session startup from store state

Move `onAuthStateChange` ownership out of `authStore.initialize()`. Keep one app-owned subscription, one explicit resume-validation path, and explicit teardown semantics.

Goal: eliminate auth edge-case drift before it becomes a source of heisenbugs.

### 6. Either complete, hide, or clearly downgrade mock-backed product surfaces

Inventory every screen still reading `src/mocks`.

Rules:

- finance and statutory-reporting screens should not appear complete unless they are backed by real data
- placeholder actions such as export/share/save should be removed, disabled, or clearly marked unavailable
- beta surfaces should be behind flags or clearly labeled as beta

Goal: remove the gap between UI completeness and operational completeness.

### 7. Create a real internal tooling foundation

Build one shared internal Node module for:

- CLI parsing
- repo root resolution
- environment loading
- typed config resolution
- filesystem walking
- structured violations and JSON output

Goal: collapse repeated script logic into a maintainable platform layer.

### 8. Centralize environment resolution

Create one authoritative environment/config package for app, integration, and e2e contexts.

Rules:

- no implicit fallback from production/dev config to test config
- no global `.env.test` loading for unit tests
- explicit environment mode per command
- hard failure on ambiguous configuration
- add `.env.example` documenting all required variables

Goal: eliminate split-brain runtime behavior.

### 8A. Add a Mobile Compatibility Contract

Make compatibility a policy, not a hope.

Rules:

- backend schema/RPC changes must be additive across the currently released mobile build and the next rollout window
- deprecated RPCs get named owners, retirement dates, and migration notes
- Zustand persisted stores must use `version` + `migrate`
- CI should include a "previous supported client vs latest backend" smoke path for critical flows

Goal: a backend deploy should not silently strand users on an older app build.

### 9. Break apart fat routes into feature modules

Start with:

- `app/(app)/inventory/add.tsx`
- `app/(auth)/setup.tsx`
- `app/(app)/invoices/[id].tsx`

Model the decomposition after `src/features/invoice-create`.

Goal: routes compose workflows instead of owning them.

### 10. Redesign the test pyramid

Separate the responsibilities clearly:

- static rules → ESLint / TS / package tooling
- unit tests → behavior only
- integration tests → real subsystem boundaries
- e2e → a very small number of critical workflows
- visual tests → isolated, owned, and intentionally small

Specifically:

- shrink the 1,046-line `jest.setup.ts` to under 200 lines
- move mock definitions to per-test or per-suite setup
- separate the contradictory Supabase mock comments
- eliminate the 33 global mock registrations
- migrate source-shape enforcement out of Jest where lint/static analysis is the right tool

### 11. Decide whether extracted packages are real or still internal

Make a deliberate choice:

- real packages with hard package-level boundaries, build outputs or project references, and measurable consumers, or
- internal modules with documented extraction intent and fewer governance artifacts

Do not stay indefinitely in a hybrid state that requires regex police everywhere.

### 12. Productionize observability

In order of impact:

1. Wire `logger.error` to a real sink
2. Tag errors and sessions by app release
3. Track auth failure, sync failure, queue backlog, and invoice-create success/failure funnels
4. Add dashboards and alerts for critical runtime regressions
5. Give ownership for incident response and telemetry hygiene

### 12A. Productionize Backup, Restore, and Incident Runbooks

In order of impact:

1. Define RPO/RTO for business data, auth/session recovery, and critical derived views
2. Document restore procedures for bad migrations, bad releases, corrupted caches, and financial reconciliation
3. Run and record restore drills on a regular cadence
4. Add incident runbooks for auth outages, sync backlog growth, payment/invoice corruption, and data-exposure events
5. Make rollback ownership explicit for backend, mobile release, and derived-data refresh failures

### 13. Fix the performance low-hanging fruit and startup ownership

In order of impact:

1. Wrap `ListItem` and `FormField` in `React.memo`
2. Memoize `renderItem` callbacks with `useCallback` in all FlatList screens
3. Add `useMemo` for computed arrays (dashboard stats, line item totals)
4. Review the global prefetch/warmup policy in `app/(app)/_layout.tsx`
5. Add composite database indexes for top query patterns
6. Remove the hidden `customers` tab that loads eagerly but is never shown

### 14. Complete or remove incomplete security features

The biometric auth toggle in settings is a liability. Either wire it up or remove the UI. Same for the auto-lock timer. Encrypt locally persisted business data or explicitly document that the app is not trying to protect it at rest.

### 15. Address the barrel export problem and dependency boundaries

Either:

- ban barrel imports in app code via ESLint and enforce direct module imports, or
- configure Metro bundler with package.json `exports` maps to enable proper tree-shaking

In parallel, move more boundary enforcement into package tooling / ESLint and out of bespoke grep logic.

### 16. Demote docs from enforcement primitives to support artifacts

Keep important docs, but stop using prose checks as the main control plane.

Better model:

- source of truth in code/config/schema
- docs generated from source where possible
- docs reviewed, but not coupled to dozens of phrase-based assertions

### 17. Fix the database type mismatch before it causes real financial harm

This is arguably the highest-severity single bug in the codebase. In one migration:

- alter `stock_operations.quantity_change`, `previous_quantity`, `new_quantity` from INTEGER to NUMERIC
- alter `inventory_items.box_count` from INTEGER to NUMERIC
- fix `create_invoice_with_items()` to cast `::NUMERIC` instead of `::INTEGER` in both the original 011 definition and the current 021 replacement

Every fractional-quantity invoice created before this fix has deducted the wrong stock amount.

### 18. Add security scanning to CI immediately

In order of fastest-to-deploy:

1. Add `npm audit --audit-level=high` as a CI step (5 minutes to implement, catches 28 existing vulnerabilities)
2. Enable GitHub Dependabot with weekly security update schedule
3. Keep `.env.test` ignored, add `.env.example`, and move CI/test credentials to GitHub Secrets or a secrets manager
4. Replace XLSX/SheetJS (`xlsx@^0.18.5`) — it has unpatched prototype pollution and ReDoS with no fix available
5. Add CodeQL or Snyk workflow for SAST
6. Add secret scanning (GitHub Advanced Security, Gitleaks, or `detect-secrets`) so plaintext creds cannot slip into the repo later
7. Run `npm audit fix` now to resolve lodash and forge vulnerabilities

### 19. Complete the i18n story or explicitly scope it

The codebase has invested in i18n infrastructure (i18next, 589 translation keys, locale-aware formatting, RTL support) but 40+ user-facing strings bypass it. This creates a worse outcome than having no i18n at all: it suggests bilingual support while delivering an inconsistent experience.

Priority actions:

1. Extract all hardcoded strings from settings screens (worst offenders) to translation JSON
2. Make `AppError` messages use translation keys, not hardcoded English (or hardcoded inline Hindi — line 95 of `AppError.ts`)
3. Use Zod schema factory pattern (`getSchema(t)`) to make validation errors translatable
4. Replace string concatenation of translation keys with interpolation
5. Implement i18next pluralization for EN/HI
6. Add the 4 missing Hindi translations

### 20. Add team process infrastructure

In order of impact:

1. Add `CODEOWNERS` mapping directories to responsible engineers
2. Add PR template with checklist (tests passing, accessibility, i18n keys added, no hardcoded strings)
3. Add commitlint with conventional commits for automated changelog generation
4. Create `eas.json` with development/preview/production build profiles
5. Document why `--legacy-peer-deps` is required and which specific peer conflicts it masks

### 21. Manage store lifecycle explicitly

1. Move all 6 module-level `eventBus.subscribe()` calls into a dedicated `StoreOrchestrator` or React lifecycle layer with explicit teardown
2. Capture the auth subscription return value and call `unsubscribe()` on logout
3. Add Zustand store version numbers and migration functions (via `zustand/middleware` `version` + `migrate` options) to handle schema evolution across app updates
4. Add TTL-based cleanup for dead-letter queue items (7-day expiry)

### 22. Scope RLS policies before multi-tenancy becomes a requirement

Add `business_id` (or `user_id`) column to all tables and scope RLS policies to the owning entity. Remove the blanket `USING (true) WITH CHECK (true)` policies. Remove public SELECT on master data tables (`item_categories`, `item_units`, `item_batches`, `item_serials`, `item_party_rates`). This is a one-migration structural change that prevents an entire class of future data breach.

### 23. Fix already-known correctness defects, not just structural debt

Do not let the architecture program become abstract. Ship the defects already visible in this audit:

1. Fix the broken purchase route in `app/(app)/reports/all-transactions.tsx`
2. Remove or implement placeholder share/export/save flows in finance and reporting screens
3. Remove security toggles that do not enforce anything
4. Add regression tests for the top 10 business-critical navigation and mutation paths

Goal: the remediation program should improve both architecture and user-visible correctness every sprint.

---

## Target-State Architecture

The repo needs an explicit dependency model, not just a set of negative rules.

### Runtime dependency graph

`routes/screens -> feature modules/view models -> services/use cases -> repositories/read models -> typed backend interface`

Two execution lanes should exist beneath that:

- simple reads / low-risk CRUD -> typed Supabase read models
- critical writes / sensitive workflows -> server-owned use cases (versioned RPCs, Edge Functions, or equivalent)

Cross-cutting platform concerns sit beside that chain, not inside random routes:

- `config` owns environment loading and validation
- `auth/session orchestrator` owns auth startup, foreground validation, and teardown
- `telemetry` owns structured logging, crash/error sinks, and business events
- `feature flags` own beta/incomplete surface exposure
- `store orchestrator` owns event subscriptions and lifecycle-aware cache invalidation
- `release compatibility` owns deprecation windows, persisted-store migrations, and previous-client safety
- `reliability operations` own backup/restore, reconciliation, and incident runbooks

### Layer responsibilities and allowed dependencies

| Layer                         | Owns                                                                                                  | May depend on                                       | Must not depend on                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| Routes / screens              | Navigation, composition, screen-level presentation state                                              | Feature modules, design system, presentation hooks  | Raw Supabase, repositories, env parsing, `src/mocks`   |
| Feature modules / view models | Workflow orchestration, form state, request shaping, optimistic UI                                    | Services, schemas, stores (view/cache only)         | Raw Supabase, global event wiring, platform env reads  |
| Services / use cases          | Business rules, transactions, error normalization                                                     | Repositories, `toAppError`, schemas                 | Router, screen state, direct UI concerns               |
| Stores                        | Cached server state, UI/session state, derived selectors                                              | Services or orchestrators                           | Repositories, raw Supabase, module-scope subscriptions |
| Repositories / read models    | Persistence and query translation                                                                     | Typed Supabase client, generated DB types           | Router, stores, presentation logic                     |
| Server-owned workflows        | Trusted financial calculations, audit creation, cross-aggregate invariants, sensitive imports/exports | DB functions, Edge Functions, internal service code | Screen state, navigation, client-only caches           |
| Platform / infra              | Config, auth/session, telemetry, queue, feature flags                                                 | SDKs and platform APIs                              | Screen workflows or route-specific code                |

### Critical-write rule

For this codebase, "elite" does not mean hiding every query behind extra ceremony. It means drawing the right trust boundary.

Client-owned reads are acceptable for:

- list/detail queries
- non-sensitive reference data
- low-risk local presentation caches

Server-authoritative workflows are required for:

- any mutation that changes money, stock, ledger state, or compliance outputs
- any workflow that must be auditable after the fact
- any workflow where replay, tampering, or partial failure creates business risk
- any workflow whose rules must not be bypassable on a rooted device or modified client

### Hard architectural rules

1. `app/` must not import raw Supabase clients
2. `app/` must not import repositories directly
3. Live routes must not import `src/mocks`
4. Only one module may own auth subscriptions
5. All service boundaries normalize to `AppError` (or its successor) before crossing upward
6. Event subscriptions must be lifecycle-owned and teardown-capable
7. Environment resolution must be typed, fail-fast, and mode-explicit
8. Docs describe architecture; they do not enforce it through phrase checks unless no stronger control exists
9. Financially significant writes must be server-authoritative and server-recomputed
10. Backend contracts must remain compatible across the supported mobile release window
11. Persisted stores must declare `version` and `migrate`
12. Every destructive or irreversible data operation must have a tested recovery path and runbook

### What elite looks like in code

- A new route is mostly composition and rendering, not data orchestration
- A new business flow is added as a feature module with tests, then composed by the route
- A persistence refactor does not require editing screens
- A missing env var fails the app at startup with one clear error
- A mock-backed surface cannot accidentally ship as “complete”
- A security or compliance feature cannot appear in UI unless enforcement exists behind it
- An invoice or payment workflow is trusted because the server recomputes and validates it, not because the client behaved
- The previous supported mobile build still works safely after today's backend deploy
- A restore drill can recover business data and derived state inside a declared recovery target

---

## Execution Plan And Ownership Model

The remediation path should be phased so the team reduces real risk first, then buys structural leverage.

| Phase                                         | Window      | Primary owners                                                   | Deliverables                                                                                                                                                                                                                       | Exit criteria                                                                                                                                                                                                                               |
| --------------------------------------------- | ----------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 0: Correctness and trust                | Days 0-7    | App owner + data owner + release owner                           | Fix fractional stock bug, fix broken report route, fail fast on Supabase config, remove false-security toggles, add `npm audit` + secret scanning to CI                                                                            | 0 open P0 data-integrity bugs, CI fails on high/critical vulnerabilities, no fake security controls visible                                                                                                                                 |
| Phase 1: Runtime boundary reset               | Days 8-30   | App architecture owner + data owner                              | Single runtime architecture, one auth/session orchestrator, store orchestration layer, extract first 3 fat routes, stop raw Supabase and repo imports from `app/`, make invoice/payment/stock writes server-authoritative          | Raw Supabase imports in `app/` = 0, direct repository imports in route files = 0, auth subscription ownership is singular and teardown-tested, critical writes no longer trust client-computed final values                                 |
| Phase 2: Product completeness and operability | Days 31-90  | Product engineering owner + QE owner + observability owner       | Hide or complete mock-backed screens, instrument core funnels, wire telemetry sink, reduce `jest.setup.ts`, add regression tests for top business paths, close i18n gaps on live screens, add previous-client compatibility checks | Live screens importing `src/mocks` = 0, top 10 journeys have telemetry + tests, `jest.setup.ts` < 300 LOC, hardcoded live-screen strings trending toward 0, previous supported app build passes critical-path smoke checks                  |
| Phase 3: Platform hardening                   | Days 91-180 | Platform owner + security owner + data owner + reliability owner | Shared tooling core, package-boundary decision, scoped RLS, composite DB indexes, rollback playbooks, dependency hygiene automation, backup/restore drills, persisted-store migrations, deprecation policy                         | 0 blanket RLS policies on business tables, package policy codified, Dependabot active, rollback procedure documented for destructive migrations, restore drill evidence exists, compatibility/deprecation policy is documented and enforced |

Suggested standing ownership, even if the team is small:

- `App architecture owner`: route boundaries, feature modules, stores, auth orchestration
- `Data owner`: Supabase schema, RLS, indexes, RPC integrity, generated DB types
- `Platform owner`: scripts, CI, package extraction strategy, env/config layer
- `Security owner`: dependency hygiene, secret management, scanning, storage-at-rest posture
- `Release / QE owner`: regression coverage, e2e critical path health, telemetry and alert review
- `Reliability owner`: backup/restore drills, incident runbooks, recovery targets, compatibility/rollback hygiene

---

## Elite Enterprise Exit Criteria

This is the minimum bar I would use before calling the repo “elite FAANG / enterprise standard” with a straight face.

| Dimension                | Exit criterion                                                                                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime architecture     | `app/` has 0 raw Supabase imports and 0 repository imports; all new screens follow the target dependency graph                                                 |
| Backend authority        | All financially significant writes are server-authoritative; server recomputes totals/invariants and owns audit-grade side effects                             |
| Product completeness     | Live navigation exposes 0 screens that import `src/mocks` or offer placeholder export/share/save actions                                                       |
| Correctness              | No open P0 data-integrity defects; stock movement supports fractional quantities end to end with DB + service + regression tests                               |
| Security                 | CI runs audit + SAST + secret scanning; no false-security UI; no business table uses blanket `USING (true)` policies                                           |
| Config and test hygiene  | One typed config module; unit tests do not load `.env.test`; `jest.setup.ts` is minimal and layer-specific                                                     |
| Release compatibility    | Latest backend remains compatible with the previous supported mobile release; persisted stores have versioned migrations; deprecations have an enforced policy |
| Operability              | `logger.error` is wired to a real sink; release dashboards exist for auth, sync, queue backlog, and critical conversion funnels                                |
| Reliability and recovery | RPO/RTO are defined; restore drills are evidenced; rollback and reconciliation runbooks exist for bad releases and bad migrations                              |
| Accessibility and i18n   | 0 hardcoded user-facing strings on live screens outside approved constants; screen-level accessibility semantics are enforced, not just atom-level semantics   |
| Platform tooling         | Shared tooling library exists; script count is stable or shrinking; docs are informative rather than phrase-policed                                            |
| Dependency hygiene       | Dependabot/Renovate active; high/critical vulns have an SLA; `--legacy-peer-deps` exceptions are documented and temporary                                      |

If those gates are not met, the repo may still be strong, but it is not yet at the elite enterprise bar this audit is measuring against.

---

## Part VII: Accessibility (WCAG Compliance)

### 24. Design-System Accessibility Is Genuinely Strong

This is one of the best areas of the codebase. The design system enforces accessibility at the atomic level with a discipline that most production apps lack:

- **Every interactive atom** has correct `accessibilityRole`: `Button` → `"button"`, `Checkbox` → `"checkbox"`, `Radio` → `"radio"`, `ToggleSwitch` → `"switch"`, `Chip` → `"togglebutton"`
- **State announcements** via `announceForScreenReader()` utility (used in 23+ files): Checkbox, Radio, ToggleSwitch, SearchBar, CollapsibleSection, ConfirmationModal, Tooltip all announce state changes
- **Touch targets enforced**: `TOUCH_TARGET_MIN_PX = 48` in `src/design-system/foundation/theme/layoutMetrics.ts`. Button heights validated in tests (≥44px xs, ≥48px md, ≥56px lg). Checkbox/Radio/ToggleSwitch enforce `minHeight: 48`.
- **Focus indicators**: `buildFocusRingStyle()` utility applied to all interactive atoms
- **Decorative content hidden**: `importantForAccessibility="no"` on icons inside buttons, status dots in Avatar, dividers. `"no-hide-descendants"` on modal backdrops, skeleton content, picker overlays
- **Live regions**: Toast uses `accessibilityLiveRegion="polite"` and `accessibilityRole="alert"`
- **Accessibility actions**: `CollapsibleSection` supports expand/collapse via `accessibilityActions`. `ConfirmationModal` uses `mapAccessibilityActionNames()` for gesture-heavy patterns
- **Form labels properly composed**: `FormField` hides visual label from a11y tree (`importantForAccessibility="no"`) and composes label + required + error into `accessibilityLabel` and `accessibilityHint` on the input. Error footer marked `accessibilityRole="alert"`
- **Color contrast validated**: `src/theme/__tests__/contrastPolicy.test.ts` validates WCAG AA (4.5:1 text, 3:1 component) across 5 theme presets × 2 modes. `src/theme/__tests__/accessibilityPolicy.test.ts` simulates deuteranopia and protanopia with Delta-E ≥30 distinguishability
- **Testing coverage**: 58 test files use `getByRole`/`getByLabelText` queries. Dedicated `accessibilityAuditContract.test.ts` validates WCAG 2.2 AA/AAA compliance documentation

### 25. App-Level Accessibility Has Gaps

The design system provides the building blocks, but consuming screens do not always use them correctly:

- **FlatList containers lack accessibility context**: `PaginatedList.tsx` line 102 renders `<FlatList>` with no `accessibilityLabel` or `accessibilityRole`. Screen readers cannot announce what list they are in.
- **App-level screens bypass design system patterns**: Some screens use raw `<Text>` or `<View>` without accessibility props, relying on the user to know what they are looking at
- **Heading hierarchy not enforced**: `ThemedText` supports `accessibilityRole="header"` (line 225-227 in tests), but app screens do not consistently apply heading levels for screen reader navigation
- **`app.json` missing accessibility declarations**: No `UIAccessibilityReduceTransparency` support, no accessibility service detection at launch, no Android accessibility service declarations

Enterprise-grade benchmark:

- enforce accessibility props at the screen composition level, not just atomic level
- add FlatList container labels in `PaginatedList`
- ensure heading hierarchy is consistent across all screens
- add accessibility declarations to `app.json` for both platforms
- expand live regions beyond Toast for transient status messages (sync status, queue state)

---

## Part VIII: Internationalization

### 26. I18n Infrastructure Is Solid

The foundational i18n implementation is well-designed:

- **Framework**: i18next + react-i18next + expo-localization (device locale detection, fallback to `en`)
- **Supported languages**: English (`en`) and Hindi (`hi`), with `@formatjs` polyfills for EN, HI, AR, DE, JA in `src/i18n/polyfills.ts`
- **Runtime switching**: `useLocale()` hook in `src/hooks/useLocale.ts` persists preference to AsyncStorage, supports `toggleLanguage()` and `setLanguage()`
- **Currency formatting**: `src/utils/currency.ts` is excellent — `formatINR()` with Indian grouping (₹1,00,000), `formatINRShort()` with language-aware suffixes ('L'/'लाख', 'Cr'/'करोड़'), `numberToIndianWords()` in both EN/HI
- **Date formatting**: `src/utils/dateUtils.ts` uses `date-fns` with `enIN`/`hi` locales, `i18n.t('common.today')`/`i18n.t('common.yesterday')` for relative dates
- **Translation coverage**: English 589 keys, Hindi 585 keys (99.3% complete, 4 missing: `customer.invalidPhone`, `invoice.add`, `invoice.errors.noSellingPrice`, `invoice.noResults`)
- **RTL infrastructure**: `src/i18n/rtl.ts` provides `configureI18nRtlSupport()`, `isRtlLanguageTag()` for ar/fa/he/ur, `syncI18nRtlPreference()`. Tested in `src/i18n/__tests__/rtl.test.ts`. Not active since both supported languages are LTR
- **~127 files** use `useLocale()` or `useTranslation()` (app screens, hooks, features, tests, and ui-shell)

### 27. Hardcoded Strings Undermine the I18n Story

Despite the infrastructure, 40+ user-facing strings in `app/` bypass the translation system entirely:

**Settings screens are the worst offenders:**

- `app/(app)/settings/items.tsx`: `"Item Settings"`, `"General"`, `"Pricing"`, `"Display"`, `"Tracking"`, `"Items Module"`, `"Master switch for all item features"`, `"Barcode Scanning"`, `"Track Stock by Default"` — all hardcoded
- `app/(app)/settings/reminders.tsx`: `"Payment Reminders"`, `"Auto Reminders"`, `"Reminder Schedule"`, `"First reminder after"`, `"Second reminder after"`, `"Third reminder after"`, `"Channel"`, `"WhatsApp"`, `"SMS"`, `"Both"` — all hardcoded. Line 23 has a hardcoded Hindi default template NOT in the translation file
- `app/(app)/settings/firms.tsx`: `'Add Business'`, `"Manage Businesses"`, `"My Business"` — hardcoded
- `app/(app)/settings/business-profile.tsx`: `"Business Profile"`, `"Business Description (max 200 chars)"`, `"Business Logo"` — hardcoded

**Form screens also bypass i18n:**

- `app/(app)/suppliers/add.tsx`: `"Add Supplier"`, `"Supplier Name"`, `"Contact Person"`, `"Phone"`, `"Email"`, `"GST Type"`, `"GST Details"`, `"Address"`, `"Terms & Notes"`, `'Save Supplier'` (partial: `submitting ? t('common.loading') : 'Save Supplier'`), `'Regular'`/`'Composition'`/`'Unregistered'` dropdown labels
- `app/(app)/inventory/add.tsx`: `"Basic Info"`, `"Pricing"`, `"Track Stock"`, unit labels `['Pcs', 'Box', 'Kg', 'Meter', 'Sq.ft', 'Sq.meter', 'Set']`
- `app/(app)/customers/add.tsx`: `"Basic Info"`, `"Customer Type"`, `"Individual"`, `"Business"`. Line 50 uses string concatenation anti-pattern: `t('customer.gstin') + ' ' + t('order.detailsMissing')`

### 28. Error Messages Are Not Translatable

This is a critical gap for a bilingual app:

**AppError class** (`src/errors/AppError.ts`) has hardcoded English messages:

- `ValidationError`: `'Please fix the highlighted fields'`
- `NetworkError`: `'Network error. Please check your connection.'`
- `InsufficientStockError`: `'Not enough stock for "{{itemName}}". Available: {{available}}, Requested: {{requested}}'`
- `NotFoundError`: `'{{entity}} not found'`
- `FK_VIOLATION` (line 87): `'This record is in use and cannot be modified'`
- `RLS_VIOLATION` (line 95): **hardcoded Hindi inline**: `'आपको यह देखने या बदलने की अनुमति नहीं है (Access Denied)'` — mixing languages in source code instead of using translation keys

**Zod validation schemas** have 30+ hardcoded English error messages:

- `src/schemas/inventory.ts`: `'Design name is required'`, `'Stock cannot be negative'`, `'Low stock threshold cannot be negative'`
- `src/schemas/invoice.ts`: `'Design name is required'`, `'Date must be in YYYY-MM-DD format'`, `'Customer name is required'`
- `src/schemas/payment.ts`: `'Date must be in YYYY-MM-DD format'`
- `app/(app)/suppliers/add.tsx` line 39: `z.string().min(2, 'Name is required')`

### 29. Pluralization Is Not Implemented

Translation JSON files have no plural forms (`_one`, `_other`, `_plural` suffixes). The codebase uses manual workarounds:

```json
"itemSingular": "item",
"itemPlural": "items"
```

This is not true pluralization. Hindi has different plural rules than English, and this approach will not extend to additional languages.

Enterprise-grade benchmark:

- extract all 40+ hardcoded strings to translation JSON
- make `AppError` messages accept i18n keys, not raw strings
- use Zod schema factory pattern: `getSchema(t)` where `t` is the translation function
- replace string concatenation with interpolation in translation keys
- implement i18next pluralization rules for EN/HI
- never hardcode language-specific text inline in source (especially the Hindi RLS error on line 95)

---

## Part IX: CI/CD Pipeline & Team Process

### 30. CI Pipeline Structure Is Sound

`.github/workflows/ci.yml` defines a 6-job matrix that covers the critical paths:

- **validate**: Typecheck, lint, test coverage, codecov upload
- **backend-integration**: Integration tests with Supabase test env
- **maestro-critical-ios**: iOS e2e tests on macOS runner
- **maestro-critical-android**: Android e2e tests on macOS runner
- **design-system-ios**: Design system visual regression
- **design-system-android**: Design system Android proof
- **nightly-full-suite**: Full integration + e2e on schedule (cron at 2:30 AM UTC)

Trigger strategy is correct: push to `main`/`master`, all pull requests, nightly schedule.

Local quality gates are also strong:

- `.husky/pre-commit`: runs `check:ui-tokens --staged` + `npx lint-staged`
- `.husky/pre-push`: runs full `npm run validate`
- `lint-staged`: Prettier + ESLint on `*.{ts,tsx}`, Prettier on `*.{json,md}`
- `npm run test:pr`: Complete PR pipeline (`typecheck && lint && test:coverage && test:seed:reset && test:integration && test:e2e:critical`)
- `npm run validate`: Master validation (17 chained checks)

### 31. Zero Security Scanning Infrastructure

This is the single biggest CI/CD gap. The pipeline has no security automation whatsoever:

- No `npm audit` step in CI — builds can pass with critical vulnerabilities
- No Dependabot or Renovate for automated dependency updates
- No CodeQL, Snyk, or SonarQube for static application security testing (SAST)
- No secrets scanning — local test credentials rely on plaintext `.env.test` conventions and there is no automated prevention if someone accidentally commits them
- No DAST scanning
- No supply chain integrity checks (no lockfile verification step)

Correction to the prior revision: `.env.test` is currently ignored by `.gitignore` in this repo, so this is not an active tracked-secret incident. The real issue is weaker process discipline than an enterprise repo should tolerate: secrets are managed by convention, not by codified secret tooling and CI policy.

**Current vulnerability state** (from `npm audit`):

| Severity  |  Count | Notable                                                                                                                      |
| --------- | -----: | ---------------------------------------------------------------------------------------------------------------------------- |
| Critical  |      1 | Handlebars.js — JavaScript injection via AST type confusion (no fix available in chain)                                      |
| High      |      5 | xmldom (XML injection, DoS), picomatch (ReDoS), lodash (code injection, prototype pollution), forge (signature forgery, DoS) |
| Moderate  |     18 | Various transitive dependencies                                                                                              |
| Low       |      4 | Minor issues                                                                                                                 |
| **Total** | **28** | XLSX/SheetJS has prototype pollution + ReDoS with **no fix available** (direct dep `xlsx@^0.18.5`)                           |

The lodash and forge vulnerabilities are fixable via `npm audit fix`. The XLSX and Handlebars vulnerabilities require dependency replacement.

### 32. Missing Team Process Infrastructure

- No `CODEOWNERS` file — no automatic reviewer assignment, no ownership enforcement
- No `.github/PULL_REQUEST_TEMPLATE.md` — PR descriptions depend on individual discipline
- No `.github/ISSUE_TEMPLATE/` — issue quality is inconsistent
- No commitlint or conventional commits enforcement — commit messages have no structural guarantee
- No `CHANGELOG.md` or automated release notes — version is static at `1.0.0` with no release automation
- No `eas.json` — Expo Application Services builds are not configured for staging/production differentiation
- No branch protection rules visible in repo (may exist in GitHub web settings, but not codified)

### 33. `--legacy-peer-deps` Masks Dependency Conflicts

All 7 `npm ci` calls in the CI pipeline use `--legacy-peer-deps`:

```yaml
- run: npm ci --legacy-peer-deps
```

This flag suppresses peer dependency resolution errors. It means the dependency tree may contain incompatible version combinations that npm would normally reject. This is a common workaround for React Native ecosystem conflicts, but it should be audited and documented rather than silently applied everywhere.

Enterprise-grade benchmark:

- add `npm audit --audit-level=high` as a CI step that fails the build
- add Dependabot or Renovate for automated security patches
- add CodeQL or Snyk for SAST
- add GitHub secret scanning or `detect-secrets` pre-commit hook
- keep `.env.test` ignored, add `.env.example`, use CI secrets, and add secret scanning so plaintext creds cannot be committed later
- add `CODEOWNERS` mapping directories to team members
- add PR template with checklist (tests, accessibility, i18n, security)
- add commitlint with conventional commits for release automation
- audit peer dependency conflicts hidden by `--legacy-peer-deps`
- create `eas.json` with development/preview/production build profiles
- replace XLSX/SheetJS with a maintained alternative (e.g., `exceljs`)

---

## Part X: Database Schema & Data Layer Integrity

### 34. Schema Structure Is Well-Designed Overall

The Supabase schema across 24 migrations shows good database engineering fundamentals:

- **UUIDs** for all primary keys (correct for distributed systems)
- **TIMESTAMPTZ** for all timestamps (timezone-aware)
- **NUMERIC** for all monetary amounts (no float precision loss)
- **7 well-defined enums** (`gst_type`, `payment_status`, `payment_direction`, `stock_direction`, etc.)
- **`moddatetime` triggers** on all tables for automatic `updated_at`
- **Atomic RPC functions** for critical operations: `create_invoice_with_items()` (with idempotency key), `record_payment_with_invoice_update()`, `perform_stock_operation()` (with row-level locking and non-negative stock validation)
- **Materialized views** for performance: `customer_ledger_summary`, `supplier_ledger_summary` with concurrent refresh
- **Audit trail**: `audit_trigger_fn()` triggers on invoices, payments, inventory_items, expenses
- **API versioning**: `_v1` function aliases in migration 017 for forward compatibility
- **Idempotency**: migration 019 adds `idempotency_key` to invoices with self-healing invoice number generation
- **Low stock notifications**: trigger-based `notify_low_stock()` creates notifications automatically

### 35. Critical Type Mismatch Causes Silent Data Loss

**Severity: CRITICAL**

Migration 008 correctly converted `invoice_line_items.quantity` and `purchase_line_items.quantity` from INTEGER to NUMERIC to support fractional quantities (e.g., 2.5 boxes of tiles).

However, `stock_operations` was NOT updated:

- `stock_operations.quantity_change`: INTEGER (`supabase/migrations/004_stock_operations.sql:7`)
- `stock_operations.previous_quantity`: INTEGER (line 8)
- `stock_operations.new_quantity`: INTEGER (line 9)
- `inventory_items.box_count`: INTEGER (`supabase/migrations/003_orders_inventory.sql:62`)

The `create_invoice_with_items()` function in the original definition (`supabase/migrations/011_transactional_invoice.sql`) and in the currently active replacement (`supabase/migrations/021_refresh_summaries_in_rpcs.sql`) both cast NUMERIC to INTEGER:

```sql
PERFORM perform_stock_operation(
  (v_item->>'item_id')::UUID,
  'stock_out',
  -((v_item->>'quantity')::INTEGER),  -- ← TRUNCATES FRACTIONAL PART
  ...
);
```

**Concrete impact**: Selling 2.5 boxes deducts 2 boxes from stock. Over time, inventory records drift from reality. For a business app managing real tile inventory, this is a data integrity bug that directly affects financial accuracy.

### 36. RLS Policies Are Uniformly Permissive

Migration 007 applies the same policy to 12 tables:

```sql
CREATE POLICY "auth_full_access" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)
```

Tables affected: `business_profile`, `customers`, `suppliers`, `orders`, `inventory_items`, `stock_operations`, `invoices`, `invoice_line_items`, `purchases`, `purchase_line_items`, `payments`, `expenses`.

Migrations 022 and 023 add `item_categories`, `item_units`, `item_batches`, `item_serials`, `item_party_rates` with the same pattern — plus they also allow **unauthenticated public SELECT**:

```sql
CREATE POLICY "Allow public select" ON item_categories FOR SELECT USING (true);
```

This means master data (categories, units) is readable by anyone without authentication. For a single-tenant app this is technically acceptable but architecturally dangerous — one `business_id` column away from being a multi-tenant data breach.

### 37. Migration 015 Has a Numbering Conflict

Two migrations share the number `015`:

- `015_fix_audit_log_rls.sql` (9 lines — adds audit insert policy)
- `015_low_stock_notification.sql` (39 lines — creates notifications table + trigger)

Supabase applies migrations alphabetically within the same prefix, so both will apply, but the ordering is fragile and the conflict signals a process gap.

### 38. Missing Indexes and Foreign Key Coverage

Missing indexes on common query paths:

| Table.Column                    | Usage                    | Index Status |
| ------------------------------- | ------------------------ | ------------ |
| `orders.supplier_id`            | Supplier ledger queries  | MISSING      |
| `payments.purchase_id`          | Purchase payment lookups | MISSING      |
| `stock_operations.reference_id` | Audit trail lookups      | MISSING      |

Composite indexes are absent for the most common screen-load patterns: `invoices(customer_id, payment_status, created_at)`, `customers(name, type)`, `inventory_items(category_id, box_count)`.

### 39. No Rollback Migrations Exist

All 24 migrations are forward-only. No down/rollback scripts exist. Migration 020 backfills NULL phone numbers with `'0000000000'` and adds NOT NULL constraint. Migration 024 overwrites duplicate phone numbers with synthetic values and creates a unique index. Neither is reversible without data loss.

### 40. Intentional Denormalization Is Mostly Sound

Invoice snapshot denormalization (`invoices.customer_name`, `customer_gstin`, `customer_phone`, `customer_address`) is correct — invoices should reflect customer state at creation time for legal/audit purposes.

However, `orders.party_name` and `inventory_items.party_name` are denormalized without clear documentation of intent. If they are meant to be immutable snapshots (like invoices), that should be documented. If they are meant to track current state, they should be foreign keys.

Enterprise-grade benchmark:

- fix the INTEGER/NUMERIC type mismatch in `stock_operations` and `inventory_items.box_count`
- fix the `::INTEGER` cast in `create_invoice_with_items()` to `::NUMERIC`
- scope RLS to `business_id` or `auth.uid()` on all tables
- remove public SELECT on master data tables
- resolve migration 015 numbering conflict
- add composite indexes for top 5 screen-load queries
- add `supabase gen types typescript` to CI for type-schema synchronization
- document rollback procedures for destructive migrations
- document denormalization intent for `orders.party_name` and `inventory_items.party_name`

---

## Part XI: Memory Lifecycle & App Stability

### 41. Timer and Listener Cleanup Is Mostly Excellent

The codebase handles cleanup correctly in the vast majority of cases:

- **AppState listeners**: `useNetworkStatus.ts:32-40` and `ShellRootProviders.tsx:32-40` both properly `subscription.remove()` in useEffect cleanup
- **Keyboard listeners**: `Toast.tsx:108-119` cleans up both `keyboardDidShow` and `keyboardDidHide` subscriptions
- **Navigation listeners**: `useConfirmBack.ts:15-31` returns `unsubscribe` from `navigation.addListener('beforeRemove', ...)`
- **Timers**: `useNetworkStatus` clears its `setInterval` via ref. `Toast` clears its auto-dismiss `setTimeout`. `useDebounce` clears on every value change. `SearchFilterWorkspace` cleans up 3 separate timers (search delay, progress interval, finish timer) — all correctly handled
- **Image memory**: `Avatar.tsx:92-99` uses `expo-image` with `cachePolicy="memory-disk"` and `recyclingKey={source}` for list virtualization — correct pattern

### 42. Module-Level EventBus Subscriptions Never Unsubscribe

Six stores subscribe to the event bus at module scope, outside any React lifecycle:

| Store                  | Line              | Events                                                 |
| ---------------------- | ----------------- | ------------------------------------------------------ |
| `customerStore.ts`     | 211-221           | `INVOICE_CREATED`, `PAYMENT_RECORDED`                  |
| `dashboardStore.ts`    | 61-70             | `INVOICE_CREATED`, `PAYMENT_RECORDED`, `STOCK_CHANGED` |
| `invoiceStore.ts`      | 144-160           | `PAYMENT_RECORDED`                                     |
| `financeStore.ts`      | 244-250           | `PAYMENT_RECORDED`, `EXPENSE_CREATED`                  |
| `notificationStore.ts` | 81-85             | `STOCK_CHANGED`                                        |
| `inventoryStore.ts`    | (similar pattern) | `STOCK_CHANGED`                                        |

The event bus (`src/events/appEvents.ts:17-22`) correctly returns an unsubscribe function, but all six stores ignore it:

```typescript
// What happens (customerStore.ts:211)
eventBus.subscribe((event) => { ... });  // return value discarded

// What should happen
const unsub = eventBus.subscribe((event) => { ... });
// ... unsub() on teardown
```

In a React Native app where modules are never truly unloaded, this is technically safe during normal operation. But it is architecturally wrong: business logic (which events trigger which refetches) is encoded as global side effects of importing a store module. This makes behavior invisible to tests, impossible to reason about during debugging, and will cause duplicate handlers if React Native's Fast Refresh reloads a store module during development.

### 43. Auth Subscription Has No Teardown

`authStore.initialize()` calls `authService.onAuthStateChange(...)` which returns a subscription object with an `unsubscribe()` method (confirmed by test mock at `authStore.test.ts:30`). The store never captures this return value. The same `initialize()` is called from `ShellAuthGate` on mount and from the shell environment on app resume.

While the current call graph likely avoids duplication most of the time, the design has no structural guarantee against double-subscription and no explicit teardown path.

### 44. FlatList Virtualization Is Properly Configured

`VirtualizedList.tsx` provides well-tuned defaults:

- `estimatedItemSize = 72` (good default for list items)
- `initialNumToRender = 8` (reasonable initial batch)
- `maxToRenderPerBatch = 8` (prevents overloading the JS thread)
- `windowSize = 5` (keeps 5 screens of items in memory)
- `removeClippedSubviews={true}` on both SectionList and FlashList
- `onEndReachedThreshold={0.35}` (triggers load-more at 35% from bottom)

The design system uses `@shopify/flash-list` which has better recycling and lower memory footprint than the standard FlatList.

### 45. Offline Write Queue Is Strong But Has Edge Cases

`src/services/writeQueueService.ts` is one of the best-engineered subsystems in the codebase:

- Idempotency keys prevent duplicate operations
- Exponential backoff (`[1, 3, 9]` seconds)
- Dead-letter queue for permanently failed mutations
- Queue size limit (`MAX_QUEUE_SIZE = 500`) with error thrown when full
- Priority-based replay ordering
- Deduplication by idempotency key before replay

Remaining edge cases:

- **Non-atomic queue operations**: AsyncStorage read (line 115) and write-back (line 178) are not atomic. Another process could modify the queue between operations. In practice, React Native is single-threaded, but background task extensions or concurrent service workers could violate this assumption.
- **No storage overflow handling**: If AsyncStorage quota is exceeded during `writeQueue()`, the error is not caught at the queue level
- **No Zustand store schema migration**: Stores persist to AsyncStorage via `zustand/middleware`. If the store schema changes between app versions, old persisted data could cause runtime errors on app launch. No migration strategy exists.
- **No automatic cleanup of stale data**: Dead-letter queue items persist indefinitely. Old cached data in stores has no TTL or eviction strategy.

Enterprise-grade benchmark:

- move eventBus subscriptions into a dedicated orchestration layer with explicit lifecycle management, or into React lifecycle hooks
- capture and store the auth subscription for explicit teardown on logout
- add Zustand store version numbers and migration functions for schema evolution
- add TTL-based cleanup for dead-letter queue items (e.g., 7 days)
- surface queue-full and dead-letter conditions to users and telemetry
- document the single-threaded assumption that makes non-atomic queue operations safe

---

## Part XII: Dependency Supply Chain

### 46. Direct Dependencies Are Current

All major dependencies are on current or recent versions:

- React 19.1.0, React Native 0.81.5, Expo 54.0.0 — all latest
- Zustand 5.0.12, Zod 4.3.6, date-fns 4.1.0 — all current
- @supabase/supabase-js 2.99.3 — latest
- i18next 25.10.4, react-hook-form 7.72.0, lucide-react-native 0.577.0 — all current

The monorepo structure (`workspaces: ["src/design-system", "src/ui-shell", "examples/*"]`) with `file:` protocol references is correct for local package development.

### 47. Transitive Dependencies Carry Unpatched Vulnerabilities

28 known vulnerabilities exist in the dependency tree. The most concerning:

- **XLSX/SheetJS** (`xlsx@^0.18.5`): Prototype pollution + ReDoS. **No fix available** — the package is no longer maintained. This is a direct dependency that needs replacement (consider `exceljs` or `xlsx-populate`).
- **Handlebars.js**: JavaScript injection via AST type confusion. Transitive dependency with no fix in chain. Assess whether Handlebars is actually needed at runtime or only in dev tooling.
- **xmldom**: 5 high-severity vulnerabilities (XML injection, uncontrolled recursion DoS). Transitive dependency.

### 48. No Automated Dependency Hygiene

- No Dependabot, Renovate, or similar bot configured
- No `npm audit` in CI pipeline
- No lockfile integrity verification in CI
- `--legacy-peer-deps` used in all 7 CI install steps, suppressing peer dependency conflicts

This means security patches require manual intervention, and the team has no automated signal when new vulnerabilities are disclosed in their dependency tree.

Enterprise-grade benchmark:

- replace XLSX/SheetJS with a maintained alternative
- add `npm audit --audit-level=high` to CI (fail build on high/critical)
- add Dependabot with weekly schedule for security updates
- run `npm audit fix` to resolve lodash and forge vulnerabilities immediately
- audit the Handlebars transitive chain to determine if it can be excluded
- document why `--legacy-peer-deps` is required and which specific conflicts it masks

---

## Part XIII: Empirical Performance Profile

This section provides the closest-to-measured data achievable from static analysis. It catalogs concrete re-render triggers, startup costs, and computational waste with exact counts.

### 49. Invoice List Screen Re-Render Budget

`app/(app)/(tabs)/invoices.tsx` is one of the highest-traffic screens. On every render cycle it recreates:

| Category                                               | Count | Evidence                                                                                             |
| ------------------------------------------------------ | ----: | ---------------------------------------------------------------------------------------------------- |
| Inline arrow functions (new reference per render)      |    12 | Lines 86, 91, 159, 246, 272, 322, 358, 371, 402 + 3 inside renderItem                                |
| Inline style objects (not from `StyleSheet.create`)    |    11 | Lines 151, 166, 220, 230, 232, 263, 310, 328, 359, 361, 370                                          |
| Store state reads (each a potential re-render trigger) |     3 | Lines 72-77: `invoices`, `loading`, `fetchInvoices` from `useInvoiceStore`                           |
| Inline `keyExtractor` lambdas                          |     2 | Lines 258, 290 (date chips, status chips) — invoice list FlatList keyExtractor at line 351 is stable |

Memoization present: `useCallback` × 1 (line 91: `handleRefresh`), `useMemo` × 2 (lines 101: `filtered`, 133: `monthlySummary`). `React.memo` is NOT used on the component itself.

FlatList configuration at lines 349-357: `initialNumToRender={10}`, `windowSize={5}`, `maxToRenderPerBatch={10}`. Missing: `getItemLayout` (forces layout measurement per item) and `removeClippedSubviews`.

**Estimated per-render cost**: 12 new function allocations + 11 new style objects + FlatList diffing without stable item layout = non-trivial GC pressure on lists with 50+ items.

### 50. Dashboard Screen Inline Allocations

`app/(app)/(tabs)/index.tsx` creates the following on every render without memoization:

- Lines 92-121: `quickActions` array (4 objects) — **not wrapped in `useMemo`**
- Lines 123-152: `dashboardStats` array (4 objects) — **not wrapped in `useMemo`**
- Line 155: `recentInvoices = invoices.slice(0, 5)` — creates a new array every render

Store subscriptions: 4 distinct state reads (lines 76-84: `invoices`, `fetchInvoices` from invoiceStore; `stats`, `loading`, `fetchStats` from dashboardStore). Each subscription is a re-render trigger.

Inline arrow functions: 4 (lines 159, 225, 254-256).

**Impact**: Every store update (from background data refresh, event bus reactions, or foreground resume warmup) forces dashboard to re-render, recreating 8+ objects and slicing a new array.

### 51. LineItemsStep Computes on Every Keystroke

`src/features/invoice-create/LineItemsStep.tsx` lines 60-68 perform subtotal, GST, and grand total calculations inline:

```
const subtotal = lineItems.reduce((acc, item) => {
  const lineSubtotal = item.quantity * item.rate_per_unit - (item.discount || 0);
  return acc + lineSubtotal;
}, 0);

const gst = lineItems.reduce((acc, item) => {
  const lineSubtotal = item.quantity * item.rate_per_unit - (item.discount || 0);
  return acc + lineSubtotal * (item.gst_rate / 100);
}, 0);

const grandTotal = subtotal + gst;
```

Problems:

1. `lineSubtotal` is computed identically in both `reduce` calls — duplicate work per line item
2. Neither `subtotal` nor `gst` are wrapped in `useMemo`
3. Every keystroke in any field (quantity, rate, discount) triggers a full re-render → both reduces re-execute over all line items
4. For 10 line items: ~20 arithmetic operations per keystroke. For 50 line items (bulk invoice): ~100 operations per keystroke.

No `useCallback` or `React.memo` is used on `LineItemsStep`.

### 52. forwardRef Without React.memo: 39 of 51 Molecules

The design system's molecule layer has 51 components. 39 use `forwardRef` without `React.memo`:

Affected components include: `ListItem`, `FormField`, `SearchBar`, `ActionMenuSheet`, `BottomSheetPicker`, `CollapsibleSection`, `ConfirmationModal`, `DataChart`, `DatePickerField`, `DeclarativeForm`, `FileUploadField`, `FilterBar`, `FormSection`, `FormWizard`, `PaginatedList`, `Popover`, `SegmentedControl`, `SettingsCard`, `SkeletonBlock`, `SkeletonRow`, `SortableList`, `StatCard`, `SwipeableRow`, `TableRow`, `Tabs`, `TextAreaField`, `Toast`, `Tooltip`, `VirtualizedList`, and others.

Because `forwardRef` components do not benefit from React's default bailout optimization, every parent re-render cascades through these children unconditionally. This is the single highest-leverage performance fix: wrapping the top 10 most-used molecules in `React.memo` would eliminate the majority of unnecessary re-renders across the entire app.

### 53. App Startup Sequence and API Call Budget

The full startup path makes 8 API calls in two phases:

**Critical path** (blocks first meaningful paint) — `app/(app)/_layout.tsx` lines 19-24:

```
await Promise.allSettled([
  useDashboardStore.getState().fetchStats(),      // 1. RPC: get_dashboard_stats_v1
  useInventoryStore.getState().fetchItems(true),   // 2. Query: inventory_items (page 1)
]);
```

**Deferred path** (after InteractionManager) — lines 27-33:

```
InteractionManager.runAfterInteractions(() => {
  void Promise.allSettled([
    useInvoiceStore.getState().fetchInvoices(1),       // 3. Query: invoices (page 1)
    useCustomerStore.getState().fetchCustomers(true),  // 4. Query: customers
    useFinanceStore.getState().initialize(),            // 5-7. Three parallel queries: expenses, purchases, P&L
    useOrderStore.getState().fetchOrders(),             // 8. Query: orders
  ]);
});
```

Prior to both phases, `app/_layout.tsx` calls `useAuthStore.initialize()` which makes 1 auth API call (`getSession()`) and registers the auth state listener.

**Total**: 1 auth call + 2 critical-path calls + 6 deferred calls = **9 API calls at startup**. All deferred calls execute regardless of which tab the user navigates to. The hidden `customers` tab (with `href: null` in the tab layout) still triggers `fetchCustomers`.

### 54. Query Timing Instrumentation Exists But Is Not Aggregated

`src/repositories/baseRepository.ts` logs query timing on every database call:

```typescript
const start = performance.now();
// ... execute query ...
logger.info('db_query', {
	table: tableName,
	op: 'findMany',
	duration_ms: Math.round(performance.now() - start),
});
```

This is good infrastructure. However, these timings are only written to console (dev-only for `logger.info`). There is no aggregation, no p50/p95 tracking, no slow-query alerting, and no production sink. The data exists but is not actionable.

Enterprise-grade benchmark: aggregate query durations per table and operation into a dashboard, set alerts for p95 > 500ms, and trace slow queries back to screen load events.

---

## Part XIV: Screen Reader Walkthrough (Static VoiceOver/TalkBack Audit)

This section catalogs concrete accessibility issues that would be discovered during an actual VoiceOver (iOS) and TalkBack (Android) device walkthrough, identified through structural analysis of the view hierarchy, focus management, and semantic annotation.

### 55. Focus Management Gaps

**ActionMenuSheet has no initial focus on open:**

`src/design-system/components/molecules/ActionMenuSheet.tsx` lines 50-94 — when the sheet opens, there is no `setAccessibilityFocus()` call. Screen reader users open the menu and focus is undefined; they must swipe to discover the first action. Compare with `ConfirmationModal` (line 136) and `BottomSheetPicker` (line 250-251) which both correctly set focus on open.

**Post-delete focus is undefined:**

`app/(app)/settings/item-categories.tsx` lines 141-161 — after deleting a category via `Alert.alert()`, the category list reloads but focus is not restored to a predictable element. Screen reader users lose their place in the list.

**Invoice creation success has no announcement:**

`src/features/invoice-create/useInvoiceCreateFlow.ts` line 158 — after successful creation, `router.replace()` navigates to the invoice detail screen. There is no Toast or `announceForScreenReader()` call before navigation, so screen reader users have no confirmation that creation succeeded before the screen changes.

### 56. Missing Semantic Structure on App Screens

**FormSection missing group role:**

`src/design-system/components/molecules/FormSection.tsx` line 33 — the wrapper `<View>` has no `accessibilityRole="group"` or `accessibilityLabel`. Form sections like "Basic Info", "Pricing", "GST Details" are visually grouped but semantically flat. VoiceOver reads each field independently without announcing section boundaries.

**Dashboard stats grid has no region role:**

`app/(app)/(tabs)/index.tsx` lines 191-203 — four `StatCard` components are in a flex-wrapped grid with no parent `accessibilityRole="region"` or `accessibilityLabel="Daily Summary"`. VoiceOver reads 4 separate cards without understanding they form a summary group.

**Settings screen rows lack group context:**

`app/(app)/settings/index.tsx` lines 135-183 — settings rows are `Pressable` with `accessibilityRole="button"`, but rows within a section (e.g., "Business", "Preferences") are not wrapped in an `accessibilityRole="group"` container. Screen reader users cannot distinguish which section a setting belongs to.

**Recent activity list not announced as a list:**

`app/(app)/(tabs)/index.tsx` lines 249-333 — transaction items are in a `Card` with multiple `View` elements, but there is no parent announcing "Recent Activity, list of 5 transactions". Each transaction is read independently.

### 57. Unlabeled Destructive and Interactive Icons

**Delete/edit icons in item-categories screen:**

`app/(app)/settings/item-categories.tsx` lines 188-193 — `<Pressable onPress={() => handleDelete(item)}>` wraps a `<Trash2>` icon with NO `accessibilityLabel` or `accessibilityRole`. VoiceOver announces "Button" with no indication that this is a destructive delete action. The edit icon (`Pencil`) on the same line has the same problem.

**Inventory add chip groups:**

`app/(app)/inventory/add.tsx` lines 108-127 — `<TouchableOpacity onPress={() => onChange(opt)}>` wraps category/unit chips with NO `accessibilityLabel`, `accessibilityRole`, or `accessibilityState`. VoiceOver reads the chip text ("Glossy", "Matt", "Floor") as generic buttons without indicating they are selection options or which is currently selected.

**Dashboard transaction icons:**

`app/(app)/(tabs)/index.tsx` lines 44-60 — `getTransactionIcon()` returns lucide icons with no accessibility label. In transaction rows (line 303), VoiceOver encounters an unlabeled image node, losing the semantic meaning (payment in, payment out, invoice).

**Invoice detail kebab menu:**

`app/(app)/invoices/[id].tsx` lines 279-285 — `accessibilityLabel="more-options"` uses an ID-style label. VoiceOver reads "more-options, button" instead of "More actions" or "Options menu".

### 58. Helper Text and Contrast Gaps

**FormField helper text is invisible to screen readers:**

`src/design-system/components/molecules/FormField.tsx` line 99 — non-error helper text (e.g., "e.g. format: XXXXXXXXXXXXXX for GSTIN") is marked `importantForAccessibility="no"`. While the error state correctly uses `accessibilityRole="alert"` (line 90), helper text that provides input guidance is entirely missing from the accessibility tree.

**Disabled button contrast is theme-dependent and unverified:**

`src/design-system/components/atoms/Button.tsx` lines 240-304 — disabled buttons use `backgroundColor: c.surfaceVariant` and text color `c.placeholder`. No explicit contrast check exists in the test suite for the disabled state. The existing `contrastPolicy.test.ts` validates primary/surface/error colors but does not test `surfaceVariant` vs `placeholder` (the disabled combination). If the theme has low contrast between these two tokens, disabled buttons fail WCAG 3:1.

### 59. Pagination and Dynamic Content Announcements

**No refresh or load-more announcements on lists:**

`app/(app)/(tabs)/invoices.tsx` lines 349-356 — the FlatList has `refreshing` and `onRefresh` props, but when pull-to-refresh completes or `onEndReached` loads more items, there is no `announceForScreenReader()` call. Screen reader users receive no feedback that the list was refreshed or that new items are available.

**No announcement for network status changes:**

`src/hooks/useNetworkStatus.ts` — when the network status changes (online → offline or vice versa), there is no screen reader announcement. The status bar may update visually, but VoiceOver/TalkBack users are unaware the app has gone offline until their next action fails.

Enterprise-grade benchmark:

- add `setAccessibilityFocus()` to `ActionMenuSheet` on open
- add `accessibilityRole="group"` to `FormSection` wrapper with section title as label
- add `accessibilityLabel` to all icon-only `Pressable` elements, especially destructive actions
- add `accessibilityRole`, `accessibilityState`, and `accessibilityLabel` to chip group selections
- make helper text accessible (remove `importantForAccessibility="no"` or include in field hint)
- add disabled-state contrast validation to `contrastPolicy.test.ts`
- announce list refresh completion and load-more events
- announce network status transitions for screen reader users
- test the top 5 user journeys with VoiceOver on iOS and TalkBack on Android quarterly

---

## Part XV: Threat Model (STRIDE + OWASP Mobile Top 10)

This section maps the codebase against the STRIDE threat taxonomy and OWASP Mobile Top 10 (2024), with concrete code evidence for each finding.

### 60. STRIDE Analysis

#### Spoofing

| Threat                                            | Severity | Evidence                                                                    | Notes                                                                                         |
| ------------------------------------------------- | -------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| JWT tokens stored in unencrypted AsyncStorage     | CRITICAL | `src/config/supabase.ts:27` — `storage: AsyncStorage`                       | Rooted device or backup extraction → full auth bypass                                         |
| Anon key embedded in app binary                   | MEDIUM   | `src/config/supabase.ts:5` — `EXPO_PUBLIC_SUPABASE_ANON_KEY`                | Public by Expo convention; impact depends on RLS correctness                                  |
| No certificate pinning                            | MEDIUM   | No pinning config in codebase                                               | MITM on Supabase API is feasible on compromised networks                                      |
| OTP verification has no client-side rate limiting | HIGH     | `src/services/authService.ts:73-81` — `verifyOtp()` with no attempt counter | 6-digit SMS OTP is brute-forceable; rate limiting depends entirely on Supabase backend config |
| Refresh token also in AsyncStorage                | HIGH     | `src/config/supabase.ts:27` — `persistSession: true`                        | Compromised refresh token = indefinite session hijacking                                      |

#### Tampering

| Threat                                                                     | Severity | Evidence                                                                                                                                          | Notes                                                                                                        |
| -------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Offline mutation queue has no integrity signatures                         | CRITICAL | `src/services/writeQueueService.ts:73-89` — plain JSON with no HMAC                                                                               | Attacker on rooted device can modify queued mutations (change invoice amounts, stock quantities) before sync |
| Invoice data is client-controlled with no server-side payload verification | HIGH     | `src/services/invoiceService.ts:50-144` — `amount_paid`, totals, GST all computed client-side                                                     | If network MITM occurs (no cert pinning), amounts can be modified in transit                                 |
| AsyncStorage data modifiable on rooted/jailbroken device                   | HIGH     | All `zustand/persist` stores — `invoiceStore.ts:133-139`, `customerStore.ts:199-205`, `inventoryStore.ts`, `financeStore.ts`, `dashboardStore.ts` | Cached invoice, customer, and financial data readable and writable                                           |
| `escapeLike()` only escapes ILIKE wildcards, not column names              | LOW      | `src/repositories/baseRepository.ts:24-27` — escapes `%`, `_`, `\` only                                                                           | PostgREST layer provides additional protection; current code is safe but lacks defense-in-depth              |

#### Repudiation

| Threat                                                      | Severity | Evidence                                                                                                       | Notes                                                                                                                                     |
| ----------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Audit triggers only on 4 of 19 tables                       | MEDIUM   | `supabase/migrations/014_audit_log.sql:35-46` — triggers on invoices, payments, inventory_items, expenses only | Missing: customers, suppliers, stock_operations, business_profile, purchases, purchase_line_items — changes to these leave no audit trail |
| Audit log has no tamper-evident chain                       | LOW      | `audit_log` uses `BIGSERIAL` PK with no hash chain linking entries                                             | Sophisticated attacker with DB access could delete entries without detection                                                              |
| Audit insert policy allows any authenticated user to insert | LOW      | `supabase/migrations/015_fix_audit_log_rls.sql:5-8` — `WITH CHECK (true)`                                      | Trigger handles normal logging, but policy allows manual fake entries                                                                     |

#### Information Disclosure

| Threat                                             | Severity | Evidence                                                                                         | Notes                                                                                                                     |
| -------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| All business data cached in plaintext AsyncStorage | CRITICAL | All `zustand/persist` configurations (see Tampering section)                                     | JWT tokens, invoices, customers (including phone, GSTIN), financial metrics, offline mutation payloads — all in plaintext |
| Logger has no PII sanitization                     | HIGH     | `src/utils/logger.ts:9-26` — `meta` parameter logged without filtering                           | When wired to Sentry/Datadog (TODO on line 24), PII will be sent to third party without redaction                         |
| Supabase error messages may leak schema            | MEDIUM   | `src/errors/AppError.ts:72-123` — raw Postgres error `message` is captured in `AppError.message` | Internal error messages contain table/column names                                                                        |
| RLS `USING (true)` on all tables                   | MEDIUM   | `supabase/migrations/007_views_functions_rls.sql:195`                                            | Any authenticated user sees all data; no row-level isolation                                                              |
| Deep link parameters not validated                 | MEDIUM   | `app.json:5` — custom schemes `easystock://`, `easydesign://`                                    | Crafted URIs could inject unexpected parameters into screens                                                              |
| No data cleanup on logout                          | HIGH     | `src/stores/authStore.ts:101-108` — `logout()` clears auth state but NOT AsyncStorage            | After sign-out, all cached business data remains on device                                                                |

#### Denial of Service

| Threat                                     | Severity | Evidence                                                                                                                                                                  | Notes                                                                                            |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Offline queue capped at 500 entries        | MEDIUM   | `src/services/writeQueueService.ts:24` — `MAX_QUEUE_SIZE = 500`                                                                                                           | 500 × ~200 bytes = ~100 KB; not a storage DoS but blocks legitimate offline operations when full |
| No max page size validation on API queries | MEDIUM   | `inventoryService.ts:16`, `invoiceService.ts:13`, `customerService.ts:17` — `pageSize` parameter has no upper bound                                                       | Bypass UI to request `pageSize=10000` → large JSON response → memory pressure                    |
| Materialized view refresh in RPC hot path  | LOW      | `supabase/migrations/021_refresh_summaries_in_rpcs.sql` — `refresh_ledger_summaries()` called in `create_invoice_with_items()` and `record_payment_with_invoice_update()` | Concurrent invoice creation can cause lock contention on materialized view refresh               |

#### Elevation of Privilege

| Threat                                      | Severity | Evidence                                                                                                     | Notes                                                                                                 |
| ------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| No RBAC — single `authenticated` role       | MEDIUM   | `supabase/migrations/007_views_functions_rls.sql:195` — all authenticated users have full CRUD on all tables | Acceptable for single-user app; becomes critical if multi-user is ever added                          |
| `audit_trigger_fn()` is SECURITY DEFINER    | MEDIUM   | `supabase/migrations/014_audit_log.sql:33`                                                                   | Function runs with owner privileges (usually `postgres`); no `SET search_path` limiting schema access |
| Service role key accessible in seed scripts | HIGH     | `scripts/test-seed-reset.mjs` hydrates service role key via Supabase CLI                                     | Service role key bypasses RLS entirely; must never leak to client or version control                  |

### 61. OWASP Mobile Top 10 (2024) Mapping

| OWASP Category                                | Status   | Key Evidence                                                                                                                                                                 |
| --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M1: Improper Credential Usage**             | CRITICAL | JWT tokens in AsyncStorage (`supabase.ts:27`); anon key in app binary; no cert pinning; offline mutations unsigned                                                           |
| **M2: Inadequate Supply Chain Security**      | HIGH     | 28 npm vulnerabilities (1 critical); no `npm audit` in CI; `--legacy-peer-deps` on all installs; no Dependabot/Renovate                                                      |
| **M3: Insecure Authentication/Authorization** | HIGH     | OTP brute-force feasible (no client rate limit); no MFA; single-factor auth; RLS `USING(true)`                                                                               |
| **M4: Insufficient Input/Output Validation**  | MEDIUM   | Zod validation at service boundaries is good; `escapeLike()` is adequate; sort column names not whitelisted; deep link params not validated                                  |
| **M5: Insecure Communication**                | MEDIUM   | TLS via Supabase (good); no certificate pinning (gap); error messages may leak schema                                                                                        |
| **M6: Inadequate Privacy Controls**           | HIGH     | Full invoice/customer objects cached in plaintext; no cache TTL; PII (phone, GSTIN) persisted without encryption; logger has no PII redaction; no data cleanup on logout     |
| **M7: Insufficient Binary Protections**       | MEDIUM   | React Native bundle not obfuscated; `expo-dev-client` plugin declared in `app.json` (may be active in production build depending on EAS config); no root/jailbreak detection |
| **M8: Security Misconfiguration**             | CRITICAL | AsyncStorage for auth tokens instead of SecureStore; audit log RLS allows insertion by any authenticated user; `SECURITY DEFINER` without `SET search_path`                  |
| **M9: Insecure Data Storage**                 | CRITICAL | All sensitive data in plaintext AsyncStorage — JWT tokens, offline mutations, invoices, customers, financial metrics. No encryption at rest. No cleanup on logout.           |
| **M10: Insufficient Cryptography**            | HIGH     | No HMAC on offline mutations; idempotency key is UUID (not cryptographically bound to payload); no encrypted storage; relies entirely on TLS for transport security          |

### 62. Threat Model Summary

**Attack surface priority** (ordered by real-world exploitability for a business app on a user's phone):

1. **Device theft / rooted device** → All AsyncStorage data is readable and writable. JWT tokens enable full API access. Offline mutation queue can be tampered to commit fraudulent transactions on next sync. No data cleanup on logout means a previously-signed-out device still holds all business data.

2. **Network MITM** → No certificate pinning means an attacker on a compromised WiFi network can intercept Supabase API calls. Combined with client-controlled invoice data (amounts, payment status), this enables transaction modification in transit.

3. **OTP brute force** → 6-digit SMS OTP with no client-side rate limiting. Server-side rate limiting depends on Supabase configuration (not verified in code). SMS interception via SIM swap or carrier compromise is a known attack vector for Indian mobile users.

4. **Insider/employee threat** → Incomplete audit logging (only 4 of 19 tables) means customer deletions, supplier changes, and business profile modifications leave no trail. No RBAC means every authenticated user has full CRUD on all tables.

5. **Supply chain compromise** → 28 known vulnerabilities including 1 critical (Handlebars) and XLSX with no fix available. No automated scanning to detect new disclosures.

Enterprise-grade benchmark:

- migrate auth token storage from AsyncStorage to `expo-secure-store`
- sign offline mutations with HMAC using a device key stored in Keychain/SecureStore
- add certificate pinning for Supabase endpoints
- add client-side OTP attempt limiting (5 attempts per 15 minutes)
- clear all AsyncStorage business data on logout
- add PII redaction to logger before wiring to external sink
- extend audit triggers to all 19 tables
- add root/jailbreak detection with user warning
- validate max page size on API query parameters
- whitelist allowed sort column names in Zod schemas

---

## What I Would Tell Leadership

This repo is not suffering from lack of engineering effort. It is suffering from too much effort being spent in the wrong architectural layer.

Today, the system is paying a tax for:

- route files bypassing the intended abstraction stack
- unclear boundaries
- unfinished mock-backed product surfaces
- duplicated enforcement
- too many custom process artifacts
- too much environment-specific behavior
- brittle auth/session lifecycle ownership
- inconsistent runtime error handling
- silent failure modes in critical paths (config, queue, stores)
- missing production telemetry for critical paths
- incomplete security features that create false confidence
- 40+ hardcoded strings undermining the i18n investment
- zero security scanning in CI despite 28 known vulnerabilities (1 critical)
- a database type mismatch that silently truncates fractional quantities during stock operations
- local test credentials handled through unmanaged `.env.test` conventions and no secret scanning
- module-level event subscriptions with no lifecycle management
- no automated dependency update pipeline

The next 10% of product complexity will likely cost more than it should, not because the app logic is uniquely hard, but because the surrounding governance surface is already expensive and the runtime code has patterns that will compound into real bugs at scale.

The good news is that this is fixable. The repo already contains the intent, discipline, and quality instincts needed. What it lacks is consolidation, sharper boundaries, and a stronger distinction between platform mechanisms and product code.

---

## Bottom Line

This is a quality-conscious codebase with platform ambitions that has outgrown its current control strategy.

The architectural mess is not random. It is the predictable outcome of trying to enforce enterprise-grade discipline through:

- ad hoc scripts instead of platform tooling
- regex scanning instead of real package boundaries
- contract tests over source text and docs instead of structural enforcement
- broad global test harnesses instead of layered, hermetic test setup
- hybrid package boundaries that require constant policing
- route-level convenience shortcuts that bypass the intended abstraction stack
- unfinished mock-backed product surfaces shipped in live navigation
- inconsistent error handling across services and stores
- type-cast escape hatches at service boundaries

And the expansion reveals additional dimensions:

- strong accessibility foundations in the design system that app screens don't fully inherit
- solid i18n infrastructure undermined by 40+ hardcoded strings and untranslatable error messages
- a sound CI pipeline with zero security scanning despite 28 known vulnerabilities
- a database schema with a critical type mismatch silently corrupting stock quantities
- proper timer/listener cleanup in React hooks but unmanaged module-level store subscriptions
- current dependencies but no automated hygiene to keep them that way

The right next step is not "write even more guardrails." The right next step is:

1. **Fix the data bug** — the INTEGER/NUMERIC stock truncation is losing real inventory data today
2. **Add security scanning** — `npm audit` in CI is a 5-minute change that exposes 28 vulnerabilities
3. **Codify secret handling** — keep `.env.test` ignored, introduce `.env.example`, move CI credentials to secrets management, and add secret scanning
4. **Simplify the stack** — harden runtime boundaries, complete or hide unfinished surfaces
5. **Close the i18n gap** — extract hardcoded strings, translate error messages
6. **Add operational feedback loops** — telemetry, alerts, dependency updates

The codebase has the intent, discipline, and quality instincts to be enterprise-grade. What it needs is consolidation, the courage to delete governance artifacts that don't carry their weight, and focused effort on the structural gaps that actually put users and data at risk.
