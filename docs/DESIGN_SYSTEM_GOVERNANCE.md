# Design System Governance

> Companion to `docs/UI_Library_Checklist.md`.
> This file captures the reusable-library governance policy while the design system still lives inside the product repo.
> Packaging/tooling backlog that depends on external docs tooling or multi-repo extraction stays in `docs/DESIGN_SYSTEM_OPERATIONS_CHECKLIST.md`.

## Versioning And Release Process

- The design-system contract follows Semantic Versioning: `MAJOR.MINOR.PATCH`.
- `PATCH`: visual bugs, accessibility fixes, test hardening, and internal implementation changes with no consumer API break.
- `MINOR`: new components, new variants, additive props, or new tokens that are backward compatible.
- `MAJOR`: breaking component APIs, token renames/removals, contract changes, or behavior changes that require consumer action.
- Until extraction, release evidence is anchored by:
    - `package.json` version
    - generated artifacts checked into the repo
    - `docs/DESIGN_TOKEN_CHANGELOG.md`
    - migration notes added alongside breaking checklist or component changes
- CI evidence for docs and native proof runs is enforced in `.github/workflows/ci.yml`.

## Deprecation Policy

- Deprecated component APIs must carry `@deprecated` JSDoc/TSDoc.
- Dev-only warnings should point to the replacement path when a deprecated API is still exercised.
- A deprecated API stays available for at least two minor releases before removal in the next major.
- Breaking removals require migration notes in the changelog or adjacent migration documentation.

## Contribution Model

- Shared UI enters the supported surface only when it is reusable across at least three product surfaces or clearly belongs to foundational DS infrastructure.
- New reusable patterns should start with an RFC or written proposal that covers:
    - problem statement
    - ownership and consumer count
    - build-vs-borrow decision
    - accessibility, localization, density, and no-media behavior
    - state completeness and fallback coverage
- Build-vs-borrow bias: prefer wrapping proven primitives or headless behavior where appropriate instead of inventing bespoke behavior without a strong reason.
- New visual flourish is allowed only when backed by reusable tokens, accessibility review, and cross-surface need.
- Cross-platform parity review is required for supported mobile components; intentional platform-specific behavior must be documented in `componentDocs.ts`.

## Living Documentation

- The in-app workbench at `/design-system` remains the primary live documentation surface for the supported mobile library.
- `componentDocs.ts` is the source of truth for variants, states, usage guidance, accessibility notes, and platform notes.
- `componentRegistry.json` defines the supported surface; if a component is not registered, it is not part of the formal contract.
- PR-time evidence for the workbench is provided by:
    - `npm run validate`
    - Jest contract tests
    - Maestro native proof flows
    - simulator/emulator artifacts uploaded by `.github/workflows/ci.yml`
- Documentation must keep both relaxed showcase and dense operational usage visible so teams know when each expression is appropriate.

## Web And Operations Backlog

- Storybook, Chromatic/Percy, Figma linking, and multi-package documentation composition stay tracked in `docs/DESIGN_SYSTEM_OPERATIONS_CHECKLIST.md` until a true web or extracted package surface exists.
