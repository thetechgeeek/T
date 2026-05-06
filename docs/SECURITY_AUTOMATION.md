# Security Automation

Status: required PR and release signal.

The repository security gate contains:

- Gitleaks secret scanning for PRs and protected branch pushes.
- CodeQL JavaScript/TypeScript analysis.
- `npm run audit:security`, which runs `npm audit --audit-level=high`.
- `npm ci --legacy-peer-deps` as the current lockfile integrity check until the temporary peer
  exception expires.

GitHub Advanced Security secret scanning should be enabled at the repository settings layer when
available. Gitleaks remains in CI so the control is visible in this repo.

## DAST Decision

DAST is not a default PR gate for the Expo mobile client because the production attack surface is not
a traditional web server. If the project exposes hosted web surfaces, public APIs, or Supabase Edge
Functions with unauthenticated HTTP entry points, add DAST against those deployed endpoints before
release.

## Required Release Signal

No release candidate should be promoted while high or critical audit, SAST, or secret-scan failures
are silently ignored. Exceptions require a linked issue, owner, mitigation, and expiry date.
