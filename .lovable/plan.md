

# Purchase Bills: Edit, Delete, File Upload + Products: Bulk Upload

## Part 1: Purchase Bills - Edit, Delete, and Bill File Upload

### 1A. Storage Bucket for Bill Uploads
Create a Supabase storage bucket `purchase-bills` (public) so users can upload bill files (PDF/images) directly instead of pasting URLs.

**Migration SQL:**
- Create `purchase-bills` storage bucket
- Add RLS policies for insert/select/delete on `storage.objects`

### 1B. Actions Column on Bills Table
Replace the current "Bill" column with an **Actions** column containing 4 icon buttons per row:
- **Eye** - View bill details (read-only dialog)
- **Pencil** - Edit bill (full form dialog)
- **Trash2** - Delete bill (confirmation dialog)
- **QrCode** - Print QR tags for all products in the bill

### 1C. View Bill Dialog
- Read-only dialog showing bill header (bill number, vendor, dates, status, payment info, notes)
- Fetch and display `purchase_bill_items` in a table (product, code, qty, price, tax, total)
- Show bill file preview/download link if uploaded
- Display totals summary

### 1D. Edit Bill Dialog
- Full form dialog pre-filled with existing bill data
- Fetch `purchase_bill_items` and load into the same line-item editor (reusing `ProductSearchInput`)
- **Bill file upload**: Replace the URL input with a file upload input that uploads to `purchase-bills` bucket. Show existing file if present, with option to replace
- On save: update `purchase_bills` row, delete old items, insert updated items
- Support GST inclusive/exclusive toggle, discount, and all header fields

### 1E. Delete Bill
- `AlertDialog` confirmation: "This will permanently delete the bill and all its line items"
- Delete `purchase_bill_items` by `bill_id`, then delete the `purchase_bills` row
- Invalidate queries on success

### 1F. QR Print from Bill
- Dialog that fetches all `purchase_bill_items` for the bill, then fetches corresponding product data
- **Sticker Format** selector (Jewellery Tag / 2 Across / 4 Across) - same 3 formats from QR Price Tags page
- **Number of stickers** per product (default = quantity from bill item)
- Preview grid + Print button
- Reuses the same tag HTML generation logic from `QRPriceTagsPage`

### 1G. Update Create Bill Form
- Replace the "Bill URL" + "Bill Filename" fields with a **file upload** input
- Upload file to `purchase-bills` bucket, store the public URL in `original_bill_url` and filename in `original_bill_filename`

---

## Part 2: Products - Bulk Upload

### 2A. Bulk Upload Dialog in Products Page
Add a **Bulk Upload** button next to the "Add Product" button that opens a dialog with:
- **CSV file upload** input (accepts .csv, .xlsx)
- **Paste text area** for CSV data
- Expected format header row: `name, item_code, cost_price, unit_price, hsn_code, gst_rate, quantity_in_stock, category_text, subcategory, product_type`
- **Preview table** showing parsed rows before import (with validation status per row)
- **Import** button to insert all valid rows

### 2B. CSV Processing Logic
- Parse CSV text (split by newlines and commas)
- Validate required fields: `name`, `item_code`, `cost_price`, `unit_price`, `hsn_code`, `gst_rate`
- Skip header row if detected
- Show count of valid vs invalid rows
- Insert valid products into `products` table with `is_active: true`
- Report errors for failed rows (duplicate item_code, missing fields)
- Invalidate products query on success

---

## Technical Details

### New State Variables (PurchaseBillsPage)
```text
viewBillId, editBillId, deleteBillId, qrBillId -- string | null for each dialog
```

### New Mutations (PurchaseBillsPage)
- `updateBill` -- update header + replace line items
- `deleteBill` -- delete items then bill
- `uploadBillFile` -- upload to storage bucket

### Files Modified
- `src/pages/PurchaseBillsPage.tsx` -- Add actions, view/edit/delete/QR dialogs, file upload
- `src/pages/ProductsPage.tsx` -- Add bulk upload button and dialog

### Database Migration
- Create `purchase-bills` storage bucket with public access and RLS policies
