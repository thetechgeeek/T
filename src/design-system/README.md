# Design System Workspace

This folder is the in-repo source of truth for the app-agnostic mobile design-system workbench at `/design-system`.

## Goals

- Give product and engineering a live in-app component gallery instead of depending on Figma first.
- Track the pure library contract from [UI_Library_Checklist.md](../../docs/UI_Library_Checklist.md); host-app responsibilities live in [UI_Integration_Checklist.md](../../docs/UI_Integration_Checklist.md).
- Keep the supported component catalog tied to an explicit design-system registry instead of product feature screens.
- Support runtime look-and-feel switching through theme presets, not only light/dark colors.

## Files

- `DesignLibraryScreen.tsx`
    - the internal dashboard route
    - hosts the runtime theme controls, gallery previews, component inventory, and checklist explorer
- `catalog.ts`
    - query helpers and manual live-preview registry
    - if a component is demoed on the dashboard, add it to the live preview set here
- `copy.ts`
    - typed internal copy registry for the dashboard
    - locale-ready and used by tests to stress pseudo-localization and RTL scenarios
- `formatters.ts`
    - locale-aware `Intl` helpers used by the dashboard quality section
    - covers numbers, currency, dates, relative time, lists, collation, and plural rules
- `runtimeSignals.ts`
    - root runtime quality source for locale detection, RTL, font scale, reduced motion, and bold text
    - consumed by `ThemeProvider` so shared primitives can react without screen-level wiring
- `useQualitySignals.ts`
    - design-system-facing quality hook for the dashboard
    - merges locale-aware diagnostics with the runtime signals already supplied by `ThemeProvider`
- `fixtures.ts`
    - realistic no-media, ugly-data, read-only, and presentation fixtures used by the workbench proof deck
    - keeps fallback-state demos grounded in representative enterprise content instead of placeholder lorem ipsum
- `components/ThemeSnapshotPreview.tsx`
    - curated preset-proof surface used by the theme matrix snapshots
    - keeps preset, density, RTL, bold-text, and reduced-motion regression checks fast enough to stay in CI
- `generated/uiLibraryCatalog.ts`
    - generated from the checklist doc
- `componentRegistry.json`
    - explicit allowlist of shared components that count as the supported design-system surface
- `generated/componentCatalog.ts`
    - generated from `componentRegistry.json`

## Generators

- `npm run generate:tokens`
    - regenerates the design token distribution artifacts for JSON, web CSS/SCSS, Android XML, iOS Swift, and the token changelog
- `npm run generate:ui-library`
    - parses the checklist doc into a typed catalog
- `npm run generate:design-system`
    - regenerates the token artifacts, checklist catalog, and component inventory
- `npm run check:design-system`
    - enforces design-system-only UI guardrails
    - blocks inline copy, raw LTR-only spacing props, and raw `Text` usage inside the folder
    - blocks direct platform runtime-signal imports outside `runtimeSignals.ts`
    - blocks product stores, services, features, organisms, and app-only headers from entering the folder
    - fails when a supported or live-demo component is missing automated test coverage
    - fails when the generated component catalog drifts away from `componentRegistry.json`
    - fails if the design-system route leaks back under `app/(app)` or into the product More tab
    - fails when a preview label drifts away from the generated checklist catalog
    - fails if the design-system proof-matrix tests disappear

## Working Rules

