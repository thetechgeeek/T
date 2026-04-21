# UI Library Checklist

> Cross-platform enterprise UI library covering **Web (React)** and **Mobile (React Native)**.
> This checklist tracks only guarantees the design system can prove in isolation.
> Shell responsibilities such as auth/session adapters, permissions, navigation infrastructure, sync orchestration, runtime hosting, and delivery live in `docs/UI_Integration_Checklist.md`.
> Design-tool workflow and optional asset-delivery operations live in `docs/DESIGN_SYSTEM_OPERATIONS_CHECKLIST.md`.
> Each `###` section is split into **Common** (shared), **Web**, and **Mobile** buckets.
> This checklist also incorporates the visual-system findings from `docs/DRIBBBLE_UI_XRAY.md`, so "done" means both enterprise-grade and visually excellent.

## Linear Progress

Read this block top-to-bottom first.
The detailed checklist below remains the full capability matrix, but this section is the linear implementation track so progress does not feel scattered.

1. Done: foundation tokens, theming, runtime quality signals, and design-system guardrails
2. Done: localization, RTL, reduced motion, bold text, and locale formatting proof surfaces
3. Done: current reusable mobile baseline
   Inputs: Text Field, Textarea, Select / Dropdown, Date Picker, Search Input
   Actions: Button, Icon Button
   Feedback: Toast / Snackbar, Alert / Banner, Skeleton Loader, Badge, Empty State
   Data display: Card, Metrics / Stat Card
   Overlays: Modal / Dialog, Confirmation Dialog
4. Done: current composed interaction baseline
   Forms: inline field error + helper text
   Search: horizontal filter chips
5. Done: complete variant and state coverage for the baseline components already in the library
6. Done: expand reusable enterprise compositions for dense data, advanced overlays, and workflow-heavy screens
7. Done: harden the cross-cutting guarantees: accessibility, localization, adaptive behavior, graceful degradation, and performance contracts
8. Done: complete library documentation, governance, and automated verification through sections 9-12
9. Done: complete testing strategy, quality review, and release-readiness coverage

---

## 0. Enterprise x Premium Quality Bar

### Core Doctrine

#### Common

- [x] Premium feeling comes from system discipline: fewer ingredients, stronger hierarchy, calmer surfaces, and better spacing
- [x] Enterprise truth beats portfolio theater: every supported pattern survives loading, empty, error, denied/read-only, dense, localized, zoomed, and ugly-data states
- [x] Every surface has one dominant purpose, one dominant focal point, and one dominant primary action
- [x] Calm chrome rule: grouping is primarily achieved with spacing, surface, and contrast before borders, dividers, and ornament
- [x] Media, gradients, illustration, and 3D are optional enhancements — never structural dependencies for comprehension
- [x] Every component/pattern has relaxed and operationally dense expressions where applicable, using the same tokens and behavior model
- [x] Visual quality bar applies equally to default, loading, empty, error, read-only, denied, and degraded states

### Visual System Laws

#### Common

- [x] Accent budget policy documented: accent reserved for primary CTA, selected state, key data emphasis, and critical status highlight
- [x] Neutral-first surface model documented: canvas, default, raised, overlay, inverse/ink
- [x] Silhouette discipline documented: approved radius families, chip/button/card geometry, and when each may be used
- [x] Typography role discipline documented: display, screen title, section title, body, metadata, metric, label
- [x] Depth discipline documented: ambient lift preferred over harsh drop shadow; border, blur, and contrast rules defined per elevation level
- [x] Navigation and data-heavy surfaces have low-chrome variants that preserve scan speed
- [x] Chart/data visuals prioritize interpretation over decoration: subdued chrome, highlighted focus series, accessible annotations
- [x] Hero treatments (media cards, splash gradients, onboarding art) have explicit guardrails for contrast, performance, and fallbacks

### Anti-Patterns To Prevent

#### Common

- [x] No uncontrolled accent sprawl (multiple saturated colors fighting for attention)
- [x] No giant-card-only layouts for workflows that need density, comparison, or bulk action
- [x] No pastel-only functional states without an ink anchor, label, or contrast-safe pairing
- [x] No decorative charts or illustrations that remove analytical clarity or task comprehension
- [x] No image-dependent layouts that break when media is missing, user-generated, or low quality
- [x] No brand expression that weakens accessibility, responsiveness, or operational clarity

### Definition of Done — Enterprise x Premium

#### Common

- [x] Done means visually coherent, state-complete, accessible, density-aware, localized, and performant
- [x] Hierarchy, spacing rhythm, accent budget, surface calm, and fallback-quality review gates are documented in `docs/DESIGN_SYSTEM_REVIEW_GATES.md`
- [x] Realistic-content review gates cover long names, ugly data, missing media, empty values, and translated copy in `docs/DESIGN_SYSTEM_REVIEW_GATES.md`
- [x] Every new component/pattern documents when to use relaxed/premium presentation vs compact/operational presentation

---

## 1. Design System Architecture

### Design Tokens

#### Common

- [x] Primitive color tokens (full scale: 50–950 for each palette)
- [x] Semantic color tokens (action, surface, text, border, feedback, overlay)
- [x] Surface tier tokens (`surface.canvas`, `surface.default`, `surface.raised`, `surface.overlay`, `surface.inverse`)
- [x] Accent-budget tokens (primary action, selected, data highlight, quiet tint, destructive)
- [x] Component-scoped tokens (button, badge, input, etc.)
- [x] Hero / display emphasis tokens (screen hero, stat hero, promo surface)
- [x] Data emphasis tokens (focused series, muted series, quiet grid, annotation)
- [x] Media overlay tokens (scrims, text-on-image gradients, image fallback surfaces)
- [x] Dark mode token remapping
- [x] High Contrast mode token remapping
- [x] Primitive spacing tokens (4px base scale)
- [x] Semantic spacing tokens (component padding, section gap, etc.)
- [x] Density-aware spacing tokens (`space.density.compact`, `space.density.comfortable`, `space.density.spacious`)
- [x] Radius mapping tokens for component families (card, control, chip, avatar, overlay)
- [x] Border radius tokens (none, sm, md, lg, full)
- [x] Border width tokens
- [x] Shadow / elevation tokens (5 levels: flat, raised, overlay, modal, tooltip)
- [x] Shadow tokens tuned for ambient blur, low opacity, and no harsh default edges
- [x] Font family tokens (UI font, display/brand font)
- [x] Font size tokens (type scale: xs → display-2xl)
- [x] Font weight tokens (400, 500, 600, 700)
- [x] Line height tokens (tight, normal, relaxed)
- [x] Letter spacing tokens
- [x] Duration tokens (instant, micro, fast, normal, slow)
- [x] Easing curve tokens (ease-in, ease-out, ease-in-out, spring)
- [x] Per-component motion profiles mapped to duration + easing tokens
- [x] Opacity tokens
- [x] Token distribution format (W3C Design Tokens JSON / Style Dictionary)
- [x] Token versioning and changelog (track deprecated, renamed, added tokens per release)

#### Web

- [x] Z-index constants file (all z-index values centralized)
- [x] Token transform to CSS Custom Properties
- [x] Token transform to SCSS variables (if SCSS is used)

#### Mobile (React Native)

- [x] Token transform to JS/TS objects (StyleSheet-compatible values)
- [x] Token transform to Android XML resources
- [x] Token transform to iOS Swift asset catalogs
- [x] `PixelRatio`-aware token scaling for different screen densities

### Theming Engine

#### Common

