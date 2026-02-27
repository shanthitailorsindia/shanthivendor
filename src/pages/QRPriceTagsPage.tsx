import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Printer, QrCode } from "lucide-react";
import QRCode from "qrcode";

type StickerSize = "jewellery-tag" | "2-across" | "4-across";

interface ProductData {
  id: string;
  name: string;
  item_code: string;
  unit_price: number;
  cost_price: number;
  hsn_code: string;
  gst_rate: number;
  category: string | null;
}

/* ── Tag Components ─────────────────────────────────────────── */

function JewelleryTag({ product, formatCurrency }: { product: ProductData; formatCurrency: (n: number) => string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current && product.item_code) {
      QRCode.toCanvas(canvasRef.current, product.item_code, { width: 60, margin: 1, errorCorrectionLevel: "M" });
    }
  }, [product.item_code]);

  return (
    <div className="flex items-center gap-2 border border-dashed border-border rounded p-2 animate-fade-in" style={{ maxWidth: 340 }}>
      <div className="flex flex-col items-center shrink-0">
        <canvas ref={canvasRef} />
        <p className="text-[8px] text-muted-foreground font-mono mt-0.5">{product.item_code}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-foreground uppercase truncate">{product.name}</p>
        <p className="text-sm font-extrabold text-foreground">{formatCurrency(Number(product.unit_price))}</p>
        <p className="text-[8px] text-muted-foreground">MRP incl. {Number(product.gst_rate)}% GST</p>
      </div>
    </div>
  );
}

function TwoAcrossTag({ product, formatCurrency }: { product: ProductData; formatCurrency: (n: number) => string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isReadymade = product.category?.toLowerCase().includes("readymade") || product.category?.toLowerCase().includes("costume");

  useEffect(() => {
    if (canvasRef.current && product.item_code) {
      QRCode.toCanvas(canvasRef.current, product.item_code, { width: 120, margin: 1, errorCorrectionLevel: "M" });
    }
  }, [product.item_code]);

  return (
    <div className="flex border border-dashed border-border rounded-lg p-3 gap-3 animate-fade-in">
      <div className="flex flex-col items-center shrink-0">
        <canvas ref={canvasRef} />
        <p className="text-[9px] text-muted-foreground font-mono mt-1">{product.item_code}</p>
      </div>
      <div className="min-w-0 flex flex-col justify-center">
        <p className="text-[10px] font-bold text-muted-foreground tracking-wide">SHANTHI TAILORS</p>
        <p className="text-xs font-bold text-foreground uppercase truncate mt-1">{product.name}</p>
        {isReadymade && <p className="text-[9px] text-muted-foreground">Readymade Costume</p>}
        <p className="text-base font-extrabold text-foreground mt-1">Our Price : {formatCurrency(Number(product.unit_price))}</p>
        <p className="text-[8px] text-muted-foreground">MRP incl. {Number(product.gst_rate)}% GST</p>
      </div>
    </div>
  );
}

function FourAcrossTag({ product, formatCurrency }: { product: ProductData; formatCurrency: (n: number) => string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current && product.item_code) {
      QRCode.toCanvas(canvasRef.current, product.item_code, { width: 80, margin: 1, errorCorrectionLevel: "M" });
    }
  }, [product.item_code]);

  return (
    <div className="border border-dashed border-border rounded-lg p-2 text-center animate-fade-in">
      <p className="text-[9px] font-bold text-muted-foreground tracking-wide mb-1">SHANTHI TAILORS</p>
      <div className="flex items-center justify-center gap-2">
        <canvas ref={canvasRef} />
        <p className="text-base font-extrabold text-foreground">{formatCurrency(Number(product.unit_price))}</p>
      </div>
      <p className="text-[10px] font-bold text-foreground uppercase truncate mt-1">{product.name}</p>
      <p className="text-[8px] text-muted-foreground font-mono">{product.item_code}</p>
    </div>
  );
}

/* ── Grid columns per format ───────────────────────────────── */

const gridColsClass: Record<StickerSize, string> = {
  "jewellery-tag": "grid-cols-1",
  "2-across": "grid-cols-2",
  "4-across": "grid-cols-4",
};

const printGridCols: Record<StickerSize, number> = {
  "jewellery-tag": 1,
  "2-across": 2,
  "4-across": 4,
};

/* ── Main Page ─────────────────────────────────────────────── */

