

# QR Price Tags - 3 Sticker Size Formats

## What Changes

Add a **Sticker Format** selector to the QR Price Tags page with 3 options, each having a different tag design:

| Format | Dimensions | Layout |
|--------|-----------|--------|
| **Jewellery Tag** | 92x15mm | Compact horizontal: QR on left, item code below QR, product name + price on right |
| **2 Across** | 50x25mm | Two-column print: QR + item code on left, shop name + product name + price on right |
| **4 Across** | 25x20mm | Compact vertical: shop name on top, QR + price side-by-side, product name + item code below |

## Implementation Details

### 1. Add format selector (Select dropdown)

Add a `stickerSize` state (`"jewellery-tag" | "2-across" | "4-across"`, default `"2-across"`) and render a `Select` component in the page header area next to the Print button.

### 2. Create 3 QRTag variants

Replace the single `QRTag` component with format-aware rendering:

- **Jewellery Tag**: Narrow horizontal strip layout. QR code (60px) on the left side, item code underneath. Right side shows product name and price in small text. Minimal padding.
- **2 Across**: Card layout with left column (QR code 120px + item code) and right column ("SHANTHI TAILORS" header, product name, price as "Our Price: ..."). Includes color/size if the product category contains "readymade".
- **4 Across**: Small compact card. "SHANTHI TAILORS" at top, QR (80px) and price side by side in the middle, product name and item code at the bottom.

### 3. Update preview grid

Adjust the preview grid columns based on format:
- Jewellery Tag: 1 column (tags are wide/narrow)
- 2 Across: 2 columns
- 4 Across: 4 columns (smaller tags)

### 4. Update print logic

Update `handlePrint` to generate format-specific HTML for the print window, matching the designs above. The print grid columns will also match the format (jewellery: 1 col, 2-across: 2 cols, 4-across: 4 cols).

### 5. Fetch additional fields

Update the product query to also fetch `category_id` (and join category name if available) plus any `color`/`size` fields, needed for the 2-across readymade costume variant.

### File modified
- `src/pages/QRPriceTagsPage.tsx` -- all changes in this single file

