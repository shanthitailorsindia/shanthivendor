import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/fetchAll";
import {
  Users, FileText, CreditCard, Package, TrendingUp, TrendingDown,
  IndianRupee, Calendar, AlertTriangle, Clock, ChevronRight, Wallet
} from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, differenceInDays, isAfter, isBefore, isWithinInterval } from "date-fns";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";

/* ─── Stat Card ─── */
function StatCard({ title, value, icon: Icon, trend, color }: {
  title: string; value: string; icon: any; trend?: string; color: string;
}) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
          {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/* ─── Types ─── */
interface UnpaidBill {
  id: string;
  bill_number: string;
  vendor_id: string;
  vendor_name: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  outstanding: number;
  payment_status: string;
  credit_limit: number;
  payment_terms: number;
  current_balance: number;
  priority: "high" | "medium" | "low";
  score: number;
  week: number;
  daysOverdue: number;
}

/* ─── Priority Algorithm ─── */
function computePriority(bill: {
  due_date: string; outstanding: number; credit_limit: number;
  current_balance: number; payment_terms: number;
}): { score: number; priority: "high" | "medium" | "low"; daysOverdue: number } {
  const today = new Date();
  const due = new Date(bill.due_date);
  const daysOverdue = Math.max(0, differenceInDays(today, due));
  const balanceRatio = bill.credit_limit > 0
    ? Math.min(1, bill.current_balance / bill.credit_limit)
    : 0.5;
  const termsFactor = bill.payment_terms > 0 ? (1 / bill.payment_terms) * 3 : 0;
  const score = (daysOverdue * 10) + (balanceRatio * 5) + termsFactor;

  let priority: "high" | "medium" | "low" = "low";
  if (daysOverdue > 0) priority = "high";
  else if (differenceInDays(due, today) <= 7) priority = "medium";

  return { score, priority, daysOverdue };
}

function getWeekOfMonth(date: Date): number {
  const monthStart = startOfMonth(date);
  const diff = differenceInDays(date, monthStart);
  return Math.min(Math.floor(diff / 7) + 1, 4);
}

/* ─── Currency Formatter ─── */
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const statusColor = (s: string) => {
  switch (s) {
    case "paid": return "bg-success/10 text-success";
    case "partial": return "bg-warning/10 text-warning";
    default: return "bg-destructive/10 text-destructive";
  }
};

const priorityStyles = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
};

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem("monthly-payment-budget");
    return saved ? Number(saved) : 500000;
  });

  const handleBudgetChange = (val: string) => {
    const num = Number(val) || 0;
    setMonthlyBudget(num);
    localStorage.setItem("monthly-payment-budget", String(num));
  };

  /* ── Existing Queries ── */
  const { data: vendors } = useQuery({
    queryKey: ["vendor-profiles-count"],
    queryFn: async () => {
      const { count } = await supabase.from("vendor_profiles").select("*", { count: "exact", head: true }).eq("status", "active");
      return count ?? 0;
    },
  });

  const { data: billsSummary } = useQuery({
    queryKey: ["bills-summary"],
    queryFn: async () => {
      const data = await fetchAllRows("purchase_bills", "total_amount, paid_amount, payment_status, status");
      const total = data.reduce((s, b) => s + Number(b.total_amount), 0);
      const paid = data.reduce((s, b) => s + Number(b.paid_amount), 0);
      const unpaid = data.filter(b => b.payment_status === 'unpaid').length;
      return { total, paid, unpaid, count: data.length };
    },
  });

  const { data: recentBills } = useQuery({
    queryKey: ["recent-bills"],
    queryFn: async () => {
      const { data } = await supabase
        .from("purchase_bills")
        .select("id, bill_number, total_amount, payment_status, bill_date, vendor_id")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products-count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true);
      return count ?? 0;
    },
  });

  /* ── Payment Planner Queries ── */
  const { data: unpaidBillsRaw } = useQuery({
    queryKey: ["unpaid-bills-planner"],
    queryFn: async () => {
      return await fetchAllRows("purchase_bills", "id, bill_number, vendor_id, due_date, total_amount, paid_amount, payment_status", {
        neq: { payment_status: "paid" },
        order: { column: "due_date", ascending: true },
      });
    },
  });

  const { data: vendorProfiles } = useQuery({
    queryKey: ["vendor-profiles-planner"],
    queryFn: async () => {
      return await fetchAllRows("vendor_profiles", "id, company_name, credit_limit, payment_terms");
    },
  });

  const { data: vendorBalances } = useQuery({
    queryKey: ["vendor-balances-planner"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendor_balance_summary")
        .select("id, current_balance");
      return data ?? [];
    },
  });

  /* ── Computed: Enriched & Scored Bills ── */
  const scoredBills = useMemo<UnpaidBill[]>(() => {
    if (!unpaidBillsRaw || !vendorProfiles || !vendorBalances) return [];

    const vendorMap = new Map(vendorProfiles.map(v => [v.id, v]));
    const balanceMap = new Map(vendorBalances.map(v => [v.id, Number(v.current_balance ?? 0)]));

    return unpaidBillsRaw.map(bill => {
      const vendor = vendorMap.get(bill.vendor_id);
      const outstanding = Number(bill.total_amount) - Number(bill.paid_amount);
      const creditLimit = Number(vendor?.credit_limit ?? 0);
      const paymentTerms = vendor?.payment_terms ?? 30;
      const currentBalance = balanceMap.get(bill.vendor_id) ?? 0;

      const { score, priority, daysOverdue } = computePriority({
        due_date: bill.due_date,
        outstanding,
        credit_limit: creditLimit,
        current_balance: currentBalance,
        payment_terms: paymentTerms,
      });

      return {
        id: bill.id,
        bill_number: bill.bill_number,
        vendor_id: bill.vendor_id,
        vendor_name: vendor?.company_name ?? "Unknown",
        due_date: bill.due_date,
        total_amount: Number(bill.total_amount),
        paid_amount: Number(bill.paid_amount),
        outstanding,
        payment_status: bill.payment_status,
        credit_limit: creditLimit,
        payment_terms: paymentTerms,
        current_balance: currentBalance,
        priority,
        score,
        week: bill.due_date ? getWeekOfMonth(new Date(bill.due_date)) : 1,
        daysOverdue,
      };
    }).sort((a, b) => b.score - a.score);
  }, [unpaidBillsRaw, vendorProfiles, vendorBalances]);

  /* ── Suggested Payment Schedule (budget allocation) ── */
  const { schedule, totalAllocated } = useMemo(() => {
    let remaining = monthlyBudget;
    const schedule = scoredBills.map(bill => {
      const canPay = remaining >= bill.outstanding;
      const allocate = canPay ? bill.outstanding : Math.min(remaining, bill.outstanding);
      const included = allocate > 0;
      if (included) remaining -= allocate;
      return { ...bill, allocated: allocate, included, deferred: !canPay && allocate === 0 };
    });
    return { schedule, totalAllocated: monthlyBudget - remaining };
  }, [scoredBills, monthlyBudget]);

  /* ── Chart Data: Weekly Breakdown ── */
  const chartData = useMemo(() => {
    const weeks = [
      { week: "Week 1", amount: 0, cumulative: 0 },
      { week: "Week 2", amount: 0, cumulative: 0 },
      { week: "Week 3", amount: 0, cumulative: 0 },
      { week: "Week 4", amount: 0, cumulative: 0 },
    ];
    scoredBills.forEach(b => {
      const idx = Math.min(b.week - 1, 3);
      weeks[idx].amount += b.outstanding;
    });
    let cum = 0;
    weeks.forEach(w => {
      cum += w.amount;
      w.cumulative = cum;
    });
    return weeks;
  }, [scoredBills]);

  const chartConfig = {
    amount: { label: "Due Amount", color: "hsl(var(--primary))" },
    cumulative: { label: "Cumulative", color: "hsl(var(--destructive))" },
  };

  const totalOutstanding = scoredBills.reduce((s, b) => s + b.outstanding, 0);
  const overdueBills = scoredBills.filter(b => b.daysOverdue > 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your vendor management system</p>
      </div>

      {/* ── Top Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Vendors" value={String(vendors ?? 0)} icon={Users} color="bg-primary/10 text-primary" />
        <StatCard title="Total Bills" value={String(billsSummary?.count ?? 0)} icon={FileText} color="bg-info/10 text-info" />
        <StatCard title="Total Purchases" value={formatCurrency(billsSummary?.total ?? 0)} icon={TrendingUp} color="bg-success/10 text-success" />
        <StatCard title="Unpaid Bills" value={String(billsSummary?.unpaid ?? 0)} icon={TrendingDown} color="bg-destructive/10 text-destructive" />
      </div>

      {/* ── Payment Planner Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-accent/10">
            <Wallet className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Monthly Payment Planner</h2>
            <p className="text-xs text-muted-foreground">Intelligent payment scheduling based on priority & budget</p>
          </div>
        </div>

        {/* Budget + Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monthly Budget</label>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-muted-foreground text-lg">₹</span>
              <Input
                type="number"
                value={monthlyBudget}
                onChange={e => handleBudgetChange(e.target.value)}
                className="text-xl font-bold border-none p-0 h-auto bg-transparent focus-visible:ring-0 font-mono"
              />
            </div>
          </div>
          <div className="stat-card">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Outstanding</p>
            <p className="text-2xl font-bold mt-1 font-mono text-foreground">{formatCurrency(totalOutstanding)}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Allocated This Month</p>
            <p className="text-2xl font-bold mt-1 font-mono text-success">{formatCurrency(totalAllocated)}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-destructive" /> Overdue Bills
            </p>
            <p className="text-2xl font-bold mt-1 font-mono text-destructive">{overdueBills.length}</p>
            {overdueBills.length > 0 && (
              <p className="text-xs text-destructive mt-1">{formatCurrency(overdueBills.reduce((s, b) => s + b.outstanding, 0))} overdue</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* ── Cash Flow Forecast Chart ── */}
        <div className="lg:col-span-2 data-table-container">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Cash Flow Forecast
            </h3>
            <span className="text-xs text-muted-foreground">Budget: {formatCurrency(monthlyBudget)}</span>
          </div>
          <div className="p-4">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Due Amount" />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--destructive))", r: 4 }}
                  name="Cumulative"
                />
              </ComposedChart>
            </ChartContainer>
          </div>
        </div>

        {/* ── Pay These First (Vendor Priority) ── */}
        <div className="data-table-container">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Pay These First
            </h3>
          </div>
          <div className="divide-y max-h-[300px] overflow-y-auto">
            {scoredBills.slice(0, 8).map(bill => (
              <div key={bill.id} className="px-4 py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{bill.vendor_name}</p>
                  <p className="text-xs text-muted-foreground">{bill.bill_number} · {bill.daysOverdue > 0 ? `${bill.daysOverdue}d overdue` : `Due ${format(new Date(bill.due_date), "dd MMM")}`}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={`text-[10px] ${priorityStyles[bill.priority]}`}>
                    {bill.priority}
                  </Badge>
                  <span className="text-sm font-semibold font-mono text-foreground">{formatCurrency(bill.outstanding)}</span>
                </div>
              </div>
            ))}
            {scoredBills.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">All bills are paid! 🎉</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Suggested Payment Schedule Table ── */}
      <div className="data-table-container mb-8">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-info" /> Suggested Payment Schedule
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Budget: <span className="font-mono font-semibold text-foreground">{formatCurrency(monthlyBudget)}</span></span>
            <span>Allocated: <span className="font-mono font-semibold text-success">{formatCurrency(totalAllocated)}</span></span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Vendor</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Bill</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Due Date</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Outstanding</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Allocate</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Priority</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {schedule.slice(0, 15).map((row, i) => (
                <tr key={row.id} className={row.deferred ? "opacity-50" : ""}>
                  <td className="px-4 py-2.5 font-medium text-foreground">{row.vendor_name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{row.bill_number}</td>
                  <td className="px-4 py-2.5">
                    <span className={row.daysOverdue > 0 ? "text-destructive font-medium" : "text-foreground"}>
                      {format(new Date(row.due_date), "dd MMM yyyy")}
                    </span>
                    {row.daysOverdue > 0 && (
                      <span className="text-[10px] text-destructive ml-1">({row.daysOverdue}d late)</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-foreground">{formatCurrency(row.outstanding)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-success">
                    {row.allocated > 0 ? formatCurrency(row.allocated) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <Badge variant="outline" className={`text-[10px] ${priorityStyles[row.priority]}`}>
                      {row.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {row.deferred ? (
                      <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">Defer</Badge>
                    ) : row.allocated >= row.outstanding ? (
                      <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">Pay Full</Badge>
                    ) : row.allocated > 0 ? (
                      <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/20">Partial</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">Defer</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {schedule.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No pending payments</div>
          )}
          {schedule.length > 15 && (
            <div className="px-5 py-3 text-center text-xs text-muted-foreground border-t">
              Showing top 15 of {schedule.length} bills · <Link to="/purchase-bills" className="text-primary hover:underline">View all bills</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Original Dashboard Sections ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <div className="data-table-container">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Purchase Bills</h2>
            <Link to="/purchase-bills" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y">
            {recentBills?.map((bill) => (
              <div key={bill.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{bill.bill_number}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(bill.bill_date), "dd MMM yyyy")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(bill.payment_status)}`}>
                    {bill.payment_status}
                  </span>
                  <span className="text-sm font-semibold font-mono text-foreground">{formatCurrency(Number(bill.total_amount))}</span>
                </div>
              </div>
            ))}
            {(!recentBills || recentBills.length === 0) && (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No bills yet</div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-3">
              <IndianRupee className="h-5 w-5 text-success" />
              <h3 className="font-semibold text-foreground">Payment Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Purchased</span>
                <span className="font-semibold font-mono text-foreground">{formatCurrency(billsSummary?.total ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-semibold font-mono text-success">{formatCurrency(billsSummary?.paid ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Outstanding</span>
                <span className="font-semibold font-mono text-destructive">{formatCurrency((billsSummary?.total ?? 0) - (billsSummary?.paid ?? 0))}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3 mb-3">
              <Package className="h-5 w-5 text-info" />
              <h3 className="font-semibold text-foreground">Inventory</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{products ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Active products in inventory</p>
            <Link to="/qr-price-tags" className="inline-block mt-3 text-xs font-medium text-primary hover:underline">
              Generate QR Tags →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
