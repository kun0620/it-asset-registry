"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ASSET_STATUSES, type AssetStatus } from "@/lib/assets";
import { parseCsv } from "@/lib/csv";

/** `null` means "no error yet" — the shape `useActionState` starts from. */
export type ActionResult = { error: string } | null;

/** Matches the "— None —" sentinel the Location select submits. */
const NO_LOCATION = "__none__";

/** Empty form inputs should land in the database as NULL, not "". */
function nullable(value: FormDataEntryValue | null): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" || text === NO_LOCATION ? null : text;
}

function readForm(formData: FormData) {
  const status = String(formData.get("status") ?? "");
  return {
    asset_tag: nullable(formData.get("asset_tag")),
    type: nullable(formData.get("type")),
    brand: nullable(formData.get("brand")),
    model: nullable(formData.get("model")),
    serial: nullable(formData.get("serial")),
    status: (ASSET_STATUSES as readonly string[]).includes(status)
      ? (status as AssetStatus)
      : ("In Stock" as AssetStatus),
    assigned_to: nullable(formData.get("assigned_to")),
    location: nullable(formData.get("location")),
    purchase_date: nullable(formData.get("purchase_date")),
    warranty_end: nullable(formData.get("warranty_end")),
    notes: nullable(formData.get("notes")),
  };
}

function revalidateAll(id?: string) {
  revalidatePath("/");
  revalidatePath("/assets");
  if (id) revalidatePath(`/assets/${id}`);
}

export async function createAsset(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const values = readForm(formData);
  if (!values.asset_tag) return { error: "Asset Tag is required." };
  if (!values.type) return { error: "Type is required." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .insert(values)
    .select("id")
    .single();

  if (error) {
    return {
      error:
        error.code === "23505"
          ? `Asset Tag "${values.asset_tag}" already exists.`
          : error.message,
    };
  }

  await supabase.from("asset_logs").insert({
    asset_id: data.id,
    action: "Created",
    detail: `Registered as ${values.type}${
      values.assigned_to ? ` · assigned to ${values.assigned_to}` : ""
    }`,
  });

  revalidateAll(data.id);
  redirect(`/assets/${data.id}`);
}

export async function updateAsset(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const values = readForm(formData);
  if (!values.asset_tag) return { error: "Asset Tag is required." };
  if (!values.type) return { error: "Type is required." };

  const supabase = await createClient();
  const { data: before, error: readError } = await supabase
    .from("assets")
    .select("status, assigned_to")
    .eq("id", id)
    .single();

  if (readError) return { error: readError.message };

  const { error } = await supabase.from("assets").update(values).eq("id", id);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? `Asset Tag "${values.asset_tag}" already exists.`
          : error.message,
    };
  }

  // A status or owner change is the part of an edit worth reading back later,
  // so it gets its own timeline entry instead of a generic "Updated".
  const entries: { action: string; detail: string | null }[] = [];
  if (before.status !== values.status) {
    entries.push({
      action: "Status changed",
      detail: `${before.status} → ${values.status}`,
    });
  }
  if (before.assigned_to !== values.assigned_to) {
    entries.push({
      action: values.assigned_to ? "Assigned" : "Unassigned",
      detail: values.assigned_to
        ? `${before.assigned_to ?? "—"} → ${values.assigned_to}`
        : `Returned by ${before.assigned_to}`,
    });
  }
  if (entries.length === 0) {
    entries.push({ action: "Updated", detail: "Asset details edited" });
  }

  await supabase
    .from("asset_logs")
    .insert(entries.map((e) => ({ ...e, asset_id: id })));

  revalidateAll(id);
  return null;
}

export async function deleteAsset(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("assets").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateAll();
  redirect("/assets");
}

export type ImportResult = { error: string } | { count: number } | null;

const STATUS_SET = new Set<string>(ASSET_STATUSES);

export async function importAssetsCsv(
  _prev: ImportResult,
  formData: FormData,
): Promise<ImportResult> {
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

  const supabase = await createClient();
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

  revalidateAll();
  return { count: data?.length ?? 0 };
}
