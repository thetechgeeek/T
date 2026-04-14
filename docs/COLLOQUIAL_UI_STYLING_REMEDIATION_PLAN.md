# Colloquial UI Styling — Remediation Checklist

**TileMaster — eliminate ad-hoc visual styling ("colloquial" issues)**

> Granular checklist derived from the original remediation plan. Each item verified against the live codebase on 2026-04-14.

---

## Phase 0 — Theme Infrastructure Gaps

### Gap helpers in `src/theme/layout.ts`

- [x] Add `gap2: { gap: 2 }` (micro — dividers, tight icon rows)
- [x] Add `gap4: { gap: 4 }`
- [x] Add `gap8: { gap: 8 }`
- [x] Add `gap12: { gap: 12 }`
- [x] Add `gap16: { gap: 16 }`
- [x] Add `gap24: { gap: 24 }` (xl)
- [x] Add `gap32: { gap: 32 }` (2xl)
- [x] Add `gap48: { gap: 48 }` (3xl)

### Z-index scale in `src/theme/uiMetrics.ts`

- [x] Define `Z_INDEX.base` (0)
- [x] Define `Z_INDEX.dropdown` (10)
- [x] Define `Z_INDEX.sticky` (50)
- [x] Define `Z_INDEX.overlay` (100)
- [x] Define `Z_INDEX.modal` (200)
- [x] Define `Z_INDEX.toast` (300)
- [x] Define `Z_INDEX.max` (999)

### FAB positioning constants in `src/theme/uiMetrics.ts`

- [x] Define `FAB_OFFSET_RIGHT` (20)
- [x] Define `FAB_OFFSET_BOTTOM` (20)

### Opacity tokens in `src/theme/uiMetrics.ts`

- [x] Audit all 30 rgba calls and add needed `OPACITY_*` / `OVERLAY_COLOR_*` / `GLASS_*` tokens

### Allowlist file

- [x] Create `docs/COLLOQUIAL_UI_ALLOWLIST.md` with process description

---

## Phase 1 — Color Derivation Cleanup

### A1. Raw `rgba(` elimination (was 30 instances in 21 files)

- [x] Eliminate all `rgba(` in `app/` — **0 remaining**
- [x] Eliminate all `rgba(` in `src/components/` — **0 remaining**

### A2. Hex-concatenation hacks (was 16 instances in 8 files → 0 remaining)

- [x] `utilities/tally-export.tsx` — `c.primary + '15'` → `withOpacity()`
- [x] `utilities/verify.tsx` — `c.success + '18'` → `withOpacity()`
- [x] `transactions/purchase-orders/create.tsx` — `c.primary + '10'` → `withOpacity()`
- [x] `finance/loans/index.tsx` — `badgeColor + '22'` → `withOpacity()`
- [x] `finance/loans/[id].tsx` — various `+ '18'` / `+ '60'` → `withOpacity()`
- [x] `finance/transfer.tsx` — `c.primary + '15'` / `'10'` / `'30'` → `withOpacity()`
- [x] `finance/ewallets.tsx` — `item.color + '22'` → `withOpacity()`
- [x] `orders/index.tsx` — `c.success + '15'` → `withOpacity()`
- [x] `reports/order-summary.tsx` — `c.primary + '22'` → `withOpacity()`
- [x] `reports/stock-summary.tsx` — `c.error + '22'` → `withOpacity()`
- [x] `utilities/calculator.tsx` — 2 instances of `c.primary + '20'` → `withOpacity()`
- [x] `transactions/purchase-orders/index.tsx` — 1 instance of `c.primary + '20'` → `withOpacity()`

### A3. Palette imports outside `src/theme/` (was claimed 0 — actually 27 files including features)

> The original baseline was wrong: it said 0 palette imports outside theme. Audit found imports across `app/`, `src/components/`, and `src/features`; all have now been removed from UI code.

- [x] Remove all direct `palette` imports from `app/` screens
- [x] Remove all direct `palette` imports from `src/components/`
- [x] Remove all direct `palette` imports from `src/features/`
- [x] Route shared swatch/data collections through `theme.collections`
- [x] Route one-off UI colors through `theme.colors`

