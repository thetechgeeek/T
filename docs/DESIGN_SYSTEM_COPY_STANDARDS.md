# Design System Copy Standards

> Companion to `docs/UI_Library_Checklist.md`.
> This document covers reusable library-owned microcopy rules.
> Product/domain wording, localization content, and feature-specific messaging stay in the consuming app.

## Ownership

- The design system owns stable English fallback copy for reusable primitives and fallback surfaces.
- Product teams own domain nouns, translated business copy, policy language, and feature-specific recovery text.
- Shared components should expose copy props for meaningful user-facing text instead of baking in product language.

## Voice And Tone

- Helpful, direct, and calm beats clever.
- Premium tone is restrained and confident, not hype-heavy or cute.
- Error and denial states stay non-blaming and path-forward focused.
- Empty and loading states stay constructive and concise.

## CTA Labels

- Action labels should be verb-led whenever the user is changing state.
- Dialog primary actions should match the dialog task, not generic "Yes" or "Confirm."
- Destructive actions use explicit verbs such as `Delete`, `Remove`, or `Revoke`.
- Loading labels should reflect work in progress. Shared helpers in `src/design-system/microcopy.ts` derive safe defaults such as `Saving...` or `Retrying sync...`.

## Error, Empty, And Feedback Copy

- Lead with what happened, then what the user can do next.
- Avoid raw technical codes in DS fallback surfaces; supporting diagnostics belong in logs or secondary detail.
- Empty states should still make sense without artwork and should support one clear CTA when recovery/action exists.
- Success, warning, and error feedback should be brief and factual.
- Toasts and banners should use action-framed labels, not symbol-only controls.

## Numbers, Placeholders, And Data Labels

- Locale-aware formatters in `src/design-system/formatters.ts` handle number, currency, percent, date, relative time, list, plural, and collation examples.
- Missing optional values should use the shared placeholder `—` unless a component contract explicitly defines another representation.
- Large values should stay locale-formatted and paired with the right unit or currency symbol.
- KPI text should pair a dominant value with timeframe or comparison context instead of exposing a bare number.

## Truncation And Overflow

- Action labels should wrap or be shortened intentionally; they should not silently truncate into ambiguity.
- Shared text primitives support `numberOfLines` and `ellipsizeMode` so composed surfaces can clamp where needed.
- When full text matters, the composed surface must provide an accessible path to the complete value through detail view, hint text, popover, or another explicit affordance.

## Accessibility Copy

- Icon-only actions require descriptive `accessibilityLabel` text.
- Non-obvious gestures require `accessibilityHint`.
- Live announcements should be concise and action-framed.
- Stable labels used by the workbench and tests should remain English identifiers unless a surface is explicitly exercising locale stress.

## Shared Sources Of Truth

- Reusable workbench copy: `src/design-system/copy.ts`
- Shared fallback and helper microcopy: `src/design-system/microcopy.ts`
- Locale-aware formatting helpers: `src/design-system/formatters.ts`
- Component-specific usage and platform notes: `src/design-system/componentDocs.ts`
