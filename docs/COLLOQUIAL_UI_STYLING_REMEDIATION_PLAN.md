# Colloquial UI Styling — Full Remediation Plan

**TileMaster — eliminate ad-hoc visual styling ("colloquial" issues)**

This document defines scope, a **100% completion bar**, phased work, enforcement, and QA so the codebase stops accruing one-off spacing, mixed color sources, and screen-local layout hacks. It complements (and does not replace) [`UI_UX_REMEDIATION_PLAN.md`](./UI_UX_REMEDIATION_PLAN.md), which tracks broader product/UI initiatives; **this plan is strictly about systemic styling discipline.**

---

## 0. Current Baseline (audited 2026-04-13)

> This section is the single source of truth for "where we are." Update counts as work lands.

| Category                                          | Metric                      | Count        | Files |
| ------------------------------------------------- | --------------------------- | ------------ | ----- |
| **A. Color: `rgba(` in app/+components/**         | raw rgba calls              | **30**       | 21    |
| **A. Color: hex concatenation** (`c.X + '15'`)    | string hacks                | **16**       | 8     |
| **A. Color: `palette` import outside theme/**     | direct palette              | **0**        | 0     |
| **B. Spacing: raw `gap: N`**                      | magic gap                   | **168+**     | 86+   |
| **B. Spacing: raw `padding*: N`**                 | magic padding               | **300+**     | 89+   |
| **B. Spacing: raw `margin*: N`**                  | magic margin                | **400+**     | 120   |
| **B. Spacing: raw `fontSize: N`**                 | magic font size             | **150+**     | 72+   |
| **B. Spacing: raw `borderRadius: N`**             | magic radius                | **100+**     | 73+   |
| **B. Sizing: raw `width`/`height: N`**            | magic sizing                | **120+**     | 68+   |
| **C. Composition: duplicate `card` style**        | repeated patterns           | **22**       | 22    |
| **C. Composition: duplicate `sectionHeader`**     | repeated patterns           | **7**        | 7     |
| **D. Overlay: `zIndex` magic**                    | ad-hoc z-index              | **5**        | 4     |
| **D. Overlay: `position: 'absolute'`**            | ad-hoc absolute             | ~26          | ~22   |
| **E. Screen shell: `ScrollView` direct**          | bypassing Screen.scrollable | **212** uses | 61    |
| **E. Screen shell: inconsistent `safeAreaEdges`** | 10 unique combos            | varies       | ~50   |

**Total screens:** 110 (104 app + 6 auth). **Total component files:** 47 (14 atoms, 27 molecules, 6 organisms).

**Estimated total magic-number violations:** ~1,300+ across app/ and src/components/.

---

## 1. What "colloquial issues" means

| Category                             | Description                                                                                                                              | Current Status                                                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Mixed color pipelines**         | Same semantic need satisfied via `theme.colors`, `useThemeTokens().c`, `palette` imports, raw `rgba()`, or string hacks (`color + '15'`) | `palette` imports are **clean** (0 outside theme/). `rgba(` in 21 files and hex concatenation in 8 files remain.                                                                                           |
| **B. Magic layout numbers**          | Spacing, radius, width, height, `gap`, `fontSize` as raw numbers not tied to `theme.spacing`, `theme.borderRadius`, `theme.typography`   | **Critical.** 1,200+ violations across ~120 files. Theme tokens exist (`s.xs`..`s.4xl`, `r.xs`..`r.full`, typography variants) but screens overwhelmingly use raw numbers.                                 |
| **C. One-off composition**           | Repeated row/column/section/header patterns reimplemented per screen instead of shared primitives                                        | **High.** 22 files define their own `card` style, 7 define their own `sectionHeader`. Missing: RadioCard, SectionRow, FilterChip primitives.                                                               |
| **D. Stacking / overlay ad-hocness** | `position: 'absolute'`, `zIndex`, negative margins, or fixed heights without shared rules                                                | **Medium.** 5 zIndex values (all `100` or `999`), ~26 absolute positions. No z-index scale defined. No negative margins (good).                                                                            |
| **E. Inconsistent screen shells**    | Different combinations of `Screen`, `ScrollView`, safe-area padding, `KeyboardAvoidingView`, headers                                     | **Medium.** 61 files use `ScrollView` directly instead of `Screen`'s `scrollable` prop. 10 different `safeAreaEdges` combos with no documented default. `withKeyboard` prop used correctly in most places. |

**Out of scope:** copy/i18n, navigation IA, feature behavior, animation polish except where it duplicates magic numbers already covered by theme tokens.

---

## 2. Definition of done — "100%"

Remediation is **complete** when **all** of the following are true.

### 2.1 Color pipeline (single source of truth)

- [x] **No app/feature TSX** imports `palette` (or other parallel color modules) **except** files under `src/theme/` (and tests that stub colors if needed).
- [ ] **No raw `rgba(` in `app/` or `src/components/`** except inside `src/theme/` (semantic tokens may wrap rgba in one place). **Current: 30 instances in 21 files.**
- [ ] **No hex-concatenation hacks** (`color + '15'`, `color + 'CC'`) anywhere in `app/` or `src/components/`. All use `withOpacity()` from `src/utils/color.ts`. **Current: 16 instances in 8 files.**
- [ ] **Semantic intent** uses `theme.colors` / `useThemeTokens().c` only; derived colors use `withOpacity`/`darken` from `src/utils/color.ts`, not string concatenation.

### 2.2 Spacing, radius, typography

- [ ] **No raw numeric `margin*`, `padding*`, `gap` in `app/` and `src/components/`** except:
    - `0` where explicitly meaning "none"
    - Values defined **once** as named constants in `src/theme/` (e.g. `layoutMetrics`, `uiMetrics`) and re-exported through theme or `layout.*`
    - **Current: ~870+ violations (168 gap + 300 padding + 400 margin) across 120 files.**
- [ ] **No raw `fontSize`/`lineHeight`** in `app/` and `src/components/`. All text uses `ThemedText` with `variant` prop, or `theme.typography.sizes.*` for the rare exception. **Current: 150+ violations in 72 files.**
- [ ] **No raw `borderRadius`** — all use `theme.borderRadius` (`r.*`). **Current: 100+ violations in 73 files.**
- [ ] **No raw `width`/`height`** for recurring UI elements — use named constants from `uiMetrics.ts`. One-off layout dimensions (e.g. modal max-height) defined once as named constants. **Current: 120+ violations in 68 files.**
- [ ] **All** spacing uses `theme.spacing` (`s.*`), `layout.gap*` helpers, or named `uiMetrics` constants.

### 2.3 Layout primitives

- [ ] **Shared primitives exist and are used** for recurring patterns (minimum set):
    - `SectionHeader` — replaces 7+ per-screen sectionHeader style definitions
    - `SettingsCard` / `OptionCard` — replaces 22+ per-screen card definitions (especially preferences/settings screens)
    - Standard list row wrapper (padding + separator from tokens)
    - Report / dense table row (uniform column sizing from tokens)
    - Stacked form section (title + body gap from tokens)
- [ ] **`src/theme/layout.ts`** expanded to cover **all** recurring gap sizes: currently only `gap4`, `gap8`, `gap12`, `gap16` — add `gap2` (xs), `gap24` (xl), `gap32` (2xl) to match the `SPACING_PX` scale.
- [ ] **No free `gap: N`** in screens — all use `layout.gap*` or `{ gap: s.xx }`.

### 2.4 Screen shells

- [ ] **Documented default recipe**: `<Screen safeAreaEdges={['bottom']} withKeyboard={false}>` for tab screens, `<Screen safeAreaEdges={['bottom']} withKeyboard>` for form screens, `<Screen safeAreaEdges={['top', 'bottom']}>` for modal screens.
- [ ] **All 61 files** that currently use `ScrollView` directly migrate to `Screen`'s `scrollable` prop (or are documented in allowlist with rationale).
- [ ] **Standardized `safeAreaEdges`**: reduce from 10 unique combos to **3 documented patterns** (tab, form, modal). Exceptions in allowlist.
- [ ] **No duplicate safe-area padding** (`Screen` + manual `paddingTop` for the same edge) unless allowlisted.

### 2.5 Overlay & z-index discipline

- [ ] **Z-index scale defined** in `src/theme/uiMetrics.ts`: `Z_BASE: 0`, `Z_DROPDOWN: 10`, `Z_STICKY: 50`, `Z_OVERLAY: 100`, `Z_MODAL: 200`, `Z_TOAST: 300`, `Z_MAX: 999`.
- [ ] **All 5 current zIndex usages** replaced with named constants.
- [ ] **FAB / overlay positioning** uses shared constants from `uiMetrics.ts` (e.g. `FAB_OFFSET_RIGHT`, `FAB_OFFSET_BOTTOM`).

### 2.6 Enforcement automation

- [ ] **ESLint custom rules or `check:ui-tokens` script** in CI that fails on:
    - `rgba(` in `app/` or `src/components/` (outside allowlist)
    - String concatenation on color values (`+ '` pattern after color variable)
    - Raw numeric values for `gap`, `padding*`, `margin*`, `fontSize`, `borderRadius` in `app/` and `src/components/` (extend existing `no-magic-numbers` rule or add custom script)
- [ ] **`check:hex`** script (already exists in `package.json`) continues to block raw hex.
- [ ] **`validate`** script in `package.json` includes all token checks.
- [ ] **Husky pre-commit** runs token checks on staged files.

### 2.7 Verification

- [ ] **Spot checklist** (manual): representative screens per area — Dashboard, Finance index, Reports index, Customers list, Invoice create/detail, Settings, Auth flow — on **light + dark** + **small (iPhone SE) + large (iPhone 15 Pro Max)**.
- [ ] **No visual regressions** — existing snapshot/visual tests pass; new snapshots for any new primitives.
- [ ] All `ThemedText` variants render correctly in both themes.

---

## 3. Guiding principles

1. **Tokens first** — extend `Theme` / `layout` / `uiMetrics` before adding a new magic number.
2. **Bottom-up migration** — atoms -> molecules -> organisms -> features -> `app/` screens; **never** copy-paste token maps into a screen.
3. **One PR, one vertical slice** — e.g. "all reports screens" or "all settings screens" — reduces merge pain and makes review deterministic.
4. **Allowlists over exceptions** — if something must break a rule temporarily, it lives in `docs/COLLOQUIAL_UI_ALLOWLIST.md` with a ticket reference.
5. **Measure -> migrate -> enforce** — never turn on a lint rule before the codebase passes it.

---

## 4. Phase plan

### Phase 0 — Theme infrastructure gaps (1-2 days)

**Goal:** Fill gaps in the token system so migration has somewhere to land.

**Tasks:**

1. **Extend `layout.ts` gap helpers** to match full `SPACING_PX` scale:

    ```typescript
    // Add to layout.ts:
    gap2: { gap: 2 },    // micro (dividers, tight icon rows)
    gap24: { gap: 24 },  // xl
    gap32: { gap: 32 },  // 2xl
    gap48: { gap: 48 },  // 3xl
    ```

2. **Add z-index scale** to `uiMetrics.ts`:

    ```typescript
    export const Z_INDEX = {
    	base: 0,
    	dropdown: 10,
    	sticky: 50,
    	overlay: 100,
    	modal: 200,
    	toast: 300,
    	max: 999,
    } as const;
    ```

3. **Add FAB positioning constants** to `uiMetrics.ts`:

    ```typescript
    export const FAB_OFFSET_RIGHT = 20;
    export const FAB_OFFSET_BOTTOM = 20;
    ```

4. **Add missing opacity tokens** if any `rgba()` in screens express opacity not covered by existing `OPACITY_*` constants in `uiMetrics.ts`. Audit the 30 rgba calls and add needed tokens.

5. **Create `docs/COLLOQUIAL_UI_ALLOWLIST.md`** — empty except for process description. Only place for temporary exceptions.

**Exit criteria:** `layout.ts` has gap helpers for all spacing scale values. `uiMetrics.ts` has z-index scale and FAB constants. Allowlist file exists.

---

### Phase 1 — Color derivation cleanup (1-2 days)

**Goal:** Category A at zero outside `src/theme/`.

**Scope:** 30 `rgba(` instances in 21 files + 16 hex-concatenation hacks in 8 files = **46 total fixes**.

**Tasks:**

1. **Audit all 30 `rgba(` calls.** For each:
    - If it expresses a semantic color (e.g. `rgba(255,255,255,0.2)` for a glass effect), add a named token to `lightColors`/`darkColors` (e.g. `colors.glassWhite`) or use `withOpacity(c.surface, 0.2)`.
    - If it expresses a shadow color, keep in `shadowMetrics.ts`.

2. **Replace all 16 hex-concatenation hacks** with `withOpacity()`:
   | File | Current | Replacement |
   |---|---|---|
   | `utilities/tally-export.tsx:97` | `c.primary + '15'` | `withOpacity(c.primary, 0.08)` |
   | `utilities/calculator.tsx:319` | `c.primary + '15'` | `withOpacity(c.primary, 0.08)` |
   | `utilities/verify.tsx:169` | `c.success + '18'` | `withOpacity(c.success, 0.09)` |
   | `transactions/purchase-orders/create.tsx:264` | `c.primary + '10'` | `withOpacity(c.primary, 0.06)` |
   | `finance/loans/index.tsx:55` | `badgeColor + '22'` | `withOpacity(badgeColor, 0.13)` |
   | `finance/loans/[id].tsx:86,200,269` | various `+ '18'`/`+ '60'` | `withOpacity(...)` |
   | `finance/transfer.tsx:43,164,166` | `c.primary + '15'`/`'10'`/`'30'` | `withOpacity(c.primary, ...)` |
   | `finance/ewallets.tsx:157` | `item.color + '22'` | `withOpacity(item.color, 0.13)` |
   | `orders/index.tsx:120` | `c.success + '15'` | `withOpacity(c.success, 0.08)` |
   | `reports/order-summary.tsx:67` | `c.primary + '22'` | `withOpacity(c.primary, 0.13)` |
   | `reports/stock-summary.tsx:294` | `c.error + '22'` | `withOpacity(c.error, 0.13)` |

3. **Verify light + dark** on 3 pilot screens (login, store, inventory) after all changes.

**Exit criteria:** `grep -r "rgba(" app/ src/components/` returns 0. `grep -rP "\+\s*'" app/ src/components/` on color variables returns 0. Both themes render correctly.

---

### Phase 2 — Component library cleanup (2-3 days)

**Goal:** All atoms, molecules, and organisms use tokens exclusively. No raw numbers in `src/components/`.

**Scope:** ~50 violations across 20+ component files.

**Tasks by file (prioritized by impact):**

1. **Atoms (14 files):** Audit and fix:
    - `Button.tsx` — raw width/height -> `uiMetrics` constants
    - `IconButton.tsx` — raw margin -> `s.*`
    - `TextInput.tsx` — raw margin/padding -> `s.*`
    - `ErrorBoundary.tsx` — raw margin -> `s.*`
    - `SyncIndicator.tsx` — zIndex -> `Z_INDEX.toast`

2. **Molecules (27 files):** Audit and fix:
    - `Toast.tsx` — raw `rgba(` in shadow -> `shadowMetrics`, palette import -> `c.shadow`
    - `ScreenHeader.tsx` — raw margin -> `s.*`
    - `DatePickerField.tsx` — raw fontSize -> typography variant
    - `BottomSheetPicker.tsx` — raw width/height -> `uiMetrics`
    - `AmountInput.tsx`, `FormField.tsx`, `ListItem.tsx`, `PhoneInput.tsx`, `SearchBar.tsx`, `StatCard.tsx`, `TextAreaField.tsx` — raw margins -> `s.*`
    - `ConfirmationModal.tsx` — card style -> tokens
    - `EmptyState.tsx`, `PaginatedList.tsx` — raw margins -> `s.*`
    - All skeleton components — raw rgba -> tokens

3. **Organisms (6 files):** Audit and fix:
    - `DashboardHeader.tsx` — 2 raw `rgba(` + raw width/height
    - `PaymentModal.tsx` — 2 raw `rgba(`
    - `ConflictModal.tsx` — 1 raw `rgba(`
    - `TileSetCard.tsx` — card style -> tokens
    - `RecentInvoicesList.tsx` — margins -> `s.*`

**Exit criteria:** `grep -rP "(gap|padding|margin|fontSize|borderRadius):\s*\d" src/components/` returns 0 (or only allowlisted). `grep -r "rgba(" src/components/` returns 0.

---

### Phase 3 — Shared layout primitives (2-3 days)

**Goal:** Categories C and D — create shared primitives and z-index discipline.

**Tasks:**

1. **Create `SectionHeader` molecule** (`src/components/molecules/SectionHeader.tsx`):
    - Props: `title`, `subtitle?`, `action?` (button/link), `variant` ('default' | 'uppercase')
    - Uses `ThemedText` variant `label` or `caption`, `s.lg` horizontal padding, `s.md` vertical
    - Replaces 7+ per-screen `sectionHeader` style definitions

2. **Create `SettingsCard` molecule** (`src/components/molecules/SettingsCard.tsx`):
    - Props: `children`, `selected?`, `onPress`, `title?`, `subtitle?`
    - Wraps `Card` atom with standardized padding, border, selection state
    - Replaces 22+ per-screen `card` style definitions in settings/preferences

3. **Create `TableRow` molecule** (`src/components/molecules/TableRow.tsx`):
    - Props: `columns: { label, value, flex? }[]`, `variant` ('default' | 'header' | 'total')
    - Fixed column sizing from theme, consistent padding
    - For report screens (stock-summary, all-transactions, party-statement, etc.)

4. **Create `FormSection` molecule** (`src/components/molecules/FormSection.tsx`):
    - Props: `title`, `children`
    - `SectionHeader` + vertical gap from tokens + optional divider
    - For create/edit screens (invoice, purchase, payment, etc.)

5. **Replace all 5 zIndex usages** with `Z_INDEX.*` constants:
    - `finance/payments/make.tsx:360` — `zIndex: 100` -> `Z_INDEX.overlay`
    - `finance/payments/receive.tsx:356` — `zIndex: 100` -> `Z_INDEX.overlay`
    - `finance/purchases/create.tsx:529` — `zIndex: 100` -> `Z_INDEX.overlay`
    - `finance/purchases/[id].tsx:694` — `zIndex: 100` -> `Z_INDEX.overlay`
    - `atoms/SyncIndicator.tsx:130` — `zIndex: 1` -> `Z_INDEX.base` or remove

6. **Consolidate FAB positioning** across `inventory.tsx` and any other FAB users to use `FAB_OFFSET_*` constants.

**Exit criteria:** New primitives exist with tests. At least 3 screens each migrated to `SectionHeader` and `SettingsCard` as proof-of-concept. All zIndex magic numbers eliminated.

---

### Phase 4 — Screen-by-screen spacing migration (2-4 weeks wall-clock)

**Goal:** Category B at zero across all 110 screens. This is the largest phase.

**Approach:** Migrate in vertical slices, one PR per slice. Within each slice, replace all raw `gap`, `padding*`, `margin*`, `fontSize`, `borderRadius`, and `width`/`height` values with theme tokens.

**Token mapping cheat sheet:**
| Raw value | Token | Shorthand |
|---|---|---|
| `2` | `SPACING_PX.xs / 2` or add `xxs: 2` | — |
| `4` | `theme.spacing.xs` | `s.xs` |
| `6` | `(s.xs + s.sm) / 2` -> add `s.xsm: 6` or use `s.xs` | Round to nearest |
| `8` | `theme.spacing.sm` | `s.sm` |
| `10` | Use `s.sm` (8) or `s.md` (12) | Round to nearest |
| `12` | `theme.spacing.md` | `s.md` |
| `14` | Use `s.md` (12) or `s.lg` (16) | Round to nearest |
| `16` | `theme.spacing.lg` | `s.lg` |
| `20` | Use `s.lg` (16) or `s.xl` (24) | Round to nearest |
| `24` | `theme.spacing.xl` | `s.xl` |
| `32` | `theme.spacing['2xl']` | `s['2xl']` |
| `48` | `theme.spacing['3xl']` | `s['3xl']` |
| `64` | `theme.spacing['4xl']` | `s['4xl']` |

**fontSize mapping:**
| Raw value | Typography variant or token |
|---|---|
| `11` | `ThemedText variant="captionSmall"` or `FONT_SIZE.captionSmall` |
| `12-13` | `ThemedText variant="label"` or `FONT_SIZE.label` |
| `14` | `ThemedText variant="caption"` or `FONT_SIZE.caption` |
| `16` | `ThemedText variant="body"` or `FONT_SIZE.body` |
| `18` | `ThemedText variant="h3"` or `FONT_SIZE.h3` |
| `20` | `ThemedText variant="h2"` or `FONT_SIZE.h2` |
| `22-24` | `ThemedText variant="h1"` or `FONT_SIZE.h1` |
| `28-30` | `ThemedText variant="display"` or `FONT_SIZE.display` |

**borderRadius mapping:**
| Raw value | Token |
|---|---|
| `2` | `r.xs` |
| `4` | `r.sm` |
| `6` | Use `r.sm` (4) or `r.md` (8) |
| `8` | `r.md` |
| `10` | Use `r.md` (8) or `r.lg` (12) |
| `12` | `r.lg` |
| `16` | `r.xl` |
| `20+` | `r.xl` or `r.full` |
| `9999` / `999` | `r.full` |

**Migration order (by slice):**

| Slice                             | Files                                                                              | Est. violations | Priority                     |
| --------------------------------- | ---------------------------------------------------------------------------------- | --------------- | ---------------------------- |
| **S1. Auth screens**              | 6 files (`login`, `phone-login`, `setup`, `verify`, `language-select`, `_layout`)  | ~60             | High (first impression)      |
| **S2. Tab screens**               | 7 files (`_layout`, `index`, `inventory`, `invoices`, `customers`, `more`, `scan`) | ~80             | High (most used)             |
| **S3. Settings screens**          | 18 files                                                                           | ~150            | High (most card duplicates)  |
| **S4. Finance screens**           | 24 files                                                                           | ~180            | Medium                       |
| **S5. Reports screens**           | 18 files                                                                           | ~200            | Medium (most table patterns) |
| **S6. Transaction screens**       | 9 files                                                                            | ~70             | Medium                       |
| **S7. Customer/Supplier screens** | 7 files                                                                            | ~50             | Medium                       |
| **S8. Invoice screens**           | 2 files                                                                            | ~30             | Medium                       |
| **S9. Order screens**             | 3 files                                                                            | ~40             | Medium                       |
| **S10. Utility screens**          | 5 files                                                                            | ~40             | Low                          |
| **S11. Store screens**            | 2 files                                                                            | ~30             | Low                          |
| **S12. Feature modules**          | 7 files (`src/features/`)                                                          | ~20             | Low                          |

**Per-slice checklist:**

- [ ] All `gap: N` -> `layout.gap*` or `{ gap: s.* }`
- [ ] All `padding*: N` -> `s.*`
- [ ] All `margin*: N` -> `s.*`
- [ ] All `fontSize: N` -> `ThemedText variant=*` or `FONT_SIZE.*`
- [ ] All `borderRadius: N` -> `r.*`
- [ ] All `width/height: N` (recurring) -> `uiMetrics` constant or `s.*`
- [ ] Replace per-screen `card` / `sectionHeader` styles with shared primitives from Phase 3
- [ ] Light + dark visual check
- [ ] No `Text` component used where `ThemedText` should be

**Exit criteria:** Scripted search for raw numeric styling values in `app/` and `src/features/` returns 0 (or only allowlisted lines).

---

### Phase 5 — Screen shell normalization (3-5 days)

**Goal:** Category E — consistent screen shell usage.

**Tasks:**

1. **Document the 3 screen recipes:**
    - **Tab screen:** `<Screen safeAreaEdges={['bottom']} withKeyboard={false} scrollable>` — for list/browse screens under tab bar
    - **Form screen:** `<Screen safeAreaEdges={['bottom']} withKeyboard scrollable>` — for create/edit screens with text inputs
    - **Modal screen:** `<Screen safeAreaEdges={['top', 'bottom']} scrollable>` — for modal presentations

2. **Migrate 61 files** that use `ScrollView` directly:
    - Replace `<ScrollView>...</ScrollView>` with `<Screen scrollable>` and move `contentContainerStyle` to Screen's prop.
    - Remove redundant `import { ScrollView }`.
    - If a screen has both `Screen` + nested `ScrollView`, consolidate to `Screen scrollable`.

3. **Standardize `safeAreaEdges`:**
    - Audit all 50 Screen usages and align to the 3 recipes.
    - Exceptions go in `docs/COLLOQUIAL_UI_ALLOWLIST.md`.

4. **Fix duplicate safe-area padding** — any screen that does `Screen safeAreaEdges={['top']}` + manual `paddingTop: insets.top`.

**Exit criteria:** `grep -r "ScrollView" app/` returns only allowlisted files. All screens conform to one of 3 documented recipes.

---

### Phase 6 — Enforcement & CI hardening (2-3 days)

**Goal:** Colloquial regressions cannot merge silently.

**Tasks:**

1. **Create `scripts/check-ui-tokens.mjs`** that scans `app/` and `src/components/` for:
    - `rgba(` outside `src/theme/`
    - Color string concatenation patterns (`+ '` after color variable)
    - Raw numeric `gap`, `padding*`, `margin*`, `fontSize`, `borderRadius` (configurable allowlist)
    - `ScrollView` import in `app/` (outside allowlist)
    - `zIndex` with raw numeric value (outside allowlist)

2. **Add to `package.json`:**

    ```json
    "check:ui-tokens": "node scripts/check-ui-tokens.mjs"
    ```

3. **Add to `validate` script** chain (alongside existing `check:hex`, `check:routes`).

4. **Husky pre-commit**: add `check:ui-tokens` to staged-file checks.

5. **Extend existing ESLint `no-magic-numbers` config**: tighten the ignore list in `eslint.config.js` to remove styling-related values (currently the ignore list is very broad with values 0-1000+). After Phase 4, the codebase should pass with a stricter config.

**Exit criteria:** `pnpm run validate` fails on any new colloquial violation. CI blocks PRs with violations.

---

### Phase 7 — Final audit & sign-off (1-2 days)

**Goal:** Close the project.

**Tasks:**

1. **Re-run baseline audit** — update the table in §0 with final counts (all should be 0 or allowlisted).
2. **Mark all §2 checkboxes** as `[x]`.
3. **Design QA session:** Walk through these screens in light + dark, on iPhone SE + iPhone 15 Pro Max:
    - Dashboard (index tab)
    - Invoice list + create + detail
    - Customer list + detail
    - Inventory list + detail
    - Finance index + cash + payments
    - Reports index + stock-summary + all-transactions
    - Settings index + preferences + business-profile
    - Auth flow (login + setup)
    - Store
4. **Confirm no visual regressions** in snapshot tests.
5. **Archive `docs/COLLOQUIAL_UI_ALLOWLIST.md`** — should be empty or near-empty.

**Exit criteria:** Stakeholder sign-off. Optional git tag `ui-tokens-v1`.

---

## 5. Existing theme API reference

Quick reference for migration work. This is what the codebase already provides.

### Hooks

| Hook               | Location                      | Returns                                              | Use when                                   |
| ------------------ | ----------------------------- | ---------------------------------------------------- | ------------------------------------------ |
| `useTheme()`       | `src/theme/ThemeProvider.tsx` | `{ theme, isDark, mode, setThemeMode, toggleTheme }` | Need full theme object or mode controls    |
| `useThemeTokens()` | `src/hooks/useThemeTokens.ts` | `{ theme, isDark, c, s, r, typo, shadows }`          | Screens/components — preferred for brevity |

### Spacing tokens (`s.*` via `useThemeTokens`)

| Token      | Value | Use for                                               |
| ---------- | ----- | ----------------------------------------------------- |
| `s.xs`     | 4     | Tight gaps (icon-to-label, divider margins)           |
| `s.sm`     | 8     | Small gaps (chip spacing, compact lists)              |
| `s.md`     | 12    | Medium gaps (form field spacing)                      |
| `s.lg`     | 16    | Standard content padding (screen edges, card padding) |
| `s.xl`     | 24    | Section spacing                                       |
| `s['2xl']` | 32    | Large section breaks                                  |
| `s['3xl']` | 48    | Hero/header spacing                                   |
| `s['4xl']` | 64    | Page-level top/bottom                                 |

### Border radius tokens (`r.*`)

| Token    | Value | Use for             |
| -------- | ----- | ------------------- |
| `r.none` | 0     | Square corners      |
| `r.xs`   | 2     | Subtle rounding     |
| `r.sm`   | 4     | Chips, small badges |
| `r.md`   | 8     | Cards, inputs       |
| `r.lg`   | 12    | Modals, sheets      |
| `r.xl`   | 16    | Large cards         |
| `r.full` | 9999  | Pills, circles      |

### Typography variants (via `ThemedText variant=*`)

| Variant          | Size | Use for                      |
| ---------------- | ---- | ---------------------------- |
| `display`        | 30   | Hero numbers                 |
| `h1`             | 24   | Screen titles                |
| `h2`             | 20   | Section titles               |
| `h3`             | 18   | Card titles                  |
| `body`           | 16   | Body text                    |
| `bodyBold`       | 16   | Emphasized body              |
| `caption`        | 14   | Secondary text               |
| `captionBold`    | 14   | Emphasized secondary         |
| `label`          | 13   | Form labels, section headers |
| `captionSmall`   | 11   | Tertiary text, timestamps    |
| `amount`         | 20   | Currency amounts             |
| `amountLarge`    | 28   | Hero amounts                 |
| `amountNegative` | 20   | Negative amounts (red)       |

### Layout utilities (`layout.*`)

| Utility                    | Description                                  |
| -------------------------- | -------------------------------------------- |
| `layout.row`               | `flexDirection: 'row', alignItems: 'center'` |
| `layout.rowBetween`        | `row` + `justifyContent: 'space-between'`    |
| `layout.rowEnd`            | `row` + `justifyContent: 'flex-end'`         |
| `layout.rowStart`          | `row` + `justifyContent: 'flex-start'`       |
| `layout.colCenter`         | Column centered both axes                    |
| `layout.center`            | Center both axes                             |
| `layout.flex`              | `flex: 1`                                    |
| `layout.absoluteFill`      | Full absolute positioning                    |
| `layout.gap4` thru `gap16` | Gap helpers (expand in Phase 0)              |

### Color utilities (`src/utils/color.ts`)

| Function                      | Use for                                                       |
| ----------------------------- | ------------------------------------------------------------- |
| `withOpacity(color, opacity)` | Replace `rgba()` calls and hex concatenation (`color + '15'`) |
| `darken(hexColor, factor)`    | Darken a color by factor (0-1)                                |

---

## 6. Migration order (recommended)

1. `src/components/atoms/*` (Phase 2)
2. `src/components/molecules/*` (Phase 2)
3. `src/components/organisms/*` (Phase 2)
4. `src/features/*` (Phase 4, Slice S12)
5. `app/(auth)/*` (Phase 4, Slice S1)
6. `app/(app)/(tabs)/*` (Phase 4, Slice S2)
7. `app/(app)/settings/*` (Phase 4, Slice S3)
8. `app/(app)/finance/*` (Phase 4, Slice S4)
9. `app/(app)/reports/*` (Phase 4, Slice S5)
10. `app/(app)/transactions/*` (Phase 4, Slice S6)
11. `app/(app)/customers/*` + `suppliers/*` (Phase 4, Slice S7)
12. `app/(app)/invoices/*` (Phase 4, Slice S8)
13. `app/(app)/orders/*` (Phase 4, Slice S9)
14. `app/(app)/utilities/*` (Phase 4, Slice S10)
15. `app/(app)/store/*` (Phase 4, Slice S11)

Within each folder: **files with most violations first** (see §0 baseline for top offenders).

---

## 7. Top 20 worst offenders (by total violations)

Files to prioritize within each slice:

| Rank | File                                          | Est. violations                                  |
| ---- | --------------------------------------------- | ------------------------------------------------ |
| 1    | `app/(auth)/setup.tsx`                        | ~35 (19 fontSize + 11 padding + 5 sizing)        |
| 2    | `app/(app)/reports/stock-summary.tsx`         | ~30 (15 padding + 6 gap + 4 fontSize + 4 sizing) |
| 3    | `app/(app)/reports/party-statement.tsx`       | ~28 (15 padding + margin + fontSize)             |
| 4    | `app/(app)/settings/users.tsx`                | ~28 (13 padding + 10 radius + 3 fontSize)        |
| 5    | `app/(app)/reports/party-profit.tsx`          | ~25                                              |
| 6    | `app/(app)/reports/all-transactions.tsx`      | ~25 (13 padding + 3 gap + fontSize)              |
| 7    | `app/(app)/reports/order-summary.tsx`         | ~24 (12 padding + 6 gap + sizing)                |
| 8    | `app/(app)/reports/gst-detail.tsx`            | ~24 (12 padding + 6 gap + sizing)                |
| 9    | `app/(app)/settings/preferences.tsx`          | ~22 (14 fontSize + padding + radius)             |
| 10   | `app/(app)/inventory/[id].tsx`                | ~22 (12 padding + rgba + sizing)                 |
| 11   | `app/(app)/store/index.tsx`                   | ~22 (8 gap + padding + rgba + sizing)            |
| 12   | `app/(app)/orders/import.tsx`                 | ~20 (11 padding + 9 fontSize + 8 radius)         |
| 13   | `app/(app)/finance/ewallets.tsx`              | ~20 (11 padding + 6 fontSize + rgba)             |
| 14   | `app/(app)/settings/reminders.tsx`            | ~20 (11 padding + 6 radius + 3 gap)              |
| 15   | `app/(app)/finance/bank-accounts/add.tsx`     | ~18 (11 padding + 3 fontSize + sizing)           |
| 16   | `app/(app)/reports/sale.tsx`                  | ~18 (11 padding + 5 gap)                         |
| 17   | `app/(app)/reports/purchase.tsx`              | ~18 (11 padding + 4 gap)                         |
| 18   | `app/(app)/reports/item-profit.tsx`           | ~18 (11 padding + 5 gap)                         |
| 19   | `app/(app)/transactions/estimates/create.tsx` | ~18 (10 padding + 3 gap + 3 fontSize)            |
| 20   | `app/(app)/utilities/calculator.tsx`          | ~17 (5 gap + 7 fontSize + rgba)                  |

---

## 8. Risk & mitigation

| Risk                                        | Mitigation                                                                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Huge blast radius (120 files)               | Phase per vertical slice; one PR per slice; feature flags only if needed for risky screens                                                           |
| Dark mode breaks                            | Phase 1 pilot on 3 screens before mass replace; every slice PR tested in both themes                                                                 |
| Non-standard spacing values (6, 10, 14, 20) | Round to nearest token; document the mapping in §4 Phase 4 cheat sheet. If a value is genuinely unique, add it to `uiMetrics.ts` as a named constant |
| Performance (`useThemeTokens` every render) | Already optimized; memoized style arrays where profiling shows need                                                                                  |
| Designer churn                              | Lock tokens in `src/theme/`; product changes go through token updates, not screen edits                                                              |
| Merge conflicts during migration            | One slice at a time; keep PRs under 10 files; rebase before merge                                                                                    |
| ScrollView migration breaks scroll behavior | Test each screen individually; some screens may need `keyboardShouldPersistTaps` or `nestedScrollEnabled` — add to Screen props if missing           |

---

## 9. Relationship to other docs

- **[`UI_UX_REMEDIATION_PLAN.md`](./UI_UX_REMEDIATION_PLAN.md)** — product-facing UI work, components, animations; may assume tokens from **this** plan.
- **`layoutMetrics.ts` / `shadowMetrics.ts` / `uiMetrics.ts`** — numeric constants belong in these modules, not in screens.
- **`src/theme/layout.ts`** — static layout utilities (row/column/gap helpers).

---

## 10. Maintenance after 100%

- **New feature checklist:** (1) No new `rgba(` or hex concatenation in app code. (2) No new raw color/spacing/sizing numbers — add token first. (3) Use `Screen` + shared primitives. (4) Use `ThemedText` with variant, never raw `Text` + `fontSize`.
- **PR review rule:** Any new file in `app/` or `src/components/` must pass `check:ui-tokens`.
- **Quarterly:** 30-minute grep audit + remove stale allowlist entries.
- **If adding a new spacing value:** Add to `SPACING_PX` in `layoutMetrics.ts`, corresponding gap helper in `layout.ts`, update §5 reference table in this doc.

---

_Last updated: 2026-04-13 — living document; update Phase completion, §0 baseline counts, and §2 checkboxes as work lands._