export default function QRPriceTagsPage() {
  const [search, setSearch] = useState("");
  const [stickerCounts, setStickerCounts] = useState<Record<string, number>>({});
  const [stickerSize, setStickerSize] = useState<StickerSize>("2-across");
  const printRef = useRef<HTMLDivElement>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products-for-qr"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, item_code, unit_price, cost_price, hsn_code, gst_rate, category")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as ProductData[];
    },
  });

  const filtered = products?.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.item_code?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setStickerCounts(prev => {
      const next = { ...prev };
      if (id in next) { delete next[id]; } else { next[id] = 1; }
      return next;
    });
  };

  const selectAll = () => {
    if (filtered?.length && Object.keys(stickerCounts).length === filtered.length) {
      setStickerCounts({});
    } else {
      const next: Record<string, number> = {};
      filtered?.forEach(p => { next[p.id] = stickerCounts[p.id] || 1; });
      setStickerCounts(next);
    }
  };

  const updateCount = (id: string, count: number) => {
    setStickerCounts(prev => ({ ...prev, [id]: Math.max(1, count) }));
  };

  const selectedProducts = products?.filter(p => p.id in stickerCounts) ?? [];
  const totalStickers = Object.values(stickerCounts).reduce((s, n) => s + n, 0);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  /* ── Print ─────────────────────────────────────────────────── */

  const handlePrint = async () => {
    if (selectedProducts.length === 0) return;

    const qrImages: Record<string, string> = {};
    const qrWidth = stickerSize === "jewellery-tag" ? 60 : stickerSize === "2-across" ? 120 : 80;
    await Promise.all(
      selectedProducts.map(async (p) => {
        qrImages[p.id] = await QRCode.toDataURL(p.item_code, { width: qrWidth, margin: 1, errorCorrectionLevel: "M" });
      })
    );

    const cols = printGridCols[stickerSize];

    const tagHtml = (p: ProductData) => {
      const isReadymade = p.category?.toLowerCase().includes("readymade") || p.category?.toLowerCase().includes("costume");

      if (stickerSize === "jewellery-tag") {
        return `<div class="tag tag-jewellery">
          <div class="qr-side"><img src="${qrImages[p.id]}" width="60" height="60"/><p class="code">${p.item_code}</p></div>
          <div class="info-side">
            <p class="pname">${p.name}</p>
            <p class="price">${formatCurrency(Number(p.unit_price))}</p>
            <p class="mrp">MRP incl. ${Number(p.gst_rate)}% GST</p>
          </div>
        </div>`;
      }
      if (stickerSize === "2-across") {
        return `<div class="tag tag-2across">
          <div class="qr-side"><img src="${qrImages[p.id]}" width="120" height="120"/><p class="code">${p.item_code}</p></div>
          <div class="info-side">
            <p class="shop">SHANTHI TAILORS</p>
            <p class="pname">${p.name}</p>
            ${isReadymade ? '<p class="cat">Readymade Costume</p>' : ""}
            <p class="price">Our Price : ${formatCurrency(Number(p.unit_price))}</p>
            <p class="mrp">MRP incl. ${Number(p.gst_rate)}% GST</p>
          </div>
        </div>`;
      }
      // 4-across
      return `<div class="tag tag-4across">
        <p class="shop">SHANTHI TAILORS</p>
        <div class="mid"><img src="${qrImages[p.id]}" width="80" height="80"/><p class="price">${formatCurrency(Number(p.unit_price))}</p></div>
        <p class="pname">${p.name}</p>
        <p class="code">${p.item_code}</p>
      </div>`;
    };

    const tagsHtml = selectedProducts.flatMap(p =>
      Array.from({ length: stickerCounts[p.id] || 1 }, () => tagHtml(p))
    ).join("");

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>QR Price Tags</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Inter',system-ui,sans-serif}
      .grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;padding:12px}
      .tag{border:2px dashed #d1d5db;border-radius:8px;padding:10px;page-break-inside:avoid}
      /* Jewellery */
      .tag-jewellery{display:flex;align-items:center;gap:8px;padding:6px}
      .tag-jewellery .qr-side{display:flex;flex-direction:column;align-items:center}
      .tag-jewellery .code{font-size:8px;color:#6b7280;font-family:monospace;margin-top:2px}
      .tag-jewellery .pname{font-size:10px;font-weight:700;text-transform:uppercase}
      .tag-jewellery .price{font-size:16px;font-weight:800}
      .tag-jewellery .mrp{font-size:8px;color:#6b7280}
      /* 2-across */
      .tag-2across{display:flex;gap:12px}
      .tag-2across .qr-side{display:flex;flex-direction:column;align-items:center;flex-shrink:0}
      .tag-2across .code{font-size:9px;color:#6b7280;font-family:monospace;margin-top:4px}
      .tag-2across .info-side{display:flex;flex-direction:column;justify-content:center}
      .tag-2across .shop{font-size:10px;font-weight:700;color:#6b7280;letter-spacing:1px}
      .tag-2across .pname{font-size:12px;font-weight:700;text-transform:uppercase;margin-top:4px}
      .tag-2across .cat{font-size:9px;color:#6b7280}
      .tag-2across .price{font-size:16px;font-weight:800;margin-top:4px}
      .tag-2across .mrp{font-size:8px;color:#6b7280}
      /* 4-across */
      .tag-4across{text-align:center}
      .tag-4across .shop{font-size:9px;font-weight:700;color:#6b7280;letter-spacing:1px;margin-bottom:4px}
      .tag-4across .mid{display:flex;align-items:center;justify-content:center;gap:8px;margin:4px 0}
      .tag-4across .price{font-size:16px;font-weight:800}
      .tag-4across .pname{font-size:10px;font-weight:700;text-transform:uppercase}
      .tag-4across .code{font-size:8px;color:#6b7280;font-family:monospace}
      @media print{.grid{gap:6px;padding:6px}.tag{border-width:1px}}
    </style></head><body><div class="grid">${tagsHtml}</div></body></html>`);
    win.document.close();
    win.print();
  };

  /* ── Render Tag by format ───────────────────────────────────── */

  const renderTag = (p: ProductData, key?: string) => {
    const k = key || p.id;
    switch (stickerSize) {
      case "jewellery-tag": return <JewelleryTag key={k} product={p} formatCurrency={formatCurrency} />;
      case "2-across": return <TwoAcrossTag key={k} product={p} formatCurrency={formatCurrency} />;
      case "4-across": return <FourAcrossTag key={k} product={p} formatCurrency={formatCurrency} />;
    }
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">QR Price Tags</h1>
          <p className="page-subtitle">Generate and print QR code-based price tags for products</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={stickerSize} onValueChange={(v) => setStickerSize(v as StickerSize)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jewellery-tag">Jewellery Tag (92×15mm)</SelectItem>
              <SelectItem value="2-across">2 Across (50×25mm)</SelectItem>
              <SelectItem value="4-across">4 Across (25×20mm)</SelectItem>
            </SelectContent>
          </Select>
          {totalStickers > 0 && (
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />Print {totalStickers} Tags
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Selection */}
        <div>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="data-table-container">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={filtered?.length ? Object.keys(stickerCounts).length === filtered.length : false}
                  onCheckedChange={selectAll}
                />
                <span className="text-xs font-medium text-muted-foreground">Select All</span>
              </div>
              <span className="text-xs text-muted-foreground">{Object.keys(stickerCounts).length} selected · {totalStickers} stickers</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto divide-y">
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground text-sm">Loading...</div>
              ) : filtered?.map((p) => (
                <label key={p.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors">
                  <Checkbox checked={p.id in stickerCounts} onCheckedChange={() => toggleSelect(p.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.item_code}</p>
                  </div>
                  {p.id in stickerCounts ? (
                    <Input
                      type="number"
                      min={1}
                      value={stickerCounts[p.id]}
                      onChange={e => updateCount(p.id, parseInt(e.target.value) || 1)}
                      onClick={e => e.stopPropagation()}
                      onMouseDown={e => e.stopPropagation()}
                      className="w-16 h-8 text-center text-sm"
                    />
                  ) : (
                    <p className="text-sm font-semibold font-mono text-foreground">{formatCurrency(Number(p.unit_price))}</p>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Tag Preview */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <QrCode className="h-4 w-4" />Preview
          </h2>

          {selectedProducts.length === 0 ? (
            <div className="data-table-container flex flex-col items-center justify-center py-16">
              <QrCode className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Select products to preview tags</p>
            </div>
          ) : (
            <div ref={printRef}>
              <div className={`grid ${gridColsClass[stickerSize]} gap-3`}>
                {selectedProducts.flatMap(p =>
                  Array.from({ length: stickerCounts[p.id] || 1 }, (_, i) =>
                    renderTag(p, `${p.id}-${i}`)
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
