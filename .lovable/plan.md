

# Fix Bills & Payments Import for Zoho Books CSV Format

## Problem
Both the **Bills** and **Payments** tabs use hardcoded column indices (e.g., `cells[0]`, `cells[1]`) which don't match Zoho's actual CSV format. They also use exact vendor name matching instead of the fuzzy matching already built for the Vendors tab.

### Zoho Bill.csv actual columns (key ones):
| Field | Header | Index |
|-------|--------|-------|
| Bill Date | "Bill Date" | 0 |
| Due Date | "Due Date" | 1 |
| Vendor Name | "Vendor Name" | 4 |
| Bill Number | "Bill Number" | 8 |
| SubTotal | "SubTotal" | 12 |
| Total | "Total" | 13 |
| Balance | "Balance" | 14 |
| Bill Status | "Bill Status" | 28 |
| Tax Amount | "Tax Amount" | 39 |
| Item Total | "Item Total" | 40 |

**Important**: Zoho exports one row per **line item**. Multiple rows can share the same Bill Number. We need to **aggregate by bill_number** -- sum item totals and tax amounts, take the bill-level Total, and use the Balance field to determine paid_amount (`Total - Balance = paid_amount`).

### Zoho Vendor_Payment.csv actual columns:
| Field | Header | Index |
|-------|--------|-------|
| Mode | "Mode" | 4 |
| Amount | "Amount" | 7 |
| Payment Status | "Payment Status" | 14 |
| Date | "Date" | 15 |
| Vendor Name | "Vendor Name" | 18 |
| Bill Number | "Bill Number" | 47 |
| Bill Amount | "Bill Amount" | 44 |

**Important**: One payment can be split across multiple bills (same Payment Number, different Bill IDs). Each row shows how much of that payment applies to a specific bill via "Bill Amount".

### Additional issues:
- Both tabs fetch existing data with Supabase's default 1000-row limit, which may miss records
- No fuzzy vendor matching (the `fuzzyMatch` + `normalizeForMatch` helpers exist but aren't used)

## Solution

### BillsImportTab changes:
1. **Header-based mapping** using `buildHeaderMap` + `getByHeader` (already exist)
2. **Aggregate by bill_number**: Group rows with the same bill number, use bill-level `Total` and compute `paid_amount = Total - Balance`
3. **Fuzzy vendor matching** using existing `fuzzyMatch` helper
4. **Remove 1000-row limit** on existing bills/vendors queries (add `.limit(10000)` or paginate)

### PaymentsImportTab changes:
1. **Header-based mapping** for Zoho payment columns
2. **Fuzzy vendor matching** for vendor name lookup
3. **Map bill_number to bill_id** using the "Bill Number" column from Zoho
4. **Use "Bill Amount"** (not "Amount") as the payment amount per bill, since one payment can split across bills
5. **Remove row limits** on queries

### File changes:
**`src/pages/ZohoImportPage.tsx`** -- Rewrite `BillsImportTab` and `PaymentsImportTab`:
- Use `buildHeaderMap`/`getByHeader` for column detection
- Bills: aggregate duplicate bill_number rows, compute paid from Balance
- Payments: map Zoho headers, use Bill Amount for per-bill amounts
- Both: use `fuzzyMatch` for vendor lookup instead of exact match
- Both: increase query limits to handle 3000+ records

