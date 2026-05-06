-- Migration 029: Scope business-table RLS to business membership.
--
-- Earlier migrations used blanket authenticated policies while the app was
-- effectively single-tenant. This migration introduces an explicit business
-- membership model, backfills existing rows to the first business profile, and
-- replaces business-table blanket policies with business-scoped policies.

CREATE TABLE IF NOT EXISTS public.business_memberships (
  business_id UUID NOT NULL REFERENCES public.business_profile(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, user_id),
  CONSTRAINT business_memberships_role_check CHECK (role IN ('owner', 'admin', 'staff'))
);

ALTER TABLE public.business_memberships ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_business_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN (
      SELECT id
      FROM public.business_profile
      ORDER BY created_at ASC
      LIMIT 1
    )
    ELSE (
      SELECT bm.business_id
      FROM public.business_memberships bm
      WHERE bm.user_id = auth.uid()
      ORDER BY bm.created_at ASC
      LIMIT 1
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.has_business_access(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT auth.uid() IS NOT NULL
    AND p_business_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.business_memberships bm
      WHERE bm.business_id = p_business_id
        AND bm.user_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.assign_business_profile_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  scoped_table TEXT;
  scoped_tables TEXT[] := ARRAY[
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
  ];
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.business_memberships (business_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'owner')
    ON CONFLICT (business_id, user_id) DO NOTHING;
  END IF;

  IF (SELECT count(*) FROM public.business_profile) = 1 THEN
    FOREACH scoped_table IN ARRAY scoped_tables LOOP
      IF to_regclass(format('public.%I', scoped_table)) IS NOT NULL THEN
        EXECUTE format(
          'UPDATE public.%I SET business_id = $1 WHERE business_id IS NULL',
          scoped_table
        )
        USING NEW.id;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_business_profile_owner ON public.business_profile;
CREATE TRIGGER trg_business_profile_owner
  AFTER INSERT ON public.business_profile
  FOR EACH ROW EXECUTE FUNCTION public.assign_business_profile_owner();

INSERT INTO public.business_memberships (business_id, user_id, role)
SELECT bp.id, au.id, 'owner'
FROM public.business_profile bp
CROSS JOIN auth.users au
WHERE bp.id = (
  SELECT id
  FROM public.business_profile
  ORDER BY created_at ASC
  LIMIT 1
)
ON CONFLICT (business_id, user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.set_business_id_from_context()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NEW.business_id IS NULL THEN
    NEW.business_id := public.current_user_business_id();
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  scoped_table TEXT;
  scoped_tables TEXT[] := ARRAY[
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
  ];
BEGIN
  FOREACH scoped_table IN ARRAY scoped_tables LOOP
    IF to_regclass(format('public.%I', scoped_table)) IS NOT NULL THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.business_profile(id) ON DELETE CASCADE',
        scoped_table
      );
    END IF;
  END LOOP;
END $$;

UPDATE public.invoice_line_items line
SET business_id = invoice.business_id
FROM public.invoices invoice
WHERE line.invoice_id = invoice.id
  AND line.business_id IS NULL
  AND invoice.business_id IS NOT NULL;

UPDATE public.purchase_line_items line
SET business_id = purchase.business_id
FROM public.purchases purchase
WHERE line.purchase_id = purchase.id
  AND line.business_id IS NULL
  AND purchase.business_id IS NOT NULL;

UPDATE public.stock_operations operation
SET business_id = item.business_id
FROM public.inventory_items item
WHERE operation.item_id = item.id
  AND operation.business_id IS NULL
  AND item.business_id IS NOT NULL;

UPDATE public.item_batches batch
SET business_id = item.business_id
FROM public.inventory_items item
WHERE batch.item_id = item.id
  AND batch.business_id IS NULL
  AND item.business_id IS NOT NULL;

UPDATE public.item_serials serial
SET business_id = item.business_id
FROM public.inventory_items item
WHERE serial.item_id = item.id
  AND serial.business_id IS NULL
  AND item.business_id IS NOT NULL;

UPDATE public.item_party_rates rate
SET business_id = item.business_id
FROM public.inventory_items item
WHERE rate.item_id = item.id
  AND rate.business_id IS NULL
  AND item.business_id IS NOT NULL;

DO $$
DECLARE
  scoped_table TEXT;
  default_business_id UUID;
  scoped_tables TEXT[] := ARRAY[
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
  ];
BEGIN
  SELECT id INTO default_business_id
  FROM public.business_profile
  ORDER BY created_at ASC
  LIMIT 1;

  FOREACH scoped_table IN ARRAY scoped_tables LOOP
    IF to_regclass(format('public.%I', scoped_table)) IS NOT NULL THEN
      IF default_business_id IS NOT NULL THEN
        EXECUTE format(
          'UPDATE public.%I SET business_id = $1 WHERE business_id IS NULL',
          scoped_table
        )
        USING default_business_id;
      END IF;

      EXECUTE format(
        'ALTER TABLE public.%I ALTER COLUMN business_id SET DEFAULT public.current_user_business_id()',
        scoped_table
      );
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON public.%I (business_id)',
        'idx_' || scoped_table || '_business_id',
        scoped_table
      );
      EXECUTE format(
        'DROP TRIGGER IF EXISTS trg_%I_business_id ON public.%I',
        scoped_table,
        scoped_table
      );
      EXECUTE format(
        'CREATE TRIGGER trg_%I_business_id BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_business_id_from_context()',
        scoped_table,
        scoped_table
      );
    END IF;
  END LOOP;
END $$;

DROP POLICY IF EXISTS "auth_full_access" ON public.business_profile;
DROP POLICY IF EXISTS "business_memberships_self_select" ON public.business_memberships;
DROP POLICY IF EXISTS "business_memberships_self_insert" ON public.business_memberships;
DROP POLICY IF EXISTS "business_memberships_self_update" ON public.business_memberships;
DROP POLICY IF EXISTS "business_memberships_self_delete" ON public.business_memberships;
DROP POLICY IF EXISTS "business_profile_member_select" ON public.business_profile;
DROP POLICY IF EXISTS "business_profile_member_update" ON public.business_profile;
DROP POLICY IF EXISTS "business_profile_bootstrap_insert" ON public.business_profile;
DROP POLICY IF EXISTS "business_profile_member_delete" ON public.business_profile;

CREATE POLICY "business_memberships_self_select"
  ON public.business_memberships
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "business_memberships_self_insert"
  ON public.business_memberships
  FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "business_memberships_self_update"
  ON public.business_memberships
  FOR UPDATE TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "business_memberships_self_delete"
  ON public.business_memberships
  FOR DELETE TO authenticated
  USING (false);

CREATE POLICY "business_profile_member_select"
  ON public.business_profile
  FOR SELECT TO authenticated
  USING (public.has_business_access(id));

CREATE POLICY "business_profile_member_update"
  ON public.business_profile
  FOR UPDATE TO authenticated
  USING (public.has_business_access(id))
  WITH CHECK (public.has_business_access(id));

CREATE POLICY "business_profile_bootstrap_insert"
  ON public.business_profile
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      NOT EXISTS (SELECT 1 FROM public.business_profile)
      OR public.has_business_access(id)
    )
  );

CREATE POLICY "business_profile_member_delete"
  ON public.business_profile
  FOR DELETE TO authenticated
  USING (false);

DO $$
DECLARE
  scoped_table TEXT;
  scoped_tables TEXT[] := ARRAY[
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
  ];
BEGIN
  FOREACH scoped_table IN ARRAY scoped_tables LOOP
    IF to_regclass(format('public.%I', scoped_table)) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS "auth_full_access" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "auth_full_access_notifications" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "Allow public select on categories" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "Allow auth all on categories" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "Allow public select on units" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "Allow auth all on units" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "Allow auth all on batches" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "Allow public select on batches" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "Allow auth all on serials" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "Allow public select on serials" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "Allow auth all on party_rates" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "Allow public select on party_rates" ON public.%I', scoped_table);
      EXECUTE format('DROP POLICY IF EXISTS "business_scoped_access" ON public.%I', scoped_table);
      EXECUTE format(
        'CREATE POLICY "business_scoped_access" ON public.%I FOR ALL TO authenticated USING (public.has_business_access(business_id)) WITH CHECK (public.has_business_access(business_id))',
        scoped_table
      );
    END IF;
  END LOOP;
END $$;
