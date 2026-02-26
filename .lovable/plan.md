

# Enhanced Purchase Bill - Search, Tax Toggle & Bulk Upload

## Overview
Three improvements to the Purchase Bill creation flow: (1) searchable product picker with inline creation, (2) tax inclusive/exclusive toggle with proper calculation logic, and (3) bulk upload of items via CSV (item_code + quantity).

---

## 1. Searchable Product Picker

**Current state**: Plain `<select>` dropdown -- hard to find products when the list is long.

**Change**: Replace with a searchable input that filters products by name or item_code as the user types, showing a dropdown of matches. Selecting a match auto-fills the line item. A "+ Create New" option at the bottom opens the inline product creation form (already exists, just needs to be triggered from the new search UI).

**Implementation**:
- Add a `productSearch` state per line item (keyed by `item.key`)
- Render an `<Input>` that filters products by name/item_code on each keystroke
- Show a positioned dropdown list of matching products below the input
- On select, call existing `selectProduct()` and close dropdown
- Keep the existing "+ Create New" option at the bottom of the filtered list
- Use `onBlur` with a small delay to allow click on dropdown items

---

## 2. Tax Inclusive / Exclusive Toggle

**Current state**: There's a GST Inclusive checkbox but it doesn't affect line-item calculations. The `recalcLine` function always calculates tax on top (exclusive).

**Change**: Add a controlled `isGstInclusive` state (boolean toggle at the top of the form). When toggled, recalculate all line items:

- **Exclusive (default)**: base = qty x price, tax = base x rate/100, total = base + tax
- **Inclusive**: total = qty x price (price already includes tax), tax = total - (total / (1 + rate/100)), base = total - tax

The toggle will be a prominent Switch component near the line items header. Changing it recalculates all existing line items immediately.

**`recalcLine` update**:
```
function recalcLine(item, inclusive):
  if exclusive:
    base = qty * price
    tax = base * rate / 100
    total = base + tax
  if inclusive:
    total = qty * price
    base = total / (1 + rate/100)
    tax = total - base
```

The `totals` memo will also adjust subtotal based on the mode.

---

## 3. Bulk Upload (CSV: item_code, quantity)

**Change**: Add a "Bulk Upload" button next to "Add Item". Clicking it opens a section with:
- A file input accepting `.csv` files
- A textarea for manual paste (item_code,quantity per line)
- A "Process" button

**Processing logic**:
1. Parse CSV/text -- each row has `item_code` and `quantity`
2. For each row, look up the product by `item_code` in the already-fetched `products` list
3. If found, add a new line item with all product details auto-filled
4. If not found, show a warning toast listing unmatched item codes
5. All matched items are appended to existing line items

**CSV format expected**:
```
item_code,quantity
SKU001,10
SKU002,5
```

---

## Technical Details

### File modified: `src/pages/PurchaseBillsPage.tsx`

**New state variables**:
- `isGstInclusive: boolean` (default false)
- `productSearchTerms: Record<number, string>` (search text per line item key)
- `showBulkUpload: boolean`

**Updated functions**:
- `recalcLine(item, isInclusive)` -- accepts inclusive flag
- `updateLineItem` -- passes inclusive flag to recalcLine
- `selectProduct` -- passes inclusive flag
- `handleBulkUpload(text: string)` -- new function to parse CSV and add line items
- `totals` memo -- adjusts subtotal calculation based on inclusive mode

**New UI components** (all within existing file):
- Searchable product input with dropdown (replaces `<select>`)
- `Switch` component for GST inclusive/exclusive toggle
- Bulk upload section with file input and textarea

### No database changes needed -- all existing columns support this.

