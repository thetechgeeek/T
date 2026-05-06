# Dependency Update Policy

Status: active supply-chain policy.

Dependabot owns weekly npm and GitHub Actions update detection through `.github/dependabot.yml`.

## Grouping

- Low-risk npm patch updates are grouped when they are not Expo, React, React Native, or native
  runtime packages.
- Expo, React, React Native, and `@react-native*` patch updates are grouped separately as native
  runtime changes.
- Major Expo, React, and React Native updates are intentionally not grouped so each lands as its own
  reviewed PR.

## Merge Requirements

- Dependency PRs require CI green before merge.
- Native dependency PRs require release-note review, device/e2e risk notes, and design-system budget
  review when they add or move UI/runtime packages.
- Security dependency PRs follow `docs/SECURITY_AUDIT_BASELINE.md` SLAs.

## Native Dependency Budget

Any new dependency used by app runtime, design-system runtime, or native build tooling must document:

- owning team,
- user-facing capability,
- bundle/native impact,
- maintenance status,
- replacement or removal plan if the package becomes abandoned.
