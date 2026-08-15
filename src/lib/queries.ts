import { supabase } from "@/lib/supabase";
import {
  DEFAULT_LOCATIONS,
  isWarrantySoon,
  warrantyDaysLeft,
  type Asset,
  type AssetLog,
} from "@/lib/assets";

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
  const { data } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Asset) ?? null;
}

export async function getAssetLogs(assetId: string): Promise<AssetLog[]> {
  const { data } = await supabase
    .from("asset_logs")
    .select("*")
    .eq("asset_id", assetId)
    .order("created_at", { ascending: false });
  return (data ?? []) as AssetLog[];
}

/** Known locations = starter list plus anything already used by an asset. */
export async function getLocations(): Promise<string[]> {
  const { data } = await supabase
    .from("assets")
    .select("location")
    .not("location", "is", null);

  const used = (data ?? [])
    .map((row) => row.location as string)
    .filter(Boolean);

  return Array.from(new Set([...DEFAULT_LOCATIONS, ...used])).sort();
}

export type RecentActivity = AssetLog & {
  asset: { id: string; asset_tag: string } | null;
};

export async function getDashboardData() {
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