- [x] Multi-brand / white-label token sets (support N brand themes, not just light/dark)
- [x] Theme persistence (user preference saved to localStorage / backend)
- [x] System preference detection (light/dark scheme)
- [x] Theme rules define where brand expression is allowed vs where neutral enterprise surfaces remain default
- [x] Every theme includes an inverse/ink anchor action style for high-contrast hero and media surfaces
- [x] Themes tested across relaxed showcase surfaces and dense operational surfaces

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] React Native ThemeProvider (context-based, `useTheme()` hook)
- [x] Theme resolved at runtime via context (no CSS variables)
- [x] `Appearance` API listener for system theme changes
- [x] Theme switch without app restart
- [x] Nested theme providers for sub-tree theming

### Color System

#### Common

- [x] Neutral palette (50–950)
- [x] Brand primary palette (50–950)
- [x] Brand secondary palette (50–950)
- [x] Neutral surface tint scale for subtle section grouping (not just pure white/gray)
- [x] Inverse / ink surface palette for high-emphasis CTAs and media overlays
- [x] Accent budget rules per theme (max number of high-saturation simultaneous accents per view)
- [x] Success semantic palette
- [x] Warning semantic palette
- [x] Error / Danger semantic palette
- [x] Info semantic palette
- [x] Data visualization qualitative palette (8–12 colors, color-blind safe)
- [x] Chart emphasis palette (focus series, comparison series, muted background series)
- [x] Gradient tokens limited to branded hero surfaces and documented non-functional uses
- [x] Status colors visually harmonized with brand/neutral system (avoid alert rainbow)
- [x] Color-blind safe validation (Deuteranopia, Protanopia tested)
- [x] All foreground/background contrast ratios documented and passing WCAG AA
- [x] Color never sole differentiator of state — always paired with icon, label, or pattern

### Typography System

#### Common

- [x] Type scale defined (xs, sm, md, lg, xl, display-sm, display-md, display-lg, display-xl, display-2xl)
- [x] Display / hero text styles with explicit usage limits (one focal region per screen/section)
- [x] Heading styles (semantic hierarchy decoupled from visual size)
- [x] Body text styles (regular, medium, strong)
- [x] Label / caption styles
- [x] Metric / KPI text styles (dominant value + supporting context)
- [x] Metadata / quiet text styles (timestamps, secondary labels, helper copy)
- [x] Code / monospace style
- [x] Maximum 2 font families per product (UI + optional display/brand; monospace utility exempt)
- [x] Type roles capped per view to avoid hierarchy sprawl
- [x] Heading + body + metric pairing recipes documented for card, form, table, and dashboard surfaces
- [x] Font sizes always reference type-scale tokens (never raw values in component code)
- [x] Non-Latin script font fallback stack (CJK, Arabic, Devanagari)

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] iOS Dynamic Type support (`UIContentSizeCategory` / `allowFontScaling`)
- [x] Android font scale support (`PixelRatio.getFontScale()`)
- [x] `maxFontSizeMultiplier` set on critical fixed-layout text to prevent overflow

### Spacing & Layout Grid

#### Common

- [x] 4px base unit grid
- [x] Full spacing scale defined (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64)
- [x] Card padding scale defined (relaxed, default, dense)
- [x] Section rhythm scale defined (intra-card gap, inter-section gap, page margin)
- [x] Whitespace budgets documented for hero, content, and data-dense layouts
- [x] Dense mode never reduces readability, hit targets, or focus clarity

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Flexbox-only layout system (`StyleSheet.create()`)
- [x] Responsive layout via `useWindowDimensions` / `Dimensions` API
- [x] `PixelRatio`-aware sizing for different screen densities
- [x] `SafeAreaView` / `useSafeAreaInsets` for notch, status bar, home indicator
- [x] `KeyboardAvoidingView` for forms and input-heavy screens

### Elevation & Z-Index

#### Common

- [x] Level 0 — Flat (default page surface)
- [x] Level 1 — Raised (cards, dropdowns)
- [x] Level 2 — Overlay (drawers, side panels)
- [x] Level 3 — Modal (dialogs)
- [x] Level 4 — Tooltip / Popover (always topmost)
- [x] Ambient shadow recipes documented (blur, spread, y-offset) to avoid harsh drop-shadow look
- [x] Border + shadow combinations documented for low-contrast surfaces
- [x] Elevated surfaces remain distinguishable in dark mode, high contrast, and tinted themes

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] iOS shadows: `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` tokens per level
- [x] Android: `elevation` prop values per level
- [x] Platform-specific shadow utility (`Platform.select` for iOS shadow vs Android elevation)

### Iconography

#### Common

- [x] Icon set chosen (consistent stroke weight)
- [x] Size variants: 16px (dense), 20px (default), 24px (standalone)
- [x] Icon usage rules define decorative vs supportive vs primary roles
- [x] Icons never replace labels in first-use or critical enterprise flows
- [x] Icon stroke, optical alignment, and padding consistent across button, input, chip, and nav containers
- [x] Custom icon contribution process documented

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] SVG icons via `react-native-svg` components
- [x] Alternatively: vector icon library (`react-native-vector-icons` / `expo-vector-icons`)
- [x] Icons scale with accessibility font size settings (`allowFontScaling`)
- [x] Decorative icons excluded from accessibility tree (`accessible={false}`)
- [x] Meaningful icons have `accessibilityLabel`

---

## 2. Component Contract Standard

### API Design Contracts

#### Common

- [x] Controlled + Uncontrolled pattern (stateful interactive components support both modes)
- [x] Slot / Composition pattern for complex components (named sub-components, not mega-props)
- [x] Consistent event signature: value first, event/metadata second
- [x] Visual emphasis API standardized (`variant`, `tone`, `size`, `density`, `emphasis`) with clear separation of meaning
- [x] Components support both relaxed and operational density where the pattern materially changes scan efficiency
- [x] Media / illustration / icon slots are optional and layout-safe when absent
- [x] Variant names describe purpose and hierarchy, not arbitrary visual styling
- [x] Consistent prop naming conventions across all components
- [x] Ref forwarding on all interactive and imperative-focus surfaces

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] `style` prop (ViewStyle / TextStyle / ImageStyle) on all components
- [x] Component injection pattern (render props or component props) instead of `as` prop
- [x] `testID` prop support on all components
- [x] Ref forwarded to underlying native view for supported inputs, touchables, scrollables, and modal surfaces

### Accessibility Contract (Per Component)

#### Common

- [x] Full keyboard / assistive technology operability
- [x] Visible focus indicator on interactive elements
- [x] Screen reader announcements for supported dynamic state changes
- [x] Premium visual treatments cannot remove semantic labels, focus visibility, or contrast compliance
- [x] Long labels, translated text, and large text sizes are part of the component contract, not post-hoc fixes

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] `accessible`, `accessibilityRole`, `accessibilityState`, `accessibilityLabel`, `accessibilityHint`
- [x] `accessibilityActions` + `onAccessibilityAction` for custom gestures
- [x] `accessibilityLiveRegion` (Android) / `UIAccessibility.post` notifications (iOS)
- [x] `importantForAccessibility` (Android) to control accessibility tree inclusion
- [x] `testID` attributes for test targeting

### Theming Contract (Per Component)

#### Common

- [x] Component visual styling uses component-scoped or semantic tokens without raw color or typography escapes
- [x] Dark mode fully functional with no component code change
- [x] Components respect accent-budget rules and never self-assign raw brand colors
- [x] Components render correctly on neutral, tinted, inverse, and media-overlay surfaces where applicable
- [x] Components expose explicit high-emphasis vs low-emphasis variants rather than ad hoc one-off styles

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] System appearance changes handled via `Appearance` API
- [x] Reduced motion respected via `AccessibilityInfo.isReduceMotionEnabled()`
- [x] Bold text preference respected (iOS `isBoldTextEnabled`)

