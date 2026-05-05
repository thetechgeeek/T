# Database Migration Policy

Status: active Phase 6 data contract.

## Numbering

Migration filenames must use `000_descriptive_name.sql`.

`015_fix_audit_log_rls.sql` and `015_low_stock_notification.sql` are a documented legacy duplicate.
They are left in place because renaming already-applied Supabase migrations can create false
re-application history. `npm run check:migrations` allows only that legacy duplicate and fails new
duplicate prefixes.

## Generated Types

Regenerate database types after schema or RPC changes:

```bash
npm run db:types:generate
```

The stable committed type contract is `src/types/database.ts`.

## Migration Header Template

Each new migration must start with:

```sql
-- Migration NNN: short title
-- Data impact: none | additive | destructive | irreversible
-- Rollback/recovery: describe forward repair, restore point, or no-op rollback
-- Compatibility: current release, previous rollback release, release candidate
-- Owner: @data-owner
```

## Review Rules

- Destructive migrations require backup checkpoint evidence.
- Irreversible migrations require a recovery runbook.
- RPC shape changes require a versioned alias and mobile compatibility notes.
- Data owner review is required for all files under `supabase/migrations/`.