- New reusable UI should land in `src/components` first, not directly inside feature screens.
- If a component is meant to be part of the supported library, add a live demo for it in `DesignLibraryScreen.tsx`.
- If a shared component becomes design-system-supported, register it in `componentRegistry.json` and regenerate the catalog.
- When a component gets a live demo, register it in `catalog.ts` so the catalog marks it as `Live demo`.
- Keep the dashboard representative, not exhaustive at the prop-matrix level. It should show the supported patterns clearly and fast.
- Treat the checklist explorer as the target-state backlog. Treat the supported component catalog as the current implementation contract.
- Keep user-facing dashboard copy in `copy.ts`, not inline in `DesignLibraryScreen.tsx`.
- The workbench must always show both `Relaxed showcase` and `Operational dense` expressions so new presets prove they can handle premium and operational surfaces with the same primitives.
- Keep fallback states first-class: loading, empty, error, read-only, denied, no-media, and ugly-data proofs belong in the design-system before they spread into product screens.
- Prefer neutral enterprise surfaces as the default bias. Brand-heavy or inverse surfaces should be deliberate exceptions, not the ambient default.
- Prefer `paddingStart` / `paddingEnd` and other logical-direction-safe styles so RTL checks stay green.
- Treat `src/design-system` as the tightest-guarded UI zone in the repo: this folder should be where we prove i18n, localization stress, RTL safety, accessibility labels, and design-system automation first.
- New locale/RTL/accessibility work should land here before it spreads to product screens. If it cannot survive pseudo-localization, RTL, and max-font-scale diagnostics here, it is not ready for the app.
- Keep the proof matrix healthy: `qualityMatrix.test.tsx` covers locale/accessibility affordances plus the premium-quality sections, and `themeMatrix.test.tsx` covers the curated preset-proof surface across all supported presets plus an accessibility stress profile.

## Enterprise x Premium Quality Contract

### Core Doctrine

- Premium feeling comes from system discipline: fewer ingredients, stronger hierarchy, calmer surfaces, tighter accent budgets, and steadier spacing rhythm.
- Enterprise truth beats portfolio theater: the proof deck must survive loading, empty, error, read-only, denied, localized, RTL, zoomed, and ugly-data conditions.
- Every surface must have one dominant purpose, one dominant focal point, and one dominant primary action.
- Calm chrome comes before ornament. Group with spacing, surface, and contrast before borders, dividers, media, or decoration.
- Media, gradients, illustration, and 3D are optional enhancements. No layout may require them to remain understandable.
- Every reusable pattern that materially changes scan efficiency should prove both relaxed showcase and operational dense expressions using the same tokens and behavior model.

### Visual System Laws

- Accent budget is explicit. Saturated accents are reserved for primary action, selection, key data emphasis, and critical status.
- Neutral-first surfaces are the default model: `canvas`, `default`, `raised`, `overlay`, and `inverse/ink`.
- Silhouette discipline is fixed by token families: cards and controls share restrained radii; chips and avatars stay pill/circular; overlays can be slightly rounder.
- Typography roles are deliberate and capped: display, screen title, section title, body, metadata, metric, label, and code.
- Depth is ambient, not theatrical. Prefer soft lift, low-contrast borders, and tinted separation over harsh drop shadows.
- Navigation, tables, and data-heavy operational surfaces should bias toward low chrome and faster scanning.
- Hero treatments need explicit contrast, fallback, and performance guardrails before they are allowed to add brand expression.

### Anti-Patterns To Prevent

- No uncontrolled accent sprawl or multiple saturated priorities on the same surface.
- No giant-card-only layouts for workflows that need density, comparison, or bulk action.
- No pastel-only functional state without an ink anchor, label, icon, or contrast-safe pairing.
- No decorative charts or illustrations that weaken comprehension.
- No image-dependent layouts that fail when media is missing or low quality.
- No brand expression that weakens accessibility, responsiveness, or operational clarity.

### Definition of Done

- Done means visually coherent, state-complete, accessible, density-aware, localized, and performant.
- Every reusable pattern is reviewed against hierarchy, spacing rhythm, accent budget, surface calm, and fallback quality.
- Every reusable pattern is reviewed with realistic content: long names, null metadata, no media, empty values, translated copy, and large font scales.
- Every component and pattern must document when to use relaxed/premium expression vs dense/operational expression.

## Foundation Contracts

### Color

