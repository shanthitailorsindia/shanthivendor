import { useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Users, CreditCard, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

// --- CSV Parsing ---
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  for (const line of lines) {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') inQuotes = false;
        else current += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { cells.push(current.trim()); current = ""; }
        else current += ch;
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }
  return rows;
}

function isHeaderRow(row: string[], keywords: string[]): boolean {
  const lower = row.map((c) => c.toLowerCase().replace(/[^a-z_]/g, ""));
  return keywords.some((k) => lower.includes(k));
}

// --- Status Badge ---
function StatusBadge({ status }: { status: string }) {
  if (status === "new") return <Badge className="bg-emerald-600 text-white">New</Badge>;
  if (status === "update") return <Badge className="bg-amber-500 text-white">Update</Badge>;
  if (status === "skip") return <Badge variant="secondary">Skip</Badge>;
  if (status === "error") return <Badge variant="destructive">Error</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

// --- Fuzzy Matching Helpers ---
function normalizeForMatch(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/(pvtltd|pvt|ltd|limited|enterprises|traders|trading|corp|inc|llp|industries|co|company)$/g, "");
}

function fuzzyMatch(
  csvName: string,
  existingVendors: { id: string; company_name: string }[]
): { id: string; matchedName: string; matchType: "exact" | "fuzzy" } | null {
  const normInput = normalizeForMatch(csvName);
  if (!normInput) return null;

  // Exact normalized match
  for (const v of existingVendors) {
    if (normalizeForMatch(v.company_name) === normInput) {
      return { id: v.id, matchedName: v.company_name, matchType: "exact" };
    }
  }

  // Substring / contains match
  for (const v of existingVendors) {
    const normExisting = normalizeForMatch(v.company_name);
    if (normExisting && normInput.length >= 3 && (normExisting.includes(normInput) || normInput.includes(normExisting))) {
      return { id: v.id, matchedName: v.company_name, matchType: "fuzzy" };
    }
  }

  return null;
}

// --- Header Detection ---
function buildHeaderMap(headerRow: string[]): Map<string, number> {
  const m = new Map<string, number>();
  headerRow.forEach((h, i) => {
    const key = h.trim().toLowerCase();
    m.set(key, i);
  });
  return m;
}

function getByHeader(cells: string[], headerMap: Map<string, number>, ...possibleNames: string[]): string {
  for (const name of possibleNames) {
    const idx = headerMap.get(name.toLowerCase());
    if (idx !== undefined && cells[idx] !== undefined) return cells[idx].trim();
  }
  return "";
}

