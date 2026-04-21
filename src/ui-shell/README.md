# UI Shell Workspace

This folder is the package-style source of truth for the reusable app shell that sits between the product app and the design system.

## Goals

- Compose `src/design-system` into app-level providers, hosts, scaffolds, and chrome without embedding product/domain code.
- Keep shell-owned runtime and navigation glue detached from `app/` so multiple apps can consume the same host layer.
- Expose a documented public surface through `src/ui-shell/index.ts`.
- Keep product apps responsible for routes, stores, services, workflows, and domain copy while the shell owns shared app chrome and runtime wiring.

## Public Surface

- `ShellRootProviders`
    - mounts the shared native host stack: theme, keyboard, safe area, gesture root, status bar, error boundary, and offline banner
- `ShellAuthGate`
    - generic auth redirect gate driven by app-supplied auth state and callbacks
- `ShellEnvironmentProvider` / `useShellEnvironment`
    - adapter boundary for translation, connectivity, sync status, and shared shell actions
- `components/`
    - reusable shell-owned chrome such as `ScreenHeader`, `OfflineBanner`, `QueryBoundary`, and `SyncIndicator`

## Working Rules

- Shell code may depend on `src/design-system` and `src/design-system/foundation`, but never on product stores, services, features, or route definitions.
- Consumer apps should import shell providers and components from `src/ui-shell/index.ts`, not private implementation files.
- Product-only wrappers and dashboard/domain organisms belong in `app/components` or feature-local modules.
- Adapter values such as translation, connectivity, auth state, and sync state come from the consumer app and are passed into the shell; the shell must not read them from product hooks directly.
- The extraction target is package-ready but still in-repo for now: freeze the public surface here, then move this folder into its own package/repo only after consumer imports stay stable.
