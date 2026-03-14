import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllRows } from "@/lib/fetchAll";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Wallet, IndianRupee, Calendar, AlertTriangle, Clock,
  TrendingUp, CalendarRange,
} from "lucide-react";
import { format, differenceInDays, getDaysInMonth } from "date-fns";

/* ─── helpers ─── */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
};

interface VendorRow {
  vendor_id: string;
  vendor_name: string;
  outstanding: number;
  overdueDays: number;
  priority: "high" | "medium" | "low";
  score: number;
  allocated: number;
  payDate: string;
  action: "Pay Full" | "Partial" | "Defer";
}

/* ─── payment windows between 10th–28th ─── */
function getPaymentDates(year: number, month: number): Date[] {
  // 3 payment windows: 10th, 18th, 28th
  const dates = [10, 18, 28].map(d => {
    const maxDay = getDaysInMonth(new Date(year, month));
    return new Date(year, month, Math.min(d, maxDay));
  });
  return dates;
}

/* ─── main ─── */
export default function PaymentPlannerPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [budget, setBudget] = useState(() => {
    const s = localStorage.getItem("monthly-payment-budget");
    return s ? Number(s) : 500000;
  });

  const handleBudgetChange = (v: string) => {
    const n = Number(v) || 0;
    setBudget(n);
    localStorage.setItem("monthly-payment-budget", String(n));
  };

  const [year, month] = selectedMonth.split("-").map(Number);
  const payDates = useMemo(() => getPaymentDates(year, month - 1), [year, month]);

  /* ── queries ── */
  const { data: bills } = useQuery({
    queryKey: ["planner-bills"],
    queryFn: () =>
      fetchAllRows("purchase_bills", "id, vendor_id, due_date, total_amount, paid_amount, payment_status", {
        neq: { payment_status: "paid" },
        order: { column: "due_date", ascending: true },
      }),
  });

  const { data: vendors } = useQuery({
    queryKey: ["planner-vendors"],
    queryFn: () => fetchAllRows("vendor_profiles", "id, company_name, credit_limit, payment_terms"),
  });

  const { data: balances } = useQuery({
    queryKey: ["planner-balances"],
    queryFn: async () => {
      const { data } = await supabase.from("vendor_balance_summary").select("id, current_balance");
      return data ?? [];
    },
  });

  /* ── compute vendor-level outstanding ── */
  const vendorRows = useMemo<VendorRow[]>(() => {
    if (!bills || !vendors) return [];

    const vendorMap = new Map(vendors.map(v => [v.id, v]));
    const balanceMap = new Map((balances ?? []).map(b => [b.id, Number(b.current_balance ?? 0)]));

    // Aggregate outstanding per vendor
    const agg: Record<string, { outstanding: number; earliestDue: string }> = {};
    bills.forEach(b => {
      const out = Number(b.total_amount) - Number(b.paid_amount);
      if (out <= 0) return;
      if (!agg[b.vendor_id]) agg[b.vendor_id] = { outstanding: 0, earliestDue: b.due_date };
      agg[b.vendor_id].outstanding += out;
      if (b.due_date < agg[b.vendor_id].earliestDue) agg[b.vendor_id].earliestDue = b.due_date;
    });

    const today = new Date();
    const rows = Object.entries(agg).map(([vid, { outstanding, earliestDue }]) => {
      const v = vendorMap.get(vid);
      const daysOverdue = Math.max(0, differenceInDays(today, new Date(earliestDue)));
      const creditLimit = Number(v?.credit_limit ?? 0);
      const curBal = balanceMap.get(vid) ?? 0;
      const terms = v?.payment_terms ?? 30;
      const balRatio = creditLimit > 0 ? Math.min(1, curBal / creditLimit) : 0.5;
      const score = (daysOverdue * 10) + (balRatio * 5) + (terms > 0 ? (1 / terms) * 3 : 0);
      const priority: "high" | "medium" | "low" =
        daysOverdue > 0 ? "high" : differenceInDays(new Date(earliestDue), today) <= 7 ? "medium" : "low";

      return {
        vendor_id: vid,
        vendor_name: v?.company_name ?? "Unknown",
        outstanding,
        overdueDays: daysOverdue,
        priority,
        score,
        allocated: 0,
        payDate: "",
        action: "Defer" as const,
      };
    });

    rows.sort((a, b) => b.score - a.score);

    // Allocate budget across 3 payment windows (10th, 18th, 28th)
    let remaining = budget;
    const windowBudget = budget / 3;
    let windowIdx = 0;
    let windowSpent = 0;

    rows.forEach(row => {
      if (remaining <= 0) {
        row.action = "Defer";
        return;
      }

      // Move to next window if current one is exhausted
      while (windowIdx < 2 && windowSpent >= windowBudget) {
        windowIdx++;
        windowSpent = 0;
      }

      const canPay = Math.min(remaining, row.outstanding);
      if (canPay >= row.outstanding) {
        row.allocated = row.outstanding;
        row.action = "Pay Full";
      } else if (canPay > 0) {
        row.allocated = canPay;
        row.action = "Partial";
      } else {
        row.action = "Defer";
      }

      row.payDate = format(payDates[windowIdx], "dd MMM yyyy");
      remaining -= row.allocated;
      windowSpent += row.allocated;
    });

    return rows;
  }, [bills, vendors, balances, budget, payDates]);

  const totalOutstanding = vendorRows.reduce((s, r) => s + r.outstanding, 0);
  const totalAllocated = vendorRows.reduce((s, r) => s + r.allocated, 0);
  const overdueVendors = vendorRows.filter(r => r.overdueDays > 0).length;
  const payFullCount = vendorRows.filter(r => r.action === "Pay Full").length;

  // Group by payment date for summary
  const windowSummary = useMemo(() => {
    const map: Record<string, { count: number; amount: number }> = {};
    vendorRows.forEach(r => {
      if (r.allocated <= 0) return;
      if (!map[r.payDate]) map[r.payDate] = { count: 0, amount: 0 };
      map[r.payDate].count++;
      map[r.payDate].amount += r.allocated;
    });
    return Object.entries(map);
  }, [vendorRows]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Payment Planner</h1>
                <p className="text-primary-foreground/70 text-sm">
                  Schedule payments between 10th–28th · {vendorRows.length} vendors with dues
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-primary-foreground/10">
                <CalendarRange className="h-4 w-4 text-accent" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-primary-foreground text-sm font-medium border-none outline-none"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3 border border-primary-foreground/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-primary-foreground/60">Monthly Budget</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-primary-foreground/60 text-sm">₹</span>
                <Input
                  type="number"
                  value={budget}
                  onChange={e => handleBudgetChange(e.target.value)}
                  className="text-lg font-bold border-none p-0 h-auto bg-transparent focus-visible:ring-0 font-mono text-primary-foreground"
                />
              </div>
            </div>
            {[
              { label: "Total Outstanding", value: fmt(totalOutstanding), icon: IndianRupee },
              { label: "Allocated", value: fmt(totalAllocated), icon: TrendingUp },
              { label: "Pay Full", value: payFullCount, icon: Calendar },
              { label: "Overdue Vendors", value: overdueVendors, icon: AlertTriangle },
            ].map(s => (
              <div key={s.label} className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3 border border-primary-foreground/10">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs text-primary-foreground/60">{s.label}</span>
                </div>
                <p className="text-lg font-bold font-mono">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Windows Summary */}
      {windowSummary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {windowSummary.map(([date, info]) => (
            <div key={date} className="bg-card rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{date}</span>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{fmt(info.amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">{info.count} vendor{info.count > 1 ? "s" : ""} to pay</p>
            </div>
          ))}
        </div>
      )}

      {/* Vendor Schedule Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Vendor Payment Schedule
          </h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Payment Window: <span className="font-semibold text-foreground">10th – 28th</span></span>
            <span>Remaining: <span className="font-mono font-semibold text-foreground">{fmt(budget - totalAllocated)}</span></span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Vendor</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Outstanding</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Allocated</th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pay Date</th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Overdue</th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {vendorRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Wallet className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No outstanding balances 🎉</p>
                  </td>
                </tr>
              ) : (
                vendorRows.map(row => (
                  <tr key={row.vendor_id} className={`hover:bg-muted/20 transition-colors ${row.action === "Defer" ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 font-medium text-foreground">{row.vendor_name}</td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">{fmt(row.outstanding)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-success">
                      {row.allocated > 0 ? fmt(row.allocated) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-foreground">
                      {row.payDate || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${priorityStyles[row.priority]}`}>
                        {row.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.overdueDays > 0 ? (
                        <span className="text-xs font-medium text-destructive">{row.overdueDays}d</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.action === "Pay Full" ? (
                        <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">Pay Full</Badge>
                      ) : row.action === "Partial" ? (
                        <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/20">Partial</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">Defer</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
