import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllRows } from "@/lib/fetchAll";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, FileText, Download, Printer, IndianRupee,
  Calendar, Building2, Package, TrendingUp, AlertTriangle,
  ChevronDown, Filter,
} from "lucide-react";
import { format, parseISO } from "date-fns";

/* ── Indian FY helpers ── */
const fyStartYear = (d: Date) => (d.getMonth() < 3 ? d.getFullYear() - 1 : d.getFullYear());
const currentFYStart = () => {
  const y = fyStartYear(new Date());
  return new Date(y, 3, 1);
};
const currentFYEnd = () => {
  const y = fyStartYear(new Date());
  return new Date(y + 1, 2, 31);
};

const MONTHS = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March",
];

const monthIndex = (m: string) => {
  const map: Record<string, number> = {
    April: 3, May: 4, June: 5, July: 6, August: 7, September: 8,
    October: 9, November: 10, December: 11, January: 0, February: 1, March: 2,
  };
  return map[m] ?? 0;
};

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

function getFYOptions() {
  const now = new Date();
  const cur = fyStartYear(now);
  return Array.from({ length: 5 }, (_, i) => {
    const y = cur - i;
    return { label: `FY ${String(y).slice(2)}-${String(y + 1).slice(2)}`, value: String(y) };
  });
}

/* ── Types ── */
interface BillItem {
  bill_id: string;
  description: string;
  item_code: string | null;
  product_id: string;
  quantity: number;
  tax_amount: number;
  tax_rate: number;
  total_amount: number;
  unit_price: number;
}

interface Bill {
  id: string;
  bill_number: string;
  bill_date: string;
  vendor_id: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  is_gst_inclusive: boolean | null;
  status: string;
}

