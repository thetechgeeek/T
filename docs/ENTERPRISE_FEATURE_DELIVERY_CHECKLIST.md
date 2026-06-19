# Enterprise Feature Delivery Checklist

This checklist is a product-agnostic template for building complex features end to end. Use it for any feature that can affect users, money, data integrity, privacy, compliance, or operational load.

The goal is not to create paperwork. The goal is to make feature intent, user journeys, engineering behavior, risk, coverage, rollout, and ownership explicit before production users discover the gaps.

## How To Use

- Create one checklist per significant feature or initiative.
- Keep links to the PRD, design, technical design, test plan, rollout plan, and dashboards.
- Mark each item as one of:
    - `[ ]` Not started
    - `[~]` In progress or partially covered
    - `[x]` Done
    - `[n/a]` Not applicable with a short reason
- A feature is not ready for broad rollout until all P0/P1 items are either `[x]` or explicitly accepted as risk.

## Feature Header

- [ ] Feature name:
- [ ] Feature owner:
- [ ] Engineering owner:
- [ ] Design owner:
- [ ] QA or test owner:
- [ ] Support owner:
- [ ] Target users or personas:
- [ ] Launch date or release train:
- [ ] Feature flag name:
- [ ] Rollback owner:
- [ ] Status: discovery / design / build / test / dogfood / canary / rollout / complete

## 1. Product Definition

### PRD

- [ ] Problem statement is clear.
- [ ] Target personas are named.
- [ ] User pain or business opportunity is backed by evidence.
- [ ] Scope is explicit.
- [ ] Non-goals are explicit.
- [ ] Assumptions are listed.
- [ ] Dependencies are listed.
- [ ] Open questions are tracked.
- [ ] Stakeholders have reviewed the PRD.

### Requirements

- [ ] Functional requirements are written as observable behaviors.
- [ ] Required user actions are listed.
- [ ] Required system actions are listed.
- [ ] Required validation rules are listed.
- [ ] Required error handling behavior is listed.
- [ ] Required permissions or roles are listed.
- [ ] Required data retention or audit behavior is listed.
- [ ] Backward compatibility expectations are listed.

### Success Metrics

- [ ] Primary success metric is defined.
- [ ] Secondary metrics are defined.
- [ ] Guardrail metrics are defined.
- [ ] Baseline values are known or scheduled to be measured.
- [ ] Expected improvement or acceptable range is defined.
- [ ] Metric owner is named.
- [ ] Metric dashboard is linked.

### Edge-Case Policies

- [ ] Duplicate data policy is defined.
- [ ] Partial failure policy is defined.
- [ ] Offline or retry policy is defined.
- [ ] Auth expiration policy is defined.
- [ ] Stale data policy is defined.
- [ ] Data conflict policy is defined.
- [ ] Deletion or reversal policy is defined.
- [ ] User cancellation policy is defined.
- [ ] Support escalation policy is defined.

## 2. UX And Design

### Screens

- [ ] Every screen in the feature is listed.
- [ ] Each screen has a named purpose.
- [ ] Each screen has owner-approved design.
- [ ] Each screen has responsive behavior.
- [ ] Each screen has mobile behavior if applicable.
- [ ] Each screen has keyboard behavior if applicable.
- [ ] Each screen has navigation behavior.

### Click Paths

- [ ] Primary click path is documented.
- [ ] Secondary click paths are documented.
- [ ] Deep links are documented.
- [ ] Back navigation is documented.
- [ ] Cancel or abandon behavior is documented.
- [ ] Re-entry behavior is documented.
- [ ] Cross-feature paths are documented.

### UI States

- [ ] Empty states are designed.
- [ ] Loading states are designed.
- [ ] Slow-loading states are designed.
- [ ] Error states are designed.
- [ ] Permission-denied states are designed.
- [ ] Disabled states are designed.
- [ ] Validation states are designed.
- [ ] Success states are designed.
- [ ] Confirmation states are designed.

### Permissions And Visibility

- [ ] Role-based visibility is documented.
- [ ] Role-based actions are documented.
- [ ] App or device permission prompts are documented.
- [ ] Degraded experience without permission is documented.
- [ ] Security-sensitive UI is reviewed.

### Copy Shape