### A4. Semantic color discipline

- [x] All color usage goes through `theme.colors` / `useThemeTokens().c` only
- [x] All derived colors use `withOpacity()` / `darken()` from `src/utils/color.ts`

### A5. Light + dark verification on pilot screens

- [ ] Verify login screen in both themes after color changes
- [ ] Verify store screen in both themes after color changes
- [ ] Verify inventory screen in both themes after color changes

---

## Phase 2 — Component Library Cleanup

### Shared component cleanup

- [x] `Card.tsx` — remove raw Android `elevation: 2`; use `theme.shadows.sm`
- [x] `ErrorBoundary.tsx` — stop bypassing theme with `lightTheme`; use live `ThemeProvider` context
- [x] `Divider.tsx` — replace `height: 1` with `StyleSheet.hairlineWidth`
- [x] `SearchBar.tsx` — replace raw icon sizes with shared `uiMetrics` constants
- [x] `SwipeableRow.tsx` — replace raw action width/height with `uiMetrics` + touch-target tokens
- [x] `ConflictModal.tsx` — replace raw icon/modal sizing with shared `uiMetrics` constants
- [x] `CustomerListSkeleton.tsx` — replace raw skeleton dimensions with shared `uiMetrics` constants
- [x] `SyncIndicator.tsx` — zIndex uses `Z_INDEX.toast`
- [x] `Toast.tsx` / skeletons / organisms — no raw `rgba(` remain in `src/components/`

### Component-wide exit criteria

- [x] `rgba(` in `src/components/` → **0**
- [x] No non-zero raw numeric `gap`, `padding*`, `margin*`, `fontSize`, `borderRadius`, `width`/`height`, `elevation`, or `maxHeight` remain in `src/components/` style declarations
- [x] Explicit `0` resets remain only where they intentionally mean “none”

---

## Phase 3 — Shared Layout Primitives

### Create shared components

- [x] Create `SectionHeader` molecule (`src/components/molecules/SectionHeader.tsx`)
- [x] Create `SettingsCard` molecule (`src/components/molecules/SettingsCard.tsx`)
- [x] Create `TableRow` molecule (`src/components/molecules/TableRow.tsx`)
- [x] Create `FormSection` molecule (`src/components/molecules/FormSection.tsx`)

### Adopt shared components (replace per-screen duplicates)

- [x] `SectionHeader` adopted in screens — **12 imports** in `app/`
- [x] `SettingsCard` adopted in screens — **11 imports** in `app/`
- [x] `TableRow` adopted in screens — **2 imports** in `app/` (`reports/party-statement`, `reports/gst-detail`)
- [x] `FormSection` adopted in screens — **2 imports** in `app/` (`customers/add`, `suppliers/add`)

### Eliminate per-screen duplicate styles

- [x] Remove per-screen `sectionHeader` style definitions — shared `SectionHeader` now covers the former one-off variants in `finance/payments/[id]`, `settings/business-profile`, `finance/purchases/[id]`, and `orders/import`
- [x] Remove per-screen `card` style definitions — former per-screen card wrappers were consolidated into shared primitives / inline one-offs, with no remaining `card:` style definitions in `app/`

### Z-index migration (was 5 raw usages)

- [x] `finance/payments/make.tsx` — `zIndex: 100` → `Z_INDEX.overlay`
- [x] `finance/payments/receive.tsx` — `zIndex: 100` → `Z_INDEX.overlay`
- [x] `finance/purchases/create.tsx` — `zIndex: 100` → `Z_INDEX.overlay`
- [x] `finance/purchases/[id].tsx` — `zIndex: 100` → `Z_INDEX.overlay`
- [x] `atoms/SyncIndicator.tsx` — `zIndex: 1` → `Z_INDEX.base`

### FAB positioning consolidation

- [x] FAB uses `FAB_OFFSET_*` constants — **13 files** using `FAB_OFFSET` in `app/`

---

## Phase 4 — Screen-by-Screen Spacing Migration

