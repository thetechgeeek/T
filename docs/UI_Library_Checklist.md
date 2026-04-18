# UI Library Checklist

> Cross-platform enterprise UI library covering **Web (React)** and **Mobile (React Native)**.
> This checklist tracks only guarantees the design system can prove in isolation.
> Host-app responsibilities such as auth/session, permissions, onboarding, sync, routing, and delivery live in `docs/UI_Integration_Checklist.md`.
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
5. Next: complete variant and state coverage for the baseline components already in the library
6. Next: expand reusable enterprise compositions for dense data, advanced overlays, and workflow-heavy screens
7. Next: harden the cross-cutting guarantees: accessibility, localization, adaptive behavior, graceful degradation, and performance contracts
8. Next: complete library documentation, governance, and automated verification

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
- [x] Every new component/pattern is reviewed against hierarchy, spacing rhythm, accent budget, surface calm, and fallback quality
- [x] Every new component/pattern is reviewed with realistic content: long names, ugly data, missing media, empty values, and translated copy
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

- [ ] CSS Custom Properties re-assignment for theme switching (no page reload)
- [ ] Nested theme scoping (a card can have a different theme than the page via CSS cascade)
- [ ] `prefers-color-scheme` media query detection
- [ ] `prefers-contrast` media query detection

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

- [ ] `font-display: swap` on all font faces
- [ ] Font preload directives (`<link rel="preload">`)
- [ ] `woff2` format for all custom fonts
- [ ] Line length (measure) max `75ch` enforced for body text
- [ ] Heading hierarchy (h1–h6) is semantic HTML, styled with classes

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

- [ ] Mobile grid (4 columns, 16px gutter, 16px margin)
- [ ] Tablet grid (8 columns, 24px gutter, 24px margin)
- [ ] Desktop grid (12 columns, 24px gutter, 32px margin)
- [ ] Wide grid (12 columns, 32px gutter, max-width 1440px)
- [ ] CSS Grid and Flexbox layout utilities

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

- [ ] All z-index values in a single constants file (no magic numbers)
- [ ] CSS `box-shadow` tokens per elevation level

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

- [ ] SVG component delivery (no icon fonts)
- [ ] Decorative icons use `aria-hidden="true"`
- [ ] Meaningful icons have `aria-label` or visually hidden label
- [ ] Tree-shaken icon imports (never bundle entire icon library)

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

- [ ] Polymorphic `as` prop / `asChild` to change underlying HTML element
- [ ] `className` / `style` prop passthrough on all components (escape hatch)
- [ ] `data-testid` prop support on all components
- [ ] Ref forwarded to root DOM node

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

- [ ] Correct ARIA roles, states (`aria-expanded`, `aria-selected`, `aria-busy`), and properties
- [ ] Focus indicator: 3:1 contrast (WCAG 2.4.11) via `:focus-visible`
- [ ] `data-testid` attributes for test targeting
- [ ] `aria-live` regions for dynamic content announcements

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

- [ ] High Contrast Mode (Windows/macOS) tested and functional
- [ ] `prefers-reduced-motion` respected via CSS media query

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

- [ ] Visual regression snapshot: all states × all themes (Chromatic / Percy)
- [ ] Accessibility audit: `axe-core` / `jest-axe` — zero violations per build
- [ ] Storybook `play()` interaction tests

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

- [ ] Storybook story for each variant/state
- [ ] Accessibility notes (keyboard map, ARIA decisions)

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

- [ ] Select: virtualized option list (for >500 options via DOM windowing)
- [ ] Checkbox / Radio: group wrapped in `fieldset` + `legend`
- [ ] Date Picker: keyboard navigation within calendar grid (arrow keys, page up/down)
- [ ] Token / Pill Input: paste-to-split (comma/newline), drag-to-reorder (HTML5 DnD)
- [ ] File Upload: keyboard-accessible drag fallback
- [ ] Slider: keyboard arrow key support (native `<input type="range">`)
- [ ] Rich Text Editor
    - [ ] WYSIWYG mode
    - [ ] Markdown mode
    - [ ] Controlled (serializable state)
    - [ ] Mention (@user)
    - [ ] Link insertion / unfurling
    - [ ] Accessible toolbar
- [ ] Signature / Freehand Input (canvas-based)

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

- [ ] Icon-only buttons have `aria-label`
- [ ] Floating Action Button (FAB)
- [ ] Menu Button (trigger + dropdown menu)
- [ ] Link (`<a>`, distinct from `<button>` — navigates, not activates)
- [ ] Dropdown Menu (standalone composable)
    - [ ] Nested sub-menus
    - [ ] Keyboard arrow navigation
    - [ ] Dividers and group labels
    - [ ] Disabled items with tooltip

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

- [ ] Toast: `aria-live="polite"` (info/success) / `aria-live="assertive"` (error)
- [ ] Toast: pause-on-hover auto-dismiss
- [ ] Banner: `role="alert"` for errors
- [ ] Skeleton shimmer: disabled under `@media (prefers-reduced-motion: reduce)`

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

- [ ] Navbar / Topbar
    - [ ] Skip-navigation link (first DOM element, visible on focus)
    - [ ] Responsive collapse to hamburger
- [ ] Sidebar / Left Navigation
    - [ ] Collapsible (icon-only mode)
    - [ ] Nested categories
    - [ ] Active route highlight
    - [ ] With badge/count on nav item
- [ ] Tabs: vertical, overflow (scrollable tabs)
- [ ] Breadcrumbs
    - [ ] With ellipsis truncation for deep hierarchies
    - [ ] `aria-current="page"` on last item
- [ ] Pagination
    - [ ] Standard page controls
    - [ ] Items-per-page selector
    - [ ] Jump-to-page input
- [ ] Infinite Scroll
    - [ ] Intersection Observer trigger
    - [ ] "Load More" fallback button
    - [ ] Loading indicator between batches
