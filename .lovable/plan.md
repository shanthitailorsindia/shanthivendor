

# Clean Slate Re-import: Delete All Vendors/Bills/Payments + Fix DB Constraint

## Problem
1. **DB unique constraint** on `purchase_bills.bill_number` is global (not per-vendor), causing 409 errors when different vendors share the same bill number (e.g., bill "12" from two vendors).
2. Existing data has accumulated errors from partial imports. User wants to wipe vendors, bills, and payments and re-import fresh from Zoho.

## Current Data Summary
| Table | Rows |
|-------|------|
| vendor_profiles | 175 |
| purchase_bills | 2,485 |
| vendor_payments | 0 |
| purchase_bill_items | 1,551 |
| payment_schedules | 563 |
| expense_transactions | 18 |
| vendor_addresses | 1 |
| vendor_contacts | 78 |
| vendor_payment_terms | 1 |

**Products are NOT affected** -- products table has no FK to vendor_profiles/purchase_bills (only purchase_bill_items references products, but we're deleting bill_items, not products).

## Plan

### Step 1: Database Migration -- Change unique constraint
- Drop `purchase_bills_bill_number_key` (global unique on `bill_number`)
- Add composite unique constraint `unique_vendor_bill_number` on `(vendor_id, bill_number)`
- Also change `vendor_payments` status check to accept "completed" (the import uses "completed" but the constraint only allows "pending", "paid", "overdue")
- Also change `vendor_payments.vendor_id_fkey` to reference `vendor_profiles(id)` instead of `vendors(id)` (currently pointing to the empty `vendors` table)

### Step 2: Add "Reset Data" button to Zoho Import page
Add a clearly labeled "Reset All Import Data" section at the top of the Zoho Import page with:
- Shows current counts of linked records (payment_schedules: 563, expense_transactions: 18, etc.)
- User must confirm they understand linked records will be affected
- Confirmation dialog with typed confirmation (type "RESET" to proceed)
- Delete order (respecting FK constraints):
  1. `vendor_payment_terms` (FK to vendor_profiles, CASCADE)
  2. `vendor_payment_schedules` (FK to vendor_profiles, CASCADE)
  3. `vendor_contacts` (FK to vendor_profiles, CASCADE)
  4. `vendor_addresses` (FK to vendor_profiles, CASCADE)
  5. `vendor_documents` (FK to vendor_profiles, CASCADE)
  6. `vendor_payments` (FK to bills and vendors)
  7. `payment_schedules` (FK to bills and vendors)
  8. `expense_transactions` -- set `vendor_id = NULL` (nullable FK)
  9. `purchase_bill_items` (CASCADE from bills, but explicit is safer)
  10. `purchase_bills` (FK to vendor_profiles)
  11. `vendor_profiles`
- Products table is untouched

### Step 3: Update ZohoImportPage.tsx
- Add the Reset section above the tabs
- Show blocking record counts fetched via queries
- AlertDialog with "RESET" confirmation input
- Execute deletions in correct FK order
- Toast with summary of deleted counts

### Files Changed
- **Migration SQL**: Drop old unique, add composite unique, fix vendor_payments FK and status check
- **`src/pages/ZohoImportPage.tsx`**: Add reset data section with confirmation dialog

