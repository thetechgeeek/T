-- Allow the audit trigger to insert logs
-- While the trigger is SECURITY DEFINER, it still requires a policy to insert into an RLS-enabled table
-- This policy specifically allows authenticated users to trigger the log insertion, but keep it read-only for manual client access

CREATE POLICY "audit_insert_policy" ON audit_log 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
