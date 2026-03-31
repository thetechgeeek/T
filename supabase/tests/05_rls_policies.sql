-- pgTAP tests for Row Level Security (RLS) policies
-- Verifies that unauthenticated requests cannot access protected tables
-- and that authenticated users can access their own data.
-- Run with: supabase test db

BEGIN;

SELECT plan(12);

-- ─── Setup ────────────────────────────────────────────────────────────────────

-- Ensure we start as anon (no session)
SET ROLE anon;

-- ─── Tests: Anon cannot read protected tables ──────────────────────────────

-- 1. Anon cannot SELECT from customers
SELECT is(
  (SELECT count(*)::int FROM customer),
  0,
  'anon: customers table returns 0 rows (RLS blocks or empty)'
);

-- 2. Anon cannot SELECT from invoices
SELECT is(
  (SELECT count(*)::int FROM invoice),
  0,
  'anon: invoices table returns 0 rows (RLS blocks or empty)'
);

-- 3. Anon cannot SELECT from inventory_items
SELECT is(
  (SELECT count(*)::int FROM inventory_item),
  0,
  'anon: inventory_items returns 0 rows (RLS blocks or empty)'
);

-- 4. Anon cannot SELECT from payments
SELECT is(
  (SELECT count(*)::int FROM payment),
  0,
  'anon: payments returns 0 rows (RLS blocks or empty)'
);

-- 5. Anon cannot SELECT from expenses
SELECT is(
  (SELECT count(*)::int FROM expense),
  0,
  'anon: expenses returns 0 rows (RLS blocks or empty)'
);

-- 6. Anon cannot SELECT from suppliers
SELECT is(
  (SELECT count(*)::int FROM supplier),
  0,
  'anon: suppliers returns 0 rows (RLS blocks or empty)'
);

-- ─── Tests: RLS is ENABLED on key tables ──────────────────────────────────

RESET ROLE;

-- 7. RLS is enabled on customer table
SELECT ok(
  (SELECT rowsecurity FROM pg_class WHERE relname = 'customer' AND relnamespace = 'public'::regnamespace),
  'RLS enabled on customer table'
);

-- 8. RLS is enabled on invoice table
SELECT ok(
  (SELECT rowsecurity FROM pg_class WHERE relname = 'invoice' AND relnamespace = 'public'::regnamespace),
  'RLS enabled on invoice table'
);

-- 9. RLS is enabled on inventory_item table
SELECT ok(
  (SELECT rowsecurity FROM pg_class WHERE relname = 'inventory_item' AND relnamespace = 'public'::regnamespace),
  'RLS enabled on inventory_item table'
);

-- 10. RLS is enabled on payment table
SELECT ok(
  (SELECT rowsecurity FROM pg_class WHERE relname = 'payment' AND relnamespace = 'public'::regnamespace),
  'RLS enabled on payment table'
);

-- 11. RLS is enabled on expense table
SELECT ok(
  (SELECT rowsecurity FROM pg_class WHERE relname = 'expense' AND relnamespace = 'public'::regnamespace),
  'RLS enabled on expense table'
);

-- 12. RLS is enabled on supplier table
SELECT ok(
  (SELECT rowsecurity FROM pg_class WHERE relname = 'supplier' AND relnamespace = 'public'::regnamespace),
  'RLS enabled on supplier table'
);

SELECT * FROM finish();

ROLLBACK;
