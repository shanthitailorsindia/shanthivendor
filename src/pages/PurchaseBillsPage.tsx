import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/fetchAll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Trash2, PackagePlus, Upload, Eye, Pencil, QrCode, Printer, FileUp, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { toast } from "sonner";
import QRCode from "qrcode";

interface LineItem {
  key: number;
  product_id: string;
  description: string;
  item_code: string;
  quantity: number;
  unit_price: number;
  selling_price: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
}

const emptyLineItem = (key: number): LineItem => ({
  key, product_id: "", description: "", item_code: "",
  quantity: 1, unit_price: 0, selling_price: 0, tax_rate: 0, tax_amount: 0, total_amount: 0,
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

  const selectedProduct = products.find(p => p.id === value);

  const filtered = useMemo(() => {
    const lower = term.trim().toLowerCase();
    if (!lower) return products.slice(0, 50);
    return products
      .filter(p => p.name.toLowerCase().includes(lower) || p.item_code?.toLowerCase().includes(lower))
      .slice(0, 50);
  }, [products, term]);

  const handleSelect = (productId: string) => {
    onSelect(productId);
    setTerm("");
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <Input
        value={showDropdown ? term : selectedProduct?.name ?? ""}
        placeholder="Search by name or code..."
        className="h-8 text-sm"
        onFocus={() => setShowDropdown(true)}
        onBlur={() => window.setTimeout(() => setShowDropdown(false), 150)}
        onChange={(e) => {
          setTerm(e.target.value);
          if (!showDropdown) setShowDropdown(true);
        }}
      />

      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {filtered.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No products found</div>}

          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(p.id)}
            >
              <span className="font-medium">{p.name}</span>
              {p.item_code && <span className="ml-2 text-xs text-muted-foreground font-mono">{p.item_code}</span>}
            </button>
          ))}

          <button
            type="button"
            className="w-full text-left px-3 py-1.5 text-sm border-t font-medium text-primary hover:bg-accent hover:text-accent-foreground"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onCreateNew();
              setTerm("");
              setShowDropdown(false);
            }}
          >
            <Plus className="h-3 w-3 inline mr-1" />Create New Product
          </button>
        </div>
      )}
    </div>
  );
}

/* ── QR Tag Print Styles (reused from QRPriceTagsPage) ── */
type StickerSize = "jewellery-tag" | "2-across" | "4-across";
const printGridCols: Record<StickerSize, number> = { "jewellery-tag": 1, "2-across": 2, "4-across": 4 };

