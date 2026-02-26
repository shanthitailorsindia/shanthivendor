import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addVendor = useMutation({
    mutationFn: async (vendor: { vendor_name: string; contact_name: string; email: string; phone: string; payment_terms: string; notes: string }) => {
      const { error } = await supabase.from("vendors").insert(vendor);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setOpen(false);
      toast.success("Vendor added successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = vendors?.filter(v =>
    v.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="page-subtitle">Manage your vendor directory</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Vendor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Vendor</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              addVendor.mutate({
                vendor_name: fd.get("vendor_name") as string,
                contact_name: fd.get("contact_name") as string,
                email: fd.get("email") as string,
                phone: fd.get("phone") as string,
                payment_terms: fd.get("payment_terms") as string,
                notes: fd.get("notes") as string,
              });
            }} className="space-y-4">
              <div><Label>Vendor Name *</Label><Input name="vendor_name" required /></div>
              <div><Label>Contact Person</Label><Input name="contact_name" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input name="email" type="email" /></div>
                <div><Label>Phone</Label><Input name="phone" /></div>
              </div>
              <div><Label>Payment Terms</Label><Input name="payment_terms" placeholder="e.g., Net 30" /></div>
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
                  <h3 className="font-semibold text-foreground">{v.vendor_name}</h3>
                  {v.contact_name && <p className="text-xs text-muted-foreground">{v.contact_name}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${v.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {v.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="space-y-1.5 text-sm">
                {v.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{v.phone}</div>}
                {v.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{v.email}</div>}
              </div>
              {v.payment_terms && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">Terms: <span className="font-medium text-foreground">{v.payment_terms}</span></p>
                </div>
              )}
              <div className="mt-2 pt-2 border-t flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-sm font-semibold font-mono text-foreground">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(v.total_balance) || 0)}
                </p>
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
