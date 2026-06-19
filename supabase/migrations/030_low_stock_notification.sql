-- Low-stock notifications.
--
-- This migration intentionally runs after business-scoped RLS/audit hardening so
-- fresh databases get the modern notifications shape without relying on the
-- historical duplicate 015 migration ordering.

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.business_profile(id) ON DELETE CASCADE DEFAULT public.current_user_business_id(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.business_profile(id) ON DELETE CASCADE;

ALTER TABLE public.notifications
  ALTER COLUMN business_id SET DEFAULT public.current_user_business_id();

UPDATE public.notifications
SET business_id = public.current_user_business_id()
WHERE business_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_business_id
  ON public.notifications (business_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read
  ON public.notifications (read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_business_read
  ON public.notifications (business_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_full_access_notifications" ON public.notifications;
DROP POLICY IF EXISTS "business_scoped_access" ON public.notifications;

CREATE POLICY "business_scoped_access"
  ON public.notifications
  FOR ALL TO authenticated
  USING (public.has_business_access(business_id))
  WITH CHECK (public.has_business_access(business_id));

DROP TRIGGER IF EXISTS trg_notifications_business_id ON public.notifications;
CREATE TRIGGER trg_notifications_business_id
  BEFORE INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.set_business_id_from_context();

DROP TRIGGER IF EXISTS audit_notifications ON public.notifications;
CREATE TRIGGER audit_notifications
  AFTER INSERT OR UPDATE OR DELETE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

-- Auto-notify when stock drops below threshold
CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NEW.low_stock_threshold > 0
     AND NEW.box_count <= NEW.low_stock_threshold
     AND (OLD.box_count > OLD.low_stock_threshold OR OLD.box_count IS NULL) THEN
    INSERT INTO public.notifications (business_id, type, title, body, metadata)
    VALUES (
      COALESCE(NEW.business_id, public.current_user_business_id()),
      'low_stock',
      'Low Stock Alert',
      NEW.design_name || ' has only ' || NEW.box_count || ' boxes remaining',
      jsonb_build_object('item_id', NEW.id, 'current_stock', NEW.box_count, 'threshold', NEW.low_stock_threshold)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_low_stock ON public.inventory_items;
CREATE TRIGGER trg_notify_low_stock
  AFTER UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.notify_low_stock();