- [ ] Tree View
    - [ ] Expand / Collapse
    - [ ] Lazy-load children on expand
    - [ ] Selectable / multi-select nodes
- [ ] Mega Menu
- [ ] Command Palette (`Cmd+K`)
    - [ ] Fuzzy search
    - [ ] Recent searches
    - [ ] Grouped results (Pages, Actions, Users, etc.)
- [ ] Accordion / Collapsible
    - [ ] Single / multi expand mode
    - [ ] Default expanded state
    - [ ] Keyboard: Enter/Space to toggle, arrow keys between headers

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

- [ ] Data Grid / Advanced Table
    - [ ] Row + column virtualization
    - [ ] Column resizing / reordering / show-hide / pinning
    - [ ] Single + multi-column sort (client + server-side)
    - [ ] Row selection (single, multi, select-all-page, select-all-cross-page)
    - [ ] Indeterminate checkbox for partial selection
    - [ ] Inline column filters (text, number range, date range, enum multi-select)
    - [ ] Master-detail / row expansion
    - [ ] Custom cell renderers (sparklines, status pills, avatar groups)
    - [ ] Row hover actions / right-click context menu
    - [ ] Inline cell editing with dirty-cell indicator
    - [ ] Grouped rows with aggregations (sum, avg, count)
    - [ ] Density toggle (comfortable, compact, spacious)
    - [ ] Export (CSV, Excel, JSON)
    - [ ] Persistent column state per user
    - [ ] Keyboard: arrow keys for cells, Enter to activate, F2 to edit
    - [ ] Accessible grid semantics (role="grid", columnheader, gridcell)
- [ ] Sortable List (drag-to-reorder via HTML5 DnD / library)
    - [ ] Drag handle / drop placeholder
    - [ ] Keyboard reorder (Space to lift, arrows to move)
- [ ] Tree Table (hierarchical rows in a grid)
- [ ] Code Block
    - [ ] Syntax highlighting
    - [ ] Line numbers
    - [ ] Copy-to-clipboard
    - [ ] Jump-to-line
    - [ ] Virtual scroll for large content
- [ ] Log Viewer
    - [ ] Virtual scroll (100k+ lines)
    - [ ] ANSI color code support
    - [ ] Line numbers
    - [ ] Search / filter within log
- [ ] Charts: responsive SVG + CSS, keyboard-navigable data points
- [ ] Avatar Group: tooltip listing hidden members on hover
- [ ] Diff / Change View
    - [ ] Side-by-side / inline mode
    - [ ] Character-level diff highlighting
    - [ ] Collapsible unchanged sections
- [ ] Kanban Board
    - [ ] Drag-and-drop within / across columns (HTML5 DnD)
    - [ ] Keyboard drag support
    - [ ] Column WIP limits
- [ ] Image / Media Viewer
    - [ ] Lightbox overlay
    - [ ] Scroll-to-zoom
    - [ ] Gallery navigation (prev/next, keyboard arrows, Escape to close)
    - [ ] Loading placeholder

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

- [ ] Overlays create depth through surface contrast, spacing, and focus management before relying on shadow
- [ ] Dialogs, drawers, and sheets define one dominant action and quiet secondary actions
- [ ] Overlay layouts support relaxed and dense content compositions without losing hierarchy
- [x] Modal / Dialog
    - [x] Focus trap / accessibility focus
    - [ ] Dismiss on Escape / back gesture
    - [x] Focus restore to trigger on close
    - [x] Small / Medium / Large size variants
    - [x] Confirmation dialog variant (with Danger button)
    - [ ] Stacking limited to 2 deep
- [x] Tooltip
    - [x] Max-width enforced
    - [x] Never contains interactive elements
- [x] Popover
    - [x] With interactive content (forms, links)
    - [ ] Dismisses on Escape / back + outside tap
    - [x] Focus moves inside on open
- [x] Confirmation Dialog
    - [x] Standard (cancel + confirm)
    - [x] Hard confirmation (type entity name)

#### Web

- [ ] Modal: scroll-lock on body; scrollable content within modal; fullscreen variant
- [ ] Drawer / Slide-over / Sheet
    - [ ] Left / Right slide
    - [ ] Bottom sheet (mobile viewport)
    - [ ] Small / Medium / Large / Fullscreen
    - [ ] Persistent docked variant
    - [ ] Focus trap + Escape to close
- [ ] Tooltip: appears on hover AND focus; show delay 300ms; auto-repositions to avoid viewport clipping
- [ ] Popover: auto-repositions to avoid viewport clipping
- [ ] Context Menu (right-click)
    - [ ] Keyboard trigger (Shift+F10 / Menu key)
    - [ ] Touch long-press equivalent

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
> Host-app orchestration rows live in `docs/UI_Integration_Checklist.md`.

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

- [ ] Minimum: WCAG 2.2 Level AA
- [ ] Target: WCAG 2.2 Level AAA for critical flows (auth, account settings, checkout)
- [ ] Legal compliance documented (Section 508, EN 301 549, AODA as applicable)
- [ ] Premium/branded surfaces have no accessibility exemptions for contrast, focus, motion, or readability

### Semantic Structure

#### Web

- [ ] Native HTML elements used: `<button>`, `<a>`, `<input>`, `<table>`
- [ ] No `<div>` + `onClick` + `role` recreation of native elements
- [ ] All form elements have programmatic `<label>` (never placeholder-only)
- [ ] Single `<h1>` per page; heading levels never skip
- [ ] Landmark regions (`<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`)

#### Mobile (React Native)

- [ ] All interactive elements use `Pressable` / `TouchableOpacity` (never `View` + `onPress` without accessibility)
- [ ] `accessibilityRole` set correctly (button, link, header, image, search, tab, etc.)
- [ ] `accessibilityLabel` on all non-text interactive elements
- [ ] Heading hierarchy via `accessibilityRole="header"` on section titles

### ARIA / Accessibility API Usage

#### Web

