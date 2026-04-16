# UI Integration Checklist

> Companion to `docs/UI_Library_Checklist.md`.
> The library checklist tracks what the design system can guarantee in isolation.
> This checklist tracks what a consuming app must wire so those guarantees hold in real product flows.
> If an item depends on routing, auth/session, app lifecycle, caching/sync, feature flags, OS permissions, notifications, deep links, or product analytics, it belongs here.

## 0. Ownership & Scope

### Host App Contract

#### Common

- [ ] Product screens compose registered design-system components and patterns instead of hand-rolling bespoke UI
- [ ] App-shell responsibilities live here: routing, auth/session, permissions, feature flags, tenant context, offline orchestration, notifications, deep links, and platform runtime setup
- [ ] Library responsibilities stay in `docs/UI_Library_Checklist.md`: tokens, component contracts, reusable UI blocks, reusable compositions, accessibility/i18n/RTL guarantees, graceful state surfaces, and component-level verification
- [ ] Integration work references the underlying library primitive or pattern before a product-specific wrapper is introduced

## 1. Runtime, Delivery & App Shell

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
- [ ] 60fps maintained during screen transitions and long-list scrolling
- [ ] JS thread usage < 80% during idle
- [ ] Memory: no unbounded growth on navigation cycles
- [ ] Hermes bytecode compilation for faster startup

### Rendering Strategy

#### Web

- [ ] Marketing / Public: Static Generation (SSG)
- [ ] Dashboard / Authenticated: Server-Side Rendering (SSR)
- [ ] Highly dynamic widgets: Client-Side Rendering (CSR) with skeleton
- [ ] Reports / heavy data: deferred with `<Suspense>` + skeleton
- [ ] Progressive enhancement order: task shell → data → brand/media flourish

#### Mobile (React Native)

- [ ] All rendering is client-side (no SSR in RN)
- [ ] Screen-level lazy loading (lazy-load heavy screens)
- [ ] Fabric (New Architecture) enabled for concurrent features and improved threading
- [ ] Progressive enhancement order: screen shell → key data/action → secondary media

### Asset & Bundle Delivery

#### Web

- [ ] JS: route-level code splitting, defer non-critical third-party scripts

#### Mobile (React Native)

- [ ] Asset bundling: only required assets per platform in binary
- [ ] Hermes engine enabled for faster JS execution
- [ ] Metro bundler configuration optimized (inline requires, lazy component loading)
- [ ] App binary size monitored per release (no unbounded growth)
- [ ] JS bundle size tracked per release

### Adaptive App Shell

#### Mobile (React Native)

- [ ] Phone: single-column layout, bottom tab bar, stack navigation
- [ ] Tablet: master-detail split view, sidebar navigation, multi-column forms
- [ ] iPad: `SplitView` / multi-column layout via wide-screen detection
- [ ] Android tablet: adaptive navigation (rail vs. bottom tabs)
- [ ] Orientation lock for specific screens where needed (for example video player or signature capture)
- [ ] Foldable device support (Samsung Fold: inner/outer display handling)
- [ ] iPad multitasking: Split View, Slide Over compatibility
- [ ] Android multi-window / picture-in-picture awareness

## 2. Identity, Access & Tenant Context

### Authentication & Session Patterns

#### Common

- [ ] Auth surfaces may use premium branding moments, but form clarity and recovery paths stay dominant
- [ ] Login and session flows remain fully understandable without illustration or hero media
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

### Permission, Flags & Access Control

#### Common

- [ ] Permission-denied and limited-access states are first-class polished surfaces, not empty dead ends
- [ ] Feature Flag: component/route excluded from render tree when flag off
- [ ] RBAC Role: menu items hidden, CTA replaced with "Request Access"
- [ ] Resource Permission: fields become read-only, action buttons disabled/hidden
- [ ] Field-Level: specific fields hidden or masked (PII, sensitive data)
- [ ] Hidden vs. Disabled: hide if never accessible, disable with explanation if conditionally blocked
- [ ] No optimistic rendering of unauthorized actions — resolve permissions at load time
- [ ] Skeleton shown during flag/permission resolution (no layout shift)
- [ ] Limited-access and masked states maintain the same layout quality, spacing rhythm, and hierarchy as full-access states
- [ ] A/B experiments, gradual rollouts, kill switches via feature flags
- [ ] Flag failure default: documented per flag (off or on)

