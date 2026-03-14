import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Phone, Mail, Globe, CreditCard,
  FileText, ExternalLink, Pencil, Upload,
  Building2, IndianRupee, Calendar, MapPin,
  User, Clock, TrendingUp, TrendingDown,
  Receipt, Banknote, Hash
} from "lucide-react";
import { format } from "date-fns";
import EditVendorDialog from "@/components/vendor/EditVendorDialog";
import ImportBillsDialog from "@/components/vendor/ImportBillsDialog";
import FYDateFilter, { type DateRange } from "@/components/vendor/FYDateFilter";
import VendorStatement from "@/components/vendor/VendorStatement";
import { fetchAllRows } from "@/lib/fetchAll";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const statusColor = (s: string) => {
  switch (s) {
    case "paid": return "bg-success/15 text-success border-success/20";
    case "partial": return "bg-warning/15 text-warning border-warning/20";
    case "active": return "bg-success/15 text-success border-success/20";
    default: return "bg-destructive/15 text-destructive border-destructive/20";
  }
};

const inRange = (dateStr: string | null, range: DateRange) => {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  if (range.from && d < range.from) return false;
  if (range.to) {
    const end = new Date(range.to);
    end.setHours(23, 59, 59, 999);
    if (d > end) return false;
  }
  return true;
};

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["vendor-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendor_profiles").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: balanceSummary } = useQuery({
    queryKey: ["vendor-balance", id],
    queryFn: async () => {
      const { data } = await supabase.from("vendor_balance_summary").select("*").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: bills } = useQuery({
    queryKey: ["vendor-bills", id],
    queryFn: () => fetchAllRows("purchase_bills", "*", { eq: { vendor_id: id! }, order: { column: "bill_date", ascending: false } }),
    enabled: !!id,
  });

  const { data: payments } = useQuery({
    queryKey: ["vendor-payments", id],
    queryFn: () => fetchAllRows("vendor_payments", "*", { eq: { vendor_id: id! }, order: { column: "created_at", ascending: false } }),
    enabled: !!id,
  });

  const { data: contacts } = useQuery({
    queryKey: ["vendor-contacts", id],
    queryFn: async () => { const { data } = await supabase.from("vendor_contacts").select("*").eq("vendor_id", id!); return data ?? []; },
    enabled: !!id,
  });

  const { data: addresses } = useQuery({
    queryKey: ["vendor-addresses", id],
    queryFn: async () => { const { data } = await supabase.from("vendor_addresses").select("*").eq("vendor_id", id!); return data ?? []; },
    enabled: !!id,
  });

  const { data: documents } = useQuery({
    queryKey: ["vendor-documents", id],
    queryFn: async () => { const { data } = await supabase.from("vendor_documents").select("*").eq("vendor_id", id!); return data ?? []; },
    enabled: !!id,
  });

  const { data: billMap } = useQuery({
    queryKey: ["bill-map-for-vendor", id],
    queryFn: async () => {
      const data = await fetchAllRows("purchase_bills", "id, bill_number", { eq: { vendor_id: id! } });
      const map: Record<string, string> = {};
      data.forEach(b => { map[b.id] = b.bill_number; });
      return map;
    },
    enabled: !!id,
  });

  const filteredBills = useMemo(() => (bills ?? []).filter(b => inRange(b.bill_date, dateRange)), [bills, dateRange]);
  const filteredPayments = useMemo(() => (payments ?? []).filter(p => inRange(p.payment_date ?? p.created_at, dateRange)), [payments, dateRange]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading vendor details...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Building2 className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground font-medium">Vendor not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/vendors")}>Back to Vendors</Button>
      </div>
    );
  }

  const totalPurchases = filteredBills.reduce((s, b) => s + Number(b.total_amount), 0);
  const totalPayments = filteredPayments.reduce((s, p) => s + Number(p.payment_amount ?? p.amount), 0);
  const openingBal = Number(balanceSummary?.opening_balance ?? vendor.opening_balance ?? 0);
  const currentBal = Number(balanceSummary?.current_balance ?? 0);

  return (
    <div className="space-y-6">
      {/* Back Nav */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/vendors")} className="-ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" />Back to Vendors
      </Button>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-accent/20 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/10">
                <span className="text-xl font-bold text-accent">{vendor.company_name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold">{vendor.company_name}</h1>
                  <Badge className={`text-[10px] uppercase tracking-wider ${vendor.status === 'active' ? 'bg-success/20 text-success border-success/30' : 'bg-primary-foreground/20 text-primary-foreground/70'}`}>
                    {vendor.status}
                  </Badge>
                </div>
                {vendor.category && <p className="text-primary-foreground/60 text-sm">{vendor.category}</p>}

                {/* Contact Info Row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-primary-foreground/70">
                  {vendor.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{vendor.phone}</span>}
                  {vendor.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{vendor.email}</span>}
                  {vendor.website && (
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-accent transition-colors">
                      <Globe className="h-3.5 w-3.5" />{vendor.website}
                    </a>
                  )}
                  {vendor.tax_id && <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" />GSTIN: {vendor.tax_id}</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                <Upload className="h-4 w-4 mr-1" /> Import Bills
              </Button>
              <Button size="sm" onClick={() => setEditOpen(true)}
                className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex items-center justify-between bg-card rounded-lg border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          {dateRange.from && dateRange.to
            ? `📅 ${format(dateRange.from, "dd MMM yyyy")} – ${format(dateRange.to, "dd MMM yyyy")}`
            : "📅 All Time"}
        </p>
        <FYDateFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Opening Balance</span>
            </div>
            <p className="text-xl font-bold font-mono text-foreground">{formatCurrency(openingBal)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Current Balance</span>
            </div>
            <p className="text-xl font-bold font-mono text-foreground">{formatCurrency(currentBal)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Receipt className="h-4 w-4 text-destructive" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Purchases</span>
            </div>
            <p className="text-xl font-bold font-mono text-foreground">{formatCurrency(totalPurchases)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{filteredBills.length} bills</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Banknote className="h-4 w-4 text-success" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Payments</span>
            </div>
            <p className="text-xl font-bold font-mono text-success">{formatCurrency(totalPayments)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{filteredPayments.length} payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Profile Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            {[
              { label: "Registration No.", value: vendor.registration_number, icon: Hash },
              { label: "Credit Limit", value: formatCurrency(Number(vendor.credit_limit ?? 0)), icon: CreditCard },
              { label: "Payment Terms", value: `${vendor.payment_terms} days`, icon: Clock },
              { label: "Preferred Payment", value: vendor.preferred_payment_method || "—", icon: Banknote },
              { label: "Currency", value: vendor.preferred_currency || "INR", icon: IndianRupee },
              { label: "Opening Bal. Date", value: vendor.opening_balance_date ? format(new Date(vendor.opening_balance_date), "dd MMM yyyy") : "—", icon: Calendar },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">{item.label}</span>
                  <span className="text-sm font-medium text-foreground">{item.value || "—"}</span>
                </div>
              </div>
            ))}
            {vendor.notes && (
              <div className="col-span-2 flex items-start gap-2.5">
                <div className="h-7 w-7 rounded bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="h-3.5 w-3.5 text-accent" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Notes</span>
                  <span className="text-sm text-foreground">{vendor.notes}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="bills" className="space-y-4">
        <TabsList className="bg-card border p-1 h-auto flex-wrap">
          <TabsTrigger value="bills" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
            <Receipt className="h-3.5 w-3.5" />Bills ({filteredBills.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
            <Banknote className="h-3.5 w-3.5" />Payments ({filteredPayments.length})
          </TabsTrigger>
          <TabsTrigger value="statement" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
            <FileText className="h-3.5 w-3.5" />Statement
          </TabsTrigger>
          <TabsTrigger value="contacts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
            <User className="h-3.5 w-3.5" />Contacts ({contacts?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="addresses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
            <MapPin className="h-3.5 w-3.5" />Addresses ({addresses?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
            <FileText className="h-3.5 w-3.5" />Documents ({documents?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* Bills Tab */}
        <TabsContent value="bills">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Bill #</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Due Date</th>
                      <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                      <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Paid</th>
                      <th className="text-center px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-center px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Bill File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredBills.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-12">
                        <Receipt className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No purchase bills found</p>
                      </td></tr>
                    ) : filteredBills.map(b => (
                      <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono font-medium text-primary">{b.bill_number}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(b.bill_date), "dd MMM yyyy")}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(b.due_date), "dd MMM yyyy")}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-foreground">{formatCurrency(Number(b.total_amount))}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono text-success">{formatCurrency(Number(b.paid_amount))}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${statusColor(b.payment_status)}`}>
                            {b.payment_status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {b.original_bill_url ? (
                            <a
                              href={b.original_bill_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={b.original_bill_filename ?? "View bill file"}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground/30 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Method</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Bill Ref</th>
                      <th className="text-center px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredPayments.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12">
                        <Banknote className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No payments found</p>
                      </td></tr>
                    ) : filteredPayments.map(p => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-sm text-muted-foreground">{p.payment_date ? format(new Date(p.payment_date), "dd MMM yyyy") : "—"}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-success">{formatCurrency(Number(p.payment_amount ?? p.amount))}</td>
                        <td className="px-4 py-3 text-sm text-foreground capitalize">{p.payment_method || "—"}</td>
                        <td className="px-4 py-3 text-sm font-mono text-primary">{p.bill_id ? (billMap?.[p.bill_id] ?? "—") : "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${statusColor(p.status)}`}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[200px]">{p.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statement Tab */}
        <TabsContent value="statement">
          <VendorStatement vendor={vendor} bills={bills ?? []} payments={payments ?? []} dateRange={dateRange} />
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          {contacts?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No contacts added</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts?.map(c => (
                <Card key={c.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{c.first_name} {c.last_name}</p>
                          {c.designation && <p className="text-xs text-muted-foreground">{c.designation}{c.department ? ` · ${c.department}` : ""}</p>}
                        </div>
                      </div>
                      {c.is_primary && <Badge className="bg-accent/15 text-accent border-accent/20 text-[10px]">Primary</Badge>}
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      {c.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-primary/50" />{c.phone}</div>}
                      {c.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary/50" />{c.email}</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          {addresses?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No addresses added</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses?.map(a => (
                <Card key={a.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{a.address_type}</Badge>
                      </div>
                      {a.is_primary && <Badge className="bg-accent/15 text-accent border-accent/20 text-[10px]">Primary</Badge>}
                    </div>
                    <div className="text-sm text-foreground leading-relaxed">
                      <p>{a.address_line1}</p>
                      {a.address_line2 && <p>{a.address_line2}</p>}
                      <p className="font-medium">{a.city}, {a.state} {a.postal_code}</p>
                      <p className="text-muted-foreground">{a.country}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          {documents?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No documents uploaded</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents?.map(d => (
                <Card key={d.id} className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{d.file_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{d.document_type}</p>
                        {d.file_size && <p className="text-[10px] text-muted-foreground mt-1">{(d.file_size / 1024).toFixed(1)} KB</p>}
                      </div>
                      <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 opacity-50 group-hover:opacity-100 transition-opacity shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EditVendorDialog vendor={vendor} open={editOpen} onOpenChange={setEditOpen} />
      <ImportBillsDialog vendorId={vendor.id} open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
