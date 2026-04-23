# Zero-Manual Regression Gate

This repo treats fixed workflow regressions as merge blockers.

## What fails Jest now

- Any unexpected `console.error`
- Any unexpected `console.warn`
- Unhandled promise rejections
- Uncaught exceptions
- React loop / effect churn errors such as `Maximum update depth exceeded`

Tests that intentionally trigger these paths must opt in with:

- `allowExpectedConsoleError(...)`
- `allowExpectedConsoleWarn(...)`

## Core workflow coverage

Primary workflow tests should use real screens plus real Zustand stores.
Mock the service boundary, not the store hook.

Critical screen ownership targets enforced in `jest.config.js`:

- `app/(auth)/login.tsx`
- `app/(app)/(tabs)/inventory.tsx`
- `app/(app)/(tabs)/invoices.tsx`
- `app/(app)/customers/`
- `app/(app)/invoices/`
- `app/(app)/finance/payments/`

## Deterministic backend contract

Use the dedicated Supabase test project only.

Scripts:

- `npm run test:seed:reset`
- `npm run test:seed:verify`
- `npm run test:integration`

`test:seed:reset` will use `SUPABASE_TEST_SERVICE_ROLE_KEY` when present.
If it is missing, it falls back to fetching the service-role key through the Supabase CLI for the linked test project, and finally to an authenticated integration-user reset path when table policies allow it.

`test:integration` verifies seeded state before running the real backend suite.

## Device workflow gates

Required PR flows live in `.maestro/critical/`:

- auth login/logout
- dashboard load
- inventory search/filter
- invoice creation
- customer create/open
- payment record
- navigation smoke

Full exploratory device coverage remains in `.maestro/`.

## Local merge gate

Run:

```bash
npm run test:pr
```

## Regression rule

Every production bug in a user workflow must land with:

1. The lowest-level regression test that would have caught it.
2. A live screen or device workflow test if the bug touched a critical path.
