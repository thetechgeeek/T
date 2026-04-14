# Colloquial UI Styling — Allowlist (Archived)

Phase 7 archived this file down to the last intentional shell exceptions. These remaining entries are documented design decisions, not unresolved styling debt.

## Process

1. Each entry must include: file path, line reference, the rule being broken, and a ticket/PR reference.
2. Exceptions are reviewed and removed as the relevant phase completes.
3. No exception may block a phase from being marked done — it must have a tracked follow-up.

## Current exceptions (archived residuals)

### `check-ui-tokens` staged exceptions

- `app/(app)/settings/expense-categories.tsx:335` — `vertical-scrollview` — internal modal editor body; documented in `docs/SCREEN_SHELL_COOKBOOK.md`; ref: phase-6-enforcement
- `app/(app)/settings/item-categories.tsx:258` — `vertical-scrollview` — internal modal editor body; documented in `docs/SCREEN_SHELL_COOKBOOK.md`; ref: phase-6-enforcement
- `app/(app)/settings/item-units.tsx:256` — `vertical-scrollview` — internal modal editor body; documented in `docs/SCREEN_SHELL_COOKBOOK.md`; ref: phase-6-enforcement

Phase 5 screen-shell exceptions are documented in `docs/SCREEN_SHELL_COOKBOOK.md` because they are intentional shell patterns, not temporary styling debt.
