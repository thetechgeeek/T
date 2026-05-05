-- pgTAP regression guard for database strengths called out in the architecture audit.
-- Run with: supabase test db

BEGIN;

SELECT plan(24);

SELECT col_is_pk('public', 'customers', 'id', 'customers.id remains a UUID primary key');
SELECT col_is_pk('public', 'invoices', 'id', 'invoices.id remains a UUID primary key');
SELECT col_is_pk('public', 'inventory_items', 'id', 'inventory_items.id remains a UUID primary key');
SELECT col_is_pk('public', 'stock_operations', 'id', 'stock_operations.id remains a UUID primary key');

SELECT col_type_is('public', 'customers', 'created_at', 'timestamp with time zone', 'customers.created_at remains TIMESTAMPTZ');
SELECT col_type_is('public', 'invoices', 'updated_at', 'timestamp with time zone', 'invoices.updated_at remains TIMESTAMPTZ');

SELECT col_type_is('public', 'invoices', 'grand_total', 'numeric', 'invoice money fields remain NUMERIC');
SELECT col_type_is('public', 'payments', 'amount', 'numeric', 'payment money fields remain NUMERIC');
SELECT col_type_is('public', 'invoice_line_items', 'quantity', 'numeric', 'invoice quantities remain NUMERIC');
SELECT col_type_is('public', 'inventory_items', 'box_count', 'numeric', 'inventory quantities remain NUMERIC');
SELECT col_type_is('public', 'stock_operations', 'quantity_change', 'numeric', 'stock deltas remain NUMERIC');

SELECT has_type('public', 'stock_op_type', 'stock operation enum remains present');

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'handle_updated_at_customers'
      AND tgrelid = 'public.customers'::regclass
      AND NOT tgisinternal
  ),
  'customers retains a moddatetime updated_at trigger'
);

SELECT has_function('public', 'create_invoice_with_items_v1', 'versioned invoice RPC alias remains present');
SELECT has_function('public', 'record_payment_with_invoice_update_v1', 'versioned payment RPC alias remains present');

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_matviews
    WHERE schemaname = 'public' AND matviewname = 'customer_ledger_summary'
  ),
  'customer ledger materialized view remains present'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_matviews
    WHERE schemaname = 'public' AND matviewname = 'supplier_ledger_summary'
  ),
  'supplier ledger materialized view remains present'
);

SELECT has_column('public', 'invoices', 'idempotency_key', 'invoices retain idempotency_key');

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'invoices'
      AND indexdef ILIKE '%idempotency_key%'
      AND indexdef ILIKE '%unique%'
  ),
  'invoices.idempotency_key remains unique'
);

SELECT has_function('public', 'perform_stock_operation_v1', 'versioned stock RPC alias remains present');

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'audit_invoices'
      AND tgrelid = 'public.invoices'::regclass
      AND NOT tgisinternal
  ),
  'invoice audit trigger remains present'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'audit_customers'
      AND tgrelid = 'public.customers'::regclass
      AND NOT tgisinternal
  ),
  'customer audit trigger remains present'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'audit_suppliers'
      AND tgrelid = 'public.suppliers'::regclass
      AND NOT tgisinternal
  ),
  'supplier audit trigger remains present'
);

SELECT * FROM finish();

ROLLBACK;
