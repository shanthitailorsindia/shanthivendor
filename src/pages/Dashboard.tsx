import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, CreditCard, Package, TrendingUp, TrendingDown, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

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

export default function Dashboard() {
  const { data: vendors } = useQuery({
    queryKey: ["vendor-profiles-count"],
    queryFn: async () => {
      const { count } = await supabase.from("vendor_profiles").select("*", { count: "exact", head: true }).eq("status", "active");
      return count ?? 0;
    },
  });

  const { data: bills } = useQuery({
    queryKey: ["bills-summary"],
    queryFn: async () => {
      const { data } = await supabase.from("purchase_bills").select("total_amount, paid_amount, payment_status, status").limit(500);
      const total = data?.reduce((s, b) => s + Number(b.total_amount), 0) ?? 0;
      const paid = data?.reduce((s, b) => s + Number(b.paid_amount), 0) ?? 0;
      const unpaid = data?.filter(b => b.payment_status === 'unpaid').length ?? 0;
      return { total, paid, unpaid, count: data?.length ?? 0 };
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

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const statusColor = (s: string) => {
    switch (s) {
      case "paid": return "bg-success/10 text-success";
      case "partial": return "bg-warning/10 text-warning";
      default: return "bg-destructive/10 text-destructive";
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your vendor management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Vendors" value={String(vendors ?? 0)} icon={Users} color="bg-primary/10 text-primary" />
        <StatCard title="Total Bills" value={String(bills?.count ?? 0)} icon={FileText} color="bg-info/10 text-info" />
        <StatCard title="Total Purchases" value={formatCurrency(bills?.total ?? 0)} icon={TrendingUp} color="bg-success/10 text-success" />
        <StatCard title="Unpaid Bills" value={String(bills?.unpaid ?? 0)} icon={TrendingDown} color="bg-destructive/10 text-destructive" />
      </div>

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
                <span className="font-semibold font-mono text-foreground">{formatCurrency(bills?.total ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-semibold font-mono text-success">{formatCurrency(bills?.paid ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Outstanding</span>
                <span className="font-semibold font-mono text-destructive">{formatCurrency((bills?.total ?? 0) - (bills?.paid ?? 0))}</span>
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
