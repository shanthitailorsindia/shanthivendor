import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch all rows from a Supabase table, paginating past the 1000-row limit.
 */
export async function fetchAllRows(
  table: string,
  select: string = "*",
  options?: {
    order?: { column: string; ascending?: boolean };
    eq?: Record<string, any>;
    neq?: Record<string, any>;
  }
): Promise<any[]> {
  const PAGE_SIZE = 1000;
  const all: any[] = [];
  let from = 0;

  while (true) {
    let query = (supabase as any).from(table).select(select).range(from, from + PAGE_SIZE - 1);

    if (options?.eq) {
      for (const [col, val] of Object.entries(options.eq)) {
        query = query.eq(col, val);
      }
    }
    if (options?.neq) {
      for (const [col, val] of Object.entries(options.neq)) {
        query = query.neq(col, val);
      }
    }
    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}
