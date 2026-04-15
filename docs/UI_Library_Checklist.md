# UI Library Checklist

> Cross-platform enterprise UI library covering **Web (React)** and **Mobile (React Native)**.
> Each `###` section is split into **Common** (shared), **Web**, and **Mobile** buckets.

---

## 1. Design System Architecture

### Design Tokens

#### Common

- [ ] Primitive color tokens (full scale: 50–950 for each palette)
- [x] Semantic color tokens (action, surface, text, border, feedback, overlay)
- [x] Component-scoped tokens (button, badge, input, etc.)
- [x] Dark mode token remapping
- [ ] High Contrast mode token remapping
- [x] Primitive spacing tokens (4px base scale)
- [x] Semantic spacing tokens (component padding, section gap, etc.)
- [x] Density-aware spacing tokens (`space.density.compact`, `space.density.comfortable`, `space.density.spacious`)
- [x] Border radius tokens (none, sm, md, lg, full)
- [x] Border width tokens
- [x] Shadow / elevation tokens (5 levels: flat, raised, overlay, modal, tooltip)
- [ ] Font family tokens (UI font, display/brand font)
- [ ] Font size tokens (type scale: xs → display-2xl)
- [x] Font weight tokens (400, 500, 600, 700)
- [x] Line height tokens (tight, normal, relaxed)
- [x] Letter spacing tokens
- [x] Duration tokens (instant, micro, fast, normal, slow)
- [x] Easing curve tokens (ease-in, ease-out, ease-in-out, spring)
- [x] Per-component motion profiles mapped to duration + easing tokens
- [x] Opacity tokens
- [ ] Token distribution format (W3C Design Tokens JSON / Style Dictionary)
- [ ] Token versioning and changelog (track deprecated, renamed, added tokens per release)

#### Web

- [ ] Z-index constants file (all z-index values centralized)
- [ ] Token transform to CSS Custom Properties
- [ ] Token transform to SCSS variables (if SCSS is used)

#### Mobile (React Native)

- [x] Token transform to JS/TS objects (StyleSheet-compatible values)
- [ ] Token transform to Android XML resources
- [ ] Token transform to iOS Swift asset catalogs
- [ ] `PixelRatio`-aware token scaling for different screen densities

### Theming Engine

#### Common

- [x] Multi-brand / white-label token sets (support N brand themes, not just light/dark)
- [x] Theme persistence (user preference saved to localStorage / backend)
- [x] System preference detection (light/dark scheme)

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

### Design-to-Code Sync

#### Common

- [ ] Figma token export pipeline (Tokens Studio / Style Dictionary / token transformer)
- [ ] Automated token sync from design tool to code repository
- [ ] Figma component annotations linked to implementation docs

#### Web

- [ ] Figma frames linked to Storybook stories (Chromatic / Storybook Figma plugin)
- [ ] Visual diff between Figma design and live web implementation

#### Mobile (React Native)

- [ ] Figma frames linked to native component examples
- [ ] Visual diff between Figma and rendered native components (simulator screenshots)

### Color System

#### Common

- [ ] Neutral palette (50–950)
- [ ] Brand primary palette (50–950)
- [ ] Brand secondary palette (50–950)
- [x] Success semantic palette
- [x] Warning semantic palette
- [x] Error / Danger semantic palette
- [x] Info semantic palette
- [ ] Data visualization qualitative palette (8–12 colors, color-blind safe)
- [ ] Color-blind safe validation (Deuteranopia, Protanopia tested)
- [x] All foreground/background contrast ratios documented and passing WCAG AA
- [ ] Color never sole differentiator of state — always paired with icon, label, or pattern

### Typography System

#### Common

- [ ] Type scale defined (xs, sm, md, lg, xl, display-sm, display-md, display-lg, display-xl, display-2xl)
- [x] Heading styles (semantic hierarchy decoupled from visual size)
- [ ] Body text styles (regular, medium, strong)
- [x] Label / caption styles
- [ ] Code / monospace style
- [ ] Maximum 2 font families per product (UI + optional display/brand)
- [x] Font sizes always reference type-scale tokens (never raw values in component code)
- [ ] Non-Latin script font fallback stack (CJK, Arabic, Devanagari)

#### Web

- [ ] `font-display: swap` on all font faces
- [ ] Font preload directives (`<link rel="preload">`)
- [ ] `woff2` format for all custom fonts
- [ ] Line length (measure) max `75ch` enforced for body text
- [ ] Heading hierarchy (h1–h6) is semantic HTML, styled with classes

#### Mobile (React Native)

- [ ] Custom font loading via `expo-font` or React Native asset linking
- [ ] iOS Dynamic Type support (`UIContentSizeCategory` / `allowFontScaling`)
- [ ] Android font scale support (`PixelRatio.getFontScale()`)
- [ ] `maxFontSizeMultiplier` set on critical fixed-layout text to prevent overflow
- [ ] Font weight mapping to platform-specific font files (iOS vs Android font naming)

### Spacing & Layout Grid

#### Common

- [x] 4px base unit grid
- [ ] Full spacing scale defined (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64)

#### Web

- [ ] Mobile grid (4 columns, 16px gutter, 16px margin)
- [ ] Tablet grid (8 columns, 24px gutter, 24px margin)
- [ ] Desktop grid (12 columns, 24px gutter, 32px margin)
- [ ] Wide grid (12 columns, 32px gutter, max-width 1440px)
- [ ] CSS Grid and Flexbox layout utilities

#### Mobile (React Native)

- [x] Flexbox-only layout system (`StyleSheet.create()`)
- [x] Responsive layout via `useWindowDimensions` / `Dimensions` API
- [ ] `PixelRatio`-aware sizing for different screen densities
- [x] `SafeAreaView` / `useSafeAreaInsets` for notch, status bar, home indicator
- [x] `KeyboardAvoidingView` for forms and input-heavy screens

### Elevation & Z-Index

#### Common

- [x] Level 0 — Flat (default page surface)
- [x] Level 1 — Raised (cards, dropdowns)
- [x] Level 2 — Overlay (drawers, side panels)
- [x] Level 3 — Modal (dialogs)
- [x] Level 4 — Tooltip / Popover (always topmost)

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
- [ ] Size variants: 16px (dense), 20px (default), 24px (standalone)
- [ ] Custom icon contribution process documented

#### Web

- [ ] SVG component delivery (no icon fonts)
- [ ] Decorative icons use `aria-hidden="true"`
- [ ] Meaningful icons have `aria-label` or visually hidden label
- [ ] Tree-shaken icon imports (never bundle entire icon library)

