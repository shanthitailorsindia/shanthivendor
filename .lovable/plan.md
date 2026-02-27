

# Add "Number of Stickers" per Product

## What Changes

Add a quantity (copies) input for each selected product, so when printing, each product's tag is repeated the specified number of times.

## UI Changes

### Product List - Quantity Input
In the product selection list, once a product is checked, show a small number input (default: 1) next to the price. This lets the user specify how many sticker copies to print for that product.

### State Change
Replace `selected: Set<string>` with `stickerCounts: Record<string, number>` (maps product ID to copy count). A product is "selected" when its count is >= 1. Default count on check = 1.

### Preview
In the tag preview, repeat each product's tag according to its count. For example, if "Gold Ring" has count 3, show 3 identical tags in the preview grid.

### Print
In `handlePrint`, repeat each product's tag HTML by its count, so the print output contains the correct number of copies.

### Header
Update the Print button label to show total sticker count (sum of all quantities), e.g. "Print 12 Tags".

## Technical Details

### State
```text
// Replace:
const [selected, setSelected] = useState<Set<string>>(new Set());

// With:
const [stickerCounts, setStickerCounts] = useState<Record<string, number>>({});
```

### Derived values
- `selected` products: `Object.keys(stickerCounts).filter(id => stickerCounts[id] > 0)`
- `totalStickers`: sum of all counts
- `selectedProducts`: products filtered by selected IDs

### Toggle / Select All
- `toggleSelect(id)`: if product exists in counts, remove it; otherwise set count to 1
- `selectAll`: set all filtered products to count 1, or clear all
- Checkbox `checked` state derived from `id in stickerCounts`

### Quantity Input
- Small `Input type="number"` (w-16, min=1) shown inline in the product row when checked
- Changing the value updates `stickerCounts[id]`
- Clicking the number input should not toggle the checkbox (stop propagation)

### Preview Rendering
```text
selectedProducts.flatMap(p =>
  Array.from({ length: stickerCounts[p.id] || 1 }, (_, i) =>
    renderTag(p, `${p.id}-${i}`)
  )
)
```

### Print Logic
In `handlePrint`, repeat `tagHtml(p)` by `stickerCounts[p.id]` times for each product.

### File Modified
- `src/pages/QRPriceTagsPage.tsx` -- all changes in this single file
