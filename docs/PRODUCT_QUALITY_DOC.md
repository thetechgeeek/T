# Product Quality Governance Checklist

> Repo-specific product quality standard for frontend work in this codebase.
> Use this document for two jobs:
>
> 1. Refactor the current app until the open quality gaps are closed.
> 2. Treat it as a definition-of-done checklist for all future feature work, especially LLM-generated changes.

---

## 1. Why This Document Exists

The recent UI remediation improved code hygiene, but it did not fully guarantee product correctness.

What improved:

- Token usage became more consistent.
- Raw styling drift was reduced.
- Shared theme primitives and shell patterns became clearer.
- `npm run validate` became better at catching syntax-level UI violations.

What still slipped through:

- Overlaps and clipping.
- Missing or inconsistent header/back-button behavior.
- Non-working interactions that still rendered "fine".
- Thin or mis-sized controls that technically used tokens.
- Layout regressions on real screens even after passing CI.

The root issue is simple:

- Code hygiene is not the same thing as product quality.
- Token compliance is not the same thing as visual correctness.
- "Renders without crashing" is not the same thing as a complete feature.

This document defines the full quality tree that must govern frontend work in this repo.

---

## 2. Scope

This document focuses on the `Product Quality Engineering -> Frontend Experience Quality` branch.

It complements, but does not replace:

- `docs/COLLOQUIAL_UI_STYLING_REMEDIATION_PLAN.md`
- `docs/COLLOQUIAL_UI_ALLOWLIST.md`
- `docs/SCREEN_SHELL_COOKBOOK.md`
- the current `package.json` validation pipeline

Those documents mostly cover style cleanup, allowlists, and shell patterns.
This document covers the larger system needed to stop broken UI from reaching users.

---

## 3. Product Quality Tree

```text
Engineering / Product Delivery
`- Product Quality Engineering
   |- Functional Quality
   |  |- business logic correctness
   |  |- API/schema correctness
   |  `- data integrity
   |- Reliability / Resilience
   |  |- offline behavior
   |  |- error recovery
   |  `- concurrency/state safety
   |- Security / Privacy
   |- Performance
   |  |- runtime performance
   |  |- startup/render cost
   |  `- perceived performance
   |- Release / Operational Quality
   |  |- CI/CD gates
   |  |- observability
   |  |- rollback safety
   |  `- release readiness
   `- Frontend Experience Quality
      |- Design System Governance
      |  |- token governance
      |  |- primitive usage enforcement
      |  |- semantic layout contracts
      |  |- typography/iconography rules
      |  `- shell/navigation conventions
      |- Interaction Quality Assurance
      |  |- interaction completeness
      |  |- loading/error/empty states
      |  |- focus/keyboard/gesture behavior
      |  `- navigation/state transitions
      |- Visual Quality Assurance
      |  |- real visual acceptance
      |  |- screenshot/image diffing
      |  |- device/theme/text-scale matrices
      |  `- human design review
      |- Accessibility Quality
      |- Localization / Adaptive Layout Quality
      |- Content / Copy Quality
      |- Perceived Performance Quality
      `- Governance
         |- exception discipline
         |- waiver process
         |- owner + expiry
         |- compensating controls
         `- auditability
