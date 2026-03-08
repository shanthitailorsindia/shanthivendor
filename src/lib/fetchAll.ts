import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch all rows from a Supabase table, paginating past the 1000-row limit.
 * @param table - table name
 * @param select - columns to select (default "*")
 * @param options - optional filters/ordering
 */
export async function fetchAllRows<T = any>(
  table: string,
  select: string = "*",
  options?: {
    filters?: Array<{ column: string; op: string; value: any }>;
    order?: { column: string; ascending?: boolean };
    eq?: Record<string, any>;
    neq?: Record<string, any>;
  }
): Promise<T[]> {
  const PAGE_SIZE = 1000;
  const all: T[] = [];
  let from = 0;

  while (true) {
    let query = supabase.from(table).select(select).range(from, from + PAGE_SIZE - 1);

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
    all.push(...(data as T[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}
