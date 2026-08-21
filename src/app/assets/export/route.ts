import { type NextRequest } from "next/server";

import { toCsv } from "@/lib/assets";
import { getAssets } from "@/lib/queries";

/**
 * Exports every row matching the current filters, not just the visible page —
 * the pagination range is deliberately omitted here.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const { assets } = await getAssets({
    q: params.get("q") ?? undefined,
    type: params.get("type") ?? undefined,
    status: params.get("status") ?? undefined,
    location: params.get("location") ?? undefined,
  });

  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(toCsv(assets), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="assets-${stamp}.csv"`,
    },
  });
}