> This is the largest phase. ~1,200+ raw numeric violations across ~120 files. The per-slice checklist below tracks sequential slice completion. A slice is only considered complete when its file work and its slice-level follow-ups are finished.

### Per-slice checklist template (applies to each slice)

For each slice: replace all raw `gap`, `padding*`, `margin*`, `fontSize`, `borderRadius`, and recurring `width`/`height` with theme tokens.

### S1. Auth screens (6 files — ~60 violations)

- [x] `login.tsx` — all magic numbers → tokens
- [x] `phone-login.tsx` — all magic numbers → tokens
- [x] `setup.tsx` — all magic numbers → tokens (~35 violations, worst offender)
- [x] `verify.tsx` — all magic numbers → tokens
- [x] `language-select.tsx` — all magic numbers → tokens
- [x] `(auth)/_layout.tsx` — all magic numbers → tokens
- [ ] Light + dark visual check for auth slice

### S2. Tab screens (7 files — ~80 violations)

- [x] `(tabs)/_layout.tsx` — all magic numbers → tokens
- [x] `(tabs)/index.tsx` (dashboard) — all magic numbers → tokens
- [x] `(tabs)/inventory.tsx` — all magic numbers → tokens
- [x] `(tabs)/invoices.tsx` — all magic numbers → tokens
- [x] `(tabs)/customers.tsx` — all magic numbers → tokens
- [x] `(tabs)/more.tsx` — all magic numbers → tokens
- [x] `(tabs)/scan.tsx` — all magic numbers → tokens
- [ ] Light + dark visual check for tabs slice

### S3. Settings screens (18 files — ~150 violations)

- [x] `settings/index.tsx` — magic numbers → tokens
- [x] `settings/preferences.tsx` — magic numbers → tokens (~22 violations)
- [x] `settings/users.tsx` — magic numbers → tokens (~28 violations)
- [x] `settings/reminders.tsx` — magic numbers → tokens (~20 violations)
- [x] `settings/business-profile.tsx` — magic numbers → tokens
- [x] `settings/gst.tsx` — magic numbers → tokens
- [x] `settings/items.tsx` — magic numbers → tokens
- [x] `settings/party.tsx` — magic numbers → tokens
- [x] `settings/transactions.tsx` — magic numbers → tokens
- [x] `settings/print.tsx` — magic numbers → tokens
- [x] `settings/backup.tsx` — magic numbers → tokens
- [x] `settings/expense-categories.tsx` — magic numbers → tokens
- [x] `settings/item-categories.tsx` — magic numbers → tokens
- [x] `settings/item-units.tsx` — magic numbers → tokens
- [x] `settings/security.tsx` — magic numbers → tokens
- [x] `settings/firms.tsx` — magic numbers → tokens
- [x] `settings/sync-log.tsx` — magic numbers → tokens
- [x] Replace per-screen `card` / `sectionHeader` with shared primitives
- [ ] Light + dark visual check for settings slice

### S4. Finance screens (24 files — ~180 violations)

- [x] `finance/index.tsx` — magic numbers → tokens
- [x] `finance/cash.tsx` — magic numbers → tokens
- [x] `finance/transfer.tsx` — magic numbers → tokens
- [x] `finance/ewallets.tsx` — magic numbers → tokens (~20 violations)
- [x] `finance/cheques.tsx` — magic numbers → tokens
- [x] `finance/loans/index.tsx` — magic numbers → tokens
- [x] `finance/loans/[id].tsx` — magic numbers → tokens
- [x] `finance/payments/index.tsx` — magic numbers → tokens
- [x] `finance/payments/make.tsx` — magic numbers → tokens
- [x] `finance/payments/receive.tsx` — magic numbers → tokens
- [x] `finance/payments/[id].tsx` — magic numbers → tokens
- [x] `finance/purchases/index.tsx` — magic numbers → tokens
- [x] `finance/purchases/create.tsx` — magic numbers → tokens
- [x] `finance/purchases/[id].tsx` — magic numbers → tokens
- [x] `finance/bank-accounts/index.tsx` — magic numbers → tokens
- [x] `finance/bank-accounts/add.tsx` — magic numbers → tokens (~18 violations)
- [x] `finance/bank-accounts/[id].tsx` — no detail screen exists in the current app
- [x] `finance/expenses/index.tsx` — magic numbers → tokens
- [x] `finance/expenses/add.tsx` — magic numbers → tokens (current route; no `create.tsx` screen exists)
- [x] `finance/other-income/index.tsx` — magic numbers → tokens
- [x] `finance/other-income/add.tsx` — magic numbers → tokens (current route; no `create.tsx` screen exists)
- [ ] Light + dark visual check for finance slice

