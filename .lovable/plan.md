

# Vendor Management System Enhancements

## Overview
Three improvements: (1) pull all database fields for vendors/bills/payments, (2) organize products by category/subcategory, and (3) add product creation form with full details.

---

## 1. Pull All Database Fields

### Vendors Page
The current page only shows: name, contact, phone, email, payment_terms, balance, status. The database also has `notes`, `created_at`, `updated_at`. Will add:
- Notes display on vendor cards
- Created date
- Edit/view detail capability with all fields visible
- Address fields if present

### Purchase Bills Page
Currently shows basic fields. Database also has: `currency`, `original_bill_url`, `original_bill_filename`, `discount_type`, `discount_value`, `discount_amount`, `is_gst_inclusive`. Will:
- Add discount fields to the create form (discount type, value)
- Show discount and GST inclusive info in the table
- Add bill attachment URL display
- Update the create form to include all fields

### Payments Page  
Currently shows vendor, date, method, amount, status. Database has: `amount`, `due_date`, `payment_date`, `payment_amount`, `payment_method`, `bill_id`, `notes`. Will:
- Show bill reference in table
- Show notes
- Display both amount and payment_amount properly
- Show due_date vs payment_date

---

## 2. Products Page - Category/Subcategory Organization

The database has a `categories` table with `parent_id` for hierarchy (e.g., "Saree" -> "Kanchipuram Silk", "Cotton Sarees"). Products have `category_id` linking to this table.

Will restructure ProductsPage to:
- Fetch categories from the `categories` table
- Add a category sidebar/filter with parent categories and expandable subcategories
- Group products by category in the table view
- Add category filter dropdown
- Show category and subcategory names instead of raw IDs

---

## 3. Add Product Form with Full Details

Create a comprehensive "Add Product" dialog with all database fields:
- **Basic**: name, item_code, description, product_type
- **Pricing**: unit_price, cost_price, gst_rate, hsn_code
- **Inventory**: quantity_in_stock, initial_stock, reorder_level
- **Classification**: category_id (dropdown from categories table), category (text), subcategory (text)
- **Media**: image_url
- **Metadata**: meta_title, meta_description, tags, features
- **Other**: supplier_id, store_id, is_active

The form will use the categories dropdown populated from the database, with parent/child hierarchy.

---

## Technical Details

### Files to modify:
1. **`src/pages/VendorsPage.tsx`** - Add all vendor fields display and enhanced add form
2. **`src/pages/PurchaseBillsPage.tsx`** - Add discount, GST inclusive, and attachment fields to form and table
3. **`src/pages/PaymentsPage.tsx`** - Show bill reference and notes in table
4. **`src/pages/ProductsPage.tsx`** - Major rewrite: category filtering, add product dialog with all fields
5. **`src/pages/Dashboard.tsx`** - No changes needed

### Data queries to update:
- Products query: join with `categories` table to get category names
- Bills query: already fetches `*`, just need to display more fields
- Payments query: already fetches `*`, need to join bill_number for display

### No database migrations needed - all tables and columns already exist.

