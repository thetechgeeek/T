# Colloquial UI Styling — Full Remediation Plan

**TileMaster — eliminate ad-hoc visual styling (“colloquial” issues)**

This document defines scope, a **100% completion bar**, phased work, enforcement, and QA so the codebase stops accruing one-off spacing, mixed color sources, and screen-local layout hacks. It complements (and does not replace) [`UI_UX_REMEDIATION_PLAN.md`](./UI_UX_REMEDIATION_PLAN.md), which tracks broader product/UI initiatives; **this plan is strictly about systemic styling discipline.**

---

## 1. What “colloquial issues” means

| Category                             | Description                                                                                                                                  | Examples in this repo                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **A. Mixed color pipelines**         | The same semantic need satisfied via `theme.colors`, `useThemeTokens().c`, `palette` imports, raw `rgba()`, or string hacks (`color + '15'`) | Screens importing `palette` while others use tokens; scattered `rgba(` in TSX |
| **B. Magic layout numbers**          | Spacing, radius, width, height, `gap`, `fontSize` as raw numbers not tied to `theme.spacing`, `theme.borderRadius`, `theme.typography`       | `gap: 8`, `padding: 12`, `marginTop: 24` alongside `s.md`                     |
| **C. One-off composition**           | Repeated row/column/section/header patterns reimplemented per screen instead of shared primitives                                            | Duplicate “section header + card + list” stacks across reports/finance        |
| **D. Stacking / overlay ad-hocness** | `position: 'absolute'`, `zIndex`, negative margins, or fixed heights without shared rules                                                    | Overlaps and clipped content from unconstrained flex + absolute children      |
| **E. Inconsistent screen shells**    | Different combinations of `Screen`, `ScrollView`, safe-area padding, `KeyboardAvoidingView`, headers                                         | Double insets, content under tab bar, scroll vs non-scroll mismatch           |

**Out of scope for “100%” here (track elsewhere):** copy/i18n, navigation IA, feature behavior, animation polish except where it duplicates magic numbers already covered by theme tokens.

---

## 2. Definition of done — “100%”

Remediation is **complete** when **all** of the following are true.

### 2.1 Color pipeline (single source of truth)

- [ ] **No app/feature TSX** imports `palette` (or other parallel color modules) **except** files under `src/theme/` (and tests that stub colors if needed).
- [ ] **No raw `rgba(` / `#hex` in `app/` or `src/components/`** except inside `src/theme/` (semantic tokens may wrap rgba in one place).
- [ ] **Semantic intent** uses `theme.colors` / `useThemeTokens().c` only; derived colors use `src/utils/color.ts` (`withOpacity`, etc.), not string concatenation on hex.

### 2.2 Spacing, radius, type

- [ ] **No raw numeric `margin*`, `padding*`, `gap`, `width`/`height` (and no raw `fontSize`/`lineHeight`) in `app/` and `src/components/`** except:
    - `0` where explicitly meaning “none”
    - Values defined **once** as named constants in `src/theme/` (e.g. `layoutMetrics`, `typography` variants) and re-exported through theme or `layout.*`
- [ ] **All** such styling uses `theme.spacing` (`s.*`), `theme.borderRadius` (`r.*`), and `ThemedText` variants / `theme.typography` — not ad-hoc text sizing.

### 2.3 Layout primitives

- [ ] **Shared primitives exist and are used** for recurring patterns (minimum set):
    - Section label / section header (replaces per-screen `SectionHeader`-style copies)
    - Standard list row wrapper (padding horizontal + separator alignment)
    - Report / dense table row (if applicable)
    - Stacked form section (title + body gap from tokens)
- [ ] **`src/theme/layout.ts`** (or successor) exposes **gap** and **stack** helpers for every gap size used in product (`gap4` … or `gap('sm')` API) — **no** free `gap: N` in screens.

### 2.4 Screen shells

- [ ] **Documented pattern** for: scroll vs fixed, keyboard, safe area edges — one default recipe in `Screen` docs + **all** routes conform (exceptions listed in a short allowlist file with rationale).
- [ ] **No duplicate safe-area padding** (e.g. `Screen` + manual `paddingTop` for the same edge) unless allowlisted.

### 2.5 Enforcement automation

- [ ] **ESLint** (or similar) rules or custom script in CI fail on:
    - `from '.../palette'` or `@/src/theme/palette` outside allowlist
    - `#([0-9a-fA-F]{3,8})` in `app/`, `src/components/`
    - Optional: ban `rgba(` outside `src/theme/`
- [ ] **`package.json` script** (e.g. `pnpm run check:ui-tokens`) runs in CI with the rest of the test/lint pipeline.

### 2.6 Verification

- [ ] **Spot checklist** (manual): N representative screens per area — Finance, Reports, Customers, Invoice flow, Settings — on **light + dark** + **small + large** device class.
- [ ] **No regressions** on snapshot/visual tests where they exist; add snapshots for new primitives if the project adopts them.

---

## 3. Guiding principles

1. **Tokens first** — extend `Theme` / `layout` / utilities before adding a new magic number.
2. **Bottom-up migration** — atoms → molecules → organisms → `app/` screens; **never** copy-paste token maps into a screen.
3. **One PR, one slice** — vertical slices (e.g. “all finance index screens”) reduce merge pain and make review deterministic.
4. **Allowlists over exceptions** — if something must break a rule temporarily, it lives in a single audited file with a ticket reference.

