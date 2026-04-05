# Full Implementation Plan

## TileMaster — FE Audit + UI/UX Remediation

**Reading guide:**
`[FE-H1]` = FE audit, HIGH item 1 | `[UI-3]` = UI/UX audit, item 3
`→` = specific action on that file
Each phase is a standalone PR.

---

## Phase Dependency Map

```
Phase 0 (Tokens)
    │
    ▼
Phase 1 (Atoms)
    │
    ▼
Phase 2 (Molecules)
    │         │
    ▼         ▼
Phase 3     Phase 6
(Organisms) (Skeletons)
    │
    ▼
Phase 4 (Screen Logic)
    │
    ▼
Phase 5 (i18n)
    │         │
    ▼         ▼
Phase 7    Phase 9
(Nav/IA)  (Invoice Redesign)
    │
    ▼
Phase 8 (Animations)
    │
    ▼
Phase 10 (Sweep)
```

---

## Phase 0 — Design System Foundation

**Goal:** Upgrade the token layer so every subsequent phase builds on correct primitives. Zero visible UI changes.

**Depends on:** Nothing. This is the bedrock.

---

### `src/theme/index.ts`

→ Add `xl` to `borderRadius`: currently only `sm:6, md:12, lg:20, full:9999`. Add `xl: 28` for modal sheet top corners and hero image cards. [UI-5]
→ Add `gradient` keys to `ThemeColors` interface: `primaryGradientStart: string`, `primaryGradientEnd: string`. Used in the new dashboard header. [UI-3]
→ Add `sectionLabel` variant to `ThemeTypography.variants`: `{ fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' }` — distinct from the existing `label` which will be cleaned up. [UI-6, UI-11]
→ Add `display` variant: `{ fontSize: 36, fontWeight: '800', lineHeight: 42 }` — for hero numbers (balance due, grand total, today's sales). [UI-6]
→ Add `overline` variant: `{ fontSize: 10, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' }` — replaces ad-hoc `fontSize: 10` in StatCard. [FE-M2, UI-6]
→ Extend `shadows` to add `xs`: smaller than `sm`, for inline chips and subtle input focus rings. [UI-2]
→ Add `animation` key to `Theme` interface: `{ durationFast: 80, durationNormal: 200, durationSlow: 350, springDamping: 15, springStiffness: 300 }` — single source of truth for all motion values. [UI-2, UI-8]

### `src/theme/colors.ts`

→ Add `primaryGradientStart` and `primaryGradientEnd` to both `LIGHT_COLORS` and `DARK_COLORS`. Light: `#C1440E` → `#A8370B`. Dark: `#E8622A` → `#C85420`. [UI-3]
→ Add the new `sectionLabel`, `display`, `overline` variants to `TYPOGRAPHY`. [UI-6]
→ Add `xs: { shadowOpacity: 0.04, shadowRadius: 1 }` to `makeShadows`. [UI-2]
→ Add the `animation` object to `buildTheme()` return value. [UI-2, UI-8]

### `src/theme/layout.ts`

→ Add `rowStart: { flexDirection: 'row', alignItems: 'flex-start' }` — needed for ledger rows where text wraps. [FE-M13]
→ Add `colCenter: { flexDirection: 'column', alignItems: 'center' }` — for stat display blocks. [UI-6]
→ Add gap helpers: `gap4`, `gap8`, `gap12`, `gap16` as `StyleSheet.create` objects using the `gap` property — eliminates magic `gap: 8` inline styles across screens.

### `src/utils/color.ts`

→ Audit all callsites of `withOpacity()` — verify the function handles both 6-digit and shorthand hex. If not, fix the implementation so `withOpacity(color, 0.12)` never produces a broken rgba when `color` is already `rgba(...)`. This is the underlying cause of all `c.primary + '15'` / `c.primary + '20'` hex-suffix hacks across TileSetCard, LineItemsStep, PaymentStep, RecentInvoicesList, invoices.tsx. [FE-H2, UI-14]
→ Add `darken(color: string, amount: number): string` utility for press-state darkening. [UI-2]

### `src/constants/categories.ts`

→ Verify the bilingual labels object is structured as `{ value: TileCategory, labelEn: string, labelHi: string }`. If not, restructure it now before Phase 5 consumes it. [FE-L7]

### New file: `src/theme/animations.ts`

→ Export Reanimated-ready spring/timing config objects derived from `theme.animation` tokens. Static constants, not hooks. Example shapes: `SPRING_PRESS`, `TIMING_FAST`, `TIMING_NORMAL`. Other components import from here rather than inline-defining easing curves. [UI-2, UI-8]

**Done when:** TypeScript compiles with zero errors. No visible UI changes. `npm run typecheck` passes.

---

## Phase 1 — Atom Layer: Structural Fixes

**Goal:** Fix every correctness and design issue in the 9 atom components. These are the most-used building blocks — fixing them here propagates automatically upward.

**Depends on:** Phase 0 (new tokens).

---

### `src/components/atoms/Button.tsx`

→ Replace `React.Fragment` wrappers around `leftIcon` and `rightIcon` with `View` that has `importantForAccessibility="no"` — the fragment wrappers serve no structural purpose. [FE audit]
→ When `title` is undefined/empty (icon-only button), center the icon using `alignItems: 'center', justifyContent: 'center'` without the `marginLeft` offset. Currently `marginLeft: leftIcon ? 8 : 0` on the text creates asymmetric spacing when there is no title.
→ Add `pressAnimation` boolean prop (default `true`) — when `true`, wraps the inner `TouchableOpacity` with Reanimated `useAnimatedStyle` scale transform. Stub as a passthrough for now — actual Reanimated wiring happens in Phase 8. The prop interface change is done here so Phase 8 has no API surface changes. [UI-2]
→ Fix: when `variant="ghost"` and `disabled`, text color goes to `c.placeholder` but background is `transparent` — on `c.background` surfaces, placeholder text on transparent is nearly invisible. Change disabled ghost text to `c.onSurfaceVariant`.

### `src/components/atoms/TextInput.tsx`

→ Remove `container: { marginBottom: 16 }` from `StyleSheet`. This margin belongs on the parent `FormField`, not the atom. Every screen that uses `TextInput` directly applies its own `containerStyle` anyway. This fixes the double-margin issue. [FE-M5]
→ Add `variant` prop: `'outlined' | 'filled'`. Default: `'outlined'` (preserves current look). `'filled'`: `backgroundColor: c.surfaceVariant`, `borderWidth: 0`, with a bottom border only (`borderBottomWidth: 1`) that animates from `c.border` to `c.primary` on focus using `Animated.Value`. Stub the animation for now — Phase 8 wires it. [UI-7]
→ The `borderColor` reactive state (`error ? c.error : isFocused ? c.primary : c.border`) is correct — do not change the logic, just make it work for both variants. [UI-7]

### `src/components/atoms/Card.tsx`

→ Add `variant="interactive"` — identical to `elevated` at rest but structured for press animation. The visual difference (scale on press) is wired in Phase 8. Add the variant option to the type now. [UI-5]
→ Fix `overflow: 'hidden'` in `styles.base` — this clips shadows on iOS. Move `overflow: 'hidden'` to only apply on `variant="flat"` and `variant="outlined"`. Elevated and interactive cards must not have `overflow: hidden` or their shadow is clipped. [UI-5]
→ Add `onPress?: () => void` prop. When provided, card becomes tappable (wrap content in `Pressable`). Used by Phase 8 for interactive card press animation. [UI-2]

### `src/components/atoms/Badge.tsx`

→ Fix `accessibilityRole="text"` — this is not a valid React Native `AccessibilityRole`. Use `undefined`. [FE-M6-adjacent]
→ Add `variant="paid" | "partial" | "unpaid"` — maps directly to `c.paid`, `c.partial`, `c.unpaid` from theme colors. Foundation for the shared `InvoiceStatusBadge` built in Phase 2. [FE-H2]
→ Replace all `withOpacity(color, 0.12)` backgrounds by using `theme.colors.successLight`, `theme.colors.warningLight`, `theme.colors.errorLight` for semantic variants — already defined in the color palette. [FE-H2, UI-3]

### `src/components/atoms/Screen.tsx`

→ Change default `safeAreaEdges` from `['top', 'bottom']` to `['bottom']` — the vast majority of screens have a `ScreenHeader` which owns the top inset. Screens without a ScreenHeader (dashboard, login) explicitly pass `['top', 'bottom']` or `[]`. [FE-H8]
→ Add JSDoc comment above the component explaining the safe area contract so future developers don't introduce the same mismatch. [FE-H8]

### `src/components/atoms/ThemedText.tsx`

→ Add `'display'`, `'overline'`, and `'sectionLabel'` to the variant type union — these are the new variants added in Phase 0. [UI-6, UI-11]
→ The `HEADING_VARIANTS` set should remain `['h1', 'h2', 'h3']` only — do not add `display` to it, since display-size numbers (₹42,500) are not semantic headings. [UI-6]

### `src/components/atoms/Chip.tsx`

→ Add `size` prop: `'sm' | 'md'` (default `'md'`). `'sm'`: `paddingHorizontal: 10, paddingVertical: 4`, `fontSize: sizes.xs`. The `'sm'` variant is needed for inline status chips in invoice rows. [FE-H2]
→ Add `leftIcon?: React.ReactNode` prop — for chips that need an icon (e.g., category chips with a small category icon). Not currently used but establishes the slot for Phase 5.

### `src/components/atoms/OfflineBanner.tsx`

→ Remove `marginLeft: 6` from `text` style — the container already has `gap: 6`. Result: icon and text have exactly 6px gap, not 12px. [FE-L10-adjacent, UI-16]
→ Add a Reanimated slide-down entrance animation: banner slides in from `-32px` when `isConnected` transitions to `false`. Stub for Phase 8. [UI-8]

**Done when:** All atom components compile. `npm run test -- --testPathPattern=atoms` passes.

---

## Phase 2 — Molecule Layer

**Goal:** Fix structural issues in compound components, establish the shared `InvoiceStatusBadge`, and establish screen-skeleton infrastructure.

**Depends on:** Phase 1 (fixed atoms).

---

### `src/components/molecules/ScreenHeader.tsx`

→ Fix back button touch target: change `back` style from `{ padding: 4, marginLeft: -4 }` to `{ padding: 12, margin: -12 }` — gives a 22+24=46px touch target while keeping visual position unchanged via the negative margin offset. [FE-H4]
→ Fix `accessibilityLabel="back-button"` → `"Go back"`. [FE-H4]
→ Add `accessibilityRole="button"` explicitly on the back `TouchableOpacity` — it is currently missing. [FE-H4]
→ Make the border bottom a prop: `showBorder?: boolean` (default `true`). Some screens (invoice detail with immersive header) will set `showBorder={false}`. [UI-9]
→ The `paddingTop: Math.max(insets.top, s.sm)` is correct — do not change. [FE-H8]

### `src/components/molecules/FormField.tsx`

→ Fix double margin: pass `containerStyle={{ marginBottom: 0 }}` to the inner `AtomTextInput` call. This cancels the atom's container margin (which was removed in Phase 1). The `FormField` container's own `marginBottom: 16` is the single source of spacing. [FE-M5]
→ Rename the label-row container's `marginBottom: 4` to use theme token `s.xs` (4px). [Phase 0 spacing grid]

### `src/components/molecules/StatCard.tsx`

→ Replace `fontSize: 18` with `theme.typography.sizes.xl` (20). [FE-M2]
→ Replace both instances of `fontSize: 10` with `theme.typography.sizes.xs` (11). Satisfies minimum legible text size. [FE-M2]
→ Replace `fontWeight: '700'` and `fontWeight: '600'` raw strings with `theme.typography.weights.bold` and `theme.typography.weights.semibold`. [FE-M2]
→ Fix `accessibilityRole="summary"` → remove the role entirely (leave as `undefined`, the correct default for a display card). [FE-M6]
→ Add `variant="hero"` prop — when set, uses the new `display` (36px/800) variant for the value. Used on Customer Detail outstanding balance and Invoice Detail grand total. [UI-6, UI-9]

### `src/components/molecules/SearchBar.tsx`

→ Remove the hardcoded `accessibilityLabel="Search"` from the inner `TextInput`. Replace with an `accessibilityLabel` prop that callers must provide. Add it to `SearchBarProps` interface as required. Update all callsites (`inventory.tsx`, `customers/index.tsx`) to pass the label. [FE audit, accessibility]
→ Add `autoFocus?: boolean` prop, forwarded to the inner `TextInput`. Used in the Phase 5 invoices tab filter sheet.

### `src/components/molecules/ListItem.tsx`

→ Fix `accessibilityRole="button"` — make it conditional: `accessibilityRole={onPress ? 'button' : undefined}`. Non-interactive `ListItem`s (phone/city rows with `showChevron={false}`) should have no interactive role. [FE-L8]
→ Add `numberOfLines={1}` to the `title` Text — long names currently overflow. [FE-L8-adjacent]
→ Add `titleVariant?: keyof ThemeTypography['variants']` prop (default `'body2'`). Some list items need `'body1'` weight. [UI-11]

### New file: `src/components/molecules/InvoiceStatusBadge.tsx`

→ Create a single canonical component that maps `'paid' | 'partial' | 'unpaid'` to the correct `Badge` variant. Exports `<InvoiceStatusBadge status={invoice.payment_status} />`. [FE-H2]
→ Internally uses `Badge` atom's new `'paid'`, `'partial'`, `'unpaid'` variants from Phase 1.
→ Consolidates the 3 divergent inline implementations in: `RecentInvoicesList.tsx`, `invoices.tsx`, `customers/[id].tsx`.

### New file: `src/components/molecules/SkeletonBlock.tsx`

→ Create a primitive skeleton block: takes `width`, `height`, `borderRadius` props. Background is `c.surfaceVariant`. [UI-1]
→ Add a `shimmerProgress` prop: `Animated.SharedValue<number>` (Reanimated) — the shimmer gradient position. Callers that want shimmer pass a shared value; callers that don't get a static block. This keeps the primitive decoupled from animation. [UI-1]
→ Export type `SkeletonBlockProps` for use in screen-level skeletons.

### New file: `src/components/molecules/SkeletonRow.tsx`

→ A composite skeleton that mimics a `ListItem` row: left circle (avatar), two stacked blocks (title/subtitle), right block (value). Uses `SkeletonBlock`. [UI-1]
→ Props: `showAvatar?: boolean`, `showRightValue?: boolean`, `titleWidth?: string | number`, `subtitleWidth?: string | number`.
→ This is the reusable building block for all list-screen skeletons in Phase 6.

### `src/components/molecules/EmptyState.tsx`

→ Change `icon?: React.ReactNode` prop name to `illustration?: React.ReactNode` to make intent clearer. No behavioral change. [UI-10]
→ Remove `opacity: 0.5` from `styles.icon` — opacity should be controlled by the caller. SVG illustrations should be full opacity. [UI-10]
→ Add `variant?: 'centered' | 'inline'` — `'inline'` does not use `flex: 1` so it works inside a `FlatList` `ListEmptyComponent` without taking over the whole screen height. [UI-10]

### `app/(app)/(tabs)/_layout.tsx` — ErrorBoundary component (local)

→ Replace `backgroundColor: '#2563EB'` with `c.primary` from theme. [FE-L1]
→ Replace `color: '#666'` on error message text with `c.onSurfaceVariant`. [FE-L1]

**Done when:** `npm run test -- --testPathPattern=molecules` passes. `InvoiceStatusBadge` renders correctly for all 3 statuses. `SkeletonBlock` renders without crash.

---

## Phase 3 — Organism Layer

**Goal:** Fix organisms, migrate `PaymentModal` to a proper bottom sheet, fix `DashboardHeader`, consolidate `RecentInvoicesList`.

**Depends on:** Phase 2 (molecules, InvoiceStatusBadge, SkeletonBlock).

---

### `src/components/organisms/DashboardHeader.tsx`

→ Replace the solid `backgroundColor: c.primary` with a `LinearGradient` from `expo-linear-gradient`. Gradient direction: `135deg`, from `c.primaryGradientStart` to `c.primaryGradientEnd`. [UI-3, UI-4]
→ Move the 3 stat card slots inside the header component. Accept `stats?: DashboardStatConfig[]` prop instead of rendering them via negative margin in `index.tsx`. Cards render in a `View` at the bottom of the header, flush inside the gradient — no negative margin hack. [UI-4]
→ Memoize the date string: `const today = useMemo(() => new Date().toLocaleDateString(...), [currentLanguage])`. [FE-M11]
→ Remove the hardcoded `businessName="TileMaster"` from its callsite in `index.tsx`. `DashboardHeader` will read `businessName` from `useBusinessProfileStore` or a new `useBusinessProfile` hook. If no profile is loaded, show a `SkeletonBlock`. [FE-H3]
→ Add a `NotificationBell` icon slot in the top-right as a `rightElement` prop (icon only, no functionality yet — reserved slot). [UI general]

### `src/components/organisms/RecentInvoicesList.tsx`

→ Replace the inline status badge (lines 103-139, `c.success + '20'` hex-suffix backgrounds) with `<InvoiceStatusBadge status={inv.payment_status} />` from Phase 2. [FE-H2]
→ Remove `invoiceItem: { marginBottom: 8 }` from `StyleSheet` — the parent `gap: s.sm` is sufficient. [FE-L10]
→ Verify `key={inv.id}` is used (not index) — it is already correct, just document it. [verify only]

### `src/components/organisms/QuickActionsGrid.tsx`

→ Change all `key={i}` to `key={action.route}` — routes are unique stable identifiers. [FE-M12]
→ Replace the hardcoded width calculation `(width - s.lg * 2 - 8 * 3) / 2` with `(width - s.lg * 2 - s.sm * 3) / 2` — uses `s.sm` (8px) from theme instead of the magic `8`. [UI-15]
→ Add `onPressIn`/`onPressOut` handler pair stubs on the `TouchableOpacity` — reserved slots for Phase 8 press animation. [UI-2]

### `src/components/organisms/PaymentModal.tsx`

→ Install `@gorhom/bottom-sheet` (peer deps `react-native-reanimated` and `react-native-gesture-handler` are both already in package.json). [UI-12]
→ Replace the `Modal + KeyboardAvoidingView + View(borderTopRadius)` structure entirely with `BottomSheetModal` from `@gorhom/bottom-sheet`. [UI-12]
→ Define two snap points: `['50%', '85%']`. Sheet starts at `50%` (amount input + payment mode visible), expands to `85%` when keyboard appears or notes field is focused. [UI-12]
→ Fix state reset on close/reopen: add a `useEffect` that watches the `visible` prop. When `visible` becomes `true`, reset `amount`, `paymentMode`, `notes` to initial values using explicit `setState` calls. Fixes the stale state bug. [FE-H5]
→ Add error display for empty/invalid amount: currently `handleSave` silently returns. Show a visible inline error message below the amount input using `TextInput`'s `error` prop. [FE-H5]
→ Replace the payment mode button grid with `Chip` atoms in a `flexWrap: 'wrap'` row — uses the consolidated chip component. [UI general]
→ Remove `handle: { width: 40, height: 4 }` custom handle — `@gorhom/bottom-sheet` renders the handle natively and correctly. [UI-12]

### `src/components/organisms/TileSetCard.tsx`

→ Replace `c.primary + '15'` (hex-suffix opacity) with `withOpacity(c.primary, 0.08)` for category badge background. [FE-H2-adjacent, UI-14]
→ Increase thumbnail size from `44×44` to `72×72` with `borderRadius: r.md`. [UI-14]
→ The `catBadge` font size hardcoded at `10` — replace with `theme.typography.sizes.xs`. [FE-M2-adjacent]
→ Add a `// TODO: i18n plurals` comment on the `{group.items.length} Variant{...}` string — non-trivial without a pluralization helper. Full i18n in Phase 5.
→ Upgrade the card header to use `ThemedText` instead of raw `Text` for the base item number. [UI general]

**Done when:** `npm run test -- --testPathPattern=organisms` passes. PaymentModal bottom sheet opens/closes with gesture dismiss. DashboardHeader shows gradient. InvoiceStatusBadge used in RecentInvoicesList.

---

## Phase 4 — Screen Logic Fixes (Non-Visual Correctness)

**Goal:** Fix all HIGH and MEDIUM priority bugs from the FE audit that live in screen files. No i18n yet (Phase 5). No visual redesign (Phase 7/8). Pure correctness.

**Depends on:** Phase 2 (InvoiceStatusBadge), Phase 3 (PaymentModal).

---

### `app/(app)/inventory/[id].tsx`

→ Move `SpecBox` function outside of `ItemDetailScreen` — declare it as a module-level named function component above `ItemDetailScreen`. Pass `c`, `r` as props or access via `useThemeTokens()` inside it. [FE-H7]
→ Fix loading state safe area: the `View` shown during loading uses no `<Screen>` and has no safe area. Replace with `<AtomicScreen safeAreaEdges={['top', 'bottom']}><ActivityIndicator /></AtomicScreen>`. [FE-H8]
→ `actionBtn` style: add `paddingHorizontal: s.md` and `justifyContent: 'center'` — currently has only `paddingVertical: 14`. [action button padding]
→ Replace the fragile `item === null` first-load guard with an explicit `const isFirstLoad = useRef(true)` that flips to `false` after the first successful fetch. [code quality]

### `app/(app)/invoices/[id].tsx`

→ Fix safe area inconsistency: all three states (loading, error, loaded) must use `safeAreaEdges={['bottom']}`. Add a `<ScreenHeader />` to the loading and error states so the top inset is consistently owned by the header in all states. [FE-H8]
→ Remove the no-op `bottom: 0` property on the totals `View` (line 139) — it is a non-positioned element, this has no effect. [FE-H8-adjacent]

### `app/(app)/(tabs)/invoices.tsx`

→ Fix status badge: replace `item.payment_status === 'paid' ? c.success + '20' : c.warning + '20'` with `<InvoiceStatusBadge status={item.payment_status} />` from Phase 2. Adds the missing `'unpaid'` → error color branch. [FE-H2]
→ Fix date formatting: replace `new Date(item.invoice_date).toLocaleDateString()` with `formatDate(item.invoice_date)` from `useLocale()`. [FE-M14]
→ Add FlatList performance props: `initialNumToRender={10}`, `maxToRenderPerBatch={10}`, `windowSize={5}`, `removeClippedSubviews={true}`. [FE-M10]
→ Remove `borderColor: c.border, borderWidth: 1` from `invoiceCard` style — keep shadow only. [UI-5]

### `app/(app)/(tabs)/inventory.tsx`

→ Add `onPress` to the filter button `TouchableOpacity` — for now, show an `Alert` saying "Advanced filters coming soon" to make it functional rather than a dead button. [FE-H6]
→ Fix chip scroll negative margin mismatch: parent has `paddingHorizontal: s.lg` (24px), so change `marginHorizontal: -20` to `marginHorizontal: -s.lg` and `paddingHorizontal: 20` to `paddingHorizontal: s.lg`. [FE-L9]
→ Add FlatList performance props to both the categories FlatList and the main items FlatList. [FE-M10]
→ Differentiate the two `testID="loading-spinner"` values: `"inventory-loading-spinner"` and `"inventory-loading-more"`. [code quality]

### `app/(app)/customers/index.tsx`

→ Fix navigation paths: `router.push(\`/customers/${item.id}\`)` → `router.push(\`/(app)/customers/${item.id}\`)`. Same for `router.push('/customers/add')`→`router.push('/(app)/customers/add')`. [FE-M7]
→ Fix `EmptyState` `onAction` navigation path with the same prefix fix. [FE-M7]

### `app/(app)/customers/[id].tsx`

→ Fix Customer type ListItem: replace the `<ListItem title={\`Type: ${customer.type.toUpperCase()}\`} leftIcon={<Badge label={customer.type.charAt(0)} />}>`with a`<View>`containing`<ThemedText variant="overline">Customer Type</ThemedText>`+`<Badge label={customer.type.toUpperCase()} variant="neutral" />`placed directly inside the info`Card`. [FE-M13]
→ Replace all magic numbers in `StyleSheet`: `padding: 16 → s.md`, `padding: 20 → s.lg`, `borderRadius: 8 → r.sm`. [UI-15]
→ Change `variant="h1"`+`fontSize: 32`override on outstanding balance to`variant="h1"`only (the`display` variant upgrade comes in Phase 9). [UI-6]

### `app/(app)/finance/index.tsx`

→ Add missing `size={24}` prop to `Receipt` and `TrendingDown` icon usages. [FE-M8]
→ Remove the `Card variant="elevated"` wrapper around `StatCard` — use a flat `View` with `marginBottom: s.sm`. StatCard already has its own shadow. [FE-M9]
→ Update `StatCard`'s `icon` prop type to accept `LucideIcon | React.ReactNode` to allow passing pre-sized icon elements directly. [FE-M9]
→ Fix navigation path: `router.push('/finance/purchases')` → `router.push('/(app)/finance/purchases')`. [FE-M7-adjacent]

### `app/(app)/(tabs)/more.tsx`

→ Wrap `logout` in a confirmation: `Alert.alert('Sign Out', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive', onPress: logout }])`. [FE-M4]
→ Replace `ChevronRight` on dark mode toggle with a custom pill-shaped `View` containing a circular knob. Use `Animated.Value` for knob position. Stub with static visual for now — animate in Phase 8. [FE-M3]
→ Apply same toggle treatment to the language toggle. [FE-M3]
→ Add `LogOut` icon from lucide-react-native to the logout button left side for visual consistency with other menu items. [FE-L3]
→ Change `key={i}` to `key={item.accessibilityLabel}` in the menuItems map. [FE-M12]

### `app/(app)/(tabs)/index.tsx`

→ Remove `businessName="TileMaster"` hardcode from `DashboardHeader` — after Phase 3, `DashboardHeader` reads business name internally from store. [FE-H3]
→ Remove the `marginTop: -s.lg` negative margin stats row — after Phase 3, stats are inside `DashboardHeader`. Remove the entire `dashboardStats.map` `View` from this file. [UI-4]
→ Change `key={i}` to `key={stat.accessibilityLabel}` in stats map. [FE-M12]

### `app/(auth)/login.tsx`

→ Replace the `🏺` emoji text with an `Image` component using a logo asset. If no asset exists yet, use a `View` with terracotta background and a `ThemedText` "TM" monogram in white as a placeholder. Mark with `// TODO: replace with logo asset`. [FE-L6]
→ Replace the inline `TouchableOpacity` sign-in button (lines 113-133) with the `Button` atom — eliminates duplicated loading spinner logic. [code quality]
→ Replace `🙈` / `👁️` emoji in password toggle with Lucide `Eye` / `EyeOff` icons. [FE-L6-adjacent]

### `app/(app)/settings/index.tsx`

→ Remove the Settings item from `more.tsx` menuItems array OR add a `(Coming Soon)` subtitle to the Settings `ListItem`. Do not navigate to a stub screen from the main menu without setting user expectations. [FE-L4]

**Done when:** All navigation paths correct. `npm run typecheck` passes. FlatList performance props in place. PaymentModal state resets on reopen (manual test).

---

## Phase 5 — i18n Pass

**Goal:** Every user-visible string in every screen goes through `t()`. This is the highest-priority correctness issue — the app defaults to Hindi but the majority of screens display English.

**Depends on:** Phase 4 (screens are otherwise stable before touching every string).

---

### Preparation: `src/i18n/locales/en.json` and `hi.json`

→ Audit both files. Add every missing key found in the screens below, structured under the logical namespace for each screen. Complete `en.json` first, then `hi.json`. [FE-H1]
→ New namespaces needed: `invoiceDetail.*`, `customerDetail.*`, `financeOverview.*`, `inventoryDetail.*`, `orderImport.*`, `paymentModal.*`, `settings.*`, `auth.passwordToggle.*`.

### `app/(app)/(tabs)/invoices.tsx`

→ `"Invoices"` → `t('invoice.title')`, `"New Invoice"` → `t('invoice.newInvoice')`, `"No invoices found."` → `t('invoice.noInvoices')`, `"Create your first invoice"` → `t('invoice.createFirst')`. [FE-H1]

### `app/(app)/(tabs)/more.tsx`

→ `"More"` → `t('tabs.more')`, `"Light Mode"` → `t('settings.lightMode')`, `"Dark Mode"` → `t('settings.darkMode')`. [FE-H1]
→ Language toggle labels are intentionally bilingual — keep them hardcoded with a comment explaining this exception. [FE-H1, intentional exception]

### `app/(app)/invoices/[id].tsx`

→ Replace: `"Billed To"` → `t('invoiceDetail.billedTo')`, `"Items"` → `t('invoiceDetail.items')`, `"Subtotal"` → `t('invoiceDetail.subtotal')`, `"IGST"` → `t('invoiceDetail.igst')`, `"CGST"` → `t('invoiceDetail.cgst')`, `"SGST"` → `t('invoiceDetail.sgst')`, `"Grand Total"` → `t('invoiceDetail.grandTotal')`, `"Amount Paid"` → `t('invoiceDetail.amountPaid')`, `"Balance Due"` → `t('invoiceDetail.balanceDue')`, `"Record Payment"` → `t('invoiceDetail.recordPayment')`, `"Share PDF"` → `t('invoiceDetail.sharePDF')`, `"Go Back"` → `t('common.goBack')`, `"Failed to load invoice."` → `t('invoiceDetail.loadError')`. [FE-H1]

### `app/(app)/customers/index.tsx`

→ `"Customers"` → `t('customer.title')`, `"Start by adding your first customer..."` → `t('customer.emptyDescription')`, `"Add Customer"` → `t('customer.addCustomer')`, `placeholder="Search customers..."` → `t('customer.searchPlaceholder')`. [FE-H1]

### `app/(app)/customers/[id].tsx`

→ Replace all visible strings: `"Outstanding Balance"`, `"Total Invoiced"`, `"Total Paid"`, `"Customer Info"`, `"Ledger History"`, `"Record Payment"`, `"New Invoice"`, `"Amount"`, `"Balance"`, `"No contact info"`. [FE-H1]

### `app/(app)/customers/add.tsx`

→ `"Add Customer"` in `ScreenHeader` → `t('customer.addTitle')`. All `FormField` labels → i18n keys. `"Saving..."` / `"Save Customer"` → i18n. [FE-H1]

### `app/(app)/finance/index.tsx`

→ Replace: `"Finance Overview"`, `"Gross Profit"`, `"Net Profit"`, `"Total Expenses"`, `"Reports & Management"`, `"Expenses"`, `"View and add business expenses"`, `"Purchases"`, `"Supplier bills and inventory procurement"`, `"Aging Report"`, `"Outstanding balances from customers"`, `"Profit & Loss"`, `"Detailed financial performance"`. [FE-H1]

### `src/components/organisms/PaymentModal.tsx`

→ Replace: `"Record Payment"`, `"Payment Mode"`, `"Notes"`, `"Optional remarks"`, `"Processing..."`, `"Payment Failed"`, `"Amount (₹)"`. Use new `paymentModal.*` namespace. [FE-H1]
→ `"Payment for {invoiceNumber}"` notes default → `t('paymentModal.defaultNotes', { invoiceNumber })`.

### `src/features/invoice-create/InvoiceCreateScreen.tsx`

→ Replace: `"Create Invoice"`, step labels `"Customer"`, `"Items"`, `"Review"`, `"Back"`, `"Next"`, `"Generating..."`, `"Generate Invoice"`. [FE-H1]

### `src/features/invoice-create/CustomerStep.tsx`

→ Replace all label strings and `ThemedText` labels with `t()` calls. [FE-H1]

### `src/features/invoice-create/LineItemsStep.tsx`

→ Replace all visible strings with `t()` calls. [FE-H1]

### `src/features/invoice-create/PaymentStep.tsx`

→ Replace all visible strings with `t()` calls. [FE-H1]

### `app/(app)/inventory/[id].tsx`

→ Replace: `"Base Item"`, `"Category"`, `"Size"`, `"Grade"`, `"Pcs / Box"`, `"Sqft / Box"`, `"Selling Price"`, `"Stock In"`, `"Stock Out"`, `"Recent Operations"`, `"No stock operations recorded yet."`, `"Threshold:"`, `"Boxes in Stock"`, `"Item not found"`. [FE-H1]

### `app/(app)/(tabs)/inventory.tsx`

→ Category chips: replace `CATEGORIES` array display labels with bilingual labels from `src/constants/categories.ts`. Each `Chip` receives `label={t(category.labelKey)}`. [FE-L7]
→ `placeholder="Search design or item number..."` → `t('inventory.searchPlaceholder')`. [FE-H1]

### `app/(app)/orders/import.tsx`

→ Replace all hardcoded strings in this screen with `t()` calls under `orderImport.*` namespace. [FE-H1]

### `app/(auth)/login.tsx`

→ Replace `"TileMaster"` with an app name constant from config — not `t()` since the app name does not translate.
→ Replace the `"→"` arrow on setup link with the localized link text via `t()`. [FE-H1]

**Done when:** `grep -r '"[A-Z][a-z]' app/ src/components src/features` returns only intentional exceptions (language toggle labels, app name, legal text). Both `en.json` and `hi.json` have all new keys populated.

---

## Phase 6 — Loading State Migration (Skeleton Screens)

**Goal:** Replace every `ActivityIndicator` loading state on content screens with skeleton screens. Spinners remain only for in-progress actions (form submit, PDF share, payment processing).

**Depends on:** Phase 2 (SkeletonBlock, SkeletonRow atoms).

---

### New file: `src/components/molecules/skeletons/InvoiceListSkeleton.tsx`

→ Renders 5 `SkeletonRow` items mirroring the `invoiceCard` layout: left side (title width 60%, subtitle width 40%), right side (value block 30%, status chip 20%). [UI-1]
→ Receives `shimmerProgress: SharedValue<number>` as prop.

### New file: `src/components/molecules/skeletons/InventoryListSkeleton.tsx`

→ Renders 3 `TileSetCard`-shaped skeletons: header block (60% width title, 40% subtitle), 2 variant rows each with a 72×72 square + two stacked blocks + right value column. [UI-1]

### New file: `src/components/molecules/skeletons/CustomerListSkeleton.tsx`

→ Renders 6 `SkeletonRow` items with circular avatar slot. [UI-1]

### New file: `src/components/molecules/skeletons/DashboardSkeleton.tsx`

→ Mirrors dashboard body when stats are not loaded: three small stat card outlines, four quick action outlines, five recent invoice row outlines. [UI-1]

### New file: `src/components/molecules/skeletons/InvoiceDetailSkeleton.tsx`

→ Mirrors invoice detail layout: customer block, items list (3 rows), totals block. [UI-1]

### New file: `src/components/molecules/skeletons/CustomerDetailSkeleton.tsx`

→ Mirrors the outstanding balance card + stats row + info card + 3 ledger rows. [UI-1]

### New file: `src/hooks/useSkeletonShimmer.ts`

→ Custom hook that creates and runs a Reanimated `useSharedValue` looping animation from 0→1→0. Returns the shared value. All skeleton screens call this hook once and pass the result down. [UI-1]
→ Animation parameters come from `theme.animation` tokens (Phase 0): `durationSlow: 1400ms`, easing `Easing.inOut(Easing.ease)`.
→ _The actual Reanimated loop implementation is stubbed here — fully wired in Phase 8._

### `app/(app)/(tabs)/invoices.tsx`

→ Add `const shimmerProgress = useSkeletonShimmer()` at the top.
→ Replace the `FlatList` with a conditional: if `loading && invoices.length === 0`, render `<InvoiceListSkeleton shimmerProgress={shimmerProgress} />`. [UI-1]

### `app/(app)/(tabs)/inventory.tsx`

→ Replace the `renderEmpty` spinner branch (when `loading && items.length === 0`) with `<InventoryListSkeleton shimmerProgress={shimmerProgress} />`. [UI-1]

### `app/(app)/customers/index.tsx`

→ When `loading && customers.length === 0`, show `<CustomerListSkeleton />` before the list. [UI-1]

### `app/(app)/invoices/[id].tsx`

→ Replace `<ActivityIndicator>` loading state with `<InvoiceDetailSkeleton />`. The screen now has `ScreenHeader` in all states after Phase 4 — skeleton goes below the header. [UI-1]

### `app/(app)/customers/[id].tsx`

→ When `!customer` (initial load), show `<CustomerDetailSkeleton />` instead of `return null`. [UI-1]

### `app/(app)/(tabs)/index.tsx` (Dashboard)

→ When `stats === null`, render `<DashboardSkeleton />` inside the `DashboardHeader` stat slots. [UI-1]

### `app/(app)/orders/import.tsx`

→ Replace the static icon + text shown during `isParsing` with a shimmer full-width `SkeletonBlock` animation + progress copy. [UI-1]

**Done when:** No `ActivityIndicator` remains in any content-loading screen. Spinners remain only in: `Button` (action in progress), `PaymentModal` submit, and `orders/import` AI analysis.

---

## Phase 7 — Navigation & Information Architecture

**Goal:** Restructure the tab bar and More tab. Implement tab bar pill indicator stub. Fix ScanTabIcon focused state.

**Depends on:** Phase 4 (screen fixes done so restructuring does not conflict).

---

### `app/(app)/(tabs)/_layout.tsx`

→ Change the 5 tabs from `[Home, Inventory, Scan, Invoices, More]` to `[Home, Inventory, Scan, Invoices, Customers]`. Customers move from the More tab to the main tab bar. [UI-8]
→ Add `Tabs.Screen name="customers"` pointing to the customers index screen.
→ Keep the `More` tab but remove Customers from its `menuItems` array. More tab becomes: Suppliers, Orders, Finance, Settings, Language Toggle, Theme Toggle, Logout.
→ Add a custom `tabBar` render prop stub to `Tabs` — returns the default tab bar for now but is the hook point for Phase 8's pill indicator implementation. [UI-13]
→ Fix `ScanTabIcon` `_focused` prop: when `_focused` is `true`, add a `shadowColor: c.primary, shadowOpacity: 0.4, shadowRadius: 8` glow ring around the circle using an additional `View` with a slightly larger circle positioned behind it. [FE-L2]

### `app/(app)/(tabs)/more.tsx`

→ Remove `Customers` from the `menuItems` array — it now has its own tab. [UI-8]
→ Add a `Divider` between the navigation items group and the utility items group (Language, Theme), and another before Logout. [UI-8]
→ Add `ThemedText variant="sectionLabel"` headers above each group: `"REPORTS"`, `"PREFERENCES"`, `"ACCOUNT"`. [UI-11]

### New file: `app/(app)/(tabs)/customers.tsx`

→ Re-exports or redirects to the existing customers index screen. Expo Router requires a file in the `(tabs)` directory to register it as a tab. Evaluate if the full screen content should be moved here or kept at `app/(app)/customers/index.tsx` as the canonical location. [UI-8]

**Done when:** App launches with 5 tabs: Home, Inventory, Scan, Invoices, Customers. More tab is streamlined with section headers and dividers. ScanTabIcon shows glow when active.

---

## Phase 8 — Animation & Motion Layer

**Goal:** Wire all animation stubs placed in previous phases. This phase is purely additive — no structural changes.

**Depends on:** All previous phases (motion layer sits on top of stable structure).

---

### `src/hooks/useSkeletonShimmer.ts`

→ Implement the actual Reanimated `withRepeat(withTiming(...))` loop that was stubbed in Phase 6. [UI-1]
→ Export `ShimmerOverlay` — a `LinearGradient` positioned absolutely over a `SkeletonBlock`, driven by the shared value's interpolated X position. Gradient sweeps left-to-right across all skeleton blocks simultaneously. [UI-1]

### `src/components/atoms/Button.tsx`

→ Implement the `pressAnimation` prop stub from Phase 1. When `pressAnimation={true}` (default): on `onPressIn`, run `withSpring(0.96, SPRING_PRESS)` on a `scale` shared value; on `onPressOut`, `withSpring(1, SPRING_PRESS)`. Apply via `useAnimatedStyle`. [UI-2]
→ Remove `activeOpacity={0.7}` — replace with `activeOpacity={1}` since scale animation makes opacity dimming redundant. [UI-2]

### `src/components/atoms/Card.tsx`

→ Implement the `interactive` variant press animation: `scale` from 1 → 0.97 on press, spring back on release. [UI-2, UI-5]

### `src/components/molecules/ListItem.tsx`

→ When `onPress` is defined, add `scale: 0.99` on press using Reanimated — subtle but perceptible physical feedback. [UI-2]

### `src/components/atoms/TextInput.tsx` (filled variant)

→ Implement the bottom border animation for `variant="filled"`: border color transitions from `c.border` to `c.primary` via `Animated.timing` on focus. [UI-7]
→ Implement the floating label animation: when `variant="filled"` and value is non-empty OR input is focused, animate label `translateY` from `0` to `-20` and `fontSize` from `sizes.md` to `sizes.xs` via `Animated.parallel`. [UI-7]

### `app/(app)/(tabs)/_layout.tsx` — Tab bar pill

→ Implement the custom `tabBar` stub from Phase 7. Build a custom `TabBar` component with an absolutely-positioned pill that slides horizontally driven by an `Animated.Value` tied to the active tab index. The pill width equals the tab icon container width; it translates via `Animated.timing`. [UI-13]
→ Active tab icon gets `scale: 1.1` animated transform on activation. [UI-13]

### `app/(app)/(tabs)/more.tsx` — Toggle switches

→ Implement dark mode toggle animation: `Animated.Value` transitions between `x: 0` (light) and `x: 20` (dark) via `withSpring`. The knob slides inside the pill. [FE-M3]
→ Same implementation for the language toggle. [FE-M3]

### `src/components/atoms/OfflineBanner.tsx`

→ Implement the slide-down entrance animation stubbed in Phase 1: `translateY` from `-32` to `0` when `isConnected` becomes `false`; reverse when it becomes `true` with the banner removed after animation completes via a `runOnJS` callback. [UI-8]

### `src/components/organisms/PaymentModal.tsx` (BottomSheet backdrop)

→ Add `backdropComponent` prop to `BottomSheetModal` using `BottomSheetBackdrop` with `disappearsOnIndex={-1}` and `appearsOnIndex={0}` for animated scrim. [UI-12]

**Done when:** All press interactions have scale feedback. Skeleton shimmer animates. Tab pill slides between tabs. Toggles animate. OfflineBanner slides in/out. Verify on a physical Android device — not only simulator.

---

## Phase 9 — Invoice Detail & Typography Redesign

**Goal:** Redesign the two most information-dense screens to elevate critical numbers and apply the `display` typography variant. Apply the hero-number pattern.

**Depends on:** Phase 1 (`display` variant in ThemedText), Phase 2 (InvoiceStatusBadge), Phase 5 (i18n).

---

### `app/(app)/invoices/[id].tsx`

→ Add a hero section below `ScreenHeader`: show `payment_status` as a large `InvoiceStatusBadge`, followed by the balance due amount in `variant="display"` (36px/800) in the appropriate semantic color (`c.error` if balance > 0, `c.success` if fully paid). [UI-9]
→ Move the `"Record Payment"` button out of the scrollable totals section into a sticky footer `View` at the bottom of the screen. Render only when `balanceDue > 0`. [UI-9]
→ Convert the `"Billed To"` section to a `Card variant="flat"` with a `sectionLabel` header. [UI-9, UI-11]
→ Replace the bordered items table with alternating `c.surfaceVariant` / `c.surface` row backgrounds and no `borderWidth`. Removes the heavy border-box aesthetic. [UI-9]
→ Apply `sectionLabel` variant to secondary totals rows (`"Subtotal"`, `"CGST"`, `"SGST"`, `"IGST"`). Use `body1 + semibold` for `"Grand Total"` row. Use `display` variant for the grand total amount number. [UI-9, UI-6]

### `app/(app)/customers/[id].tsx`

→ Upgrade the outstanding balance number: change the Phase 4 `variant="h1"` stopgap to the full `variant="display"` for the balance number. [UI-6]
→ Apply `overline` variant to the stats row labels (`"Total Invoiced"`, `"Total Paid"`) — replace the `caption + uppercase letterSpacing` inline style. [UI-11]
→ Convert ledger items from the `borderLeftWidth: 4` colored accent to a cleaner row: `InvoiceStatusBadge` / payment-type indicator on the right, reference + date on the left, using card background rows instead of left borders. [UI-9, UI-11]

**Done when:** Invoice detail and customer detail screens show balance due prominently. Record Payment button is sticky at bottom. Typography hierarchy is immediately clear at a glance.

---

## Phase 10 — Sweep & Enforcement

**Goal:** Close all remaining low-priority items. Enforce spacing grid via lint. Prevent regressions.

**Depends on:** All previous phases.

---

### ESLint Configuration (`eslint.config.js`)

→ Add a rule to flag numeric literals in `StyleSheet.create` and inline JSX styles that fall outside the theme scale. Flag any number not in `[0, 1, 4, 6, 8, 11, 12, 13, 15, 16, 17, 20, 22, 24, 28, 30, 32, 36, 48, 64, 9999]`. Catches future magic numbers in CI. [UI-15]
→ Enable `react/no-array-index-key` rule if not already active — flags remaining `key={i}` patterns. [FE-M12]

### Global `key={i}` sweep

→ Audit every `.map()` call in the codebase still using index as key. Fix remaining instances not covered in earlier phases:

- `LineItemsStep.tsx` (line 79): `key={index}` → `key={item.item_id ?? String(index)}`. [FE-M12]
- `PaymentStep.tsx` (line 62): `key={idx}` → `key={item.design_name + idx}`. [FE-M12]

### Hex-suffix opacity global sweep

→ Run `grep -rn "c\.\w\+ + '" src/ app/` — find all remaining `c.color + '20'` patterns. Replace each with `withOpacity(c.color, 0.12)` or the appropriate semantic `colorLight` token. [FE-H2-adjacent, UI-14]

### `src/components/molecules/FormField.tsx` — label variant cleanup

→ Change form field labels in `FormField` from `variant="label"` (uppercase 13px) to `variant="caption"` with `fontWeight: '600'` — readable, non-uppercase, appropriate for form fields. [UI-6, FE-L5]
→ Update `PaymentModal`'s `"Payment Mode"` label (which redundantly added `textTransform: 'uppercase'`) to use the updated `FormField` label pattern. [FE-L5]

### `app/(app)/finance/profit-loss.tsx` and `app/(app)/settings/index.tsx`

→ Both are stub screens. Replace the "coming soon" plain text with a styled `EmptyState variant="centered"` with an appropriate illustration slot and a localized message. No CTA button. [FE-L4]

### `src/components/organisms/TileSetCard.tsx` — swipe-to-stock-op

→ Add swipe gesture support using `react-native-gesture-handler`'s `Swipeable` (already in deps). Swipe right on a variant row reveals a green "Stock In" action. Swipe left reveals a red "Stock Out" action. Each action triggers the `onPressItem` callback with item and operation type. [UI-14]
→ This eliminates the 3-tap flow (tap card → navigate → tap action) for the most frequent inventory operation.

### `DESIGN_SYSTEM.md` in `docs/`

→ Document: spacing grid, type scale, color usage rules (when to use primary vs semantic colors), shadow tiers, and animation constants. One page. Prevents color overload and magic numbers from recurring. [UI-3]

**Done when:**

- `npm run validate` (typecheck + lint + test + integration) passes clean.
- `grep -rn "c\.\w\+ + '" src/ app/` returns zero results.
- `grep -rn 'key={i}' src/ app/` returns zero results.
- `grep -rn 'ActivityIndicator' src/ app/` returns only action-state uses (Button, PaymentModal submit) — zero content-loading uses.

---

## File Change Summary

| Phase                | Files created | Files modified     | Approx. scope       |
| -------------------- | ------------- | ------------------ | ------------------- |
| 0 — Design tokens    | 1             | 4                  | Small               |
| 1 — Atoms            | 0             | 9                  | Medium              |
| 2 — Molecules        | 3             | 6                  | Medium              |
| 3 — Organisms        | 0             | 4 (+1 dep install) | Large               |
| 4 — Screen logic     | 0             | 11                 | Large               |
| 5 — i18n             | 2             | ~14 + 2 JSON       | Very large (volume) |
| 6 — Skeletons        | 6             | 6                  | Medium              |
| 7 — Nav/IA           | 1             | 2                  | Medium              |
| 8 — Animations       | 0             | 8                  | Medium              |
| 9 — Invoice redesign | 0             | 2                  | Medium              |
| 10 — Sweep           | 1             | ~8                 | Small               |

**Total: ~14 new files, ~74 file modifications, delivered across 10 reviewable PRs.**
