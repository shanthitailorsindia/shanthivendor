import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Printer, QrCode } from "lucide-react";
import QRCode from "qrcode";

function QRTag({ product, formatCurrency }: { product: any; formatCurrency: (n: number) => string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && product.item_code) {
      QRCode.toCanvas(canvasRef.current, product.item_code, {
        width: 80,
        margin: 1,
        errorCorrectionLevel: 'M',
      });
    }
  }, [product.item_code]);

  return (
    <div className="qr-tag animate-fade-in">
      <p className="text-xs font-bold text-foreground uppercase truncate">{product.name}</p>
      <p className="text-[10px] text-muted-foreground font-mono mb-2">{product.item_code}</p>
      <div className="qr-container flex justify-center my-2">
        <canvas ref={canvasRef} />
      </div>
      <p className="text-lg font-extrabold text-foreground">{formatCurrency(Number(product.unit_price))}</p>
      <p className="text-[9px] text-muted-foreground">MRP incl. {Number(product.gst_rate)}% GST</p>
      {product.hsn_code && <p className="text-[8px] text-muted-foreground mt-0.5">HSN: {product.hsn_code}</p>}
    </div>
  );
}

export default function QRPriceTagsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const printRef = useRef<HTMLDivElement>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products-for-qr"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, item_code, unit_price, cost_price, hsn_code, gst_rate")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = products?.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.item_code?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (filtered?.length === selected.size) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered?.map(p => p.id)));
    }
  };

  const selectedProducts = products?.filter(p => selected.has(p.id)) ?? [];

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const handlePrint = async () => {
    const content = printRef.current;
    if (!content || selectedProducts.length === 0) return;

    // Generate QR data URLs for each product
    const qrImages: Record<string, string> = {};
    await Promise.all(
      selectedProducts.map(async (p) => {
        qrImages[p.id] = await QRCode.toDataURL(p.item_code, { width: 80, margin: 1, errorCorrectionLevel: 'M' });
      })
    );

    const tagsHtml = selectedProducts.map(p => `
      <div class="tag">
        <p class="tag-name">${p.name}</p>
        <p class="tag-code">${p.item_code}</p>
        <div class="qr-container"><img src="${qrImages[p.id]}" width="80" height="80" /></div>
        <p class="tag-price">${formatCurrency(Number(p.unit_price))}</p>
        <p class="tag-mrp">MRP incl. ${Number(p.gst_rate)}% GST</p>
        ${p.hsn_code ? `<p class="tag-gst">HSN: ${p.hsn_code}</p>` : ''}
      </div>
    `).join('');

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
      <head>
        <title>QR Price Tags</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', system-ui, sans-serif; }
          .tags-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px; }
          .tag { border: 2px dashed #d1d5db; border-radius: 8px; padding: 16px; text-align: center; page-break-inside: avoid; }
          .tag-name { font-size: 13px; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; }
          .tag-code { font-size: 10px; color: #6b7280; margin-bottom: 8px; font-family: monospace; }
          .tag-price { font-size: 20px; font-weight: 800; margin-top: 8px; }
          .tag-mrp { font-size: 9px; color: #6b7280; margin-top: 2px; }
          .tag-gst { font-size: 8px; color: #9ca3af; margin-top: 2px; }
          .qr-container { display: flex; justify-content: center; margin: 8px 0; }
          @media print { .tags-grid { gap: 8px; padding: 8px; } .tag { border-width: 1px; } }
        </style>
      </head>
      <body><div class="tags-grid">${tagsHtml}</div></body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">QR Price Tags</h1>
          <p className="page-subtitle">Generate and print QR code-based price tags for products</p>
        </div>
        {selectedProducts.length > 0 && (
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />Print {selectedProducts.length} Tags
          </Button>
        )}
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
                  checked={filtered?.length ? filtered.length === selected.size : false}
                  onCheckedChange={selectAll}
                />
                <span className="text-xs font-medium text-muted-foreground">Select All</span>
              </div>
              <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto divide-y">
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground text-sm">Loading...</div>
              ) : filtered?.map((p) => (
                <label key={p.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors">
                  <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.item_code}</p>
                  </div>
                  <p className="text-sm font-semibold font-mono text-foreground">{formatCurrency(Number(p.unit_price))}</p>
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
              <div className="tags-grid grid grid-cols-2 gap-3">
                {selectedProducts.map((p) => (
                  <QRTag key={p.id} product={p} formatCurrency={formatCurrency} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
