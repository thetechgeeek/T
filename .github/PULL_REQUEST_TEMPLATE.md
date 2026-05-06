## Summary

## Verification

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:coverage` or a documented narrower Jest target
- [ ] `npm run check:runtime-boundaries`
- [ ] `npm run check:product-surfaces`
- [ ] `npm run check:i18n` when user-facing copy changed
- [ ] `npm run check:migrations` when Supabase files changed
- [ ] `npm run check:db-types` when Supabase files changed

## Product And UX Truthfulness

- [ ] No live route imports `src/mocks`
- [ ] No placeholder export/share/save action is exposed as operational
- [ ] Incomplete finance, statutory, transaction, report, or utility surfaces are hidden, beta-labeled, or routed to an unavailable state
- [ ] Accessibility states and hints are correct for disabled controls
- [ ] New user-facing strings have English and Hindi keys or a documented allowlist reason
- [ ] Product owner sign-off is documented for any live incomplete surface

## Security Impact

- [ ] No security-sensitive files changed
- [ ] Secrets, tokens, and service-role keys are not committed
- [ ] `npm run audit:security` is green or an explicit security exception is linked
- [ ] Dependency changes include release-note review and native/runtime risk notes

## Backend Migration Compatibility

- [ ] No Supabase migration in this PR
- [ ] Change is additive for the current mobile release, previous rollback release, and release candidate
- [ ] Current and rollback RPC aliases are preserved
- [ ] Deprecated RPCs have owner, deprecation date, migration notes, and retirement approval
- [ ] Previous-supported-client smoke path is documented
- [ ] Rollback/recovery and backup checkpoint are documented

## Release Notes

- [ ] Not user-visible
- [ ] User-visible change is captured in `CHANGELOG.md` or generated release notes
