

# Fix Payments Import: FK Constraint + Logic Issues

## Root Causes

1. **FK constraint points to wrong table**: `vendor_payments.vendor_id` references `vendors` (empty table) instead of `vendor_profiles`. Every insert fails with a foreign key violation.
2. **"Vendor not found" blocks rows unnecessarily**: The preview marks rows as errors when vendor isn't matched, but the import logic already auto-creates missing vendors. These rows should show "Will Create" not "error".
3. **"Bill not found" blocks rows unnecessarily**: Many Zoho payments reference bills like "Vendor opening balance" that may not exist. Payments without matching bills should still import (with `bill_id: null`).
4. **Bill lookup doesn't account for composite key**: `billMap` uses just `bill_number`, but since the constraint is now `(vendor_id, bill_number)`, lookup should use vendor context.

## Changes

### Migration SQL
- Drop `vendor_payments_vendor_id_fkey` referencing `vendors`
- Add new FK referencing `vendor_profiles(id)` with `ON DELETE SET NULL`

### PaymentsImportTab logic fixes (ZohoImportPage.tsx)
1. **Remove "Vendor not found" from errors** -- instead, treat unmatched vendors as "will create" (already works in import, just not in preview validation)
2. **Remove "Bill not found" from errors** -- allow payments without bill linkage; just show a warning badge
3. **Fix billMap** to use composite key `vendorId::billNumber` for accurate lookups
4. **Add progress indicator** for large imports (4000+ rows) -- show "Importing batch X of Y"
5. **Increase batch size** consideration and add error recovery per-row fallback

### Files
- **Migration**: Fix `vendor_payments_vendor_id_fkey` to reference `vendor_profiles`
- **`src/pages/ZohoImportPage.tsx`**: Fix validation logic in `PaymentsImportTab`

