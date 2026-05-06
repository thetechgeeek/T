# Peer Dependency Exceptions

Status: temporary CI exception register.

Review date: 2026-06-30

## Current CI Usage

`npm ci --legacy-peer-deps` appears in seven CI install steps:

- `validate`
- `backend-integration`
- `maestro-critical-ios`
- `maestro-critical-android`
- `design-system-ios`
- `design-system-android`
- `nightly-full-suite`

Each usage is commented in `.github/workflows/ci.yml` and remains a temporary Expo/React Native
ecosystem exception, not a permanent default.

## Local Non-Legacy Install Probe

Run on 2026-05-06:

```sh
npm ci --dry-run
```

Observed blockers:

- Local Node was `v20.15.0`, while current React Native, Metro, Stylelint, and Lint Staged packages
  require newer Node 20 patch levels such as `>=20.17`, `>=20.18.1`, `>=20.19.0`, or `>=20.19.4`.
- The lockfile was already out of sync for `react-dom@19.2.5` and `scheduler@0.27.0`.
- The prior audit baseline also observed resolver pressure around React 19 and React DOM.

CI now pins Node `20.19.4` so engine warnings do not mask the remaining package graph work.
`npm ci --dry-run --legacy-peer-deps` succeeds locally after the `xlsx` removal, with only the local
Node patch-level engine warnings remaining.

## Disposition

| Area                         | Decision                                                                                       | Owner           | Expiry     |
| ---------------------------- | ---------------------------------------------------------------------------------------------- | --------------- | ---------- |
| Expo/React Native peer graph | Treat as ecosystem noise until SDK/runtime upgrade plan is ready.                              | @platform-owner | 2026-06-30 |
| Lockfile drift               | Resolve before removing `--legacy-peer-deps`; `npm ci` remains the lockfile integrity gate.    | @platform-owner | 2026-06-30 |
| Security audit fixes         | Do not combine peer resolver changes with audit fixes unless the PR includes native/e2e proof. | @security-owner | 2026-06-30 |

The exception can be removed only after `npm ci --dry-run` succeeds without `--legacy-peer-deps` on
the pinned CI Node version and the full PR validation suite passes.