export default function PurchaseBillsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem(1)]);
  const [nextKey, setNextKey] = useState(2);
  const [showNewProduct, setShowNewProduct] = useState<number | null>(null);
  const [isGstInclusive, setIsGstInclusive] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Dialog states
  const [viewBillId, setViewBillId] = useState<string | null>(null);
  const [editBillId, setEditBillId] = useState<string | null>(null);
  const [deleteBillId, setDeleteBillId] = useState<string | null>(null);
  const [qrBillId, setQrBillId] = useState<string | null>(null);

  // Edit form states
  const [editLineItems, setEditLineItems] = useState<LineItem[]>([]);
  const [editNextKey, setEditNextKey] = useState(1);
  const [editIsGstInclusive, setEditIsGstInclusive] = useState(false);
  const [editShowNewProduct, setEditShowNewProduct] = useState<number | null>(null);
  const [editBillFile, setEditBillFile] = useState<File | null>(null);

  // QR states
  const [qrStickerSize, setQrStickerSize] = useState<StickerSize>("2-across");
  const [qrStickerCounts, setQrStickerCounts] = useState<Record<string, number>>({});

  const queryClient = useQueryClient();

  const { data: bills, isLoading } = useQuery({
    queryKey: ["purchase-bills"],
    queryFn: async () => {
      return await fetchAllRows("purchase_bills", "*", { order: { column: "created_at", ascending: false } });
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ["vendor-profiles-list"],
    queryFn: async () => {
      return await fetchAllRows("vendor_profiles", "id, company_name", { eq: { status: "active" } });
    },
  });

  const { data: vendorMap } = useQuery({
    queryKey: ["vendor-profiles-map"],
    queryFn: async () => {
      const data = await fetchAllRows("vendor_profiles", "id, company_name");
      const map: Record<string, string> = {};
      data.forEach(v => { map[v.id] = v.company_name; });
      return map;
    },
  });

  const { data: products, refetch: refetchProducts } = useQuery({
    queryKey: ["products-for-bill"],
    queryFn: async () => {
      const allProducts: any[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, item_code, cost_price, unit_price, gst_rate, hsn_code, category_id, category")
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

  // Fetch bill items for view/edit/qr
  const { data: viewBillItems } = useQuery({
    queryKey: ["bill-items", viewBillId || editBillId || qrBillId],
    queryFn: async () => {
      const id = viewBillId || editBillId || qrBillId;
      if (!id) return [];
      const { data, error } = await supabase.from("purchase_bill_items").select("*").eq("bill_id", id);
      if (error) throw error;
      return data;
    },
    enabled: !!(viewBillId || editBillId || qrBillId),
  });

  const uploadBillFile = async (file: File): Promise<{ url: string; filename: string }> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("purchase-bills").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("purchase-bills").getPublicUrl(path);
    return { url: data.publicUrl, filename: file.name };
  };

  const addBill = useMutation({
    mutationFn: async ({ header, items }: { header: any; items: LineItem[] }) => {
      // Upload bill file if present
      if (billFile) {
        setUploadingFile(true);
        const { url, filename } = await uploadBillFile(billFile);
        header.original_bill_url = url;
        header.original_bill_filename = filename;
        setUploadingFile(false);
      }
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

  const updateBill = useMutation({
    mutationFn: async ({ billId, header, items }: { billId: string; header: any; items: LineItem[] }) => {
      if (editBillFile) {
        setUploadingFile(true);
        const { url, filename } = await uploadBillFile(editBillFile);
        header.original_bill_url = url;
        header.original_bill_filename = filename;
        setUploadingFile(false);
      }
      const { error } = await supabase.from("purchase_bills").update(header).eq("id", billId);
      if (error) throw error;
      const { error: delError } = await supabase.from("purchase_bill_items").delete().eq("bill_id", billId);
      if (delError) throw delError;
      const billItems = items.map(i => ({
        bill_id: billId,
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
      setEditBillId(null);
      setEditBillFile(null);
      toast.success("Bill updated successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteBill = useMutation({
    mutationFn: async (billId: string) => {
      const { error: delItems } = await supabase.from("purchase_bill_items").delete().eq("bill_id", billId);
      if (delItems) throw delItems;
      const { error } = await supabase.from("purchase_bills").delete().eq("id", billId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-bills"] });
      setDeleteBillId(null);
      toast.success("Bill deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const createProduct = useMutation({
    mutationFn: async (product: any) => {
      const { data, error } = await supabase.from("products").insert(product).select("id, name, item_code, cost_price, unit_price, gst_rate").single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      refetchProducts();
      const targetKey = showNewProduct ?? editShowNewProduct;
      if (targetKey !== null) {
        const updates = {
          product_id: data.id,
          description: data.name,
          item_code: data.item_code,
          unit_price: Number(data.cost_price),
          selling_price: Number(data.unit_price),
          tax_rate: Number(data.gst_rate),
        };
        if (showNewProduct !== null) {
          updateLineItem(targetKey, updates);
          setShowNewProduct(null);
        } else {
          updateEditLineItem(targetKey, updates);
          setEditShowNewProduct(null);
        }
      }
      toast.success("Product created & selected");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateLineItem = useCallback((key: number, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item =>
      item.key === key ? recalcLine({ ...item, ...updates }, isGstInclusive) : item
    ));
  }, [isGstInclusive]);

  const updateEditLineItem = useCallback((key: number, updates: Partial<LineItem>) => {
    setEditLineItems(prev => prev.map(item =>
      item.key === key ? recalcLine({ ...item, ...updates }, editIsGstInclusive) : item
    ));
  }, [editIsGstInclusive]);

  const addLine = () => {
    setLineItems(prev => [...prev, emptyLineItem(nextKey)]);
    setNextKey(k => k + 1);
  };

  const removeLine = (key: number) => {
    setLineItems(prev => prev.length > 1 ? prev.filter(i => i.key !== key) : prev);
  };

  const addEditLine = () => {
    setEditLineItems(prev => [...prev, emptyLineItem(editNextKey)]);
    setEditNextKey(k => k + 1);
  };

  const removeEditLine = (key: number) => {
    setEditLineItems(prev => prev.length > 1 ? prev.filter(i => i.key !== key) : prev);
  };

  const selectProduct = (key: number, productId: string, isEdit = false) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      const updates = {
        product_id: product.id,
        description: product.name,
        item_code: product.item_code,
        unit_price: Number(product.cost_price),
        selling_price: Number(product.unit_price),
        tax_rate: Number(product.gst_rate),
      };
      if (isEdit) updateEditLineItem(key, updates);
      else updateLineItem(key, updates);
    }
  };

  const handleToggleGst = (inclusive: boolean) => {
    setIsGstInclusive(inclusive);
    setLineItems(prev => prev.map(item => recalcLine(item, inclusive)));
  };

  const handleBulkUpload = (text: string) => {
    if (!products || !text.trim()) return;
    const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
    const unmatched: string[] = [];
    let k = nextKey;
    const newItems: LineItem[] = [];

    for (const line of lines) {
      if (line.toLowerCase().startsWith("item_code")) continue;
      const parts = line.split(",").map(s => s.trim());
      const code = parts[0];
      const qty = Number(parts[1]) || 1;
      if (!code) continue;

      const product = products.find(p => p.item_code?.toLowerCase() === code.toLowerCase());
      if (product) {
        const item: LineItem = {
          key: k++, product_id: product.id, description: product.name, item_code: product.item_code,
          quantity: qty, unit_price: Number(product.cost_price), selling_price: Number(product.unit_price),
          tax_rate: Number(product.gst_rate), tax_amount: 0, total_amount: 0,
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
    if (unmatched.length > 0) toast.warning(`Unmatched item codes: ${unmatched.join(", ")}`);
    setBulkText("");
    setShowBulkUpload(false);
  };

  const handleCSVFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setBillFile(null);
  };

  // Load edit form data when editBillId changes
  const editBill = editBillId ? bills?.find(b => b.id === editBillId) : null;
  useMemo(() => {
    if (editBill && viewBillItems && editBillId) {
      let k = 1;
      const items: LineItem[] = viewBillItems.map(i => {
        const item: LineItem = {
          key: k++, product_id: i.product_id || "", description: i.description || "",
          item_code: i.item_code || "", quantity: i.quantity, unit_price: Number(i.unit_price),
          selling_price: 0, tax_rate: Number(i.tax_rate), tax_amount: Number(i.tax_amount),
          total_amount: Number(i.total_amount),
        };
        const prod = products?.find(p => p.id === i.product_id);
        if (prod) item.selling_price = Number(prod.unit_price);
        return item;
      });
      if (items.length === 0) items.push(emptyLineItem(k++));
      setEditLineItems(items);
      setEditNextKey(k);
      setEditIsGstInclusive(editBill.is_gst_inclusive || false);
    }
  }, [editBillId, viewBillItems, editBill, products]);

  // Load QR data
  useMemo(() => {
    if (qrBillId && viewBillItems) {
      const counts: Record<string, number> = {};
      viewBillItems.forEach(i => {
        if (i.product_id) counts[i.product_id] = i.quantity || 1;
      });
      setQrStickerCounts(counts);
    }
  }, [qrBillId, viewBillItems]);

  const totals = useMemo(() => {
    if (isGstInclusive) {
      const grandTotal = lineItems.reduce((s, i) => s + i.total_amount, 0);
      const taxTotal = lineItems.reduce((s, i) => s + i.tax_amount, 0);
      return { subtotal: grandTotal - taxTotal, taxTotal, grandTotal };
    }
    const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const taxTotal = lineItems.reduce((s, i) => s + i.tax_amount, 0);
    const grandTotal = lineItems.reduce((s, i) => s + i.total_amount, 0);
    return { subtotal, taxTotal, grandTotal };
  }, [lineItems, isGstInclusive]);

  const editTotals = useMemo(() => {
    if (editIsGstInclusive) {
      const grandTotal = editLineItems.reduce((s, i) => s + i.total_amount, 0);
      const taxTotal = editLineItems.reduce((s, i) => s + i.tax_amount, 0);
      return { subtotal: grandTotal - taxTotal, taxTotal, grandTotal };
    }
    const subtotal = editLineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const taxTotal = editLineItems.reduce((s, i) => s + i.tax_amount, 0);
    const grandTotal = editLineItems.reduce((s, i) => s + i.total_amount, 0);
    return { subtotal, taxTotal, grandTotal };
  }, [editLineItems, editIsGstInclusive]);

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
    const discountAmount = discountType === "percentage" ? totals.subtotal * discountValue / 100 : discountValue;
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
        status: fd.get("status") || "draft",
      },
      items: validItems,
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editBillId) return;
    const fd = new FormData(e.currentTarget);
    const validItems = editLineItems.filter(i => i.product_id);
    if (validItems.length === 0) { toast.error("Add at least one line item"); return; }

    const discountType = fd.get("discount_type") as string;
    const discountValue = Number(fd.get("discount_value"));
    const discountAmount = discountType === "percentage" ? editTotals.subtotal * discountValue / 100 : discountValue;
    const totalAmount = editTotals.subtotal + editTotals.taxTotal - discountAmount;

    updateBill.mutate({
      billId: editBillId,
      header: {
        bill_number: fd.get("bill_number"),
        vendor_id: fd.get("vendor_id"),
        bill_date: fd.get("bill_date"),
        due_date: fd.get("due_date"),
        subtotal: editTotals.subtotal,
        tax_amount: editTotals.taxTotal,
        discount_type: discountType,
        discount_value: discountValue,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        is_gst_inclusive: editIsGstInclusive,
        currency: fd.get("currency") || "INR",
        notes: fd.get("notes"),
        status: fd.get("status") || "draft",
        payment_status: fd.get("payment_status") || "unpaid",
      },
      items: validItems,
    });
  };

  /* ── QR Print handler ── */
  const handleQrPrint = async () => {
    const qrProducts = products?.filter(p => p.id in qrStickerCounts) ?? [];
    if (qrProducts.length === 0) return;

    const qrWidth = qrStickerSize === "jewellery-tag" ? 60 : qrStickerSize === "2-across" ? 120 : 80;
    const qrImages: Record<string, string> = {};
    await Promise.all(
      qrProducts.map(async (p) => {
        qrImages[p.id] = await QRCode.toDataURL(p.item_code, { width: qrWidth, margin: 1, errorCorrectionLevel: "M" });
      })
    );

    const cols = printGridCols[qrStickerSize];
    const tagHtml = (p: any) => {
      const isReadymade = p.category?.toLowerCase().includes("readymade") || p.category?.toLowerCase().includes("costume");
      if (qrStickerSize === "jewellery-tag") {
        return `<div class="tag tag-jewellery"><div class="qr-side"><img src="${qrImages[p.id]}" width="60" height="60"/><p class="code">${p.item_code}</p></div><div class="info-side"><p class="pname">${p.name}</p><p class="price">${formatCurrency(Number(p.unit_price))}</p><p class="mrp">MRP incl. ${Number(p.gst_rate)}% GST</p></div></div>`;
      }
      if (qrStickerSize === "2-across") {
        return `<div class="tag tag-2across"><div class="qr-side"><img src="${qrImages[p.id]}" width="120" height="120"/><p class="code">${p.item_code}</p></div><div class="info-side"><p class="shop">SHANTHI TAILORS</p><p class="pname">${p.name}</p>${isReadymade ? '<p class="cat">Readymade Costume</p>' : ""}<p class="price">Our Price : ${formatCurrency(Number(p.unit_price))}</p><p class="mrp">MRP incl. ${Number(p.gst_rate)}% GST</p></div></div>`;
      }
      return `<div class="tag tag-4across"><p class="shop">SHANTHI TAILORS</p><div class="mid"><img src="${qrImages[p.id]}" width="80" height="80"/><p class="price">${formatCurrency(Number(p.unit_price))}</p></div><p class="pname">${p.name}</p><p class="code">${p.item_code}</p></div>`;
    };

    const tagsHtml = qrProducts.flatMap(p =>
      Array.from({ length: qrStickerCounts[p.id] || 1 }, () => tagHtml(p))
    ).join("");

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>QR Price Tags</title><style>
      *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',system-ui,sans-serif}
      .grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;padding:12px}
      .tag{border:2px dashed #d1d5db;border-radius:8px;padding:10px;page-break-inside:avoid}
      .tag-jewellery{display:flex;align-items:center;gap:8px;padding:6px}
      .tag-jewellery .qr-side{display:flex;flex-direction:column;align-items:center}
      .tag-jewellery .code{font-size:8px;color:#6b7280;font-family:monospace;margin-top:2px}
      .tag-jewellery .pname{font-size:10px;font-weight:700;text-transform:uppercase}
      .tag-jewellery .price{font-size:16px;font-weight:800}
      .tag-jewellery .mrp{font-size:8px;color:#6b7280}
      .tag-2across{display:flex;gap:12px}.tag-2across .qr-side{display:flex;flex-direction:column;align-items:center;flex-shrink:0}
      .tag-2across .code{font-size:9px;color:#6b7280;font-family:monospace;margin-top:4px}
      .tag-2across .info-side{display:flex;flex-direction:column;justify-content:center}
      .tag-2across .shop{font-size:10px;font-weight:700;color:#6b7280;letter-spacing:1px}
      .tag-2across .pname{font-size:12px;font-weight:700;text-transform:uppercase;margin-top:4px}
      .tag-2across .cat{font-size:9px;color:#6b7280}
      .tag-2across .price{font-size:16px;font-weight:800;margin-top:4px}
      .tag-2across .mrp{font-size:8px;color:#6b7280}
      .tag-4across{text-align:center}.tag-4across .shop{font-size:9px;font-weight:700;color:#6b7280;letter-spacing:1px;margin-bottom:4px}
      .tag-4across .mid{display:flex;align-items:center;justify-content:center;gap:8px;margin:4px 0}
      .tag-4across .price{font-size:16px;font-weight:800}
      .tag-4across .pname{font-size:10px;font-weight:700;text-transform:uppercase}
      .tag-4across .code{font-size:8px;color:#6b7280;font-family:monospace}
      @media print{.grid{gap:6px;padding:6px}.tag{border-width:1px}}
    </style></head><body><div class="grid">${tagsHtml}</div></body></html>`);
    win.document.close();
    win.print();
  };

  const viewBill = viewBillId ? bills?.find(b => b.id === viewBillId) : null;
  const qrBill = qrBillId ? bills?.find(b => b.id === qrBillId) : null;
  const qrTotalStickers = Object.values(qrStickerCounts).reduce((s, n) => s + n, 0);

  /* ── Line Items Table Component ── */
  const renderLineItemsTable = (items: LineItem[], isEdit: boolean) => (
    <div className="border rounded-lg overflow-visible">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b">
            <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Product</th>
            <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground w-20">Code</th>
            <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-16">Qty</th>
            <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-24">Purchase</th>
            <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-24">Selling</th>
            <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-16">Tax%</th>
            <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-20">Tax</th>
            <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-24">Total</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map(item => (
            <tr key={item.key}>
              <td className="px-3 py-2">
                <ProductSearchInput
                  products={products ?? []}
                  value={item.product_id}
                  onSelect={(id) => selectProduct(item.key, id, isEdit)}
                  onCreateNew={() => isEdit ? setEditShowNewProduct(item.key) : setShowNewProduct(item.key)}
                />
              </td>
              <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{item.item_code || "—"}</td>
              <td className="px-3 py-2">
                <Input type="number" min={1} value={item.quantity} onChange={e => isEdit ? updateEditLineItem(item.key, { quantity: Number(e.target.value) || 1 }) : updateLineItem(item.key, { quantity: Number(e.target.value) || 1 })} className="h-8 text-right text-sm w-16" />
              </td>
              <td className="px-3 py-2">
                <Input type="number" step="0.01" value={item.unit_price} onChange={e => isEdit ? updateEditLineItem(item.key, { unit_price: Number(e.target.value) || 0 }) : updateLineItem(item.key, { unit_price: Number(e.target.value) || 0 })} className="h-8 text-right text-sm w-24" />
              </td>
              <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">{item.selling_price > 0 ? item.selling_price.toFixed(2) : "—"}</td>
              <td className="px-3 py-2">
                <Input type="number" step="0.01" value={item.tax_rate} onChange={e => isEdit ? updateEditLineItem(item.key, { tax_rate: Number(e.target.value) || 0 }) : updateLineItem(item.key, { tax_rate: Number(e.target.value) || 0 })} className="h-8 text-right text-sm w-16" />
              </td>
              <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">{item.tax_amount.toFixed(2)}</td>
              <td className="px-3 py-2 text-right font-mono text-sm font-medium text-foreground">{item.total_amount.toFixed(2)}</td>
              <td className="px-1 py-2">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => isEdit ? removeEditLine(item.key) : removeLine(item.key)} disabled={items.length === 1}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /* ── New Product Form ── */
  const renderNewProductForm = (targetKey: number | null, onCancel: () => void) => {
    if (targetKey === null) return null;
    return (
      <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-1.5"><PackagePlus className="h-4 w-4" />Create New Product</Label>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><Label className="text-xs">Name *</Label><Input id="np_name" required className="h-8 text-sm" /></div>
          <div><Label className="text-xs">Item Code *</Label><Input id="np_item_code" required className="h-8 text-sm" /></div>
          <div><Label className="text-xs">Purchase Price *</Label><Input id="np_cost_price" type="number" step="0.01" required className="h-8 text-sm" /></div>
          <div><Label className="text-xs">Selling Price *</Label><Input id="np_unit_price" type="number" step="0.01" required className="h-8 text-sm" /></div>
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
    );
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
                      <span className="text-xs font-medium text-muted-foreground">{isGstInclusive ? "Tax Inclusive" : "Tax Exclusive"}</span>
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

                {showBulkUpload && (
                  <div className="border rounded-lg p-4 mb-3 bg-muted/30 space-y-3">
                    <Label className="text-sm font-semibold">Bulk Upload Items (CSV: item_code, quantity)</Label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Textarea value={bulkText} onChange={e => setBulkText(e.target.value)} placeholder={"item_code,quantity\nSKU001,10\nSKU002,5"} rows={4} className="text-sm font-mono" />
                      </div>
                      <div className="flex flex-col gap-2 justify-end">
                        <Label className="text-xs text-muted-foreground">Or upload CSV file:</Label>
                        <Input type="file" accept=".csv,.txt" onChange={handleCSVFileUpload} className="h-8 text-xs w-40" />
                        <Button type="button" size="sm" onClick={() => handleBulkUpload(bulkText)} disabled={!bulkText.trim()}>Process</Button>
                      </div>
                    </div>
                  </div>
                )}

                {renderLineItemsTable(lineItems, false)}
              </div>

              {renderNewProductForm(showNewProduct, () => setShowNewProduct(null))}

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

              {/* Bill File Upload */}
              <div>
                <Label>Upload Bill (PDF/Image)</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e => setBillFile(e.target.files?.[0] || null)} className="text-sm" />
                  {billFile && <span className="text-xs text-muted-foreground">{billFile.name}</span>}
                </div>
              </div>

              <div><Label>Notes</Label><Textarea name="notes" rows={2} /></div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono font-medium text-foreground">{formatCurrency(totals.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax Total</span><span className="font-mono text-muted-foreground">{formatCurrency(totals.taxTotal)}</span></div>
                <div className="flex justify-between border-t pt-1 mt-1"><span className="font-semibold text-foreground">Grand Total</span><span className="font-mono font-bold text-foreground">{formatCurrency(totals.grandTotal)}</span></div>
              </div>

              <Button type="submit" className="w-full" disabled={addBill.isPending || uploadingFile}>
                {uploadingFile ? "Uploading file..." : addBill.isPending ? "Creating..." : "Create Bill"}
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
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Total</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Paid</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
            ) : filtered?.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No bills found</td></tr>
            ) : filtered?.map((bill) => (
              <tr key={bill.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium font-mono text-foreground">{bill.bill_number}</td>
                <td className="px-4 py-3 text-sm text-foreground">{vendorMap?.[bill.vendor_id] ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(bill.bill_date), "dd MMM yyyy")}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold font-mono text-foreground">{formatCurrency(Number(bill.total_amount))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-success">{formatCurrency(Number(bill.paid_amount))}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${payStatusColor(bill.payment_status)}`}>{bill.payment_status}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewBillId(bill.id)} title="View"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditBillId(bill.id)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setQrBillId(bill.id)} title="QR Tags"><QrCode className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteBillId(bill.id)} title="Delete"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── View Bill Dialog ── */}
      <Dialog open={!!viewBillId} onOpenChange={v => { if (!v) setViewBillId(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Bill Details — {viewBill?.bill_number}</DialogTitle></DialogHeader>
          {viewBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="text-muted-foreground">Vendor:</span> <span className="font-medium text-foreground">{vendorMap?.[viewBill.vendor_id] ?? "—"}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium text-foreground">{format(new Date(viewBill.bill_date), "dd MMM yyyy")}</span></div>
                <div><span className="text-muted-foreground">Due:</span> <span className="font-medium text-foreground">{format(new Date(viewBill.due_date), "dd MMM yyyy")}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${payStatusColor(viewBill.payment_status)}`}>{viewBill.payment_status}</span></div>
              </div>

              {viewBill.original_bill_url && (
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <a href={viewBill.original_bill_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {viewBill.original_bill_filename || "View Bill File"}
                  </a>
                </div>
              )}

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/50 border-b">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Product</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Code</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Qty</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Price</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Tax</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Total</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {viewBillItems?.map(i => (
                      <tr key={i.id}>
                        <td className="px-3 py-2 text-foreground">{i.description}</td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">{i.item_code}</td>
                        <td className="px-3 py-2 text-right text-foreground">{i.quantity}</td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">{formatCurrency(Number(i.unit_price))}</td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">{formatCurrency(Number(i.tax_amount))}</td>
                        <td className="px-3 py-2 text-right font-mono font-medium text-foreground">{formatCurrency(Number(i.total_amount))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono text-foreground">{formatCurrency(Number(viewBill.subtotal))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-mono text-muted-foreground">{formatCurrency(Number(viewBill.tax_amount))}</span></div>
                {Number(viewBill.discount_amount) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="font-mono text-destructive">-{formatCurrency(Number(viewBill.discount_amount))}</span></div>}
                <div className="flex justify-between border-t pt-1"><span className="font-semibold text-foreground">Total</span><span className="font-mono font-bold text-foreground">{formatCurrency(Number(viewBill.total_amount))}</span></div>
              </div>

              {viewBill.notes && <div className="text-sm"><span className="text-muted-foreground">Notes:</span> <span className="text-foreground">{viewBill.notes}</span></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Bill Dialog ── */}
      <Dialog open={!!editBillId} onOpenChange={v => { if (!v) { setEditBillId(null); setEditBillFile(null); setEditShowNewProduct(null); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Bill — {editBill?.bill_number}</DialogTitle></DialogHeader>
          {editBill && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><Label>Bill Number *</Label><Input name="bill_number" defaultValue={editBill.bill_number} required /></div>
                <div>
                  <Label>Vendor *</Label>
                  <select name="vendor_id" required defaultValue={editBill.vendor_id} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select vendor</option>
                    {vendors?.map(v => <option key={v.id} value={v.id}>{v.company_name}</option>)}
                  </select>
                </div>
                <div><Label>Bill Date *</Label><Input name="bill_date" type="date" defaultValue={editBill.bill_date} required /></div>
                <div><Label>Due Date *</Label><Input name="due_date" type="date" defaultValue={editBill.due_date} required /></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm font-semibold">Line Items</Label>
                    <div className="flex items-center gap-2">
                      <Switch checked={editIsGstInclusive} onCheckedChange={v => {
                        setEditIsGstInclusive(v);
                        setEditLineItems(prev => prev.map(item => recalcLine(item, v)));
                      }} />
                      <span className="text-xs font-medium text-muted-foreground">{editIsGstInclusive ? "Tax Inclusive" : "Tax Exclusive"}</span>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addEditLine}><Plus className="h-3 w-3 mr-1" />Add Item</Button>
                </div>
                {renderLineItemsTable(editLineItems, true)}
              </div>

              {renderNewProductForm(editShowNewProduct, () => setEditShowNewProduct(null))}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label>Discount Type</Label>
                  <select name="discount_type" defaultValue={editBill.discount_type || "percentage"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div><Label>Discount Value</Label><Input name="discount_value" type="number" step="0.01" defaultValue={editBill.discount_value || 0} /></div>
                <div>
                  <Label>Status</Label>
                  <select name="status" defaultValue={editBill.status || "draft"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="draft">Draft</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="received">Received</option>
                  </select>
                </div>
                <div>
                  <Label>Payment Status</Label>
                  <select name="payment_status" defaultValue={editBill.payment_status || "unpaid"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Upload Bill (PDF/Image)</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e => setEditBillFile(e.target.files?.[0] || null)} className="text-sm" />
                  {editBill.original_bill_url && !editBillFile && (
                    <a href={editBill.original_bill_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Download className="h-3 w-3" />{editBill.original_bill_filename || "Current file"}
                    </a>
                  )}
                  {editBillFile && <span className="text-xs text-muted-foreground">{editBillFile.name} (will replace)</span>}
                </div>
              </div>

              <div><Label>Notes</Label><Textarea name="notes" rows={2} defaultValue={editBill.notes || ""} /></div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono font-medium text-foreground">{formatCurrency(editTotals.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax Total</span><span className="font-mono text-muted-foreground">{formatCurrency(editTotals.taxTotal)}</span></div>
                <div className="flex justify-between border-t pt-1 mt-1"><span className="font-semibold text-foreground">Grand Total</span><span className="font-mono font-bold text-foreground">{formatCurrency(editTotals.grandTotal)}</span></div>
              </div>

              <Button type="submit" className="w-full" disabled={updateBill.isPending || uploadingFile}>
                {uploadingFile ? "Uploading file..." : updateBill.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleteBillId} onOpenChange={v => { if (!v) setDeleteBillId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the bill and all its line items. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteBillId && deleteBill.mutate(deleteBillId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteBill.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── QR Print Dialog ── */}
      <Dialog open={!!qrBillId} onOpenChange={v => { if (!v) { setQrBillId(null); setQrStickerCounts({}); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Print QR Tags — {qrBill?.bill_number}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Label className="text-sm">Format:</Label>
              <Select value={qrStickerSize} onValueChange={v => setQrStickerSize(v as StickerSize)}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="jewellery-tag">Jewellery Tag (92×15mm)</SelectItem>
                  <SelectItem value="2-across">2 Across (50×25mm)</SelectItem>
                  <SelectItem value="4-across">4 Across (25×20mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
              {viewBillItems?.map(i => {
                const prod = products?.find(p => p.id === i.product_id);
                if (!prod) return null;
                return (
                  <div key={i.id} className="flex items-center gap-3 px-4 py-2">
                    <Checkbox checked={prod.id in qrStickerCounts} onCheckedChange={() => {
                      setQrStickerCounts(prev => {
                        const next = { ...prev };
                        if (prod.id in next) delete next[prod.id]; else next[prod.id] = i.quantity || 1;
                        return next;
                      });
                    }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{prod.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{prod.item_code}</p>
                    </div>
                    {prod.id in qrStickerCounts && (
                      <Input
                        type="number" min={1} value={qrStickerCounts[prod.id]}
                        onChange={e => setQrStickerCounts(prev => ({ ...prev, [prod.id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                        className="w-16 h-8 text-center text-sm"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {qrTotalStickers > 0 && (
              <Button onClick={handleQrPrint} className="w-full">
                <Printer className="h-4 w-4 mr-2" />Print {qrTotalStickers} Tags
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
