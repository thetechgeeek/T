# Release Channels And EAS Profiles

Status: active release-build contract.

`eas.json` defines three build profiles:

| Profile       | Channel       | Distribution  | Runtime mode  | Dev client |
| ------------- | ------------- | ------------- | ------------- | ---------- |
| `development` | `development` | internal      | `dev`         | yes        |
| `preview`     | `preview`     | internal      | `integration` | no         |
| `production`  | `production`  | store/default | `production`  | no         |

## Environment Requirements

Every EAS build must provide public Supabase runtime values through the EAS environment or secret
store:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

The profile sets only mode identifiers:

- `APP_CONFIG_MODE`
- `EXPO_PUBLIC_APP_ENV`

The production profile must not enable development-client behavior. Development-client behavior is
confined to the `development` profile.

## Release Checklist Gate

Before promoting a build:

- Confirm the EAS profile and update channel match the release intent.
- Confirm production uses production Supabase public runtime values.
- Confirm preview uses integration/test Supabase public runtime values.
- Run the CI `validate`, backend integration, critical Maestro, and design-system proof jobs.