// ============================================================
// VENDORS TAB
// ============================================================
function VendorsImportTab() {
  const queryClient = useQueryClient();
  const [csvText, setCsvText] = useState("");
  const [updateExisting, setUpdateExisting] = useState(false);
  const [importing, setImporting] = useState(false);

  const { data: existingVendors = [] } = useQuery({
    queryKey: ["vendor_profiles_all"],
    queryFn: async () => {
      const { data } = await supabase.from("vendor_profiles").select("id, company_name");
      return data || [];
    },
  });

  const parsedRows = useMemo(() => {
    if (!csvText.trim()) return [];
    const raw = parseCSV(csvText);
    if (raw.length === 0) return [];

    // Detect headers
    const firstRow = raw[0];
    const hasHeaders = firstRow.some((c) => {
      const l = c.toLowerCase().trim();
      return ["company name", "contact name", "display name", "emailid", "gst identification number (gstin)", "opening balance"].includes(l);
    });

    let headerMap: Map<string, number>;
    let dataRows: string[][];

    if (hasHeaders) {
      headerMap = buildHeaderMap(firstRow);
      dataRows = raw.slice(1);
    } else {
      // Fallback to positional
      headerMap = new Map([["company name", 0], ["emailid", 1], ["phone", 2], ["gst identification number (gstin)", 3], ["opening balance", 4]]);
      dataRows = raw;
    }

    return dataRows.map((cells) => {
      const company_name = getByHeader(cells, headerMap, "Company Name", "Contact Name", "Display Name");
      const email = getByHeader(cells, headerMap, "EmailID", "Email");
      const phone = getByHeader(cells, headerMap, "Phone", "MobilePhone", "Mobile");
      const tax_id = getByHeader(cells, headerMap, "GST Identification Number (GSTIN)", "GSTIN", "Tax ID");
      const opening_balance = parseFloat(getByHeader(cells, headerMap, "Opening Balance")) || 0;
      const payment_terms = parseInt(getByHeader(cells, headerMap, "Payment Terms")) || 30;
      const notes = getByHeader(cells, headerMap, "Notes");
      const csvStatus = getByHeader(cells, headerMap, "Status");
      const category = getByHeader(cells, headerMap, "Category", "Department");
      const website = getByHeader(cells, headerMap, "Website");
      const beneficiary_name = getByHeader(cells, headerMap, "Beneficiary Name");
      const bank_account = getByHeader(cells, headerMap, "Vendor Bank Account Number");
      const bank_name = getByHeader(cells, headerMap, "Vendor Bank Name");
      const bank_code = getByHeader(cells, headerMap, "Vendor Bank Code");
      const billing_address = getByHeader(cells, headerMap, "Billing Address");
      const billing_city = getByHeader(cells, headerMap, "Billing City");
      const billing_state = getByHeader(cells, headerMap, "Billing State");
      const billing_code = getByHeader(cells, headerMap, "Billing Code");
      const gst_treatment = getByHeader(cells, headerMap, "GST Treatment");

      const match = company_name ? fuzzyMatch(company_name, existingVendors) : null;
      const hasError = !company_name;
      const status = hasError
        ? "error"
        : match
          ? updateExisting ? "update" : "skip"
          : "new";

      return {
        company_name, email, phone, tax_id, category, website,
        opening_balance, payment_terms, notes, csvStatus, gst_treatment,
        beneficiary_name, bank_account, bank_name, bank_code,
        billing_address, billing_city, billing_state, billing_code,
        existingId: match?.id || null,
        matchedTo: match?.matchedName || null,
        matchType: match?.matchType || null,
        status,
        error: hasError ? "Missing company name" : "",
      };
    });
  }, [csvText, existingVendors, updateExisting]);

  const counts = useMemo(() => {
    const c = { new: 0, update: 0, skip: 0, error: 0 };
    parsedRows.forEach((r) => { c[r.status as keyof typeof c]++; });
    return c;
  }, [parsedRows]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target?.result as string || "");
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const actionable = parsedRows.filter((r) => r.status === "new" || r.status === "update");
    if (!actionable.length) return;
    setImporting(true);
    let inserted = 0, updated = 0, errors = 0;
    try {
      for (let i = 0; i < actionable.length; i += 50) {
        const batch = actionable.slice(i, i + 50);
        for (const row of batch) {
          const payload: any = {
            company_name: row.company_name,
            email: row.email || null,
            phone: row.phone || null,
            tax_id: row.tax_id || null,
            category: row.category || null,
            website: row.website || null,
            opening_balance: row.opening_balance || null,
            payment_terms: row.payment_terms || null,
            notes: row.notes || null,
            status: row.csvStatus?.toLowerCase() === "inactive" ? "inactive" : "active",
          };
          if (row.status === "update" && row.existingId) {
            const { error } = await supabase.from("vendor_profiles").update(payload).eq("id", row.existingId);
            if (error) errors++; else updated++;
          } else {
            const { error } = await supabase.from("vendor_profiles").insert(payload);
            if (error) errors++; else inserted++;
          }
        }
      }
      toast({ title: "Vendors imported", description: `${inserted} new, ${updated} updated, ${errors} errors` });
      queryClient.invalidateQueries({ queryKey: ["vendor_profiles_all"] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <Label htmlFor="vendor-csv" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm">
            <Upload className="h-4 w-4" /> Upload CSV
          </Label>
          <Input id="vendor-csv" type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="vendor-update" checked={updateExisting} onCheckedChange={setUpdateExisting} />
          <Label htmlFor="vendor-update" className="text-sm">Update existing vendors</Label>
        </div>
      </div>

      <Textarea placeholder="Paste Zoho Books Vendors CSV export here, or upload the CSV file above." rows={4} value={csvText} onChange={(e) => setCsvText(e.target.value)} />

      {parsedRows.length > 0 && (
        <>
          <div className="flex gap-3 text-sm">
            <span className="text-emerald-600 font-medium">{counts.new} new</span>
            <span className="text-amber-500 font-medium">{counts.update} update</span>
            <span className="text-muted-foreground">{counts.skip} skip</span>
            <span className="text-destructive font-medium">{counts.error} errors</span>
          </div>
          <div className="border rounded-md overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Matched To</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead>Opening Bal.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedRows.slice(0, 200).map((r, i) => (
                  <TableRow key={i} className={r.status === "error" ? "bg-destructive/10" : ""}>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="font-medium">{r.company_name || <span className="text-destructive italic">Missing</span>}</TableCell>
                    <TableCell>
                      {r.matchedTo ? (
                        <span className="text-xs">
                          {r.matchedTo}
                          {r.matchType === "fuzzy" && <Badge variant="outline" className="ml-1 text-[10px] px-1">fuzzy</Badge>}
                        </span>
                      ) : r.company_name ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-xs">{r.email}</TableCell>
                    <TableCell className="text-xs">{r.phone}</TableCell>
                    <TableCell className="text-xs">{r.tax_id}</TableCell>
                    <TableCell>₹{r.opening_balance.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button onClick={handleImport} disabled={importing || (counts.new + counts.update === 0)}>
            {importing ? <><RefreshCw className="h-4 w-4 animate-spin" /> Importing...</> : <>Import {counts.new + counts.update} Vendors</>}
          </Button>
        </>
      )}
    </div>
  );
}

// ============================================================
// BILLS TAB (Zoho Books format: one row per line item, aggregate by bill_number)
// ============================================================
function BillsImportTab() {
  const queryClient = useQueryClient();
  const [csvText, setCsvText] = useState("");
  const [updateExisting, setUpdateExisting] = useState(false);
  const [importing, setImporting] = useState(false);

  const { data: existingVendors = [] } = useQuery({
    queryKey: ["vendor_profiles_all"],
    queryFn: async () => {
      const all: { id: string; company_name: string }[] = [];
      let from = 0;
      while (true) {
        const { data } = await supabase.from("vendor_profiles").select("id, company_name").range(from, from + 999);
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < 1000) break;
        from += 1000;
      }
      return all;
    },
  });

  const { data: existingBills = [] } = useQuery({
    queryKey: ["purchase_bills_numbers"],
    queryFn: async () => {
      const all: { id: string; bill_number: string }[] = [];
      let from = 0;
      while (true) {
        const { data } = await supabase.from("purchase_bills").select("id, bill_number").range(from, from + 999);
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < 1000) break;
        from += 1000;
      }
      return all;
    },
  });

  const billSet = useMemo(() => new Set(existingBills.map((b) => b.bill_number)), [existingBills]);

  interface AggregatedBill {
    vendor_name: string;
    vendor_id: string | null;
    matchedTo: string | null;
    matchType: "exact" | "fuzzy" | null;
    bill_number: string;
    bill_date: string;
    due_date: string;
    total_amount: number;
    balance: number;
    paid_amount: number;
    tax_amount: number;
    bill_status: string;
    notes: string;
    payment_status: string;
    billExists: boolean;
    rowStatus: string;
    errors: string[];
  }

  const parsedRows = useMemo(() => {
    if (!csvText.trim()) return [] as AggregatedBill[];
    const raw = parseCSV(csvText);
    if (raw.length < 2) return [] as AggregatedBill[];

    // Detect headers
    const firstRow = raw[0];
    const hasHeaders = firstRow.some((c) => {
      const l = c.toLowerCase().trim();
      return ["bill number", "vendor name", "bill date", "total", "balance"].includes(l);
    });

    if (!hasHeaders) return [] as AggregatedBill[];

    const headerMap = buildHeaderMap(firstRow);
    const dataRows = raw.slice(1);

    // Aggregate by bill_number (Zoho exports one row per line item)
    const billAgg = new Map<string, {
      vendor_name: string; bill_number: string; bill_date: string; due_date: string;
      total: number; balance: number; tax_amount: number; bill_status: string; notes: string;
    }>();

    for (const cells of dataRows) {
      const bill_number = getByHeader(cells, headerMap, "Bill Number");
      if (!bill_number) continue;

      if (!billAgg.has(bill_number)) {
        billAgg.set(bill_number, {
          vendor_name: getByHeader(cells, headerMap, "Vendor Name"),
          bill_number,
          bill_date: getByHeader(cells, headerMap, "Bill Date"),
          due_date: getByHeader(cells, headerMap, "Due Date"),
          total: parseFloat(getByHeader(cells, headerMap, "Total")) || 0,
          balance: parseFloat(getByHeader(cells, headerMap, "Balance")) || 0,
          tax_amount: parseFloat(getByHeader(cells, headerMap, "Tax Amount")) || 0,
          bill_status: getByHeader(cells, headerMap, "Bill Status"),
          notes: getByHeader(cells, headerMap, "Notes"),
        });
      } else {
        // For aggregated rows, tax might need summing per item but Total/Balance are bill-level (same across rows)
        // We keep the bill-level values from the first row
      }
    }

    return Array.from(billAgg.values()).map((b): AggregatedBill => {
      const match = b.vendor_name ? fuzzyMatch(b.vendor_name, existingVendors) : null;
      const vendor_id = match?.id || null;
      const paid_amount = b.total - b.balance;
      const billExists = billSet.has(b.bill_number);
      const errors: string[] = [];
      if (!b.vendor_name) errors.push("Missing vendor");
      if (!vendor_id) errors.push("Vendor not found");
      if (!b.bill_number) errors.push("Missing bill number");
      if (!b.bill_date) errors.push("Missing bill date");
      if (!b.total) errors.push("Missing amount");
      const rowStatus = errors.length ? "error" : billExists ? (updateExisting ? "update" : "skip") : "new";
      const payment_status = paid_amount >= b.total && b.total > 0 ? "paid" : paid_amount > 0 ? "partial" : "unpaid";
      return {
        vendor_name: b.vendor_name, vendor_id, matchedTo: match?.matchedName || null, matchType: match?.matchType || null,
        bill_number: b.bill_number, bill_date: b.bill_date, due_date: b.due_date,
        total_amount: b.total, balance: b.balance, paid_amount, tax_amount: b.tax_amount,
        bill_status: b.bill_status, notes: b.notes, payment_status, billExists, rowStatus, errors,
      };
    });
  }, [csvText, existingVendors, billSet, updateExisting]);

  const counts = useMemo(() => {
    const c = { new: 0, update: 0, skip: 0, error: 0 };
    parsedRows.forEach((r) => { c[r.rowStatus as keyof typeof c]++; });
    return c;
  }, [parsedRows]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target?.result as string || "");
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const actionable = parsedRows.filter((r) => r.rowStatus === "new" || r.rowStatus === "update");
    if (!actionable.length) return;
    setImporting(true);
    let inserted = 0, updated = 0, errors = 0;
    try {
      for (const r of actionable) {
        const payload = {
          vendor_id: r.vendor_id!,
          bill_number: r.bill_number,
          bill_date: r.bill_date,
          due_date: r.due_date || r.bill_date,
          total_amount: r.total_amount,
          subtotal: r.total_amount - r.tax_amount,
          tax_amount: r.tax_amount,
          paid_amount: r.paid_amount,
          payment_status: r.payment_status,
          status: r.bill_status?.toLowerCase() === "open" ? "approved" : r.bill_status?.toLowerCase() || "approved",
          notes: r.notes || null,
        };

        if (r.billExists && updateExisting) {
          const existing = existingBills.find((b) => b.bill_number === r.bill_number);
          if (existing) {
            const { error } = await supabase.from("purchase_bills").update(payload).eq("id", existing.id);
            if (error) errors++; else updated++;
          }
        } else if (!r.billExists) {
          const { error } = await supabase.from("purchase_bills").insert(payload);
          if (error) errors++; else inserted++;
        }
      }
      toast({ title: "Bills imported", description: `${inserted} new, ${updated} updated, ${errors} errors` });
      queryClient.invalidateQueries({ queryKey: ["purchase_bills"] });
      queryClient.invalidateQueries({ queryKey: ["purchase_bills_numbers"] });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <Label htmlFor="bill-csv" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm">
            <Upload className="h-4 w-4" /> Upload CSV
          </Label>
          <Input id="bill-csv" type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="bill-update" checked={updateExisting} onCheckedChange={setUpdateExisting} />
          <Label htmlFor="bill-update" className="text-sm">Update existing bills</Label>
        </div>
      </div>

      <Textarea placeholder="Paste Zoho Books Bills CSV export here, or upload the file above. Zoho format auto-detected by headers." rows={4} value={csvText} onChange={(e) => setCsvText(e.target.value)} />

      {parsedRows.length > 0 && (
        <>
          <div className="flex gap-3 text-sm">
            <span className="text-emerald-600 font-medium">{counts.new} new</span>
            <span className="text-amber-500 font-medium">{counts.update} update</span>
            <span className="text-muted-foreground">{counts.skip} skip</span>
            <span className="text-destructive font-medium">{counts.error} errors</span>
          </div>
          <div className="border rounded-md overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Matched To</TableHead>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedRows.slice(0, 200).map((r, i) => (
                  <TableRow key={i} className={r.rowStatus === "error" ? "bg-destructive/10" : ""}>
                    <TableCell><StatusBadge status={r.rowStatus} /></TableCell>
                    <TableCell>{r.vendor_name}</TableCell>
                    <TableCell>
                      {r.matchedTo ? (
                        <span className="text-xs">
                          {r.matchedTo}
                          {r.matchType === "fuzzy" && <Badge variant="outline" className="ml-1 text-[10px] px-1">fuzzy</Badge>}
                        </span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="font-medium">{r.bill_number}</TableCell>
                    <TableCell>{r.bill_date}</TableCell>
                    <TableCell>₹{r.total_amount.toLocaleString()}</TableCell>
                    <TableCell>₹{r.paid_amount.toLocaleString()}</TableCell>
                    <TableCell>₹{r.balance.toLocaleString()}</TableCell>
                    <TableCell>{r.errors.length > 0 && <span className="text-destructive text-xs">{r.errors.join(", ")}</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button onClick={handleImport} disabled={importing || (counts.new + counts.update === 0)}>
            {importing ? <><RefreshCw className="h-4 w-4 animate-spin" /> Importing...</> : <>Import {counts.new + counts.update} Bills</>}
          </Button>
        </>
      )}
    </div>
  );
}

// ============================================================
// PAYMENTS TAB
// ============================================================
function PaymentsImportTab() {
  const queryClient = useQueryClient();
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);

  const { data: existingVendors = [] } = useQuery({
    queryKey: ["vendor_profiles_all"],
    queryFn: async () => {
      const { data } = await supabase.from("vendor_profiles").select("id, company_name");
      return data || [];
    },
  });

  const { data: existingBills = [] } = useQuery({
    queryKey: ["purchase_bills_all_for_payment"],
    queryFn: async () => {
      const { data } = await supabase.from("purchase_bills").select("id, bill_number, vendor_id");
      return data || [];
    },
  });

  const vendorMap = useMemo(() => {
    const m = new Map<string, string>();
    existingVendors.forEach((v) => m.set(v.company_name.toLowerCase().trim(), v.id));
    return m;
  }, [existingVendors]);

  const billMap = useMemo(() => {
    const m = new Map<string, { id: string; vendor_id: string }>();
    existingBills.forEach((b) => m.set(b.bill_number, { id: b.id, vendor_id: b.vendor_id }));
    return m;
  }, [existingBills]);

  const parsedRows = useMemo(() => {
    if (!csvText.trim()) return [];
    const raw = parseCSV(csvText);
    let rows = raw;
    if (rows.length > 0 && isHeaderRow(rows[0], ["vendor_name", "amount", "payment_date"])) {
      rows = rows.slice(1);
    }
    return rows.map((cells) => {
      const vendor_name = cells[0] || "";
      const bill_number = cells[1] || "";
      const amount = parseFloat(cells[2]) || 0;
      const payment_date = cells[3] || new Date().toISOString().split("T")[0];
      const payment_method = cells[4] || "";
      const status = cells[5] || "completed";
      const notes = cells[6] || "";
      const vendor_id = vendorMap.get(vendor_name.toLowerCase().trim());
      const billInfo = bill_number ? billMap.get(bill_number) : null;
      const errors: string[] = [];
      if (!vendor_name) errors.push("Missing vendor");
      if (!vendor_id) errors.push("Vendor not found");
      if (!amount) errors.push("Missing amount");
      if (bill_number && !billInfo) errors.push("Bill not found");
      return { vendor_name, vendor_id, bill_number, bill_id: billInfo?.id || null, amount, payment_date, payment_method, status, notes, rowStatus: errors.length ? "error" as const : "new" as const, errors };
    });
  }, [csvText, vendorMap, billMap]);

  const counts = useMemo(() => {
    const c = { new: 0, error: 0 };
    parsedRows.forEach((r) => { c[r.rowStatus]++; });
    return c;
  }, [parsedRows]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target?.result as string || "");
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const valid = parsedRows.filter((r) => r.rowStatus === "new");
    if (!valid.length) return;
    setImporting(true);
    let inserted = 0, errors = 0;
    try {
      // Insert payments in batches
      for (let i = 0; i < valid.length; i += 50) {
        const batch = valid.slice(i, i + 50);
        const payloads = batch.map((r) => ({
          vendor_id: r.vendor_id!,
          bill_id: r.bill_id,
          amount: r.amount,
          payment_amount: r.amount,
          due_date: r.payment_date,
          payment_date: r.payment_date,
          payment_method: r.payment_method || null,
          status: r.status || "completed",
          notes: r.notes || null,
        }));
        const { error } = await supabase.from("vendor_payments").insert(payloads);
        if (error) errors += batch.length; else inserted += batch.length;
      }

      // Post-import reconciliation: recalculate paid_amount on affected bills
      const affectedBillIds = [...new Set(valid.filter((r) => r.bill_id).map((r) => r.bill_id!))];
      for (const billId of affectedBillIds) {
        const { data: payments } = await supabase.from("vendor_payments").select("payment_amount").eq("bill_id", billId);
        const totalPaid = (payments || []).reduce((s, p) => s + (p.payment_amount || 0), 0);
        const { data: bill } = await supabase.from("purchase_bills").select("total_amount").eq("id", billId).single();
        const paymentStatus = totalPaid >= (bill?.total_amount || 0) ? "paid" : totalPaid > 0 ? "partial" : "unpaid";
        await supabase.from("purchase_bills").update({ paid_amount: totalPaid, payment_status: paymentStatus }).eq("id", billId);
      }

      toast({ title: "Payments imported", description: `${inserted} inserted, ${errors} errors. ${affectedBillIds.length} bills reconciled.` });
      queryClient.invalidateQueries({ queryKey: ["purchase_bills"] });
      queryClient.invalidateQueries({ queryKey: ["vendor_payments"] });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <Label htmlFor="payment-csv" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm">
            <Upload className="h-4 w-4" /> Upload CSV
          </Label>
          <Input id="payment-csv" type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
        </div>
        <p className="text-xs text-muted-foreground">Payments are additive — all valid rows will be inserted.</p>
      </div>

      <Textarea placeholder={`Paste CSV here...\nFormat: vendor_name, bill_number (optional), amount, payment_date, payment_method, status, notes`} rows={6} value={csvText} onChange={(e) => setCsvText(e.target.value)} />

      {parsedRows.length > 0 && (
        <>
          <div className="flex gap-3 text-sm">
            <span className="text-emerald-600 font-medium">{counts.new} valid</span>
            <span className="text-destructive font-medium">{counts.error} errors</span>
          </div>
          <div className="border rounded-md overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedRows.slice(0, 200).map((r, i) => (
                  <TableRow key={i} className={r.rowStatus === "error" ? "bg-destructive/10" : ""}>
                    <TableCell><StatusBadge status={r.rowStatus} /></TableCell>
                    <TableCell>{r.vendor_name}</TableCell>
                    <TableCell>{r.bill_number || "—"}</TableCell>
                    <TableCell>₹{r.amount.toLocaleString()}</TableCell>
                    <TableCell>{r.payment_date}</TableCell>
                    <TableCell>{r.payment_method || "—"}</TableCell>
                    <TableCell>{r.errors.length > 0 && <span className="text-destructive text-xs">{r.errors.join(", ")}</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button onClick={handleImport} disabled={importing || counts.new === 0}>
            {importing ? <><RefreshCw className="h-4 w-4 animate-spin" /> Importing & Reconciling...</> : <>Import {counts.new} Payments</>}
          </Button>
        </>
      )}
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function ZohoImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Zoho Books Import</h1>
        <p className="text-muted-foreground">Import vendors, purchase bills, and payments from Zoho Books CSV exports.</p>
      </div>

      <div className="bg-accent/50 border border-border rounded-lg p-4 text-sm space-y-1">
        <p className="font-medium flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Import Order Matters</p>
        <p className="text-muted-foreground">Import in this order: <strong>1. Vendors</strong> → <strong>2. Bills</strong> → <strong>3. Payments</strong>. Bills need vendor matches, and payments need both vendor and bill matches.</p>
      </div>

      <Tabs defaultValue="vendors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendors" className="gap-2"><Users className="h-4 w-4" /> Vendors</TabsTrigger>
          <TabsTrigger value="bills" className="gap-2"><FileText className="h-4 w-4" /> Bills</TabsTrigger>
          <TabsTrigger value="payments" className="gap-2"><CreditCard className="h-4 w-4" /> Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors"><VendorsImportTab /></TabsContent>
        <TabsContent value="bills"><BillsImportTab /></TabsContent>
        <TabsContent value="payments"><PaymentsImportTab /></TabsContent>
      </Tabs>
    </div>
  );
}