#### Mobile (React Native)

- [x] SVG icons via `react-native-svg` components
- [ ] Alternatively: vector icon library (`react-native-vector-icons` / `expo-vector-icons`)
- [ ] Icons scale with accessibility font size settings (`allowFontScaling`)
- [ ] Decorative icons excluded from accessibility tree (`accessible={false}`)
- [ ] Meaningful icons have `accessibilityLabel`

---

## 2. Component Contract Standard

### API Design Contracts

#### Common

- [ ] Controlled + Uncontrolled pattern (every interactive component supports both modes)
- [ ] Slot / Composition pattern for complex components (named sub-components, not mega-props)
- [ ] Consistent event signature: value first, event/metadata second
- [ ] Consistent prop naming conventions across all components
- [ ] Ref forwarding on all components

#### Web

- [ ] Polymorphic `as` prop / `asChild` to change underlying HTML element
- [ ] `className` / `style` prop passthrough on all components (escape hatch)
- [ ] `data-testid` prop support on all components
- [ ] Ref forwarded to root DOM node

#### Mobile (React Native)

- [ ] `style` prop (ViewStyle / TextStyle / ImageStyle) on all components
- [ ] Component injection pattern (render props or component props) instead of `as` prop
- [ ] `testID` prop support on all components
- [ ] Ref forwarded to underlying native view

### Accessibility Contract (Per Component)

#### Common

- [ ] Full keyboard / assistive technology operability
- [ ] Visible focus indicator on interactive elements
- [ ] Screen reader announcements for all state changes

#### Web

- [ ] Correct ARIA roles, states (`aria-expanded`, `aria-selected`, `aria-busy`), and properties
- [ ] Focus indicator: 3:1 contrast (WCAG 2.4.11) via `:focus-visible`
- [ ] `data-testid` attributes for test targeting
- [ ] `aria-live` regions for dynamic content announcements

#### Mobile (React Native)

- [ ] `accessible`, `accessibilityRole`, `accessibilityState`, `accessibilityLabel`, `accessibilityHint`
- [ ] `accessibilityActions` + `onAccessibilityAction` for custom gestures
- [ ] `accessibilityLiveRegion` (Android) / `UIAccessibility.post` notifications (iOS)
- [ ] `importantForAccessibility` (Android) to control accessibility tree inclusion
- [ ] `testID` attributes for test targeting

### Theming Contract (Per Component)

#### Common

- [ ] Component uses only component-scoped or semantic tokens — never raw values
- [ ] Dark mode fully functional with no component code change

#### Web

- [ ] High Contrast Mode (Windows/macOS) tested and functional
- [ ] `prefers-reduced-motion` respected via CSS media query

#### Mobile (React Native)

- [x] System appearance changes handled via `Appearance` API
- [x] Reduced motion respected via `AccessibilityInfo.isReduceMotionEnabled()`
- [x] Bold text preference respected (iOS `isBoldTextEnabled`)

### Testing Contract (Per Component)

#### Common

- [ ] Unit tests: logic, prop behavior, edge cases (empty, loading, error states)
- [ ] Interaction tests: full user flows (keyboard, pointer/touch)

#### Web

- [ ] Visual regression snapshot: all states × all themes (Chromatic / Percy)
- [ ] Accessibility audit: `axe-core` / `jest-axe` — zero violations per build
- [ ] Storybook `play()` interaction tests

#### Mobile (React Native)

- [ ] Visual regression on iOS simulator + Android emulator screenshots
- [ ] Accessibility audit via manual VoiceOver/TalkBack checks (automated tooling limited)
- [ ] Platform-specific test runs (iOS + Android) in CI
- [ ] Detox or Maestro interaction tests

### Documentation Contract (Per Component)

#### Common

- [ ] All variants and sizes documented
- [ ] All meaningful states (loading, disabled, error, empty)
- [ ] Real-world composition example
- [ ] Prop table with type, default, and description
- [ ] Do / Don't usage examples

#### Web

- [ ] Storybook story for each variant/state
- [ ] Accessibility notes (keyboard map, ARIA decisions)

#### Mobile (React Native)

- [ ] Example app / Storybook Native for each variant/state
- [ ] Accessibility notes (accessibilityRole, gesture alternatives)
- [ ] Platform-specific behavior differences documented (iOS vs Android)

---

## 3. Components — Reusable UI Blocks

### Inputs

#### Common

- [ ] Text Field
    - [ ] Default
    - [ ] With prefix icon
    - [ ] With suffix icon
    - [ ] With character counter
    - [ ] With helper text
    - [ ] With error message
    - [ ] Loading / async validation state
    - [ ] Clearable variant
    - [ ] Disabled
    - [ ] Read-only
- [ ] Textarea
    - [ ] Auto-resize
    - [ ] Max rows constraint
- [ ] Select / Dropdown
    - [ ] Single select
    - [ ] Multi-select
    - [ ] Grouped options
    - [ ] Searchable
    - [ ] Empty state in list
    - [ ] Loading state in list
- [ ] Combobox / Autocomplete
    - [ ] Typeahead
    - [ ] Async / debounced fetch
    - [ ] "Create new" inline option
    - [ ] Multi-select with token display
- [ ] Checkbox
    - [ ] Default
    - [ ] Indeterminate
    - [ ] Disabled
    - [ ] Group
- [ ] Radio
    - [ ] Default
    - [ ] Disabled
    - [ ] Group
- [ ] Toggle Switch
    - [ ] Default
    - [ ] Disabled
    - [ ] With label
- [ ] Date Picker
    - [ ] Single date
    - [ ] Locale-aware week start
    - [ ] Disabled date rules
- [ ] Time Picker
- [ ] Date-Range Picker
    - [ ] Preset ranges (Last 7 days, This Month, etc.)
- [ ] Token / Pill Input (multi-tag)
    - [ ] Max-tag limit with overflow indicator
- [ ] File Upload / Dropzone
    - [ ] Single file
    - [ ] Multi-file
    - [ ] Progress tracking per file
    - [ ] Cancellation
    - [ ] Invalid format error state
    - [ ] File size exceeded error state
    - [ ] Upload failed error state
- [ ] Slider
    - [ ] Single handle
    - [ ] Dual handle (range)
    - [ ] Step snapping
    - [ ] Value tooltip on drag
- [ ] Numeric Stepper
    - [ ] Min / Max / Step
    - [ ] Locale-aware decimal separators
- [ ] OTP / Code Input
    - [ ] Auto-advance on fill
    - [ ] Paste-splitting across cells
    - [ ] Masked variant
