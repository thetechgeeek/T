# Offline Queue Operations

Status: active Phase 5 reliability contract.

## Current Storage Model

`src/services/writeQueueService.ts` persists pending mutations, dead-letter mutations, and replay
diagnostics in AsyncStorage. Queue operations are single-threaded by convention: callers must not run
multiple replay loops at the same time. AsyncStorage writes are not transactional, so a future
multi-writer queue must move to SQLite or another transactional local store.

## User-Visible Failures

- `WRITE_QUEUE_FULL`: show the error user message and ask the user to reconnect before making more
  offline changes.
- `WRITE_QUEUE_STORAGE_ERROR`: show the error user message and ask the user to free device storage
  before retrying.
- Dead-letter entries: expose `getSupportSnapshot()` in support tooling so support can see mutation
  ids, table names, retry counts, and last safe error without payload PII.

## Diagnostics

The queue persists:

- `lastReplayStartedAt`
- `lastReplayCompletedAt`
- `lastReplayError`
- `lastReplayErrorAt`
- `lastStorageError`
- `lastStorageErrorAt`
- `lastDeadLetterAt`
- `lastQueueFullAt`
- live pending and dead-letter counts

Diagnostics are best-effort and must not block queue recovery.

## Retention

Dead-letter entries are retained for 7 days. `clearExpiredDeadLetters()` runs before replay and can
also be invoked by support tooling.

## Transactional Storage Evaluation

Keep AsyncStorage while the app has one replay loop and small mutation payloads. Re-evaluate before
adding background sync, parallel replay, queue encryption/signing, or large import/export mutations.
The preferred replacement is a transaction-capable local database with atomic status transitions.
