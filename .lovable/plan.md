

# Fix Zoho Vendor Import: Auto-Map Columns + Fuzzy Matching

## Problem
1. The Zoho Vendors CSV has 60+ columns with headers like "Company Name", "EmailID", "Opening Balance", "GST Identification Number (GSTIN)", etc. The current code maps by column index (0=company, 1=email...) which is completely wrong for Zoho's format.
2. Vendor matching uses exact string comparison. Spelling differences (e.g., "BALAJI COVERING" vs "BALAJI COVERINGS") cause all vendors to show as "New".

## Solution

### 1. Header-Based Column Mapping
When CSV is parsed, detect the header row and build a column-name-to-index map. Then extract fields by header name instead of hardcoded index.

Zoho header mapping:
- "Company Name" or "Contact Name" → `company_name`
- "EmailID" → `email`  
- "Phone" or "MobilePhone" → `phone`
- "GST Identification Number (GSTIN)" → `tax_id`
- "Opening Balance" → `opening_balance`
- "Payment Terms" → `payment_terms`
- "Notes" → `notes`
- "Status" → `status`
- "Beneficiary Name" → bank beneficiary
- "Vendor Bank Account Number" → bank account
- "Vendor Bank Name" → bank name
- "Vendor Bank Code" (IFSC) → bank code
- "Billing Address", "Billing City", "Billing State", "Billing Code" → address fields

### 2. Fuzzy Matching for Duplicate Detection
Instead of exact match, normalize both sides by:
- Lowercase
- Remove all spaces, punctuation, special characters
- Strip common suffixes like "pvt", "ltd", "enterprises", "traders"

Then also add a **similarity score** approach: if normalized names match, it's a direct hit. If not, check if one contains the other (substring match) as a secondary match with a "Possible Match" badge the user can confirm.

### 3. Show Matched-To Column
Add a column in the preview table showing which existing vendor it matched to (and the match type: Exact / Fuzzy / None), so the user can verify before importing.

## File Changes

**`src/pages/ZohoImportPage.tsx`** -- VendorsImportTab section only:
- Add `detectZohoHeaders()` function that maps Zoho column names to field names
- Replace hardcoded `cells[0]`, `cells[1]` with header-based lookup
- Add `normalizeForMatch(name)` function that strips spaces/punctuation/case
- Update `vendorMap` to use normalized keys
- Add "Matched To" column in preview table
- Extract additional Zoho fields: GSTIN, bank details, address, mobile phone