---

## 4. Phase plan

### Phase 0 — Inventory & baselines (1–2 days)

**Goal:** Measurable baseline so “100%” is auditable.

- Run counts / scripts: occurrences of `palette` import, `rgba(`, `#` in TSX, raw `gap:` / `padding:` numbers (regex + manual sampling).
- Export list of **top 20 files** by inline magic numbers (prioritize `app/`).
- Add **`docs/COLLOQUIAL_UI_ALLOWLIST.md`** (or section in this file): empty except for process — **only** place for temporary exceptions.

**Exit:** Baseline table committed; CI script stub exists (may warn-only).

---

### Phase 1 — Unify color derivation (2–5 days)

**Goal:** Category A at zero outside theme.

- Move any **necessary** raw rgba/hex into **`src/theme/`** as named tokens (e.g. `colors.scrim`, `colors.overlay`, chart tints if any).
- Replace **`color + '15'`**-style hacks with **`withOpacity`** (or documented helper) after auditing `src/utils/color.ts` for `rgba`/hex inputs.
- **Codemod or scripted replace:** `palette.X` → `c.X` / new semantic token where mapping is 1:1; where not, add missing keys to `ThemeColors` once.
- Delete redundant imports from screens.

**Exit:** Grep shows **zero** `palette` imports outside `src/theme/`; theme builds for light/dark without visual regression on pilot screens.

---

### Phase 2 — Spacing, radius, typography sweep (ongoing; 2–4 weeks wall-clock)

**Goal:** Category B at zero (subject to §2.2 allowlist).

- Extend **`layout.ts`** / theme spacing so every recurring number has a name (`gap8` → prefer `gap('sm')` or `layout.gap.sm` if you refactor to a single API).
- Replace **screen by screen** in batches: Finance → Reports → Settings → Transactions → Auth.
- Prefer **`ThemedText`** + variants over `Text` + `fontSize`.

**Exit:** Scripted search for `gap:\s*[0-9]` and `padding:\s*[0-9]` in `app/` returns empty (or only allowlisted lines).

---

### Phase 3 — Layout primitives & composition (1–2 weeks)

**Goal:** Category C and D reduced by shared components and rules.

- Implement **`SectionHeader`**, **`ScreenSection`**, **`TokenizedRow`** (names illustrative — align with existing molecules) in `src/components/molecules/` or `organisms/`.
- Document **z-index scale** in theme (e.g. `z.modal`, `z.toast`, `z.header`) and replace magic `zIndex: 999`.
- Audit **absolute** positioning: consolidate FAB / overlay patterns.

**Exit:** New screens **must** use primitives; legacy screens migrated per Phase 4.

---

### Phase 4 — Screen shell normalization (1 week)

**Goal:** Category E addressed.

- Single **recipe** documented: default props for `Screen`, `ScreenHeader`, tab bar insets.
- Fix **double safe area** and **keyboard** issues file-by-file using the recipe.
- Add **lint or comment** allowlist for the few routes that genuinely need custom edges.

**Exit:** Review checklist signed off for all tab roots and modal flows.

---

### Phase 5 — Enforcement & hardening (3–5 days)

**Goal:** Colloquial regressions cannot merge silently.

- Turn **`check:ui-tokens`** from warn → **error** in CI.
- Optional: **Danger** or bot comment with diff stats when PR touches `app/` with new numbers.

**Exit:** CI fails on new violations; doc link in CONTRIBUTING or README for “how to add a token.”

---

### Phase 6 — Final audit — “100%” sign-off (2–3 days)

**Goal:** Close the project.

- Re-run all greps; **empty** or **only allowlist**.
- Update **§2** checkboxes to `[x]` in this file (or move status to `COLLOQUIAL_UI_STATUS.md`).
- Short **design QA** session: light/dark, two device sizes, rotate if supported.

**Exit:** Stakeholder sign-off; optional tag `ui-tokens-v1`.

---

## 5. Migration order (recommended)

1. `src/components/atoms/*`
2. `src/components/molecules/*`
3. `src/components/organisms/*`
4. `src/features/*`
5. `app/(app)/finance/*` → `reports/*` → `settings/*` → remainder of `app/`

Within each folder: **files with most `palette` / magic numbers first.**

---

## 6. Risk & mitigation

| Risk                                | Mitigation                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------- |
| Huge blast radius                   | Phase per vertical; feature flags only if needed for risky screens          |
| Dark mode breaks                    | Phase 1 pilot on 2–3 screens before mass replace                            |
| Performance (useTheme every render) | Keep `useThemeTokens`; use memoized style arrays where profiling shows need |
| Designer churn                      | Lock tokens in `src/theme/`; product changes go through token updates       |

---

## 7. Relationship to other docs

- **[`UI_UX_REMEDIATION_PLAN.md`](./UI_UX_REMEDIATION_PLAN.md)** — product-facing UI work, components, animations; may assume tokens from **this** plan.
- **`layoutMetrics.ts` / `shadowMetrics.ts`** — numeric constants belong in theme or these modules, not in screens.

---

## 8. Maintenance after 100%

- **New feature checklist:** (1) No new imports of `palette` in app code. (2) No new raw color/spacing numbers — add token first. (3) Use `Screen` + shared section primitives.
- **Quarterly:** 30-minute grep audit + remove stale allowlist entries.

---

_Last updated: 2026-04-13 — living document; update Phase completion and §2 checkboxes as work lands._
