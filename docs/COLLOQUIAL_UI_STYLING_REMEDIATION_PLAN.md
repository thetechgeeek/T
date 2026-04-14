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
- [ ] Replace per-screen `card` / `sectionHeader` with shared primitives
- [ ] Light + dark visual check for settings slice

### S4. Finance screens (24 files — ~180 violations)

- [ ] `finance/index.tsx` — magic numbers → tokens
- [ ] `finance/cash.tsx` — magic numbers → tokens
- [ ] `finance/transfer.tsx` — magic numbers → tokens
- [ ] `finance/ewallets.tsx` — magic numbers → tokens (~20 violations)
- [ ] `finance/cheques.tsx` — magic numbers → tokens
- [ ] `finance/loans/index.tsx` — magic numbers → tokens
- [ ] `finance/loans/[id].tsx` — magic numbers → tokens
- [ ] `finance/payments/index.tsx` — magic numbers → tokens
- [ ] `finance/payments/make.tsx` — magic numbers → tokens
- [ ] `finance/payments/receive.tsx` — magic numbers → tokens
- [ ] `finance/payments/[id].tsx` — magic numbers → tokens
- [ ] `finance/purchases/index.tsx` — magic numbers → tokens
- [ ] `finance/purchases/create.tsx` — magic numbers → tokens
- [ ] `finance/purchases/[id].tsx` — magic numbers → tokens
- [ ] `finance/bank-accounts/index.tsx` — magic numbers → tokens
- [ ] `finance/bank-accounts/add.tsx` — magic numbers → tokens (~18 violations)
- [ ] `finance/bank-accounts/[id].tsx` — magic numbers → tokens
- [ ] `finance/expenses/index.tsx` — magic numbers → tokens
- [ ] `finance/expenses/create.tsx` — magic numbers → tokens
- [ ] `finance/other-income/index.tsx` — magic numbers → tokens
- [ ] `finance/other-income/create.tsx` — magic numbers → tokens
- [ ] Light + dark visual check for finance slice

### S5. Reports screens (18 files — ~200 violations)

- [ ] `reports/index.tsx` — magic numbers → tokens
- [ ] `reports/stock-summary.tsx` — magic numbers → tokens (~30 violations)
- [ ] `reports/party-statement.tsx` — magic numbers → tokens (~28 violations)
- [ ] `reports/party-profit.tsx` — magic numbers → tokens (~25 violations)
- [ ] `reports/all-transactions.tsx` — magic numbers → tokens (~25 violations)
- [ ] `reports/order-summary.tsx` — magic numbers → tokens (~24 violations)
- [ ] `reports/gst-detail.tsx` — magic numbers → tokens (~24 violations)
- [ ] `reports/sale.tsx` — magic numbers → tokens (~18 violations)
- [ ] `reports/purchase.tsx` — magic numbers → tokens (~18 violations)
- [ ] `reports/item-profit.tsx` — magic numbers → tokens (~18 violations)
- [ ] `reports/all-parties.tsx` — magic numbers → tokens
- [ ] `reports/expense-summary.tsx` — magic numbers → tokens
- [ ] `reports/gstr1.tsx` — magic numbers → tokens
- [ ] `reports/gstr3b.tsx` — magic numbers → tokens
- [ ] `reports/balance-sheet.tsx` — magic numbers → tokens
- [ ] `reports/cashflow.tsx` — magic numbers → tokens
- [ ] `reports/day-book.tsx` — magic numbers → tokens
- [ ] Light + dark visual check for reports slice

### S6. Transaction screens (9 files — ~70 violations)

- [ ] `transactions/estimates/index.tsx` — magic numbers → tokens
- [ ] `transactions/estimates/create.tsx` — magic numbers → tokens (~18 violations)
- [ ] `transactions/purchase-orders/index.tsx` — magic numbers → tokens
- [ ] `transactions/purchase-orders/create.tsx` — magic numbers → tokens
- [ ] `transactions/credit-notes/index.tsx` — magic numbers → tokens
- [ ] `transactions/credit-notes/create.tsx` — magic numbers → tokens
- [ ] Light + dark visual check for transactions slice

### S7. Customer/Supplier screens (7 files — ~50 violations)

- [ ] `customers/index.tsx` — magic numbers → tokens
- [ ] `customers/add.tsx` — magic numbers → tokens
- [ ] `customers/[id].tsx` — magic numbers → tokens
- [ ] `suppliers/index.tsx` — magic numbers → tokens
- [ ] `suppliers/add.tsx` — magic numbers → tokens
- [ ] `suppliers/[id].tsx` — magic numbers → tokens
- [ ] Light + dark visual check for customer/supplier slice

### S8. Invoice screens (2 files — ~30 violations)

- [ ] `invoices/[id].tsx` — magic numbers → tokens
- [ ] `invoices/create.tsx` — magic numbers → tokens (if exists)
- [ ] Light + dark visual check for invoice slice

### S9. Order screens (3 files — ~40 violations)

- [ ] `orders/index.tsx` — magic numbers → tokens
- [ ] `orders/[id].tsx` — magic numbers → tokens
- [ ] `orders/import.tsx` — magic numbers → tokens (~20 violations)
- [ ] Light + dark visual check for orders slice

### S10. Utility screens (5 files — ~40 violations)

- [ ] `utilities/index.tsx` — magic numbers → tokens
- [ ] `utilities/calculator.tsx` — magic numbers → tokens (~17 violations)
- [ ] `utilities/tally-export.tsx` — magic numbers → tokens
- [ ] `utilities/verify.tsx` — magic numbers → tokens
- [ ] `utilities/close-fy.tsx` — magic numbers → tokens
- [ ] Light + dark visual check for utilities slice

