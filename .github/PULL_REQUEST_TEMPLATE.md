## Summary

## Verification

- [ ] `npm run typecheck`
- [ ] `npm test -- --runInBand`
- [ ] `npm run check:migrations` when Supabase files changed
- [ ] `npm run check:db-types` when Supabase files changed

## Backend Migration Compatibility

- [ ] No Supabase migration in this PR
- [ ] Change is additive for the current mobile release, previous rollback release, and release candidate
- [ ] Current and rollback RPC aliases are preserved
- [ ] Deprecated RPCs have owner, deprecation date, migration notes, and retirement approval
- [ ] Previous-supported-client smoke path is documented
- [ ] Rollback/recovery and backup checkpoint are documented
