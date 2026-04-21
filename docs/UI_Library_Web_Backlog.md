# UI Library Web Backlog

> Companion to `docs/UI_Library_Checklist.md`.
> The main library checklist is currently scoped to `Common` + `Mobile (React Native)`.
> This file parks reusable web-only backlog until the web surface is intentionally brought into scope.
> Shell routing, deep-linking, and runtime wiring still belong in `docs/UI_Integration_Checklist.md`.

## 1. Design System Architecture

### Theming Engine

#### Web

- [ ] CSS Custom Properties re-assignment for theme switching (no page reload)
- [ ] Nested theme scoping (a card can have a different theme than the page via CSS cascade)
- [ ] `prefers-color-scheme` media query detection
- [ ] `prefers-contrast` media query detection

### Typography System

#### Web

- [ ] `font-display: swap` on all font faces
- [ ] Font preload directives (`<link rel="preload">`)
- [ ] `woff2` format for all custom fonts
- [ ] Line length (measure) max `75ch` enforced for body text
- [ ] Heading hierarchy (`h1`-`h6`) is semantic HTML, styled with classes

### Spacing & Layout Grid

#### Web

- [ ] Mobile grid (4 columns, 16px gutter, 16px margin)
- [ ] Tablet grid (8 columns, 24px gutter, 24px margin)
- [ ] Desktop grid (12 columns, 24px gutter, 32px margin)
- [ ] Wide grid (12 columns, 32px gutter, max-width 1440px)
- [ ] CSS Grid and Flexbox layout utilities

### Elevation & Z-Index

#### Web

- [ ] All z-index values in a single constants file (no magic numbers)
- [ ] CSS `box-shadow` tokens per elevation level

### Iconography

#### Web

- [ ] SVG component delivery (no icon fonts)
- [ ] Decorative icons use `aria-hidden="true"`
- [ ] Meaningful icons have `aria-label` or visually hidden label
- [ ] Tree-shaken icon imports (never bundle entire icon library)

## 2. Component Contract Standard

### API Design Contracts

#### Web

- [ ] Polymorphic `as` prop / `asChild` to change underlying HTML element
- [ ] `className` / `style` prop passthrough on all components (escape hatch)
- [ ] `data-testid` prop support on all components
- [ ] Ref forwarded to root DOM node

### Accessibility Contract (Per Component)

#### Web

- [ ] Correct ARIA roles, states (`aria-expanded`, `aria-selected`, `aria-busy`), and properties
- [ ] Focus indicator: 3:1 contrast (WCAG 2.4.11) via `:focus-visible`
- [ ] `data-testid` attributes for test targeting
- [ ] `aria-live` regions for dynamic content announcements

### Theming Contract (Per Component)

#### Web

- [ ] High Contrast Mode (Windows/macOS) tested and functional
- [ ] `prefers-reduced-motion` respected via CSS media query

### Testing Contract (Per Component)

#### Web

- [ ] Visual regression snapshot: all states × all themes (Chromatic / Percy)
- [ ] Accessibility audit: `axe-core` / `jest-axe` — zero violations per build
- [ ] Storybook `play()` interaction tests

### Documentation Contract (Per Component)

#### Web

- [ ] Storybook story for each variant/state
- [ ] Accessibility notes (keyboard map, ARIA decisions)

## 3. Components — Reusable UI Blocks

### Inputs

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

### Actions

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

### Feedback

#### Web

- [ ] Toast: `aria-live="polite"` (info/success) / `aria-live="assertive"` (error)
- [ ] Toast: pause-on-hover auto-dismiss
- [ ] Banner: `role="alert"` for errors
- [ ] Skeleton shimmer: disabled under `@media (prefers-reduced-motion: reduce)`

### Navigation

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

### Data Display

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

### Overlays

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

## 4. Patterns — Reusable Compositions

### Forms & Validation

#### Web

- [ ] Error summary panel at top of form (focused on submit failure, anchors to each field)
- [ ] Error message linked via `aria-describedby`

### CRUD Patterns

#### Web

- [ ] Inline cell editing (double-click or edit icon)
- [ ] Inline row editing
- [ ] Edit modal (explicit editing context)
- [ ] Undo (Cmd+Z) / Redo (Cmd+Shift+Z) for in-page editing workflows

### Search & Filtering

#### Web

- [ ] Global search / Command Palette (`Cmd+K`)
- [ ] Per-column filter in data table
- [ ] Search-within-table (local client-side, instant)
- [ ] Faceted sidebar filters layout

