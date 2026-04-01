CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_table_record ON audit_log (table_name, record_id);
CREATE INDEX idx_audit_log_changed_at ON audit_log (changed_at DESC);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to critical tables
CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_inventory AFTER INSERT OR UPDATE OR DELETE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_expenses AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- Enable RLS on audit_log (read-only for authenticated, no write from client)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_read_only" ON audit_log FOR SELECT TO authenticated USING (true);
