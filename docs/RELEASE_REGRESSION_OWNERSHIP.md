# Release Regression Ownership

Status: active Phase 5 Release / QE contract.

## Top Critical Paths

1. Login/session startup.
2. Dashboard load.
3. Inventory search/filter.
4. Invoice creation.
5. Invoice detail loading.
6. Customer creation and reopen.
7. Receive payment.
8. Make payment.
9. Purchase drill-down from reports.
10. Logout and local data cleanup.

## Automated Coverage

- `.maestro/critical/00_auth_login.yaml`
- `.maestro/critical/01_dashboard_load.yaml`
- `.maestro/critical/02_inventory_search_filter.yaml`
- `.maestro/critical/03_invoice_create.yaml`
- `.maestro/critical/04_customer_create_open.yaml`
- `.maestro/critical/05_payment_record.yaml`
- `.maestro/critical/06_navigation_smoke.yaml`
- `.maestro/critical/07_auth_logout.yaml`
- Jest workflow tests for invoice creation, payment recording, inventory operations, route constants,
  persisted stores, and write queue diagnostics.

## Manual Release Checklist

Before rollout:

- run the seeded integration suite,
- run iOS and Android critical Maestro suites,
- open invoice detail from a freshly created invoice,
- open purchase detail from reports,
- verify make-payment if not covered by the current critical Maestro set,
- verify previous-supported-client smoke against latest backend,
- review release telemetry dashboard for the current release tag.

## Ownership

Release / QE owns checklist execution. App Architecture owns testability of paths. Reliability owns
telemetry readiness.
