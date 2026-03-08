

# Zoho Books Import: Vendors, Bills & Payments

## Context
You have data in Zoho Books (vendors, their bills, and payments) that needs to come into VendorHub. The system already has a per-vendor `ImportBillsDialog` but needs a **global bulk import** approach that handles all three entities together, with duplicate detection (update or skip existing records).

Key DB fact: `purchase_bills.bill_number` already has a UNIQUE constraint, which we can leverage for upsert logic.

## What to Build

### 1. New Page: Zoho Import (`/zoho-import`)
A dedicated page accessible from the sidebar with 3 tabs:

**Tab 1 -- Import Vendors**
- CSV upload/paste with Zoho Books vendor export format: `company_name, email, phone, tax_id (GSTIN), category, credit_limit, payment_terms, opening_balance, opening_balance_date, notes`
- Duplicate detection: match by `company_name` (case-insensitive). Show "New" / "Existing (will skip)" / "Existing (will update)" badges
- Toggle: "Update existing vendors" or "Skip existing"
- Preview table with validation, then bulk upsert

**Tab 2 -- Import Bills**
- CSV format: `vendor_name, bill_number, bill_date, due_date, total_amount, paid_amount, tax_amount, status, notes`
- Auto-match `vendor_name` to existing `vendor_profiles.company_name` (fuzzy/case-insensitive). Flag unmatched vendors as errors
- Duplicate detection on `bill_number` (UNIQUE constraint exists). Bills with matching bill_number show "Exists -- will update" or "Exists -- will skip"
- Toggle: "Update existing bills" or "Skip existing"
- On import: use Supabase `.upsert()` with `onConflict: 'bill_number'` for updates, or check-then-insert for skip mode

**Tab 3 -- Import Payments**
- CSV format: `vendor_name, bill_number (optional), amount, payment_date, payment_method, status, notes`
- Auto-match vendor_name to vendor_profiles, bill_number to purchase_bills
- No natural unique key for payments, so all valid rows are inserted (no duplicate detection needed -- payments are additive)
- After import, update `paid_amount` and `payment_status` on matched bills via a post-import recalculation

### 2. Duplicate Handling Strategy
- **Vendors**: Match by `company_name` (case-insensitive trim). User chooses update or skip.
- **Bills**: Match by `bill_number` (UNIQUE constraint). User chooses update or skip. Update mode uses `.upsert()`.
- **Payments**: Always insert. After bulk insert, recalculate bill `paid_amount` by summing all payments for each bill.

### 3. Post-Import Reconciliation
After payments import, run a reconciliation step:
- For each bill that had payments imported, sum all `vendor_payments` where `bill_id` matches
- Update `purchase_bills.paid_amount` and `payment_status` accordingly
- This ensures balances stay correct

## Technical Details

### Files
- **New**: `src/pages/ZohoImportPage.tsx` -- Main import page with 3 tabs
- **Edit**: `src/components/AppLayout.tsx` -- Add sidebar nav item
- **Edit**: `src/App.tsx` -- Add route `/zoho-import`

### No DB Migration Needed
The existing schema supports everything. `bill_number` UNIQUE constraint enables upsert. Vendor matching is done client-side by company_name lookup.

### Import Flow (per tab)
1. User uploads CSV or pastes text
2. Client parses rows, validates required fields
3. Client fetches existing records for duplicate matching (vendors by name, bills by bill_number)
4. Preview table shows each row with status badge: "New", "Update", "Skip", or "Error"
5. User clicks Import -- batched upsert/insert in chunks of 50
6. Success toast with count of inserted/updated/skipped

### CSV Parsing
Reuse the same pattern from `ImportBillsDialog` -- split by newlines, split by comma, trim quotes. Handle commas inside quoted fields.

