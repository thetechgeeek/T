# Design System Review Gates

> Companion to `docs/UI_Library_Checklist.md`.
> This file documents the visual-review and realistic-content gates required before a new shared component or pattern is marked complete.
> Web-only review surfaces remain in `docs/UI_Library_Web_Backlog.md`.
> Shell/app workflow review still belongs in `docs/UI_Integration_Checklist.md`.

## Core Review Pass

- Every new component/pattern is reviewed for focal hierarchy, primary action clarity, spacing rhythm, accent budget, surface calm, and fallback quality.
- Review is never limited to the default state. Loading, empty, error, permission-denied, read-only, and degraded states receive equal visual review.
- Relaxed showcase presentation and dense operational presentation are both reviewed where the pattern supports both modes.
- No component is marked done only because it looks good in a hero state; enterprise truth wins over portfolio theater.

## Realistic Content Fixtures

- Review uses realistic enterprise content, not placeholder marketing copy.
- Required fixtures include long names, nulls, high counts, dense tables/lists, ugly data, missing media, empty values, and translated copy.
- Optional media, illustration, and icon slots must be reviewed in no-media, no-illustration, and no-icon states.
- Accent budget review happens on representative screens/stories so multiple emphasized surfaces can be judged together instead of in isolation.

## Proof Artifacts

- Visual review starts in the workbench proof surfaces, especially `DesignLibraryScreen.tsx`, `ThemeSnapshotPreview.tsx`, `qualityMatrix.test.tsx`, `themeMatrix.test.tsx`, and `localeMatrix.test.tsx`.
- Screenshot review covers phone and tablet layouts for both relaxed/brand-forward states and dense operational states.
- Reduced motion and max font scale screenshot review is required on premium/branded surfaces so polish never depends on motion or tight typography.
- Any newly supported component must keep its `componentDocs.ts` entry, checklist row, and proof fixtures aligned before the review gate is considered complete.

## Handoff Boundaries

- This file defines the review gate for the shared library contract only.
- Web-specific review surfaces, Storybook lanes, and wide-viewport proofs remain parked in `docs/UI_Library_Web_Backlog.md` until the web surface is intentionally brought into scope.
- Shell scaffolds, auth/session adapters, navigation infrastructure, and downstream app workflows are reviewed through `docs/UI_Integration_Checklist.md`, not here.
