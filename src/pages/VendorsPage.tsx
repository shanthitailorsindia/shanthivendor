import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Phone, Mail, Calendar, StickyNote, Globe, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["vendor-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addVendor = useMutation({
    mutationFn: async (vendor: any) => {
      const { error } = await supabase.from("vendor_profiles").insert(vendor);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-profiles"] });
      setOpen(false);
      toast.success("Vendor added successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = vendors?.filter(v =>
    v.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.toLowerCase().includes(search.toLowerCase()) ||
    v.category?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="page-subtitle">Manage your vendor directory · {filtered?.length ?? 0} vendors</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Vendor</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Vendor</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              addVendor.mutate({
                company_name: fd.get("company_name"),
                email: fd.get("email") || null,
                phone: fd.get("phone") || null,
                website: fd.get("website") || null,
                tax_id: fd.get("tax_id") || null,
                registration_number: fd.get("registration_number") || null,
                category: fd.get("category") || null,
                credit_limit: Number(fd.get("credit_limit")) || 0,
                payment_terms: Number(fd.get("payment_terms")) || 30,
                preferred_currency: fd.get("preferred_currency") || "INR",
                preferred_payment_method: fd.get("preferred_payment_method") || null,
                opening_balance: Number(fd.get("opening_balance")) || 0,
                opening_balance_date: fd.get("opening_balance_date") || null,
                notes: fd.get("notes") || null,
                status: "active",
              });
            }} className="space-y-4">
              <div><Label>Company Name *</Label><Input name="company_name" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input name="email" type="email" /></div>
                <div><Label>Phone</Label><Input name="phone" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Website</Label><Input name="website" type="url" placeholder="https://..." /></div>
                <div><Label>Category</Label><Input name="category" placeholder="e.g., Silk, Jewellery" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Tax ID (GSTIN)</Label><Input name="tax_id" /></div>
                <div><Label>Registration No.</Label><Input name="registration_number" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Credit Limit</Label><Input name="credit_limit" type="number" defaultValue="0" /></div>
                <div><Label>Payment Terms (days)</Label><Input name="payment_terms" type="number" defaultValue="30" /></div>
                <div><Label>Currency</Label><Input name="preferred_currency" defaultValue="INR" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Preferred Payment</Label>
                  <select name="preferred_payment_method" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div><Label>Opening Balance</Label><Input name="opening_balance" type="number" defaultValue="0" /></div>
              </div>
              <div><Label>Opening Balance Date</Label><Input name="opening_balance_date" type="date" /></div>
              <div><Label>Notes</Label><Textarea name="notes" rows={2} /></div>
              <Button type="submit" className="w-full" disabled={addVendor.isPending}>
                {addVendor.isPending ? "Adding..." : "Add Vendor"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading vendors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered?.map((v) => (
            <div key={v.id} className="stat-card animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{v.company_name}</h3>
                  {v.category && <p className="text-xs text-muted-foreground">{v.category}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${v.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {v.status}
                </span>
              </div>
              <div className="space-y-1.5 text-sm">
                {v.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{v.phone}</div>}
                {v.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{v.email}</div>}
                {v.website && <div className="flex items-center gap-2 text-muted-foreground"><Globe className="h-3.5 w-3.5" /><a href={v.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">{v.website}</a></div>}
                {v.tax_id && <div className="flex items-center gap-2 text-muted-foreground"><CreditCard className="h-3.5 w-3.5" />GSTIN: {v.tax_id}</div>}
                {v.notes && <div className="flex items-start gap-2 text-muted-foreground"><StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span className="line-clamp-2">{v.notes}</span></div>}
              </div>
              <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Terms: </span>
                  <span className="font-medium text-foreground">{v.payment_terms} days</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Credit: </span>
                  <span className="font-medium text-foreground">{formatCurrency(Number(v.credit_limit) || 0)}</span>
                </div>
              </div>
              {(Number(v.opening_balance) > 0) && (
                <div className="mt-2 pt-2 border-t flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">Opening Balance</p>
                  <p className="text-sm font-semibold font-mono text-foreground">{formatCurrency(Number(v.opening_balance))}</p>
                </div>
              )}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Added {format(new Date(v.created_at), "dd MMM yyyy")}
              </div>
            </div>
          ))}
          {filtered?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">No vendors found</div>
          )}
        </div>
      )}
    </div>
  );
}
