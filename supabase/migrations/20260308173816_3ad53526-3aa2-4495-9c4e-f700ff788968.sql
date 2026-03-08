-- Allow anon access for import flows (user requested no restrictions)
DROP POLICY IF EXISTS "Enable all actions for anon on vendor_profiles" ON public.vendor_profiles;
CREATE POLICY "Enable all actions for anon on vendor_profiles"
ON public.vendor_profiles
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all actions for anon on vendor_payments" ON public.vendor_payments;
CREATE POLICY "Enable all actions for anon on vendor_payments"
ON public.vendor_payments
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all actions for anon on purchase_bills" ON public.purchase_bills;
CREATE POLICY "Enable all actions for anon on purchase_bills"
ON public.purchase_bills
FOR ALL
TO anon
USING (true)
WITH CHECK (true);