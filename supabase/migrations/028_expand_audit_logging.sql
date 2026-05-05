-- Phase 4 audit hardening. Expands trigger coverage beyond invoices/payments/
-- inventory/expenses, pins SECURITY DEFINER search_path, and removes the broad
-- manual insert policy from audit_log.

CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_data, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP POLICY IF EXISTS "audit_insert_policy" ON public.audit_log;
REVOKE INSERT, UPDATE, DELETE ON public.audit_log FROM anon, authenticated;

DROP TRIGGER IF EXISTS audit_invoices ON public.invoices;
DROP TRIGGER IF EXISTS audit_payments ON public.payments;
DROP TRIGGER IF EXISTS audit_inventory ON public.inventory_items;
DROP TRIGGER IF EXISTS audit_expenses ON public.expenses;

DO $$
DECLARE
  audited_table TEXT;
  audited_tables TEXT[] := ARRAY[
    'business_profile',
    'customers',
    'suppliers',
    'inventory_items',
    'stock_operations',
    'orders',
    'order_line_items',
    'invoices',
    'invoice_line_items',
    'purchases',
    'purchase_line_items',
    'payments',
    'expenses',
    'notifications',
    'item_categories',
    'item_units',
    'item_party_rates',
    'inventory_batches',
    'inventory_serials'
  ];
BEGIN
  FOREACH audited_table IN ARRAY audited_tables LOOP
    IF to_regclass(format('public.%I', audited_table)) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS audit_%I ON public.%I', audited_table, audited_table);
      EXECUTE format(
        'CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn()',
        audited_table,
        audited_table
      );
    END IF;
  END LOOP;
END $$;
