import { createClient } from "@/lib/supabase/server";
import {
  FALLBACK_ASSET_TYPES,
  FALLBACK_LOCATIONS,
  isWarrantySoon,
  warrantyDaysLeft,
  type Asset,
  type AssetLog,
} from "@/lib/assets";
import {
  CATEGORY_OPTIONS,
  startOfMonth,
  startOfWeek,
  type WorkLogWithAsset,
} from "@/lib/worklog";
import type { InventoryItem } from "@/lib/inventory";

export type AssetFilters = {
  q?: string;
  type?: string;
  status?: string;
  location?: string;
};

/**
 * Filtering happens in Postgres so the page cap never hides a match. Search
 * covers asset tag, serial and holder name — the three the mockup searched.
 */
export async function getAssets(
  filters: AssetFilters,
  range?: { from: number; to: number },
): Promise<{ assets: Asset[]; total: number }> {
  const supabase = await createClient();
  let filtered = supabase.from("assets").select("*", { count: "exact" });

  if (filters.type) filtered = filtered.eq("type", filters.type);
  if (filters.status) filtered = filtered.eq("status", filters.status);
  if (filters.location) filtered = filtered.eq("location", filters.location);
  if (filters.q) {
    // Commas and parens would break PostgREST's or() grammar.
    const term = filters.q.replace(/[(),]/g, " ").trim();
    if (term) {
      filtered = filtered.or(
        `asset_tag.ilike.%${term}%,serial.ilike.%${term}%,assigned_to.ilike.%${term}%`,
      );
    }
  }

  let query = filtered.order("asset_tag");
  if (range) query = query.range(range.from, range.to);

  const { data, count, error } = await query;
  if (error) throw error;
  return { assets: (data ?? []) as Asset[], total: count ?? 0 };
}

export async function getAsset(id: string): Promise<Asset | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Asset) ?? null;
}

export async function getAssetLogs(assetId: string): Promise<AssetLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("asset_logs")
    .select("*")
    .eq("asset_id", assetId)
    .order("created_at", { ascending: false });
  return (data ?? []) as AssetLog[];
}

/** Lightweight id+tag pairs for the Work Log "Related Asset" picker. */
export async function getAssetOptions(): Promise<
  { id: string; asset_tag: string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("assets")
    .select("id, asset_tag")
    .order("asset_tag");
  return data ?? [];
}

export type AppSettings = {
  assetTagPrefix: string;
  locations: string[];
  assetTypes: string[];
};

/**
 * Reads the singleton config row (Settings page). Types and locations here
 * are the authoritative lists — Asset List's filters and the Add/Edit forms
 * all read from this, not from what assets happen to already use.
 */
export async function getAppSettings(): Promise<AppSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("asset_tag_prefix, locations, asset_types")
    .eq("id", true)
    .maybeSingle();

  return {
    assetTagPrefix: data?.asset_tag_prefix ?? "WDI-",
    locations: data?.locations ?? FALLBACK_LOCATIONS,
    assetTypes: data?.asset_types ?? FALLBACK_ASSET_TYPES,
  };
}

export type RecentActivity = AssetLog & {
  asset: { id: string; asset_tag: string } | null;
};

export async function getDashboardData() {
  const supabase = await createClient();
  const [{ data: assetRows }, { data: logRows }] = await Promise.all([
    supabase.from("assets").select("*"),
    supabase
      .from("asset_logs")
      // Embedded select resolves the FK so the table can show a real asset tag.
      .select("*, asset:assets(id, asset_tag)")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const assets = (assetRows ?? []) as Asset[];
  const expiring = assets
    .filter(isWarrantySoon)
    .sort(
      (a, b) =>
        (warrantyDaysLeft(a.warranty_end) ?? 0) -
        (warrantyDaysLeft(b.warranty_end) ?? 0),
    );

  return {
    stats: {
      total: assets.length,
      inUse: assets.filter((a) => a.status === "In Use").length,
      inStock: assets.filter((a) => a.status === "In Stock").length,
      warrantySoon: expiring.length,
    },
    expiringSoon: expiring.slice(0, 5),
    recentActivity: (logRows ?? []) as RecentActivity[],
  };
}

export type WorkLogFilters = {
  q?: string;
  category?: string;
  status?: string;
  /** Pre-resolved bounds — the page computes 'week'/'month'/'custom' into these. */
  from?: string;
  to?: string;
};

const WORK_LOG_SELECT = "*, asset:assets(id, asset_tag)";

export async function getWorkLogs(
  filters: WorkLogFilters,
): Promise<WorkLogWithAsset[]> {
  const supabase = await createClient();
  let query = supabase.from("work_logs").select(WORK_LOG_SELECT);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.from) query = query.gte("log_date", filters.from);
  if (filters.to) query = query.lte("log_date", filters.to);
  if (filters.q) {
    const term = filters.q.replace(/[(),]/g, " ").trim();
    if (term) {
      query = query.or(`title.ilike.%${term}%,detail.ilike.%${term}%`);
    }
  }

  const { data, error } = await query
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as WorkLogWithAsset[];
}

/** Dashboard's Work Log Summary: this-week/month counts, 30-day category
 * breakdown, a 91-day activity heatmap, and the 5 most recent entries. */
export async function getWorkLogStats() {
  const supabase = await createClient();
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const ninetyOneDaysAgo = new Date(today);
  ninetyOneDaysAgo.setDate(ninetyOneDaysAgo.getDate() - 90);

  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const [{ data: last91 }, { data: recentRows }] = await Promise.all([
    supabase
      .from("work_logs")
      .select("log_date, category")
      .gte("log_date", iso(ninetyOneDaysAgo)),
    supabase
      .from("work_logs")
      .select(WORK_LOG_SELECT)
      .order("log_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const rows = last91 ?? [];
  const weekStart = startOfWeek(today);
  const monthStart = startOfMonth(today);

  const week = rows.filter((r) => new Date(r.log_date) >= weekStart).length;
  const month = rows.filter((r) => new Date(r.log_date) >= monthStart).length;

  const thirtyDayRows = rows.filter(
    (r) => new Date(r.log_date) >= thirtyDaysAgo,
  );
  const categoryCounts = new Map<string, number>(
    CATEGORY_OPTIONS.map((c) => [c, 0]),
  );
  for (const r of thirtyDayRows) {
    categoryCounts.set(r.category, (categoryCounts.get(r.category) ?? 0) + 1);
  }
  const maxCount = Math.max(1, ...categoryCounts.values());
  const categoryBreakdown = CATEGORY_OPTIONS.map((category) => {
    const count = categoryCounts.get(category) ?? 0;
    return { category, count, pct: Math.round((count / maxCount) * 100) };
  });

  const countsByDate = new Map<string, number>();
  for (const r of rows) {
    countsByDate.set(r.log_date, (countsByDate.get(r.log_date) ?? 0) + 1);
  }
  const heatmap = Array.from({ length: 91 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (90 - i));
    const date = iso(d);
    return { date, count: countsByDate.get(date) ?? 0 };
  });

  return {
    week,
    month,
    categoryBreakdown,
    heatmap,
    recent: (recentRows ?? []) as unknown as WorkLogWithAsset[],
  };
}

export async function getInventoryItems(q?: string): Promise<InventoryItem[]> {
  const supabase = await createClient();
  let query = supabase.from("inventory_items").select("*");
  if (q?.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }
  const { data, error } = await query.order("name");
  if (error) throw error;
  return (data ?? []) as InventoryItem[];
}
