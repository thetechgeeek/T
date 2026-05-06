# Product Release Checklist

Status: Phase 2 product-readiness gate.

Before a release candidate is cut:

- Run `npm run check:runtime-boundaries`; live routes must not import `src/mocks`.
- Run `npm run check:product-surfaces`; product-critical routes must not expose placeholder
  export/share/save/coming-soon actions.
- Search `app/` and `src/features/` for `src/mocks`; any live-navigation surface must be hidden,
  feature-flagged, or wired to real data.
- Verify finance, statutory report, export, save, and share actions are either real or visibly
  unavailable.
- Review `docs/PRODUCT_SURFACE_INVENTORY.md` and confirm product-owner sign-off for any beta or
  unavailable surface intentionally exposed.
- Coming-soon surfaces must not expose operational-looking export/save/share controls.
- Beta surfaces must show a beta/unavailable state rather than completed workflow affordances.
- Confirm the EAS profile and update channel using `docs/RELEASE_CHANNELS_AND_EAS_PROFILES.md`.
- Critical money, stock, ledger, compliance, import/export, and auth-adjacent writes must follow
  `docs/CRITICAL_WRITE_POLICY.md`.
- Route files over the review budget must have a feature-extraction plan in
  `docs/ROUTE_FILE_BUDGET.md` or a documented exception.