- [ ] Button labels are final.
- [ ] Form labels are final.
- [ ] Helper text is final.
- [ ] Empty-state copy is final.
- [ ] Error copy is final.
- [ ] Confirmation copy is final.
- [ ] Copy avoids unexplained internal terms.
- [ ] Copy is localization-friendly.
- [ ] Copy has accessibility labels where needed.

### Alternate Flows

- [ ] Existing-data flow is documented.
- [ ] New-data flow is documented.
- [ ] Edit flow is documented.
- [ ] Delete or reverse flow is documented.
- [ ] Permission-limited flow is documented.
- [ ] Offline or poor-network flow is documented.
- [ ] Recovery flow is documented.

### Figma Or Prototype

- [ ] Figma link is added.
- [ ] Prototype includes main happy path.
- [ ] Prototype includes error states.
- [ ] Prototype includes empty states.
- [ ] Prototype includes loading states.
- [ ] Prototype includes alternate paths.
- [ ] Design review is complete.

## 3. Workflow Inventory

Each meaningful user journey should be named, risk-ranked, and traceable to tests.

### Workflow Template

```md
Flow ID:
Name:
Persona:
Risk: P0 / P1 / P2 / P3
Entry points:
Preconditions:
Happy path:
Failure paths:
Recovery paths:
Expected final state:
Assertions:
Telemetry:
Coverage:
Open gaps:
Owner:
```

### Entry Points

- [ ] Primary entry points are listed.
- [ ] Secondary entry points are listed.
- [ ] Deep links are listed.
- [ ] Notification entry points are listed if applicable.
- [ ] API-triggered entry points are listed if applicable.
- [ ] Admin or support entry points are listed if applicable.

### Happy Paths

- [ ] Core happy path is documented.
- [ ] P0 happy paths are documented.
- [ ] P1 happy paths are documented.
- [ ] Preconditions are explicit.
- [ ] Expected final states are explicit.
- [ ] Required assertions are explicit.

### Failure Paths

- [ ] Client validation failure is documented.
- [ ] Backend validation failure is documented.
- [ ] Network failure is documented.
- [ ] Timeout failure is documented.
- [ ] Permission failure is documented.
- [ ] Duplicate or conflict failure is documented.
- [ ] Partial write failure is documented.
- [ ] Dependency outage failure is documented.

### Recovery Paths

- [ ] Retry behavior is documented.
- [ ] Edit-and-resubmit behavior is documented.
- [ ] Save draft or resume behavior is documented if applicable.
- [ ] Undo, reverse, or rollback behavior is documented if applicable.
- [ ] Support handoff behavior is documented.
- [ ] User-facing recovery copy is documented.

## 4. Engineering Design

### State Machines

- [ ] Feature states are named.
- [ ] Valid transitions are documented.
- [ ] Invalid transitions are prevented.
- [ ] Loading and submitting states are separated.
- [ ] Success and failure terminal states are explicit.
- [ ] Retry transitions are explicit.
- [ ] State reset behavior is explicit.

### APIs

- [ ] APIs or RPCs are listed.
- [ ] Request payloads are documented.
- [ ] Response payloads are documented.
- [ ] Error shapes are documented.
- [ ] Pagination or filtering is documented.
- [ ] Idempotency behavior is documented if writes are involved.
- [ ] Rate limits are documented if applicable.

### Data Contracts

- [ ] Client schema is documented.
- [ ] Backend schema is documented.
- [ ] Required fields are listed.
- [ ] Optional fields are listed.
- [ ] Nullable fields are listed.
- [ ] Default values are listed.
- [ ] Type conversions are documented.
- [ ] Backward compatibility is documented.
- [ ] Contract tests exist for critical payloads.

### Permissions

- [ ] Authentication requirement is documented.
- [ ] Authorization model is documented.
- [ ] Role checks are documented.
- [ ] Row-level or tenant-level access rules are documented.
- [ ] Sensitive fields are protected.
- [ ] Admin override behavior is documented if applicable.

### Backend Failure Modes

- [ ] Duplicate constraint behavior is handled.
- [ ] Missing or stale schema behavior is handled.
- [ ] Timeout behavior is handled.
- [ ] Partial write behavior is handled.
- [ ] Transaction failure behavior is handled.
- [ ] Queue or retry failure behavior is handled.
- [ ] Dependency failure behavior is handled.

### Feature Flags

- [ ] Flag name is defined.
- [ ] Default flag state is defined.
- [ ] Allowed audiences are defined.
- [ ] Rollout percentages are defined.
- [ ] Kill switch behavior is defined.
- [ ] Flag cleanup task is created.