- [ ] Priority: native HTML → ARIA role → ARIA state/property → `aria-live`
- [ ] ARIA used only when HTML semantics are insufficient
- [ ] `aria-live` regions for dynamic content announcements

#### Mobile (React Native)

- [ ] `accessibilityState` for dynamic states (selected, expanded, disabled, busy, checked)
- [ ] `accessibilityValue` for sliders, progress indicators (min, max, now, text)
- [ ] `accessibilityHint` for non-obvious actions ("Double tap to open settings")
- [ ] `accessibilityLiveRegion="polite"` / `"assertive"` (Android) for dynamic announcements
- [ ] `AccessibilityInfo.announceForAccessibility()` for programmatic announcements (iOS + Android)

### Keyboard Navigation Map

#### Web

- [ ] Button / Link: `Enter` / `Space` to activate
- [ ] Dropdown / Select: `Enter` to open, arrows to navigate, `Enter` to select, `Escape` to close
- [ ] Modal / Dialog: `Tab` cycles focus, `Escape` closes, focus trapped
- [ ] Tab List: `Arrow Left/Right` to switch, `Home`/`End` for first/last
- [ ] Tree View: `Arrow Right` expand, `Arrow Left` collapse, `Enter`/`Space` select
- [ ] Data Grid: arrow keys for cells, `Enter` to activate, `F2` to edit
- [ ] Menu: `Arrow Down/Up` to navigate, `Escape` to close
- [ ] Context Menu: `Shift+F10` / `Menu` key to open
- [ ] Drag and Drop: `Space` to lift, arrows to move, `Space` to drop, `Escape` to cancel
- [ ] Combobox: `Arrow Down` opens, arrows navigate, `Enter` selects, `Escape` closes

#### Mobile (React Native)

- [ ] External keyboard navigation on tablets (Tab, Enter, arrow keys)
- [ ] `accessibilityActions` + `onAccessibilityAction` for custom screen reader gestures
- [ ] VoiceOver: swipe left/right to navigate, double-tap to activate, magic tap for primary action
- [ ] TalkBack: swipe left/right to navigate, double-tap to activate

### Focus Management

#### Common

- [ ] Focus restoration on overlay close (returns to trigger element)
- [ ] Logical focus order (no manual tabindex > 0 or equivalent)

#### Web