- Primitive palettes define full `50-950` ramps for neutral, primary, secondary, and semantic feedback families.
- Neutral surface tinting is first-class. Use `quiet`, `surfaceVariant`, and raised tiers for grouping before introducing stronger brand color.
- Inverse and hero surfaces are explicit tokens, and inverse CTAs are required anywhere content sits on dark media or ink surfaces.
- Accent budgets are per-theme metadata, not ad hoc screen decisions.
- Analytics surfaces use a dedicated qualitative chart palette plus emphasis tokens for focus, comparison, muted series, quiet grid, and annotation.
- Gradients are limited to branded hero or media-overlay usage. They are never structural affordances.
- Status colors must stay harmonized with the neutral and brand system instead of becoming an alert rainbow.
- Color may not be the sole differentiator of state. Pair it with text, iconography, layout, or pattern change.

### Typography

- The type scale is fixed in tokens: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `display-sm`, `display-md`, `display-lg`, `display-xl`, `display-2xl`.
- Hero/display text belongs to a single focal region per screen or section.
- Body text has calm regular, medium, semibold, and bold roles; metadata stays quieter than body; metrics remain dominant and short.
- Code and machine-readable content use the monospace family token.
- Views should stay within a small set of type roles instead of inventing one-off hierarchy jumps.
- Pairings should stay predictable:
    - cards: section title + body/metadata + metric
    - forms: label + body + helper/error caption
    - tables/lists: body + metadata + code/metric where needed
    - dashboards: metric + context label + quiet metadata
- Mobile text must support `allowFontScaling`, the runtime font-scale diagnostics, and `maxFontSizeMultiplier` on fixed-layout text surfaces.

### Spacing And Layout

- The full spacing step scale is defined and kept stable: `0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64`.
- Card padding is tokenized for dense, default, and relaxed expressions.
- Section rhythm is tokenized with screen padding, section gap, card padding, item gap, field gap, inline gap, and cluster gap.
- Whitespace budgets are intentional:
    - hero/showcase surfaces may spend more space on focus and breathing room
    - standard content surfaces should keep consistent section rhythm
    - operational/data-dense surfaces may compress chrome, never readability or touch targets
- Dense mode must preserve readability, focus clarity, and minimum touch targets.
- Mobile sizing is density-aware through `PixelRatio`-adjusted tokens instead of raw per-screen tweaking.

### Elevation

- Elevation is limited to five semantic levels: flat, raised, overlay, modal, tooltip.
- Ambient shadow recipes are documented by blur, y-offset, opacity, and Android elevation so the system avoids harsh drop shadows.
- Low-contrast surfaces should combine soft border and ambient shadow, not rely on one alone.
- Elevated surfaces must remain distinguishable in dark mode, high contrast, and tinted themes.

### Iconography

- The design-system icon sizes are fixed: `16` dense, `20` default, `24` standalone.
- Decorative, supportive, and primary/action icon roles are different and must be named as such in component APIs and docs.
- Icons must not replace labels in first-use or critical enterprise flows.
- Decorative icons should be removed from the accessibility tree; meaningful icon-only actions must have stable labels.
- Custom icon contributions must preserve the shared stroke language, optical alignment, padding rhythm, and touch-target rules.

## Mobile Component Contract

- Mobile components standardize on `style`, `testID`, `accessibilityLabel`, and purpose-driven props like `variant`, `size`, and `density` where they exist.
- React Native components should prefer composition, children, or injected renderable content instead of polymorphic `as` props.
- Complex components should treat icons, media, and action regions as optional slots that stay layout-safe when absent.
- Density changes should come from theme presets and component-level density APIs, never from shrinking hit targets below the mobile minimum.
- Premium treatments are not allowed to strip semantics, labels, or contrast.
- Large text, pseudo-localization, RTL, reduced motion, and bold-text behavior are part of the component contract, not post-hoc bug fixes.
- Supported components must stay covered by automated unit and touch interaction tests, and they should prove realistic enterprise content before they count as stable library surface.
