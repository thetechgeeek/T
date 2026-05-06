# Security Audit Baseline

Status: P0 security scanning gate baseline.

Date: 2026-05-06

## Commands Run

```sh
npm audit --audit-level=high --json
npm ls lodash node-forge handlebars @xmldom/xmldom picomatch postcss --depth=4
npm ci --dry-run
```

## Baseline

`npm audit --audit-level=high --json` reported 16 total vulnerabilities:

- critical: 1
- high: 4
- moderate: 6
- low: 5

High or critical packages in the current dependency graph:

- `handlebars@4.7.8`, via `ts-jest`, critical and high advisories.
- `lodash@4.17.23`, via `eslint-plugin-i18next`, `jest-expo`, `jest-image-snapshot`, and
  `react-native-chart-kit`.
- `node-forge@1.3.3`, via Expo CLI code-signing packages.
- `@xmldom/xmldom@0.8.11`, via `@expo/plist`.
- `picomatch` vulnerable ranges through Expo/Jest/dev tooling.
- `postcss@8.4.49`, via Expo Metro and Stylelint parser chains.

`xlsx@0.18.5` was removed from direct dependencies and the live inventory import/export flows now
use CSV utilities instead of SheetJS.

## Compatibility Findings

`npm ci --dry-run` without `--legacy-peer-deps` was still blocked by the existing install graph:

- local Node `v20.15.0` is below several package engine requirements;
- the lockfile is missing `react-dom@19.2.5` and `scheduler@0.27.0` entries expected by the current
  `package.json`;
- the remaining peer suppression is tracked in `docs/PEER_DEPENDENCY_EXCEPTIONS.md`.

CI pins Node `20.19.4` to remove the Node patch-level warning from the signal.

## Tracking Decisions

- `handlebars`: tracked through `ts-jest`; do not expose template compilation to untrusted input.
- `lodash`: upgrade or replace owning packages when compatible versions exist.
- `node-forge`: upgrade through the Expo CLI/code-signing package chain when Expo SDK compatibility
  allows it.
- `@xmldom/xmldom`: upgrade through `@expo/plist` or add a targeted override only after native/e2e
  compatibility passes.
- `picomatch`: upgrade owning dev tools with script and lint coverage.
- `postcss`: upgrade owning Expo/Stylelint chains with web/stylelint coverage.

## SLA

- Critical vulnerabilities: owner assigned within one business day; fix, mitigation, or explicit
  exception within three business days.
- High vulnerabilities: owner assigned within two business days; fix, mitigation, or explicit
  exception within seven business days.

## CI Gate

The CI gate runs `npm run audit:security`, Gitleaks, and CodeQL. Known high/critical findings must
fail CI unless the project adds a linked exception with owner, mitigation, and expiry.
