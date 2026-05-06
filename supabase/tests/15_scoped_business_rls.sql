-- pgTAP regression guard for business-scoped RLS.
-- Run with: supabase test db

BEGIN;

SELECT plan(6);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'business_memberships'
  ),
  'business membership table exists'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'business_profile',
        'customers',
        'suppliers',
        'orders',
        'inventory_items',
        'stock_operations',
        'invoices',
        'invoice_line_items',
        'purchases',
        'purchase_line_items',
        'payments',
        'expenses',
        'notifications',
        'item_categories',
        'item_units',
        'item_batches',
        'item_serials',
        'item_party_rates'
      )
      AND (
        lower(COALESCE(qual, '')) IN ('true', '(true)')
        OR lower(COALESCE(with_check, '')) IN ('true', '(true)')
      )
  ),
  'business tables have no blanket true RLS policies'
);

SELECT is(
  (
    SELECT count(*)::int
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'customers',
        'suppliers',
        'orders',
        'inventory_items',
        'stock_operations',
        'invoices',
        'invoice_line_items',
        'purchases',
        'purchase_line_items',
        'payments',
        'expenses',
        'notifications',
        'item_categories',
        'item_units',
        'item_batches',
        'item_serials',
        'item_party_rates'
      )
      AND policyname = 'business_scoped_access'
  ),
  17,
  'all business-scoped tables have the shared access policy'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'invoices'
      AND column_name = 'business_id'
  ),
  'invoice rows carry business ownership'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'has_business_access'
      AND prosecdef = true
      AND proconfig::TEXT LIKE '%search_path=public, auth%'
  ),
  'business access helper is SECURITY DEFINER with pinned search_path'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'business_memberships'
      AND policyname = 'business_memberships_self_insert'
      AND lower(COALESCE(with_check, '')) IN ('false', '(false)')
  ),
  'business membership writes are not self-service'
);

SELECT * FROM finish();

ROLLBACK;
