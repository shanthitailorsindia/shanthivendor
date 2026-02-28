import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, ChevronRight, FolderOpen, Package, Upload, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  hsn_code: string | null;
  gst_rate: number | null;
};

interface BulkRow {
  name: string;
  item_code: string;
  cost_price: number;
  unit_price: number;
  hsn_code: string;
  gst_rate: number;
  quantity_in_stock: number;
  category_text: string;
  subcategory: string;
  product_type: string;
  valid: boolean;
  error?: string;
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [bulkParsed, setBulkParsed] = useState(false);
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products-list"],
    queryFn: async () => {
      const allProducts: any[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("name")
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allProducts.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return allProducts;
    },
  });

  const addProduct = useMutation({
    mutationFn: async (product: any) => {
      const { error } = await supabase.from("products").insert(product);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-list"] });
      setOpen(false);
      toast.success("Product added successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const bulkInsert = useMutation({
    mutationFn: async (rows: BulkRow[]) => {
      const validRows = rows.filter(r => r.valid);
      const products = validRows.map(r => ({
        name: r.name,
        item_code: r.item_code,
        cost_price: r.cost_price,
        unit_price: r.unit_price,
        hsn_code: r.hsn_code,
        gst_rate: r.gst_rate,
        quantity_in_stock: r.quantity_in_stock,
        category: r.category_text || null,
        subcategory: r.subcategory || null,
        product_type: r.product_type || null,
        is_active: true,
      }));
      const { error } = await supabase.from("products").insert(products);
      if (error) throw error;
      return validRows.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["products-list"] });
      setBulkOpen(false);
      setBulkText("");
      setBulkRows([]);
      setBulkParsed(false);
      toast.success(`${count} products imported successfully`);
    },
    onError: (e) => toast.error(e.message),
  });

  const parseBulkText = (text: string) => {
    const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    // Detect and skip header
    const firstLine = lines[0].toLowerCase();
    const startIndex = firstLine.includes("name") || firstLine.includes("item_code") ? 1 : 0;

    const rows: BulkRow[] = [];
    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(",").map(s => s.trim());
      const row: BulkRow = {
        name: parts[0] || "",
        item_code: parts[1] || "",
        cost_price: Number(parts[2]) || 0,
        unit_price: Number(parts[3]) || 0,
        hsn_code: parts[4] || "",
        gst_rate: Number(parts[5]) || 0,
        quantity_in_stock: Number(parts[6]) || 0,
        category_text: parts[7] || "",
        subcategory: parts[8] || "",
        product_type: parts[9] || "",
        valid: true,
      };

      // Validate required fields
      const errors: string[] = [];
      if (!row.name) errors.push("name");
      if (!row.item_code) errors.push("item_code");
      if (!row.cost_price) errors.push("cost_price");
      if (!row.unit_price) errors.push("unit_price");
      if (!row.hsn_code) errors.push("hsn_code");
      if (!row.gst_rate) errors.push("gst_rate");

      if (errors.length > 0) {
        row.valid = false;
        row.error = `Missing: ${errors.join(", ")}`;
      }

      rows.push(row);
    }

    setBulkRows(rows);
    setBulkParsed(true);
  };

  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        setBulkText(text);
        parseBulkText(text);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Build category tree
  const parentCategories = useMemo(() =>
    categories?.filter(c => !c.parent_id) ?? [], [categories]);

  const childCategories = useMemo(() => {
    const map: Record<string, Category[]> = {};
    categories?.filter(c => c.parent_id).forEach(c => {
      if (!map[c.parent_id!]) map[c.parent_id!] = [];
      map[c.parent_id!].push(c);
    });
    return map;
  }, [categories]);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories?.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [categories]);

  const selectedCategoryIds = useMemo(() => {
    if (!selectedCategory) return null;
    const ids = [selectedCategory];
    if (childCategories[selectedCategory]) {
      childCategories[selectedCategory].forEach(c => ids.push(c.id));
    }
    return ids;
  }, [selectedCategory, childCategories]);

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (selectedCategoryIds) {
      list = list.filter(p => p.category_id && selectedCategoryIds.includes(p.category_id));
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(s) ||
        p.item_code?.toLowerCase().includes(s) ||
        p.hsn_code?.toLowerCase().includes(s)
      );
    }
    return list;
  }, [products, selectedCategoryIds, search]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const [expandedParent, setExpandedParent] = useState<string | null>(null);

  const validBulkCount = bulkRows.filter(r => r.valid).length;
  const invalidBulkCount = bulkRows.filter(r => !r.valid).length;

  return (
    <div className="flex gap-6">
      {/* Category Sidebar */}
      <div className="w-56 shrink-0 hidden lg:block">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</h3>
        <div className="space-y-0.5">
          <button
            onClick={() => { setSelectedCategory(null); setExpandedParent(null); }}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${!selectedCategory ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'}`}
          >
            <Package className="h-3.5 w-3.5" />All Products
          </button>
          {parentCategories.map(cat => (
            <div key={cat.id}>
              <button
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setExpandedParent(expandedParent === cat.id ? null : cat.id);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'}`}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                <span className="flex-1 truncate">{cat.name}</span>
                {childCategories[cat.id] && (
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expandedParent === cat.id ? 'rotate-90' : ''}`} />
                )}
              </button>
              {expandedParent === cat.id && childCategories[cat.id]?.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedCategory(sub.id)}
                  className={`w-full text-left pl-8 pr-3 py-1.5 text-sm rounded-md transition-colors ${selectedCategory === sub.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">
              {selectedCategory ? `Showing: ${categoryMap[selectedCategory] ?? "All"}` : "Product inventory overview"}
              {" · "}{filtered.length} items
            </p>
          </div>
          <div className="flex gap-2">
            {/* Bulk Upload */}
            <Dialog open={bulkOpen} onOpenChange={v => { setBulkOpen(v); if (!v) { setBulkText(""); setBulkRows([]); setBulkParsed(false); } }}>
              <DialogTrigger asChild>
                <Button variant="outline"><Upload className="h-4 w-4 mr-2" />Bulk Upload</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Bulk Upload Products</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                    <p className="font-semibold mb-1">Expected CSV format (comma-separated):</p>
                    <code className="text-[10px]">name, item_code, cost_price, unit_price, hsn_code, gst_rate, quantity_in_stock, category, subcategory, product_type</code>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label className="text-sm">Paste CSV data:</Label>
                      <Textarea
                        value={bulkText}
                        onChange={e => { setBulkText(e.target.value); setBulkParsed(false); }}
                        placeholder={"Silk Saree,SKU001,1500,2500,5007,5,10,Sarees,Silk,Saree\nCotton Shirt,SKU002,300,599,6205,12,25,Shirts,,Readymade"}
                        rows={6}
                        className="text-sm font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-2 justify-start pt-6">
                      <Label className="text-xs text-muted-foreground">Or upload CSV:</Label>
                      <Input type="file" accept=".csv,.txt" onChange={handleBulkFileUpload} className="h-8 text-xs w-40" />
                    </div>
                  </div>

                  {!bulkParsed && (
                    <Button onClick={() => parseBulkText(bulkText)} disabled={!bulkText.trim()}>
                      Preview Import
                    </Button>
                  )}

                  {bulkParsed && bulkRows.length > 0 && (
                    <>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-4 w-4" />{validBulkCount} valid</span>
                        {invalidBulkCount > 0 && <span className="flex items-center gap-1 text-destructive"><XCircle className="h-4 w-4" />{invalidBulkCount} invalid</span>}
                      </div>

                      <div className="border rounded-lg overflow-x-auto max-h-60">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-muted/50 border-b">
                            <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Status</th>
                            <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Name</th>
                            <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Code</th>
                            <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">Cost</th>
                            <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">Sell</th>
                            <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">HSN</th>
                            <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">GST%</th>
                            <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">Stock</th>
                            <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Error</th>
                          </tr></thead>
                          <tbody className="divide-y">
                            {bulkRows.map((r, i) => (
                              <tr key={i} className={r.valid ? "" : "bg-destructive/5"}>
                                <td className="px-2 py-1.5">{r.valid ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}</td>
                                <td className="px-2 py-1.5 text-foreground">{r.name || "—"}</td>
                                <td className="px-2 py-1.5 font-mono text-muted-foreground">{r.item_code || "—"}</td>
                                <td className="px-2 py-1.5 text-right font-mono">{r.cost_price || "—"}</td>
                                <td className="px-2 py-1.5 text-right font-mono">{r.unit_price || "—"}</td>
                                <td className="px-2 py-1.5 text-muted-foreground">{r.hsn_code || "—"}</td>
                                <td className="px-2 py-1.5 text-right">{r.gst_rate || "—"}</td>
                                <td className="px-2 py-1.5 text-right">{r.quantity_in_stock}</td>
                                <td className="px-2 py-1.5 text-destructive text-[10px]">{r.error || ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <Button onClick={() => bulkInsert.mutate(bulkRows)} disabled={validBulkCount === 0 || bulkInsert.isPending} className="w-full">
                        {bulkInsert.isPending ? "Importing..." : `Import ${validBulkCount} Products`}
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Product */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Product</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  addProduct.mutate({
                    name: fd.get("name"),
                    item_code: fd.get("item_code"),
                    description: fd.get("description") || null,
                    product_type: fd.get("product_type") || null,
                    unit_price: Number(fd.get("unit_price")),
                    cost_price: Number(fd.get("cost_price")),
                    hsn_code: fd.get("hsn_code"),
                    gst_rate: Number(fd.get("gst_rate")),
                    quantity_in_stock: Number(fd.get("quantity_in_stock")),
                    initial_stock: Number(fd.get("initial_stock")),
                    reorder_level: Number(fd.get("reorder_level")),
                    category_id: fd.get("category_id") || null,
                    category: fd.get("category_text") || null,
                    subcategory: fd.get("subcategory") || null,
                    image_url: fd.get("image_url") || null,
                    meta_title: fd.get("meta_title") || null,
                    meta_description: fd.get("meta_description") || null,
                    is_active: true,
                  });
                }} className="space-y-5">
                  {/* Basic Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 border-b pb-1">Basic Information</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label>Product Name *</Label><Input name="name" required /></div>
                        <div><Label>Item Code *</Label><Input name="item_code" required /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label>Product Type</Label><Input name="product_type" placeholder="e.g., Saree, Jewellery" /></div>
                        <div><Label>Image URL</Label><Input name="image_url" type="url" /></div>
                      </div>
                      <div><Label>Description</Label><Textarea name="description" rows={2} /></div>
                    </div>
                  </div>

                  {/* Pricing & Tax */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 border-b pb-1">Pricing & Tax</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div><Label>Selling Price *</Label><Input name="unit_price" type="number" step="0.01" required /></div>
                      <div><Label>Cost Price *</Label><Input name="cost_price" type="number" step="0.01" required /></div>
                      <div><Label>HSN Code *</Label><Input name="hsn_code" required /></div>
                      <div><Label>GST Rate (%) *</Label><Input name="gst_rate" type="number" step="0.01" required /></div>
                    </div>
                  </div>

                  {/* Inventory */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 border-b pb-1">Inventory</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div><Label>Current Stock *</Label><Input name="quantity_in_stock" type="number" defaultValue="0" required /></div>
                      <div><Label>Initial Stock</Label><Input name="initial_stock" type="number" defaultValue="0" /></div>
                      <div><Label>Reorder Level</Label><Input name="reorder_level" type="number" defaultValue="0" /></div>
                    </div>
                  </div>

                  {/* Classification */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 border-b pb-1">Classification</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Category (from list)</Label>
                        <select name="category_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select category</option>
                          {parentCategories.map(cat => (
                            <optgroup key={cat.id} label={cat.name}>
                              <option value={cat.id}>{cat.name}</option>
                              {childCategories[cat.id]?.map(sub => (
                                <option key={sub.id} value={sub.id}>&nbsp;&nbsp;{sub.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div><Label>Category (text)</Label><Input name="category_text" /></div>
                      <div><Label>Subcategory</Label><Input name="subcategory" /></div>
                    </div>
                  </div>

                  {/* SEO / Meta */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 border-b pb-1">Meta / SEO</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Meta Title</Label><Input name="meta_title" /></div>
                      <div><Label>Meta Description</Label><Input name="meta_description" /></div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={addProduct.isPending}>
                    {addProduct.isPending ? "Adding..." : "Add Product"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Mobile category filter */}
        <div className="mb-4 flex gap-3 lg:hidden">
          <select
            value={selectedCategory ?? ""}
            onChange={e => setSelectedCategory(e.target.value || null)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {parentCategories.map(cat => (
              <optgroup key={cat.id} label={cat.name}>
                <option value={cat.id}>{cat.name}</option>
                {childCategories[cat.id]?.map(sub => (
                  <option key={sub.id} value={sub.id}>&nbsp;&nbsp;{sub.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="mb-4 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, code, HSN..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="data-table-container overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Cost</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Sell</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">HSN</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">GST %</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No products found</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{p.item_code}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    <div>{p.name}</div>
                    {p.description && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{p.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {p.category_id ? categoryMap[p.category_id] : p.category || "—"}
                    {p.subcategory && <div className="text-xs">{p.subcategory}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-muted-foreground">{formatCurrency(Number(p.cost_price))}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-foreground">{formatCurrency(Number(p.unit_price))}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`font-mono font-medium ${p.quantity_in_stock <= p.reorder_level ? 'text-destructive' : 'text-foreground'}`}>
                      {p.quantity_in_stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.hsn_code}</td>
                  <td className="px-4 py-3 text-sm text-right text-muted-foreground">{Number(p.gst_rate)}%</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.product_type || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
