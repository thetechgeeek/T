# Design System Workspace

This folder is the in-repo source of truth for the app-agnostic mobile design-system workbench at `/design-system`.

## Goals

- Give product and engineering a live in-app component gallery instead of depending on Figma first.
- Track the full checklist scope from [UI_Library_Checklist.md](../../docs/UI_Library_Checklist.md).
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
- `generated/uiLibraryCatalog.ts`
    - generated from the checklist doc
- `componentRegistry.json`
    - explicit allowlist of shared components that count as the supported design-system surface
- `generated/componentCatalog.ts`
    - generated from `componentRegistry.json`

## Generators

- `npm run generate:ui-library`
    - parses the checklist doc into a typed catalog
- `npm run generate:design-system`
    - regenerates both the checklist catalog and the component inventory
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
- Prefer `paddingStart` / `paddingEnd` and other logical-direction-safe styles so RTL checks stay green.
- Treat `src/design-system` as the tightest-guarded UI zone in the repo: this folder should be where we prove i18n, localization stress, RTL safety, accessibility labels, and design-system automation first.
- New locale/RTL/accessibility work should land here before it spreads to product screens. If it cannot survive pseudo-localization, RTL, and max-font-scale diagnostics here, it is not ready for the app.
- Keep the proof matrix healthy: `qualityMatrix.test.tsx` covers locale/accessibility affordances, and `themeMatrix.test.tsx` covers the full live-library surface across all supported presets plus an accessibility stress profile.
