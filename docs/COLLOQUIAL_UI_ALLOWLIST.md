# Colloquial UI Styling — Allowlist

This file is the **only** sanctioned place for temporary exceptions to the styling rules defined in `COLLOQUIAL_UI_STYLING_REMEDIATION_PLAN.md`.

## Process

1. Each entry must include: file path, line reference, the rule being broken, and a ticket/PR reference.
2. Exceptions are reviewed and removed as the relevant phase completes.
3. No exception may block a phase from being marked done — it must have a tracked follow-up.

## Current exceptions

| File                                   | Line  | Rule                                    | Rationale                                                                                                                                                    | Follow-up                      |
| -------------------------------------- | ----- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| `app/(app)/finance/payments/[id].tsx`  | `181` | Direct top-level `ScrollView` in `app/` | Retained temporarily because the screen has a sticky bottom action bar; converting to `Screen scrollable` with the current API would make the footer scroll. | `phase-5-finance-shell-sticky` |
| `app/(app)/finance/purchases/[id].tsx` | `257` | Direct top-level `ScrollView` in `app/` | Retained temporarily because the screen has a sticky bottom action bar; converting to `Screen scrollable` with the current API would make the footer scroll. | `phase-5-finance-shell-sticky` |