### Migrations

- [ ] Schema migration is written.
- [ ] Backfill plan is written if needed.
- [ ] Rollback or forward-fix plan is written.
- [ ] Data impact is reviewed.
- [ ] Index impact is reviewed.
- [ ] RLS or permission impact is reviewed.
- [ ] Migration has been tested against representative data.

### Observability

- [ ] Structured logs are added.
- [ ] Product telemetry events are added.
- [ ] Error metrics are added.
- [ ] Latency metrics are added.
- [ ] Business metrics are added if applicable.
- [ ] Crash reporting is verified.
- [ ] Dashboard is linked.
- [ ] Alerts are configured for P0 failure modes.

## 5. Testing And QA

### Risk Matrix

Use this table to classify workflows before deciding coverage.

| Risk | Meaning                                                               | Examples                                                          | Minimum Expected Coverage                    |
| ---- | --------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| P0   | Breaks auth, money, data integrity, security, or core task completion | Login, create invoice, record payment, destructive data operation | Unit, integration, e2e, monitoring, rollback |
| P1   | Major feature broken, high support impact, recoverable                | Search, edit customer, import order                               | Unit, integration, targeted e2e              |
| P2   | Important but lower blast radius                                      | Filters, secondary settings, reports                              | Unit or integration, selective e2e           |
| P3   | Low-risk presentation or rare path                                    | Static copy, non-critical visual polish                           | Unit, snapshot, or manual                    |

### Test Plan

- [ ] P0 workflows are listed.
- [ ] P1 workflows are listed.
- [ ] Test data requirements are listed.
- [ ] Preconditions are listed.
- [ ] Expected results are listed.
- [ ] Negative test cases are listed.
- [ ] Cross-browser or cross-device requirements are listed.
- [ ] Accessibility test cases are listed.
- [ ] Localization test cases are listed if applicable.
- [ ] Manual test cases are listed if automation is not suitable.

### Automation Plan

- [ ] Unit test coverage is assigned.
- [ ] Integration test coverage is assigned.
- [ ] Contract test coverage is assigned.
- [ ] E2E test coverage is assigned.
- [ ] Visual or snapshot coverage is assigned.
- [ ] Accessibility automation is assigned.
- [ ] Performance test coverage is assigned if needed.
- [ ] Manual-only gaps are explicitly accepted.

### Regression Suite

- [ ] P0 regression tests are in CI.
- [ ] P1 regression tests are in CI or scheduled.
- [ ] Previous bug regressions are covered.
- [ ] Test data reset is reliable.
- [ ] Tests assert real user-visible states.
- [ ] Tests avoid metadata-only or fake selectors.
- [ ] Debug artifacts are saved for failures.

### Coverage Matrix

| Feature | Flow ID | Risk | Unit | Integration | Contract | E2E | Manual | Canary | Status | Notes |
| ------- | ------- | ---- | ---- | ----------- | -------- | --- | ------ | ------ | ------ | ----- |
|         |         |      |      |             |          |     |        |        |        |       |

### Coverage Rules

- [ ] Every P0 flow has at least one e2e or canary-backed production safety check.
- [ ] Every P0 write has integration coverage against realistic data.
- [ ] Every critical payload has contract or schema coverage.
- [ ] Every known regression has a named test.
- [ ] Every manual-only gap has an owner and reason.
- [ ] Tests prove visible user outcomes, not only command completion.

## 6. Enterprise Cross-Cutting Review

### Abuse Cases

- [ ] Abuse scenarios are listed.
- [ ] Fraud or spam risk is reviewed.
- [ ] Privilege escalation risk is reviewed.
- [ ] Rate limiting is reviewed.
- [ ] Audit logging is reviewed.
- [ ] Admin or support tooling cannot bypass safeguards accidentally.

### Privacy

- [ ] Sensitive data is identified.
- [ ] Data collection is justified.
- [ ] Data retention is defined.
- [ ] Data deletion behavior is defined.
- [ ] Data export behavior is defined if applicable.
- [ ] Encryption or secure storage needs are reviewed.
- [ ] Logs do not leak sensitive data.

### Localization

- [ ] All user-facing strings are localizable.
- [ ] Long translations fit.
- [ ] RTL behavior is reviewed if applicable.
- [ ] Currency formats are correct.
- [ ] Date and time formats are correct.
- [ ] Number formats are correct.
- [ ] Locale-specific business rules are reviewed.