### Testing Contract (Per Component)

#### Common

- [x] Unit tests: logic, prop behavior, edge cases (empty, loading, error states)
- [x] Interaction tests: full user flows (keyboard, pointer/touch)
- [x] Supported components are tested with realistic enterprise data (long text, nulls, zero values, huge counts, missing media)
- [x] Supported components are tested across density modes and high-emphasis/low-emphasis variants where supported

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Visual regression baseline on iOS simulator screenshots, with Android emulator proof lane wired in CI
- [x] Accessibility audit notes maintained for VoiceOver/TalkBack spot checks (automated tooling limited)
- [x] Platform-specific test runs (iOS + Android) in CI
- [x] Detox or Maestro interaction tests

### Documentation Contract (Per Component)

#### Common

- [x] All variants and sizes documented
- [x] All meaningful states (loading, disabled, error, empty)
- [x] Real-world composition example
- [x] Prop table with type, default, and description
- [x] Each component docs page shows relaxed/premium usage and dense/operational usage
- [x] Each component docs page includes "works without media/art" example
- [x] Do / Don't guidance includes noisy, over-accented, low-contrast misuse examples
- [x] Do / Don't usage examples

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Example app / Storybook Native for each supported component family and documented state set
- [x] Accessibility notes (accessibilityRole, gesture alternatives)
- [x] Platform-specific behavior differences documented (iOS vs Android)

---

## 3. Components — Reusable UI Blocks

### Inputs

#### Common

- [x] All inputs use quiet chrome + strong label hierarchy (label first, placeholder never primary label)
- [x] Input density variants preserve touch targets, focus visibility, and scanability
- [x] Prefix/suffix icons are supportive, not decorative clutter
- [x] Helper, hint, warning, and error text follow the shared type hierarchy and spacing rhythm
- [x] Text Field
    - [x] Default
    - [x] With prefix icon
    - [x] With suffix icon
    - [x] With character counter
    - [x] With helper text
    - [x] With error message
    - [x] Loading / async validation state
    - [x] Clearable variant
    - [x] Disabled
    - [x] Read-only
- [x] Textarea
    - [x] Auto-resize
    - [x] Max rows constraint
- [x] Select / Dropdown
    - [x] Single select
    - [x] Multi-select
    - [x] Grouped options
    - [x] Searchable
    - [x] Empty state in list
    - [x] Loading state in list
- [x] Combobox / Autocomplete
    - [x] Typeahead
    - [x] Async / debounced fetch
    - [x] "Create new" inline option
    - [x] Multi-select with token display
- [x] Checkbox
    - [x] Default
    - [x] Indeterminate
    - [x] Disabled
    - [x] Group
- [x] Radio
    - [x] Default
    - [x] Disabled
    - [x] Group
- [x] Toggle Switch
    - [x] Default
    - [x] Disabled
    - [x] With label
- [x] Date Picker
    - [x] Single date
    - [x] Locale-aware week start
    - [x] Disabled date rules
- [x] Time Picker
- [x] Date-Range Picker
    - [x] Preset ranges (Last 7 days, This Month, etc.)
- [x] Token / Pill Input (multi-tag)
    - [x] Max-tag limit with overflow indicator
- [x] File Upload / Dropzone
    - [x] Single file
    - [x] Multi-file
    - [x] Progress tracking per file
    - [x] Cancellation
    - [x] Invalid format error state
    - [x] File size exceeded error state
    - [x] Upload failed error state
- [x] Slider
    - [x] Single handle
    - [x] Dual handle (range)
    - [x] Step snapping
    - [x] Value tooltip on drag
- [x] Numeric Stepper
    - [x] Min / Max / Step
    - [x] Locale-aware decimal separators
- [x] OTP / Code Input
    - [x] Auto-advance on fill
    - [x] Paste-splitting across cells
    - [x] Masked variant
- [x] Color Picker
    - [x] Hex / HSL / RGB modes
- [x] Search Input
    - [x] Clear button
    - [x] Loading state
    - [x] Debounced

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] TextInput with `keyboardType` variants (default, numeric, email, phone, url, decimal)
- [x] TextInput with `returnKeyType` (done, next, go, search, send)
- [x] TextInput with `autoComplete` / `textContentType` for autofill (password, email, name)
- [x] `KeyboardAvoidingView` wrapping input-heavy screens
- [x] `Keyboard.dismiss()` on background tap
- [x] Date/Time Picker: native platform picker (iOS wheel/inline, Android dialog)
- [x] Select: native ActionSheet (iOS) / bottom sheet (cross-platform)
- [x] Token / Pill Input: swipe-to-remove tokens
- [x] File Upload: native document picker / image picker integration
- [x] Slider: gesture-based with `react-native-gesture-handler`
- [x] OTP: SMS autofill support (Android `autoComplete="sms-otp"`, iOS `textContentType="oneTimeCode"`)
- [x] Secure text entry (`secureTextEntry` prop) for password fields

### Actions

#### Common

- [x] Action hierarchy model documented: one primary, supporting secondary, quiet tertiary, destructive
- [x] In any surface region, only one action is allowed to visually read as primary by default
- [x] High-emphasis / inverse CTA variant exists for media, hero, and dark surfaces
- [x] Icon-only actions reserved for high-frequency or space-constrained contexts with accessible labeling
- [x] Button
    - [x] Primary
    - [x] Secondary
    - [x] Tertiary / Ghost
    - [x] Danger
    - [x] Loading state (spinner replaces label)
    - [x] Icon Left
    - [x] Icon Right
    - [x] Icon only
    - [x] Sizes: xs, sm, md, lg
    - [x] Disabled
    - [x] Full width
- [x] Icon Button
- [x] Split Button (primary + dropdown for secondary actions)
- [x] Toggle Button Group
    - [x] Radio behavior (mutually exclusive)
    - [x] Checkbox behavior (multi-select)
- [x] Segmented Control

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Pressable / TouchableOpacity with visual press feedback
- [x] Android ripple effect (`android_ripple` prop)
- [x] Haptic feedback on press (success, warning, error intensities)
- [x] FAB with absolute positioning + shadow
- [x] Icon-only buttons have `accessibilityLabel`
- [x] Minimum touch target 44×44pt enforced on all buttons
- [x] Action Sheet (iOS) / bottom sheet menu for secondary actions

### Feedback

#### Common

- [x] Feedback states remain visually polished in success, warning, error, empty, and degraded conditions
- [x] Empty states work text-only; illustration and media are optional enhancements
- [x] Skeleton hierarchy mirrors final layout hierarchy (title, primary CTA, supporting metadata)
- [x] Success messaging stays restrained; warning/error states stay calm and actionable
- [x] Toast / Snackbar
    - [x] Info / Success / Warning / Error variants
    - [x] Error: no auto-dismiss
    - [x] Auto-dismiss with configurable duration
    - [x] Max stack with queue
    - [x] Explicit dismiss button
    - [x] With action CTA
- [x] Alert / Banner
    - [x] Info / Success / Warning / Error variants
    - [x] Dismissible / Persistent
    - [x] With inline CTA
    - [x] Page-level / Inline (section-level)
- [x] Progress Indicator — Circular
    - [x] Determinate (with value label)
    - [x] Indeterminate
- [x] Progress Indicator — Linear
    - [x] Determinate
    - [x] Indeterminate