- [ ] Color Picker
    - [ ] Hex / HSL / RGB modes
- [ ] Search Input
    - [ ] Clear button
    - [ ] Loading state
    - [ ] Debounced

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

- [ ] TextInput with `keyboardType` variants (default, numeric, email, phone, url, decimal)
- [ ] TextInput with `returnKeyType` (done, next, go, search, send)
- [ ] TextInput with `autoComplete` / `textContentType` for autofill (password, email, name)
- [ ] `KeyboardAvoidingView` wrapping input-heavy screens
- [ ] `Keyboard.dismiss()` on background tap
- [ ] Date/Time Picker: native platform picker (iOS wheel/inline, Android dialog)
- [ ] Select: native ActionSheet (iOS) / bottom sheet (cross-platform)
- [ ] Token / Pill Input: swipe-to-remove tokens
- [ ] File Upload: native document picker / image picker integration
- [ ] Slider: gesture-based with `react-native-gesture-handler`
- [ ] OTP: SMS autofill support (Android `autoComplete="sms-otp"`, iOS `textContentType="oneTimeCode"`)
- [ ] Secure text entry (`secureTextEntry` prop) for password fields

### Actions

#### Common

- [ ] Button
    - [ ] Primary
    - [ ] Secondary
    - [ ] Tertiary / Ghost
    - [ ] Danger
    - [ ] Loading state (spinner replaces label)
    - [ ] Icon Left
    - [ ] Icon Right
    - [ ] Icon only
    - [ ] Sizes: xs, sm, md, lg
    - [ ] Disabled
    - [ ] Full width
- [ ] Icon Button
- [ ] Split Button (primary + dropdown for secondary actions)
- [ ] Toggle Button Group
    - [ ] Radio behavior (mutually exclusive)
    - [ ] Checkbox behavior (multi-select)
- [ ] Segmented Control

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

- [ ] Pressable / TouchableOpacity with visual press feedback
- [ ] Android ripple effect (`android_ripple` prop)
- [ ] Haptic feedback on press (success, warning, error intensities)
- [ ] FAB with absolute positioning + shadow
- [ ] Icon-only buttons have `accessibilityLabel`
- [ ] Minimum touch target 44×44pt enforced on all buttons
- [ ] Action Sheet (iOS) / bottom sheet menu for secondary actions

### Feedback

#### Common

- [ ] Toast / Snackbar
    - [ ] Info / Success / Warning / Error variants
    - [ ] Error: no auto-dismiss
    - [ ] Auto-dismiss with configurable duration
    - [ ] Max stack with queue
    - [ ] Explicit dismiss button
    - [ ] With action CTA
- [ ] Alert / Banner
    - [ ] Info / Success / Warning / Error variants
    - [ ] Dismissible / Persistent
    - [ ] With inline CTA
    - [ ] Page-level / Inline (section-level)
- [ ] Progress Indicator — Circular
    - [ ] Determinate (with value label)
    - [ ] Indeterminate
- [ ] Progress Indicator — Linear
    - [ ] Determinate
    - [ ] Indeterminate
- [ ] Skeleton Loader
    - [ ] Text line variants (sm, md, lg)
    - [ ] Avatar skeleton
    - [ ] Card skeleton
    - [ ] Table / list row skeleton
    - [ ] Image / media skeleton
    - [ ] Reduced-motion variant (static, no shimmer)
- [ ] Badge
    - [ ] Numeric (with 99+ cap)
    - [ ] Status dot
    - [ ] Pill / Tag (with color variants)
- [ ] Empty State
    - [ ] No data (never had data)
    - [ ] No results (filtered/searched)
    - [ ] No access (permission denied)
    - [ ] With illustration
    - [ ] With primary CTA
- [ ] Error State
    - [ ] Server error (5xx)
    - [ ] Not found (404)
    - [ ] Offline / network error
    - [ ] With retry CTA
- [ ] Notification Center / Inbox
    - [ ] Read / unread states
    - [ ] Category grouping (system, mentions, updates)
    - [ ] Mark all as read
    - [ ] Real-time new notification injection
    - [ ] Notification preferences link
    - [ ] Empty state

#### Web

- [ ] Toast: `aria-live="polite"` (info/success) / `aria-live="assertive"` (error)
- [ ] Toast: pause-on-hover auto-dismiss
- [ ] Banner: `role="alert"` for errors
- [ ] Skeleton shimmer: disabled under `@media (prefers-reduced-motion: reduce)`

#### Mobile (React Native)

- [ ] Toast: positioned above keyboard when visible
- [ ] Native `ActivityIndicator` as spinner (uses platform-native animation)
- [ ] Push notification badge (app icon badge count via `expo-notifications` or native module)
- [ ] In-app notification banner (slides down from top, auto-dismisses)
- [x] Skeleton shimmer: disabled when `AccessibilityInfo.isReduceMotionEnabled()` is true
- [ ] Haptic feedback on success/error toasts

### Navigation

#### Common

- [ ] Tabs
    - [ ] Horizontal
    - [ ] With icon
    - [ ] With badge
- [ ] Stepper / Wizard Navigation
    - [ ] Horizontal / Vertical
    - [ ] Step states: completed, active, upcoming, error
    - [ ] Non-linear navigation (jump to completed step)

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

- [ ] Bottom Tab Bar (React Navigation `BottomTabNavigator`)
    - [ ] Badge on tab items
    - [ ] Haptic feedback on tab switch
- [ ] Stack Navigator (screen push/pop with native transitions)
    - [ ] iOS: back swipe gesture (interruptible, gesture-driven)
    - [ ] Android: hardware back button handling
    - [ ] Large title / collapsing header (iOS-style)
    - [ ] Custom header with animated transitions
- [ ] Drawer Navigator (slide-from-left/right)
    - [ ] Gesture-driven open/close
    - [ ] Overlay and push variants
- [ ] Bottom Sheet Navigation (modal screens from bottom)
    - [ ] Snap points (half-screen, full-screen)
    - [ ] Drag-to-dismiss
    - [ ] Backdrop press to close
- [ ] Deep linking / universal links (maps URLs to screens)
- [ ] Nested navigators (tab within stack, modal over tab)
- [ ] Screen transition animations (slide, fade, modal lift)
- [ ] Navigation state persistence (restore screen on app reopen)
- [ ] Infinite scroll via `FlatList` `onEndReached` with threshold
- [ ] Pull-to-refresh via `RefreshControl`
- [ ] Accordion / Collapsible with `LayoutAnimation` or `Reanimated`

