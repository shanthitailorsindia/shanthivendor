
# Vendor Management System - Detailed Views & Line-Item Bills

## Overview
Two major enhancements: (1) Individual vendor detail pages showing complete profile, balance summary, purchase history, and payment history. (2) Detailed purchase bill creation with line items that can reference existing products or create new ones inline.

---

## 1. Individual Vendor Detail Page

### New Route: `/vendors/:id`
Create a new page `src/pages/VendorDetailPage.tsx` that shows everything about a single vendor in one place.

**Sections:**
- **Header**: Company name, status badge, category, contact info (phone, email, website)
- **Financial Summary Cards**: Opening balance, current balance (from `vendor_balance_summary` view), total purchases, total payments
- **Profile Details**: Tax ID (GSTIN), registration number, credit limit, payment terms, preferred payment method, preferred currency, notes
- **Related Data Tabs** (using Radix Tabs):
  - **Purchase Bills Tab**: Table of all `purchase_bills` where `vendor_id` matches, showing bill number, date, amounts, payment status
  - **Payments Tab**: Table of all `vendor_payments` where `vendor_id` matches, showing date, amount, method, bill reference, status
  - **Contacts Tab**: List from `vendor_contacts` table (first_name, last_name, designation, department, phone, email)
  - **Addresses Tab**: List from `vendor_addresses` table (address lines, city, state, postal_code, country, type)
  - **Documents Tab**: List from `vendor_documents` table (file_name, document_type, file_url)

**Navigation**: Clicking a vendor card on VendorsPage navigates to `/vendors/:id`. Add a back button on the detail page.

### Files Changed
- `src/pages/VendorDetailPage.tsx` -- new file
- `src/App.tsx` -- add route `/vendors/:id`
- `src/pages/VendorsPage.tsx` -- make vendor cards clickable (Link to detail page)

---

## 2. Detailed Purchase Bill with Line Items

### Redesigned Bill Creation Flow
Replace the current "New Bill" dialog with a full-page or large dialog that supports adding individual line items.

**Bill Header Fields** (same as now): Bill number, vendor, bill date, due date, currency, GST inclusive, notes, bill URL/filename, status.

**Line Items Section** (new):
Each line item row has:
- Product selector (searchable dropdown from `products` table) OR "Create New" option
- Item code (auto-filled from selected product)
- Description (auto-filled, editable)
- Quantity
- Unit price (auto-filled from product's cost_price, editable)
- Tax rate (auto-filled from product's GST rate, editable)
- Tax amount (calculated: quantity x unit_price x tax_rate / 100)
- Total amount (calculated: quantity x unit_price + tax_amount)
- Remove button

**"Create New Product" inline**: When user clicks "Create New" in the product selector, a mini-form expands or a sub-dialog opens with: name, item_code, cost_price, unit_price, hsn_code, gst_rate, category_id, quantity_in_stock. On save, it inserts into `products` table and auto-selects it in the line item.

**Auto-calculated Totals**:
- Subtotal = sum of all line item totals (before discount)
- Discount (type + value as before)
- Tax total = sum of all line item tax amounts
- Grand total = subtotal - discount + tax (or adjusted if GST inclusive)

**Save Flow**:
1. Insert into `purchase_bills` with header data + calculated totals
2. Insert each line item into `purchase_bill_items` with `bill_id`, `product_id`, description, quantity, unit_price, tax_rate, tax_amount, total_amount

### Files Changed
- `src/pages/PurchaseBillsPage.tsx` -- redesign the create bill dialog with line items, product search, inline product creation

---

## Technical Details

### Data Queries
- Vendor detail page uses `vendor_balance_summary` view for current balance
- Uses separate queries for `vendor_contacts`, `vendor_addresses`, `vendor_documents` filtered by `vendor_id`
- Bill creation queries `products` table for the searchable product dropdown
- Line items saved to `purchase_bill_items` table (bill_id, product_id, description, item_code, quantity, unit_price, tax_rate, tax_amount, total_amount)

### State Management for Line Items
- Use React `useState` with an array of line item objects
- Each item tracks: `productId`, `description`, `itemCode`, `quantity`, `unitPrice`, `taxRate`, `taxAmount`, `totalAmount`
- Recalculate tax and total on quantity/price/rate changes
- Product search uses a filtered list from the products query

### No Database Migrations Needed
All required tables already exist: `purchase_bill_items`, `vendor_contacts`, `vendor_addresses`, `vendor_documents`, `vendor_balance_summary` (view).