- [x] Skeleton Loader
    - [x] Text line variants (sm, md, lg)
    - [x] Avatar skeleton
    - [x] Card skeleton
    - [x] Table / list row skeleton
    - [x] Image / media skeleton
    - [x] Reduced-motion variant (static, no shimmer)
- [x] Badge
    - [x] Numeric (with 99+ cap)
    - [x] Status dot
    - [x] Pill / Tag (with color variants)
- [x] Empty State
    - [x] No data (never had data)
    - [x] No results (filtered/searched)
    - [x] No access (permission denied)
    - [x] With illustration
    - [x] With primary CTA
- [x] Error State
    - [x] Server error (5xx)
    - [x] Not found (404)
    - [x] Offline / network error
    - [x] With retry CTA
- [x] Notification Center / Inbox
    - [x] Read / unread states
    - [x] Category grouping (system, mentions, updates)
    - [x] Mark all as read
    - [x] Empty state

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Toast: positioned above keyboard when visible
- [x] Native `ActivityIndicator` as spinner (uses platform-native animation)
- [x] In-app notification banner (top placement, auto-dismisses)
- [x] Skeleton shimmer: disabled when `AccessibilityInfo.isReduceMotionEnabled()` is true
- [x] Haptic feedback on success/error toasts

### Navigation

#### Common

- [x] Navigation chrome is intentionally quiet; active state is clear without saturating the entire shell
- [x] Navigation supports both relaxed showcase shells and dense operational shells using the same token system
- [x] Counts, badges, and status markers never overpower labels or route clarity
- [x] Tabs
    - [x] Horizontal
    - [x] With icon
    - [x] With badge
- [x] Stepper / Wizard Navigation
    - [x] Horizontal / Vertical
    - [x] Step states: completed, active, upcoming, error
    - [x] Non-linear navigation (jump to completed step)

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Accordion / Collapsible with `LayoutAnimation` or `Reanimated`

### Data Display

#### Common

- [x] List
    - [x] Default
    - [x] Selectable
    - [x] With skeleton
- [x] Card
    - [x] Default
    - [x] Clickable / interactive
    - [x] With header / body / footer slots
    - [x] Horizontal layout variant
    - [x] Featured / hero variant with restrained accent/media treatment
- [x] Metrics / Stat Card
    - [x] KPI value
    - [x] Trend delta (positive / negative)
    - [x] Sparkline
    - [x] Comparison period label
    - [x] Loading / error state
    - [x] Stale data / last updated indicator
    - [x] Quiet comparison baseline (not only color)
- [x] Timeline / Activity Feed
    - [x] Date separators
    - [x] Infinite scroll
    - [x] Real-time new item injection
- [x] Avatar
    - [x] Image
    - [x] Initials fallback on image error
    - [x] Size variants
    - [x] With status indicator
- [x] Avatar Group
    - [x] Max display count with +N overflow
- [x] Description List / Key-Value Pairs
    - [x] Horizontal / vertical layout
    - [x] Copyable value
    - [x] Sensitive data mask (with reveal)
- [x] Charts
    - [x] Line / Bar / Area / Pie / Donut / Scatter / Heatmap / Sparkline
    - [x] Color-blind safe palette
    - [x] Empty / Loading / Error states
    - [x] Accessible title + description
    - [x] Focus-series emphasis and muted non-focus series
    - [x] Calm grid / axis styling
    - [x] Annotation / threshold markers
- [x] Card families share silhouette, spacing, header/body/footer grammar, and density variants
- [x] Stat cards expose one dominant metric, one secondary context band, and quiet metadata
- [x] Charts prioritize interpretation over decoration: subdued scaffolding, focused data emphasis, accessible annotations
- [x] Media-based displays degrade gracefully to text-first layouts when imagery is missing or poor
- [x] Every data surface has a dense operational variant where the domain requires comparison or bulk scanning

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Virtualized List via `FlatList` / `FlashList`
    - [x] `removeClippedSubviews` optimization
    - [x] `windowSize`, `maxToRenderPerBatch`, `initialNumToRender` tuning
    - [x] `getItemLayout` for fixed-height rows (skip measurement)
    - [x] Infinite scroll via `onEndReached` with threshold tuning
    - [x] Pull-to-refresh via `RefreshControl`
    - [x] Empty list component (`ListEmptyComponent`)
    - [x] Section headers via `SectionList`
- [x] Sortable List (drag-to-reorder)
- [x] Swipe-to-reveal actions on list rows (swipe-to-delete, swipe-to-archive)
- [x] Card with `Pressable` press animation (scale / opacity feedback)
- [x] Charts: `react-native-svg` or `victory-native` based
- [x] Avatar Group: tap to expand hidden members
- [x] Image / Media Viewer
    - [x] Pinch-to-zoom (gesture handler)
    - [x] Swipe-to-dismiss
    - [x] Gallery swipe navigation
    - [x] Progressive image loading (thumbnail → full resolution)
- [x] Kanban Board with horizontal `ScrollView` + draggable cards (gesture handler)

### Overlays

#### Common

- [x] Overlays create depth through surface contrast, spacing, and focus management before relying on shadow
- [x] Dialogs, drawers, and sheets define one dominant action and quiet secondary actions
- [x] Overlay layouts support relaxed and dense content compositions without losing hierarchy
- [x] Modal / Dialog
    - [x] Focus trap / accessibility focus
    - [x] Dismiss on Escape / back gesture
    - [x] Focus restore to trigger on close
    - [x] Small / Medium / Large size variants
    - [x] Confirmation dialog variant (with Danger button)
    - [x] Stacking limited to 2 deep
- [x] Tooltip
    - [x] Max-width enforced
    - [x] Never contains interactive elements
- [x] Popover
    - [x] With interactive content (forms, links)
    - [x] Dismisses on Escape / back + outside tap
    - [x] Focus moves inside on open
- [x] Confirmation Dialog
    - [x] Standard (cancel + confirm)
    - [x] Hard confirmation (type entity name)

#### Web

- [x] Detailed web backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Modal: `react-native` `<Modal>` or `react-navigation` modal stack
- [x] Modal: animated entry (slide up / fade in via Reanimated)
- [x] Bottom Sheet (`@gorhom/bottom-sheet` or equivalent)
    - [x] Snap points (25%, 50%, 90%)
    - [x] Drag-to-dismiss with velocity threshold
    - [x] Backdrop tap to close
    - [x] Keyboard-aware (adjusts snap point when keyboard appears)
    - [x] Nested scrolling within sheet content
- [x] Tooltip: shown on long-press (no hover on touch devices)
- [x] Context Menu: long-press trigger with haptic feedback
- [x] iOS-style Action Sheet (share, copy, delete…)
- [x] Alert dialog: `Alert.alert()` for native OS dialogs (simple confirmations)
- [x] Popover: positioned relative to trigger using `onLayout` measurements

---

## 4. Patterns — Reusable Compositions

> Web-specific pattern backlog lives in `docs/UI_Library_Web_Backlog.md`.
> Shell-orchestration rows live in `docs/UI_Integration_Checklist.md`.

### Forms & Validation

#### Common

