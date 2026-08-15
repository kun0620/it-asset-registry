export const ASSET_STATUSES = [
  "In Use",
  "In Stock",
  "Repair",
  "Disposed",
] as const;

export type AssetStatus = (typeof ASSET_STATUSES)[number];

/**
 * Types and locations are configured in Settings (`app_settings` table) as
 * of Phase 2 — these are only the seed values that migration inserts, kept
 * here as a last-resort fallback if that row is ever missing.
 */
export const FALLBACK_ASSET_TYPES = [
  "Laptop",
  "Desktop",
  "Monitor",
  "Printer",
  "Switch",
  "Router",
  "Firewall",
  "UPS",
  "Phone",
  "Other",
];

export const FALLBACK_LOCATIONS = [
  "Office 2F",
  "Office 3F",
  "Production Line 1",
  "Production Line 2",
  "Production Line 3",
  "Warehouse",
  "Server Room",
  "QC Lab",
  "IT Store Room",
];

/** Warranty ending within this many days counts as "expiring soon". */
export const WARRANTY_SOON_DAYS = 90;

export type Asset = {
  id: string;
  asset_tag: string;
  type: string;
  brand: string | null;
  model: string | null;
  serial: string | null;
  status: AssetStatus;
  assigned_to: string | null;
  location: string | null;
  purchase_date: string | null;
  warranty_end: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AssetLog = {
  id: string;
  asset_id: string;
  action: string;
  detail: string | null;
  created_at: string;
};

/** Badge variant per status, matching the mockup's status colour roles. */
export function statusBadgeClass(status: string): string {
  switch (status) {
    case "In Use":
      return "border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400";
    case "In Stock":
      return "border-sky-600/40 bg-sky-600/10 text-sky-700 dark:text-sky-400";
    case "Repair":
      return "border-amber-600/40 bg-amber-600/10 text-amber-700 dark:text-amber-400";
    default:
      return "border-muted-foreground/40 bg-muted text-muted-foreground";
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Whole days from today until warranty_end. Negative once expired. */
export function warrantyDaysLeft(warrantyEnd: string | null): number | null {
  if (!warrantyEnd) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(warrantyEnd);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

/** Disposed assets are excluded — they are not worth renewing. */
export function isWarrantySoon(asset: Pick<Asset, "status" | "warranty_end">) {
  if (asset.status === "Disposed") return false;
  const days = warrantyDaysLeft(asset.warranty_end);
  return days !== null && days >= 0 && days <= WARRANTY_SOON_DAYS;
}

export const CSV_COLUMNS = [
  "Asset Tag",
  "Type",
  "Brand",
  "Model",
  "Serial",
  "Status",
  "Assigned To",
  "Location",
  "Purchase Date",
  "Warranty End",
] as const;

export function toCsv(assets: Asset[]): string {
  const escape = (v: string | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = assets.map((a) =>
    [
      a.asset_tag,
      a.type,
      a.brand,
      a.model,
      a.serial,
      a.status,
      a.assigned_to,
      a.location,
      a.purchase_date,
      a.warranty_end,
    ]
      .map(escape)
      .join(","),
  );
  return [CSV_COLUMNS.join(","), ...rows].join("\n");
}
