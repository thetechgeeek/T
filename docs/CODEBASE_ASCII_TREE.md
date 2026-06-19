# Codebase Map

A navigable map of every tracked folder and notable file in this repository, rewritten 2026-04-20 with grounded descriptions instead of templated one-liners. Because it is built from tracked paths, vendor/cache directories (`node_modules/`, `.git/`, `.expo/`, `coverage/`, `dist/`, `ios/Pods/`), local editor folders (`.claude/`, `.vscode/`), and diagnostic dumps (`lint_results.json`, `test_report.txt`) are intentionally out of scope.

**On disk:** 390 folders, 1043 files.

---

## What this app is

An Expo (React Native 0.81 / React 19) + Supabase business-management app targeted at Indian SMBs. Core domains:

- **GST-aware invoicing** (invoice, credit notes, estimates, purchase orders, line-item tax)
- **Inventory** (items, stock operations, imports, low-stock notifications, batch/serial)
- **Customer & supplier** ledgers with aging and party statements
- **Finance** (payments in/out, cash, bank accounts, cheques, e-wallets, loans, expenses, purchases, profit/loss, transfers)
- **Reports** (GSTR-1, GSTR-3B, day book, balance sheet, cashflow, item/party profit, etc.)
- **Governance** (business profile, firms, item categories/units, users, security, FY close)

**Stack:** Expo Router, Zustand (+ `immer`, `persist`), React Hook Form + Zod, Supabase JS (auth, Postgres RPC, storage, edge functions), i18next (en/hi with RTL diagnostics), Lucide icons, `@shopify/flash-list`, Reanimated 4, Gesture Handler, `react-native-keyboard-controller`, `expo-local-authentication`, CSV import/export utilities, `date-fns`.

**Architecture:** `app/` routes → `src/stores/` (Zustand) → `src/services/` (business rules) → `src/repositories/` (Supabase access) → `supabase/` (SQL schema, migrations, RPCs). A parallel governed `src/design-system/` supplies all reusable UI and lives behind lint + contract tests.

**Quality gate:** `npm run validate` runs Prettier → `tsc --noEmit` → hex-color check → route-collision check → runtime/target architecture checks → i18n checks → token usage check → design-system/UI-shell/workspace guardrails → ESLint → Jest unit. Husky wires this into `pre-push`; GitHub Actions runs the same source gates in its `validate` job, then runs real Supabase coverage separately in `backend-integration`.

---

## Top-level layout

