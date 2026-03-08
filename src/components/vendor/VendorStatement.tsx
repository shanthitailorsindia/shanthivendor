import { useMemo, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Download } from "lucide-react";
import type { DateRange } from "./FYDateFilter";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

interface Bill {
  id: string;
  bill_number: string;
  bill_date: string;
  total_amount: number | string;
  paid_amount: number | string;
}

interface Payment {
  id: string;
  payment_date: string | null;
  payment_amount?: number | string | null;
  amount?: number | string | null;
  payment_method?: string | null;
  notes?: string | null;
  created_at: string;
}

interface Props {
  vendor: { company_name: string; tax_id?: string | null; opening_balance?: number | string | null; opening_balance_date?: string | null };
  bills: Bill[];
  payments: Payment[];
  dateRange: DateRange;
}

interface LedgerEntry {
  date: Date;
  description: string;
  debit: number;   // bill = debit (we owe more)
  credit: number;  // payment = credit (we paid)
  type: "bill" | "payment";
}

export default function VendorStatement({ vendor, bills, payments, dateRange }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const { entries, openingBal, closingBal, totalDebit, totalCredit } = useMemo(() => {
    const allEntries: LedgerEntry[] = [];

    bills.forEach(b => {
      allEntries.push({
        date: new Date(b.bill_date),
        description: `Bill #${b.bill_number}`,
        debit: Number(b.total_amount),
        credit: 0,
        type: "bill",
      });
    });

    payments.forEach(p => {
      const amt = Number(p.payment_amount ?? p.amount ?? 0);
      allEntries.push({
        date: new Date(p.payment_date ?? p.created_at),
        description: `Payment${p.payment_method ? ` (${p.payment_method})` : ""}${p.notes ? ` – ${p.notes}` : ""}`,
        debit: 0,
        credit: amt,
        type: "payment",
      });
    });

    allEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate opening balance from vendor's opening_balance + all transactions BEFORE the filter range
    let openingBal = Number(vendor.opening_balance ?? 0);
    let filtered: LedgerEntry[] = allEntries;

    if (dateRange.from) {
      const before = allEntries.filter(e => e.date < dateRange.from!);
      before.forEach(e => { openingBal += e.debit - e.credit; });
      filtered = allEntries.filter(e => e.date >= dateRange.from!);
    }
    if (dateRange.to) {
      const endOfDay = new Date(dateRange.to);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(e => e.date <= endOfDay);
    }

    const totalDebit = filtered.reduce((s, e) => s + e.debit, 0);
    const totalCredit = filtered.reduce((s, e) => s + e.credit, 0);
    const closingBal = openingBal + totalDebit - totalCredit;

    return { entries: filtered, openingBal, closingBal, totalDebit, totalCredit };
  }, [bills, payments, dateRange, vendor.opening_balance]);

  const handlePrint = () => {
    const content = ref.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Statement - ${vendor.company_name}</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; padding: 24px; color: #1a1a2e; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
        th { background: #f5f5f5; font-weight: 600; font-size: 11px; text-transform: uppercase; }
        .right { text-align: right; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .summary { display: flex; justify-content: space-between; margin-top: 16px; }
        .summary div { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; min-width: 120px; }
        h2 { margin: 0; font-size: 18px; }
        .sub { color: #666; font-size: 12px; }
        @media print { body { padding: 0; } }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const periodLabel = dateRange.from && dateRange.to
    ? `${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`
    : "All Time";

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Vendor Statement</CardTitle>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1" /> Print / PDF
        </Button>
      </CardHeader>
      <CardContent>
        <div ref={ref}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground">{vendor.company_name}</h2>
            {vendor.tax_id && <p className="text-xs text-muted-foreground">GSTIN: {vendor.tax_id}</p>}
            <p className="text-xs text-muted-foreground mt-1">Period: {periodLabel}</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="border rounded-md p-3">
              <p className="text-xs text-muted-foreground">Opening Balance</p>
              <p className="font-bold font-mono text-foreground">{formatCurrency(openingBal)}</p>
            </div>
            <div className="border rounded-md p-3">
              <p className="text-xs text-muted-foreground">Total Bills</p>
              <p className="font-bold font-mono text-foreground">{formatCurrency(totalDebit)}</p>
            </div>
            <div className="border rounded-md p-3">
              <p className="text-xs text-muted-foreground">Total Payments</p>
              <p className="font-bold font-mono text-success">{formatCurrency(totalCredit)}</p>
            </div>
            <div className="border rounded-md p-3">
              <p className="text-xs text-muted-foreground">Closing Balance</p>
              <p className={`font-bold font-mono ${closingBal > 0 ? "text-destructive" : "text-success"}`}>{formatCurrency(closingBal)}</p>
            </div>
          </div>

          {/* Ledger table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Description</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Debit (Bills)</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Credit (Payments)</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* Opening balance row */}
                <tr className="bg-muted/30">
                  <td className="px-3 py-2 text-muted-foreground">—</td>
                  <td className="px-3 py-2 font-medium text-foreground">Opening Balance</td>
                  <td className="px-3 py-2 text-right">—</td>
                  <td className="px-3 py-2 text-right">—</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold text-foreground">{formatCurrency(openingBal)}</td>
                </tr>
                {entries.map((e, i) => {
                  const running = openingBal + entries.slice(0, i + 1).reduce((s, x) => s + x.debit - x.credit, 0);
                  return (
                    <tr key={`${e.type}-${i}`} className="hover:bg-muted/20">
                      <td className="px-3 py-2 text-muted-foreground">{format(e.date, "dd MMM yyyy")}</td>
                      <td className="px-3 py-2 text-foreground">{e.description}</td>
                      <td className="px-3 py-2 text-right font-mono">{e.debit > 0 ? formatCurrency(e.debit) : "—"}</td>
                      <td className="px-3 py-2 text-right font-mono text-success">{e.credit > 0 ? formatCurrency(e.credit) : "—"}</td>
                      <td className={`px-3 py-2 text-right font-mono font-semibold ${running > 0 ? "text-destructive" : "text-success"}`}>{formatCurrency(running)}</td>
                    </tr>
                  );
                })}
                {/* Closing balance row */}
                <tr className="bg-muted/30 font-semibold">
                  <td className="px-3 py-2">—</td>
                  <td className="px-3 py-2 text-foreground">Closing Balance</td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">{formatCurrency(totalDebit)}</td>
                  <td className="px-3 py-2 text-right font-mono text-success">{formatCurrency(totalCredit)}</td>
                  <td className={`px-3 py-2 text-right font-mono ${closingBal > 0 ? "text-destructive" : "text-success"}`}>{formatCurrency(closingBal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {entries.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No transactions in the selected period</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