- [x] Form compositions define a clear visual reading order: title, key instruction, fields, primary action
- [x] Forms support relaxed onboarding layouts and dense enterprise editing layouts with the same components
- [x] Long labels, helper copy, validation, and permission explanations never break layout hierarchy
- [x] Inline field error message (below field, linked to field for screen readers)
- [x] Field warning (non-blocking, yellow)
- [x] Field info / helper text (persistent, gray)
- [x] Validation timing: `onChange` for format, `onBlur` for required/pattern
- [x] Server-side error injection into field after submission
- [x] Field-level async validation (debounced, loading spinner, screen reader announcement)
- [x] Conditional / dynamic fields (appear/disappear based on other fields)
- [x] Schema-driven / declarative form generation
- [x] Draft auto-save with status indicator ("Saving…", "Saved", "Save failed — retry")
- [x] Conflict detection on re-open of a draft
- [x] Read-only form mode (plain text, not disabled inputs)
- [x] RBAC-aware disabled field (lock icon + tooltip/hint with reason)
- [x] Multi-step / Wizard form
- [x] Per-step validation (not all-at-once on final step)
- [x] Non-linear wizard step navigation (jump to completed step)

#### Mobile (React Native)

- [x] Keyboard avoidance: form auto-scrolls to focused field
- [x] `returnKeyType="next"` on fields to advance via keyboard "Next" button
- [x] Programmatic focus: `TextInput.focus()` to advance to next field on submit
- [x] Scroll-to-error on validation failure
- [x] Haptic feedback on validation error

### CRUD Patterns

#### Common

- [x] CRUD flows support both dense table/grid operations and calmer summary/detail surfaces
- [x] Destructive action hierarchy escalates visually with severity without becoming theatrical
- [x] Bulk action surfaces preserve one clear primary action and quiet secondary utilities
- [x] Dirty-state indicator (unsaved changes badge)
- [x] Bulk action bar (appears on any selection)
- [x] Select all on current page / across all pages (with count)
- [x] Bulk action progress indicator
- [x] Soft delete / Archive (moves to trash, not permanent)
- [x] Soft confirmation delete (Toast + "Undo" for 5s)
- [x] Standard confirmation delete (dialog with item name)
- [x] Hard confirmation delete (type entity name / "DELETE")
- [x] Restore from archive / trash
- [x] Permanent delete from trash (separate, explicit step)
- [x] Duplicate / Clone entity
- [x] Comparison / diff view (before and after states)
- [x] Version history / audit log view

#### Mobile (React Native)

- [x] Swipe-to-delete on list rows (with undo toast)
- [x] Swipe-to-archive on list rows
- [x] Long-press to enter multi-select mode
- [x] Haptic feedback on destructive action confirmation

### Search & Filtering

#### Common

- [x] Search entry can feel premium and welcoming, but advanced filtering scales to dozens of enterprise criteria without losing clarity
- [x] Filter chips, pills, and saved views have overflow/compaction behavior
- [x] Active filters use restrained emphasis; not every control is saturated or elevated
- [x] Faceted filters (checkbox per facet with count)
- [x] Live filter (apply on change) vs. explicit apply button
- [x] Filter by text / number / date / enum
- [x] Advanced query builder (AND/OR rule groups)
- [x] Filter badges / active filter strip (dismissible pills above dataset)
- [x] "Clear all filters" button
- [x] Saved views (named bookmarks of filter + sort + column state)
- [x] Private vs. team-shared saved views
- [x] Text highlight of matched search term within results
- [x] Recent searches

#### Mobile (React Native)

- [x] Search bar with cancel button (iOS-style) / back arrow (Android-style)
- [x] Filter bottom sheet / modal (not sidebar)
- [x] Search suggestions dropdown below search bar
- [x] Filter chips (horizontal scrollable strip)

### Data Interaction & Layout

#### Common

- [x] Each view defines one dominant focal region (hero metric, table, chart, detail panel) rather than many equal-weight panels
- [x] Layout system supports summary-first and dense-analysis modes
- [x] Featured widgets/cards are optional and removable without collapsing the core workflow
- [x] Drill-down navigation (metric → underlying records)
- [x] Drag-and-drop — reorder within same list
- [x] Density toggle (comfortable, compact, spacious — web) or compact toggle (mobile)
- [x] Expandable / collapsible sections (accordion)

#### Mobile (React Native)

- [x] Gesture-driven drag-and-drop (gesture-handler powered)
- [x] Swipe gestures for actions within data lists
- [x] `FlatList` / `FlashList` virtual scrolling for long lists
- [x] Pull-to-refresh on data screens
- [x] Sticky section headers in `SectionList`

### Feedback Loops

#### Common

- [x] Tentative, syncing, stale, and confirmed states are visually distinct without noisy animation
- [x] Background refresh and job progress surfaces stay calm and non-disruptive
- [x] Optimistic UI update (instant + rollback on failure)
- [x] Stale-while-revalidate (show cached data, update in background)
- [x] "Last updated X ago" indicator with manual refresh
- [x] Long-running job kick-off (returns job ID, transitions to processing state)
- [x] Long-running job progress / completion / failure / cancelation
- [x] "X new items available — click/tap to refresh"
- [x] Connectivity status indicator (online, offline, reconnecting)
- [x] Conflict resolution: "Updated by another user while you were editing"
- [x] Collaborative lock: "Anna is currently editing this record"
- [x] Error boundary — component level / section level

### Clipboard Patterns

#### Common

- [x] Copy-to-clipboard button (with "Copied!" confirmation)
- [x] Copy URL / share link
- [x] Copy formatted content (table rows, code blocks)

#### Mobile (React Native)

- [x] `Clipboard` API (expo-clipboard) for copy/paste
- [x] Native share sheet (`Share.share()`) for sharing content to other apps
- [x] Universal link / deep link copying

### Keyboard Shortcuts Framework

#### Mobile (React Native)

- [x] External keyboard support (iPad, Android tablets with keyboard)
- [x] `onKeyPress` handling for external keyboard shortcuts
- [x] Keyboard shortcut discoverability in settings/help screen

### Import / Export Patterns

#### Common

- [x] CSV / Excel / JSON export surfaces (current view + full-dataset handoff)
- [x] Import wizard: upload → column mapping → preview → validation → confirm
- [x] Import error report (row-level errors with correction suggestions)
- [x] Import progress indicator for large datasets
- [x] Template download for import format
- [x] Import/export flows prioritize clarity, mapping fidelity, and correction speed over decorative chrome

#### Mobile (React Native)

- [x] Export: share file via native share sheet (email, AirDrop, Files app)
- [x] Import: file picker integration (document picker)
- [x] Export to device Files app / save target

---

## 5. Accessibility (a11y) Architecture

### Compliance Target

#### Common

- [x] Minimum: WCAG 2.2 Level AA
- [x] Target: WCAG 2.2 Level AAA for critical flows (auth, account settings, checkout)
- [x] Legal compliance documented (Section 508, EN 301 549, AODA as applicable)
- [x] Premium/branded surfaces have no accessibility exemptions for contrast, focus, motion, or readability

### Semantic Structure

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] All interactive elements use `Pressable` / `TouchableOpacity` (never `View` + `onPress` without accessibility)
- [x] `accessibilityRole` set correctly (button, link, header, image, search, tab, etc.)
- [x] `accessibilityLabel` on all non-text interactive elements
- [x] Heading hierarchy via `accessibilityRole="header"` on section titles

### ARIA / Accessibility API Usage

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] `accessibilityState` for dynamic states (selected, expanded, disabled, busy, checked)
- [x] `accessibilityValue` for sliders, progress indicators (min, max, now, text)
- [x] `accessibilityHint` for non-obvious actions ("Double tap to open settings")
- [x] `accessibilityLiveRegion="polite"` / `"assertive"` (Android) for dynamic announcements
- [x] `AccessibilityInfo.announceForAccessibility()` for programmatic announcements (iOS + Android)