### S5. Reports screens (18 files — ~200 violations)

- [x] `reports/index.tsx` — magic numbers → tokens
- [x] `reports/stock-summary.tsx` — magic numbers → tokens (~30 violations)
- [x] `reports/party-statement.tsx` — magic numbers → tokens (~28 violations)
- [x] `reports/party-profit.tsx` — magic numbers → tokens (~25 violations)
- [x] `reports/all-transactions.tsx` — magic numbers → tokens (~25 violations)
- [x] `reports/order-summary.tsx` — magic numbers → tokens (~24 violations)
- [x] `reports/gst-detail.tsx` — magic numbers → tokens (~24 violations)
- [x] `reports/sale.tsx` — magic numbers → tokens (~18 violations)
- [x] `reports/purchase.tsx` — magic numbers → tokens (~18 violations)
- [x] `reports/item-profit.tsx` — magic numbers → tokens (~18 violations)
- [x] `reports/all-parties.tsx` — magic numbers → tokens
- [x] `reports/expense-summary.tsx` — magic numbers → tokens
- [x] `reports/gstr1.tsx` — magic numbers → tokens
- [x] `reports/gstr3b.tsx` — magic numbers → tokens
- [x] `reports/balance-sheet.tsx` — magic numbers → tokens
- [x] `reports/cashflow.tsx` — magic numbers → tokens
- [x] `reports/day-book.tsx` — magic numbers → tokens
- [ ] Light + dark visual check for reports slice

### S6. Transaction screens (9 files — ~70 violations)

- [x] `transactions/estimates/index.tsx` — magic numbers → tokens
- [x] `transactions/estimates/create.tsx` — magic numbers → tokens (~18 violations)
- [x] `transactions/purchase-orders/index.tsx` — magic numbers → tokens
- [x] `transactions/purchase-orders/create.tsx` — magic numbers → tokens
- [x] `transactions/credit-notes/index.tsx` — magic numbers → tokens
- [x] `transactions/credit-notes/create.tsx` — magic numbers → tokens
- [ ] Light + dark visual check for transactions slice

### S7. Customer/Supplier screens (7 files — ~50 violations)

- [x] `customers/index.tsx` — magic numbers → tokens
- [x] `customers/add.tsx` — magic numbers → tokens
- [x] `customers/[id].tsx` — magic numbers → tokens
- [x] `suppliers/index.tsx` — magic numbers → tokens
- [x] `suppliers/add.tsx` — magic numbers → tokens
- [x] `suppliers/[id].tsx` — magic numbers → tokens
- [ ] Light + dark visual check for customer/supplier slice

### S8. Invoice screens (2 files — ~30 violations)

- [x] `invoices/[id].tsx` — magic numbers → tokens
- [x] `invoices/create.tsx` — magic numbers → tokens (if exists)
- [ ] Light + dark visual check for invoice slice

### S9. Order screens (3 files — ~40 violations)

- [x] `orders/index.tsx` — magic numbers → tokens
- [x] `orders/[id].tsx` — magic numbers → tokens
- [x] `orders/import.tsx` — magic numbers → tokens (~20 violations)
- [ ] Light + dark visual check for orders slice

### S10. Utility screens (5 files — ~40 violations)

