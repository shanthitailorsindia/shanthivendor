import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, ExternalLink, Trash2, PackagePlus, Upload } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface LineItem {
  key: number;
  product_id: string;
  description: string;
  item_code: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
}

const emptyLineItem = (key: number): LineItem => ({
  key, product_id: "", description: "", item_code: "",
  quantity: 1, unit_price: 0, tax_rate: 0, tax_amount: 0, total_amount: 0,
});

function recalcLine(item: LineItem, isInclusive: boolean): LineItem {
  if (isInclusive) {
    const total = item.quantity * item.unit_price;
    const base = total / (1 + item.tax_rate / 100);
    const tax = total - base;
    return { ...item, tax_amount: Math.round(tax * 100) / 100, total_amount: Math.round(total * 100) / 100 };
  }
  const base = item.quantity * item.unit_price;
  const tax = base * item.tax_rate / 100;
  return { ...item, tax_amount: Math.round(tax * 100) / 100, total_amount: Math.round((base + tax) * 100) / 100 };
}

/* ── Searchable Product Picker ── */
function ProductSearchInput({
  products,
  value,
  onSelect,
  onCreateNew,
}: {
  products: { id: string; name: string; item_code: string }[];
  value: string;
  onSelect: (productId: string) => void;
  onCreateNew: () => void;
}) {
  const [term, setTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedProduct = products.find(p => p.id === value);
  const displayValue = selectedProduct ? selectedProduct.name : term;

  const filtered = useMemo(() => {
    if (!term) return products.slice(0, 50);
    const lower = term.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(lower) || p.item_code?.toLowerCase().includes(lower)
    ).slice(0, 50);
  }, [products, term]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={showDropdown ? term : displayValue}
        placeholder="Search product..."
        className="h-8 text-sm"
        onFocus={() => {
          setShowDropdown(true);
          setTerm("");
        }}
        onChange={e => {
          setTerm(e.target.value);
          setShowDropdown(true);
        }}
      />
      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">No products found</div>
          )}
          {filtered.map(p => (
            <div
              key={p.id}
              className="px-3 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onMouseDown={() => {
                onSelect(p.id);
                setTerm("");
                setShowDropdown(false);
              }}
            >
              <span className="font-medium">{p.name}</span>
              {p.item_code && <span className="ml-2 text-xs text-muted-foreground font-mono">{p.item_code}</span>}
            </div>
          ))}
          <div
            className="px-3 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground border-t font-medium text-primary"
            onMouseDown={() => {
              onCreateNew();
              setShowDropdown(false);
            }}
          >
            <Plus className="h-3 w-3 inline mr-1" />Create New Product
          </div>
        </div>
      )}
    </div>
  );
}

