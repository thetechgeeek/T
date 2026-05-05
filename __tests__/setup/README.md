# Jest Setup Layers

- `jest.setup.ts` is the unit-test entrypoint and imports `unitRuntimeSetup.ts`.
- `unitRuntimeSetup.ts` contains React Native, router, i18n, console-noise, and default Supabase
  mocks for Jest unit and UI tests. It intentionally does not load `.env.test`.
- `__tests__/utils/integrationEnv.js` maps integration Supabase test credentials before app runtime
  modules load.
- `__tests__/utils/integrationSetup.ts` is the integration-only after-env setup and does not install
  the unit runtime mocks.
- Visual helpers live under `__tests__/visual/setup`.
- Device e2e setup lives in `scripts/run-expo-e2e.mjs`, `scripts/run-maestro-suite.mjs`, and
  `.maestro/`.
