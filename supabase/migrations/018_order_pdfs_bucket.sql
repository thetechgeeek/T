-- Migration 018: Create order-pdfs storage bucket for PDF uploads
-- Files are accessible only to the uploading authenticated user (via RLS).
-- The edge function downloads via service role key using the storage path.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-pdfs',
  'order-pdfs',
  false,
  10485760, -- 10 MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Users can only upload/read/delete their own files
CREATE POLICY "order_pdfs_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'order-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "order_pdfs_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'order-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "order_pdfs_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'order-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
