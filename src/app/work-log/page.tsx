import { Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import { formatDate } from "@/lib/assets";
import { resolveLogDateRange } from "@/lib/worklog";
import { getAssetOptions, getWorkLogs } from "@/lib/queries";
import { AddLogDialog } from "./add-log-dialog";
import { LogRow } from "./log-row";
import { WorkLogFilters } from "./work-log-filters";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
}

export default async function WorkLogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const range = readParam(params, "range") ?? "all";
  const { from, to } = resolveLogDateRange(
    range,
    readParam(params, "from"),
    readParam(params, "to"),
  );

  const filters = {
    q: readParam(params, "q"),
    category: readParam(params, "category"),
    status: readParam(params, "status"),
    from,
    to,
  };

  const [logs, assetOptions] = await Promise.all([
    getWorkLogs(filters),
    getAssetOptions(),
  ]);

  const groups: { date: string; logs: typeof logs }[] = [];
  for (const log of logs) {
    const last = groups[groups.length - 1];
    if (last?.date === log.log_date) last.logs.push(log);
    else groups.push({ date: log.log_date, logs: [log] });
  }

  const exportHref = (fmt: "csv" | "md") => {
    const next = new URLSearchParams();
    if (filters.q) next.set("q", filters.q);
    if (filters.category) next.set("category", filters.category);
    if (filters.status) next.set("status", filters.status);
    if (range !== "all") next.set("range", range);
    if (readParam(params, "from")) next.set("from", readParam(params, "from")!);
    if (readParam(params, "to")) next.set("to", readParam(params, "to")!);
    next.set("format", fmt);
    return `/work-log/export?${next}`;
  };

  return (
    <div className="space-y-4 p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Work Log</h1>
          <p className="text-sm text-muted-foreground">
            Daily work log for the IT team
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" nativeButton={false} render={<a href={exportHref("csv")} />}>
            <Download />
            Export CSV
          </Button>
          <Button variant="outline" nativeButton={false} render={<a href={exportHref("md")} />}>
            <FileText />
            Export Markdown
          </Button>
          <AddLogDialog assetOptions={assetOptions} />
        </div>
      </div>

      <WorkLogFilters />

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No logs match the current filters
          </CardContent>
        </Card>
      ) : (
        groups.map((group) => (
          <Card key={group.date} className="overflow-hidden py-0">
            <CardHeader className="flex-row items-center justify-between border-b py-3">
              <span className="font-heading font-semibold">
                {formatDate(group.date)}
              </span>
              <span className="text-xs text-muted-foreground">
                {group.logs.length} {group.logs.length === 1 ? "entry" : "entries"}
              </span>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableBody>
                  {group.logs.map((log) => (
                    <LogRow key={log.id} log={log} assetOptions={assetOptions} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
