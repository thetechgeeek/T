# UI Integration Checklist

> Companion to `docs/UI_Library_Checklist.md`.
> The library checklist tracks what the component library can guarantee in isolation.
> This checklist tracks the reusable shell contract that sits between the library and any consumer app.
> Once the shell is extracted, each product app should keep its own app-specific integration checklist derived from this file.
> If an item depends on domain models, route maps, backend semantics, analytics taxonomy, or product copy, it belongs in the consumer app checklist, not here.

## 0. Ownership & Scope

### Shell Contract

#### Common

- [x] `src/design-system/foundation` owns the reusable runtime substrate: theme, locale/RTL, responsive metrics, motion helpers, and DS-safe shared utilities
- [x] `src/design-system/index.ts` and `src/design-system/foundation/index.ts` are treated as the public entrypoints for consumers
- [x] The shell composes the dumb component library and exposes reusable application infrastructure without embedding product/domain code
- [x] Product apps depend on the shell; the shell never imports product stores, services, features, or route definitions
- [ ] Any app-specific wrapper built on top of the shell references the underlying shell scaffold or DS primitive it is composed from
- [x] Each consuming app keeps a separate app-owned checklist for domain workflows, copy, route maps, and rollout state

## 1. Package Boundaries & Public API

### Public Entry Points

#### Common

- [x] Consumers import shell providers, hooks, hosts, and scaffolds only from documented public entrypoints
- [x] Consumers import UI primitives and patterns only from documented DS entrypoints
- [x] No consumer imports from private implementation files or repo-local compatibility shims
- [ ] Shell versioning, migration notes, and deprecation windows are published with every release
- [ ] Deprecated shell APIs keep an explicit removal target and migration path

### Adapter Contracts

#### Common

- [x] Auth/session integration is passed through a documented adapter interface
- [ ] Permissions and feature flags are passed through documented adapter interfaces
- [ ] Tenant/branding data is passed through a documented adapter interface
- [ ] Notification, deep-link, analytics, and persistence integrations use shell-owned interfaces instead of direct product imports
- [ ] Shell defaults are safe when an adapter is absent, stale, or unresolved

## 2. Provider Stack & Runtime Host

### Root Providers

#### Common

- [ ] The shell mounts theme, locale, RTL, reduced-motion, safe-area, gesture, keyboard, overlay, and accessibility hosts in one documented order
- [x] Runtime signals are read once in the shell/foundation and propagated through shared context
- [ ] Fonts, icons, and required shell assets are registered before shell surfaces depend on them
- [ ] Provider order is covered by tests so nested overlays, focus restore, and gesture shells remain stable

### Delivery & Performance

#### Common

- [ ] Shell startup, navigation, and interaction budgets are defined separately from product-domain budgets
- [ ] The shell lazy-loads heavy scaffolds and keeps the default root path light
- [ ] Shell-owned transitions remain responsive under reduced motion, large font scale, and high-contrast settings
- [ ] Bundle growth for shell-owned code is tracked separately from product-domain code

### Adaptive Runtime

#### Mobile (React Native)

- [ ] Phone, tablet, foldable, and multi-window behavior are decided in the shell instead of ad hoc per screen
- [ ] The shell exposes width-aware layout scaffolds such as single-column, split-pane, and rail/sidebar shells
- [ ] Orientation locks, edge gestures, and safe-area behavior are centralized in shell policy
- [ ] Navigation-state restore and resume hooks are handled through shell infrastructure

## 3. Navigation Infrastructure & Screen Scaffolds

### Reusable Navigation Hosts

#### Common

- [ ] The shell owns reusable stack, tab, drawer, modal, and bottom-sheet host patterns where they are shared across apps
- [ ] Screen transition policy, header strategy, and presentation variants are centralized in the shell
- [ ] Shell-owned navigators remain interruptible and reduced-motion aware
- [ ] Shell route infrastructure never hard-codes product destinations

### Screen Scaffolds

#### Common

- [ ] Auth, onboarding, settings, detail, list, and split-pane scaffolds exist where multiple apps can reuse them
- [ ] Error, empty, loading, denied, and read-only shells preserve consistent spacing and hierarchy across scaffolds
- [ ] Shell scaffolds accept slots, render props, or configuration instead of importing product features
- [ ] Back behavior, dismiss behavior, and route restore are defined per scaffold type

### Deep Links & OS Hand-off

#### Common

