# Security Phase 4 Notes

Date: 2026-05-05

## Auth Session Storage

- Supabase auth persistence now uses `expo-secure-store` through `src/config/secureSupabaseStorage.ts`.
- Existing AsyncStorage-backed sessions are intentionally not migrated because plaintext token migration requires reading the legacy token key and temporarily re-exposing it in JS. Users with old local sessions should re-authenticate after this release.
- Logout clears business-store persistence through `clearPersistedBusinessStores`.

## Local Business Data

- Persisted Zustand stores now minimize local business data:
    - Invoice store persists sanitized filters only.
    - Customer store persists sanitized filters only and drops search text.
    - Inventory store persists sanitized filters only and drops search text.
    - Finance store persists date range only.
    - Dashboard store persists no stats payload.
- Store migrations move older persisted payloads to sanitized version 1 shapes.
- Remaining offline-sensitive surface: write queue payloads still use AsyncStorage. That queue needs signed/encrypted payload work before SEC-004 can be fully closed.

## OTP Attempt Limiting

- `authService.verifyOtp` checks `otpAttemptLimiter` before calling Supabase.
- Failed verification attempts are counted in SecureStore.
- Limit: 5 failed attempts per 15 minutes per phone hash.
- Successful verification resets the attempt counter.
- Backend/provider limits still need to be verified in Supabase auth settings.

## Logging Redaction

- `logger` now redacts known sensitive metadata fields before console or production sink handoff.
- Covered fields include phone, GSTIN, email, address, password, secret, authorization, and access/refresh tokens.
- Nested objects and arrays are redacted recursively.
- Error messages are redacted for phone/GSTIN/Bearer-token patterns.

## Deep Links And Query Guardrails

- Route parameter validation now rejects malformed UUIDs, oversized params, and unknown stock operation types.
- High-risk detail routes now validate params before fetching records.
- Service list queries now cap page size to 100 and reject unsupported sort fields before applying `.order()`.

## Certificate Pinning Decision

- Current decision: documented risk exception for this Expo app until a native pinning library and rotation process are selected.
- Required before closure:
    - Choose platform pinning implementation.
    - Define pin rotation and expiry procedure.
    - Test captive portal, corporate proxy, and Supabase certificate rotation behavior.

## XLSX Dependency

- `xlsx` has been removed from live inventory import/export and from `package.json`.
- Inventory import/export now uses CSV utilities. The design-system productivity demo still contains
  an `xlsx` format label for pattern coverage, but it does not import SheetJS or ship the dependency.
- Required before closure:
    - Confirm any future spreadsheet workbook support uses a maintained package or server-side
      conversion path.
    - Keep CSV import/export tests in place.

## STRIDE And OWASP Closure

- Closed or partially mitigated in code: token storage, local data minimization, OTP throttling, PII logging, route param validation, page-size/sort guards, audit coverage hardening.
- Still open/partial: RLS tenant scoping, signed offline mutations, certificate pinning, secure-screen/root-detection/auto-lock enforcement, full threat-table closure.
