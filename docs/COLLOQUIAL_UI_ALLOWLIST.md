# Colloquial UI Styling — Allowlist

This file is the **only** sanctioned place for temporary exceptions to the styling rules defined in `COLLOQUIAL_UI_STYLING_REMEDIATION_PLAN.md`.

## Process

1. Each entry must include: file path, line reference, the rule being broken, and a ticket/PR reference.
2. Exceptions are reviewed and removed as the relevant phase completes.
3. No exception may block a phase from being marked done — it must have a tracked follow-up.

## Current exceptions

### `check-ui-tokens` staged exceptions

- `app/(app)/settings/expense-categories.tsx:335` — `vertical-scrollview` — internal modal editor body; documented in `docs/SCREEN_SHELL_COOKBOOK.md`; ref: phase-6-enforcement
- `app/(app)/settings/item-categories.tsx:258` — `vertical-scrollview` — internal modal editor body; documented in `docs/SCREEN_SHELL_COOKBOOK.md`; ref: phase-6-enforcement
- `app/(app)/settings/item-units.tsx:256` — `vertical-scrollview` — internal modal editor body; documented in `docs/SCREEN_SHELL_COOKBOOK.md`; ref: phase-6-enforcement
- `app/(app)/inventory/[id].tsx:501` — `vertical-scrollview` — internal special-rate picker inside a modal; ref: phase-6-enforcement
- `app/(app)/finance/payments/make.tsx:168` — `vertical-scrollview` — internal supplier dropdown; ref: phase-6-enforcement
- `app/(app)/finance/payments/receive.tsx:166` — `vertical-scrollview` — internal supplier dropdown; ref: phase-6-enforcement
- `app/(app)/finance/purchases/create.tsx:235` — `vertical-scrollview` — internal supplier and item dropdown bodies; ref: phase-6-enforcement

Phase 5 screen-shell exceptions are documented in `docs/SCREEN_SHELL_COOKBOOK.md` because they are intentional shell patterns, not temporary styling debt.