#### Web

- [ ] Never 404 on permission denial — show "Access Denied" page with CTA
- [ ] RBAC-aware forms: read-only renders `<p>` elements, not disabled `<input>`
- [ ] Flags resolved server-side on SSR, or client-side with `<Suspense>` before render

#### Mobile (React Native)

- [ ] Access Denied screen with navigation back + "Request Access" CTA
- [ ] RBAC-aware forms: read-only renders `<Text>` elements, not disabled `<TextInput>`
- [ ] OS-level permission requests (camera, location, contacts): explanation screen before prompt
- [ ] Permission denied handling: link to device Settings to re-enable
- [ ] Flags fetched on app startup, cached locally
- [ ] Stale flag cache used when network unavailable
- [ ] Flag refresh on app foreground
- [ ] Feature flag cache stale: use last known values

### Sensitive Data Masking

#### Common

- [ ] PII masked by default with "reveal" affordance
- [ ] Reveal action is permission-gated
- [ ] Reveal triggers audit log
- [ ] Consistent masking format: `••••••@gmail.com`, `+1 (***) ***-1234`
- [ ] Masked layouts remain readable and balanced; redaction never collapses card/table alignment

#### Mobile (React Native)

- [ ] Masked values excluded from screen reader announcement until revealed
- [ ] Screenshot prevention on sensitive screens (`FLAG_SECURE` Android / `UIScreen.isCaptured` iOS)

### Multi-Tenancy UI Patterns

#### Common

- [ ] Organization / workspace switcher
- [ ] Tenant-scoped data isolation (visual context of current tenant)
- [ ] Tenant branding (logo, colors applied from tenant config)
- [ ] Tenant branding is applied within guardrails for contrast, accent budget, and surface hierarchy
- [ ] Cross-tenant resource sharing indicators
- [ ] Tenant creation / setup wizard

## 3. Onboarding & Product Activation

### Onboarding & First-Run Experience

#### Common

- [ ] Onboarding may use premium storytelling, but every step has skip, resume, and "show later" paths
- [ ] First-run hero treatments do not become permanent product chrome once the user reaches operational flows
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

## 4. Data, Sync & Runtime Failure Orchestration

### Live Data & Background Work

#### Common

- [ ] Real-time data injection (WebSocket / SSE)

#### Mobile (React Native)

- [ ] Push notifications for long-running job completion
- [ ] App badge count for unread items / pending actions
- [ ] Background fetch for data refresh (`expo-background-fetch` or native module)
- [ ] Job status survives app backgrounding/foregrounding

### Offline & Degraded Mode

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

### Hydration & Rendering Failures

#### Web

- [ ] SSR/SSG hydration mismatch handled gracefully (fallback to client render)
- [ ] Partial hydration failure does not crash page

#### Mobile (React Native)

- [ ] App crash recovery: last known good state restored on relaunch
- [ ] Deep link resolution failure: fallback to home screen with error toast

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

## 5. Product Rollout & App-Level Verification

### Product Terminology

#### Common

- [ ] Product glossary defined (one name per concept)
- [ ] No synonym mixing ("Organization" OR "Workspace", never both)

### Metrics & Adoption Tracking

#### Common

- [ ] Adoption rate: % of product surfaces using DS vs. bespoke components
- [ ] Usage analytics: which components are most/least used
- [ ] a11y debt: violations tracked over time per product surface
- [ ] Bespoke visual exceptions tracked and reduced over time
- [ ] Visual coherence audits run quarterly across flagship flows

#### Web

- [ ] Designer-engineer handoff fidelity: pixel-diff between Figma and live

#### Mobile (React Native)

- [ ] Platform parity score: % of components available on both iOS and Android

### App-Level Performance Tests

#### Web

- [ ] Core Web Vitals via Lighthouse CI (LCP > 2.5s / CLS > 0.1 fails build)

#### Mobile (React Native)

- [ ] Startup time regression tracking (cold start ≤ 2s)
- [ ] Frame rate monitoring during scroll / navigation (60fps target)
- [ ] Memory profiling: no leaks on navigation cycles
- [ ] App binary size tracked per release
- [ ] JS bundle size tracked per release
- [ ] Native dependency count tracked per release

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
