"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { ASSET_STATUSES, type AssetStatus } from "@/lib/assets";
import { parseCsv } from "@/lib/csv";

export type ActionResult = { error: string } | null;

function revalidateEverywhere() {
  revalidatePath("/");
  revalidatePath("/assets");
  revalidatePath("/work-log");
  revalidatePath("/settings");
}

export async function updateAppSettings(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const prefix =
    String(formData.get("asset_tag_prefix") ?? "").trim() || "WDI-";
  const locations = formData
    .getAll("locations")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const assetTypes = formData
    .getAll("asset_types")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("app_settings")
    .update({
      asset_tag_prefix: prefix,
      locations,
      asset_types: assetTypes,
    })
    .eq("id", true);

  if (error) return { error: error.message };

  revalidateEverywhere();
  return null;
}

const STATUS_SET = new Set<string>(ASSET_STATUSES);

export async function importAssetsCsv(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV file first." };
  }

  const rows = parseCsv(await file.text());
  const inserts = rows
    .filter((r) => r["asset tag"])
    .map((r) => ({
      asset_tag: r["asset tag"],
      type: r["type"] || "Other",
      brand: r["brand"] || null,
      model: r["model"] || null,
      serial: r["serial"] || null,
      status: STATUS_SET.has(r["status"])
        ? (r["status"] as AssetStatus)
        : ("In Stock" as AssetStatus),
      assigned_to: r["assigned to"] || null,
      location: r["location"] || null,
      purchase_date: r["purchase date"] || null,
      warranty_end: r["warranty end"] || null,
    }));

  if (inserts.length === 0) {
    return { error: "No valid rows found — need an 'Asset Tag' column." };
  }

  const { data, error } = await supabase
    .from("assets")
    .insert(inserts)
    .select("id");
  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Import failed: one or more Asset Tags already exist."
          : error.message,
    };
  }

  const logRows = (data ?? []).map((a) => ({
    asset_id: a.id,
    action: "Created",
    detail: "Imported from CSV",
  }));
  if (logRows.length > 0) {
    await supabase.from("asset_logs").insert(logRows);
  }

  revalidateEverywhere();
  return null;
}
