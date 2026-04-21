# UI Package Extraction Readiness

This document tracks when the EasyDesign UI packages are ready to leave this repo and move into a separate repo.

## Required Readiness Gates

- Root `package.json` declares workspaces for the reusable UI packages and example consumers.
- Consumers use public entrypoints only: `@easydesign/design-system`, `@easydesign/design-system/foundation`, and `@easydesign/ui-shell`.
- `npm pack --dry-run` succeeds for `@easydesign/design-system` and `@easydesign/ui-shell`.
- The inventory app passes as the first real consumer.
- A second consumer exists and stays green through public entrypoints only.
- Release discipline, migration notes, and package docs are in place before extraction.

## Current Consumer Proof

- Inventory app proves the shell against real auth, connectivity, sync, notifications, and route wiring.
- Ops Console proves a second consumer with different tenant, permissions, flags, deep-link policy, and notification behavior.

## Remaining Before A Separate Repo

- CI publishing and version promotion should move from repo-local scripts to package-specific workflows.
- Consumer-app adoption notes should live beside package releases, not only in this app repo.
- Once the guardrails, `npm pack`, and consumer smoke tests stay green for repeated releases, the UI packages are ready for a separate repo.