- [`__mocks__/`](#mocks) — top-level Jest module mocks
- [`__tests__/`](#tests) — cross-cutting app test suites (unit, integration, visual, a11y)
- [`.github/`](#github) — GitHub Actions CI
- [`.husky/`](#husky) — Git hooks
- [`.maestro/`](#maestro) — Maestro E2E mobile flows
- [`app/`](#app) — Expo Router screens (production routes)
- [`artifacts/`](#artifacts) — checked-in proof artifacts (native screenshot baselines)
- [`assets/`](#assets) — launcher icons and splash
- [`docs/`](#docs) — engineering, design, and QA documentation (this file lives here)
- [`scripts/`](#scripts) — repo automation (token generation, guardrails, visual regression)
- [`src/`](#src) — all TypeScript source (screens, design system, services, stores, theme, i18n, utils)
- [`supabase/`](#supabase) — backend schema: migrations, RPC SQL tests, edge functions
- [Root files](#root-files) — tooling configuration and manifests

---

## `__mocks__/` <a id="mocks"></a>

Jest discovers these at the repo root and uses them as automatic module replacements.

- `empty.js` — no-op stand-in for modules that are irrelevant to tests but would otherwise break Jest's module resolver.

---

## `__tests__/` <a id="tests"></a>

The cross-cutting suite. Module-scoped tests live in `__tests__/` folders next to their source (inside `src/…` and `app/components/…`); this top-level folder holds everything that spans modules or screens.

- `accessibility/` — axe-style screen tests for the highest-traffic surfaces.
    - `customerDetail.test.tsx`, `customerList.test.tsx`, `dashboard.test.tsx`, `inventory.test.tsx`, `invoiceCreate.test.tsx`.
- `chain/` — multi-step workflow tests that stitch store → service → repository together end-to-end in-memory.
    - `invoiceCreationChain.test.ts`, `paymentRecordingChain.test.ts`, `stockOperationChain.test.ts`, `workflow.test.ts`.
- `components/` — variant-matrix smoke tests for shared app-level primitives: `Button.variant.test.tsx`, `TextInput.variant.test.tsx`.
- `cross-screen/` — regressions that verify side-effects propagate between screens (invoice → customer list/ledger, payment → invoice status, item detail → stock sync, filter race conditions).
    - `invoiceCreate-to-customerList.test.tsx`, `invoiceCreate-to-invoiceList.test.tsx`, `InvoiceToCustomerLedger.test.ts`, `itemDetail-stockSync.test.tsx`, `payment-to-customerDetail.test.tsx`, `payment-to-invoiceStatus.test.tsx`, `PaymentToFinance.test.ts`, `setFilters-race-condition.test.tsx`, `StockUpdateSync.test.ts`.
- `fixtures/` — reusable factory data: `authFixtures.ts`, `customerFixtures.ts`, `financeFixtures.ts`, `inventoryFixtures.ts`, `invoiceFixtures.ts`, `orderFixtures.ts`, `paymentFixtures.ts`.
- `integration/` — runs under `jest.integration.config.js` (single worker). Each file exercises one vertical slice against a stubbed Supabase.
    - `authFlow.test.ts`, `businessProfileFlow.test.ts`, `concurrency.real.test.ts`, `customerFlow.test.ts`, `dashboardStatsFlow.test.ts`, `expenseFlow.test.ts`, `financeFlow.test.ts`, `inventoryFlow.test.ts`, `invoiceCreation.real.test.ts`, `ledgerSummaryUpdate.real.test.ts`, `notificationFlow.test.ts`, `orderImportFlow.test.ts`, `paymentFlow.test.ts`, `paymentRecording.real.test.ts`, `supplierFlow.test.ts`.
- `offline/` — resilience: `persistence.test.ts` (AsyncStorage rehydration) and `retry.test.ts` (write-queue back-off).
- `performance/` — `debounce.test.ts` and `renders.test.tsx` guard render counts and debouncing.
- `schema/rpc.test.ts` — asserts the shape of stored-procedure payloads returned from Postgres.
- `scripts/check-ui-tokens.test.ts` — proves the `scripts/check-ui-tokens.mjs` guard works correctly.
- `ui/` — Expo-Router screen tests, organized to mirror `app/(app)` route groups. Each subfolder covers its tab.
    - `auth/` — `language-select`, `login`, `phone-login`, `setup`, `verify`.
    - `customers/` — `add`, `aging`, `detail`, `index`.
    - `dashboard/` — `index`.
    - `finance/` — `cheques`, `expenses`, `index`, `loan-detail`, `payment-detail`, `payment-receipt`, `payments`, `profit-loss`, `purchase-detail`, `purchases`.
    - `inventory/` — `[id]`, `add`, `list`, `stock-op`.
    - `invoices/` — `[id]`, `create`, `list`.
    - `loading-states/` — `inventory.loading`, `invoiceList.loading`, `stockOp.loading`.
    - `navigation/` — `customerDetail.nav`, `customerList.nav`, `financeIndex.nav`, `inventoryDetail.nav`, `inventoryTab.nav`, `invoiceDetail.nav`, `invoiceList.nav`, `settingsMore.nav`, `stockOp.nav`.
    - `orders/` — `detail`, `import`, `index`.
    - `settings/` — `additional-settings`, `business-profile`, `index`, `lock`, `preferences`.
    - `suppliers/` — `add`, `detail`, `index`.
    - `tabs/` — `inventory`, `invoices`, `layout`, `more`, `scan`.
- `utils/` — shared test helpers.
    - `integrationHelpers.ts`, `integrationSetup.ts` — integration bootstrap (Supabase stub wiring).
    - `mockSearchParams.ts` — Expo Router param helper.
    - `mockStore.ts` — Zustand store reset helpers.
    - `platformHelpers.ts` — Platform.OS toggles.
    - `renderWithTheme.tsx` — custom RTL renderer wrapping `ThemeProvider`, i18n, and safe-area.
    - `rnMockRegistry.ts` — central registry of native-module mocks.
    - `supabaseMock.ts` — table/chain-builder mock.
    - `testUtils.ts` — common waits, matchers, helpers.
- `visual/` — jest-image-snapshot based visual regression.
    - `__snapshots__/snapshots.test.tsx.snap` — top-level baseline.
    - `contrast/contrastRatios.test.ts` — WCAG contrast enforcement across theme tokens.
    - `safeArea/paymentModal.safeArea.test.tsx` — iOS notch / home-bar guards.
    - `screens/dashboard.visual.test.tsx` (+ its `__snapshots__/`).
    - `setup/renderToSnapshot.tsx` — snapshot renderer.
    - `snapshots.test.tsx` — sweep over key screens.
- `debug_button2.test.tsx` — orphan debug test kept in history.

---

## `.github/` <a id="github"></a>

- `workflows/ci.yml` — GitHub Actions workflow that installs deps, runs the source validation gates on PRs and pushes to main, then runs separate backend, device, and design-system proof jobs.

---

## `.husky/` <a id="husky"></a>

- `pre-commit` — runs `lint-staged` (Prettier + ESLint on staged `.ts`/`.tsx`/`.json`/`.md`).
- `pre-push` — heavier gate (typecheck + design-system guards) before code leaves the machine.

---

## `.maestro/` <a id="maestro"></a>

Maestro YAML flows exercised via `npm run test:e2e` (device/simulator required).

- **Auth:** `auth_invalid_login.yaml`, `auth_login.yaml`, `auth_logout.yaml`.
- **Core journeys:** `create_invoice_flow.yaml`, `customer_management.yaml`, `dashboard_full.yaml`, `dashboard_visibility.yaml`, `finance_overview.yaml`, `inventory_management.yaml`, `invoice_create_full.yaml`, `invoice_list_detail.yaml`, `navigation_tabs.yaml`, `order_import.yaml`, `payments.yaml`, `scan_tab.yaml`, `settings_navigation.yaml`.
- **Resilience:** `error_handling.yaml`, `happy_path.yaml`, `offline_behavior.yaml`.
- **Design system:** `design_system_workbench.yaml` — deep-links into `/design-system`, cycles theme controls, and captures screenshots that `scripts/check-design-system-visual-regression.mjs` diff-checks against `artifacts/design-system-baselines/ios/`.

---

## `app/` <a id="app"></a>

Expo Router file-system routes. Three top-level route groups plus the design-system workbench.

- `_layout.tsx` — **app root.** Wraps the tree in `ThemeProvider` → `ErrorBoundary` → `KeyboardProvider`, and contains `AuthGate`: reads `useAuthStore` and redirects unauthenticated users to `/(auth)/login` while bypassing redirects when the user is on `/design-system`.

### `app/(app)/` — authenticated workspace

- `_layout.tsx` — stack layout for the post-login workspace.
- `(tabs)/` — bottom-tab shell.
    - `_layout.tsx` — tab-bar configuration.
    - `index.tsx` — dashboard landing.
    - `customers.tsx`, `inventory.tsx`, `invoices.tsx`, `more.tsx`, `scan.tsx` — tab entry screens.
- `customers/` — `[id].tsx` (detail), `add.tsx`, `aging.tsx` (A/R aging buckets), `index.tsx` (list).
- `finance/` — the finance workspace.
    - `index.tsx` — finance landing.
    - `bank-accounts/` — `add.tsx`, `index.tsx`.
    - `expenses/` — `add.tsx`, `index.tsx`.
    - `loans/` — `_layout.tsx`, `[id].tsx`, `add.tsx`, `index.tsx`.
    - `other-income/` — `_layout.tsx`, `add.tsx`, `index.tsx`.
    - `payments/` — `[id].tsx`, `[id]/receipt.tsx`, `index.tsx`, `make.tsx` (money-out), `receive.tsx` (money-in).
    - `purchases/` — `[id].tsx`, `create.tsx`, `index.tsx`.
    - Single-screen tools: `cash.tsx`, `cheques.tsx`, `ewallets.tsx`, `profit-loss.tsx`, `transfer.tsx`.
- `inventory/` — `[id].tsx` (item detail), `add.tsx`, `import.tsx` (CSV bulk import), `stock-op.tsx` (adjust/receive/consume).
- `invoices/` — `[id].tsx`, `create.tsx` (mounts `src/features/invoice-create/InvoiceCreateScreen`).
- `orders/` — `[id].tsx`, `import.tsx` (PDF/AI order parsing), `index.tsx`.
- `reports/` — full GST-era reporting surface.
    - `_layout.tsx`.
    - `all-parties.tsx`, `all-transactions.tsx`, `balance-sheet.tsx`, `cashflow.tsx`, `day-book.tsx`, `expense-summary.tsx`, `gst-detail.tsx`, `gstr1.tsx`, `gstr3b.tsx`, `item-profit.tsx`, `order-summary.tsx`, `party-profit.tsx`, `party-statement.tsx`, `profit-loss.tsx`, `purchase.tsx`, `sale.tsx`, `stock-summary.tsx`, `index.tsx`.
- `settings/` — configuration surface.
    - `backup.tsx`, `business-profile.tsx`, `expense-categories.tsx`, `firms.tsx`, `gst.tsx`, `index.tsx`, `item-categories.tsx`, `item-units.tsx`, `items.tsx`, `lock.tsx` (app lock / biometric), `party.tsx`, `preferences.tsx`, `print.tsx`, `reminders.tsx`, `security.tsx`, `sync-log.tsx`, `transactions.tsx`, `users.tsx`.
- `store/` — `_layout.tsx`, `index.tsx` (storefront placeholder).
- `suppliers/` — `[id].tsx`, `add.tsx`, `index.tsx`.
- `transactions/` — commercial documents beyond invoices.
    - `_layout.tsx`.
    - `credit-notes/` — `_layout.tsx`, `create.tsx`, `index.tsx`.
    - `estimates/` — `_layout.tsx`, `create.tsx`, `index.tsx`.
    - `purchase-orders/` — `_layout.tsx`, `create.tsx`, `index.tsx`.
- `utilities/` — `_layout.tsx`, `calculator.tsx`, `close-fy.tsx` (financial-year closure), `index.tsx`, `tally-export.tsx` (Tally ERP export), `verify.tsx`.

### `app/(auth)/` — unauthenticated routes

- `_layout.tsx` — stack + theming for sign-in flows.
- `language-select.tsx` — pre-login language picker (en/hi).
- `login.tsx`, `phone-login.tsx` — email/OTP and phone-based entry points.
- `setup.tsx` — first-run business-profile setup.
- `verify.tsx` — OTP verification.

### `app/components/` — app-specific shared UI

Everything here is production-facing but outside the governed design system; compositions that depend on product stores/services land here rather than in `src/design-system/`.

- `atoms/` — tiny production primitives with their own tests.
    - `ErrorBoundary.tsx` — root-level fallback (wraps the whole app in `_layout.tsx`).
    - `OfflineBanner.tsx` — top banner driven by `useNetworkStatus`.
    - `QueryBoundary.tsx` — Suspense-style data boundary.
    - `SyncIndicator.tsx` — shows write-queue activity from `useSyncStore`.
    - `__tests__/` — one spec per file.
- `molecules/`
    - `InvoiceStatusBadge.tsx` — paid/partial/unpaid/overdue chip specialized for invoice data.
    - `ScreenHeader.tsx` — product header with back + title + action area, themed to the app (the design system has its own workbench header).
    - `skeletons/` — loading placeholders sized to real screen layouts: `CustomerDetailSkeleton`, `CustomerListSkeleton`, `DashboardSkeleton`, `InventoryListSkeleton`, `InvoiceDetailSkeleton`, `InvoiceListSkeleton`, `OrderListSkeleton`, `ReportSkeleton`.
    - `__tests__/ScreenHeader.test.tsx`.
- `organisms/` — product screen sections that plug product state in.
    - `ConflictModal.tsx` — offline write conflict resolution.
    - `DashboardHeader.tsx`, `QuickActionsGrid.tsx`, `RecentInvoicesList.tsx`, `TileSetCard.tsx` — dashboard composition.
    - `PaymentModal.tsx` — the shared "record payment" sheet used from multiple screens.
    - `__tests__/` — one spec per organism.

### `app/design-system/` — the governed workbench route

- `_layout.tsx` — intentionally thin stack to keep the workbench isolated from the product shell (AuthGate explicitly bypasses it).
- `index.tsx` — mounts `src/design-system/DesignLibraryScreen`.

---

## `artifacts/` <a id="artifacts"></a>

Checked-in proof artifacts — regenerated intentionally rather than on every run.

- `design-system-baselines/ios/screenshots/design-system-foundation.png` — the baseline image that `scripts/check-design-system-visual-regression.mjs` pixel-compares against fresh Maestro screenshots.

---

## `assets/` <a id="assets"></a>

Static assets bundled into native app builds.

- `android-icon-background.png`, `android-icon-monochrome.png` — adaptive-icon pieces for Android 13+ themed icons.
- `images/adaptive-icon.png`, `images/favicon.png`, `images/icon.png`, `images/splash.png` — launcher/favicon/splash.

---

## `docs/` <a id="docs"></a>

Engineering, design, and QA knowledge base. Most are living plans updated as work progresses.

- `A11Y_IMPLEMENTATION_PLAN.md` — accessibility backlog and remediation plan.
- `ARCHITECTURE_REVIEW.md` — snapshot of current architecture and known weaknesses.
- `BUILD_ROADMAP.md` — delivery sequencing.
- `CODEBASE_ASCII_TREE.md` — **this file**.
- `COLLOQUIAL_UI_ALLOWLIST.md`, `COLLOQUIAL_UI_STYLING_REMEDIATION_PLAN.md` — list and cleanup plan for informal wording / styling that still exists.
- `DESIGN_SYSTEM_ACCESSIBILITY_AUDIT.md` — current a11y audit findings for the workbench.
- `DESIGN_SYSTEM_OPERATIONS_CHECKLIST.md` — external tooling/workflow contract (Figma, tokens pipeline).
- `DESIGN_TOKEN_CHANGELOG.md` — human-readable token changes per release.
- `DRIBBBLE_UI_XRAY.md` — visual benchmarks.
- `ENTERPRISE_FEATURE_PATTERNS.md` — feature-pattern catalog.
- `IMPLEMENTATION_PLAN.md`, `SCREEN_SHELL_COOKBOOK.md` — active engineering playbook.
- `PRODUCT_QUALITY_DOC.md` — quality bar definition.
- `TDD_IMPLEMENTATION_PLAN.md`, `TDD_PHASE_PLAN.md`, `TDD_QA_REVIEW.md`, `TEST_ANALYSIS.md`, `TEST_PLAN.md`, `TESTING_MASTER_PLAN.md` — test strategy, phases, and reviews.
- `UI_Library_Checklist.md` — source-of-truth checklist for the design-system library (parsed by `scripts/generate-ui-library-catalog.mjs`).
- `UI_Library_Web_Backlog.md`, `UI_Integration_Checklist.md` — adjacent scope trackers.
- `UI_UX_REMEDIATION_PLAN.md` — UX cleanup backlog.

---

## `scripts/` <a id="scripts"></a>

Node-based automation; every one of these has a corresponding `npm run` entry in `package.json`.

- `check-design-system-guardrails.mjs` — enforces design-system isolation rules (no product-store imports, no raw `Text`, no inline copy, no LTR-only spacing, every supported component has tests, catalog in sync with `componentRegistry.json`).
- `check-design-system-visual-regression.mjs` — pixel-compares current Maestro screenshots against baselines in `artifacts/`.
- `check-expo-route-collisions.mjs` — scans `app/` for path collisions across route groups (fails CI if two route groups would resolve to the same URL).
- `check-no-hex.mjs` — blocks raw `#rrggbb` literals outside allowlists, pushing everyone to tokens.
- `check-ui-tokens.mjs` — validates that colors, spacing, typography come from `src/theme/*` or `src/design-system/*` and not hard-coded.
- `generate-component-catalog.mjs` — regenerates `src/design-system/generated/componentCatalog.ts` from `componentRegistry.json`.
- `generate-design-tokens.mjs` — emits all of `src/theme/generated/{android,ios,web}` from the canonical TypeScript token source, keeping Android XML, iOS `.xcassets`, iOS Swift, web CSS/SCSS, and JSON in sync.
- `generate-ui-library-catalog.mjs` — parses `docs/UI_Library_Checklist.md` into typed `src/design-system/generated/uiLibraryCatalog.ts`.
- `run-design-system-proof.mjs` — orchestrates the native device-level proof (Maestro + screenshot diff) on iOS and Android.

---

## `src/` <a id="src"></a>

All TypeScript source: screens' implementation, reusable UI, services, stores, theme, and utilities.

### `src/__mocks__/`

Manual Jest mocks for Expo modules that either require native code or do disk I/O.

- `expo-document-picker.ts`, `expo-file-system.ts`, `expo-print.ts`, `expo-sharing.ts` — minimal stand-ins returning deterministic data under test.

### `src/__tests__/`

- `ui/README.md` — scope note for UI-level source tests (most real tests live colocated with source).

### `src/config/`

- `featureFlags.ts` — compile-time feature toggles (`PURCHASE_RETURNS`, `AI_ORDER_PARSING`, `MULTI_WAREHOUSE`, `GST_E_INVOICE`, `NOTIFICATIONS`).
- `supabase.ts` — creates the Supabase JS client from `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`; integration and e2e adapters map `SUPABASE_TEST_*` before app startup, pinning `AsyncStorage` as the auth session store.

### `src/constants/`

Business literals that must stay identical across modules.

- `categories.ts` — seed item/expense categories.
- `gst.ts` — GST rate table (`0`, `0.25`, `3`, `5`, `12`, `18`, `28` + cess hooks).
- `invoiceCustomer.ts` — invoice-customer form constants (field lengths, cash-sale sentinel).
- `money.ts` — INR symbol, decimal places, rounding mode.
- `paymentModes.ts` — the canonical cash/UPI/bank/cheque/credit/e-wallet enumeration.
- `reportLayout.ts` — column widths, pagination for report screens.

### `src/design-system/` — governed reusable UI (see `README.md` in-folder)

The tightest-guarded UI zone. New reusable pieces land here first; app-only compositions belong in `app/components/`. The folder is covered by lint guardrails (`check-design-system-guardrails.mjs`) and a contract-test suite.

Top-level files:

- `catalog.ts` — query helpers and the manual live-preview registry that `DesignLibraryScreen` uses to match supported components to on-screen demos.
- `componentContract.ts` — the baseline props and behaviors every design-system primitive must satisfy (style/testID/accessibilityLabel/density).
- `componentDocs.ts` — human-readable usage docs used both by the workbench and by `componentDocs.test.ts`.
- `componentRegistry.json` — explicit allowlist of what counts as "supported design-system surface"; the generator in `scripts/` reads this.
- `copy.ts` — typed internal copy bundle for the workbench (locale- and RTL-friendly).
- `dateUtils.ts` — date helpers used by DS demos.
- `DesignLibraryScreen.tsx` — the in-app workbench: runtime theme controls, gallery previews, quality matrix, checklist explorer.
- `fixtures.ts` — realistic "no-media / ugly-data / read-only" fixtures that exercise fallback states.
- `formatters.ts` — locale-aware `Intl` helpers (numbers, currency, dates, relative time, lists, plural rules).
- `haptics.ts` — single import surface for `expo-haptics`; used by reusable controls.
- `iconography.tsx` — icon size tokens + Lucide / Material adapters; scales with font-size settings.
- `modalStack.ts`, `overlayUtils.ts` — coordinate layered overlays (sheets, dialogs, popovers).
- `nativeAlertDialog.ts` — platform-aware confirmation wrapper over `Alert.alert`.
- `runtimeSignals.ts` — reads platform signals (locale, RTL, font scale, reduced motion, bold text) consumed by `ThemeProvider`.
- `useQualitySignals.ts` — merges runtime + locale diagnostics for the workbench "Quality" panel.
- `useResponsiveWorkbenchLayout.ts` — responds to viewport/rotation in the workbench.
- `README.md` — contributor guide and "Enterprise × Premium Quality Contract" (worth reading before editing anything in here).

#### `src/design-system/__tests__/`

Contract tests that enforce the above rules.

- `accessibilityAuditContract.test.ts` — every supported component has a documented a11y audit entry.
- `boundary.test.ts` — no product-state imports from the DS.
- `catalog.test.ts`, `componentContract.test.ts`, `componentDocs.test.ts` — keep the catalog, contracts, and docs consistent.
- `copy.test.ts` — pseudo-localization and RTL stress over the DS copy bundle.
- `DesignLibraryScreen.test.tsx` — workbench smoke.
- `fixtures.test.ts`, `formatters.test.ts`, `iconography.test.tsx` — unit tests for helpers.
- `nativeAlertDialog.test.ts`, `nativeProofContract.test.ts` — native wrappers behave predictably.
- `qualityMatrix.test.tsx` — large cross-product of density × preset × a11y scenarios.
- `readmeContract.test.ts` — README stays in sync with the checklist catalog.
- `routeLayout.test.tsx` — the `/design-system` route cannot leak back under `app/(app)`.
- `themeMatrix.test.tsx` (+ `__snapshots__/themeMatrix.test.tsx.snap`) — preset × density × RTL × bold-text × reduced-motion regression matrix.
- `useQualitySignals.test.tsx`, `useResponsiveWorkbenchLayout.test.tsx`.

#### `src/design-system/components/`

- **`atoms/`** (14 primitives) — `Avatar`, `Badge`, `Button`, `Card`, `Checkbox`, `Chip`, `Divider`, `IconButton`, `Radio`, `Screen`, `TextInput`, `ThemedText`, `ToggleSwitch`, `TouchableCard`. Each has a matching `.test.tsx` under `__tests__/`. `ThemedText` additionally has a stored snapshot.
- **`molecules/`** (52 composites) — reusable patterns composed from atoms. Each has a matching test.
    - Forms / input: `AmountInput`, `AutocompleteField`, `DatePickerField`, `DateRangePickerField`, `DeclarativeForm`, `FileUploadField`, `FormField`, `FormSection`, `FormWizard`, `NumericStepper`, `OtpCodeInput`, `PhoneInput`, `RangeSlider`, `SearchBar`, `TextAreaField`, `TimePickerField`, `TokenInput`.
    - Containers / layout: `CollapsibleSection`, `DescriptionList`, `ListItem`, `PaginatedList`, `SectionHeader`, `Stepper`, `SwipeableRow`, `TableRow`, `Tabs`, `VirtualizedList`, `SettingsCard`, `StatCard`, `KanbanBoard`, `SortableList`.
    - Feedback / overlay: `ActionMenuSheet`, `AlertBanner`, `BottomSheetPicker`, `ConfirmationModal`, `EmptyState`, `ErrorState`, `NotificationCenter`, `Popover`, `ProgressIndicator`, `SegmentedControl`, `SkeletonBlock`, `SkeletonRow`, `SplitButton`, `Toast`, `ToggleButtonGroup`, `Tooltip`, `FilterBar`.
    - Specialized: `ActivityFeed`, `AvatarGroup`, `ColorPicker`, `DataChart`, `MediaViewer`.
- **`organisms/`** — higher-order composed "workspaces" that model realistic task shapes from smaller pieces.
    - `CrudWorkspace.tsx`, `DataLayoutWorkspace.tsx`, `FeedbackLoopWorkspace.tsx`, `ProductivityWorkspace.tsx`, `SearchFilterWorkspace.tsx` (+ tests in `__tests__/`).
- **Top-level components:**
    - `ThemeSnapshotPreview.tsx` — curated surface for preset regression snapshots.
    - `WorkbenchHeader.tsx` — workbench-only header (intentionally separate from the product `ScreenHeader`).

#### `src/design-system/generated/`

Outputs of `scripts/generate-*.mjs`; never edit by hand.

- `componentCatalog.ts` — machine-readable component inventory (built from `componentRegistry.json`).
- `uiLibraryCatalog.ts` — typed version of `docs/UI_Library_Checklist.md`.

### `src/errors/`

- `AppError.ts` — canonical error class and `toAppError(unknown)` normalizer used across services/repositories.
- `index.ts` — re-exports.
- `AppError.test.ts`.

### `src/events/`

- `appEvents.ts` — tiny `eventBus` (mitt-style) used to emit cross-store signals (e.g. "payment recorded" → refresh customer ledger) without tight coupling.

### `src/features/`

Bounded feature modules that coordinate multiple stores/services.

- `invoice-create/` — the three-step invoice creation wizard.
    - `InvoiceCreateScreen.tsx` — screen shell mounted by `app/(app)/invoices/create.tsx`.
    - `useInvoiceCreateFlow.ts` — the orchestration hook: step state, debounced inventory search, totals calculation, and submit.
    - `CustomerStep.tsx`, `LineItemsStep.tsx`, `PaymentStep.tsx` — the three step UIs.
    - `buildInvoiceCreatePayload.ts` — pure payload assembler (the piece easiest to unit-test).
    - `invoiceCreateTypes.ts` — local types (`CustomerDraft`, `PaymentMode`).
    - `__tests__/` — each piece has a test, plus `buildInvoiceCreatePayload.test.ts` for the pure builder.
- `payments/`
    - `buildPaymentRecordPayload.ts` — pure builder for `PaymentModal`.
    - `__tests__/buildPaymentRecordPayload.test.ts`.

### `src/hooks/`

Cross-screen React hooks.

- `useConfirmBack.ts` — intercepts hardware/gesture back and prompts when a form is dirty.
- `useControllableState.ts` — standard controlled/uncontrolled prop pattern.
- `useDebounce.ts` — value debounce.
- `useLocale.ts` — wraps i18next with the app's locale state.
- `useNetworkStatus.ts` — drives `OfflineBanner`.
- `useReducedMotion.ts`, `useSkeletonShimmer.ts` — a11y-aware animation helpers.
- `useRefreshOnFocus.ts` — refetches on screen focus.
- `useThemeTokens.ts` — primary consumer hook for `ThemeProvider`.
- `__tests__/` — one spec per hook.

### `src/i18n/`

Localization runtime.

- `index.ts` — initializes i18next with the app's language detection and fallback chain; imported side-effect-style from `app/_layout.tsx`.
- `polyfills.ts` — loads `@formatjs/intl-*` polyfills for `Intl` APIs missing on Hermes.
- `rtl.ts` — RTL direction helpers.
- `runtime.ts` — runtime locale switching.
- `locales/en.json`, `locales/hi.json` — translation catalogs (English + Hindi).
- `__tests__/rtl.test.ts`, `__tests__/runtime.test.ts`.

### `src/mocks/`

Curated demo/test fixtures split by domain.

- `finance/` — `bankAccounts.ts`, `cash.ts`, `cheques.ts`, `ewallets.ts`, `loans.ts`, `transfer.ts`.
- `reports/` — `gstDetail.ts`, `gstr1.ts`, `gstr3b.ts`, `itemProfit.ts`, `orderSummary.ts`, `partyStatement.ts`.
- `transactions/` — `creditNotes.ts`, `estimates.ts`, `purchaseOrders.ts`.

### `src/repositories/`

Thin data-access layer over Supabase (+ abstraction for tests).

- `baseRepository.ts` — shared query helpers (`applyFilters`, cursor/offset pagination, ILIKE escape, `PaginatedResult`, sort/search merging). Every domain repository extends this pattern.
- One per domain: `customerRepository.ts`, `expenseRepository.ts`, `financeRepository.ts`, `inventoryRepository.ts`, `invoiceRepository.ts`, `notificationRepository.ts`, `orderRepository.ts`, `paymentRepository.ts`, `supplierRepository.ts`.
- `index.ts` — barrel.
- `__tests__/` — unit tests for each repository, plus `baseRepository.test.ts`, `ErrorPropagation.test.ts`, and a local `helpers.ts`.

### `src/schemas/`

Zod validation schemas for every write payload. Used by forms (via `@hookform/resolvers`), services, and defensive checks.

- `businessProfile.ts`, `customer.ts`, `expense.ts`, `inventory.ts`, `invoice.ts` (+ helpers like `isInvoiceCustomerPhoneValid`), `payment.ts`.
- `index.ts` — barrel.
- `__tests__/` — one spec per schema.

### `src/services/`

Business-rule layer between stores and repositories. Services orchestrate repository calls, validation, totals/tax math, RPCs, and event emission.

- `authService.ts` — Supabase auth, session bootstrap, sign-in/out.
- `businessProfileService.ts` — single-firm profile lifecycle.
- `customerService.ts`, `supplierService.ts` (via `customerRepository`-style helpers).
- `dashboardService.ts` — aggregate stats (consumed by dashboard widgets).
- `exportService.ts` — GST CSV export pipeline.
- `financeService.ts` — cash/bank/cheque/e-wallet/loan/transfer flows.
- `inventoryService.ts` — stock operations, low-stock checks.
- `invoiceService.ts` — invoice CRUD + atomic RPC creation (via migration 011's transactional stored procedure) + totals via `utils/gstCalculator`.
- `itemCategoryService.ts`, `itemPartyRateService.ts` — reference data and per-party pricing.
- `orderService.ts` — order import pipeline (including AI PDF parsing glue).
- `paymentService.ts` — receive/make payment, idempotent recording.
- `pdfService.ts` — renders invoices/receipts to PDF via `expo-print`.
- `reportService.ts` — GSTR, day book, profit/loss, aging aggregations.
- `storageService.ts` — thin wrapper over `AsyncStorage` for non-Zustand caches.
- `writeQueueService.ts` — offline write buffer that feeds `SyncIndicator` and reconciles on reconnect.
- `*.test.ts` — a test file beside each service.

### `src/stores/`

Zustand stores (Immer + persist). Each store is the screen-facing source of truth for its domain; actions delegate to services.

- `authStore.ts` — session + `initialize()`; consumed by `AuthGate` in `app/_layout.tsx`.
- `createPaginatedStore.ts` — generic factory used by list-heavy stores for filters + pagination + retry wiring.
- `customerStore.ts`, `dashboardStore.ts`, `financeStore.ts`, `inventoryStore.ts`, `invoiceStore.ts`, `notificationStore.ts`, `orderStore.ts` — domain stores.
- `syncStore.ts` — offline queue state driven by `writeQueueService`.
- `__tests__/createPaginatedStore.test.ts`, `__tests__/notificationStore.test.ts` + colocated `*.test.ts` files for each domain store.

### `src/theme/`

The runtime theme engine. `src/theme/index.ts` is the full `Theme` TypeScript contract — colors (backgrounds, text, brand, semantic, UI, nav, status), `ThemeDensity` (`compact | comfortable | spacious`), `ThemePresetId` (`baseline | executive | studio | mono | prism`), `ThemeContrastMode` (`default | high`), typography (5-family + 13-size scale + variants), spacing, border radius/width, semantic/density spacing, letter spacing, opacity, shadows, elevation, animation curves/springs/profiles, visual tokens (surfaces, accents, data, hero, media, silhouette, depth, presentation), and per-component tokens (button, badge, chip, card, input, selectionControl, toggleSwitch, searchBar, iconButton, fab).

Runtime modules:

- `ThemeProvider.tsx` — React context + `useThemeTokens`; resolves `system | light | dark` × preset × density × contrast at runtime and wires `runtimeSignals` from the DS.
- `animations.ts` — animation curves/springs/press profiles.
- `colors.ts`, `palette.ts` — base + derived palettes.
- `density.ts`, `layout.ts`, `layoutMetrics.ts`, `responsive.ts` — density/layout math.
- `designTokens.ts` — canonical token source (the `scripts/generate-design-tokens.mjs` input).
- `localeTypography.ts` — script-safe typography overrides for Arabic/Devanagari/CJK.
- `presets.ts` — curated preset definitions (baseline / executive / studio / mono / prism).
- `shadowMetrics.ts`, `typographyMetrics.ts`, `uiMetrics.ts`, `zIndex.ts`.
- `index.ts` — the `Theme` type surface re-exported above.
- `__tests__/` — large contract suite: `accessibilityPolicy`, `colorDerivation`, `colors`, `contrastPolicy`, `density`, `designTokenArtifacts`, `designTokens`, `localeTypography`, `presets`, `responsive`, `ThemeProvider`, `tokens`.

#### `src/theme/generated/`

Cross-platform token outputs produced by `npm run generate:tokens`. **Regenerate rather than hand-edit.**

- `android/values/design_system_tokens.xml` — Android resource XML.
- `ios/DesignSystemTokens.swift` — Swift constant bundle.
- `ios/DesignSystemColors.xcassets/` — Xcode color-asset catalog. Contains a root `Contents.json` plus ~170 `.colorset/` folders, each with a single `Contents.json`. Covers every color token: primitive ramps (`DSColorError|Info|Neutral|Primary|Secondary|Success|Warning` × `50/100/200/300/400/500/600/700/800/900/950`) and semantic slots (`DSSemanticDark*`, `DSSemanticLight*`, `DSSemanticHighContrastDark*`, `DSSemanticHighContrastLight*` × surface / background / card / border / borderStrong / badge / tabBar / tabActive / tabInactive / primary / secondary / primaryDark / primaryGradient{Start,End} / onPrimary / onBackground / onSurface / onCard / overlay / scrim / shadow / separator / placeholder / success / onSuccess / successLight / warning / onWarning / warningLight / error / onError / errorLight / info / onInfo / infoLight / paid / partial / unpaid / overdue / lowStock / white). Consumed by native code that needs to align with the shared theme.
- `web/design-system.tokens.css`, `web/design-system.tokens.scss` — browser-context outputs (used by any web surfaces / docs).
- `design-system.tokens.json` — the neutral JSON mirror for downstream tooling.

### `src/types/`

Shared TypeScript contracts. Each file defines the canonical shape for one domain, reused across store, service, repository, and UI.

- `businessProfile.ts`, `common.ts` (incl. `UUID`), `customer.ts`, `declarations.d.ts` (ambient module shims), `finance.ts`, `inventory.ts`, `invoice.ts`, `notification.ts`, `order.ts`, `supplier.ts`.

### `src/utils/`

Low-level helpers reused everywhere.

- `accessibility.ts` — helpers for `accessibilityLabel`, roles, and focus.
- `animateNextLayout.ts` — `LayoutAnimation` wrapper with reduced-motion awareness.
- `color.ts` — color math (luminance, contrast, mix).
- `currency.ts`, `formatUtils.ts` — INR + locale-aware formatting.
- `dateUtils.ts` — `date-fns` wrappers.
- `gstCalculator.ts` — **the** GST math: `calculateLineItemTax` and `calculateInvoiceTotals` (intra/inter-state, CGST/SGST/IGST).
- `html.ts` — HTML escaping/building for PDF templates.
- `imageTransform.ts` — camera/gallery image manipulation via `expo-image-manipulator`.
- `itemNameParser.ts` — normalizes scanned/imported item names.
- `logger.ts` — tagged logger used across services and the store layer.
- `perf.ts` — perf marks for `__DEV__`.
- `retry.ts` — `withRetry` used by stores when hitting services.
- `uuid.ts` — `generateUUID()`.
- `validation.ts` — `validateWith(schema, input)` used by services before writes.
- `__tests__/` and colocated `*.test.ts` — tests for each helper, plus `gstCalculator.test.ts` and `imageTransform.test.ts`.

---

## `supabase/` <a id="supabase"></a>

Backend source of truth: schema, migrations, edge functions, and SQL contract tests.

### `supabase/functions/`

- `parse-order-pdf/index.ts` — Supabase Edge Function that extracts line items from an uploaded order PDF (invoked by `orderService` when `Features.AI_ORDER_PARSING` is true).

### `supabase/migrations/`

Numbered SQL migrations applied in order. Reading them in sequence gives a complete picture of how the backend evolved.

- `001_extensions_enums.sql` — enable Postgres extensions; declare enum types.
- `002_contacts.sql` — customers + suppliers base tables.
- `003_orders_inventory.sql` — orders, items, categories, units.
- `004_stock_operations.sql` — stock-operation ledger.
- `005_invoicing.sql` — invoices + line items.
- `006_finance.sql` — payments, bank accounts, cheques, expenses, loans.
- `007_views_functions_rls.sql` — reporting views + Row-Level-Security policies.
- `008_schema_fixes.sql` — post-launch schema fixes.
- `009_missing_indexes.sql` — performance indexes identified during dogfooding.
- `010_fix_profit_loss.sql` — profit/loss calculation correction.
- `011_transactional_invoice.sql` — **flagship** atomic invoice-creation RPC used by `invoiceService.createInvoice` (assigns number, inserts lines, deducts stock in a single transaction).
- `012_transactional_payment.sql` — atomic payment recording RPC.
- `013_fy_sequence_reset.sql` — financial-year invoice number sequence reset.
- `014_audit_log.sql`, `015_fix_audit_log_rls.sql` — audit trail and its RLS.
- `015_low_stock_notification.sql` — trigger for low-stock notifications.
- `016_materialized_views.sql` — report-speed materialized views.
- `017_versioned_rpc_aliases.sql` — versioned RPC names to support client migrations.
- `018_order_pdfs_bucket.sql` — storage bucket for uploaded order PDFs.
- `019_enterprise_idempotency_fix.sql` — dedupe + retry safety for writes.
- `020_mandatory_phone_and_index.sql` — customer-phone becomes required + index.
- `021_refresh_summaries_in_rpcs.sql` — refresh materialized views inside transactional RPCs.
- `022_dynamic_categories_units.sql` — dynamic category/unit tables.
- `023_batch_serial_party_rates.sql` — batch/serial tracking + per-party rates.
- `024_customers_phone_mandatory_unique.sql` — unique phone enforcement.

### `supabase/tests/`

Numbered SQL contract tests that assert backend guarantees.

- `01_stock_operation.sql`, `02_invoice_creation.sql`, `03_dashboard_stats.sql`, `04_payment_recording.sql`, `05_rls_policies.sql`, `06_notifications.sql`, `07_audit_log.sql`, `08_schema_integrity.sql`.

### `supabase/full_schema_setup.sql`

Idempotent bootstrap for a fresh Postgres database — applies all migrations in order; handy for local dev and test projects.

---

## Root files <a id="root-files"></a>

- `.git-blame-ignore-revs` — revisions (mass formatting, token regeneration) that Git blame should skip.
- `.gitignore` — standard Expo/React Native ignores plus `lint_results.json`, `test_report.txt`, coverage.
- `.prettierignore` — excludes generated outputs (`src/theme/generated`, `src/design-system/generated`, `package-lock.json`).
- `.prettierrc` — formatting rules (tabs, single quotes, trailing commas).
- `app.json` — Expo config (app name, bundle id, icons, permissions, scheme).
- `babel.config.js` — Babel presets (Expo + Reanimated plugin).
- `eslint.config.js` — flat-config ESLint: TypeScript, React, React Native, React Hooks, FormatJS, i18next, no-inline-styles plugins, plus no-magic-numbers monitoring.
- `jest.config.js` — primary config (`jest-expo` preset, transforms, moduleNameMapper for `@/*` alias).
- `jest.integration.config.js` — separate config for integration tests; forces `--runInBand`.
- `jest.setup.ts` — global test bootstrap: registers all `src/__mocks__/`, sets up i18n, silences RN warnings, wires up `supabaseMock`.
- `package.json` — dependencies + the `validate` pipeline definition (format → typecheck → hex → routes → runtime/target/i18n/token/design-system/UI-shell/workspace checks → lint → test). Backend validation remains explicit through `test:integration`, `test:pr`, and `validate:backend`. Also defines all `generate:*`, `check:*`, and `test:design-system:*` scripts.
- `package-lock.json` — npm lockfile.
- `stylelint.config.mjs` — style rules for the generated web CSS/SCSS outputs.
- `tsconfig.json` — strict TypeScript, `@/*` path alias to repo root.
