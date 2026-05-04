# Security Audit Baseline

Status: P0 security scanning gate baseline.

Date: 2026-05-04

## Commands Run

```sh
npm audit --audit-level=high --json
npm audit fix --dry-run
npm audit fix --package-lock-only --dry-run --legacy-peer-deps
npm ls lodash node-forge xlsx handlebars xmldom picomatch postcss uuid --depth=4
```

## Baseline

`npm audit --audit-level=high --json` reported 29 total vulnerabilities:

- critical: 1
- high: 5
- moderate: 19
- low: 4

High or critical packages in the current dependency graph:

- `handlebars@4.7.8`, via `ts-jest`, critical and high advisories.
- `lodash@4.17.23`, via `eslint-plugin-i18next`, `jest-expo`, `jest-image-snapshot`, and `react-native-chart-kit`.
- `node-forge@1.3.3`, via Expo CLI code signing packages.
- `@xmldom/xmldom<=0.8.12`.
- `picomatch` vulnerable ranges through dev tooling.
- `xlsx@0.18.5`, direct dependency with no npm audit fix available.

## Fix Attempt Result

`npm audit fix --dry-run` without legacy peer handling failed before proposing a lockfile change because the current install graph has a peer conflict between `react@19.1.0` and `react-dom@19.2.5`.

`npm audit fix --package-lock-only --dry-run --legacy-peer-deps` completed resolution without writing files, but the audit still reported 27 vulnerabilities. Several proposed fixes require major or incompatible package movements, including Expo downgrades, Jest Expo downgrades, or Node engine changes beyond the local `v20.15.0` runtime.

No package-lock changes were applied in this P0 pass because forcing the resolver would mix the security gate with unrelated Expo/React dependency migrations.

## Tracking Decisions

- `xlsx`: replace or isolate import/export parsing before the next release branch because npm audit reports no fix available.
- `handlebars`: track through `ts-jest`; do not expose template compilation to untrusted input.
- `lodash`: upgrade through owning packages or remove vulnerable transitive paths when compatible versions exist.
- `node-forge`: upgrade through Expo CLI/code-signing package chain when Expo SDK compatibility allows it.
- `@xmldom/xmldom`: upgrade the owning chain or add a direct override only after native/e2e compatibility passes.
- `picomatch`: upgrade owning dev tools with script and lint coverage.

## CI Gate

The CI gate now runs `npm run audit:security` and secret scanning. Known vulnerabilities will fail CI until they are fixed or the project introduces an explicit audited exception policy.
