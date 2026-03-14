import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/fetchAll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CalendarCheck, Package, CheckCircle2, AlertTriangle,
  ArrowRight, RefreshCw, IndianRupee, Lock,
  FileCheck, ScanLine, Trash2, Search, X,
} from "lucide-react";
import { toast } from "sonner";

/* ── Indian FY helpers ── */
const fyStartYear = (d: Date) => (d.getMonth() < 3 ? d.getFullYear() - 1 : d.getFullYear());
const getFYLabel = (startYear: number) =>
  `FY ${String(startYear).slice(2)}-${String(startYear + 1).slice(2)}`;
const getFYEnd = (startYear: number) => new Date(startYear + 1, 2, 31);
const getFYStart = (startYear: number) => new Date(startYear, 3, 1);

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

type CountedItem = {
  product_id: string;
  item_code: string;
  name: string;
  category: string | null;
  system_stock: number;
  physical_count: number;
};

type VendorRollRow = {
  id: string;
  company_name: string;
  current_opening: number;
  current_balance: number;
};

type Step = "overview" | "stocktake" | "rollover" | "close";

export default function YearEndClosePage() {
  const now = new Date();
  const fyYear = fyStartYear(now);
  const fyLabel = getFYLabel(fyYear);
  const nextFYStartStr = `${fyYear + 1}-04-01`;

  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("overview");

  /* ── Stock Take state ── */
  const [codeInput, setCodeInput] = useState("");
  const [qtyInput, setQtyInput] = useState("");
  const [matchedProduct, setMatchedProduct] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [countedItems, setCountedItems] = useState<CountedItem[]>([]);
  const [stockSaved, setStockSaved] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);

  /* ── Rollover state ── */
  const [rolloverDone, setRolloverDone] = useState(false);

  /* ── Auto-focus code input when on stocktake step ── */
  useEffect(() => {
    if (step === "stocktake") {
      setTimeout(() => codeRef.current?.focus(), 100);
    }
  }, [step]);

  /* ── Queries ── */
  const { data: products } = useQuery({
    queryKey: ["yearend-products"],
    queryFn: () => fetchAllRows("products", "id, item_code, name, category, quantity_in_stock"),
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["yearend-vendors"],
    queryFn: () => fetchAllRows("vendor_profiles", "id, company_name, opening_balance, status"),
  });

  const { data: balances } = useQuery({
    queryKey: ["yearend-balances"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendor_balance_summary")
        .select("id, current_balance, opening_balance");
      return data ?? [];
    },
  });

  const { data: unpaidBills } = useQuery({
    queryKey: ["yearend-unpaid"],
    queryFn: () =>
      fetchAllRows("purchase_bills", "id, total_amount, paid_amount, payment_status", {
        neq: { payment_status: "paid" },
      }),
  });

  /* ── Product lookup map ── */
  const productByCode = useMemo(() => {
    const map: Record<string, any> = {};
    (products ?? []).forEach(p => {
      if (p.item_code) map[p.item_code.toLowerCase().trim()] = p;
    });
    return map;
  }, [products]);

  /* ── Derived ── */
  const vendorRollRows = useMemo<VendorRollRow[]>(() => {
    const balMap = new Map((balances ?? []).map(b => [b.id, Number(b.current_balance ?? 0)]));
    return (vendors ?? []).map(v => ({
      id: v.id,
      company_name: v.company_name ?? "Unknown",
      current_opening: Number(v.opening_balance ?? 0),
      current_balance: balMap.get(v.id) ?? 0,
    }));
  }, [vendors, balances]);

  const totalUnpaidAmount = (unpaidBills ?? []).reduce(
    (s, b) => s + (Number(b.total_amount) - Number(b.paid_amount)), 0
  );
  const totalNewOpeningBalance = vendorRollRows.reduce((s, r) => s + r.current_balance, 0);

  /* ── Code lookup ── */
  const handleCodeSearch = () => {
    const code = codeInput.trim();
    if (!code) return;
    const product = productByCode[code.toLowerCase()];
    if (product) {
      setMatchedProduct(product);
      setNotFound(false);
      setTimeout(() => qtyRef.current?.focus(), 50);
    } else {
      setMatchedProduct(null);
      setNotFound(true);
    }
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCodeSearch();
  };

  /* ── Add to counted list ── */
  const handleAddCount = () => {
    if (!matchedProduct) return;
    const qty = Number(qtyInput);
    if (isNaN(qty) || qty < 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    setCountedItems(prev => {
      const existing = prev.findIndex(i => i.product_id === matchedProduct.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], physical_count: qty };
        return updated;
      }
      return [
        ...prev,
        {
          product_id: matchedProduct.id,
          item_code: matchedProduct.item_code,
          name: matchedProduct.name,
          category: matchedProduct.category ?? null,
          system_stock: Number(matchedProduct.quantity_in_stock ?? 0),
          physical_count: qty,
        },
      ];
    });
    // Reset for next scan
    setCodeInput("");
    setQtyInput("");
    setMatchedProduct(null);
    setNotFound(false);
    setStockSaved(false);
    setTimeout(() => codeRef.current?.focus(), 50);
    toast.success(`${matchedProduct.name} — counted ${qty}`);
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddCount();
  };

  const removeItem = (productId: string) => {
    setCountedItems(prev => prev.filter(i => i.product_id !== productId));
  };

  const updateCount = (productId: string, qty: number) => {
    setCountedItems(prev =>
      prev.map(i => i.product_id === productId ? { ...i, physical_count: qty } : i)
    );
  };

  /* ── Mutations ── */
  const saveStockTake = useMutation({
    mutationFn: async () => {
      const updates = countedItems.map(item =>
        supabase.from("products").update({ quantity_in_stock: item.physical_count }).eq("id", item.product_id)
      );
      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw new Error(`${errors.length} product(s) failed to update`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["yearend-products"] });
      queryClient.invalidateQueries({ queryKey: ["products-list"] });
      setStockSaved(true);
      toast.success(`${countedItems.length} products updated successfully`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const executeRollover = useMutation({
    mutationFn: async () => {
      const updates = vendorRollRows.map(v =>
        supabase
          .from("vendor_profiles")
          .update({ opening_balance: v.current_balance, opening_balance_date: nextFYStartStr })
          .eq("id", v.id)
      );
      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw new Error(`${errors.length} vendor(s) failed to update`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["yearend-vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["all-vendor-balances"] });
      setRolloverDone(true);
      toast.success(`Vendor balances rolled over to ${nextFYStartStr}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  /* ── Step nav ── */
  const steps: { key: Step; label: string; icon: any }[] = [
    { key: "overview",  label: "Overview",         icon: FileCheck    },
    { key: "stocktake", label: "Stock Take",        icon: ScanLine     },
    { key: "rollover",  label: "Vendor Rollover",   icon: RefreshCw    },
    { key: "close",     label: "Close Year",        icon: Lock         },
  ];

  const stepStatus = (s: Step) => {
    if (s === "stocktake") return stockSaved ? "done" : countedItems.length > 0 ? "partial" : "pending";
    if (s === "rollover")  return rolloverDone ? "done" : "pending";
    return "pending";
  };

  /* ── Variance summary ── */
  const varianceItems = countedItems.filter(i => i.physical_count !== i.system_stock);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8 text-primary-foreground">
        <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')]" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/20 backdrop-blur-sm flex items-center justify-center">
              <CalendarCheck className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Year-End Close</h1>
              <p className="text-primary-foreground/70 text-sm">
                {fyLabel} · Closes 31 Mar {fyYear + 1} · New FY starts 1 Apr {fyYear + 1}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Unpaid Bills",  value: (unpaidBills ?? []).length,    sub: fmt(totalUnpaidAmount),             warn: (unpaidBills ?? []).length > 0 },
              { label: "Items Counted", value: countedItems.length,            sub: `${varianceItems.length} variances` },
              { label: "Vendors",       value: (vendors ?? []).length,         sub: rolloverDone ? "Rolled over ✓" : "Pending rollover" },
            ].map(k => (
              <div key={k.label} className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3 border border-primary-foreground/10">
                <span className={`text-xs ${k.warn ? "text-yellow-300 font-semibold" : "text-primary-foreground/60"}`}>{k.label}</span>
                <p className="text-lg font-bold font-mono">{k.value}</p>
                <p className="text-[11px] text-primary-foreground/50">{k.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Tabs */}
      <div className="flex gap-2 flex-wrap">
        {steps.map((s, i) => {
          const status = stepStatus(s.key);
          const active = step === s.key;
          return (
            <button key={s.key} onClick={() => setStep(s.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                active ? "bg-primary text-primary-foreground border-primary shadow-sm"
                       : "bg-card text-foreground border-border hover:border-primary/40"
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                status === "done"    ? "bg-success text-white" :
                status === "partial" ? "bg-warning text-white" :
                active               ? "bg-primary-foreground/20 text-primary-foreground" :
                                       "bg-muted text-muted-foreground"
              }`}>
                {status === "done" ? "✓" : i + 1}
              </span>
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── STEP 1: OVERVIEW ── */}
      {step === "overview" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border p-5">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" /> Pre-Close Checklist
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: "Unpaid / Partial Bills",
                  status: (unpaidBills ?? []).length === 0 ? "ok" : "warn",
                  detail: (unpaidBills ?? []).length === 0
                    ? "All bills are paid"
                    : `${(unpaidBills ?? []).length} bill(s) still unpaid — ${fmt(totalUnpaidAmount)} outstanding`,
                },
                {
                  label: "Stock Take",
                  status: stockSaved ? "ok" : countedItems.length > 0 ? "partial" : "pending",
                  detail: stockSaved
                    ? `${countedItems.length} products counted and saved`
                    : countedItems.length > 0
                    ? `${countedItems.length} products counted — not yet saved`
                    : "No products counted yet",
                },
                {
                  label: "Vendor Balance Rollover",
                  status: rolloverDone ? "ok" : "pending",
                  detail: rolloverDone
                    ? `${vendorRollRows.length} vendors rolled over to ${nextFYStartStr}`
                    : `${vendorRollRows.length} vendors pending`,
                },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className={`mt-0.5 ${item.status === "ok" ? "text-success" : item.status === "warn" ? "text-destructive" : "text-muted-foreground"}`}>
                    {item.status === "ok"   ? <CheckCircle2 className="h-4 w-4" /> :
                     item.status === "warn" ? <AlertTriangle className="h-4 w-4" /> :
                     <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Closing Year</p>
                <p className="text-base font-bold text-foreground">{fyLabel}</p>
                <p className="text-xs text-muted-foreground">1 Apr {fyYear} – 31 Mar {fyYear + 1}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                <ArrowRight className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">New Year Opens</p>
                <p className="text-base font-bold text-foreground">{getFYLabel(fyYear + 1)}</p>
                <p className="text-xs text-muted-foreground">1 Apr {fyYear + 1} – 31 Mar {fyYear + 2}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <IndianRupee className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Opening Balance (New FY)</p>
                <p className="text-base font-bold text-foreground font-mono">{fmt(totalNewOpeningBalance)}</p>
                <p className="text-xs text-muted-foreground">across {vendorRollRows.length} vendors</p>
              </div>
            </div>
          </div>

          <Button onClick={() => setStep("stocktake")}>
            Start Stock Take <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* ── STEP 2: STOCK TAKE (SCAN / CODE ENTRY MODE) ── */}
      {step === "stocktake" && (
        <div className="space-y-4">

          {/* Scan/Entry Panel */}
          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-4">
              <ScanLine className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Scan or Enter Item Code</h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {countedItems.length} items counted · {varianceItems.length} variances
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step A: Code input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  1. Scan barcode or type item code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={codeRef}
                      value={codeInput}
                      onChange={e => { setCodeInput(e.target.value); setNotFound(false); setMatchedProduct(null); }}
                      onKeyDown={handleCodeKeyDown}
                      placeholder="e.g. SKU001 or scan barcode..."
                      className="pl-9 font-mono text-base"
                      autoComplete="off"
                    />
                  </div>
                  <Button onClick={handleCodeSearch} disabled={!codeInput.trim()} variant="outline">
                    Find
                  </Button>
                </div>

                {notFound && (
                  <p className="text-xs text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    No product found for code "{codeInput}"
                  </p>
                )}

                {matchedProduct && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground text-sm">{matchedProduct.name}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Code: <span className="font-mono text-foreground">{matchedProduct.item_code}</span></span>
                      <span>System stock: <span className="font-mono font-semibold text-foreground">{matchedProduct.quantity_in_stock}</span></span>
                      {matchedProduct.category && <span>Category: {matchedProduct.category}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Step B: Quantity input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  2. Enter physical count
                </label>
                <div className="flex gap-2">
                  <Input
                    ref={qtyRef}
                    type="number"
                    min={0}
                    value={qtyInput}
                    onChange={e => setQtyInput(e.target.value)}
                    onKeyDown={handleQtyKeyDown}
                    placeholder="Quantity counted..."
                    className="text-base font-mono"
                    disabled={!matchedProduct}
                  />
                  <Button
                    onClick={handleAddCount}
                    disabled={!matchedProduct || qtyInput === ""}
                    className="shrink-0"
                  >
                    Add ↵
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Press Enter after quantity to add and move to next item
                </p>
              </div>
            </div>
          </div>

          {/* Counted Items List */}
          {countedItems.length > 0 && (
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Counted Items ({countedItems.length})
                  </h3>
                  {varianceItems.length > 0 && (
                    <p className="text-xs text-warning mt-0.5">
                      {varianceItems.length} item(s) have variance from system stock
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setCountedItems([]); setStockSaved(false); }}
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Clear All
                  </Button>
                  <Button
                    size="sm"
                    disabled={saveStockTake.isPending || stockSaved}
                    onClick={() => saveStockTake.mutate()}
                  >
                    {saveStockTake.isPending ? "Saving..." : stockSaved ? "Saved ✓" : `Save ${countedItems.length} Items`}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                      <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">System Stock</th>
                      <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Physical Count</th>
                      <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Variance</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {countedItems.map(item => {
                      const variance = item.physical_count - item.system_stock;
                      return (
                        <tr key={item.product_id} className={`hover:bg-muted/20 ${variance !== 0 ? "bg-warning/5" : ""}`}>
                          <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{item.item_code}</td>
                          <td className="px-4 py-2.5 font-medium text-foreground">{item.name}</td>
                          <td className="px-4 py-2.5 text-sm text-muted-foreground">{item.category || "—"}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-foreground">{item.system_stock}</td>
                          <td className="px-4 py-2.5 text-right">
                            <input
                              type="number"
                              min={0}
                              value={item.physical_count}
                              onChange={e => updateCount(item.product_id, Number(e.target.value))}
                              className={`w-20 text-right rounded border px-2 py-1 text-sm font-mono bg-background focus:outline-none focus:ring-1 focus:ring-primary ${
                                variance !== 0 ? "border-warning/60" : "border-border"
                              }`}
                            />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {variance === 0 ? (
                              <span className="text-xs text-success font-mono">0</span>
                            ) : (
                              <span className={`text-xs font-mono font-semibold ${variance > 0 ? "text-success" : "text-destructive"}`}>
                                {variance > 0 ? "+" : ""}{variance}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <button onClick={() => removeItem(item.product_id)}
                              className="text-muted-foreground/30 hover:text-destructive transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {stockSaved && (
                <div className="px-5 py-3 border-t bg-success/5 text-xs text-success flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Stock take saved — {countedItems.length} products updated in the system.
                </div>
              )}
            </div>
          )}

          {countedItems.length === 0 && (
            <div className="bg-card rounded-xl border p-10 text-center">
              <ScanLine className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No items counted yet</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Scan a barcode or type an item code above to start</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("overview")}>← Back</Button>
            <Button onClick={() => setStep("rollover")}>
              Next: Vendor Rollover <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: VENDOR BALANCE ROLLOVER ── */}
      {step === "rollover" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" /> Vendor Balance Rollover
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Each vendor's current balance becomes their opening balance for 1 Apr {fyYear + 1}.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {rolloverDone ? (
                  <Badge className="bg-success/15 text-success border-success/20 text-xs gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Rollover Complete
                  </Badge>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={vendorsLoading || executeRollover.isPending}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {executeRollover.isPending ? "Rolling over..." : `Execute Rollover (${vendorRollRows.length} vendors)`}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Vendor Balance Rollover</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will update the <strong>opening balance</strong> for all {vendorRollRows.length} vendors to their current balance as of 31 March {fyYear + 1}, with opening balance date set to <strong>1 April {fyYear + 1}</strong>.
                          <br /><br />
                          Total new opening balance: <strong>{fmt(totalNewOpeningBalance)}</strong>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => executeRollover.mutate()}>
                          Yes, Roll Over Balances
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Vendor</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Current Opening</th>
                    <th className="text-center px-4 py-3" />
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Balance (31 Mar)</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">New Opening (1 Apr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {vendorRollRows.map(v => (
                    <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{v.company_name.charAt(0)}</span>
                          </div>
                          <span className="font-medium text-foreground">{v.company_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{fmt(v.current_opening)}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground/40"><ArrowRight className="h-3.5 w-3.5 mx-auto" /></td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-foreground">{fmt(v.current_balance)}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-bold">
                        <span className={rolloverDone ? "text-success" : "text-primary"}>{fmt(v.current_balance)}</span>
                        {rolloverDone && <CheckCircle2 className="h-3.5 w-3.5 text-success inline ml-1.5" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-muted/20">
                    <td className="px-4 py-3 font-semibold text-foreground" colSpan={3}>Total</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                      {fmt(vendorRollRows.reduce((s, v) => s + v.current_balance, 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-success">{fmt(totalNewOpeningBalance)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("stocktake")}>← Back</Button>
            <Button onClick={() => setStep("close")}>Next: Close Year <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </div>
        </div>
      )}

      {/* ── STEP 4: CLOSE YEAR ── */}
      {step === "close" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Year-End Summary — {fyLabel}</h2>
                <p className="text-xs text-muted-foreground">Review the closing status</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { label: "Stock Take",         done: stockSaved,   detail: stockSaved   ? `${countedItems.length} products updated` : "Not saved yet" },
                { label: "Vendor Rollover",    done: rolloverDone, detail: rolloverDone ? `${vendorRollRows.length} vendors → 1 Apr ${fyYear + 1}` : "Not executed yet" },
                { label: "Unpaid Bills",       done: (unpaidBills ?? []).length === 0, detail: (unpaidBills ?? []).length === 0 ? "All clear" : `${(unpaidBills ?? []).length} still unpaid` },
                { label: "New Opening Totals", done: rolloverDone, detail: `${fmt(totalNewOpeningBalance)} across ${vendorRollRows.length} vendors` },
              ].map(item => (
                <div key={item.label} className={`flex gap-3 p-4 rounded-lg border ${item.done ? "bg-success/5 border-success/20" : "bg-muted/30 border-border"}`}>
                  <div className={`mt-0.5 shrink-0 ${item.done ? "text-success" : "text-muted-foreground/40"}`}>
                    {item.done ? <CheckCircle2 className="h-5 w-5" /> : <div className="h-5 w-5 rounded-full border-2 border-current" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-muted/30 rounded-lg p-4 border border-border text-sm text-muted-foreground space-y-1.5 mb-4">
              <p className="font-medium text-foreground text-sm mb-2">What happens after closing:</p>
              <p>• New purchase bills will be posted to <strong>{getFYLabel(fyYear + 1)}</strong></p>
              <p>• Vendor opening balances are set to <strong>1 April {fyYear + 1}</strong></p>
              <p>• Stock quantities reflect the physical count from stock take</p>
            </div>

            <Button variant="outline" onClick={() => setStep("rollover")}>← Back</Button>
          </div>
        </div>
      )}
    </div>
  );
}
