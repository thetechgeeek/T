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