### Data Display

#### Common

- [ ] List
    - [ ] Default
    - [ ] Selectable
    - [ ] With skeleton
- [ ] Card
    - [ ] Default
    - [ ] Clickable / interactive
    - [ ] With header / body / footer slots
    - [ ] Horizontal layout variant
- [ ] Metrics / Stat Card
    - [ ] KPI value
    - [ ] Trend delta (positive / negative)
    - [ ] Sparkline
    - [ ] Comparison period label
    - [ ] Loading / error state
- [ ] Timeline / Activity Feed
    - [ ] Date separators
    - [ ] Infinite scroll
    - [ ] Real-time new item injection
- [ ] Avatar
    - [ ] Image
    - [ ] Initials fallback on image error
    - [ ] Size variants
    - [ ] With status indicator
- [ ] Avatar Group
    - [ ] Max display count with +N overflow
- [ ] Description List / Key-Value Pairs
    - [ ] Horizontal / vertical layout
    - [ ] Copyable value
    - [ ] Sensitive data mask (with reveal)
- [ ] Charts
    - [ ] Line / Bar / Area / Pie / Donut / Scatter / Heatmap / Sparkline
    - [ ] Color-blind safe palette
    - [ ] Empty / Loading / Error states
    - [ ] Accessible title + description

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

- [ ] Virtualized List via `FlatList` / `FlashList`
    - [ ] `removeClippedSubviews` optimization
    - [ ] `windowSize`, `maxToRenderPerBatch`, `initialNumToRender` tuning
    - [ ] `getItemLayout` for fixed-height rows (skip measurement)
    - [ ] Pull-to-refresh via `RefreshControl`
    - [ ] Empty list component (`ListEmptyComponent`)
    - [ ] Section headers via `SectionList`
- [ ] Sortable List (drag-to-reorder via `react-native-draggable-flatlist`)
- [ ] Swipe-to-reveal actions on list rows (swipe-to-delete, swipe-to-archive)
- [ ] Card with `Pressable` press animation (scale / opacity feedback)
- [ ] Charts: `react-native-svg` or `victory-native` based
- [ ] Avatar Group: tap to expand hidden members
- [ ] Image / Media Viewer
    - [ ] Pinch-to-zoom (gesture handler)
    - [ ] Swipe-to-dismiss
    - [ ] Gallery swipe navigation
    - [ ] Progressive image loading (thumbnail → full resolution)
- [ ] Kanban Board with horizontal `ScrollView` + draggable cards (gesture handler)

### Overlays

#### Common

- [ ] Modal / Dialog
    - [ ] Focus trap / accessibility focus
    - [ ] Dismiss on Escape / back gesture
    - [ ] Focus restore to trigger on close
    - [ ] Small / Medium / Large size variants
    - [ ] Confirmation dialog variant (with Danger button)
    - [ ] Stacking limited to 2 deep
- [ ] Tooltip
    - [ ] Max-width enforced
    - [ ] Never contains interactive elements
- [ ] Popover
    - [ ] With interactive content (forms, links)
    - [ ] Dismisses on Escape / back + outside tap
    - [ ] Focus moves inside on open
- [ ] Confirmation Dialog
    - [ ] Standard (cancel + confirm)
    - [ ] Hard confirmation (type entity name)

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

- [ ] Modal: `react-native` `<Modal>` or `react-navigation` modal stack
- [ ] Modal: animated entry (slide up / fade in via Reanimated)
- [ ] Bottom Sheet (`@gorhom/bottom-sheet` or equivalent)
    - [ ] Snap points (25%, 50%, 90%)
    - [ ] Drag-to-dismiss with velocity threshold
    - [ ] Backdrop tap to close
    - [ ] Keyboard-aware (adjusts snap point when keyboard appears)
    - [ ] Nested scrolling within sheet content
- [ ] Tooltip: shown on long-press (no hover on touch devices)
- [ ] Context Menu: long-press trigger with haptic feedback
- [ ] iOS-style Action Sheet (share, copy, delete…)
- [ ] Alert dialog: `Alert.alert()` for native OS dialogs (simple confirmations)
- [ ] Popover: positioned relative to trigger using `onLayout` measurements

---

## 4. Patterns — Composed Interactions

### Forms & Validation

#### Common

- [ ] Inline field error message (below field, linked to field for screen readers)
- [ ] Field warning (non-blocking, yellow)
- [ ] Field info / helper text (persistent, gray)
- [ ] Validation timing: `onChange` for format, `onBlur` for required/pattern
- [ ] Server-side error injection into field after submission
- [ ] Field-level async validation (debounced, loading spinner, screen reader announcement)
- [ ] Conditional / dynamic fields (appear/disappear based on other fields)
- [ ] Schema-driven / declarative form generation
- [ ] Draft auto-save with status indicator ("Saving…", "Saved", "Save failed — retry")
- [ ] Conflict detection on re-open of a draft
- [ ] Read-only form mode (plain text, not disabled inputs)
- [ ] RBAC-aware disabled field (lock icon + tooltip/hint with reason)
- [ ] Multi-step / Wizard form
- [ ] Per-step validation (not all-at-once on final step)
- [ ] Non-linear wizard step navigation (jump to completed step)

#### Web

- [ ] Error summary panel at top of form (focused on submit failure, anchors to each field)
- [ ] Error message linked via `aria-describedby`

#### Mobile (React Native)

- [ ] Keyboard avoidance: form auto-scrolls to focused field
- [ ] `returnKeyType="next"` on fields to advance via keyboard "Next" button
- [ ] Programmatic focus: `TextInput.focus()` to advance to next field on submit
- [ ] Scroll-to-error on validation failure
- [ ] Haptic feedback on validation error

### CRUD Patterns

#### Common

- [ ] Dirty-state indicator (unsaved changes badge)
- [ ] Bulk action bar (appears on any selection)
- [ ] Select all on current page / across all pages (with count)
- [ ] Bulk action progress indicator
- [ ] Soft delete / Archive (moves to trash, not permanent)
- [ ] Soft confirmation delete (Toast + "Undo" for 5s)
- [ ] Standard confirmation delete (dialog with item name)
- [ ] Hard confirmation delete (type entity name / "DELETE")
- [ ] Restore from archive / trash
- [ ] Permanent delete from trash (separate, explicit step)
- [ ] Duplicate / Clone entity
- [ ] Comparison / diff view (before and after states)
- [ ] Version history / audit log view

#### Web

