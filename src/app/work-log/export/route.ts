import { type NextRequest } from "next/server";

import { getWorkLogs } from "@/lib/queries";
import { logsToCsv, logsToMarkdown, resolveLogDateRange } from "@/lib/worklog";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const { from, to } = resolveLogDateRange(
    params.get("range") ?? undefined,
    params.get("from") ?? undefined,
    params.get("to") ?? undefined,
  );

  const logs = await getWorkLogs({
    q: params.get("q") ?? undefined,
    category: params.get("category") ?? undefined,
    status: params.get("status") ?? undefined,
    from,
    to,
  });

  const format = params.get("format") === "md" ? "md" : "csv";
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "md") {
    return new Response(logsToMarkdown(logs), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="work-log-${stamp}.md"`,
      },
    });
  }

  return new Response(logsToCsv(logs), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="work-log-${stamp}.csv"`,
    },
  });
}
