export const CATEGORY_OPTIONS = [
  "Incident",
  "Maintenance",
  "Project",
  "Procurement",
  "Meeting",
  "Other",
] as const;

export const LOG_STATUS_OPTIONS = ["Done", "In Progress", "Blocked"] as const;

export type LogCategory = (typeof CATEGORY_OPTIONS)[number];
export type LogStatus = (typeof LOG_STATUS_OPTIONS)[number];

export type WorkLog = {
  id: string;
  asset_id: string | null;
  log_date: string;
  title: string;
  category: LogCategory;
  status: LogStatus;
  duration_min: number;
  detail: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

/** A log joined with just enough of its asset to link back to it. */
export type WorkLogWithAsset = WorkLog & {
  asset: { id: string; asset_tag: string } | null;
};

export function categoryBadgeClass(category: string): string {
  switch (category) {
    case "Incident":
      return "border-primary/40 bg-primary/10 text-primary";
    case "Maintenance":
      return "border-muted-foreground/40 bg-muted text-muted-foreground";
    case "Project":
      return "border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400";
    case "Procurement":
      return "border-border text-foreground";
    case "Meeting":
      return "border-primary/40 bg-primary/10 text-primary";
    default:
      return "border-muted-foreground/40 bg-muted text-muted-foreground";
  }
}

/** Status colours mirror asset status roles: Done=In Use green, In Progress=In Stock blue, Blocked=Repair amber. */
export function logStatusBadgeClass(status: string): string {
  switch (status) {
    case "Done":
      return "border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400";
    case "In Progress":
      return "border-sky-600/40 bg-sky-600/10 text-sky-700 dark:text-sky-400";
    default:
      return "border-amber-600/40 bg-amber-600/10 text-amber-700 dark:text-amber-400";
  }
}

export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Resolves the Work Log page's range filter (?range=week/month/custom) into
 * concrete date bounds — shared by the page and the export route so the
 * two never disagree on what "this week" means. */
export function resolveLogDateRange(
  range: string | undefined,
  customFrom: string | undefined,
  customTo: string | undefined,
): { from?: string; to?: string } {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const today = new Date();
  if (range === "week") return { from: iso(startOfWeek(today)), to: iso(today) };
  if (range === "month")
    return { from: iso(startOfMonth(today)), to: iso(today) };
  if (range === "custom")
    return { from: customFrom || undefined, to: customTo || undefined };
  return {};
}

export const LOG_CSV_COLUMNS = [
  "Date",
  "Title",
  "Category",
  "Status",
  "Duration (min)",
  "Related Asset",
  "Detail",
  "Tags",
] as const;

function csvEscape(v: string | number | null): string {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

export function logsToCsv(logs: WorkLogWithAsset[]): string {
  const rows = logs.map((l) =>
    [
      l.log_date,
      l.title,
      l.category,
      l.status,
      l.duration_min,
      l.asset?.asset_tag ?? "",
      l.detail,
      l.tags.join("; "),
    ]
      .map(csvEscape)
      .join(","),
  );
  return [LOG_CSV_COLUMNS.join(","), ...rows].join("\n");
}

export function logsToMarkdown(logs: WorkLogWithAsset[]): string {
  const byDate = new Map<string, WorkLogWithAsset[]>();
  for (const log of logs) {
    const bucket = byDate.get(log.log_date) ?? [];
    bucket.push(log);
    byDate.set(log.log_date, bucket);
  }
  const dates = [...byDate.keys()].sort().reverse();

  const lines = ["# Work Log", ""];
  for (const date of dates) {
    lines.push(`## ${date}`, "");
    for (const l of byDate.get(date)!) {
      const meta = [
        l.category,
        l.status,
        l.duration_min ? `${l.duration_min} min` : null,
        l.asset?.asset_tag ?? null,
      ]
        .filter(Boolean)
        .join(" · ");
      lines.push(`- **${l.title}** _(${meta})_`);
      if (l.detail) lines.push(`  ${l.detail}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
