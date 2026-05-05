# Configuration Contract

Status: active Phase 1 platform contract.

## Modes

Every runtime command resolves exactly one mode:

- `dev` - local app runtime and Expo development.
- `test` - Jest unit/runtime tests that must not require app or integration credentials.
- `integration` - Jest integration tests that hit the Supabase test project.
- `e2e` - Expo and Maestro device tests against seeded Supabase test data.
- `ci` - non-device CI jobs that need deterministic checks.
- `production` - release builds and production runtime.

`APP_CONFIG_MODE` and `EXPO_PUBLIC_APP_ENV` must not disagree with the command mode. Mixed mode
variables fail before app modules load.

## App Runtime

The app reads only public Expo variables:

- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

`src/config/runtimeConfig.ts` validates these values and `src/config/supabase.ts` fails fast if either
Supabase value is missing. App runtime code does not fall back to `SUPABASE_TEST_*`.

## Node Script Runtime

Node scripts use `scripts/lib/script-config.cjs` for mode resolution, `.env.test` loading, and
fail-fast validation. The e2e and integration adapters are the only places where
`SUPABASE_TEST_*` may be mapped into `EXPO_PUBLIC_*`, and they reject conflicting public/test values.

## Test Credentials

Real test credentials live outside the repository:

- Local: `.env.test`, ignored by git.
- CI: GitHub Actions secrets named `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY`,
  `SUPABASE_TEST_SERVICE_ROLE_KEY`, `SUPABASE_TEST_PROJECT_REF_ALLOWLIST`,
  `INTEGRATION_TEST_EMAIL`, and `INTEGRATION_TEST_PASSWORD`.

`.env.example` contains safe placeholders only.

## Execution Contexts

| Context          | Config owner                                                       | Required env                                                 | Notes                                                                               |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Unit Jest        | `jest.config.js` + `jest.setup.ts`                                 | none for pure unit tests                                     | Unit setup does not load `.env.test`.                                               |
| Integration Jest | `jest.integration.config.js` + `__tests__/utils/integrationEnv.js` | `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY`                | Adapter maps test values before app imports.                                        |
| Expo e2e         | `scripts/run-expo-e2e.mjs`                                         | `SUPABASE_TEST_*` or matching `EXPO_PUBLIC_*`                | Runs with `EXPO_NO_DOTENV=1`.                                                       |
| Maestro e2e      | `scripts/run-maestro-suite.mjs`                                    | e2e env plus integration user credentials                    | Uses PATH discovery and supports `--dry-run`.                                       |
| Seed reset       | `scripts/test-seed-reset.mjs`                                      | test Supabase, integration user env, allowlisted project ref | Uses service role only when explicitly provided and blocks production-like targets. |

## Verification

- `src/config/supabase.test.ts` proves the app runtime does not fall back to `SUPABASE_TEST_*`.
- `__tests__/scripts/script-config.test.ts` proves missing, conflicting, and mixed-mode script env
  fails clearly.
- `__tests__/utils/integrationEnv.js` keeps integration env mutation in Jest setupFiles instead of
  `jest.integration.config.js`.
