CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_read ON notifications (read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_full_access_notifications" ON notifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auto-notify when stock drops below threshold
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.low_stock_threshold > 0
     AND NEW.box_count <= NEW.low_stock_threshold
     AND (OLD.box_count > OLD.low_stock_threshold OR OLD.box_count IS NULL) THEN
    INSERT INTO notifications (type, title, body, metadata)
    VALUES (
      'low_stock',
      'Low Stock Alert',
      NEW.design_name || ' has only ' || NEW.box_count || ' boxes remaining',
      jsonb_build_object('item_id', NEW.id, 'current_stock', NEW.box_count, 'threshold', NEW.low_stock_threshold)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_low_stock
  AFTER UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION notify_low_stock();
