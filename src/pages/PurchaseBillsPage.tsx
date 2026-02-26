import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PurchaseBillsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: bills, isLoading } = useQuery({
    queryKey: ["purchase-bills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_bills")
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

  const addBill = useMutation({
    mutationFn: async (bill: any) => {
      const { error } = await supabase.from("purchase_bills").insert(bill);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-bills"] });
      setOpen(false);
      toast.success("Purchase bill created");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = bills?.filter(b =>
    b.bill_number?.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Purchase Bills</h1>
          <p className="page-subtitle">Track vendor purchases and invoices</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Bill</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Purchase Bill</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              addBill.mutate({
                bill_number: fd.get("bill_number"),
                vendor_id: fd.get("vendor_id"),
                bill_date: fd.get("bill_date"),
                due_date: fd.get("due_date"),
                subtotal: Number(fd.get("subtotal")),
                tax_amount: Number(fd.get("tax_amount")),
                total_amount: Number(fd.get("subtotal")) + Number(fd.get("tax_amount")),
                notes: fd.get("notes"),
              });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Bill Number *</Label><Input name="bill_number" required /></div>
                <div>
                  <Label>Vendor *</Label>
                  <select name="vendor_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select vendor</option>
                    {vendors?.map(v => <option key={v.id} value={v.id}>{v.vendor_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Bill Date *</Label><Input name="bill_date" type="date" required /></div>
                <div><Label>Due Date *</Label><Input name="due_date" type="date" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Subtotal *</Label><Input name="subtotal" type="number" step="0.01" required /></div>
                <div><Label>Tax Amount</Label><Input name="tax_amount" type="number" step="0.01" defaultValue="0" /></div>
              </div>
              <div><Label>Notes</Label><Textarea name="notes" rows={2} /></div>
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

      <div className="data-table-container">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Bill #</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Vendor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Due Date</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Paid</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
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
                <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(bill.due_date), "dd MMM yyyy")}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold font-mono text-foreground">{formatCurrency(Number(bill.total_amount))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-success">{formatCurrency(Number(bill.paid_amount))}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor(bill.payment_status)}`}>
                    {bill.payment_status}
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