- [ ] Inline cell editing (double-click or edit icon)
- [ ] Inline row editing
- [ ] Edit modal (explicit editing context)
- [ ] Undo (Cmd+Z) / Redo (Cmd+Shift+Z) for in-page editing workflows

#### Mobile (React Native)

- [ ] Swipe-to-delete on list rows (with undo toast)
- [ ] Swipe-to-archive on list rows
- [ ] Long-press to enter multi-select mode
- [ ] Edit via detail screen push (not inline)
- [ ] Haptic feedback on destructive action confirmation

### Search & Filtering

#### Common

- [ ] Faceted filters (checkbox per facet with count)
- [ ] Live filter (apply on change) vs. explicit apply button
- [ ] Filter by text / number / date / enum
- [ ] Advanced query builder (AND/OR rule groups)
- [ ] Filter badges / active filter strip (dismissible pills above dataset)
- [ ] "Clear all filters" button
- [ ] Saved views (named bookmarks of filter + sort + column state)
- [ ] Private vs. team-shared saved views
- [ ] Default view per user preference
- [ ] URL / deep-link serialization of view/filter state
- [ ] Text highlight of matched search term within results
- [ ] Recent searches

#### Web

- [ ] Global search / Command Palette (`Cmd+K`)
- [ ] Per-column filter in data table
- [ ] Search-within-table (local client-side, instant)
- [ ] Faceted sidebar filters layout

#### Mobile (React Native)

- [ ] Search bar with cancel button (iOS-style) / back arrow (Android-style)
- [ ] Filter bottom sheet / modal (not sidebar)
- [ ] Voice search integration (native speech-to-text)
- [ ] Search suggestions dropdown below search bar
- [ ] Filter chips (horizontal scrollable strip)

### Data Interaction & Layout

#### Common

- [ ] Drill-down navigation (metric → underlying records)
- [ ] Drag-and-drop — reorder within same list
- [ ] Density toggle (comfortable, compact, spacious — web) or compact toggle (mobile)
- [ ] Expandable / collapsible sections (accordion)

#### Web

- [ ] Breadcrumb update on drill path
- [ ] Resizable pane splitters (user-adjustable, persisted per user)
- [ ] Drag-and-drop — move between lists (Kanban)
- [ ] Keyboard drag alternative (Space to lift, Arrow to move, Space to drop, Escape to cancel)
- [ ] Column visibility toggle / order persistence
- [ ] Virtual scrolling for lists >200 items (DOM windowing)
- [ ] Sticky table headers / sticky first-last columns
- [ ] Split-view / side-by-side layout (master + detail)
- [ ] Resizable chart/widget panels in dashboard
- [ ] Full-screen expand for widgets/charts

#### Mobile (React Native)

- [ ] Gesture-driven drag-and-drop (react-native-gesture-handler + Reanimated)
- [ ] Swipe gestures for navigation and actions
- [ ] `FlatList` / `FlashList` virtual scrolling for long lists
- [ ] Master → detail via screen push navigation (not side-by-side)
- [ ] Collapsible header / parallax scroll
- [ ] Pull-to-refresh on data screens
- [ ] Sticky section headers in `SectionList`

### Feedback Loops

#### Common

- [ ] Optimistic UI update (instant + rollback on failure)
- [ ] Stale-while-revalidate (show cached data, update in background)
- [ ] "Last updated X ago" indicator with manual refresh
- [ ] Long-running job kick-off (returns job ID, transitions to processing state)
- [ ] Long-running job progress / completion / failure / cancelation
- [ ] Real-time data injection (WebSocket / SSE)
- [ ] "X new items available — click/tap to refresh"
- [ ] Connectivity status indicator (online, offline, reconnecting)
- [ ] Conflict resolution: "Updated by another user while you were editing"
- [ ] Collaborative lock: "Anna is currently editing this record"
- [ ] Error boundary — component level / section level / route level / application level

#### Web

- [ ] Offline: serve cached reads from service worker
- [ ] Offline: queue writes, sync on reconnect
- [ ] Offline banner (full-app)

#### Mobile (React Native)

- [ ] Offline: serve cached reads from local storage / SQLite / MMKV
- [ ] Offline: queue writes, sync on reconnect (background sync)
- [ ] Offline banner (top of screen, below status bar)
- [ ] Push notifications for long-running job completion
- [ ] App badge count for unread items / pending actions
- [ ] Background fetch for data refresh (`expo-background-fetch` or native module)
- [ ] `NetInfo` for connectivity detection

### Authentication & Session Patterns

#### Common

- [ ] Login form (email/password, SSO/OAuth providers)
- [ ] Multi-factor authentication UI (OTP input, authenticator app)
- [ ] Session expiry warning ("Your session expires in X minutes")
- [ ] Session expired state (redirect to login, preserve intended destination)
- [ ] Token refresh (silent, transparent to user)
- [ ] "Remember me" / persistent session option
- [ ] Password reset flow (request → email → reset → confirmation)
- [ ] Account locked state (too many failed attempts)
- [ ] Forced password change on first login

#### Web

- [ ] SSO redirect loading state
- [ ] Cookie-based session management

#### Mobile (React Native)

- [ ] Biometric authentication (Face ID, Touch ID, fingerprint)
- [ ] Secure storage for tokens (`expo-secure-store` / Keychain / Keystore)
- [ ] App lock / PIN code screen
- [ ] OAuth: in-app browser for SSO flow (`expo-auth-session` / `expo-web-browser`)
- [ ] Deep link handling for auth callbacks (magic links, email verification)
- [ ] Background-to-foreground session validation

### Onboarding & First-Run Experience

#### Common

- [ ] Welcome screen / first-run modal
- [ ] Feature tour (tooltip-based coach marks with step progression)
- [ ] Checklist-based onboarding ("Complete your setup: 3/5 done")
- [ ] Contextual hints (inline, dismissible, shown once per feature)
- [ ] Empty-to-populated state transitions (first item created celebration)
- [ ] "What's new" changelog modal (shown on version update)
- [ ] Opt-out / "Don't show again" preference persistence

#### Mobile (React Native)

- [ ] Swipeable onboarding carousel (full-screen pages with pagination dots)
- [ ] Permission request flows with pre-permission explanation screens (camera, location, notifications)
- [ ] App Store / Play Store screenshots reflecting first-run experience
- [ ] Animated illustration transitions between onboarding steps

### Permission-Aware Rendering

#### Common