### Keyboard Navigation Map

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] External keyboard navigation on tablets (Tab, Enter, arrow keys)
- [x] `accessibilityActions` + `onAccessibilityAction` for custom screen reader gestures
- [x] VoiceOver and TalkBack gesture expectations are documented for the supported surface and revisited in manual audits

### Focus Management

#### Common

- [x] Focus restoration on overlay close (returns to trigger element)
- [x] Logical focus order (no manual tabindex > 0 or equivalent)

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] VoiceOver/TalkBack focus set to screen title on navigation
- [x] `AccessibilityInfo.setAccessibilityFocus(ref)` for programmatic focus
- [x] Focus order follows visual layout (use `accessibilityViewIsModal` for modals)
- [x] `accessibilityElementsHidden` (iOS) / `importantForAccessibility="no-hide-descendants"` (Android) for content behind modals

### Color & Visual Accessibility

#### Common

- [x] Text contrast: 4.5:1 (normal text), 3:1 (large text ≥ 18pt / 14pt bold)
- [x] UI component contrast: 3:1 (WCAG 1.4.11)
- [x] Color never sole differentiator of state
- [x] Soft/pastel themes include high-contrast ink anchors for primary actions and critical states
- [x] Charts use label, shape, pattern, and stroke differentiation in addition to color

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] iOS Bold Text preference respected (`AccessibilityInfo.isBoldTextEnabled`)
- [x] Android high-contrast text setting respected
- [x] System font size scaling tested at maximum scale

### Screen Reader Testing Matrix

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Physical-device VoiceOver and TalkBack audits remain a documented manual release gate in `docs/DESIGN_SYSTEM_ACCESSIBILITY_AUDIT.md`

### Reduced Motion

#### Common

- [x] Never rely on animation alone to communicate state change

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] `AccessibilityInfo.isReduceMotionEnabled()` checked before animations
- [x] `Animated` / `Reanimated` animations disabled or instant under reduced motion
- [x] `LayoutAnimation` disabled under reduced motion
- [x] Skeleton loaders: static under reduced motion

### Forms Accessibility

#### Common

- [x] Every input has an associated label (programmatic, not placeholder-only)
- [x] Required fields indicated visually + programmatically
- [x] Error messages associated with field and announced to screen readers

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] `accessibilityLabel` on all inputs (since no HTML `<label>`)
- [x] Error announced via `AccessibilityInfo.announceForAccessibility()`
- [x] Required field indicated via `accessibilityHint` ("required")

### Zoom & Magnification

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] System font scale tested at maximum (iOS: ~300%, Android: ~200%)
- [x] `maxFontSizeMultiplier` set on layout-critical text
- [x] Layouts tested at largest accessibility text size without content clipping
- [x] Hero/display typography and featured cards reflow gracefully without losing hierarchy at max font scale

---

## 6. Internationalization (i18n) & Localization (L10n)

### String Externalization

#### Common

- [x] Workbench and proof-deck copy is centralized in `src/design-system/copy.ts`
- [x] Copy registry uses a namespaced hierarchy across sections, components, and runtime labels
- [x] Locale-aware dynamic strings flow through helper and formatter functions in `copy.ts` and `formatters.ts`
- [x] Design-system components accept host-app copy via props instead of importing product i18n hooks
- [x] Locale ordering and interpolation logic stay in helper functions instead of ad hoc screen-level concatenation

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] i18n library integrated (i18next + react-i18next, expo-localization, or equivalent)
- [x] Device locale detection (`expo-localization` / `react-native-localize`)
- [x] Language change without app restart

### RTL (Right-to-Left) Layout Support

#### Common

- [x] Directional icons (arrows, chevrons) mirrored in RTL
- [x] RTL visual regression tests in CI pipeline

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] `I18nManager.forceRTL(true)` / `I18nManager.allowRTL(true)` configured
- [x] `writingDirection: 'rtl'` applied on shared text and input primitives
- [x] Flexbox `direction` property applied on shared screen and workbench shells for layout mirroring
- [x] `I18nManager.isRTL` used for conditional directional logic
- [x] App restart handling after RTL toggle (or hot-reload if supported)

### Locale-Aware Formatting

#### Common

- [x] Numbers: `Intl.NumberFormat` (decimal separator, thousands grouping)
- [x] Currency: `Intl.NumberFormat` with `style: 'currency'`
- [x] Dates & Times: `Intl.DateTimeFormat` + `Intl.RelativeTimeFormat` (timezone-aware)
- [x] Lists: `Intl.ListFormat`
- [x] Sorting / Collation: `Intl.Collator`
- [x] Pluralization: ICU Plural Rules

#### Mobile (React Native)

- [x] Hermes `Intl` polyfill bundle enabled for device + stress locales
- [x] Timezone handling: device timezone via `expo-localization` or `react-native-localize`

### Text Expansion & Layout

#### Common

- [x] UI accommodates text expansion up to 40% (German, Finnish)
- [x] Locale snapshot matrix covers `en-US`, `de-DE`, `ar-SA`, and `ja-JP` on representative DS surfaces
- [x] Hero headings, pill controls, chips, and metric labels wrap and scale gracefully under locale stress
- [x] Dense table and card layouts preserve hierarchy when translated labels grow in proof snapshots
- [x] Space-constrained shared inputs and actions prefer accessible labels and hints over silent truncation

### Character Set & Encoding

#### Common

- [x] UTF-8 encoding end-to-end
- [x] Support for non-Latin scripts: CJK, Arabic, Hebrew, Devanagari
- [x] Font stacks include system fallbacks for scripts not covered by brand font
- [x] Correct line-breaking rules per script

---

## 7. Performance UX

### Perceived Performance Patterns

#### Common

- [x] Skeleton loaders: shapes match loaded content (eliminate layout shift)
- [x] Optimistic UI: update immediately for high-success-rate actions
- [x] Stale-while-revalidate: show cached data immediately, refresh in background
- [x] Progressive loading: critical content first, secondary lazy-loaded
- [x] First meaningful hierarchy (screen title, primary CTA, key metric or key task input) appears before decorative enhancements
- [x] Hero media, illustrations, and brand motion never block core task readiness

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] `FlatList` / `FlashList` / `SectionList` for all scrollable lists (never `ScrollView` with many children)
- [x] `InteractionManager.runAfterInteractions()` for deferred work after navigation
- [x] Placeholder / shimmer components while screens mount
- [x] Preload next screen data during current screen interaction

### Asset Optimization

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Images: `expo-image` / `react-native-fast-image` for caching + priority loading
- [x] Images: progressive loading (low-res placeholder → full resolution)
- [x] Icons: tree-shaken SVG components or selective vector icon imports

### Interaction Responsiveness

#### Common

- [x] Search inputs: 300ms debounce
- [x] ≤ 100ms: no indicator; 100–1000ms: loading indicator; > 1000ms: progress with estimate

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Feature-level JS-thread offloading is tracked in `docs/UI_Integration_Checklist.md`
- [x] Gesture handler animations on UI thread (Reanimated `useAnimatedGestureHandler`)
- [x] List scroll performance: `removeClippedSubviews`, proper `keyExtractor`

### Bundle Performance

#### Common

- [x] Packaging, tree-shaking, and component-size governance are tracked in `docs/DESIGN_SYSTEM_OPERATIONS_CHECKLIST.md`
- [x] No circular dependencies between component packages
- [x] Optional illustration, chart, and animation package boundaries stay a packaging concern rather than an in-repo workbench assumption

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Native dependency budget governance is tracked in `docs/DESIGN_SYSTEM_OPERATIONS_CHECKLIST.md`

---

## 8. Responsive & Adaptive Design