export default function GSTReportsPage() {
  const fyOptions = getFYOptions();
  const [selectedFY, setSelectedFY] = useState(fyOptions[0].value);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const fyStart = new Date(Number(selectedFY), 3, 1);
  const fyEnd = new Date(Number(selectedFY) + 1, 2, 31);

  /* ── Data fetching ── */
  const { data: bills = [] } = useQuery<Bill[]>({
    queryKey: ["gst-bills"],
    queryFn: () => fetchAllRows("purchase_bills", "*", { order: { column: "bill_date", ascending: true } }),
  });

  const { data: billItems = [] } = useQuery<BillItem[]>({
    queryKey: ["gst-bill-items"],
    queryFn: () => fetchAllRows("purchase_bill_items", "*"),
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["gst-vendors"],
    queryFn: () => fetchAllRows("vendor_profiles", "id, company_name, tax_id, registration_number"),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["gst-products"],
    queryFn: () => fetchAllRows("products", "id, name, item_code, hsn_code, gst_rate, category"),
  });

  const vendorMap = useMemo(() => {
    const m: Record<string, any> = {};
    vendors.forEach((v: any) => { m[v.id] = v; });
    return m;
  }, [vendors]);

  const productMap = useMemo(() => {
    const m: Record<string, any> = {};
    products.forEach((p: any) => { m[p.id] = p; });
    return m;
  }, [products]);

  /* ── Filtered bills for selected FY + month ── */
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const d = parseISO(b.bill_date);
      if (d < fyStart || d > fyEnd) return false;
      if (selectedMonth !== "all") {
        const mi = monthIndex(selectedMonth);
        if (d.getMonth() !== mi) return false;
      }
      return true;
    });
  }, [bills, fyStart, fyEnd, selectedMonth]);

  const filteredItemsMap = useMemo(() => {
    const billIds = new Set(filteredBills.map((b) => b.id));
    return billItems.filter((i) => billIds.has(i.bill_id));
  }, [filteredBills, billItems]);

  /* ── Summary totals ── */
  const totals = useMemo(() => {
    let taxable = 0, cgst = 0, sgst = 0, igst = 0, totalTax = 0, totalValue = 0;
    filteredBills.forEach((b) => {
      const sub = b.subtotal || 0;
      const tax = b.tax_amount || 0;
      taxable += sub;
      // Assuming intra-state (CGST+SGST split)
      cgst += tax / 2;
      sgst += tax / 2;
      totalTax += tax;
      totalValue += b.total_amount || 0;
    });
    return { taxable, cgst, sgst, igst, totalTax, totalValue, invoiceCount: filteredBills.length };
  }, [filteredBills]);

  /* ── GSTR-2 Purchase Register ── */
  const gstr2Data = useMemo(() => {
    return filteredBills.map((b) => {
      const vendor = vendorMap[b.vendor_id];
      const tax = b.tax_amount || 0;
      return {
        billNo: b.bill_number,
        date: b.bill_date,
        vendor: vendor?.company_name || "Unknown",
        gstin: vendor?.tax_id || "-",
        taxable: b.subtotal || 0,
        cgst: tax / 2,
        sgst: tax / 2,
        igst: 0,
        total: b.total_amount || 0,
      };
    });
  }, [filteredBills, vendorMap]);

  /* ── Monthly Summary (GSTR-3B style) ── */
  const monthlySummary = useMemo(() => {
    const map: Record<string, { month: string; year: number; taxable: number; cgst: number; sgst: number; igst: number; total: number; count: number }> = {};
    MONTHS.forEach((m) => {
      const mi = monthIndex(m);
      const year = mi >= 3 ? Number(selectedFY) : Number(selectedFY) + 1;
      map[m] = { month: m, year, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0, count: 0 };
    });
    filteredBills.forEach((b) => {
      const d = parseISO(b.bill_date);
      const mName = MONTHS.find((m) => monthIndex(m) === d.getMonth());
      if (mName && map[mName]) {
        const tax = b.tax_amount || 0;
        map[mName].taxable += b.subtotal || 0;
        map[mName].cgst += tax / 2;
        map[mName].sgst += tax / 2;
        map[mName].total += b.total_amount || 0;
        map[mName].count += 1;
      }
    });
    return MONTHS.map((m) => map[m]);
  }, [filteredBills, selectedFY]);

  /* ── HSN Summary ── */
  const hsnSummary = useMemo(() => {
    const map: Record<string, { hsn: string; description: string; gstRate: number; quantity: number; taxable: number; cgst: number; sgst: number; igst: number; total: number }> = {};
    filteredItemsMap.forEach((item) => {
      const prod = productMap[item.product_id];
      const hsn = prod?.hsn_code || "N/A";
      const key = `${hsn}_${item.tax_rate}`;
      if (!map[key]) {
        map[key] = { hsn, description: prod?.name || item.description, gstRate: item.tax_rate, quantity: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
      }
      const taxable = item.quantity * item.unit_price;
      const tax = item.tax_amount;
      map[key].quantity += item.quantity;
      map[key].taxable += taxable;
      map[key].cgst += tax / 2;
      map[key].sgst += tax / 2;
      map[key].total += item.total_amount;
    });
    return Object.values(map).sort((a, b) => a.hsn.localeCompare(b.hsn));
  }, [filteredItemsMap, productMap]);

  /* ── Vendor-wise (GSTIN-wise) Summary ── */
  const vendorSummary = useMemo(() => {
    const map: Record<string, { vendor: string; gstin: string; invoices: number; taxable: number; cgst: number; sgst: number; igst: number; total: number }> = {};
    filteredBills.forEach((b) => {
      const v = vendorMap[b.vendor_id];
      const key = b.vendor_id;
      if (!map[key]) {
        map[key] = { vendor: v?.company_name || "Unknown", gstin: v?.tax_id || "-", invoices: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
      }
      const tax = b.tax_amount || 0;
      map[key].invoices += 1;
      map[key].taxable += b.subtotal || 0;
      map[key].cgst += tax / 2;
      map[key].sgst += tax / 2;
      map[key].total += b.total_amount || 0;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredBills, vendorMap]);

  /* ── Tax Rate Summary ── */
  const taxRateSummary = useMemo(() => {
    const map: Record<number, { rate: number; taxable: number; cgst: number; sgst: number; igst: number; total: number; items: number }> = {};
    filteredItemsMap.forEach((item) => {
      const rate = item.tax_rate || 0;
      if (!map[rate]) {
        map[rate] = { rate, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0, items: 0 };
      }
      const taxable = item.quantity * item.unit_price;
      const tax = item.tax_amount;
      map[rate].taxable += taxable;
      map[rate].cgst += tax / 2;
      map[rate].sgst += tax / 2;
      map[rate].total += item.total_amount;
      map[rate].items += 1;
    });
    return Object.values(map).sort((a, b) => a.rate - b.rate);
  }, [filteredItemsMap]);

  /* ── ITC (Input Tax Credit) Summary ── */
  const itcSummary = useMemo(() => {
    // Eligible ITC = total tax from registered vendors
    let eligibleCGST = 0, eligibleSGST = 0, eligibleIGST = 0;
    let ineligibleCGST = 0, ineligibleSGST = 0, ineligibleIGST = 0;

    filteredBills.forEach((b) => {
      const v = vendorMap[b.vendor_id];
      const tax = b.tax_amount || 0;
      const hasGSTIN = v?.tax_id && v.tax_id.length >= 15;
      if (hasGSTIN) {
        eligibleCGST += tax / 2;
        eligibleSGST += tax / 2;
      } else {
        ineligibleCGST += tax / 2;
        ineligibleSGST += tax / 2;
      }
    });

    return {
      eligible: { cgst: eligibleCGST, sgst: eligibleSGST, igst: eligibleIGST, total: eligibleCGST + eligibleSGST + eligibleIGST },
      ineligible: { cgst: ineligibleCGST, sgst: ineligibleSGST, igst: ineligibleIGST, total: ineligibleCGST + ineligibleSGST + ineligibleIGST },
    };
  }, [filteredBills, vendorMap]);

  /* ── Missing GSTIN vendors ── */
  const missingGSTINVendors = useMemo(() => {
    const ids = new Set(filteredBills.map((b) => b.vendor_id));
    return Array.from(ids)
      .map((id) => vendorMap[id])
      .filter((v) => v && (!v.tax_id || v.tax_id.length < 15));
  }, [filteredBills, vendorMap]);

  const handlePrint = () => window.print();

  const handleExportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(","), ...data.map((r) => headers.map((h) => `"${r[h] ?? ""}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            GST Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete GST filing reports for purchase bills (Indian FY: April–March)
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={selectedFY} onValueChange={setSelectedFY}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fyOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="All months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-xs">
              {totals.invoiceCount} invoices
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <SummaryCard icon={FileText} label="Invoices" value={String(totals.invoiceCount)} color="primary" />
        <SummaryCard icon={IndianRupee} label="Taxable Value" value={`₹${fmt(totals.taxable)}`} color="info" />
        <SummaryCard icon={TrendingUp} label="CGST" value={`₹${fmt(totals.cgst)}`} color="warning" />
        <SummaryCard icon={TrendingUp} label="SGST" value={`₹${fmt(totals.sgst)}`} color="warning" />
        <SummaryCard icon={IndianRupee} label="Total Tax" value={`₹${fmt(totals.totalTax)}`} color="destructive" />
        <SummaryCard icon={IndianRupee} label="Total Value" value={`₹${fmt(totals.totalValue)}`} color="success" />
      </div>

      {/* ITC Alert */}
      {missingGSTINVendors.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {missingGSTINVendors.length} vendor(s) missing GSTIN — ITC cannot be claimed
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {missingGSTINVendors.map((v: any) => v.company_name).join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="gstr2" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="gstr2" className="text-xs gap-1"><FileText className="h-3 w-3" /> GSTR-2 Register</TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs gap-1"><Calendar className="h-3 w-3" /> Monthly Summary</TabsTrigger>
          <TabsTrigger value="hsn" className="text-xs gap-1"><Package className="h-3 w-3" /> HSN Summary</TabsTrigger>
          <TabsTrigger value="vendor" className="text-xs gap-1"><Building2 className="h-3 w-3" /> Vendor-wise</TabsTrigger>
          <TabsTrigger value="taxrate" className="text-xs gap-1"><TrendingUp className="h-3 w-3" /> Tax Rate</TabsTrigger>
          <TabsTrigger value="itc" className="text-xs gap-1"><IndianRupee className="h-3 w-3" /> ITC Summary</TabsTrigger>
        </TabsList>

        {/* GSTR-2 Purchase Register */}
        <TabsContent value="gstr2">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">GSTR-2 Purchase Register</CardTitle>
              <Button variant="outline" size="sm" className="print:hidden" onClick={() => handleExportCSV(gstr2Data, `GSTR2_FY${selectedFY}`)}>
                <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Bill No</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Vendor</TableHead>
                      <TableHead className="text-xs">GSTIN</TableHead>
                      <TableHead className="text-xs text-right">Taxable ₹</TableHead>
                      <TableHead className="text-xs text-right">CGST ₹</TableHead>
                      <TableHead className="text-xs text-right">SGST ₹</TableHead>
                      <TableHead className="text-xs text-right">IGST ₹</TableHead>
                      <TableHead className="text-xs text-right">Total ₹</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gstr2Data.length === 0 ? (
                      <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No data for selected period</TableCell></TableRow>
                    ) : gstr2Data.map((r, i) => (
                      <TableRow key={i} className={!r.gstin || r.gstin === "-" ? "bg-warning/5" : ""}>
                        <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="text-xs font-mono font-medium">{r.billNo}</TableCell>
                        <TableCell className="text-xs">{format(parseISO(r.date), "dd-MMM-yy")}</TableCell>
                        <TableCell className="text-xs font-medium">{r.vendor}</TableCell>
                        <TableCell className="text-xs font-mono">
                          {r.gstin === "-" ? <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">Missing</Badge> : r.gstin}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">{fmt(r.taxable)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{fmt(r.cgst)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{fmt(r.sgst)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{fmt(r.igst)}</TableCell>
                        <TableCell className="text-xs text-right font-mono font-semibold">{fmt(r.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {gstr2Data.length > 0 && (
                    <TableFooter>
                      <TableRow className="bg-primary/5 font-semibold">
                        <TableCell colSpan={5} className="text-xs">Total</TableCell>
                        <TableCell className="text-xs text-right font-mono">{fmt(totals.taxable)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{fmt(totals.cgst)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{fmt(totals.sgst)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{fmt(totals.igst)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{fmt(totals.totalValue)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Summary (GSTR-3B) */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Monthly Summary (GSTR-3B Format)</CardTitle>
              <Button variant="outline" size="sm" className="print:hidden" onClick={() => handleExportCSV(monthlySummary, `Monthly_FY${selectedFY}`)}>
                <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">Month</TableHead>
                    <TableHead className="text-xs text-right">Invoices</TableHead>
                    <TableHead className="text-xs text-right">Taxable ₹</TableHead>
                    <TableHead className="text-xs text-right">CGST ₹</TableHead>
                    <TableHead className="text-xs text-right">SGST ₹</TableHead>
                    <TableHead className="text-xs text-right">IGST ₹</TableHead>
                    <TableHead className="text-xs text-right">Total ₹</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySummary.map((r) => (
                    <TableRow key={r.month} className={r.count === 0 ? "opacity-40" : ""}>
                      <TableCell className="text-xs font-medium">{r.month} {r.year}</TableCell>
                      <TableCell className="text-xs text-right">{r.count}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.taxable)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.cgst)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.sgst)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.igst)}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-semibold">{fmt(r.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-primary/5 font-semibold">
                    <TableCell className="text-xs">FY Total</TableCell>
                    <TableCell className="text-xs text-right">{totals.invoiceCount}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{fmt(totals.taxable)}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{fmt(totals.cgst)}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{fmt(totals.sgst)}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{fmt(totals.igst)}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{fmt(totals.totalValue)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HSN Summary */}
        <TabsContent value="hsn">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">HSN-wise Summary</CardTitle>
              <Button variant="outline" size="sm" className="print:hidden" onClick={() => handleExportCSV(hsnSummary, `HSN_FY${selectedFY}`)}>
                <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">HSN Code</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs text-right">GST %</TableHead>
                    <TableHead className="text-xs text-right">Qty</TableHead>
                    <TableHead className="text-xs text-right">Taxable ₹</TableHead>
                    <TableHead className="text-xs text-right">CGST ₹</TableHead>
                    <TableHead className="text-xs text-right">SGST ₹</TableHead>
                    <TableHead className="text-xs text-right">Total ₹</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hsnSummary.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow>
                  ) : hsnSummary.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-mono font-medium">
                        {r.hsn === "N/A" ? <Badge variant="outline" className="text-[10px] text-warning border-warning/30">N/A</Badge> : r.hsn}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{r.description}</TableCell>
                      <TableCell className="text-xs text-right">{r.gstRate}%</TableCell>
                      <TableCell className="text-xs text-right">{r.quantity}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.taxable)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.cgst)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.sgst)}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-semibold">{fmt(r.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {hsnSummary.length > 0 && (
                  <TableFooter>
                    <TableRow className="bg-primary/5 font-semibold">
                      <TableCell colSpan={4} className="text-xs">Total</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(hsnSummary.reduce((s, r) => s + r.taxable, 0))}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(hsnSummary.reduce((s, r) => s + r.cgst, 0))}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(hsnSummary.reduce((s, r) => s + r.sgst, 0))}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(hsnSummary.reduce((s, r) => s + r.total, 0))}</TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor-wise Summary */}
        <TabsContent value="vendor">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Vendor-wise (GSTIN) Summary</CardTitle>
              <Button variant="outline" size="sm" className="print:hidden" onClick={() => handleExportCSV(vendorSummary, `Vendor_GST_FY${selectedFY}`)}>
                <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">Vendor</TableHead>
                    <TableHead className="text-xs">GSTIN</TableHead>
                    <TableHead className="text-xs text-right">Invoices</TableHead>
                    <TableHead className="text-xs text-right">Taxable ₹</TableHead>
                    <TableHead className="text-xs text-right">CGST ₹</TableHead>
                    <TableHead className="text-xs text-right">SGST ₹</TableHead>
                    <TableHead className="text-xs text-right">Total ₹</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorSummary.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow>
                  ) : vendorSummary.map((r, i) => (
                    <TableRow key={i} className={r.gstin === "-" ? "bg-warning/5" : ""}>
                      <TableCell className="text-xs font-medium">{r.vendor}</TableCell>
                      <TableCell className="text-xs font-mono">
                        {r.gstin === "-" ? <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">Missing</Badge> : r.gstin}
                      </TableCell>
                      <TableCell className="text-xs text-right">{r.invoices}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.taxable)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.cgst)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.sgst)}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-semibold">{fmt(r.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {vendorSummary.length > 0 && (
                  <TableFooter>
                    <TableRow className="bg-primary/5 font-semibold">
                      <TableCell colSpan={2} className="text-xs">Total</TableCell>
                      <TableCell className="text-xs text-right">{vendorSummary.reduce((s, r) => s + r.invoices, 0)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(vendorSummary.reduce((s, r) => s + r.taxable, 0))}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(vendorSummary.reduce((s, r) => s + r.cgst, 0))}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(vendorSummary.reduce((s, r) => s + r.sgst, 0))}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(vendorSummary.reduce((s, r) => s + r.total, 0))}</TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Rate Summary */}
        <TabsContent value="taxrate">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Tax Rate-wise Breakup</CardTitle>
              <Button variant="outline" size="sm" className="print:hidden" onClick={() => handleExportCSV(taxRateSummary, `TaxRate_FY${selectedFY}`)}>
                <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">GST Rate</TableHead>
                    <TableHead className="text-xs text-right">Line Items</TableHead>
                    <TableHead className="text-xs text-right">Taxable ₹</TableHead>
                    <TableHead className="text-xs text-right">CGST ₹</TableHead>
                    <TableHead className="text-xs text-right">SGST ₹</TableHead>
                    <TableHead className="text-xs text-right">IGST ₹</TableHead>
                    <TableHead className="text-xs text-right">Total ₹</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxRateSummary.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow>
                  ) : taxRateSummary.map((r) => (
                    <TableRow key={r.rate}>
                      <TableCell className="text-xs">
                        <Badge variant="secondary" className="font-mono">{r.rate}%</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right">{r.items}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.taxable)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.cgst)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.sgst)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(r.igst)}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-semibold">{fmt(r.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {taxRateSummary.length > 0 && (
                  <TableFooter>
                    <TableRow className="bg-primary/5 font-semibold">
                      <TableCell className="text-xs">Total</TableCell>
                      <TableCell className="text-xs text-right">{taxRateSummary.reduce((s, r) => s + r.items, 0)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(taxRateSummary.reduce((s, r) => s + r.taxable, 0))}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(taxRateSummary.reduce((s, r) => s + r.cgst, 0))}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(taxRateSummary.reduce((s, r) => s + r.sgst, 0))}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(taxRateSummary.reduce((s, r) => s + r.igst, 0))}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(taxRateSummary.reduce((s, r) => s + r.total, 0))}</TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ITC Summary */}
        <TabsContent value="itc">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-l-4 border-l-success">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-success">Eligible ITC (Registered Vendors)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <ITCRow label="CGST" value={itcSummary.eligible.cgst} />
                  <ITCRow label="SGST" value={itcSummary.eligible.sgst} />
                  <ITCRow label="IGST" value={itcSummary.eligible.igst} />
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span className="text-sm">Total Eligible ITC</span>
                    <span className="font-mono text-success">₹{fmt(itcSummary.eligible.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-destructive">Ineligible ITC (Unregistered Vendors)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <ITCRow label="CGST" value={itcSummary.ineligible.cgst} />
                  <ITCRow label="SGST" value={itcSummary.ineligible.sgst} />
                  <ITCRow label="IGST" value={itcSummary.ineligible.igst} />
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span className="text-sm">Total Ineligible</span>
                    <span className="font-mono text-destructive">₹{fmt(itcSummary.ineligible.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Net ITC */}
            <Card className="md:col-span-2 border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Claimable ITC for this period</p>
                    <p className="text-3xl font-bold font-mono text-primary mt-1">₹{fmt(itcSummary.eligible.total)}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Total Tax Paid: <span className="font-mono font-medium text-foreground">₹{fmt(totals.totalTax)}</span></p>
                    <p>Lost to Ineligible: <span className="font-mono font-medium text-destructive">₹{fmt(itcSummary.ineligible.total)}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── Helper Components ── */
function SummaryCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: "border-l-primary text-primary",
    info: "border-l-info text-info",
    warning: "border-l-warning text-warning",
    destructive: "border-l-destructive text-destructive",
    success: "border-l-success text-success",
  };
  return (
    <Card className={`border-l-4 ${colorMap[color]?.split(" ")[0] || "border-l-primary"}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className={`h-3.5 w-3.5 ${colorMap[color]?.split(" ")[1] || "text-primary"}`} />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-sm font-bold font-mono">{value}</p>
      </CardContent>
    </Card>
  );
}

function ITCRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">₹{fmt(value)}</span>
    </div>
  );
}