- [ ] Feature flags: component/route conditionally rendered based on flag state
- [ ] RBAC: menu items hidden or CTA replaced with "Request Access"
- [ ] Resource-level permission: fields become read-only, action buttons disabled/hidden
- [ ] Field-level permission: field hidden or masked (PII, sensitive data)
- [ ] Hidden vs. Disabled logic: hide if never accessible, disable with explanation if conditionally blocked
- [ ] Skeleton shown during flag/permission resolution (no layout shift)

#### Web

- [ ] Never 404 on permission denial — show "Access Denied" page state with CTA

#### Mobile (React Native)

- [ ] Never show empty screen on permission denial — show "Access Denied" screen with CTA
- [ ] OS-level permission requests (camera, location, contacts) with explanation screen before prompt
- [ ] Permission denied handling: link to device Settings to re-enable

### Multi-Tenancy UI Patterns

#### Common

- [ ] Organization / workspace switcher
- [ ] Tenant-scoped data isolation (visual context of current tenant)
- [ ] Tenant branding (logo, colors applied from tenant config)
- [ ] Cross-tenant resource sharing indicators
- [ ] Tenant creation / setup wizard

### Clipboard Patterns

#### Common

- [ ] Copy-to-clipboard button (with "Copied!" confirmation)
- [ ] Copy URL / share link
- [ ] Copy formatted content (table rows, code blocks)

#### Web

- [ ] Paste handling (sanitize HTML, split tokens)

#### Mobile (React Native)

- [ ] `Clipboard` API (expo-clipboard) for copy/paste
- [ ] Native share sheet (`Share.share()`) for sharing content to other apps
- [ ] Universal link / deep link copying

### Keyboard Shortcuts Framework

#### Web

- [ ] Global shortcut registration system (conflict detection for duplicate bindings)
- [ ] Keyboard shortcuts help dialog (`?` key)
- [ ] Shortcut scope management (page-level, modal-level, global)
- [ ] User-customizable shortcut bindings (advanced)
- [ ] Shortcut hints shown in tooltips, menu items, and command palette

#### Mobile (React Native)

- [ ] External keyboard support (iPad, Android tablets with keyboard)
- [ ] `onKeyPress` handling for external keyboard shortcuts
- [ ] Keyboard shortcut discoverability in settings/help screen

### Import / Export Patterns

#### Common

- [ ] CSV / Excel / JSON export (current view + full dataset via server)
- [ ] Import wizard: upload → column mapping → preview → validation → confirm
- [ ] Import error report (row-level errors with correction suggestions)
- [ ] Import progress indicator for large datasets
- [ ] Template download for import format

#### Mobile (React Native)

- [ ] Export: share file via native share sheet (email, AirDrop, Files app)
- [ ] Import: file picker integration (document picker)
- [ ] Export to device Files app / Downloads folder

---

## 5. Accessibility (a11y) Architecture

### Compliance Target

#### Common

- [ ] Minimum: WCAG 2.2 Level AA
- [ ] Target: WCAG 2.2 Level AAA for critical flows (auth, account settings, checkout)
- [ ] Legal compliance documented (Section 508, EN 301 549, AODA as applicable)

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
- [ ] `LayoutAnimation` disabled under reduced motion
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

#### Mobile (React Native)

- [ ] System font scale tested at maximum (iOS: ~300%, Android: ~200%)
- [ ] `maxFontSizeMultiplier` set on layout-critical text
- [ ] Layouts tested at largest accessibility text size without content clipping

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

### Character Set & Encoding

#### Common

- [ ] UTF-8 encoding end-to-end
- [ ] Support for non-Latin scripts: CJK, Arabic, Hebrew, Devanagari
- [ ] Font stacks include system fallbacks for scripts not covered by brand font
- [ ] Correct line-breaking rules per script

---

## 7. Performance UX

### Core Metrics

#### Web

- [ ] LCP (Largest Contentful Paint) ≤ 2.5s
- [ ] INP (Interaction to Next Paint) ≤ 200ms
- [ ] CLS (Cumulative Layout Shift) ≤ 0.1
- [ ] FCP (First Contentful Paint) ≤ 1.8s
- [ ] TTFB (Time to First Byte) ≤ 800ms

#### Mobile (React Native)

- [ ] App launch to interactive ≤ 2s (cold start)
- [ ] Screen transition ≤ 300ms
- [ ] 60fps maintained during animations and scrolling (no frame drops)
- [ ] JS thread usage < 80% during idle
- [ ] Memory: no unbounded growth on navigation cycles
- [ ] Hermes bytecode compilation for faster startup

### Perceived Performance Patterns

#### Common

- [ ] Skeleton loaders: shapes match loaded content (eliminate layout shift)
- [ ] Optimistic UI: update immediately for high-success-rate actions
- [ ] Stale-while-revalidate: show cached data immediately, refresh in background
- [ ] Progressive loading: critical content first, secondary lazy-loaded

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
- [ ] JS: route-level code splitting, defer non-critical third-party scripts

#### Mobile (React Native)

- [ ] Images: `react-native-fast-image` for caching + priority loading
- [ ] Images: progressive loading (low-res placeholder → full resolution)
- [ ] Images: resize/compress before upload (client-side)
- [ ] Icons: tree-shaken SVG components or selective vector icon imports
- [ ] Asset bundling: only required assets per platform in binary
- [ ] Hermes engine enabled for faster JS execution

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
- [ ] Navigation transitions on native thread (react-navigation native stack)

### Rendering Strategy

#### Web

- [ ] Marketing / Public: Static Generation (SSG)
- [ ] Dashboard / Authenticated: Server-Side Rendering (SSR)
- [ ] Highly dynamic widgets: Client-Side Rendering (CSR) with skeleton
- [ ] Reports / heavy data: deferred with `<Suspense>` + skeleton

#### Mobile (React Native)

- [ ] All rendering is client-side (no SSR in RN)
- [ ] Screen-level lazy loading (lazy-load heavy screens)
- [ ] React.memo / useMemo / useCallback to prevent unnecessary re-renders
- [ ] Fabric (New Architecture) enabled for concurrent features and improved threading

### Bundle Performance

#### Common

- [ ] Component library is tree-shakeable (ESM exports, no side effects)
- [ ] Per-component bundle size limits enforced
- [ ] No circular dependencies between component packages

#### Web

- [ ] CSS co-located and tree-shaken with components (no monolithic stylesheet)

#### Mobile (React Native)

- [ ] Metro bundler configuration optimized (inline requires, lazy component loading)
- [ ] App binary size monitored per release (no unbounded growth)
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

#### Mobile (React Native)