- [x] `utilities/index.tsx` — magic numbers → tokens
- [x] `utilities/calculator.tsx` — magic numbers → tokens (~17 violations)
- [x] `utilities/tally-export.tsx` — magic numbers → tokens
- [x] `utilities/verify.tsx` — magic numbers → tokens
- [x] `utilities/close-fy.tsx` — magic numbers → tokens
- [ ] Light + dark visual check for utilities slice

### S11. Store screens (2 files — ~30 violations)

- [x] `store/index.tsx` — magic numbers → tokens (~22 violations)
- [x] `store/[id].tsx` — no detail screen exists in the current app
- [ ] Light + dark visual check for store slice

### S12. Feature modules (7 files — ~20 violations)

- [x] Audit `src/features/` for raw numeric styling values
- [x] Replace all magic numbers in feature modules with tokens
- [ ] Light + dark visual check for feature modules

---

## Phase 5 — Screen Shell Normalization

### Document screen recipes

- [x] Create standalone screen-shell cookbook in `docs/SCREEN_SHELL_COOKBOOK.md`
- [x] Document the 3 supported shell patterns: tab/list, form/detail, and modal/page-sheet
- [x] Document `ScreenHeader` safe-area ownership and the `header` / `footer` rule

### Normalize route shells and direct `ScrollView` usage

- [x] Route-level screens that previously used outer `ScrollView` now use `Screen` / `AtomicScreen` shell primitives or a list-first shell
- [x] Fixed headers and action bars were moved into `header` / `footer` where appropriate (`inventory/add`, `inventory/import`, `invoices/[id]`, `orders/import`, `reports/balance-sheet`, `reports/cashflow`, `reports/day-book`, `auth/setup`)
- [x] List-first shells remain `FlatList`-driven without an extra route-level `ScrollView` (`reports/all-transactions`, `reports/expense-summary`, `reports/item-profit`, `reports/order-summary`, `reports/party-profit`, `reports/purchase`, `reports/sale`, `reports/stock-summary`, `(tabs)/inventory`)
- [x] Remaining nested vertical `ScrollView` usage is limited to internal bottom-sheet editor bodies (`settings/expense-categories`, `settings/item-categories`, `settings/item-units`) and is documented in the cookbook

### Standardize `safeAreaEdges` (was 10 combos → now 4)

- [x] Reduced from 10 unique combos to 4 (`['bottom']`, `['top']`, `['top','bottom']`, `[]`)
- [x] Standardize to 3 documented shell patterns plus named exceptions in `docs/SCREEN_SHELL_COOKBOOK.md`

### Fix duplicate safe-area padding

- [x] `app/(app)/invoices/[id].tsx` no longer combines top safe area with `ScreenHeader`
- [x] `app/(app)/reports/index.tsx` no longer combines top safe area with `ScreenHeader`
- [x] `app/(app)/utilities/index.tsx` no longer combines top safe area with `ScreenHeader`
- [x] `app/(app)/orders/[id].tsx` no longer combines top safe area with `ScreenHeader` in the loading branch

### Phase 5 test coverage

- [x] Add `Screen` tests covering bottom-only safe-area ownership, footer inset handoff, and `scrollViewProps` forwarding

---

## Phase 6 — Enforcement & CI Hardening

### Token-check script

- [ ] Create `scripts/check-ui-tokens.mjs` that scans for:
    - `rgba(` outside `src/theme/`
    - Color string concatenation patterns
    - Raw numeric `gap`, `padding*`, `margin*`, `fontSize`, `borderRadius`
    - `ScrollView` import in `app/` (outside allowlist)
    - `zIndex` with raw numeric value
- [ ] Add `"check:ui-tokens"` script to `package.json`

### Existing checks

- [x] `check:hex` script exists in `package.json`
- [x] `validate` script exists in `package.json`

### CI integration

- [ ] Add `check:ui-tokens` to `validate` script chain
- [x] Husky pre-commit hook exists (runs `lint-staged` with prettier + eslint)
- [x] Husky pre-push hook exists (runs `validate`)
- [ ] Pre-commit runs token checks on staged files

### ESLint tightening

- [ ] Tighten `@typescript-eslint/no-magic-numbers` ignore list (currently allows 0–1000+, far too broad)
- [ ] Add custom ESLint rules or config for UI-token patterns

