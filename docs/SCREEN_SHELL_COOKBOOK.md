# Screen Shell Cookbook

This document captures the supported route-shell patterns for the app after Phase 5.

## Goals

- Keep safe-area ownership obvious.
- Keep fixed chrome out of scroll bodies.
- Reuse `Screen` / `AtomicScreen` instead of ad-hoc outer wrappers.
- Reserve direct `ScrollView` usage for horizontal rows and internal modal content.

## Pattern 1: Tab or list screen

Use this for list-first screens, dashboards, and tabs.

```tsx
<Screen safeAreaEdges={['bottom']} withKeyboard={false}>
	<ScreenHeader title="Title" />
	<FlatList ... />
</Screen>
```

If the body is plain content instead of a list, use `scrollable`:

```tsx
<Screen safeAreaEdges={['bottom']} withKeyboard={false} scrollable>
	...
</Screen>
```

## Pattern 2: Form or detail screen

Use this for forms, detail pages, and long read/edit flows.

```tsx
<Screen
	safeAreaEdges={['bottom']}
	scrollable
	header={<ScreenHeader title="Title" />}
	footer={<ActionBar />}
>
	...
</Screen>
```

Rules:

- Put fixed headers in `header`.
- Put sticky CTA bars in `footer`.
- Use `scrollViewProps` for keyboard taps, bounce, or inset behavior.

## Pattern 3: Modal or page-sheet screen

Use this for full-screen modals and page sheets.

```tsx
<Screen safeAreaEdges={['top', 'bottom']} withKeyboard={false} scrollable header={<ModalHeader />}>
	...
</Screen>
```

Rule:

- If the screen uses `ScreenHeader`, do not include `'top'` in `safeAreaEdges`.

## Safe-area ownership

- `ScreenHeader` owns top inset padding.
- `Screen` owns bottom inset padding for the main body.
- `Screen` moves bottom inset padding to the footer wrapper when `footer` is present.
- `safeAreaEdges={[]}` is reserved for edge-to-edge shells such as the scan tab.

## Fixed chrome rules

- Do not place fixed headers, step bars, or CTA bars inside a route-level scroll body.
- Prefer `header` and `footer` over manual `View` wrappers above or below a `ScrollView`.
- Do not wrap a route-level `FlatList` or `FlashList` in another vertical `ScrollView`.

## Documented exceptions

These are intentional patterns, not temporary allowlist debt.

- Auth hero shells:
    - `app/(auth)/login.tsx`
    - `app/(auth)/phone-login.tsx`
    - `app/(auth)/verify.tsx`
    - `app/(auth)/language-select.tsx`
    - `app/(auth)/setup.tsx`
- Custom tab shells:
    - `app/(app)/(tabs)/inventory.tsx`
    - `app/(app)/(tabs)/invoices.tsx`
    - `app/(app)/(tabs)/more.tsx`
- Branded settings shell:
    - `app/(app)/settings/business-profile.tsx`
- Modal shell with custom page-sheet header:
    - `app/(app)/finance/ewallets.tsx`
- Internal bottom-sheet editor bodies that still use nested vertical `ScrollView`:
    - `app/(app)/settings/expense-categories.tsx`
    - `app/(app)/settings/item-categories.tsx`
    - `app/(app)/settings/item-units.tsx`

## Phase 5 audit result

- Route-level outer shell `ScrollView` usage is normalized.
- The live `safeAreaEdges` combinations are reduced to `['bottom']`, `['top']`, `['top', 'bottom']`, and `[]`.
- The supported shell patterns are the three recipes above plus the documented exceptions in this file.
