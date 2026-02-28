
-- Create storage bucket for purchase bill uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('purchase-bills', 'purchase-bills', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload purchase bills"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'purchase-bills');

-- Allow anyone to view purchase bills (public bucket)
CREATE POLICY "Anyone can view purchase bills"
ON storage.objects FOR SELECT
USING (bucket_id = 'purchase-bills');

-- Allow authenticated users to delete purchase bills
CREATE POLICY "Authenticated users can delete purchase bills"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'purchase-bills');

-- Allow authenticated users to update purchase bills
CREATE POLICY "Authenticated users can update purchase bills"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'purchase-bills');
