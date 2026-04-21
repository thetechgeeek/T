# Inventory App UI Checklist

> Consumer-app companion to `docs/UI_Integration_Checklist.md`.
> `UI_Integration_Checklist.md` defines the reusable shell contract.
> This file tracks what the inventory app itself must still own and verify.

## 0. Domain Ownership

- [x] Route map, route guards, and business destinations stay app-owned
- [x] Auth/session implementation is supplied by the inventory app
- [x] Permission and feature-flag policy is supplied by the inventory app
- [x] Tenant/business profile configuration is supplied by the inventory app
- [x] Product glossary, analytics taxonomy, and domain copy stay app-owned

## 1. Data & Runtime Wiring

- [x] Services, repositories, caching policy, sync policy, and persistence strategy stay app-owned
- [x] Shell adapters receive real app implementations for auth, connectivity, sync state, and navigation callbacks
- [x] App-specific error handling, retry semantics, and merge/conflict policy remain outside `src/ui-shell`

## 2. Screen Composition

- [x] Product screens compose `src/ui-shell` and `src/design-system` through public entrypoints only
- [x] Inventory-only wrappers and domain organisms stay in `app/components` or feature-local modules
- [x] No product screen imports private shell internals or DS implementation files

## 3. Consumer Verification

- [ ] App smoke flows cover auth, tab shell, inventory CRUD, invoices, and settings using the extracted shell
- [ ] App rollout validates long text, RTL, reduced motion, offline, and tablet layouts with real inventory workflows
- [x] DS and shell upgrades are reviewed against inventory-specific routes, copy, and data flows before release
