# Design System State Resilience

> Companion to `docs/UI_Library_Checklist.md`.
> This document defines what the design system proves in isolation for graceful degradation and what must still be orchestrated by the reusable shell and, later, each consuming app.

## Ownership Boundary

- The design system owns reusable fallback surfaces, edge-case fixtures, and component-level state quality.
- The shell owns route-level error boundaries, auth/session adapters, offline queue presentation, retry surfaces, long-running job hosts, and conflict handoff patterns.
- Each consuming app still owns concrete cache policy, persistence semantics, backend retry rules, and domain conflict logic.
- When a resilience behavior depends on routing, auth, cache policy, API semantics, background work, or notifications, it belongs in `docs/UI_Integration_Checklist.md`.

## Library-Owned State Matrix

- Loading: structural skeletons that preserve final hierarchy.
- Empty: calm message plus optional single recovery CTA.
- Error: reusable server/not-found/offline fallback surfaces with recovery action affordance.
- Partial: surfaces that show what succeeded, what failed, and the one next action.
- Stale: cached data remains readable with explicit last-updated context.
- Read-only: fields and records remain legible without collapsing spacing or metadata.
- Denied: permission-blocked state preserves layout quality and offers a path forward.
- No media: missing avatar/logo/illustration falls back to text-first composition.
- Ugly data: long names, missing metadata, large values, and stale timestamps stay structurally stable.

## Edge-Case Rules

- Missing optional text uses the shared placeholder `—` unless the component contract defines another representation.
- Large values should be locale-formatted through shared formatters, not hard-coded strings.
- Long lists should remain virtualized and memory-safe.
- Missing media should never break composition or remove the primary meaning of a surface.
- Stale/cached state should surface both relative and absolute time context where the user needs to assess trust.

## Current Proof References

- Workbench state proof deck: `src/design-system/DesignLibraryScreen.tsx`
- Snapshot-safe resilience proof: `src/design-system/components/ThemeSnapshotPreview.tsx`
- Shared fixtures: `src/design-system/fixtures.ts`
- Fallback components: `EmptyState`, `ErrorState`, `AlertBanner`, `PaginatedList`
- Locale-safe numbers, percent, currency, and timestamp helpers: `src/design-system/formatters.ts`
- Once those shared proof surfaces are satisfied, shell/session/cache orchestration continues in `docs/UI_Integration_Checklist.md`.

## Integration Handoff

- Route/screen/application error boundaries belong to app shell integration.
- 401/403/404/429 handling, sign-in routing, request-access flows, countdown retry, and reconnect orchestration belong to app integration.
- Optimistic rollback, long-running jobs, offline replay, and conflict UIs belong to app integration because they depend on feature semantics and persistence.