- [ ] Phone: single-column layout, bottom tab bar, stack navigation
- [ ] Tablet: master-detail split view, sidebar navigation, multi-column forms
- [ ] iPad: `SplitView` / multi-column layout via wide-screen detection
- [ ] Android tablet: adaptive navigation (rail vs. bottom tabs)

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

#### Mobile (React Native)

- [ ] Responsive font sizes via scale factor utility (based on screen width)
- [ ] Font sizes respect system accessibility scaling (`allowFontScaling`)
- [ ] Spacing scales appropriately between phone and tablet layouts

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
- [ ] Orientation lock for specific screens where needed (e.g., video player, signature capture)
- [ ] Safe area insets recalculated on orientation change

### Platform-Specific Adaptive Patterns

#### Mobile (React Native)

- [ ] Foldable device support (Samsung Fold: inner/outer display handling)
- [ ] iPad multitasking: Split View, Slide Over compatibility
- [ ] Android multi-window / picture-in-picture awareness
- [ ] Large screen optimization guidelines (min touch target, readable line lengths, no stretched layouts)

---

## 9. Motion & Animation System

### Principles

#### Common

- [ ] Every animation communicates something (state change, hierarchy, direction) — no decorative-only motion
- [ ] All animations are interruptible (cancellable if user triggers counter-action)

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

#### Mobile (React Native)

- [ ] Fade In/Out: `opacity` shared value, `withTiming(200)`, Ease Out
- [ ] Scale Entrance: `scale(0.95)→1` + `opacity`, `withSpring()`
- [ ] Slide Entrance: `translateX` for screen push, native stack default
- [ ] Height Expand: `LayoutAnimation.configureNext()` or Reanimated layout animations
- [ ] Skeleton Shimmer: MaskedView + Animated gradient
- [ ] Spinner: native `ActivityIndicator` or Lottie animation
- [ ] Shared-element transition: `react-navigation-shared-element` or custom Reanimated
- [ ] Bottom sheet snap: spring-driven with velocity-based gesture release
- [ ] List item entry: `entering`/`exiting` layout animations (Reanimated)
- [ ] Haptic feedback paired with animation completion (toggle, delete, success)

### Reduced Motion Contract

#### Common

- [ ] State changes still happen — only motion is removed, never functionality

#### Web

- [ ] `@media (prefers-reduced-motion: reduce)` applied globally
- [ ] All `animation-duration` and `transition-duration` → 0.01ms under reduced motion

#### Mobile (React Native)

- [x] `AccessibilityInfo.isReduceMotionEnabled()` listener registered at app root
- [x] All Reanimated / Animated animations conditional on reduced-motion flag
- [ ] `LayoutAnimation` skipped under reduced motion
- [ ] Provide `useReducedMotion()` hook for component-level opt-out

---

## 10. Permission-Aware Rendering

### Permission Granularity Levels

#### Common

- [ ] Feature Flag: component/route excluded from render tree when flag off
- [ ] RBAC Role: menu items hidden, CTA replaced with "Request Access"
- [ ] Resource Permission: fields become read-only, action buttons disabled/hidden
- [ ] Field-Level: specific fields hidden or masked (PII, sensitive data)

### UI Rendering Rules

#### Common

- [ ] Hidden vs. Disabled: hide if never accessible, disable with explanation if conditionally blocked
- [ ] No optimistic rendering of unauthorized actions — resolve permissions at load time
- [ ] Skeleton shown during flag/permission resolution (no layout shift)

#### Web

- [ ] Never 404 on permission denial — show "Access Denied" page with CTA
- [ ] RBAC-aware forms: read-only renders `<p>` elements, not disabled `<input>`

#### Mobile (React Native)

- [ ] Access Denied screen with navigation back + "Request Access" CTA
- [ ] RBAC-aware forms: read-only renders `<Text>` elements, not disabled `<TextInput>`
- [ ] OS-level permission (camera, location): pre-permission explanation → system prompt → denied handling

### Feature Flag Infrastructure

#### Common

- [ ] A/B experiments, gradual rollouts, kill switches via feature flags
- [ ] Flag failure default: documented per flag (off or on)

#### Web

- [ ] Flags resolved server-side on SSR, or client-side with `<Suspense>` before render

#### Mobile (React Native)

- [ ] Flags fetched on app startup, cached locally
- [ ] Stale flag cache used when network unavailable
- [ ] Flag refresh on app foreground

### Sensitive Data Masking

#### Common

- [ ] PII masked by default with "reveal" affordance
- [ ] Reveal action is permission-gated
- [ ] Reveal triggers audit log
- [ ] Consistent masking format: `••••••@gmail.com`, `+1 (***) ***-1234`

#### Mobile (React Native)

- [ ] Masked values excluded from screen reader announcement until revealed
- [ ] Screenshot prevention on sensitive screens (`FLAG_SECURE` Android / `UIScreen.isCaptured` iOS)

---

## 11. Copy & Microcopy Standards

### Voice & Tone Framework

#### Common

- [ ] Tone guidelines documented per context (empty, error, destructive, success, loading, permission denial)
- [ ] Voice is consistent: helpful, direct, never blaming, never over-celebratory

### Button & CTA Labels

#### Common

- [ ] All buttons are verb-led ("Save Changes", "Delete Project", not "OK" or "Submit")
- [ ] Primary CTA in dialog matches dialog title action (no "Yes" / "Confirm")
- [ ] Cancel is always "Cancel" (never "Go Back", "Close", "No")
- [ ] Danger buttons use explicit destructive verbs ("Delete", "Remove", "Revoke")
- [ ] Loading button labels reflect action in progress ("Saving…", "Deleting…")

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

- [ ] Product glossary defined (one name per concept)
- [ ] No synonym mixing ("Organization" OR "Workspace", never both)
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

### Truncation Rules

#### Common

- [ ] Long text: truncated with `…` + tooltip/hint showing full text
- [ ] Labels: never truncate action labels (buttons, CTAs); wrap or abbreviate
- [ ] User names: truncated after first name if space-constrained, full name accessible

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

## 12. Design System Governance

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

#### Mobile (React Native)

- [ ] Cross-platform parity review: new component must ship for both web and native (or explicitly scoped)
- [ ] Platform-specific behavior documented (iOS vs Android differences)

### Living Documentation

#### Common

- [ ] CI integration: documentation builds on every PR

#### Web

- [ ] Storybook as primary documentation surface
- [ ] Visual regression on every PR (Chromatic or Percy)
- [ ] Design-code sync: Storybook stories linked to Figma frames
- [ ] Storybook Composition: multi-package Storybooks composed

#### Mobile (React Native)

