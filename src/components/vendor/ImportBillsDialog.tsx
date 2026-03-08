import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  vendorId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

interface BillRow {
  bill_number: string;
  bill_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  payment_status: string;
  tax_amount: number;
  notes: string;
  valid: boolean;
  error?: string;
}

const EXPECTED_HEADERS = "bill_number,bill_date,due_date,total_amount,paid_amount,tax_amount,notes";

export default function ImportBillsDialog({ vendorId, open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BillRow[]>([]);
  const [rawText, setRawText] = useState("");

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) { toast.error("CSV must have a header row + data"); return; }

    // skip header
    const dataLines = lines.slice(1);
    const parsed: BillRow[] = dataLines.map((line) => {
      const parts = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
      const [bill_number, bill_date, due_date, total_str, paid_str, tax_str, ...notesParts] = parts;
      const total_amount = Number(total_str) || 0;
      const paid_amount = Number(paid_str) || 0;
      const tax_amount = Number(tax_str) || 0;
      const notes = notesParts.join(",");

      let valid = true;
      let error = "";
      if (!bill_number) { valid = false; error = "Missing bill number"; }
      else if (!bill_date) { valid = false; error = "Missing bill date"; }
      else if (!due_date) { valid = false; error = "Missing due date"; }
      else if (total_amount <= 0) { valid = false; error = "Invalid total amount"; }

      const payment_status = paid_amount >= total_amount ? "paid" : paid_amount > 0 ? "partial" : "unpaid";

      return { bill_number, bill_date, due_date, total_amount, paid_amount, payment_status, tax_amount, notes, valid, error };
    });
    setRows(parsed);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRawText(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const handlePaste = () => {
    if (rawText.trim()) parseCSV(rawText);
  };

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  const importMut = useMutation({
    mutationFn: async () => {
      const bills = validRows.map((r) => ({
        vendor_id: vendorId,
        bill_number: r.bill_number,
        bill_date: r.bill_date,
        due_date: r.due_date,
        total_amount: r.total_amount,
        subtotal: r.total_amount - r.tax_amount,
        tax_amount: r.tax_amount,
        paid_amount: r.paid_amount,
        payment_status: r.payment_status,
        status: "approved",
        notes: r.notes || null,
      }));

      // batch insert in chunks of 50
      for (let i = 0; i < bills.length; i += 50) {
        const chunk = bills.slice(i, i + 50);
        const { error } = await supabase.from("purchase_bills").insert(chunk);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-bills", vendorId] });
      qc.invalidateQueries({ queryKey: ["vendor-balance", vendorId] });
      toast.success(`${validRows.length} bills imported successfully`);
      setRows([]);
      setRawText("");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Bills from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV or paste data. Expected columns: <code className="text-xs bg-muted px-1 rounded">{EXPECTED_HEADERS}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File upload */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label>CSV File</Label>
              <Input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} />
            </div>
          </div>

          {/* Or paste */}
          <div>
            <Label>Or Paste CSV Data</Label>
            <Textarea
              rows={4}
              placeholder={`${EXPECTED_HEADERS}\nBILL-001,2025-01-15,2025-02-15,50000,25000,4500,First order`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <Button variant="outline" size="sm" className="mt-2" onClick={handlePaste}>
              <FileText className="h-3.5 w-3.5 mr-1" /> Parse Pasted Data
            </Button>
          </div>

          {/* Preview */}
          {rows.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-success" /> {validRows.length} valid
                </Badge>
                {invalidRows.length > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" /> {invalidRows.length} invalid
                  </Badge>
                )}
              </div>

              <div className="border rounded-md overflow-x-auto max-h-60">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-2 py-1.5 text-left">Status</th>
                      <th className="px-2 py-1.5 text-left">Bill #</th>
                      <th className="px-2 py-1.5 text-left">Date</th>
                      <th className="px-2 py-1.5 text-left">Due</th>
                      <th className="px-2 py-1.5 text-right">Total</th>
                      <th className="px-2 py-1.5 text-right">Paid</th>
                      <th className="px-2 py-1.5 text-left">Pay Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map((r, i) => (
                      <tr key={i} className={r.valid ? "" : "bg-destructive/5"}>
                        <td className="px-2 py-1.5">
                          {r.valid ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <span className="text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[100px]">{r.error}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 font-mono">{r.bill_number}</td>
                        <td className="px-2 py-1.5">{r.bill_date}</td>
                        <td className="px-2 py-1.5">{r.due_date}</td>
                        <td className="px-2 py-1.5 text-right font-mono">{r.total_amount.toLocaleString("en-IN")}</td>
                        <td className="px-2 py-1.5 text-right font-mono">{r.paid_amount.toLocaleString("en-IN")}</td>
                        <td className="px-2 py-1.5">{r.payment_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                className="w-full mt-3"
                disabled={validRows.length === 0 || importMut.isPending}
                onClick={() => importMut.mutate()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {importMut.isPending ? "Importing..." : `Import ${validRows.length} Bills`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
