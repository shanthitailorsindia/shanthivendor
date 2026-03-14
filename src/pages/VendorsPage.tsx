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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Plus, Search, Phone, Mail, Calendar, StickyNote, Globe,
  Building2, IndianRupee, ArrowRight, Users, LayoutGrid, List
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["vendor-profiles"],
    queryFn: async () => {
      return await fetchAllRows("vendor_profiles", "*", { order: { column: "created_at", ascending: false } });
    },
  });

  // Fetch balance summary for all vendors
  const { data: allBalances } = useQuery({
    queryKey: ["all-vendor-balances"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendor_balance_summary")
        .select("id, current_balance, opening_balance");
      return data ?? [];
    },
  });

  // Fetch all bills for total purchase aggregation
  const { data: allBills } = useQuery({
    queryKey: ["all-bills-summary"],
    queryFn: () => fetchAllRows("purchase_bills", "vendor_id, total_amount"),
  });

  // Fetch all payments for total payment aggregation
  const { data: allPayments } = useQuery({
    queryKey: ["all-payments-summary"],
    queryFn: () => fetchAllRows("vendor_payments", "vendor_id, amount"),
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

  // Build lookup maps for financial data
  const balanceMap = useMemo(() => {
    const map: Record<string, { current_balance: number; opening_balance: number }> = {};
    allBalances?.forEach(b => {
      if (b.id) map[b.id] = {
        current_balance: Number(b.current_balance ?? 0),
        opening_balance: Number(b.opening_balance ?? 0),
      };
    });
    return map;
  }, [allBalances]);

  const purchaseMap = useMemo(() => {
    const map: Record<string, number> = {};
    allBills?.forEach(b => {
      if (b.vendor_id) map[b.vendor_id] = (map[b.vendor_id] || 0) + Number(b.total_amount ?? 0);
    });
    return map;
  }, [allBills]);

  const paymentMap = useMemo(() => {
    const map: Record<string, number> = {};
    allPayments?.forEach(p => {
      if (p.vendor_id) map[p.vendor_id] = (map[p.vendor_id] || 0) + Number(p.amount ?? 0);
    });
    return map;
  }, [allPayments]);

  const filtered = vendors?.filter(v => {
    const matchesSearch =
      v.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase()) ||
      v.phone?.toLowerCase().includes(search.toLowerCase()) ||
      v.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const activeCount = vendors?.filter(v => v.status === "active").length ?? 0;
  const inactiveCount = vendors?.filter(v => v.status !== "active").length ?? 0;
  const totalOpening = vendors?.reduce((s, v) => s + (Number(v.opening_balance) || 0), 0) ?? 0;

  // Total balance to all vendors (sum of current balances)
  const totalBalance = allBalances?.reduce((s, b) => s + Number(b.current_balance ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-accent/20 backdrop-blur-sm flex items-center justify-center">
                <Building2 className="h-5 w-5 text-accent" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">Vendor Directory</h1>
            </div>
            <p className="text-primary-foreground/70 text-sm">
              Manage your vendor relationships · {vendors?.length ?? 0} total vendors
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg w-fit">
                <Plus className="h-4 w-4 mr-2" />Add Vendor
              </Button>
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

        {/* Summary Stats */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Active Vendors", value: activeCount, icon: Users },
            { label: "Inactive", value: inactiveCount, icon: Building2 },
            { label: "Total Balance to Vendors", value: formatCurrency(totalBalance), icon: IndianRupee },
            { label: "Total Opening Bal.", value: formatCurrency(totalOpening), icon: IndianRupee },
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

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "active", "inactive", "blocked"].map(s => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="capitalize text-xs"
            >
              {s === "all" ? "All" : s}
            </Button>
          ))}
        </div>
        {/* View mode toggle */}
        <div className="flex gap-1 border rounded-lg p-1 bg-card self-start">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-7 w-7 p-0"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-7 w-7 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Vendor Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-card rounded-xl border p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-2/3 mb-3" />
              <div className="h-3 bg-muted rounded w-1/3 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered?.map((v) => (
            <div
              key={v.id}
              onClick={() => navigate(`/vendors/${v.id}`)}
              className="group bg-card rounded-xl border border-border/60 hover:border-primary/30 p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {v.company_name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {v.company_name}
                    </h3>
                    {v.category && (
                      <span className="text-xs text-muted-foreground">{v.category}</span>
                    )}
                  </div>
                </div>
                <Badge
                  variant={v.status === "active" ? "default" : "secondary"}
                  className={`text-[10px] uppercase tracking-wider shrink-0 ${
                    v.status === "active"
                      ? "bg-success/15 text-success border-success/20 hover:bg-success/15"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {v.status}
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-sm mb-4">
                {v.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary/50" />
                    <span className="truncate">{v.phone}</span>
                  </div>
                )}
                {v.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 text-primary/50" />
                    <span className="truncate">{v.email}</span>
                  </div>
                )}
                {v.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-3.5 w-3.5 text-primary/50" />
                    <span className="truncate">{v.website}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {v.notes && (
                <div className="flex items-start gap-2 text-muted-foreground mb-4 bg-muted/30 rounded-lg p-2.5">
                  <StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
                  <span className="text-xs line-clamp-2">{v.notes}</span>
                </div>
              )}

              {/* Financial Info */}
              <div className="border-t border-border/50 pt-3 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">Terms</span>
                  <span className="text-sm font-semibold text-foreground">{v.payment_terms} days</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">Balance</span>
                  <span className="text-sm font-semibold font-mono text-foreground">
                    {formatCurrency(balanceMap[v.id]?.current_balance ?? 0)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(v.created_at), "dd MMM yyyy")}
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
          {filtered?.length === 0 && (
            <div className="col-span-full text-center py-16">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No vendors found</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vendor</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Opening Balance</TableHead>
                <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total Purchase</TableHead>
                <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total Payment</TableHead>
                <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Current Balance</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Building2 className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No vendors found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((v) => {
                  const bal = balanceMap[v.id];
                  const totalPurchase = purchaseMap[v.id] ?? 0;
                  const totalPayment = paymentMap[v.id] ?? 0;
                  const currentBalance = bal?.current_balance ?? 0;
                  const openingBalance = bal?.opening_balance ?? Number(v.opening_balance) ?? 0;
                  return (
                    <TableRow
                      key={v.id}
                      onClick={() => navigate(`/vendors/${v.id}`)}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {v.company_name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{v.company_name}</p>
                            {v.phone && <p className="text-xs text-muted-foreground">{v.phone}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{v.category || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={v.status === "active" ? "default" : "secondary"}
                          className={`text-[10px] uppercase tracking-wider ${
                            v.status === "active"
                              ? "bg-success/15 text-success border-success/20 hover:bg-success/15"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {v.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {formatCurrency(openingBalance)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-foreground">
                        {formatCurrency(totalPurchase)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-success">
                        {formatCurrency(totalPayment)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-foreground">
                        {formatCurrency(currentBalance)}
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