- [ ] Focus on route change: moves to `<h1>` or skip-target
- [ ] `:focus-visible` used (mouse users don't see ring, keyboard users do)
- [ ] Focus ring: 3:1 contrast against adjacent colors (WCAG 2.4.11)
- [ ] Skip-navigation link as first focusable element

#### Mobile (React Native)

- [ ] VoiceOver/TalkBack focus set to screen title on navigation
- [ ] `AccessibilityInfo.setAccessibilityFocus(ref)` for programmatic focus
- [ ] Focus order follows visual layout (use `accessibilityViewIsModal` for modals)
- [ ] `accessibilityElementsHidden` (iOS) / `importantForAccessibility="no-hide-descendants"` (Android) for content behind modals

### Color & Visual Accessibility

#### Common

- [ ] Text contrast: 4.5:1 (normal text), 3:1 (large text ≥ 18pt / 14pt bold)
- [ ] UI component contrast: 3:1 (WCAG 1.4.11)
- [ ] Color never sole differentiator of state
- [ ] Soft/pastel themes include high-contrast ink anchors for primary actions and critical states
- [ ] Charts use label, shape, pattern, and stroke differentiation in addition to color

#### Web

- [ ] High Contrast Mode (Windows) tested on all components
- [ ] `prefers-contrast: more` media query respected

#### Mobile (React Native)

- [x] iOS Bold Text preference respected (`AccessibilityInfo.isBoldTextEnabled`)
- [ ] Android high-contrast text setting respected
- [ ] System font size scaling tested at maximum scale

### Screen Reader Testing Matrix

#### Web

- [ ] NVDA + Chrome/Firefox (Windows)
- [ ] JAWS + Chrome/Edge (Windows)
- [ ] VoiceOver + Safari (macOS)

#### Mobile (React Native)

- [ ] VoiceOver + Safari (iOS — on physical device)
- [ ] TalkBack + Chrome (Android — on physical device)

### Reduced Motion

#### Common

- [ ] Never rely on animation alone to communicate state change

#### Web

- [ ] All animations wrapped in `@media (prefers-reduced-motion: reduce)`
- [ ] Skeleton loaders: static gray (no shimmer) under reduced motion
- [ ] Transitions: instant or < 100ms under reduced motion
- [ ] Auto-playing carousels / marquees: paused

#### Mobile (React Native)

- [x] `AccessibilityInfo.isReduceMotionEnabled()` checked before animations
- [x] `Animated` / `Reanimated` animations disabled or instant under reduced motion
- [x] `LayoutAnimation` disabled under reduced motion
- [x] Skeleton loaders: static under reduced motion

### Forms Accessibility

#### Common

- [ ] Every input has an associated label (programmatic, not placeholder-only)
- [ ] Required fields indicated visually + programmatically
- [ ] Error messages associated with field and announced to screen readers

#### Web

- [ ] `<label>` with `for` attribute or `aria-label`
- [ ] Errors linked via `aria-describedby`, announced via `aria-live="polite"`
- [ ] `aria-required="true"` on required fields
- [ ] No CAPTCHA without audio/accessible alternative

#### Mobile (React Native)

- [ ] `accessibilityLabel` on all inputs (since no HTML `<label>`)
- [ ] Error announced via `AccessibilityInfo.announceForAccessibility()`
- [ ] Required field indicated via `accessibilityHint` ("required")

### Zoom & Magnification

#### Web

- [ ] All pages tested at 200% browser zoom (WCAG 1.4.4) — no clipping
- [ ] All pages tested at 400% zoom — content reflows to single column
- [ ] Hero/display typography and featured cards reflow gracefully without losing hierarchy at max zoom

#### Mobile (React Native)

- [ ] System font scale tested at maximum (iOS: ~300%, Android: ~200%)
- [ ] `maxFontSizeMultiplier` set on layout-critical text
- [ ] Layouts tested at largest accessibility text size without content clipping
- [ ] Hero/display typography and featured cards reflow gracefully without losing hierarchy at max font scale

---

## 6. Internationalization (i18n) & Localization (L10n)

### String Externalization

#### Common

- [ ] Zero hardcoded strings in component code — every visible string is a translation key
- [ ] Namespaced key hierarchy: `module.component.context`
- [ ] ICU Message Format for pluralization, gender, and variable interpolation
- [ ] No string concatenation in UI layer
- [ ] No implicit word order assumptions

#### Web

- [ ] i18n library integrated (react-intl, i18next, or equivalent)

#### Mobile (React Native)

- [ ] i18n library integrated (i18next + react-i18next, expo-localization, or equivalent)
- [ ] Device locale detection (`expo-localization` / `react-native-localize`)
- [x] Language change without app restart

### RTL (Right-to-Left) Layout Support

#### Common

- [ ] Directional icons (arrows, chevrons) mirrored in RTL
- [ ] RTL visual regression tests in CI pipeline

#### Web

- [ ] Logical CSS properties used (`margin-inline-start`, not `margin-left`)
- [ ] `dir="rtl"` on `<html>` flips layouts with no component code change
- [ ] Text truncation at logical end

#### Mobile (React Native)

- [ ] `I18nManager.forceRTL(true)` / `I18nManager.allowRTL(true)` configured
- [ ] `writingDirection: 'rtl'` on text styles
- [x] Flexbox `direction` property for layout mirroring
- [x] `I18nManager.isRTL` for conditional directional logic
- [ ] App restart handling after RTL toggle (or hot-reload if supported)

### Locale-Aware Formatting

#### Common

- [x] Numbers: `Intl.NumberFormat` (decimal separator, thousands grouping)
- [x] Currency: `Intl.NumberFormat` with `style: 'currency'`
- [x] Dates & Times: `Intl.DateTimeFormat` + `Intl.RelativeTimeFormat` (timezone-aware)
- [x] Lists: `Intl.ListFormat`
- [x] Sorting / Collation: `Intl.Collator`
- [x] Pluralization: ICU Plural Rules

#### Mobile (React Native)

- [ ] Hermes `Intl` polyfill enabled (Hermes has limited Intl by default)
- [ ] Timezone handling: device timezone via `expo-localization` or `react-native-localize`

### Text Expansion & Layout

#### Common

- [ ] UI accommodates text expansion up to 40% (German, Finnish)
- [ ] No fixed-width containers for text labels (wrapping allowed)
- [ ] Truncation with tooltip/hint fallback for space-constrained labels
- [ ] All locales tested in visual regression (minimum: en-US, de-DE, ar-SA, ja-JP)
- [ ] Hero headings, pill controls, chips, and metric labels wrap/scale gracefully under long locales
- [ ] Dense table/card layouts preserve hierarchy when translated labels grow

### Character Set & Encoding

#### Common

- [ ] UTF-8 encoding end-to-end
- [ ] Support for non-Latin scripts: CJK, Arabic, Hebrew, Devanagari
- [ ] Font stacks include system fallbacks for scripts not covered by brand font
- [ ] Correct line-breaking rules per script

---

## 7. Performance UX

### Perceived Performance Patterns

#### Common

- [ ] Skeleton loaders: shapes match loaded content (eliminate layout shift)
- [ ] Optimistic UI: update immediately for high-success-rate actions
- [ ] Stale-while-revalidate: show cached data immediately, refresh in background
- [ ] Progressive loading: critical content first, secondary lazy-loaded
- [ ] First meaningful hierarchy (screen title, primary CTA, key metric or key task input) appears before decorative enhancements
- [ ] Hero media, illustrations, and brand motion never block core task readiness

#### Web

- [ ] Virtualization for any list/grid/tree > 200 items (DOM windowing)
- [ ] Above-the-fold priority: hero, CTAs, nav never depend on lazy-loaded resources
- [ ] `<Suspense>` boundaries for deferred widgets

#### Mobile (React Native)

- [ ] `FlatList` / `FlashList` for all scrollable lists (never `ScrollView` with many children)
- [ ] `InteractionManager.runAfterInteractions()` for deferred work after navigation
- [ ] Placeholder / shimmer components while screens mount
- [ ] Preload next screen data during current screen interaction

### Asset Optimization

#### Web

- [ ] Images: `webp`/`avif` format, responsive `srcset`, `loading="lazy"` below fold
- [ ] Images: explicit `width`/`height` to reserve space (eliminates CLS)
- [ ] Icons: SVG sprite or tree-shaken imports
- [ ] Fonts: `font-display: swap`, preload critical, `woff2` format
- [ ] CSS: critical inline, rest deferred, tokens as CSS Custom Properties

#### Mobile (React Native)

- [ ] Images: `react-native-fast-image` for caching + priority loading
- [ ] Images: progressive loading (low-res placeholder → full resolution)
- [ ] Icons: tree-shaken SVG components or selective vector icon imports

### Interaction Responsiveness

#### Common

- [ ] Search inputs: 300ms debounce
- [ ] ≤ 100ms: no indicator; 100–1000ms: loading indicator; > 1000ms: progress with estimate

#### Web

- [ ] Event handlers non-blocking; computation > 50ms offloaded (Web Worker / `scheduler.yield()`)
- [ ] Scroll handlers: 16ms (1 frame) throttle
- [ ] Resize observers: debounced
- [ ] Input lag: validation within one animation frame (16ms)

#### Mobile (React Native)

- [ ] Heavy computation offloaded from JS thread (native module or web worker via JSI)
- [ ] Gesture handler animations on UI thread (Reanimated `useAnimatedGestureHandler`)
- [ ] List scroll performance: `removeClippedSubviews`, proper `keyExtractor`

### Bundle Performance

#### Common

- [ ] Component library is tree-shakeable (ESM exports, no side effects)
- [ ] Per-component bundle size limits enforced
- [ ] No circular dependencies between component packages
- [ ] Base component usability does not depend on optional illustration, chart, or animation packages

#### Web

- [ ] CSS co-located and tree-shaken with components (no monolithic stylesheet)

#### Mobile (React Native)

- [ ] Native dependency count minimized (each adds binary size)

---

## 8. Responsive & Adaptive Design

### Breakpoints & Responsive Strategy

#### Web

- [ ] xs: < 480px / sm: 480–767px / md: 768–1023px / lg: 1024–1279px / xl: 1280–1535px / 2xl: ≥ 1536px
- [ ] Mobile-first (min-width) media queries throughout
- [ ] Container Queries (`@container`) for component-level responsiveness

#### Mobile (React Native)

- [ ] `useWindowDimensions` / `Dimensions` API for responsive layouts
- [ ] Device type detection (phone vs. tablet) for layout switching
- [ ] `Platform.select()` / `Platform.OS` for platform-specific values
- [ ] Responsive hook/utility that maps dimensions to breakpoint tokens

### Adaptive Component Variants

#### Web

- [ ] Navigation: sidebar (desktop) → hamburger drawer (mobile viewport)
- [ ] Data Grid: full grid → stacked card per row (mobile viewport)
- [ ] Modal: centered dialog → full-screen bottom sheet (mobile viewport)
- [ ] Filters: sidebar facets → bottom sheet panel (mobile viewport)
- [ ] Form layout: multi-column → single-column stacked (mobile viewport)
- [ ] Breadcrumbs: full path → collapsed to parent only (mobile viewport)
- [ ] Tabs: horizontal scrollable → dropdown selector (mobile viewport)
- [ ] Charts: full labels → simplified / abbreviated (mobile viewport)
- [ ] FAB: visible on mobile viewport, hidden when toolbar visible (desktop)
- [ ] Hero/featured card layouts collapse to dense task-first layouts on smaller viewports

#### Mobile (React Native)

- [ ] Phone components collapse to single-column, touch-first layouts without losing hierarchy
- [ ] Tablet components expand to multi-column or split-pane layouts when the pattern benefits from extra space

### Touch & Pointer

#### Common

- [ ] Minimum touch target 44×44px on all interactive elements

#### Web

- [ ] Hover-only affordances have touch equivalents (tap-to-reveal, long-press)
- [ ] Swipe gestures for drawers / bottom sheets
- [ ] No hover-only tooltips on touch devices

#### Mobile (React Native)

- [ ] `hitSlop` on small interactive elements to expand touch target
- [ ] Gesture-driven interactions (`react-native-gesture-handler`)
    - [ ] Swipe to delete / archive
    - [ ] Swipe to navigate back (iOS)
    - [ ] Pinch to zoom
    - [ ] Long press for context actions
- [ ] Haptic feedback on key interactions (toggle, delete confirm, success)
- [ ] `activeOpacity` / `android_ripple` visual press feedback on all Pressables

### Typography & Spacing

#### Web

- [ ] Fluid typography using CSS `clamp()` between breakpoints
- [ ] Fluid spacing using CSS `clamp()` between breakpoints
- [ ] Font sizes never clip or overflow container at any breakpoint
- [ ] Whitespace scales intentionally; small screens avoid dead zones while preserving hierarchy

#### Mobile (React Native)

- [ ] Responsive font sizes via scale factor utility (based on screen width)
- [ ] Font sizes respect system accessibility scaling (`allowFontScaling`)
- [ ] Spacing scales appropriately between phone and tablet layouts
- [ ] Card padding, hero spacing, and CTA hierarchy adapt between phone and tablet without bloating or crowding

### Print

#### Web

- [ ] `@media print` stylesheet defined
- [ ] Navigation and sidebars hidden in print
- [ ] Interactive elements hidden or replaced with text in print
- [ ] Page break control (`break-before`, `break-after`)
- [ ] Readable in monochrome

### Orientation

#### Common

- [ ] No content loss on orientation change

#### Web

- [ ] Landscape and portrait layouts tested for all pages
- [ ] Orientation-specific adjustments where needed

#### Mobile (React Native)

- [ ] `Dimensions` event listener for orientation changes
- [ ] Layout transitions animated on rotation
- [ ] Safe area insets recalculated on orientation change

### Platform-Specific Adaptive Patterns

#### Mobile (React Native)

- [ ] Large screen optimization guidelines (min touch target, readable line lengths, no stretched layouts)

---

## 9. Motion & Animation System

### Principles

#### Common

- [ ] Every animation communicates something (state change, hierarchy, direction) — no decorative-only motion
- [ ] All animations are interruptible (cancellable if user triggers counter-action)
- [ ] Motion is subtle and structural, never ambient clutter on primary work surfaces
- [ ] Motion reinforces focus, hierarchy, and spatial continuity between related states

#### Web

- [ ] Only animate `transform` and `opacity` (GPU compositing) — never `width`, `height`, `top`, `left`, `margin`

#### Mobile (React Native)

- [ ] Animations run on UI thread via Reanimated `useSharedValue` / `useAnimatedStyle` — never block JS thread
- [ ] Use `nativeDriver: true` for `Animated` API (only `transform`, `opacity`)

### Duration Scale

#### Common

- [ ] Instant: 0ms (state changes — no motion)
- [ ] Micro: 100ms (hover/press effects, focus rings)
- [ ] Fast: 200ms (tooltip, dropdown open)
- [ ] Normal: 300ms (modal enter, drawer slide, page transition)
- [ ] Slow: 500ms (complex layout transitions) — never > 500ms for user-triggered actions

### Easing Curves

#### Common

- [ ] Ease Out (default entry): `cubic-bezier(0.0, 0.0, 0.2, 1)` — element entering
- [ ] Ease In (exit): `cubic-bezier(0.4, 0.0, 1, 1)` — element leaving
- [ ] Ease In-Out (repositioning): `cubic-bezier(0.4, 0.0, 0.2, 1)` — element moving within viewport
- [ ] Spring (interactive): spring physics for drag, swipe, bouncy feedback

#### Mobile (React Native)

- [ ] Reanimated spring configs: `damping`, `stiffness`, `mass` presets for consistent feel
- [ ] `Easing` module mappings for `Animated` API

### Animation Patterns

#### Web

- [ ] Fade In/Out: `opacity 0→1`, Ease Out, 200ms
- [ ] Scale Entrance: `scale(0.95)→1` + fade, 200ms
- [ ] Slide Entrance: `translateX(100%)→0` for drawers, 300ms
- [ ] Height Expand: `grid-template-rows: 0→1fr` for accordion
- [ ] Skeleton Shimmer: `background-position` animated
- [ ] Spinner: CSS `@keyframes`, `aria-label`, `role="status"`
- [ ] Page Transition: fade-through or shared-element, 300ms
- [ ] Toast Entry: slide in + fade; auto-dismiss with progress underline
- [ ] Shared-element or hero transitions used only when they improve orientation and do not delay work
- [ ] No infinite decorative motion on operational surfaces

#### Mobile (React Native)

- [ ] Fade In/Out: `opacity` shared value, `withTiming(200)`, Ease Out
- [ ] Scale Entrance: `scale(0.95)→1` + `opacity`, `withSpring()`
- [ ] Slide Entrance: `translateX` for screen push, native stack default
- [x] Height Expand: `LayoutAnimation.configureNext()` or Reanimated layout animations
- [ ] Skeleton Shimmer: MaskedView + Animated gradient
- [ ] Spinner: native `ActivityIndicator` or Lottie animation
- [ ] Shared-element transition: `react-navigation-shared-element` or custom Reanimated
- [ ] Bottom sheet snap: spring-driven with velocity-based gesture release
- [ ] List item entry: `entering`/`exiting` layout animations (Reanimated)
- [ ] Haptic feedback paired with animation completion (toggle, delete, success)
- [ ] Shared-element or branded transitions reserved for onboarding, browsing, or detail flows with clear context value
- [ ] Continuous background motion disabled on work surfaces

### Reduced Motion Contract

#### Common

- [ ] State changes still happen — only motion is removed, never functionality

#### Web

- [ ] `@media (prefers-reduced-motion: reduce)` applied globally
- [ ] All `animation-duration` and `transition-duration` → 0.01ms under reduced motion

#### Mobile (React Native)

- [x] `AccessibilityInfo.isReduceMotionEnabled()` listener registered at app root
- [x] All Reanimated / Animated animations conditional on reduced-motion flag
- [x] `LayoutAnimation` skipped under reduced motion
- [x] Provide `useReducedMotion()` hook for component-level opt-out

---

## 10. Copy & Microcopy Standards

### Voice & Tone Framework

#### Common

- [ ] Tone guidelines documented per context (empty, error, destructive, success, loading, permission denial)
- [ ] Voice is consistent: helpful, direct, never blaming, never over-celebratory
- [ ] Premium tone is restrained, confident, and useful — never hype-heavy, cutesy, or vague
- [ ] Microcopy supports a calm interface by reducing noise, repetition, and unnecessary labels

### Button & CTA Labels

#### Common

- [ ] All buttons are verb-led ("Save Changes", "Delete Project", not "OK" or "Submit")
- [ ] Primary CTA in dialog matches dialog title action (no "Yes" / "Confirm")
- [ ] Cancel is always "Cancel" (never "Go Back", "Close", "No")
- [ ] Danger buttons use explicit destructive verbs ("Delete", "Remove", "Revoke")
- [ ] Loading button labels reflect action in progress ("Saving…", "Deleting…")
- [ ] Only the highest-priority action gets high-emphasis wording and styling within a surface

### Error Messages

#### Common

- [ ] Lead with what happened, then what to do
- [ ] No technical error codes shown to users (log internally; user-friendly message + reference code)
- [ ] Field errors state exactly what is wrong AND what format is expected
- [ ] No generic "Invalid input" — always specific
- [ ] Error messages do not blame the user

### Empty & Loading States

#### Common

- [ ] Empty states are helpful and constructive, not apologetic
- [ ] Empty state includes a clear, single CTA
- [ ] Loading labels are action-framed ("Loading your data…" not "Please wait…")
- [ ] Skeleton text length approximates actual content length
- [ ] Empty states explain the situation clearly even when illustration/art is removed

### Confirmation & Destructive Actions

#### Common

- [ ] Destructive action dialogs state exactly what will happen
- [ ] No euphemisms ("Delete" not "Remove this item")
- [ ] Hard-delete confirmations include the entity name in the message body

### Feedback & Status Copy

#### Common

- [ ] Success messages are brief, not over-celebratory
- [ ] Toasts state what happened in past tense ("Project deleted")
- [ ] Relative timestamps ("3 hours ago") always have absolute datetime accessible (tooltip or detail)
- [ ] "—" for missing numeric/optional values (consistent, not mixed with "N/A", "None", "null")

### Terminology Consistency

#### Common

- [ ] Consistent capitalization rules
- [ ] Plural/singular rules consistent in all labels
- [ ] Abbreviations defined and used consistently

### Permissions & Access Copy

#### Common

- [ ] Permission-denied messages are non-blaming and path-forward-focused
- [ ] Always include what the user can do to get access ("Contact your Admin")
- [ ] Disabled field tooltip/hint explains why, not just that it's disabled

### Numbers & Data

#### Common

- [ ] Large numbers use locale-aware separators
- [ ] Consistent decimal places within a single context
- [ ] Percentages consistently formatted
- [ ] Currency always displays symbol and amount together
- [ ] "0" vs "None" vs "—" defined per context and consistent
- [ ] KPI copy pairs dominant values with timeframe/comparison context

### Truncation Rules

#### Common

- [ ] Long text: truncated with `…` + tooltip/hint showing full text
- [ ] Labels: never truncate action labels (buttons, CTAs); wrap or abbreviate
- [ ] User names: truncated after first name if space-constrained, full name accessible
- [ ] Hero headings, tabs, chips, and metric labels have explicit wrapping/overflow rules

#### Web

- [ ] Breadcrumbs: collapse middle items with `…` dropdown
- [ ] Table cells: truncated with tooltip; full content in row expansion / detail view

#### Mobile (React Native)

- [ ] `numberOfLines` + `ellipsizeMode` on `<Text>` for truncation
- [ ] Long-press to show full text (or navigate to detail)

### Accessibility Copy

#### Common

- [ ] Icon-only actions always have descriptive label (not just the icon name)
- [ ] Live announcements are concise and action-framed

#### Web

- [ ] `aria-label` phrasing conventions documented (dismiss = "Dismiss notification" not "X")
- [ ] Screen reader announcement copy patterns defined

#### Mobile (React Native)

- [ ] `accessibilityLabel` phrasing conventions documented
- [ ] `accessibilityHint` for non-obvious gestures ("Swipe left to delete")

---

## 11. Design System Governance

### Versioning & Release Process

#### Common

- [ ] Semantic Versioning (MAJOR.MINOR.PATCH)
- [ ] PATCH: bug fixes, a11y fixes, no API change
- [ ] MINOR: new components, backward-compatible additions
- [ ] MAJOR: breaking changes to component APIs or token contracts
- [ ] Changelog auto-generated from conventional commits
- [ ] Migration guides for every MAJOR version with codemods where possible

### Deprecation Policy

#### Common

- [ ] `@deprecated` JSDoc/TSDoc tag + console warning (dev only) for minimum 2 minor versions
- [ ] Warning links to migration guide and replacement component
- [ ] Deprecated components remain until next major version

### Contribution Model

#### Common

- [ ] Eligibility: component needed in ≥ 3 product surfaces
- [ ] Proposal: RFC via GitHub Discussion, reviewed by DS team + 2 consumer team leads
- [ ] Build vs. Borrow: prefer wrapping headless libraries (Radix, React Aria) over building from scratch
- [ ] Quality gate: full Component Contract Standard (§2) required
- [ ] Every RFC includes enterprise x premium review: hierarchy, accent budget, density, state completeness, and no-media fallback
- [ ] No new visual flourish is added unless backed by reusable tokens, accessibility review, and cross-surface need

#### Mobile (React Native)

- [ ] Cross-platform parity review: new component must ship for both web and native (or explicitly scoped)
- [ ] Platform-specific behavior documented (iOS vs Android differences)

### Living Documentation

#### Common

- [ ] CI integration: documentation builds on every PR
- [ ] Documentation explains when to use relaxed showcase presentation vs dense operational presentation

#### Web

- [ ] Storybook as primary documentation surface
- [ ] Visual regression on every PR (Chromatic or Percy)
- [ ] Design-code sync: Storybook stories linked to Figma frames
- [ ] Storybook Composition: multi-package Storybooks composed

#### Mobile (React Native)

- [x] Example app or Storybook Native as documentation surface
- [ ] Simulator/emulator screenshots captured per PR for visual review
- [ ] Platform-specific behavior documented alongside each component

---

## 12. State Resilience & Graceful Degradation

### Error Boundary Levels

#### Common

- [ ] Component-level boundary (broken widget, siblings unaffected)
- [ ] Section-level boundary (broken panel, rest of page functional)
- [ ] Route/screen-level boundary (broken page/screen, navigation functional)
- [ ] Application-level boundary (last resort, full-screen error with reload + support contact)
- [ ] Partial failure state (some widgets loaded, some failed — clearly differentiated)
- [ ] Failure surfaces preserve composure: clear hierarchy, calm chrome, actionable next step

### Network / API Failures

#### Common

- [ ] Loading (first fetch) → skeleton
- [ ] Loading (refetch) → spinner in header/toolbar
- [ ] Stale data → "Last updated X ago" banner + manual refresh
- [ ] Request timeout → timeout error state + retry
- [ ] Server error 5xx → inline error card + retry
- [ ] Not found 404 → not-found state + navigate back
- [ ] Unauthorized 401 → auth-required state + sign-in CTA
- [ ] Forbidden 403 → access denied state + request access CTA
- [ ] Rate limited 429 → "Too many requests" countdown + auto-retry
- [ ] Offline / degraded state → banner, retry affordance, and preserved layout hierarchy
- [ ] Reconnected state is acknowledged without jarring motion or layout shift

### Component States (All for Every Component)

#### Common

- [ ] Default (nominal)
- [ ] Loading (async in progress)
- [ ] Error (something went wrong)
- [ ] Empty (loaded, but no data)
- [ ] Disabled (not available, reason surfaced)
- [ ] Read-only (viewable, not editable)
- [ ] Denied (no access, reason and path forward surfaced)
- [ ] Partial (some loaded, some failed)
- [ ] Loading, empty, error, read-only, and denied states meet the same visual quality bar as nominal state

### Data Edge Cases

#### Common

- [ ] Zero results — empty state with CTA
- [ ] Single result — no awkward "1 of 1" pagination
- [ ] Very long string — truncated, never breaks layout
- [ ] Null / undefined — consistent placeholder ("—" or "Not set")
- [ ] Large numeric value — locale-formatted, never overflows
- [ ] Large dataset (10k+ rows) — virtualized, keyboard/scroll nav intact
- [ ] Stale / cached data — visually distinguished with timestamp
- [ ] Missing media, avatar, illustration, or sparkline falls back to text-first layout with no broken composition

#### Web

- [ ] Very wide content (100+ columns) — horizontal scroll, pinned columns
- [ ] Deep hierarchy (500+ node tree) — lazy-loaded, collapses correctly

#### Mobile (React Native)

- [ ] Very long lists — `FlatList` / `FlashList` handles gracefully, no memory leak
- [ ] Image loading failure — placeholder shown, retry available

### Optimistic UI Failures

#### Common

- [ ] Rollback to previous state on API failure
- [ ] Error toast shown on rollback with undo action
- [ ] Retry action available from error state

### Long-Running Job Failures

#### Common

- [ ] Job stuck / timeout state with cancel and retry
- [ ] Partial success — detailed failure report
- [ ] Job failure notification with error details

### Conflict Resolution

#### Common

- [ ] Last-write-wins with notification (user informed)
- [ ] Collaborative lock (another user is editing — shown in UI)
- [ ] Merge conflict UI (show both versions, let user choose)
- [ ] Concurrent edit notification

---

## 13. Testing Strategy

### Testing Pyramid

#### Common

- [ ] Static Analysis: TypeScript strict mode, ESLint
- [ ] Unit Tests: component logic, utility functions, token contracts

#### Web

- [ ] Static: Stylelint, Design Token Lint
- [ ] Unit: Vitest / Jest + Testing Library
- [ ] Integration: Testing Library (component composition, page-level)
- [ ] E2E: Playwright

#### Mobile (React Native)

- [ ] Static: React Native-specific ESLint rules
- [ ] Unit: Jest + React Native Testing Library
- [ ] Integration: React Native Testing Library (screen-level)
- [ ] E2E: Detox or Maestro

### Component-Level Tests

#### Common

- [ ] All prop variants render without errors
- [ ] All interactive states tested (press, focus, keyboard)
- [ ] Edge cases: empty props, null data, long strings, 0 / max values
- [ ] Controlled vs. uncontrolled mode behavior
- [ ] No-media / no-icon / no-illustration rendering variants are tested
- [ ] Density, hierarchy, and emphasis variants are tested where supported

#### Web

- [ ] Storybook `play()` interaction tests
- [ ] DOM assertions: aria attributes, focus, `data-state` after interaction

#### Mobile (React Native)

- [ ] Render tests on both iOS and Android
- [ ] Native accessibility properties verified (`accessibilityRole`, `accessibilityState`)
- [ ] Gesture interaction tests (long press, swipe)

### Accessibility Tests

#### Common

- [ ] Manual screen reader testing: quarterly audit across SR test matrix (§5)
- [ ] Keyboard / assistive tech audit: full walkthrough of all primary flows

#### Web

- [ ] Automated (CI): `jest-axe` / `axe-playwright` on every component + route — zero violations gate
- [ ] Color contrast: automated via `axe-core` + manual spot-checks
- [ ] Zoom: 200% and 400% — no clipping or overlapping

#### Mobile (React Native)

- [ ] VoiceOver manual audit (iOS) on physical device — quarterly
- [ ] TalkBack manual audit (Android) on physical device — quarterly
- [ ] Max font scale testing on both platforms
- [ ] Accessibility inspector (Xcode / Android Studio) checks on key screens

### Visual Regression Tests

#### Common

- [ ] Per-component snapshots: all states × all themes
- [ ] RTL snapshot: confirming mirrored layout
- [ ] Baseline: approved screenshots; PRs fail on unexpected diff
- [ ] Ugly-data / missing-media fixtures included in snapshot matrix
- [ ] High-emphasis vs low-emphasis variants included in snapshot matrix

#### Web

- [ ] All viewports: mobile, tablet, desktop
- [ ] Interaction snapshots after Storybook `play()` completes
- [ ] Tools: Chromatic, Percy, or Playwright `toHaveScreenshot()`

#### Mobile (React Native)

- [ ] iOS simulator + Android emulator snapshots per component
- [ ] Both platform screenshots in light + dark mode
- [ ] Device-specific: iPhone SE (small), iPhone Pro Max (large), iPad, Pixel, Samsung Galaxy

### Enterprise x Premium Quality Review

#### Common

- [ ] New components/patterns reviewed for focal hierarchy, primary action clarity, spacing rhythm, and surface calm
- [ ] Accent budget review performed on representative screens/stories
- [ ] Relaxed and dense compositions both reviewed where supported
- [ ] No-media / no-illustration / no-icon / ugly-data fixtures reviewed
- [ ] Loading, empty, error, permission-denied, and read-only variants receive equal visual review, not only default state
- [ ] Realistic enterprise content fixtures used in stories and screenshot tests (long names, nulls, high counts, dense tables)

#### Web

- [ ] Storybook review page shows premium showcase shell and operational dense shell side by side
- [ ] Representative screens reviewed at mobile, tablet, desktop, and wide densities for hierarchy drift

#### Mobile (React Native)

- [ ] Screenshot review covers phone and tablet layouts for both relaxed/brand-forward states and dense operational states
- [ ] Reduced-motion and maximum font-scale screenshot review performed on premium/branded surfaces

### Performance Tests

#### Web

- [ ] Bundle size regression: `size-limit` per component
- [ ] Rendering: React Profiler detects unnecessary re-renders
- [ ] Benchmark: Data Grid + Rich Text Editor with large datasets

#### Mobile (React Native)

- [ ] Frame rate monitoring during scroll / gesture-heavy component interactions (60fps target)
- [ ] Memory profiling: no leaks during repeated mount/unmount cycles
- [ ] `FlatList` benchmark: 10k items, smooth scroll, no blank frames

### i18n Tests

#### Common

- [ ] String coverage: automated check that all strings have translation keys
- [ ] RTL snapshot tests: all pages/screens with RTL applied
- [x] Locale format tests: `Intl` output for key locales (en-US, de-DE, ar-SA, ja-JP)

#### Web

- [ ] Pseudo-localization: padded/accented strings to reveal truncation and overflow

#### Mobile (React Native)

- [x] Pseudo-localization in example app
- [ ] Device locale switch test (change device language, verify app updates)
- [ ] Max font scale + longest locale (German) combined stress test