### S11. Store screens (2 files — ~30 violations)

- [ ] `store/index.tsx` — magic numbers → tokens (~22 violations)
- [ ] `store/[id].tsx` — magic numbers → tokens (if exists)
- [ ] Light + dark visual check for store slice

### S12. Feature modules (7 files — ~20 violations)

- [ ] Audit `src/features/` for raw numeric styling values
- [ ] Replace all magic numbers in feature modules with tokens
- [ ] Light + dark visual check for feature modules

---

## Phase 5 — Screen Shell Normalization

### Document screen recipes

- [ ] Create standalone screen-shell cookbook documenting the 3 patterns:
    - Tab screen: `<Screen safeAreaEdges={['bottom']} withKeyboard={false} scrollable>`
    - Form screen: `<Screen safeAreaEdges={['bottom']} withKeyboard scrollable>`
    - Modal screen: `<Screen safeAreaEdges={['top', 'bottom']} scrollable>`

### Migrate `ScrollView` direct usage (was 61 files → 44 remaining)

- [ ] ~17 files already migrated from `ScrollView` to `Screen scrollable`
- [ ] `app/(app)/(tabs)/inventory.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/customers/add.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/finance/bank-accounts/add.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/finance/ewallets.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/finance/loans/[id].tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/finance/payments/make.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/finance/payments/receive.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/finance/purchases/create.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/inventory/[id].tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/inventory/add.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/inventory/import.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/invoices/[id].tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/orders/[id].tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/orders/import.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/all-transactions.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/balance-sheet.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/cashflow.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/day-book.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/expense-summary.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/gst-detail.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/gstr1.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/gstr3b.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/item-profit.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/order-summary.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/party-profit.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/purchase.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/sale.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/reports/stock-summary.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/settings/business-profile.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/settings/expense-categories.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/settings/gst.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/settings/item-categories.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/settings/item-units.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/settings/items.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/settings/party.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/settings/print.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/settings/reminders.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/settings/transactions.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/store/index.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/suppliers/[id].tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/suppliers/add.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/transactions/credit-notes/create.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/transactions/estimates/create.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/transactions/purchase-orders/create.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/utilities/close-fy.tsx` — ScrollView → Screen scrollable
- [ ] `app/(app)/utilities/tally-export.tsx` — ScrollView → Screen scrollable
- [ ] `app/(auth)/setup.tsx` — ScrollView → Screen scrollable

### Standardize `safeAreaEdges` (was 10 combos → now 4)

- [ ] Reduced from 10 unique combos to 4 (`['bottom']`, `['top']`, `['top','bottom']`, `[]`)
- [ ] Further reduce to 3 documented patterns (tab, form, modal) + documented exceptions

### Fix duplicate safe-area padding

- [ ] `app/(app)/invoices/[id].tsx` — uses `['top']` + `ScreenHeader` (double top inset)
- [ ] `app/(app)/reports/index.tsx` — uses `['top', 'bottom']` + `ScreenHeader` (double top inset)
- [ ] `app/(app)/utilities/index.tsx` — uses `['top', 'bottom']` + `ScreenHeader` (double top inset)
- [ ] `app/(app)/orders/[id].tsx` — loading branch: `['top', 'bottom']` + `ScreenHeader` (double top inset)

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

| Phase | Description                | Status              | Done / Total |
| ----- | -------------------------- | ------------------- | ------------ |
| **0** | Theme infrastructure gaps  | **Complete**        | 14/14        |
| **1** | Color derivation cleanup   | **Mostly complete** | 21/24        |
| **2** | Component library cleanup  | **Complete**        | 12/12        |
| **3** | Shared layout primitives   | **Mostly done**     | 12/14        |
| **4** | Screen-by-screen spacing   | **Not started**     | 0/~115       |
| **5** | Screen shell normalization | **In progress**     | 4/52         |
| **6** | Enforcement & CI hardening | **Not started**     | 4/9          |
| **7** | Final audit & sign-off     | **Not started**     | 0/14         |
|       | **Overall**                |                     | **~67/~254** |

---

## Key Findings from Codebase Audit (2026-04-14)

1. **Phase 0 is fully done** — all gap helpers, Z_INDEX scale, FAB constants, opacity tokens, and allowlist file are in place.

2. **rgba() is fully eliminated** — the biggest Phase 1 win. All 30 instances in 21 files are gone from both `app/` and `src/components/`.

3. **Hex concatenation is fully eliminated** — there are now **0** `color + 'XX'` hacks left in UI code.

4. **Palette imports are fully removed from UI code** — screens, components, and features now use `theme.colors` or `theme.collections` instead of importing `@/src/theme/palette` directly.

5. **Shared primitives are now used beyond the component library** — `TableRow` is live in `reports/party-statement` and `reports/gst-detail`, while `FormSection` now structures `customers/add` and `suppliers/add`. Broader rollout still remains.

6. **Per-screen card/sectionHeader duplicates still widespread** — ~20 files still define inline `card` styles, and 4 files still define inline `sectionHeader` styles.

7. **Z-index fully migrated** — all 5 raw `zIndex` usages are replaced with `Z_INDEX.*` constants.

8. **ScrollView migration progressed again** — down from 61 to 44 files after moving `customers/add` and `suppliers/add` onto `Screen scrollable`.

9. **Phase 4 (spacing) is untouched and is ~40% of the total work** — ~1,200+ magic number violations across 120 files.

10. **No enforcement automation exists** — `check-ui-tokens.mjs` script hasn't been created, and the ESLint `no-magic-numbers` ignore list is so broad it effectively allows all common spacing values.
