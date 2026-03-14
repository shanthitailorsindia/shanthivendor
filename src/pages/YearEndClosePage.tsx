import { useState, useMemo } from "react";
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
  CalendarCheck, Package, Building2, CheckCircle2, AlertTriangle,
  ArrowRight, RefreshCw, ClipboardList, IndianRupee, Lock,
  TrendingUp, FileCheck,
} from "lucide-react";
import { toast } from "sonner";

/* ── Indian FY helpers ── */
const fyStartYear = (d: Date) => (d.getMonth() < 3 ? d.getFullYear() - 1 : d.getFullYear());
const getFYLabel = (startYear: number) =>
  `FY ${String(startYear).slice(2)}-${String(startYear + 1).slice(2)}`;
const getFYEnd = (startYear: number) => new Date(startYear + 1, 2, 31); // March 31
const getFYStart = (startYear: number) => new Date(startYear, 3, 1);    // April 1

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

type StockRow = {
  id: string;
  item_code: string;
  name: string;
  category: string | null;
  system_stock: number;
  physical_count: number | null; // null = not yet entered
};

type VendorRollRow = {
  id: string;
  company_name: string;
  current_opening: number;
  current_balance: number; // will become new opening
};

/* ── step types ── */
type Step = "overview" | "stocktake" | "rollover" | "close";

