# UI Library Web Backlog

> Companion to `docs/UI_Library_Checklist.md`.
> The main library checklist is currently scoped to `Common` + `Mobile (React Native)`.
> This file parks reusable web-only backlog until the web surface is intentionally brought into scope.
> Host-app routing, deep-linking, and runtime wiring still belong in `docs/UI_Integration_Checklist.md`.

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
