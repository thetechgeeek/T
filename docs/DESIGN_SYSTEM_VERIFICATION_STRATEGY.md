# Design System Verification Strategy

> Companion to `docs/UI_Library_Checklist.md`.
> This file records the automated and manual proof lanes for the current supported `Common` + `Mobile (React Native)` design-system surface.
> Web-specific verification remains in `docs/UI_Library_Web_Backlog.md`.
> Shell orchestration stays in `docs/UI_Integration_Checklist.md`.

## Validate Pipeline

- `npm run validate` is the non-negotiable green gate before checklist rows move to done.
- The pipeline covers formatting, `tsc --noEmit` with `strict: true`, token and route guardrails, `check-design-system-guardrails.mjs`, ESLint, Jest unit coverage, and Jest integration coverage.
- React Native-specific linting is enforced through `eslint-plugin-react-native` in `eslint.config.js`.
- Web-only static lanes such as Stylelint and browser-token lint stay tracked in `docs/UI_Library_Web_Backlog.md` until a true web surface is supported.

## Test Stack

- Shared component logic and utility contracts are verified with Jest.
- Supported component interaction coverage uses Jest + React Native Testing Library.
- Screen-level composition coverage runs through the integration harness and workbench tests.
- Native flow coverage uses Maestro via `.maestro/design_system_workbench.yaml`, plus `npm run test:design-system:ios`, `npm run test:design-system:android`, and `npm run test:e2e`.

## Component-Level Coverage

- Supported components must render all supported prop variants without errors.
- Tests cover press, focus, keyboard, and assistive-tech-relevant interaction paths where the component contract supports them.
- Edge cases are part of the definition of done: empty props, null data, long strings, zero values, max values, missing media, missing icons, and missing illustration.
- Controlled vs uncontrolled behavior is verified on any component that exposes both patterns.
- Density, hierarchy, and emphasis variants must be exercised where the component family supports them.
- Native accessibility properties such as `accessibilityRole`, `accessibilityState`, `accessibilityLabel`, and gesture-heavy interactions such as long press or swipe are verified on supported React Native components.

## Visual Regression & Screenshot Proof

- Proof starts in `DesignLibraryScreen.tsx` and `ThemeSnapshotPreview.tsx`, then expands into snapshot and screenshot lanes.
- `qualityMatrix.test.tsx`, `themeMatrix.test.tsx`, `localeMatrix.test.tsx`, and the workbench state deck cover state matrices, themes, RTL, ugly-data fixtures, missing media, and high-emphasis vs low-emphasis variants.
- Approved screenshot baselines are checked by `scripts/check-design-system-visual-regression.mjs`.
- Simulator/emulator proof expects iOS and Android coverage in light and dark mode, with representative phone and tablet devices called out in the proof artifacts.

## Accessibility & Manual Audit Link

- Manual VoiceOver, TalkBack, keyboard, assistive-tech, max-font-scale, and inspector checks are documented in `docs/DESIGN_SYSTEM_ACCESSIBILITY_AUDIT.md`.
- Visual review gates live in `docs/DESIGN_SYSTEM_REVIEW_GATES.md` so test evidence and design review stay aligned instead of drifting into separate definitions of done.

## Performance Release Gates

- Frame-rate monitoring targets 60fps on scroll-heavy and gesture-heavy shared components before release.
- Memory profiling must show no leaks during repeated mount/unmount cycles for supported surfaces.
- `FlatList` and `FlashList` proof lanes include a 10k-item benchmark and blank-frame review for long-list behavior.
- Web-only bundle-size, React Profiler, and browser-benchmark lanes remain in `docs/UI_Library_Web_Backlog.md`.

## Internationalization, RTL, and Locale Proof

- Design-system copy stays centralized in `copy.ts` and `microcopy.ts`, while host-app translations flow in through props.
- String coverage expectations are enforced by the copy registry, `npm run i18n:extract`, and the guardrails that block inline design-system copy.
- RTL snapshot tests are represented through the locale proof surfaces and the generated checklist/catalog contract.
- Locale format tests cover `en-US`, `de-DE`, `ar-SA`, and `ja-JP`.
- Pseudo-localization, device locale switch verification, and German + max font scale stress review remain release gates for the example app and shared proof surfaces.