### Breakpoints & Responsive Strategy

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] `useWindowDimensions` / `Dimensions` API for responsive layouts
- [x] Device type detection (phone vs. tablet) for layout switching
- [x] `Platform.select()` / `Platform.OS` for platform-specific values
- [x] Responsive hook/utility that maps dimensions to breakpoint tokens

### Adaptive Component Variants

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Phone components collapse to single-column, touch-first layouts without losing hierarchy
- [x] Tablet components expand to multi-column or split-pane layouts when the pattern benefits from extra space

### Touch & Pointer

#### Common

- [x] Core interactive controls preserve a minimum touch target of at least 44×44px

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] `hitSlop` on small interactive elements expands touch target where chrome stays compact
- [x] Gesture-driven interactions (`react-native-gesture-handler`)
    - [x] Swipe to delete / archive
    - [x] Swipe to navigate back (iOS)
    - [x] Pinch to zoom
    - [x] Long press for context actions
- [x] Haptic feedback on key interactions (toggle, delete confirm, success)
- [x] `activeOpacity` / `android_ripple` or equivalent pressed-state feedback exists on shared pressables

### Typography & Spacing

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Responsive font sizes via scale factor utility (based on screen width)
- [x] Font sizes respect system accessibility scaling (`allowFontScaling`)
- [x] Spacing scales appropriately between phone and tablet layouts
- [x] Card padding, hero spacing, and CTA hierarchy adapt between phone and tablet without bloating or crowding

### Print

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

### Orientation

#### Common

- [x] Portrait and landscape proof snapshots preserve hierarchy without content loss

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] `Dimensions` event listener for orientation changes
- [x] Layout transitions animated on rotation
- [x] Safe area insets recalculated on orientation change

### Platform-Specific Adaptive Patterns

#### Mobile (React Native)

- [x] Large screen optimization guidelines (min touch target, readable line lengths, no stretched layouts)

---

## 9. Motion & Animation System

### Principles

#### Common

- [x] Motion principles, interruptibility, and no-decorative-motion rules are documented in `docs/DESIGN_SYSTEM_MOTION_GUIDELINES.md`

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Animations run on the UI thread via Reanimated shared values and animated styles for the supported design-system surface
- [x] Raw `Animated` from `react-native` is not part of the supported design-system surface; any legacy/app-only usage remains an integration concern and requires `nativeDriver: true`

### Duration Scale

#### Common

- [x] Instant: 0ms (state changes — no motion)
- [x] Micro: 100ms (hover/press effects, focus rings)
- [x] Fast: 200ms (tooltip, dropdown open)
- [x] Normal: 300ms (modal enter, drawer slide, page transition)
- [x] Slow: 500ms (complex layout transitions) — never > 500ms for user-triggered actions

### Easing Curves

#### Common

- [x] Ease Out (default entry): `cubic-bezier(0.0, 0.0, 0.2, 1)` — element entering
- [x] Ease In (exit): `cubic-bezier(0.4, 0.0, 1, 1)` — element leaving
- [x] Ease In-Out (repositioning): `cubic-bezier(0.4, 0.0, 0.2, 1)` — element moving within viewport
- [x] Spring (interactive): spring physics for drag, swipe, bouncy feedback

#### Mobile (React Native)

- [x] Reanimated spring configs: `damping`, `stiffness`, `mass` presets for consistent feel
- [x] `Easing` module mappings for shared animation helpers are centralized in `src/theme/animations.ts`

### Animation Patterns

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Fade In/Out and scale entrance patterns are tokenized through shared timing/spring helpers and existing DS proof surfaces
- [x] Slide entrance, shared-element transitions, and navigator-owned page choreography are tracked in `docs/UI_Integration_Checklist.md`
- [x] Height Expand: `LayoutAnimation.configureNext()` or Reanimated layout animations
- [x] Skeleton Shimmer: shared loading shimmer stays tokenized, subtle, and reduced-motion safe
- [x] Spinner: native `ActivityIndicator` or equivalent native spinner surface
- [x] Bottom sheet snap: spring-driven with velocity-aware gesture release
- [x] Reusable motion patterns are limited to structural surfaces and do not permit continuous decorative motion on work surfaces
- [x] Haptic and motion pairings are limited to meaningful DS-owned interactions rather than ambient flourish

### Reduced Motion Contract

#### Common

- [x] State changes still happen — only motion is removed, never functionality

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] `AccessibilityInfo.isReduceMotionEnabled()` listener registered at app root
- [x] All Reanimated / Animated animations conditional on reduced-motion flag
- [x] `LayoutAnimation` skipped under reduced motion
- [x] Provide `useReducedMotion()` hook for component-level opt-out

---

## 10. Copy & Microcopy Standards

### Voice & Tone Framework

#### Common

- [x] Tone guidelines, calm-copy rules, and ownership boundaries are documented in `docs/DESIGN_SYSTEM_COPY_STANDARDS.md`

### Button & CTA Labels

#### Common

- [x] Shared CTA rules are documented in `docs/DESIGN_SYSTEM_COPY_STANDARDS.md`
- [x] Shared button fallback helpers support action-framed loading labels via `src/design-system/microcopy.ts`
- [x] Only the highest-priority action gets high-emphasis wording and styling within a surface

### Error Messages

#### Common

- [x] Reusable error-copy rules are documented in `docs/DESIGN_SYSTEM_COPY_STANDARDS.md`
- [x] Shared fallback surfaces lead with what happened and present a calm next step without blaming the user

### Empty & Loading States

#### Common

- [x] Empty and loading state wording rules are documented in `docs/DESIGN_SYSTEM_COPY_STANDARDS.md`
- [x] Empty-state surfaces support a single clear CTA where recovery/action exists
- [x] Loading copy and skeleton structure stay action-framed and art-optional in the workbench proof deck

### Confirmation & Destructive Actions

#### Common

- [x] Destructive-copy rules are documented in `docs/DESIGN_SYSTEM_COPY_STANDARDS.md`
- [x] Entity-specific destructive wording remains a composed-surface responsibility for the host app

### Feedback & Status Copy

#### Common

- [x] Feedback/status tone rules are documented in `docs/DESIGN_SYSTEM_COPY_STANDARDS.md`
- [x] Relative timestamps can pair with absolute datetime detail through shared formatting helpers
- [x] "—" for missing numeric/optional values is standardized through shared formatting helpers

### Terminology Consistency

#### Common

- [x] Capitalization, pluralization, and abbreviation rules are documented in `docs/DESIGN_SYSTEM_COPY_STANDARDS.md`

### Permissions & Access Copy

#### Common

- [x] Permission-denied and disabled-field copy rules are documented in `docs/DESIGN_SYSTEM_COPY_STANDARDS.md`

### Numbers & Data

#### Common

- [x] Large numbers, percentages, currency, dates, lists, and pluralization use shared locale-aware formatters in `src/design-system/formatters.ts`
- [x] Missing-value placeholder rules are shared and documented
- [x] KPI context rules are documented in `docs/DESIGN_SYSTEM_COPY_STANDARDS.md`

### Truncation Rules

#### Common

- [x] Truncation and overflow rules are documented in `docs/DESIGN_SYSTEM_COPY_STANDARDS.md`
- [x] Action labels prefer wrapping or explicit abbreviation over silent truncation
- [x] Hero headings, tabs, chips, and metric labels have explicit wrapping/overflow rules in shared component docs

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] `numberOfLines` + `ellipsizeMode` remain available through the shared text primitive and composed surfaces
- [x] Full-text recovery for truncated values remains a composed-surface responsibility documented in `docs/DESIGN_SYSTEM_COPY_STANDARDS.md`

