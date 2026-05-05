# Backup, Restore, And Incident Response Runbook

Status: active Phase 5 reliability contract.

## Targets

| Data class                               | RPO                              | RTO                                   |
| ---------------------------------------- | -------------------------------- | ------------------------------------- |
| Business tables                          | 15 minutes                       | 4 hours                               |
| Auth/session recovery                    | Supabase managed                 | 4 hours for user-access restoration   |
| Materialized summaries and derived views | Rebuildable from business tables | 1 hour                                |
| Local mobile caches                      | Server-refetchable               | Next app launch after server recovery |

## Incident Severity

- SEV1: data loss, auth outage, payment/invoice creation outage, or restore blocked.
- SEV2: degraded sync, dead-letter spike, materialized summary corruption, or compatibility break
  with previous supported mobile build.
- SEV3: isolated workflow regression with support workaround.

## Owners

- Incident commander: Reliability owner.
- Database restore lead: Data owner.
- Mobile release lead: Release / QE owner.
- Security/privacy lead: Security owner when customer data exposure is possible.

## Backup Runbook

1. Confirm latest Supabase automated backup and WAL/PITR availability.
2. Export affected business tables before manual repair.
3. Record backup timestamp, project ref, operator, and reason.
4. Freeze destructive scripts unless the incident commander approves.

## Restore Runbook

1. Declare target restore timestamp and affected tables.
2. Restore to a staging project first.
3. Run seeded smoke checks and reconciliation queries.
4. Compare invoice totals, stock balances, payments, and audit logs.
5. Promote restore or apply table-level repair only after Data owner approval.

## Bad Migration Rollback

1. Stop further backend deploys.
2. Identify migration number, data impact, and affected clients.
3. Prefer forward recovery migration over destructive down migration.
4. Restore from backup only when forward repair cannot preserve correctness.
5. Run previous-client smoke tests before reopening rollout.

## Bad Mobile Build Response

1. Pause rollout in the app stores.
2. Keep backend compatible with the previous supported build.
3. Use feature flags or additive backend shims before requiring a hotfix.
4. Publish support guidance for affected workflows.

## Corrupted Derived Data

1. Leave source business tables untouched.
2. Re-run `refresh_ledger_summaries()`.
3. Reconcile invoice totals, payments, outstanding customer totals, and stock balances.
4. If derived data remains wrong, escalate to Data owner for a forward repair migration.

## Customer Data Correction

Support-safe corrections must:

- identify the customer-visible symptom,
- preserve original audit evidence,
- use a reversible update where possible,
- record operator, timestamp, before/after values, and customer approval when applicable.

## Restore Drill Evidence

First drill target: staging restore from latest backup before the next release branch.

Record:

- date,
- environment/project ref,
- restore timestamp,
- commands or console actions,
- smoke-test result,
- reconciliation result,
- follow-up issues.

Cadence: quarterly.