```

The five gaps that most affected the recent remediation belong here:

- `using the right primitives` -> `Design System Governance`
- `semantic layout contracts` -> `Design System Governance`
- `interaction completeness` -> `Interaction Quality Assurance`
- `real visual acceptance` -> `Visual Quality Assurance`
- `exception discipline` -> `Governance`

---

## 4. Diagnosis: What This Repo Improved vs. What It Missed

### 4.1 Strengthened recently

The repo substantially improved:

- `Design System Governance -> token governance`
- `Release / Operational Quality -> validation scripts`
- portions of shell normalization and shared component cleanup

Examples:

- `scripts/check-ui-tokens.mjs` now blocks raw `rgba(`, color-concat hacks, raw spacing/font-size/border-radius values, raw `zIndex`, and route-level vertical `ScrollView` drift.
- `eslint.config.js` blocks some theme bypasses and raw numeric `zIndex`.
- `docs/SCREEN_SHELL_COOKBOOK.md` defines supported shell patterns.

### 4.2 Underbuilt or missing

The repo still under-enforces:

- primitive usage enforcement
- semantic layout contracts
- interaction completeness
- real visual acceptance
- exception discipline

### 4.3 Concrete repo evidence

These failures are not theoretical. They are already present in the codebase:

- `app/(app)/(tabs)/index.tsx`
    - uses a fragile dashboard shell with edge-to-edge behavior and upward overlap patterns that are easy to break
- `src/components/organisms/QuickActionsGrid.tsx`
    - manually calculates card widths instead of relying on a resilient layout contract
- `app/(app)/(tabs)/invoices.tsx`
    - hand-rolls search/filter UI instead of fully reusing shared `SearchBar` and `FilterBar` patterns
- `src/components/molecules/DatePickerField.tsx`
    - renders a field but does not complete the picker interaction contract
- `app/(app)/settings/index.tsx`
    - explicitly disables the back button for `Settings`
- `app/(app)/settings/business-profile.tsx`
    - bypasses `ScreenHeader` and uses a custom branded header path
- `app/(app)/finance/profit-loss.tsx`
    - overrides typography size in a way that can drift out of sync with line-height/layout assumptions
- `src/theme/uiMetrics.ts`
    - defines chip height tokens, but token presence alone does not guarantee touch-target or visual sufficiency

Bottom line:

- the system became more consistent in code
- but not yet fully trustworthy in UI outcome

---

## 5. Current Gate Assessment

### 5.1 What `npm run validate` currently covers

Current validation runs:

- `format`
- `typecheck`
- `check:hex`
- `check:routes`
- `check:ui-tokens`
- `lint`
- `test`
- `test:integration`

These are necessary, but not sufficient.

### 5.2 What the current gates do well

- catch formatting drift
- catch type errors
- catch duplicate/invalid route collisions
- catch direct hex usage where prohibited
- catch a subset of token violations in runtime UI code
- catch many unit/integration regressions in business logic

### 5.3 What the current gates do not guarantee

The current pipeline does not reliably guarantee:

- correct primitive adoption
- correct safe-area ownership on every screen
- correct header/back-button behavior
- correct spacing relationships between stacked screen sections
- no visual overlap or clipping
- no long-string overflow
- no dynamic-type breakage
- no touch-target regressions
- complete interactions for every input or CTA
- real layout correctness on actual device widths/themes/text scales

### 5.4 Why the current tests still miss visual/product issues

Current gaps include:

- structural snapshots instead of real rendered screenshot regression
- heavy mocking in "visual" tests, including layout-sensitive children
- smoke tests that assert text presence but not geometry
- missing contract tests for important primitives and interactions
- missing pseudo-localization and adaptive layout testing

This means CI can answer:

- "Does the code compile?"
- "Does it use the approved token syntax?"
- "Do the mocked screens render some expected text?"

But it cannot yet answer:

- "Does the screen actually look correct on real devices?"
- "Does the field actually work?"
- "Does the feature honor the approved screen contracts?"

---

## 6. Non-Negotiable Principles

These principles apply to all frontend work in this repo.

1. Shared primitive beats local reinvention.
2. Token compliance is necessary but not sufficient.
3. Every screen must conform to an approved shell contract.
4. Every interactive UI element must have a complete behavior contract.
5. Visual correctness must be validated with real rendering, not only structural snapshots.
6. Exceptions are debt, not hidden flexibility.
7. A feature is not done until layout, interaction, accessibility, and adaptation risks are covered where relevant.
8. LLM-generated code must be held to the same or stricter standards as hand-written code.

---

## 7. Frontend Experience Quality Standards

### 7.1 Design System Governance

#### 7.1.1 Goal

Ensure that screens are built from approved building blocks and conform to stable layout, shell, typography, and iconography contracts.

#### 7.1.2 Required rules

- Use approved screen shells from `docs/SCREEN_SHELL_COOKBOOK.md`.
- Use shared primitives before creating a local variant.
- If a shared primitive is insufficient, extend the primitive or the design system before hand-rolling a one-off screen implementation.
- Do not create custom search bars, chip bars, headers, hero cards, or status pills when an approved primitive already exists.
- Do not use negative-margin overlap, absolute-position stacking, or manual width math unless the pattern is explicitly approved and tested.
- Do not override font size independently when doing so breaks the variant's line-height or container assumptions.
- Do not use emoji or non-systematic glyphs for core functional icons.
- All tappable controls must meet the minimum touch-target policy.
- Root vs. nested screen navigation chrome must be explicit and consistent.

#### 7.1.3 Repo-specific examples of design-system drift

- `app/(app)/(tabs)/invoices.tsx`
    - local search/chip implementation drift
- `app/(app)/settings/business-profile.tsx`
    - custom branded header path instead of the standard header contract
- `app/(app)/(tabs)/index.tsx`
    - fragile hero/stat overlap and custom shell behavior
- `src/components/organisms/QuickActionsGrid.tsx`
    - fixed width math for layout
- `app/(app)/finance/profit-loss.tsx`
    - typography override risk on a critical summary card

#### 7.1.4 Refactor checklist for existing code

- [ ] Every route screen is mapped to an approved shell type.
- [ ] Every non-root route uses standard header/back-button behavior unless explicitly approved otherwise.
- [ ] Every search input reuses the approved search primitive or updates that primitive first.
- [ ] Every chip/filter row reuses the approved filter primitive or updates that primitive first.
- [ ] Every hero/summary/status box has a documented content/alignment contract.
- [ ] Every layout using negative margins or manual overlap is either removed or explicitly approved and tested.
- [ ] Every typography override is audited for line-height/container compatibility.
- [ ] Every core icon source is standardized.

#### 7.1.5 Definition-of-done checklist for new work

- [ ] I identified the target shell pattern before coding.
- [ ] I checked for an existing primitive before creating local UI.
- [ ] I extended shared primitives where needed instead of cloning UI locally.
- [ ] I avoided fixed width math unless a grid/token contract required it.
- [ ] I avoided unsafe overlap patterns.
- [ ] I verified headers, gutters, and section spacing against existing standards.
- [ ] I verified typography tokens, line-height behavior, and icon consistency.

### 7.2 Interaction Quality Assurance

#### 7.2.1 Goal

Ensure that anything interactive is actually complete, testable, and robust in real usage.

#### 7.2.2 Required rules

- Do not ship placeholder or no-op interaction handlers.
- Do not count a field as complete if it renders correctly but does not perform its primary action.
- Every input and CTA must define idle, active, loading, disabled, success, and failure behavior where relevant.
- Search, filter, picker, and form controls must support the expected keyboard, tap, and dismissal flows.
- Validation, retry, and error feedback must be explicit.
- Interaction tests must validate behavior, not only presence.

#### 7.2.3 Repo-specific examples of interaction incompleteness

- `src/components/molecules/DatePickerField.tsx`
    - field renders, but picker interaction is incomplete
- screen-level smoke tests under `__tests__/ui/`
    - often verify "renders" or basic text, but not complete behavior contracts

#### 7.2.4 Refactor checklist for existing code

- [ ] Every field, picker, chip, toggle, and CTA has a real handler path.
- [ ] Every form screen defines loading, validation, submit, and failure behavior.
- [ ] Every search/filter control actually changes state or results.
- [ ] Every interaction-sensitive primitive has behavior tests.
- [ ] No screen is counted as complete solely because it renders static content.

#### 7.2.5 Definition-of-done checklist for new work

- [ ] Every interactive element has an implemented primary action.
- [ ] Every important error path is visible and recoverable.
- [ ] I added tests for the behavior contract, not only the render output.
- [ ] I checked keyboard/focus/tap-dismiss behavior where relevant.
- [ ] I removed or deferred UI that does not yet have a complete interaction path.

### 7.3 Visual Quality Assurance

#### 7.3.1 Goal

Catch overlaps, clipping, misalignment, unsafe spacing, and visual regressions before they reach users.

#### 7.3.2 Required rules

- Structural snapshots are not sufficient for high-risk screens.
- Visual tests must render real layout-sensitive children for representative screens.
- High-risk screens must be checked across a device/theme/text-scale matrix.
- Screens with dashboards, cards, hero areas, filters, headers, forms, and summary boxes require stronger visual QA than simple utility pages.
- Manual design QA is mandatory after large UI refactors and before closing visual debt.

#### 7.3.3 Minimum matrix for high-risk screens

Use at least:

- one small supported phone width
- one standard phone width
- one large phone width
- light theme
- dark theme
- default text scale
- elevated text scale
- realistic or long localized strings

#### 7.3.4 Required visual assertions

For each representative screen, verify:

- no overlap
- no clipped text
- no clipped values
- no status pill/content collisions
- no edge-to-edge contact unless intentional
- consistent horizontal gutters
- consistent header-to-content spacing
- consistent chip/control heights
- no missing icons or placeholder glyphs

#### 7.3.5 Refactor checklist for existing code

- [ ] Representative screens have real screenshot/image-based regression coverage.
- [ ] High-risk screens are exercised with real layout-sensitive children.
- [ ] The dashboard, invoice list, customer list, settings flows, and finance summary screens are in the visual matrix.
- [ ] Long-string and elevated-text-scale cases are included.
- [ ] Manual visual QA is documented for major refactors.

#### 7.3.6 Definition-of-done checklist for new work

- [ ] I added or updated visual coverage for any high-risk screen or reusable primitive change.
- [ ] I verified the screen on the supported size/theme/text-scale matrix.
- [ ] I checked for overlap, clipping, and gutter consistency.
- [ ] I did not rely on mocked placeholder children to claim visual safety.

### 7.4 Accessibility Quality

#### 7.4.1 Goal

Ensure that the UI is operable, readable, and robust for assistive technology and variable user settings.

#### 7.4.2 Required rules

- All interactive targets must meet minimum touch-target size.
- Text must remain legible at supported text scales.
- Semantic labels and roles must exist where applicable.
- Focus order and navigation must remain logical.
- Color use must preserve contrast and meaning.
- Status must not rely on color alone.

#### 7.4.3 Refactor checklist for existing code

- [ ] All chips, pills, icon buttons, and compact controls meet minimum touch-target requirements.
- [ ] Critical screens are checked at elevated text scale.
- [ ] Important actions have accessible labels.
- [ ] Color-coded states also communicate meaning via text/iconography.

#### 7.4.4 Definition-of-done checklist for new work

- [ ] I verified touch-target size.
- [ ] I verified text scaling behavior.
- [ ] I added accessible labels where needed.
- [ ] I ensured state meaning is not color-only.

### 7.5 Localization / Adaptive Layout Quality

#### 7.5.1 Goal

Ensure that the UI survives real content length, translated strings, date/currency formats, and varying device widths.

#### 7.5.2 Required rules

- Do not assume English string length.
- Do not hard-code widths that depend on short labels.
- Long strings must wrap, truncate intentionally, or reflow safely.
- Date, currency, and formatted value fields must be tested with realistic values.
- Adaptive layout must work on the smallest supported width, not only the developer's device.

#### 7.5.3 Repo-specific examples of adaptive-layout risk

- `inventory.importItems` overflow in inventory import UI
- thin chips whose text becomes visually lost
- summary cards and status boxes that collide when text grows

#### 7.5.4 Refactor checklist for existing code

- [ ] Representative screens are tested with long localized strings.
- [ ] Text-heavy menus and sheets are audited for wrapping/truncation.
- [ ] Search bars, chips, cards, and summary rows survive content expansion.
- [ ] Date and currency displays are checked with realistic values.

#### 7.5.5 Definition-of-done checklist for new work

- [ ] I tested with realistic and long content.
- [ ] I avoided width assumptions based on English-only text.
- [ ] I confirmed labels, chips, and cards remain readable on small widths.
- [ ] I considered localized formatting length.

### 7.6 Governance and Exception Discipline

#### 7.6.1 Goal

Ensure that exceptions remain visible, owned, temporary, and auditable.

#### 7.6.2 Required rules

- No exception may merge without a documented reason.
- Every exception must have an owner.
- Every exception must have an expiry or review date.
- Every exception must define compensating controls.
- Every exception must define what must happen to remove it.
- Permanent exceptions require explicit architectural or design approval, not silent drift.
- Allowlists are not a dumping ground for unreviewed shortcuts.

#### 7.6.3 Minimum exception record

Every frontend exception record must include:

- scope
- file or component path
- reason
- owner
- introduced date
- review or expiry date
- compensating test or QA step
- removal criteria

#### 7.6.4 Refactor checklist for existing code

- [ ] Existing documented exceptions are reviewed for continued validity.
- [ ] Every exception has an owner and review date.
- [ ] Every exception has compensating controls.
- [ ] Product decisions are separated from engineering shortcuts.
- [ ] Outdated exceptions are removed from allowlists and docs.

#### 7.6.5 Definition-of-done checklist for new work

- [ ] I did not add a silent exception.
- [ ] If I needed an exception, I documented the scope, reason, owner, and expiry.
- [ ] I added a compensating test or QA note.
- [ ] I proposed a primitive/system improvement if the exception exposed a missing capability.

---

## 8. Current Repo Refactor Checklist

This section is the open checklist for the current app.

### 8.1 User-visible design issues already observed

- [ ] Home screen: the three summary cards no longer overlap the welcome banner FY box.
- [ ] Home screen: quick action boxes fill the available width consistently.
- [ ] Home screen: low-stock alert has standard outer margins.
- [ ] Date picker fields use a real icon and a working picker interaction.
- [ ] Inventory import UI keeps `inventory.importItems` within the container safely.
- [ ] Invoice list search bar matches the standard search-bar height and padding contract.
- [ ] Invoice list chips meet the minimum visual/touch contract and preserve readable text.
- [ ] Invoice detail top-left paid/unpaid state aligns to the standard left gutter.
- [ ] Customer screen summary cards do not overlap the header/content area.
- [ ] Expenses chips sit on the correct vertical rhythm below the preceding section.
- [ ] Profit & Loss net-profit card does not clip or collide with its value text.
- [ ] Settings screen follows the approved header/back-button convention.
- [ ] Business Profile follows the approved header/back-button convention or is elevated into an explicitly approved branded shell contract.

### 8.2 Systemic refactor tasks still required

- [ ] Enforce shared primitive usage for headers, search bars, filter bars, and common status/summary patterns.
- [ ] Add layout-contract checks for gutters, header ownership, and approved overlap rules.
- [ ] Add interaction contract tests for incomplete or high-risk primitives, starting with date picker flows.
- [ ] Add real visual regression coverage for dashboard, invoices, customers, expenses, profit and loss, settings, and business profile.
- [ ] Add long-string and elevated-text-scale cases to representative screen coverage.
- [ ] Add a formal exception registry discipline with owner, expiry, and compensating controls.

---

## 9. Future Feature Definition of Done

Every new feature or refactor touching UI must satisfy the following checklist before it is considered done.

### 9.1 Design system and shell

- [ ] Screen shell chosen from `docs/SCREEN_SHELL_COOKBOOK.md`
- [ ] Header/back-button behavior matches route depth and product intent
- [ ] Shared primitives reused or extended before any local UI reinvention
- [ ] No unsafe overlap or ad-hoc positioning
- [ ] Typography and iconography follow approved contracts

### 9.2 Interaction quality

- [ ] Every CTA and field has a complete behavior path
- [ ] Loading, empty, error, and retry behavior covered where relevant
- [ ] Interaction tests added or updated

### 9.3 Visual and adaptive quality

- [ ] Visual coverage updated for high-risk screens
- [ ] Small-width, dark/light, and elevated-text-scale behavior verified where relevant
- [ ] Long-string or realistic localized content verified where relevant
- [ ] No clipping, overlap, or missing gutters

### 9.4 Accessibility

- [ ] Minimum touch targets preserved
- [ ] Accessibility labels/hints added where needed
- [ ] Color is not the only channel for meaning

### 9.5 Governance

- [ ] Any exception is documented with owner and expiry
- [ ] Docs/checklists updated if the system contract changed
- [ ] `npm run validate` passes

---

## 10. LLM Development Contract

This section exists so future LLM-driven development can follow a stricter and more mechanical process.

### 10.1 Before coding

The LLM must:

- inspect the relevant feature area before changing code
- inspect existing primitives and screen-shell patterns before inventing UI
- inspect `package.json`, validation scripts, and related docs before assuming the repo's standards
- identify whether the task changes a primitive, a screen, or both
- identify whether the task is high-risk for layout, interaction, or adaptation issues

### 10.2 During coding

The LLM must:

- reuse or extend shared primitives instead of cloning UI locally
- avoid hand-rolled search bars, chip rows, headers, and status boxes when system primitives exist
- avoid no-op handlers or placeholder interactions
- avoid typography overrides that break variant contracts
- avoid unsafe negative margins, absolute overlays, or width math without an approved contract
- preserve safe-area ownership and screen-shell conventions
- consider long strings, realistic values, and small-width behavior while coding

### 10.3 Before claiming completion

The LLM must:

- run the applicable validation commands
- add or update interaction tests if behavior changed
- add or update visual coverage if the change affects layout or reusable UI
- audit the changed screen for header, gutter, spacing, touch-target, and overflow behavior
- document any exception instead of silently leaving drift behind
- avoid marking work done just because the code compiles or snapshots pass

### 10.4 Hard prohibitions for LLM-generated UI

The LLM must not:

- bypass shared primitives without justification
- leave TODO or no-op interaction code in shipped UI
- add visual exceptions without documenting them
- treat token usage as proof of correctness
- close UI work without checking adaptive layout and interaction impact

---

## 11. CI/CD Enforcement Model

This repo should eventually enforce quality in layers.

### 11.1 Authoring-time expectations

The author or LLM must catch:

- shell selection mistakes
- obvious primitive bypasses
- incomplete interactions
- long-string/small-width risks
- unsafe overlap patterns

### 11.2 Pre-commit expectations

Pre-commit should catch:

- formatting drift
- lint/type issues
- token violations
- obvious primitive misuse where static analysis can detect it

### 11.3 PR CI expectations

PR CI should catch:

- unit and integration failures
- interaction contract failures
- screenshot/image diff regressions on representative screens
- pseudo-localization and adaptive-layout regressions
- exception entries missing owner/expiry/controls

### 11.4 Review expectations

Code review and design review should catch:

- shell misuse
- primitive bypasses that static rules missed
- visual inconsistencies with established product patterns
- exception abuse

### 11.5 Pre-release expectations

Release readiness should include:

- manual QA for high-risk UI flows
- verification on the supported size/theme matrix
- review of active frontend exceptions

---

## 12. Recommended Next Enforcement Work

To stop these issues earlier in the pipeline, prioritize the following additions:

- [ ] Add primitive-adoption checks for common route-shell, header, search, and filter patterns.
- [ ] Add contract tests for critical primitives such as date picker, screen header, filter chips, and summary cards.
- [ ] Add real screenshot/image regression coverage that renders actual children for representative high-risk screens.
- [ ] Add pseudo-localization and elevated-text-scale runs to CI.
- [ ] Add a formal frontend exception register with owner, expiry, and compensating control fields.
- [ ] Add a review checklist that explicitly separates token hygiene from product correctness.

---

## 13. Definition of Success

This document is being followed correctly when:

- UI work cannot pass just by being token-clean
- broken interactions fail before merge
- layout regressions are caught on representative devices and themes
- exceptions are visible and temporary
- future contributors, including LLMs, can follow a repeatable quality process instead of guessing

That is the difference between "enterprise-looking code" and actual product quality.
