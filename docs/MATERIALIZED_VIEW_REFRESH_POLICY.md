# Materialized View Refresh Policy

Status: active Phase 6 performance/reliability contract.

## Current State

`refresh_ledger_summaries()` refreshes `customer_ledger_summary` and `supplier_ledger_summary`
materialized views concurrently. It is called from invoice and payment RPC hot paths in
`supabase/migrations/021_refresh_summaries_in_rpcs.sql` and later invoice RPC replacements.

## Risk

Synchronous refresh keeps summaries fresh but can create lock contention or elevated latency during
concurrent invoice creation and payment recording.

## Decision

Keep synchronous refresh until measured contention crosses the alert threshold. The rollback plan is
to replace hot-path calls with deferred refresh through a scheduled job or queue while reads tolerate
stale summaries.

## Measurement

Before changing refresh semantics, measure:

- concurrent invoice creation latency,
- concurrent payment recording latency,
- refresh duration,
- lock waits on the two materialized views,
- dashboard freshness impact.

Add telemetry around refresh duration before keeping synchronous refresh for a high-volume release.