- [ ] Deep-link parsing and fallback policy are handled by shell infrastructure
- [ ] The shell exposes extension points for app-specific route resolution
- [ ] Invalid or unauthorized deep links fail into a safe shell state instead of a broken screen

## 4. Identity, Permission, Tenant & Feature Adapters

### Auth & Session

#### Common

- [x] The shell exposes reusable auth/session scaffolds without embedding a concrete auth provider
- [ ] Session expiry, re-auth, lock-screen, and recovery flows are adapter-driven
- [ ] Auth shell surfaces remain understandable without brand media or product-specific copy

#### Mobile (React Native)

- [ ] Biometrics, secure storage, and app-lock flows are exposed as capability adapters
- [ ] Background-to-foreground session validation hooks exist at the shell layer

### Permission & Flags

#### Common

- [ ] The shell exposes reusable boundaries for denied, masked, limited, and loading-resolution states
- [ ] Permission and feature-flag resolution occurs before protected shell actions become interactive
- [ ] Hidden-vs-disabled policy, request-access affordances, and fallback surfaces are documented at the shell layer
- [ ] Flag failure defaults are defined per adapter contract

### Tenant & Branding

#### Common

- [ ] Tenant switching, branding inputs, and tenant context surfaces are handled through shell adapters
- [ ] Branding is applied within DS guardrails for contrast, accent budget, and hierarchy
- [ ] Cross-tenant context indicators and switchers are shell-owned patterns when reused across apps

## 5. Notification, Offline, Background & Failure Orchestration

### Notification & Inbox Hosts

#### Common

- [ ] The shell owns reusable banner, toast, inbox, and badge hosts
- [ ] Consumer apps inject events into shell-owned notification surfaces through documented APIs
- [ ] Preference affordances exposed by the shell can be routed by the consuming app

#### Mobile (React Native)

- [ ] Push-tap routing, badge sync, and foreground/background notification hand-off are handled by shell integrations

### Offline & Sync Surfaces

#### Common

- [ ] Offline banner, queued work indicator, reconnect acknowledgement, and conflict surfaces are shell-owned where reusable
- [ ] The shell defines extension points for queue state, retry state, optimistic rollback, and conflict presentation
- [ ] Product apps supply real cache/persistence semantics; the shell supplies shared presentation and orchestration hooks

#### Mobile (React Native)

- [ ] Connectivity listeners, resume triggers, and background refresh hooks are centralized in shell integrations

### Failure Recovery

#### Common

- [ ] The shell owns reusable handling surfaces for 401, 403, 404, 429, timeout, offline, and dependency failure states
- [ ] Shell fallback policy preserves intended destination, safe back-navigation, and layout stability
- [ ] Product-specific retry semantics, merge logic, and backend policy remain consumer-app responsibilities

## 6. Consumer App Contract

### What The App Must Supply

#### Common

- [ ] Route map and business destinations
- [ ] Auth/session implementation
- [ ] Permission and feature-flag implementation
- [ ] Tenant configuration and product branding inputs
- [ ] Data services, caching policy, sync policy, and persistence strategy
- [ ] Analytics events, product glossary, and product copy
- [ ] Domain wrappers, product screens, and workflows

### What The App Must Not Do

#### Common

- [ ] Re-implement shell-owned providers, hosts, or scaffolds without a documented exception
- [x] Import private shell internals
- [ ] Push domain logic back into the DS or shell package
- [ ] Bypass shell-owned notification, permission, or failure boundaries when a shared pattern already exists

## 7. Shell Verification & Release Gates

### Verification

#### Common

- [x] Shell provider stack has automated smoke coverage
- [x] Shell scaffolds and adapters are exercised with mocked consumer inputs
- [ ] DS package upgrades trigger shell compatibility checks before consumer apps adopt them
- [ ] Deep-link, auth-expiry, denied-state, offline, and reconnect shell flows are covered end to end
- [ ] Large-text, RTL, reduced-motion, tablet, and degraded-network scenarios are part of shell verification

#### Mobile (React Native)

- [ ] Native shell flows run on both iOS and Android in CI where supported
- [ ] Background/foreground, biometric, push-tap, and restore-state flows have dedicated shell coverage where supported

### Release Discipline

#### Common

- [ ] Shell changes publish migration notes for consumer apps
- [ ] Breaking changes require versioned release notes and deprecation guidance
- [ ] Shell docs stay aligned with public entrypoints and adapter contracts
- [x] Each consumer app keeps a derived checklist for app-specific wiring and rollout
