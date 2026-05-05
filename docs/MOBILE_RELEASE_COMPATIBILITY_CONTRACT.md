# Mobile Release Compatibility Contract

Status: active Phase 5 release contract.

## Supported Window

The backend must support:

- the currently released mobile build,
- the previous rollback build,
- the active release-candidate build.

The minimum overlap window is 30 days after a new mobile release reaches general availability.

## Backend Change Rules

- Schema changes must be additive across the supported window.
- Columns used by supported clients must not be dropped, renamed, narrowed, or made newly required
  without a compatibility shim.
- RPC changes must preserve the current versioned function and one rollback version.
- New RPC behavior should be introduced through a new versioned alias when request or response shape
  changes.
- Deprecated RPCs need owner, deprecation date, migration notes, and retirement approval from Data
  and Release / QE owners.

## Compatibility Suite

Previous-supported-client smoke tests must cover:

- auth/session startup,
- persisted-store hydration,
- invoice creation,
- payment recording,
- stock mutation,
- invoice detail loading,
- dashboard load.

The current automated proxy is `.maestro/critical/` plus seeded integration tests. A real previous
binary smoke run is required before backend changes that alter schema, RPCs, auth, or persisted data.

## Backend Migration PR Checklist

Every backend migration PR must answer:

- Is the change additive for the supported mobile window?
- Which mobile builds were smoke-tested?
- Are current and rollback RPC aliases preserved?
- Are any RPCs deprecated, and do they have owner/date/migration notes?
- Does persisted-store hydration still work for the previous build?
- Is the rollback or recovery path documented?
