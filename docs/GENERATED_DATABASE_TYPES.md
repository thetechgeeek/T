# Generated Database Types

Status: active Phase 6 type-safety contract.

## Stable Location

The committed database type contract lives in `src/types/database.ts`.
CI runs `npm run check:db-types` to keep critical generated table/RPC contracts present until full
remote schema diffing is available in the pipeline.

## Regeneration

After schema, table, enum, view, or RPC changes:

```bash
npm run db:types:generate
```

This runs:

```bash
npx supabase gen types typescript --local > src/types/database.ts
```

Use the linked local Supabase database for generation. If the project generates from a remote test
project, record the project ref in the PR.

## Review Expectations

- Repository table names should use the generated table-name contract where practical.
- RPC argument and return types should match `Database['public']['Functions']`.
- Fractional quantities must remain `number` in TypeScript and `NUMERIC` in SQL.
- Type changes must land in the same PR as the migration that caused them.
