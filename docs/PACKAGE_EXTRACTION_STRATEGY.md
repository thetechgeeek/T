# Package Extraction Strategy

Status: active Phase 1 decision record.

## Decision

`src/design-system` and `src/ui-shell` are real private workspace packages with extraction intent.
They remain source-based React Native workspaces for now, not published artifacts. Their package
manifests, `exports`, root workspace entries, TypeScript paths, and Jest mappers are the current
contract.

`examples/ops-console` is a proof fixture and second-consumer smoke target, not a production app.
It exists to prove that the public package entrypoints can be consumed without app-private imports.

## Enforcement

- Consumers import `@easydesign/design-system`, `@easydesign/design-system/foundation`, and
  `@easydesign/ui-shell`.
- Consumers must not import private package internals such as `@easydesign/ui-shell/*` or
  `@/src/design-system/*`.
- Design-system source uses relative imports internally and must not depend on product app, store,
  service, feature, hook, or legacy theme layers.
- UI shell source may depend on public design-system entrypoints but not product app layers.
- ESLint enforces import boundaries where static import syntax is enough.
- Remaining script checks are limited to package manifests, generated files, docs that describe
  release process, visual proof, and source patterns that ESLint cannot express yet.

## Build Outputs

No compiled package output is required in Phase 1 because the Expo app consumes source workspaces.
Add package build output or TypeScript project references before publishing, versioning outside the
repo, or supporting a non-Expo consumer.

## Token Provenance

The design-system foundation is the owner of generated token artifacts under
`src/design-system/foundation/theme/generated`. The legacy mirror under `src/theme/generated` exists
only for compatibility during migration and should not be treated as the source of truth.

## Extraction Exit Criteria

- Package `exports` cover all public APIs needed by app and proof consumers.
- Root app, ui-shell, and ops-console import through package names only.
- Package source has no product app, store, service, or route imports.
- Generated token provenance points from foundation to mirrors, never the reverse.
- Package release notes and migrations exist only for changes that affect public consumers.
- Custom scanners shrink as ESLint, package `exports`, and TypeScript project references take over.
