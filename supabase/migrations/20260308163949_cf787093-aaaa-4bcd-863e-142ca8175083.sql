
-- Step 1: Drop the global unique constraint on bill_number
ALTER TABLE public.purchase_bills DROP CONSTRAINT IF EXISTS purchase_bills_bill_number_key;

-- Step 2: Add composite unique constraint (vendor_id + bill_number)
ALTER TABLE public.purchase_bills ADD CONSTRAINT unique_vendor_bill_number UNIQUE (vendor_id, bill_number);

-- Step 3: Fix vendor_payments status check constraint to accept "completed"
ALTER TABLE public.vendor_payments DROP CONSTRAINT IF EXISTS vendor_payments_status_check;
ALTER TABLE public.vendor_payments ADD CONSTRAINT vendor_payments_status_check CHECK (status IN ('pending', 'paid', 'overdue', 'completed', 'cancelled'));