export default function PurchaseBillsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem(1)]);
  const [nextKey, setNextKey] = useState(2);
  const [showNewProduct, setShowNewProduct] = useState<number | null>(null);
  const [isGstInclusive, setIsGstInclusive] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const queryClient = useQueryClient();

  const { data: bills, isLoading } = useQuery({
    queryKey: ["purchase-bills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_bills").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ["vendor-profiles-list"],
    queryFn: async () => {
      const { data } = await supabase.from("vendor_profiles").select("id, company_name").eq("status", "active");
      return data ?? [];
    },
  });

  const { data: vendorMap } = useQuery({
    queryKey: ["vendor-profiles-map"],
    queryFn: async () => {
      const { data } = await supabase.from("vendor_profiles").select("id, company_name");
      const map: Record<string, string> = {};
      data?.forEach(v => { map[v.id] = v.company_name; });
      return map;
    },
  });

  const { data: products, refetch: refetchProducts } = useQuery({
    queryKey: ["products-for-bill"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name, item_code, cost_price, unit_price, gst_rate, hsn_code, category_id").eq("is_active", true).order("name");
      return data ?? [];
    },
  });

  const addBill = useMutation({
    mutationFn: async ({ header, items }: { header: any; items: LineItem[] }) => {
      const { data: bill, error } = await supabase.from("purchase_bills").insert(header).select("id").single();
      if (error) throw error;
      const billItems = items.map(i => ({
        bill_id: bill.id,
        product_id: i.product_id,
        description: i.description,
        item_code: i.item_code,
        quantity: i.quantity,
        unit_price: i.unit_price,
        tax_rate: i.tax_rate,
        tax_amount: i.tax_amount,
        total_amount: i.total_amount,
      }));
      const { error: itemsError } = await supabase.from("purchase_bill_items").insert(billItems);
      if (itemsError) throw itemsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-bills"] });
      setOpen(false);
      resetForm();
      toast.success("Purchase bill created");
    },
    onError: (e) => toast.error(e.message),
  });

  const createProduct = useMutation({
    mutationFn: async (product: any) => {
      const { data, error } = await supabase.from("products").insert(product).select("id, name, item_code, cost_price, gst_rate").single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      refetchProducts();
      if (showNewProduct !== null) {
        updateLineItem(showNewProduct, {
          product_id: data.id,
          description: data.name,
          item_code: data.item_code,
          unit_price: Number(data.cost_price),
          tax_rate: Number(data.gst_rate),
        });
      }
      setShowNewProduct(null);
      toast.success("Product created & selected");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateLineItem = useCallback((key: number, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item =>
      item.key === key ? recalcLine({ ...item, ...updates }, isGstInclusive) : item
    ));
  }, [isGstInclusive]);

  const addLine = () => {
    setLineItems(prev => [...prev, emptyLineItem(nextKey)]);
    setNextKey(k => k + 1);
  };

  const removeLine = (key: number) => {
    setLineItems(prev => prev.length > 1 ? prev.filter(i => i.key !== key) : prev);
  };

  const selectProduct = (key: number, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      updateLineItem(key, {
        product_id: product.id,
        description: product.name,
        item_code: product.item_code,
        unit_price: Number(product.cost_price),
        tax_rate: Number(product.gst_rate),
      });
    }
  };

  // Recalculate all line items when tax mode toggles
  const handleToggleGst = (inclusive: boolean) => {
    setIsGstInclusive(inclusive);
    setLineItems(prev => prev.map(item => recalcLine(item, inclusive)));
  };

  // Bulk upload handler
  const handleBulkUpload = (text: string) => {
    if (!products || !text.trim()) return;
    const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
    const unmatched: string[] = [];
    let k = nextKey;
    const newItems: LineItem[] = [];

    for (const line of lines) {
      // Skip header row
      if (line.toLowerCase().startsWith("item_code")) continue;
      const parts = line.split(",").map(s => s.trim());
      const code = parts[0];
      const qty = Number(parts[1]) || 1;
      if (!code) continue;

      const product = products.find(p => p.item_code?.toLowerCase() === code.toLowerCase());
      if (product) {
        const item: LineItem = {
          key: k++,
          product_id: product.id,
          description: product.name,
          item_code: product.item_code,
          quantity: qty,
          unit_price: Number(product.cost_price),
          tax_rate: Number(product.gst_rate),
          tax_amount: 0,
          total_amount: 0,
        };
        newItems.push(recalcLine(item, isGstInclusive));
      } else {
        unmatched.push(code);
      }
    }

    if (newItems.length > 0) {
      setLineItems(prev => [...prev.filter(i => i.product_id), ...newItems]);
      setNextKey(k);
      toast.success(`Added ${newItems.length} item(s)`);
    }
    if (unmatched.length > 0) {
      toast.warning(`Unmatched item codes: ${unmatched.join(", ")}`);
    }
    setBulkText("");
    setShowBulkUpload(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) handleBulkUpload(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const resetForm = () => {
    setLineItems([emptyLineItem(1)]);
    setNextKey(2);
    setShowNewProduct(null);
    setIsGstInclusive(false);
    setShowBulkUpload(false);
    setBulkText("");
  };

  const totals = useMemo(() => {
    if (isGstInclusive) {
      const grandTotal = lineItems.reduce((s, i) => s + i.total_amount, 0);
      const taxTotal = lineItems.reduce((s, i) => s + i.tax_amount, 0);
      const subtotal = grandTotal - taxTotal;
      return { subtotal, taxTotal, grandTotal };
    }
    const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const taxTotal = lineItems.reduce((s, i) => s + i.tax_amount, 0);
    const grandTotal = lineItems.reduce((s, i) => s + i.total_amount, 0);
    return { subtotal, taxTotal, grandTotal };
  }, [lineItems, isGstInclusive]);

  const filtered = bills?.filter(b =>
    b.bill_number?.toLowerCase().includes(search.toLowerCase()) ||
    (vendorMap?.[b.vendor_id] ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const payStatusColor = (s: string) => {
    switch (s) {
      case "paid": return "bg-success/10 text-success";
      case "partial": return "bg-warning/10 text-warning";
      default: return "bg-destructive/10 text-destructive";
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const validItems = lineItems.filter(i => i.product_id);
    if (validItems.length === 0) { toast.error("Add at least one line item"); return; }

    const discountType = fd.get("discount_type") as string;
    const discountValue = Number(fd.get("discount_value"));
    const discountAmount = discountType === "percentage"
      ? totals.subtotal * discountValue / 100 : discountValue;
    const totalAmount = totals.subtotal + totals.taxTotal - discountAmount;

    addBill.mutate({
      header: {
        bill_number: fd.get("bill_number"),
        vendor_id: fd.get("vendor_id"),
        bill_date: fd.get("bill_date"),
        due_date: fd.get("due_date"),
        subtotal: totals.subtotal,
        tax_amount: totals.taxTotal,
        discount_type: discountType,
        discount_value: discountValue,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        is_gst_inclusive: isGstInclusive,
        currency: fd.get("currency") || "INR",
        notes: fd.get("notes"),
        original_bill_url: fd.get("original_bill_url") || null,
        original_bill_filename: fd.get("original_bill_filename") || null,
        status: fd.get("status") || "draft",
      },
      items: validItems,
    });
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Purchase Bills</h1>
          <p className="page-subtitle">Track vendor purchases and invoices · {filtered?.length ?? 0} bills</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Bill</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Purchase Bill</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Header fields */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><Label>Bill Number *</Label><Input name="bill_number" required /></div>
                <div>
                  <Label>Vendor *</Label>
                  <select name="vendor_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select vendor</option>
                    {vendors?.map(v => <option key={v.id} value={v.id}>{v.company_name}</option>)}
                  </select>
                </div>
                <div><Label>Bill Date *</Label><Input name="bill_date" type="date" required /></div>
                <div><Label>Due Date *</Label><Input name="due_date" type="date" required /></div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm font-semibold">Line Items</Label>
                    <div className="flex items-center gap-2">
                      <Switch checked={isGstInclusive} onCheckedChange={handleToggleGst} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {isGstInclusive ? "Tax Inclusive" : "Tax Exclusive"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowBulkUpload(prev => !prev)}>
                      <Upload className="h-3 w-3 mr-1" />Bulk Upload
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={addLine}>
                      <Plus className="h-3 w-3 mr-1" />Add Item
                    </Button>
                  </div>
                </div>

                {/* Bulk Upload Section */}
                {showBulkUpload && (
                  <div className="border rounded-lg p-4 mb-3 bg-muted/30 space-y-3">
                    <Label className="text-sm font-semibold">Bulk Upload Items (CSV: item_code, quantity)</Label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Textarea
                          value={bulkText}
                          onChange={e => setBulkText(e.target.value)}
                          placeholder={"item_code,quantity\nSKU001,10\nSKU002,5"}
                          rows={4}
                          className="text-sm font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-2 justify-end">
                        <Label className="text-xs text-muted-foreground">Or upload CSV file:</Label>
                        <Input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="h-8 text-xs w-40" />
                        <Button type="button" size="sm" onClick={() => handleBulkUpload(bulkText)} disabled={!bulkText.trim()}>
                          Process
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Product</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground w-20">Code</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-16">Qty</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-24">Price</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-16">Tax%</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-20">Tax</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-24">Total</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {lineItems.map(item => (
                        <tr key={item.key}>
                          <td className="px-3 py-2">
                            <ProductSearchInput
                              products={products ?? []}
                              value={item.product_id}
                              onSelect={(id) => selectProduct(item.key, id)}
                              onCreateNew={() => setShowNewProduct(item.key)}
                            />
                          </td>
                          <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{item.item_code || "—"}</td>
                          <td className="px-3 py-2">
                            <Input type="number" min={1} value={item.quantity} onChange={e => updateLineItem(item.key, { quantity: Number(e.target.value) || 1 })} className="h-8 text-right text-sm w-16" />
                          </td>
                          <td className="px-3 py-2">
                            <Input type="number" step="0.01" value={item.unit_price} onChange={e => updateLineItem(item.key, { unit_price: Number(e.target.value) || 0 })} className="h-8 text-right text-sm w-24" />
                          </td>
                          <td className="px-3 py-2">
                            <Input type="number" step="0.01" value={item.tax_rate} onChange={e => updateLineItem(item.key, { tax_rate: Number(e.target.value) || 0 })} className="h-8 text-right text-sm w-16" />
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">{item.tax_amount.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-mono text-sm font-medium text-foreground">{item.total_amount.toFixed(2)}</td>
                          <td className="px-1 py-2">
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeLine(item.key)} disabled={lineItems.length === 1}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Create New Product inline */}
              {showNewProduct !== null && (
                <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-1.5"><PackagePlus className="h-4 w-4" />Create New Product</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewProduct(null)}>Cancel</Button>
                  </div>
                  <div id="new-product-form" className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><Label className="text-xs">Name *</Label><Input id="np_name" required className="h-8 text-sm" /></div>
                    <div><Label className="text-xs">Item Code *</Label><Input id="np_item_code" required className="h-8 text-sm" /></div>
                    <div><Label className="text-xs">Cost Price *</Label><Input id="np_cost_price" type="number" step="0.01" required className="h-8 text-sm" /></div>
                    <div><Label className="text-xs">Unit Price *</Label><Input id="np_unit_price" type="number" step="0.01" required className="h-8 text-sm" /></div>
                    <div><Label className="text-xs">HSN Code *</Label><Input id="np_hsn_code" required className="h-8 text-sm" /></div>
                    <div><Label className="text-xs">GST Rate % *</Label><Input id="np_gst_rate" type="number" step="0.01" required className="h-8 text-sm" /></div>
                    <div><Label className="text-xs">Stock Qty</Label><Input id="np_stock" type="number" defaultValue="0" className="h-8 text-sm" /></div>
                    <div className="flex items-end">
                      <Button type="button" size="sm" className="w-full" disabled={createProduct.isPending} onClick={() => {
                        const name = (document.getElementById("np_name") as HTMLInputElement)?.value;
                        const item_code = (document.getElementById("np_item_code") as HTMLInputElement)?.value;
                        const cost_price = Number((document.getElementById("np_cost_price") as HTMLInputElement)?.value);
                        const unit_price = Number((document.getElementById("np_unit_price") as HTMLInputElement)?.value);
                        const hsn_code = (document.getElementById("np_hsn_code") as HTMLInputElement)?.value;
                        const gst_rate = Number((document.getElementById("np_gst_rate") as HTMLInputElement)?.value);
                        const quantity_in_stock = Number((document.getElementById("np_stock") as HTMLInputElement)?.value) || 0;
                        if (!name || !item_code || !hsn_code) { toast.error("Fill required fields"); return; }
                        createProduct.mutate({ name, item_code, cost_price, unit_price, hsn_code, gst_rate, quantity_in_stock });
                      }}>
                        {createProduct.isPending ? "Creating..." : "Create & Select"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Totals & Discount */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label>Discount Type</Label>
                  <select name="discount_type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div><Label>Discount Value</Label><Input name="discount_value" type="number" step="0.01" defaultValue="0" /></div>
                <div><Label>Currency</Label><Input name="currency" defaultValue="INR" /></div>
                <div>
                  <Label>Status</Label>
                  <select name="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="draft">Draft</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="received">Received</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Bill URL</Label><Input name="original_bill_url" type="url" placeholder="https://..." /></div>
                <div><Label>Bill Filename</Label><Input name="original_bill_filename" placeholder="invoice.pdf" /></div>
              </div>
              <div><Label>Notes</Label><Textarea name="notes" rows={2} /></div>

              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono font-medium text-foreground">{formatCurrency(totals.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax Total</span><span className="font-mono text-muted-foreground">{formatCurrency(totals.taxTotal)}</span></div>
                <div className="flex justify-between border-t pt-1 mt-1"><span className="font-semibold text-foreground">Grand Total</span><span className="font-mono font-bold text-foreground">{formatCurrency(totals.grandTotal)}</span></div>
              </div>

              <Button type="submit" className="w-full" disabled={addBill.isPending}>
                {addBill.isPending ? "Creating..." : "Create Bill"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search bills..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="data-table-container overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Bill #</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Vendor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Due Date</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Subtotal</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Tax</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Total</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Paid</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Bill</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={10} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
            ) : filtered?.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-12 text-muted-foreground">No bills found</td></tr>
            ) : filtered?.map((bill) => (
              <tr key={bill.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium font-mono text-foreground">{bill.bill_number}</td>
                <td className="px-4 py-3 text-sm text-foreground">{vendorMap?.[bill.vendor_id] ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(bill.bill_date), "dd MMM yyyy")}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(bill.due_date), "dd MMM yyyy")}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-muted-foreground">{formatCurrency(Number(bill.subtotal))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-muted-foreground">{formatCurrency(Number(bill.tax_amount))}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold font-mono text-foreground">{formatCurrency(Number(bill.total_amount))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-success">{formatCurrency(Number(bill.paid_amount))}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${payStatusColor(bill.payment_status)}`}>{bill.payment_status}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {bill.original_bill_url ? (
                    <a href={bill.original_bill_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80" title={bill.original_bill_filename || "View bill"}>
                      <ExternalLink className="h-4 w-4 inline" />
                    </a>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