export default function YearEndClosePage() {
  const now = new Date();
  const fyYear = fyStartYear(now);
  const fyLabel = getFYLabel(fyYear);
  const fyEndDate = getFYEnd(fyYear);
  const nextFYStart = getFYStart(fyYear + 1); // April 1 of next year
  const nextFYStartStr = `${fyYear + 1}-04-01`;

  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("overview");

  // Stock take state: productId -> physical count
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, number>>({});
  const [stockSaved, setStockSaved] = useState(false);

  // Rollover state
  const [rolloverDone, setRolloverDone] = useState(false);

  /* ── Queries ── */
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["yearend-products"],
    queryFn: () => fetchAllRows("products", "id, item_code, name, category, quantity_in_stock", {
      order: { column: "name", ascending: true },
    }),
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["yearend-vendors"],
    queryFn: () => fetchAllRows("vendor_profiles", "id, company_name, opening_balance, status", {
      order: { column: "company_name", ascending: true },
    }),
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
      fetchAllRows("purchase_bills", "id, bill_number, total_amount, paid_amount, payment_status", {
        neq: { payment_status: "paid" },
      }),
  });

  /* ── Derived data ── */
  const stockRows = useMemo<StockRow[]>(() => {
    return (products ?? []).map(p => ({
      id: p.id,
      item_code: p.item_code ?? "",
      name: p.name ?? "",
      category: p.category ?? null,
      system_stock: Number(p.quantity_in_stock ?? 0),
      physical_count: physicalCounts[p.id] !== undefined ? physicalCounts[p.id] : null,
    }));
  }, [products, physicalCounts]);

  const vendorRollRows = useMemo<VendorRollRow[]>(() => {
    const balMap = new Map((balances ?? []).map(b => [b.id, Number(b.current_balance ?? 0)]));
    return (vendors ?? []).map(v => ({
      id: v.id,
      company_name: v.company_name ?? "Unknown",
      current_opening: Number(v.opening_balance ?? 0),
      current_balance: balMap.get(v.id) ?? 0,
    }));
  }, [vendors, balances]);

  const stockCountEntered = Object.keys(physicalCounts).length;
  const stockVarianceItems = stockRows.filter(
    r => r.physical_count !== null && r.physical_count !== r.system_stock
  );
  const totalUnpaidAmount = (unpaidBills ?? []).reduce(
    (s, b) => s + (Number(b.total_amount) - Number(b.paid_amount)), 0
  );
  const totalNewOpeningBalance = vendorRollRows.reduce((s, r) => s + r.current_balance, 0);

  /* ── Mutations ── */
  const saveStockTake = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(physicalCounts).map(([id, count]) =>
        supabase.from("products").update({ quantity_in_stock: count }).eq("id", id)
      );
      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw new Error(`${errors.length} product(s) failed to update`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["yearend-products"] });
      queryClient.invalidateQueries({ queryKey: ["products-list"] });
      setStockSaved(true);
      toast.success(`Stock take saved — ${stockCountEntered} products updated`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const executeRollover = useMutation({
    mutationFn: async () => {
      const updates = vendorRollRows.map(v =>
        supabase
          .from("vendor_profiles")
          .update({
            opening_balance: v.current_balance,
            opening_balance_date: nextFYStartStr,
          })
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
      toast.success(`Vendor balances rolled over to ${nextFYStartStr} successfully`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  /* ── Step nav ── */
  const steps: { key: Step; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: FileCheck },
    { key: "stocktake", label: "Stock Take", icon: Package },
    { key: "rollover", label: "Vendor Rollover", icon: RefreshCw },
    { key: "close", label: "Close Year", icon: Lock },
  ];

  const stepStatus = (s: Step) => {
    if (s === "stocktake") return stockSaved ? "done" : stockCountEntered > 0 ? "partial" : "pending";
    if (s === "rollover") return rolloverDone ? "done" : "pending";
    return "pending";
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8 text-primary-foreground">
        <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')]" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-accent/20 backdrop-blur-sm flex items-center justify-center">
                <CalendarCheck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Year-End Close</h1>
                <p className="text-primary-foreground/70 text-sm">
                  {fyLabel} · Closes on 31 March {fyYear + 1} · New FY starts 1 April {fyYear + 1}
                </p>
              </div>
            </div>
          </div>
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Unpaid Bills", value: (unpaidBills ?? []).length, sub: fmt(totalUnpaidAmount), warn: (unpaidBills ?? []).length > 0 },
              { label: "Products", value: (products ?? []).length, sub: `${stockCountEntered} counted` },
              { label: "Vendors", value: (vendors ?? []).length, sub: rolloverDone ? "Rolled over ✓" : "Pending rollover" },
            ].map(k => (
              <div key={k.label} className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3 border border-primary-foreground/10">
                <span className={`text-xs ${k.warn ? "text-destructive font-semibold" : "text-primary-foreground/60"}`}>{k.label}</span>
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
            <button
              key={s.key}
              onClick={() => setStep(s.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground border-border hover:border-primary/40"
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                status === "done" ? "bg-success text-white" :
                status === "partial" ? "bg-warning text-white" :
                active ? "bg-primary-foreground/20 text-primary-foreground" :
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
                  status: stockSaved ? "ok" : stockCountEntered > 0 ? "partial" : "pending",
                  detail: stockSaved
                    ? `${stockCountEntered} products counted and saved`
                    : stockCountEntered > 0
                    ? `${stockCountEntered} of ${(products ?? []).length} products counted — not yet saved`
                    : `${(products ?? []).length} products need physical count`,
                },
                {
                  label: "Vendor Balance Rollover",
                  status: rolloverDone ? "ok" : "pending",
                  detail: rolloverDone
                    ? `${vendorRollRows.length} vendors rolled over to ${nextFYStartStr}`
                    : `${vendorRollRows.length} vendors pending — current balances become new opening balances`,
                },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className={`mt-0.5 ${item.status === "ok" ? "text-success" : item.status === "warn" ? "text-destructive" : "text-muted-foreground"}`}>
                    {item.status === "ok" ? <CheckCircle2 className="h-4 w-4" /> :
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

          {/* FY info card */}
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

          <div className="flex gap-3">
            <Button onClick={() => setStep("stocktake")}>
              Start Stock Take <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: STOCK TAKE ── */}
      {step === "stocktake" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" /> Physical Stock Count
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter actual physical count for each product. Leave blank to keep system stock unchanged.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{stockCountEntered} of {stockRows.length} entered</span>
                {stockVarianceItems.length > 0 && (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-[10px]">
                    {stockVarianceItems.length} variances
                  </Badge>
                )}
                <Button
                  size="sm"
                  disabled={stockCountEntered === 0 || saveStockTake.isPending || stockSaved}
                  onClick={() => saveStockTake.mutate()}
                >
                  {saveStockTake.isPending ? "Saving..." : stockSaved ? "Saved ✓" : `Save ${stockCountEntered} Updates`}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">System Stock</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Physical Count</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {productsLoading ? (
                    <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">Loading products...</td></tr>
                  ) : stockRows.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No products found</td></tr>
                  ) : (
                    stockRows.map(row => {
                      const variance = row.physical_count !== null ? row.physical_count - row.system_stock : null;
                      const hasVariance = variance !== null && variance !== 0;
                      return (
                        <tr key={row.id} className={`hover:bg-muted/20 transition-colors ${hasVariance ? "bg-warning/5" : ""}`}>
                          <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{row.item_code}</td>
                          <td className="px-4 py-2.5 font-medium text-foreground">{row.name}</td>
                          <td className="px-4 py-2.5 text-sm text-muted-foreground">{row.category || "—"}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-semibold text-foreground">{row.system_stock}</td>
                          <td className="px-4 py-2.5 text-right">
                            <input
                              type="number"
                              min={0}
                              placeholder={String(row.system_stock)}
                              value={physicalCounts[row.id] !== undefined ? physicalCounts[row.id] : ""}
                              onChange={e => {
                                const val = e.target.value;
                                if (val === "") {
                                  setPhysicalCounts(prev => { const n = { ...prev }; delete n[row.id]; return n; });
                                } else {
                                  setPhysicalCounts(prev => ({ ...prev, [row.id]: Number(val) }));
                                }
                              }}
                              className={`w-20 text-right rounded border px-2 py-1 text-sm font-mono bg-background focus:outline-none focus:ring-1 focus:ring-primary ${
                                hasVariance ? "border-warning/60 bg-warning/5" : "border-border"
                              }`}
                            />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {variance === null ? (
                              <span className="text-xs text-muted-foreground/40">—</span>
                            ) : variance === 0 ? (
                              <span className="text-xs text-success font-mono">0</span>
                            ) : (
                              <span className={`text-xs font-mono font-semibold ${variance > 0 ? "text-success" : "text-destructive"}`}>
                                {variance > 0 ? "+" : ""}{variance}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {stockVarianceItems.length > 0 && (
              <div className="px-5 py-3 border-t bg-warning/5 text-xs text-warning flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {stockVarianceItems.length} product(s) have variance between system stock and physical count. Saving will update the system stock to the physical count.
              </div>
            )}
          </div>

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
                  Each vendor's current balance as of 31 Mar {fyYear + 1} will become their opening balance for 1 Apr {fyYear + 1}.
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
                          This will update the <strong>opening balance</strong> for all {vendorRollRows.length} vendors to their <strong>current balance as of 31 March {fyYear + 1}</strong>, with opening balance date set to <strong>1 April {fyYear + 1}</strong>.
                          <br /><br />
                          Total opening balance for new FY: <strong>{fmt(totalNewOpeningBalance)}</strong>
                          <br /><br />
                          This action can be re-run if needed.
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
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Current Opening Balance</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"></th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Current Balance (31 Mar)</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">New Opening Balance (1 Apr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {vendorsLoading ? (
                    <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">Loading vendors...</td></tr>
                  ) : (
                    vendorRollRows.map(v => {
                      const changed = v.current_balance !== v.current_opening;
                      return (
                        <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-primary">{v.company_name.charAt(0)}</span>
                              </div>
                              <span className="font-medium text-foreground">{v.company_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">
                            {fmt(v.current_opening)}
                          </td>
                          <td className="px-4 py-3 text-center text-muted-foreground/40">
                            <ArrowRight className="h-3.5 w-3.5 mx-auto" />
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-foreground">
                            {fmt(v.current_balance)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-bold">
                            <span className={rolloverDone ? "text-success" : changed ? "text-primary" : "text-foreground"}>
                              {fmt(v.current_balance)}
                            </span>
                            {rolloverDone && <CheckCircle2 className="h-3.5 w-3.5 text-success inline ml-1.5" />}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-muted/20">
                    <td className="px-4 py-3 text-sm font-semibold text-foreground" colSpan={3}>Total</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                      {fmt(vendorRollRows.reduce((s, v) => s + v.current_balance, 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-success">
                      {fmt(totalNewOpeningBalance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("stocktake")}>← Back</Button>
            <Button onClick={() => setStep("close")}>
              Next: Close Year <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
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
                <p className="text-xs text-muted-foreground">Review the closing status before finalising</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { label: "Stock Take", done: stockSaved, detail: stockSaved ? `${stockCountEntered} products updated` : "Not completed" },
                { label: "Vendor Rollover", done: rolloverDone, detail: rolloverDone ? `${vendorRollRows.length} vendors rolled over to 1 Apr ${fyYear + 1}` : "Not executed" },
                { label: "Unpaid Bills", done: (unpaidBills ?? []).length === 0, detail: (unpaidBills ?? []).length === 0 ? "All clear" : `${(unpaidBills ?? []).length} bills remain unpaid (${fmt(totalUnpaidAmount)})` },
                { label: "New Opening Balances", done: rolloverDone, detail: `${fmt(totalNewOpeningBalance)} total across ${vendorRollRows.length} vendors` },
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

            <div className="bg-muted/30 rounded-lg p-4 border border-border mb-6 text-sm text-muted-foreground space-y-1.5">
              <p className="font-medium text-foreground text-sm mb-2">What happens after year-end close:</p>
              <p>• All new purchase bills will be posted to <strong>{getFYLabel(fyYear + 1)}</strong></p>
              <p>• Vendor opening balances are now set to <strong>1 April {fyYear + 1}</strong></p>
              <p>• Stock quantities reflect the physical count taken during stock take</p>
              <p>• GST Reports and FY filters will treat {fyYear + 1} as the new active year</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("rollover")}>← Back</Button>
              {!stockSaved && (
                <p className="text-xs text-warning flex items-center gap-1.5 self-center">
                  <AlertTriangle className="h-3.5 w-3.5" /> Stock take not saved yet
                </p>
              )}
              {!rolloverDone && (
                <p className="text-xs text-warning flex items-center gap-1.5 self-center">
                  <AlertTriangle className="h-3.5 w-3.5" /> Vendor rollover not executed yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