### Accessibility

- [ ] Screen reader labels are present.
- [ ] Touch targets are large enough.
- [ ] Keyboard navigation works if applicable.
- [ ] Focus order is logical.
- [ ] Color contrast passes.
- [ ] Reduced motion is respected.
- [ ] Error messages are announced or discoverable.
- [ ] Dynamic content changes are accessible.

### Support Burden

- [ ] Likely support questions are listed.
- [ ] Support runbook is written if needed.
- [ ] User-facing help or FAQ is written if needed.
- [ ] Admin diagnostics are available.
- [ ] Support can identify feature flag state.
- [ ] Support can identify failed operations.

### Compliance

- [ ] Legal requirements are reviewed.
- [ ] Financial or tax requirements are reviewed if applicable.
- [ ] Audit log requirements are reviewed.
- [ ] Data protection requirements are reviewed.
- [ ] Consent requirements are reviewed.
- [ ] Retention requirements are reviewed.
- [ ] Compliance signoff is recorded if needed.

### Metrics

- [ ] Product adoption metric exists.
- [ ] Task completion metric exists.
- [ ] Error rate metric exists.
- [ ] Latency metric exists.
- [ ] Drop-off metric exists for multi-step flows.
- [ ] Support ticket metric exists if applicable.
- [ ] Metric dashboard is linked.

## 7. Rollout And Launch

### Rollout Safety

- [ ] Feature is behind a flag if rollout risk is non-trivial.
- [ ] Internal dogfood plan is defined.
- [ ] Beta or canary plan is defined.
- [ ] Percentage rollout plan is defined.
- [ ] Region or tenant rollout constraints are defined.
- [ ] Rollback plan is tested.
- [ ] Kill switch owner is named.

### Launch Doc

- [ ] Launch summary is written.
- [ ] Scope is linked.
- [ ] Owners are listed.
- [ ] Dependencies are listed.
- [ ] Rollout schedule is listed.
- [ ] Monitoring checklist is included.
- [ ] Rollback instructions are included.
- [ ] Support notes are included.
- [ ] Known risks are included.

### Production Readiness

- [ ] Dashboards are live.
- [ ] Alerts are live.
- [ ] Logs are searchable.
- [ ] Feature flag is configured.
- [ ] Migration has run or is scheduled.
- [ ] Seed or fixture data is ready if needed.
- [ ] Support team is briefed.
- [ ] On-call owner is briefed.

### Incident Response

- [ ] Severity criteria are defined.
- [ ] Alert destination is defined.
- [ ] Triage owner is defined.
- [ ] Rollback owner is defined.
- [ ] Customer communication owner is defined.
- [ ] Postmortem owner is defined.
- [ ] Known failure playbooks are linked.

## 8. Final Readiness Gate

### Required Evidence

- [ ] PRD approved.
- [ ] Design approved.
- [ ] Technical design approved.
- [ ] Workflow inventory complete.
- [ ] Risk matrix complete.
- [ ] Test plan complete.
- [ ] Coverage matrix complete.
- [ ] P0/P1 automated coverage complete or risk accepted.
- [ ] Observability complete.
- [ ] Rollout plan complete.
- [ ] Rollback plan complete.
- [ ] Support plan complete.
- [ ] Security/privacy/compliance review complete where applicable.

### Signoff

| Area             | Owner | Status | Date | Notes |
| ---------------- | ----- | ------ | ---- | ----- |
| Product          |       |        |      |       |
| Design           |       |        |      |       |
| Engineering      |       |        |      |       |
| QA/Test          |       |        |      |       |
| Data/Analytics   |       |        |      |       |
| Security/Privacy |       |        |      |       |
| Support          |       |        |      |       |
| Launch/Program   |       |        |      |       |

## 9. Post-Launch Review

- [ ] Success metrics are reviewed.
- [ ] Guardrail metrics are reviewed.
- [ ] Error rates are reviewed.
- [ ] Support tickets are reviewed.
- [ ] User feedback is reviewed.
- [ ] Incidents are reviewed.
- [ ] Rollout flag cleanup is scheduled.
- [ ] Follow-up work is captured.
- [ ] Tests are updated based on production learnings.
- [ ] Documentation is updated based on production learnings.
