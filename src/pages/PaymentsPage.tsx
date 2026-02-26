import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["vendor-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ["vendors-list"],
    queryFn: async () => {
      const { data } = await supabase.from("vendors").select("id, vendor_name").eq("is_active", true);
      return data ?? [];
    },
  });

  const { data: vendorMap } = useQuery({
    queryKey: ["vendors-map"],
    queryFn: async () => {
      const { data } = await supabase.from("vendors").select("id, vendor_name");
      const map: Record<string, string> = {};
      data?.forEach(v => { map[v.id] = v.vendor_name; });
      return map;
    },
  });

  const { data: billsList } = useQuery({
    queryKey: ["bills-for-payment"],
    queryFn: async () => {
      const { data } = await supabase.from("purchase_bills").select("id, bill_number, vendor_id, total_amount, paid_amount").neq("payment_status", "paid");
      return data ?? [];
    },
  });

  const addPayment = useMutation({
    mutationFn: async (payment: any) => {
      const { error } = await supabase.from("vendor_payments").insert(payment);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-payments"] });
      queryClient.invalidateQueries({ queryKey: ["bills-for-payment"] });
      setOpen(false);
      toast.success("Payment recorded");
    },
    onError: (e) => toast.error(e.message),
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "bg-success/10 text-success";
      case "pending": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Track vendor payment transactions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Record Payment</Button>
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
                payment_amount: Number(fd.get("amount")),
                payment_date: fd.get("payment_date"),
                due_date: fd.get("payment_date"),
                payment_method: fd.get("payment_method"),
                status: "completed",
                notes: fd.get("notes"),
              });
            }} className="space-y-4">
              <div>
                <Label>Vendor *</Label>
                <select name="vendor_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select vendor</option>
                  {vendors?.map(v => <option key={v.id} value={v.id}>{v.vendor_name}</option>)}
                </select>
              </div>
              <div>
                <Label>Against Bill (optional)</Label>
                <select name="bill_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">No specific bill</option>
                  {billsList?.map(b => <option key={b.id} value={b.id}>{b.bill_number} — {formatCurrency(Number(b.total_amount) - Number(b.paid_amount))} due</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Amount *</Label><Input name="amount" type="number" step="0.01" required /></div>
                <div><Label>Date *</Label><Input name="payment_date" type="date" required /></div>
              </div>
              <div>
                <Label>Payment Method</Label>
                <select name="payment_method" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="cheque">Cheque</option>
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

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="data-table-container">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Vendor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Method</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
            ) : payments?.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No payments recorded</td></tr>
            ) : payments?.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{vendorMap?.[p.vendor_id] ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.payment_date ? format(new Date(p.payment_date), "dd MMM yyyy") : "—"}</td>
                <td className="px-4 py-3 text-sm text-foreground capitalize">{p.payment_method?.replace("_", " ") ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold font-mono text-foreground">{formatCurrency(Number(p.payment_amount || p.amount))}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor(p.status)}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