### Data Interaction & Layout

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

### Clipboard Patterns

#### Web

- [ ] Paste handling (sanitize HTML, split tokens)

### Keyboard Shortcuts Framework

#### Web

- [ ] Global shortcut registration system (conflict detection for duplicate bindings)
- [ ] Keyboard shortcuts help dialog (`?` key)
- [ ] Shortcut scope management (page-level, modal-level, global)
- [ ] User-customizable shortcut bindings (advanced)
- [ ] Shortcut hints shown in tooltips, menu items, and command palette

## 5. Accessibility (a11y) Architecture

### Semantic Structure

#### Web

- [ ] Native HTML elements used: `<button>`, `<a>`, `<input>`, `<table>`
- [ ] No `<div>` + `onClick` + `role` recreation of native elements
- [ ] All form elements have programmatic `<label>` (never placeholder-only)
- [ ] Single `<h1>` per page; heading levels never skip
- [ ] Landmark regions (`<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`)

### ARIA / Accessibility API Usage

#### Web

- [ ] Priority: native HTML → ARIA role → ARIA state/property → `aria-live`
- [ ] ARIA used only when HTML semantics are insufficient
- [ ] `aria-live` regions for dynamic content announcements

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

### Focus Management

#### Web

- [ ] Focus on route change: moves to `<h1>` or skip-target
- [ ] `:focus-visible` used (mouse users don't see ring, keyboard users do)
- [ ] Focus ring: 3:1 contrast against adjacent colors (WCAG 2.4.11)
- [ ] Skip-navigation link as first focusable element

### Color & Visual Accessibility

#### Web

- [ ] High Contrast Mode (Windows) tested on all components
- [ ] `prefers-contrast: more` media query respected

### Screen Reader Testing Matrix

#### Web

- [ ] NVDA + Chrome/Firefox (Windows)
- [ ] JAWS + Chrome/Edge (Windows)
- [ ] VoiceOver + Safari (macOS)

### Reduced Motion

#### Web

- [ ] All animations wrapped in `@media (prefers-reduced-motion: reduce)`
- [ ] Skeleton loaders: static gray (no shimmer) under reduced motion
- [ ] Transitions: instant or < 100ms under reduced motion
- [ ] Auto-playing carousels / marquees: paused

### Forms Accessibility

#### Web

- [ ] `<label>` with `for` attribute or `aria-label`
- [ ] Errors linked via `aria-describedby`, announced via `aria-live="polite"`
- [ ] `aria-required="true"` on required fields
- [ ] No CAPTCHA without audio/accessible alternative

### Zoom & Magnification

#### Web

- [ ] All pages tested at 200% browser zoom (WCAG 1.4.4) — no clipping
- [ ] All pages tested at 400% zoom — content reflows to single column
- [ ] Hero/display typography and featured cards reflow gracefully without losing hierarchy at max zoom

## 6. Internationalization (i18n) & Localization (L10n)

### String Externalization

#### Web

- [ ] i18n library integrated (react-intl, i18next, or equivalent)

### RTL (Right-to-Left) Layout Support

#### Web

- [ ] Logical CSS properties used (`margin-inline-start`, not `margin-left`)
- [ ] `dir="rtl"` on `<html>` flips layouts with no component code change
- [ ] Text truncation at logical end

## 7. Performance UX

### Perceived Performance Patterns

#### Web

- [ ] Virtualization for any list/grid/tree > 200 items (DOM windowing)
- [ ] Above-the-fold priority: hero, CTAs, nav never depend on lazy-loaded resources
- [ ] `<Suspense>` boundaries for deferred widgets

### Asset Optimization

#### Web

- [ ] Images: `webp`/`avif` format, responsive `srcset`, `loading="lazy"` below fold
- [ ] Images: explicit `width`/`height` to reserve space (eliminates CLS)
- [ ] Icons: SVG sprite or tree-shaken imports
- [ ] Fonts: `font-display: swap`, preload critical, `woff2` format
- [ ] CSS: critical inline, rest deferred, tokens as CSS Custom Properties

### Interaction Responsiveness

#### Web

- [ ] Event handlers non-blocking; computation > 50ms offloaded (Web Worker / `scheduler.yield()`)
- [ ] Scroll handlers: 16ms (1 frame) throttle
- [ ] Resize observers: debounced
- [ ] Input lag: validation within one animation frame (16ms)

### Bundle Performance

#### Web

- [ ] CSS co-located and tree-shaken with components (no monolithic stylesheet)

## 8. Responsive & Adaptive Design

### Breakpoints & Responsive Strategy

#### Web

- [ ] xs: < 480px / sm: 480–767px / md: 768–1023px / lg: 1024–1279px / xl: 1280–1535px / 2xl: ≥ 1536px
- [ ] Mobile-first (min-width) media queries throughout
- [ ] Container Queries (`@container`) for component-level responsiveness

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

### Touch & Pointer

#### Web

- [ ] Hover-only affordances have touch equivalents (tap-to-reveal, long-press)
- [ ] Swipe gestures for drawers / bottom sheets
- [ ] No hover-only tooltips on touch devices

### Typography & Spacing

#### Web

- [ ] Fluid typography using CSS `clamp()` between breakpoints
- [ ] Fluid spacing using CSS `clamp()` between breakpoints

## 9. Motion & Animation System

### Principles

#### Web

- [ ] Only animate `transform` and `opacity` for shared UI motion
- [ ] Motion remains interruptible and reduced-motion safe
- [ ] No continuous decorative motion on operational work surfaces

### Animation Patterns

#### Web

- [ ] Fade in/out motion tokens applied consistently
- [ ] Scale entrance pattern for compact overlays and menus
- [ ] Drawer and sheet slide transitions
- [ ] Shared reduced-motion fallback for shimmer, toast entry, and page transition patterns
- [ ] Shared-element transitions used only where orientation value is clear

### Reduced Motion

#### Web

- [ ] `@media (prefers-reduced-motion: reduce)` applied globally
- [ ] `animation-duration` and `transition-duration` collapse to near-instant values under reduced motion

## 10. Copy & Microcopy Standards

### Truncation And Accessibility Copy

#### Web

- [ ] Breadcrumb truncation collapses middle items into an explicit overflow affordance
- [ ] Table-cell truncation reveals the full value through tooltip, expansion, or detail view
- [ ] `aria-label` phrasing conventions documented for icon-only and dismiss actions
- [ ] Screen-reader live-region copy patterns documented for async feedback and state announcements

## 12. State Resilience & Graceful Degradation

### Data Edge Cases

#### Web

- [ ] Very wide content (100+ columns) preserves horizontal-scroll and pinned-column ergonomics
- [ ] Deep hierarchy (500+ nodes) remains lazy-loaded, collapsible, and keyboard navigable
- [ ] Font sizes never clip or overflow container at any breakpoint
- [ ] Whitespace scales intentionally; small screens avoid dead zones while preserving hierarchy

### Print

#### Web

- [ ] `@media print` stylesheet defined
- [ ] Navigation and sidebars hidden in print
- [ ] Interactive elements hidden or replaced with text in print
- [ ] Page break control (`break-before`, `break-after`)
- [ ] Readable in monochrome

### Orientation

#### Web

- [ ] Landscape and portrait layouts tested for all pages
- [ ] Orientation-specific adjustments where needed

## 13. Testing Strategy

### Testing Pyramid

#### Web

- [ ] Static: Stylelint, Design Token Lint
- [ ] Unit: Vitest / Jest + Testing Library
- [ ] Integration: Testing Library (component composition, page-level)
- [ ] E2E: Playwright

### Component-Level Tests

#### Web

- [ ] Storybook `play()` interaction tests
- [ ] DOM assertions: aria attributes, focus, `data-state` after interaction

### Accessibility Tests

#### Web

- [ ] Automated (CI): `jest-axe` / `axe-playwright` on every component + route — zero violations gate
- [ ] Color contrast: automated via `axe-core` + manual spot-checks
- [ ] Zoom: 200% and 400% — no clipping or overlapping

### Visual Regression Tests

#### Web

- [ ] All viewports: mobile, tablet, desktop
- [ ] Interaction snapshots after Storybook `play()` completes
- [ ] Tools: Chromatic, Percy, or Playwright `toHaveScreenshot()`

### Enterprise x Premium Quality Review

#### Web

- [ ] Storybook review page shows premium showcase shell and operational dense shell side by side
- [ ] Representative screens reviewed at mobile, tablet, desktop, and wide densities for hierarchy drift

### Performance Tests

#### Web

- [ ] Bundle size regression: `size-limit` per component
- [ ] Rendering: React Profiler detects unnecessary re-renders
- [ ] Benchmark: Data Grid + Rich Text Editor with large datasets

### i18n Tests

#### Web

- [ ] Pseudo-localization: padded/accented strings to reveal truncation and overflow
