# Observability And Telemetry Runbook

Status: active Phase 5 operability contract.

## Sink

The selected application sink is the release telemetry bridge exposed through
`src/utils/logger.ts`.

- Native/bootstrap code installs the concrete sink with `setTelemetrySink(...)` or
  `globalThis.__EASYSTOCK_TELEMETRY_SINK__`.
- `logger.warn`, `logger.error`, and `logger.telemetry` forward redacted events to the sink.
- `logger.debug` and `logger.info` keep development console behavior only.
- Every sink event includes `level`, `message`, `release`, `timestamp`, redacted `meta`, and redacted
  error name/message when present.

## Redaction

The logger redacts phone numbers, GSTINs, bearer tokens, auth tokens, names, addresses, email,
passwords, and secret-like fields before events leave the process. New telemetry fields must prefer
counts, booleans, enum names, and coarse workflow state over business payloads.

## Required Events

Critical release-health events:

- `auth.sign_in.success`
- `auth.sign_in.failure`
- `auth.token_refresh.success`
- `auth.token_refresh.failure`
- `invoice.create.success`
- `invoice.create.failure`
- `payment.record.success`
- `payment.record.failure`
- `stock.operation.success`
- `stock.operation.failure`
- `offline_queue.full`
- `offline_queue.replay_started`
- `offline_queue.replay_failure`
- `offline_queue.dead_letter`
- `offline_queue.replay_completed`
- `offline_queue.storage_error`
- `offline_queue.dead_letter_ttl_cleanup`
- `offline_queue.dead_letter_retry_all`
- `test:seed:reset:*` destructive-operation structured logs
- `update-design-system-baseline` destructive-operation structured logs

## Dashboards

Release dashboards must show, by release tag:

- Auth failure rate and token-refresh failure rate.
- Offline queue backlog, queue-full count, dead-letter count, and storage write failures.
- Invoice-create success/failure count.
- Payment-record success/failure count.
- Stock-operation success/failure count.
- Destructive script attempts grouped by project ref and operation.

## Alerts

Page the Reliability owner for:

- Any `offline_queue.storage_error`.
- Any `offline_queue.dead_letter` spike above the previous 7-day baseline.
- Token-refresh failures above 2 percent for a release over 15 minutes.
- Invoice-create or payment-record failures above 1 percent for a release over 15 minutes.
- Any destructive script attempt against a non-allowlisted project.

## Ownership

- Reliability owner: dashboard health, alert routing, incident handoff.
- Platform owner: logger and sink bridge.
- App Architecture owner: workflow event naming consistency.
- Release / QE owner: release dashboard review before rollout.
