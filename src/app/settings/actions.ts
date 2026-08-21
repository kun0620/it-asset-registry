"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
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
