import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Props {
  vendor: any;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export default function EditVendorDialog({ vendor, open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (vendor) {
      setForm({
        company_name: vendor.company_name ?? "",
        email: vendor.email ?? "",
        phone: vendor.phone ?? "",
        website: vendor.website ?? "",
        category: vendor.category ?? "",
        tax_id: vendor.tax_id ?? "",
        registration_number: vendor.registration_number ?? "",
        credit_limit: vendor.credit_limit ?? 0,
        payment_terms: vendor.payment_terms ?? 30,
        preferred_currency: vendor.preferred_currency ?? "INR",
        preferred_payment_method: vendor.preferred_payment_method ?? "",
        opening_balance: vendor.opening_balance ?? 0,
        opening_balance_date: vendor.opening_balance_date ?? "",
        notes: vendor.notes ?? "",
        status: vendor.status ?? "active",
      });
    }
  }, [vendor]);

  const update = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { error } = await supabase
        .from("vendor_profiles")
        .update(payload)
        .eq("id", vendor.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-profile", vendor.id] });
      qc.invalidateQueries({ queryKey: ["vendor-profiles"] });
      qc.invalidateQueries({ queryKey: ["vendor-balance", vendor.id] });
      onOpenChange(false);
      toast.success("Vendor updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = {
      company_name: form.company_name,
      email: form.email || null,
      phone: form.phone || null,
      website: form.website || null,
      category: form.category || null,
      tax_id: form.tax_id || null,
      registration_number: form.registration_number || null,
      credit_limit: Number(form.credit_limit) || 0,
      payment_terms: Number(form.payment_terms) || 30,
      preferred_currency: form.preferred_currency || "INR",
      preferred_payment_method: form.preferred_payment_method || null,
      opening_balance: Number(form.opening_balance) || 0,
      opening_balance_date: form.opening_balance_date || null,
      notes: form.notes || null,
      status: form.status,
    };
    update.mutate(payload);
  };

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vendor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Company Name *</Label>
            <Input value={form.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Website</Label><Input type="url" placeholder="https://..." value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} /></div>
            <div><Label>Category</Label><Input placeholder="e.g., Silk, Jewellery" value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Tax ID (GSTIN)</Label><Input value={form.tax_id ?? ""} onChange={(e) => set("tax_id", e.target.value)} /></div>
            <div><Label>Registration No.</Label><Input value={form.registration_number ?? ""} onChange={(e) => set("registration_number", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Credit Limit</Label><Input type="number" value={form.credit_limit ?? 0} onChange={(e) => set("credit_limit", e.target.value)} /></div>
            <div><Label>Payment Terms (days)</Label><Input type="number" value={form.payment_terms ?? 30} onChange={(e) => set("payment_terms", e.target.value)} /></div>
            <div><Label>Currency</Label><Input value={form.preferred_currency ?? "INR"} onChange={(e) => set("preferred_currency", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Preferred Payment</Label>
              <select
                value={form.preferred_payment_method ?? ""}
                onChange={(e) => set("preferred_payment_method", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={form.status ?? "active"}
                onChange={(e) => set("status", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Opening Balance</Label><Input type="number" value={form.opening_balance ?? 0} onChange={(e) => set("opening_balance", e.target.value)} /></div>
            <div><Label>Opening Balance Date</Label><Input type="date" value={form.opening_balance_date ?? ""} onChange={(e) => set("opening_balance_date", e.target.value)} /></div>
          </div>
          <div><Label>Notes</Label><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></div>
          <Button type="submit" className="w-full" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
