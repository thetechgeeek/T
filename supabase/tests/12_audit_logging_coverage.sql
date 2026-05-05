-- pgTAP smoke tests for expanded audit logging coverage.
-- Run with: supabase test db

BEGIN;

SELECT plan(6);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'audit_trigger_fn'
      AND prosecdef = true
      AND proconfig::TEXT LIKE '%search_path=public, auth%'
  ),
  'audit_trigger_fn is SECURITY DEFINER with a pinned search_path'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'audit_log'
      AND policyname = 'audit_insert_policy'
  ),
  'manual audit_log insert policy is removed'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'audit_customers'
      AND tgrelid = 'public.customers'::regclass
      AND NOT tgisinternal
  ),
  'customers table has an audit trigger'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'audit_suppliers'
      AND tgrelid = 'public.suppliers'::regclass
      AND NOT tgisinternal
  ),
  'suppliers table has an audit trigger'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'audit_stock_operations'
      AND tgrelid = 'public.stock_operations'::regclass
      AND NOT tgisinternal
  ),
  'stock_operations table has an audit trigger'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'audit_purchase_line_items'
      AND tgrelid = 'public.purchase_line_items'::regclass
      AND NOT tgisinternal
  ),
  'purchase_line_items table has an audit trigger'
);

SELECT * FROM finish();

ROLLBACK;
