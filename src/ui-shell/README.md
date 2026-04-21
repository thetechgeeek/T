# UI Shell Workspace

This folder is the package-style source of truth for `@easydesign/ui-shell`, the reusable host layer that sits between consumer apps and `@easydesign/design-system`.

## Goals

- Compose `@easydesign/design-system` and `@easydesign/design-system/foundation` into app-level providers, hosts, scaffolds, and chrome without embedding product/domain code.
- Keep shell-owned runtime and navigation glue detached from `app/` so multiple consumer apps can share one host layer.
- Expose one documented public surface through `@easydesign/ui-shell`.
- Keep product apps responsible for routes, stores, services, workflows, analytics taxonomy, and domain copy while the shell owns shared app chrome and runtime wiring.

## Provider Order

`ShellRootProviders` mounts the shell in one documented order:

1. `ThemeProvider`
2. `ShellEnvironmentProvider`
3. `ErrorBoundary`
4. session resume bridge
5. `ShellAssetGate`
6. `KeyboardProvider`
7. `ShellOverlayProvider`
8. gesture root, safe area, status bar, and offline banner viewport

This is the shell contract for theme, locale/RTL, reduced motion, safe-area, gesture, keyboard, overlay, and accessibility-safe hosting.

## Adapter Contract

`ShellEnvironment` is the shell adapter boundary. Consumer apps pass:

- translation
- connectivity and sync status
- auth/session behavior
- permissions and feature flags
- tenant context and branding inputs
- notifications and inbox handlers
- deep-link resolution
- analytics hooks
- persistence hooks
- asset readiness
- adaptive runtime metrics

Safe defaults exist for every adapter so the shell stays package-safe when an integration is missing or still resolving.

## Public Surface

- `ShellRootProviders`
  mounts the shared native host stack
- `ShellAuthGate`
  generic auth redirect gate driven by app-supplied auth state and callbacks
- `ShellEnvironmentProvider`, `useShellEnvironment`, `createShellEnvironment`
  adapter boundary and safe-default environment builder
- `ShellAssetGate`, `ShellOverlayProvider`, `useShellOverlay`
  shell-owned runtime hosts
- `ShellPermissionBoundary`, `ShellFeatureFlagBoundary`, `ShellNotificationHost`, `ShellNotificationBadge`, `ShellTenantSwitcher`, `ShellDeepLinkGuard`
  reusable shell scaffolds and hosts
- `ScreenHeader`, `OfflineBanner`, `QueryBoundary`, `SyncIndicator`, `ShellLayoutScaffold`
  shared shell chrome and adaptive layout primitives

## Working Rules

- Shell code may depend on `@easydesign/design-system` and `@easydesign/design-system/foundation`, but never on product stores, services, features, or route definitions.
- Consumer apps should import shell providers and components from `@easydesign/ui-shell`, not private implementation files.
- Product-only wrappers and domain organisms belong in `app/components` or feature-local modules.
- App-specific wrappers built on top of the shell should state which shell scaffold or DS primitive they compose from.
- Adapter values such as translation, connectivity, auth state, feature flags, permissions, tenant context, and sync state come from the consumer app and are passed into the shell; the shell must not read them from product hooks directly.
- The extraction target is package-ready but still in-repo for now: freeze the public surface here, then move this folder into its own package/repo only after consumer imports stay stable and consumer apps remain green.
