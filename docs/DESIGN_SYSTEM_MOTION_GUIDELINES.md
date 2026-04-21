# Design System Motion Guidelines

> Companion to `docs/UI_Library_Checklist.md`.
> This document defines the in-repo motion contract for the supported React Native design-system surface.
> Web-only motion backlog lives in `docs/UI_Library_Web_Backlog.md`.
> Screen-transition, shared-element, and navigation-shell choreography belongs in `docs/UI_Integration_Checklist.md`.

## Principles

- Every animation must communicate state change, hierarchy, or direction. Decorative-only motion is not part of the supported workbench contract.
- Motion stays subtle and structural on operational surfaces. Brand expression may accent onboarding or showcase moments, but not at the cost of scan speed.
- Shared motion must be interruptible. Gesture-driven surfaces should let the user reverse course without waiting for a previous animation to "finish."
- State change still wins over motion. Reduced motion removes movement, not functionality or state visibility.

## Timing Scale

- `instant`: `0ms` for state changes that should not move.
- `micro`: `100ms` for pressed/focused affordances.
- `fast`: `200ms` for small entrances, banners, and fade work.
- `normal`: `300ms` for modal, drawer, and larger surface movement.
- `slow`: `500ms` hard cap for user-triggered transitions inside the shared library.

## Easing And Spring Contract

- `easeOut`: `[0, 0, 0.2, 1]` for entrance motion.
- `easeIn`: `[0.4, 0, 1, 1]` for exit motion.
- `easeInOut`: `[0.4, 0, 0.2, 1]` for repositioning.
- Interactive gestures use shared spring presets from `src/theme/animations.ts` and `src/theme/presets.ts`, not per-component magic numbers.

## React Native Implementation Rules

- Supported shared components use Reanimated shared values and animated styles for motion on the UI thread.
- The supported design-system surface should not import `Animated` from `react-native`; if legacy/app-only code uses it outside the DS, `nativeDriver: true` is required.
- Motion values come from theme animation tokens or shared animation helpers, not ad hoc durations or spring constants.
- Reduced motion is read through `useReducedMotion()` and applied before invoking Reanimated, Animated, or LayoutAnimation work. Shell-owned navigator choreography beyond that boundary belongs in `docs/UI_Integration_Checklist.md`.
- Continuous background motion is disallowed on work surfaces. Repeating shimmer is limited to loading placeholders and disabled under reduced motion.

## Supported Motion Patterns

- Press feedback: `Button`, `TouchableCard`, and `ListItem` use spring-driven scale/opacity feedback with reduced-motion gating.
- Structural expansion: `CollapsibleSection` uses layout animation only when motion is allowed.
- Gesture release: `BottomSheetPicker`, `SwipeableRow`, and `MediaViewer` spring back to stable states after gestures.
- Loading motion: `SkeletonBlock` shimmer stays subtle, token-driven, and turns static under reduced motion.
- Status/banner motion: transient state affordances use quick, low-distance motion instead of theatrical entrances.

## Ownership Boundary

- Web-only motion implementation details remain backlog until a real web surface is supported.
- Native stack transitions, shared-element transitions, and branded screen-to-screen choreography are integration concerns because they depend on the host navigator and product flows.
- Haptics may accompany meaningful state changes, but the design-system should never rely on haptics or animation alone to communicate outcome.
