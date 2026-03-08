import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Phone, Mail, Globe, CreditCard, Building2,
  FileText, ExternalLink, MapPin, Users, IndianRupee, Pencil, Upload
} from "lucide-react";
import { format } from "date-fns";
import EditVendorDialog from "@/components/vendor/EditVendorDialog";
import ImportBillsDialog from "@/components/vendor/ImportBillsDialog";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const statusColor = (s: string) => {
  switch (s) {
    case "paid": return "bg-success/10 text-success";
    case "partial": return "bg-warning/10 text-warning";
    case "active": return "bg-success/10 text-success";
    default: return "bg-destructive/10 text-destructive";
  }
};

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["vendor-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: balanceSummary } = useQuery({
    queryKey: ["vendor-balance", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendor_balance_summary")
        .select("*")
        .eq("id", id!)
        .single();
      return data;
    },
    enabled: !!id,
  });

  const { data: bills } = useQuery({
    queryKey: ["vendor-bills", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("purchase_bills")
        .select("*")
        .eq("vendor_id", id!)
        .order("bill_date", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: payments } = useQuery({
    queryKey: ["vendor-payments", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendor_payments")
        .select("*")
        .eq("vendor_id", id!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: contacts } = useQuery({
    queryKey: ["vendor-contacts", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendor_contacts")
        .select("*")
        .eq("vendor_id", id!);
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: addresses } = useQuery({
    queryKey: ["vendor-addresses", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendor_addresses")
        .select("*")
        .eq("vendor_id", id!);
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: documents } = useQuery({
    queryKey: ["vendor-documents", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendor_documents")
        .select("*")
        .eq("vendor_id", id!);
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: billMap } = useQuery({
    queryKey: ["bill-map-for-vendor", id],
    queryFn: async () => {
      const { data } = await supabase.from("purchase_bills").select("id, bill_number").eq("vendor_id", id!);
      const map: Record<string, string> = {};
      data?.forEach(b => { map[b.id] = b.bill_number; });
      return map;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!vendor) {
    return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Vendor not found</div>;
  }

  const totalPurchases = bills?.reduce((s, b) => s + Number(b.total_amount), 0) ?? 0;
  const totalPayments = payments?.reduce((s, p) => s + Number(p.payment_amount ?? p.amount), 0) ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Button variant="ghost" size="sm" onClick={() => navigate("/vendors")} className="mb-3 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Vendors
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{vendor.company_name}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor(vendor.status)}`}>
                {vendor.status}
              </span>
            </div>
            {vendor.category && <p className="page-subtitle">{vendor.category}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
          {vendor.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{vendor.phone}</span>}
          {vendor.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{vendor.email}</span>}
          {vendor.website && (
            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary">
              <Globe className="h-3.5 w-3.5" />{vendor.website}
            </a>
          )}
          {vendor.tax_id && <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" />GSTIN: {vendor.tax_id}</span>}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Opening Balance</p>
            <p className="text-lg font-bold font-mono text-foreground">{formatCurrency(Number(balanceSummary?.opening_balance ?? vendor.opening_balance ?? 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
            <p className="text-lg font-bold font-mono text-foreground">{formatCurrency(Number(balanceSummary?.current_balance ?? 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Purchases</p>
            <p className="text-lg font-bold font-mono text-foreground">{formatCurrency(totalPurchases)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Payments</p>
            <p className="text-lg font-bold font-mono text-success">{formatCurrency(totalPayments)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Details */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-muted-foreground block text-xs">Registration No.</span><span className="font-medium text-foreground">{vendor.registration_number || "—"}</span></div>
            <div><span className="text-muted-foreground block text-xs">Credit Limit</span><span className="font-medium text-foreground">{formatCurrency(Number(vendor.credit_limit ?? 0))}</span></div>
            <div><span className="text-muted-foreground block text-xs">Payment Terms</span><span className="font-medium text-foreground">{vendor.payment_terms} days</span></div>
            <div><span className="text-muted-foreground block text-xs">Preferred Payment</span><span className="font-medium text-foreground">{vendor.preferred_payment_method || "—"}</span></div>
            <div><span className="text-muted-foreground block text-xs">Currency</span><span className="font-medium text-foreground">{vendor.preferred_currency || "INR"}</span></div>
            <div><span className="text-muted-foreground block text-xs">Opening Bal. Date</span><span className="font-medium text-foreground">{vendor.opening_balance_date ? format(new Date(vendor.opening_balance_date), "dd MMM yyyy") : "—"}</span></div>
            <div className="col-span-2"><span className="text-muted-foreground block text-xs">Notes</span><span className="font-medium text-foreground">{vendor.notes || "—"}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="bills">
        <TabsList>
          <TabsTrigger value="bills">Purchase Bills ({bills?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="addresses">Addresses ({addresses?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="bills">
          <div className="data-table-container overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Bill #</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Due Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Total</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Paid</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bills?.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No purchase bills</td></tr>
                ) : bills?.map(b => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-foreground">{b.bill_number}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(b.bill_date), "dd MMM yyyy")}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(b.due_date), "dd MMM yyyy")}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-foreground">{formatCurrency(Number(b.total_amount))}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-success">{formatCurrency(Number(b.paid_amount))}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor(b.payment_status)}`}>{b.payment_status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="data-table-container overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Method</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Bill Ref</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments?.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No payments</td></tr>
                ) : payments?.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.payment_date ? format(new Date(p.payment_date), "dd MMM yyyy") : "—"}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-success">{formatCurrency(Number(p.payment_amount ?? p.amount))}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{p.payment_method || "—"}</td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{p.bill_id ? (billMap?.[p.bill_id] ?? "—") : "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor(p.status)}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[200px]">{p.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          {contacts?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No contacts added</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts?.map(c => (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{c.first_name} {c.last_name}</p>
                        {c.designation && <p className="text-xs text-muted-foreground">{c.designation}{c.department ? ` · ${c.department}` : ""}</p>}
                      </div>
                      {c.is_primary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {c.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{c.phone}</div>}
                      {c.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{c.email}</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="addresses">
          {addresses?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No addresses added</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses?.map(a => (
                <Card key={a.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{a.address_type}</Badge>
                      {a.is_primary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                    </div>
                    <div className="text-sm text-foreground">
                      <p>{a.address_line1}</p>
                      {a.address_line2 && <p>{a.address_line2}</p>}
                      <p>{a.city}, {a.state} {a.postal_code}</p>
                      <p className="text-muted-foreground">{a.country}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents">
          {documents?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No documents uploaded</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents?.map(d => (
                <Card key={d.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{d.file_name}</p>
                        <p className="text-xs text-muted-foreground">{d.document_type}</p>
                      </div>
                      <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    {d.file_size && <p className="text-xs text-muted-foreground mt-1">{(d.file_size / 1024).toFixed(1)} KB</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
