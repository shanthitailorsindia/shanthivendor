
-- Fix vendor_payments.vendor_id FK: currently references empty vendors table, should reference vendor_profiles
ALTER TABLE public.vendor_payments DROP CONSTRAINT IF EXISTS vendor_payments_vendor_id_fkey;
ALTER TABLE public.vendor_payments ADD CONSTRAINT vendor_payments_vendor_id_fkey 
  FOREIGN KEY (vendor_id) REFERENCES public.vendor_profiles(id) ON DELETE SET NULL;