---

## Phase 7 — Final Audit & Sign-off

- [ ] Re-run baseline audit — update all counts to 0 or allowlisted
- [ ] Mark all §2 checkboxes as `[x]`
- [ ] Design QA: Dashboard on light + dark, iPhone SE + iPhone 15 Pro Max
- [ ] Design QA: Invoice list + create + detail
- [ ] Design QA: Customer list + detail
- [ ] Design QA: Inventory list + detail
- [ ] Design QA: Finance index + cash + payments
- [ ] Design QA: Reports index + stock-summary + all-transactions
- [ ] Design QA: Settings index + preferences + business-profile
- [ ] Design QA: Auth flow (login + setup)
- [ ] Design QA: Store
- [ ] Confirm no visual regressions in snapshot tests
- [ ] All `ThemedText` variants render correctly in both themes
- [ ] Archive `docs/COLLOQUIAL_UI_ALLOWLIST.md` (should be empty or near-empty)
- [ ] Optional: git tag `ui-tokens-v1`

---

## Progress Summary

| Phase | Description                | Status                                  | Done / Total |
| ----- | -------------------------- | --------------------------------------- | ------------ |
| **0** | Theme infrastructure gaps  | **Complete**                            | 19/19        |
| **1** | Color derivation cleanup   | **Mostly complete**                     | 21/24        |
| **2** | Component library cleanup  | **Complete**                            | 12/12        |
| **3** | Shared layout primitives   | **Complete**                            | 16/16        |
| **4** | Screen-by-screen spacing   | **Implementation complete; QA pending** | 95/107       |
| **5** | Screen shell normalization | **Complete**                            | 14/14        |
| **6** | Enforcement & CI hardening | **In progress**                         | 4/10         |
| **7** | Final audit & sign-off     | **Not started**                         | 0/15         |
|       | **Overall**                |                                         | **181/217**  |

---

## Key Findings from Codebase Audit (2026-04-14)

1. **Phase 0 is fully done** — all gap helpers, Z_INDEX scale, FAB constants, opacity tokens, and allowlist file are in place.

2. **rgba() is fully eliminated** — the biggest Phase 1 win. All 30 instances in 21 files are gone from both `app/` and `src/components/`.

3. **Hex concatenation is fully eliminated** — there are now **0** `color + 'XX'` hacks left in UI code.

4. **Palette imports are fully removed from UI code** — screens, components, and features now use `theme.colors` or `theme.collections` instead of importing `@/src/theme/palette` directly.

5. **Shared primitives are now rolled out through the high-churn settings/report/form surfaces** — `SectionHeader`, `SettingsCard`, `TableRow`, and `FormSection` replaced the former screen-local duplicates, and the remaining checklist work has moved on to shell normalization and enforcement.

6. **Per-screen card/sectionHeader duplicates are no longer a blocker** — the earlier `card:` / `sectionHeader:` audit hotspots were removed from `app/`, including the settings, finance-detail, purchase-detail, and order-import screens that originally anchored this cleanup.

7. **Phase 4 implementation is finished across the current route set** — finance, reports, transactions, customer/supplier, invoice, order, utility, store, and `src/features/` audits are now clean for raw spacing/typography/radius sizing values. The remaining Phase 4 checkboxes are manual light/dark verification passes.

8. **The checklist now matches the real app structure** — `finance/expenses/add.tsx` and `finance/other-income/add.tsx` are the live routes (not `create.tsx`), while `finance/bank-accounts/[id].tsx` and `store/[id].tsx` do not exist in the current codebase.

9. **Phase 5 is now complete** — route-level screen shells are normalized around `Screen` / `AtomicScreen`, fixed chrome lives in `header` / `footer`, and safe-area ownership is documented in `docs/SCREEN_SHELL_COOKBOOK.md`.

10. **No enforcement automation exists yet** — `check-ui-tokens.mjs` still hasn't been created, and the ESLint `no-magic-numbers` ignore list remains broad enough that CI is not yet enforcing the token discipline established by the remediation work.