- [x] Example app or Storybook Native as documentation surface
- [ ] Simulator/emulator screenshots captured per PR for visual review
- [ ] Platform-specific behavior documented alongside each component

### Metrics & Adoption Tracking

#### Common

- [ ] Adoption rate: % of product surfaces using DS vs. bespoke components
- [ ] Usage analytics: which components are most/least used
- [ ] a11y debt: violations tracked over time per product surface

#### Web

- [ ] Designer-engineer handoff fidelity: pixel-diff between Figma and live

#### Mobile (React Native)

- [ ] Platform parity score: % of components available on both iOS and Android
- [ ] Native module dependency count tracked per release

---

## 13. Failure Taxonomy & Graceful Degradation

### Error Boundary Levels

#### Common

- [ ] Component-level boundary (broken widget, siblings unaffected)
- [ ] Section-level boundary (broken panel, rest of page functional)
- [ ] Route/screen-level boundary (broken page/screen, navigation functional)
- [ ] Application-level boundary (last resort, full-screen error with reload + support contact)
- [ ] Partial failure state (some widgets loaded, some failed — clearly differentiated)

### Network / API Failures

#### Common

- [ ] Loading (first fetch) → skeleton
- [ ] Loading (refetch) → spinner in header/toolbar
- [ ] Stale data → "Last updated X ago" banner + manual refresh
- [ ] Request timeout → timeout error state + retry
- [ ] Server error 5xx → inline error card + retry
- [ ] Not found 404 → not-found state + navigate back
- [ ] Unauthorized 401 → redirect to login
- [ ] Forbidden 403 → access denied state + request access CTA
- [ ] Rate limited 429 → "Too many requests" countdown + auto-retry
- [ ] Offline → banner + degraded mode (cached reads)
- [ ] Reconnected → auto-retry queued writes + refresh stale data

### Component States (All for Every Component)

#### Common

- [ ] Default (nominal)
- [ ] Loading (async in progress)
- [ ] Error (something went wrong)
- [ ] Empty (loaded, but no data)
- [ ] Disabled (not available, reason surfaced)
- [ ] Read-only (viewable, not editable)
- [ ] Partial (some loaded, some failed)

### Data Edge Cases

#### Common

- [ ] Zero results — empty state with CTA
- [ ] Single result — no awkward "1 of 1" pagination
- [ ] Very long string — truncated, never breaks layout
- [ ] Null / undefined — consistent placeholder ("—" or "Not set")
- [ ] Large numeric value — locale-formatted, never overflows
- [ ] Large dataset (10k+ rows) — virtualized, keyboard/scroll nav intact
- [ ] Stale / cached data — visually distinguished with timestamp

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

#### Mobile (React Native)

- [ ] Push notification for job completion/failure (even if app is backgrounded)
- [ ] Job status survives app backgrounding/foregrounding

### Offline / Degraded Mode

#### Common

- [ ] Full-app offline banner
- [ ] Writes queued locally
- [ ] Queued action count indicator
- [ ] Auto-sync on reconnect
- [ ] Conflict detection post-sync

#### Web

- [ ] Reads served from service worker cache

#### Mobile (React Native)

- [ ] Reads served from local storage / SQLite / MMKV cache
- [ ] `NetInfo` connectivity listener for online/offline detection
- [ ] Background sync when connectivity returns (`expo-background-fetch`)

### Conflict Resolution

#### Common

- [ ] Last-write-wins with notification (user informed)
- [ ] Collaborative lock (another user is editing — shown in UI)
- [ ] Merge conflict UI (show both versions, let user choose)
- [ ] Concurrent edit notification

### Hydration & Rendering Failures

#### Web

- [ ] SSR/SSG hydration mismatch handled gracefully (fallback to client render)
- [ ] Partial hydration failure does not crash page
- [ ] Feature flag service failure: documented default per flag

#### Mobile (React Native)

- [ ] App crash recovery: last known good state restored on relaunch
- [ ] Deep link resolution failure: fallback to home screen with error toast
- [ ] Feature flag cache stale: use last known values

### Third-Party Dependency Failures

#### Common

- [ ] Embedded widget failure does not affect host app
- [ ] Graceful degradation when external dependency fails

#### Web

- [ ] Third-party script timeout: placeholder, not broken layout
- [ ] CDN failure: local fallback or error state

#### Mobile (React Native)

- [ ] Native module crash isolation (doesn't take down JS runtime)
- [ ] Push notification service failure: app still functional without notifications

---

## 14. Testing Strategy

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

#### Web

- [ ] All viewports: mobile, tablet, desktop
- [ ] Interaction snapshots after Storybook `play()` completes
- [ ] Tools: Chromatic, Percy, or Playwright `toHaveScreenshot()`

#### Mobile (React Native)

- [ ] iOS simulator + Android emulator snapshots per component
- [ ] Both platform screenshots in light + dark mode
- [ ] Device-specific: iPhone SE (small), iPhone Pro Max (large), iPad, Pixel, Samsung Galaxy

### Performance Tests

#### Web

- [ ] Core Web Vitals via Lighthouse CI (LCP > 2.5s / CLS > 0.1 fails build)
- [ ] Bundle size regression: `size-limit` per component
- [ ] Rendering: React Profiler detects unnecessary re-renders
- [ ] Benchmark: Data Grid + Rich Text Editor with large datasets

#### Mobile (React Native)

- [ ] Startup time regression tracking (cold start ≤ 2s)
- [ ] Frame rate monitoring during scroll / navigation (60fps target)
- [ ] Memory profiling: no leaks on navigation cycles
- [ ] `FlatList` benchmark: 10k items, smooth scroll, no blank frames
- [ ] App binary size tracked per release
- [ ] JS bundle size tracked per release

### End-to-End Tests

#### Common

- [ ] Authentication (login, MFA, session expiry)
- [ ] Core CRUD flow (create, read, update, delete with confirmation)
- [ ] Form submission with validation errors and success
- [ ] Search, filter, and saved views
- [ ] Bulk selection and bulk action
- [ ] Permission-denied state rendering
- [ ] Offline detection and recovery
- [ ] Each test asserts: expected screen/URL, visible elements, no errors

#### Web

- [ ] Playwright: axe scan on final state of each flow
- [ ] Long-running job initiation and status resolution

#### Mobile (React Native)

- [ ] Detox / Maestro: run on iOS simulator + Android emulator in CI
- [ ] Deep link / universal link navigation test
- [ ] Background → foreground session persistence test
- [ ] Push notification tap → correct screen navigation test
- [ ] Biometric auth flow test (simulated)

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
