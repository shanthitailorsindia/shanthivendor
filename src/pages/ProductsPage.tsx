import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Package } from "lucide-react";

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = products?.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.item_code?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <p className="page-subtitle">Product inventory overview</p>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="data-table-container">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Code</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Product</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Cost Price</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Sell Price</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Stock</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">HSN</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">GST %</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
            ) : filtered?.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No products found</td></tr>
            ) : filtered?.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{p.item_code}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{p.name}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-muted-foreground">{formatCurrency(Number(p.cost_price))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-foreground">{formatCurrency(Number(p.unit_price))}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={`font-mono font-medium ${p.quantity_in_stock <= p.reorder_level ? 'text-destructive' : 'text-foreground'}`}>
                    {p.quantity_in_stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.hsn_code}</td>
                <td className="px-4 py-3 text-sm text-right text-muted-foreground">{Number(p.gst_rate)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