### Accessibility Copy

#### Common

- [x] Icon-only and live-announcement copy rules are documented in `docs/DESIGN_SYSTEM_COPY_STANDARDS.md`

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] `accessibilityLabel` and `accessibilityHint` phrasing conventions are documented in `docs/DESIGN_SYSTEM_COPY_STANDARDS.md`

---

## 11. Design System Governance

### Versioning & Release Process

#### Common

- [x] Versioning, release, changelog, and migration policy are tracked in `docs/DESIGN_SYSTEM_GOVERNANCE.md`

### Deprecation Policy

#### Common

- [x] Deprecation windows, warning requirements, and replacement guidance are tracked in `docs/DESIGN_SYSTEM_GOVERNANCE.md`

### Contribution Model

#### Common

- [x] Reuse threshold, RFC expectations, build-vs-borrow guidance, and quality gates are tracked in `docs/DESIGN_SYSTEM_GOVERNANCE.md`

#### Mobile (React Native)

- [x] Cross-platform parity review is required unless a component is explicitly scoped
- [x] Platform-specific behavior documented (iOS vs Android differences)

### Living Documentation

#### Common

- [x] CI integration: documentation builds on every PR
- [x] Documentation explains when to use relaxed showcase presentation vs dense operational presentation

#### Web

- [x] Web documentation tooling backlog for this section is tracked in `docs/DESIGN_SYSTEM_OPERATIONS_CHECKLIST.md`

#### Mobile (React Native)

- [x] Example app or Storybook Native as documentation surface
- [x] Simulator/emulator screenshots captured per PR for visual review
- [x] Platform-specific behavior documented alongside each component

---

## 12. State Resilience & Graceful Degradation

### Error Boundary Levels

#### Common

- [x] Component-level and section-level fallback rules are documented in `docs/DESIGN_SYSTEM_STATE_RESILIENCE.md` and proven in the workbench state deck
- [x] Route/screen/application error-boundary orchestration is tracked in `docs/UI_Integration_Checklist.md`
- [x] Partial failure state (some widgets loaded, some failed — clearly differentiated)
- [x] Failure surfaces preserve composure: clear hierarchy, calm chrome, actionable next step

### Network / API Failures

#### Common

- [x] Generic loading, stale, server-error, not-found, denied, and offline fallback surfaces are part of the DS state proof deck
- [x] Auth/session, rate-limit, reconnect, and route recovery orchestration is tracked in `docs/UI_Integration_Checklist.md`

### Component States (All for Every Component)

#### Common

- [x] Default (nominal)
- [x] Loading (async in progress)
- [x] Error (something went wrong)
- [x] Empty (loaded, but no data)
- [x] Disabled (not available, reason surfaced)
- [x] Read-only (viewable, not editable)
- [x] Denied (no access, reason and path forward surfaced)
- [x] Partial (some loaded, some failed)
- [x] Loading, empty, error, read-only, and denied states meet the same visual quality bar as nominal state

### Data Edge Cases

#### Common

- [x] Zero results — empty state with CTA
- [x] Single result — no awkward "1 of 1" pagination
- [x] Very long string — truncated, never breaks layout
- [x] Null / undefined — consistent placeholder ("—" or "Not set")
- [x] Large numeric value — locale-formatted, never overflows
- [x] Large dataset (10k+ rows) — virtualized, keyboard/scroll nav intact
- [x] Stale / cached data — visually distinguished with timestamp
- [x] Missing media, avatar, illustration, or sparkline falls back to text-first layout with no broken composition

#### Web

- [x] Detailed web backlog for this section is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Very long lists — `FlatList` / `FlashList` handles gracefully, no memory leak
- [x] Image loading failure — placeholder shown, retry available

### Optimistic UI Failures

#### Common

- [x] Optimistic rollback and retry orchestration are tracked in `docs/UI_Integration_Checklist.md`

### Long-Running Job Failures

#### Common

- [x] Long-running job timeout, partial-success, and failure notification orchestration are tracked in `docs/UI_Integration_Checklist.md`

### Conflict Resolution

#### Common

- [x] Conflict-resolution and concurrent-edit orchestration are tracked in `docs/UI_Integration_Checklist.md`

---

## 13. Testing Strategy

### Testing Pyramid

#### Common

- [x] `npm run validate` enforces TypeScript strict mode, ESLint, design-system guardrails, unit tests, and integration tests for the supported library surface
- [x] Verification ownership for component logic, utility functions, and token contracts is documented in `docs/DESIGN_SYSTEM_VERIFICATION_STRATEGY.md`

#### Web

- [x] Detailed web testing backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] React Native-specific linting plus Jest + React Native Testing Library, screen-level integration coverage, and Maestro E2E lanes are documented in `docs/DESIGN_SYSTEM_VERIFICATION_STRATEGY.md`

### Component-Level Tests

#### Common

- [x] Supported components must cover prop variants, press/focus/keyboard interaction, edge cases, controlled/uncontrolled behavior, no-media fallbacks, and density/emphasis variants as documented in `docs/DESIGN_SYSTEM_VERIFICATION_STRATEGY.md`

#### Web

- [x] Detailed web testing backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] React Native verification includes iOS/Android render proof, native accessibility properties, and gesture interaction coverage for supported components

### Accessibility Tests

#### Common

- [x] Manual screen-reader cadence and keyboard/assistive-tech walkthrough expectations are documented in `docs/DESIGN_SYSTEM_ACCESSIBILITY_AUDIT.md`

#### Web

- [x] Detailed web accessibility-testing backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] VoiceOver, TalkBack, max-font-scale, and accessibility-inspector release gates are documented in `docs/DESIGN_SYSTEM_ACCESSIBILITY_AUDIT.md`

### Visual Regression Tests

#### Common

- [x] Snapshot and screenshot baselines cover state matrices, themes, RTL, ugly-data fixtures, missing media, and emphasis variants through the workbench proof surfaces and documented verification strategy

#### Web

- [x] Detailed web visual-regression backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] iOS/Android screenshot proof, light/dark coverage, and representative device-matrix expectations are documented in `docs/DESIGN_SYSTEM_VERIFICATION_STRATEGY.md`

### Enterprise x Premium Quality Review

#### Common

- [x] Hierarchy, primary action clarity, spacing rhythm, accent budget, relaxed/dense compositions, fallback states, and realistic enterprise-content review gates are documented in `docs/DESIGN_SYSTEM_REVIEW_GATES.md`

#### Web

- [x] Detailed web review backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Phone/tablet screenshot review plus reduced-motion and max-font-scale premium-surface review are documented in `docs/DESIGN_SYSTEM_REVIEW_GATES.md`

### Performance Tests

#### Web

- [x] Detailed web performance-testing backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Frame-rate, memory, and long-list benchmark release gates are documented in `docs/DESIGN_SYSTEM_VERIFICATION_STRATEGY.md`

### i18n Tests

#### Common

- [x] String-coverage and RTL-snapshot expectations are documented in `docs/DESIGN_SYSTEM_VERIFICATION_STRATEGY.md` and supported by the generated checklist/catalog plus locale proof surfaces
- [x] Locale format tests: `Intl` output for key locales (en-US, de-DE, ar-SA, ja-JP)

#### Web

- [x] Detailed web i18n-testing backlog for this subsection is tracked in `docs/UI_Library_Web_Backlog.md`

#### Mobile (React Native)

- [x] Pseudo-localization in example app
- [x] Device-locale switch verification and German + max-font-scale stress review are documented in `docs/DESIGN_SYSTEM_VERIFICATION_STRATEGY.md`
