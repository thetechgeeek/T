# Platform Tooling Runbook

Status: active Phase 1 tooling contract.

## Entry Point

Use `node scripts/tooling.mjs <command> [...args]` for repo-owned checks, generators, e2e runners,
and seed commands. `package.json` scripts route through this entrypoint so new platform commands can
be added by extending one manifest instead of adding another package-script shape.

Useful commands:

- `node scripts/tooling.mjs --list`
- `node scripts/tooling.mjs --dry-run check:routes --json`
- `node scripts/tooling.mjs e2e:expo start --dev-client --localhost --port 8088`
- `node scripts/tooling.mjs e2e:maestro test .maestro/critical/`

## Shared Library

`scripts/lib/repo-tools.mjs` owns repository-root discovery, CLI helpers, env loading, filesystem
walking, command execution, prerequisite checks, violation formatting, JSON output, and dry-run
helpers.

`scripts/lib/script-config.cjs` owns mode-explicit script config. App runtime config lives in
`src/config/runtimeConfig.ts`; both use the same mode names and fail-fast behavior.

## Local Prerequisites

All local executable discovery must use `PATH`.

| Tool                     | Required for                               | Check                                       |
| ------------------------ | ------------------------------------------ | ------------------------------------------- |
| Node 20                  | all scripts                                | `node --version`                            |
| npm                      | dependency scripts                         | `npm --version`                             |
| Expo CLI through `npx`   | e2e app launch                             | `npx expo --version`                        |
| Maestro                  | device e2e and native design-system proof  | `maestro --version`                         |
| Xcode command line tools | iOS simulator automation                   | `xcrun simctl list devices`                 |
| Android SDK tools        | Android e2e                                | `sdkmanager --version` and emulator in PATH |
| Docker                   | Supabase local pgTAP or local stack checks | `docker --version`                          |

Scripts must not source `~/.nvm/nvm.sh`, call `/opt/homebrew/bin/maestro`, call `/usr/bin/open`, or
discover tools through `bash -lc command -v`. macOS-only simulator commands must check
`process.platform === 'darwin'`.

## Non-Interactive Behavior

- Seed reset no longer shells out to `npx supabase` to fetch hidden service-role credentials.
- If `SUPABASE_TEST_SERVICE_ROLE_KEY` is present, seed reset uses it.
- Otherwise seed reset signs in as the integration test user and uses the authenticated fallback.
- Missing tools and missing env produce direct, actionable errors.

## Dry Run

Use `--dry-run` before the platform command for dispatcher-level dry runs:

```sh
node scripts/tooling.mjs --dry-run e2e:maestro test .maestro/critical/
node scripts/tooling.mjs --dry-run proof:design-system --platform ios --update-baseline
```

The e2e Expo runner, Maestro suite, design-system proof runner, visual baseline updater, and seed
reset also understand child-level `--dry-run` when called directly.

## CI Parity

CI installs prerequisites explicitly in `.github/workflows/ci.yml`; local scripts should assume only
PATH and documented env. Any new prerequisite must update this runbook, `.env.example` if env is
needed, and the relevant CI job before the checklist item can be closed.
