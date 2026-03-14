import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/fetchAll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Banknote, IndianRupee, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["vendor-payments"],
    queryFn: () => fetchAllRows("vendor_payments", "*", { order: { column: "created_at", ascending: false } }),
  });

  const { data: vendors } = useQuery({
    queryKey: ["vendor-profiles-list"],
    queryFn: () => fetchAllRows("vendor_profiles", "id, company_name", { eq: { status: "active" } }),
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

  const { data: allBills } = useQuery({
    queryKey: ["bills-for-payment"],
    queryFn: () => fetchAllRows("purchase_bills", "id, bill_number, vendor_id, total_amount, paid_amount, payment_status"),
  });

  // Filter bills by selected vendor and only show unpaid/partial
  const billsForSelectedVendor = useMemo(() => {
    if (!selectedVendorId || !allBills) return [];
    return allBills.filter(b => b.vendor_id === selectedVendorId && b.payment_status !== "paid");
  }, [selectedVendorId, allBills]);

  const { data: billMap } = useQuery({
    queryKey: ["bills-map"],
    queryFn: async () => {
      const data = await fetchAllRows("purchase_bills", "id, bill_number");
      const map: Record<string, string> = {};
      data.forEach(b => { map[b.id] = b.bill_number; });
      return map;
    },
  });

  const addPayment = useMutation({
    mutationFn: async (payment: any) => {
      // 1. Insert the payment record
      const { error } = await supabase.from("vendor_payments").insert({
        vendor_id: payment.vendor_id,
        bill_id: payment.bill_id || null,
        amount: payment.amount,
        payment_amount: payment.amount,
        payment_date: payment.payment_date,
        due_date: payment.due_date || payment.payment_date,
        payment_method: payment.payment_method,
        status: payment.status,
        notes: payment.notes,
      });
      if (error) throw error;

      // 2. If a bill is selected, update the bill's paid_amount and payment_status
      if (payment.bill_id) {
        const bill = allBills?.find(b => b.id === payment.bill_id);
        if (bill) {
          const newPaidAmount = Number(bill.paid_amount || 0) + Number(payment.amount);
          const totalAmount = Number(bill.total_amount);
          const newStatus = newPaidAmount >= totalAmount ? "paid" : newPaidAmount > 0 ? "partial" : "unpaid";

          const { error: updateError } = await supabase
            .from("purchase_bills")
            .update({
              paid_amount: newPaidAmount,
              payment_status: newStatus,
              status: newStatus === "paid" ? "paid" : bill.status,
            })
            .eq("id", payment.bill_id);
          if (updateError) throw updateError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-payments"] });
      queryClient.invalidateQueries({ queryKey: ["bills-for-payment"] });
      queryClient.invalidateQueries({ queryKey: ["bills-map"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-bills"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-balance"] });
      setOpen(false);
      setSelectedVendorId("");
      toast.success("Payment recorded successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "bg-success/15 text-success border-success/20";
      case "pending": return "bg-warning/15 text-warning border-warning/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredPayments = payments?.filter(p =>
    (vendorMap?.[p.vendor_id] ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (billMap?.[p.bill_id] ?? "").toLowerCase().includes(search.toLowerCase()) ||
    p.payment_method?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = payments?.reduce((s, p) => s + Number(p.payment_amount || p.amount || 0), 0) ?? 0;
  const completedCount = payments?.filter(p => p.status === "completed").length ?? 0;
  const pendingCount = payments?.filter(p => p.status === "pending").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-accent/20 backdrop-blur-sm flex items-center justify-center">
                <Banknote className="h-5 w-5 text-accent" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">Payments</h1>
            </div>
            <p className="text-primary-foreground/70 text-sm">Track vendor payment transactions · {payments?.length ?? 0} total</p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSelectedVendorId(""); }}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg w-fit">
                <Plus className="h-4 w-4 mr-2" />Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                addPayment.mutate({
                  vendor_id: fd.get("vendor_id"),
                  bill_id: fd.get("bill_id") || null,
                  amount: Number(fd.get("amount")),
                  payment_date: fd.get("payment_date"),
                  due_date: fd.get("due_date") || fd.get("payment_date"),
                  payment_method: fd.get("payment_method"),
                  status: fd.get("status"),
                  notes: fd.get("notes"),
                });
              }} className="space-y-4">
                <div>
                  <Label>Vendor *</Label>
                  <select
                    name="vendor_id"
                    required
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select vendor</option>
                    {vendors?.map(v => <option key={v.id} value={v.id}>{v.company_name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Against Bill (optional)</Label>
                  <select name="bill_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">No specific bill</option>
                    {billsForSelectedVendor.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bill_number} — {formatCurrency(Number(b.total_amount) - Number(b.paid_amount))} due
                      </option>
                    ))}
                  </select>
                  {selectedVendorId && billsForSelectedVendor.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">No unpaid bills for this vendor</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Amount *</Label><Input name="amount" type="number" step="0.01" required /></div>
                  <div><Label>Payment Date *</Label><Input name="payment_date" type="date" required /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Due Date</Label><Input name="due_date" type="date" /></div>
                  <div>
                    <Label>Payment Method</Label>
                    <select name="payment_method" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <select name="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div><Label>Notes</Label><Textarea name="notes" rows={2} /></div>
                <Button type="submit" className="w-full" disabled={addPayment.isPending}>
                  {addPayment.isPending ? "Recording..." : "Record Payment"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Stats */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Total Paid", value: formatCurrency(totalPaid), icon: IndianRupee },
            { label: "Transactions", value: payments?.length ?? 0, icon: Banknote },
            { label: "Completed", value: completedCount, icon: TrendingUp },
            { label: "Pending", value: pendingCount, icon: Clock },
          ].map((s) => (
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card" />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Vendor</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Bill Ref</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Due Date</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Payment Date</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Method</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
              ) : filteredPayments?.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12">
                  <Banknote className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No payments recorded</p>
                </td></tr>
              ) : filteredPayments?.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{vendorMap?.[p.vendor_id] ?? "—"}</td>
                  <td className="px-4 py-3 text-sm font-mono text-primary">{p.bill_id ? (billMap?.[p.bill_id] ?? "—") : "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.due_date ? format(new Date(p.due_date), "dd MMM yyyy") : "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.payment_date ? format(new Date(p.payment_date), "dd MMM yyyy") : "—"}</td>
                  <td className="px-4 py-3 text-sm text-foreground capitalize">{p.payment_method?.replace("_", " ") ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold font-mono text-success">{formatCurrency(Number(p.payment_amount || p.amount))}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${statusColor(p.status)}`}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">{p.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
