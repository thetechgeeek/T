# UI Package Release Discipline

This document governs releases for `@easydesign/design-system` and `@easydesign/ui-shell`.

## Semantic Versioning

- Use Semantic Versioning for both UI packages.
- Patch releases fix bugs without changing the public contract.
- Minor releases may add APIs, scaffolds, or adapters in a backward-compatible way.
- Major releases are reserved for breaking public API changes or contract resets.

## Required Release Artifacts

Every package release must update:

- `CHANGELOG.md`
- `MIGRATIONS.md`
- package README surface notes when the public API changes
- release notes describing consumer-app impact

## Deprecation Window

- Deprecated APIs keep a documented migration path and explicit removal target.
- The default deprecation window is two minor releases.
- Consumer apps must have a documented compatibility path before removal.

## Compatibility Checks

Before publishing either package, run:

- `npm run check:workspace-packages`
- `npm run check:design-system`
- `npm run check:ui-shell`
- `npm run check:inventory-consumer`
- `npm run check:extraction-readiness`
- targeted Jest coverage for package consumers, including the inventory app and ops-console example

## Consumer App Review

- Consumer apps must review DS and shell release notes before adoption.
- Breaking or behaviorally risky changes require a migration note that names affected consumer apps.
- Inventory-app-specific rollout concerns stay in `docs/INVENTORY_APP_UI_CHECKLIST.md`.
