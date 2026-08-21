"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string } | null;

function nullable(value: FormDataEntryValue | null): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? null : text;
}

function readForm(formData: FormData) {
  const quantity = Number(formData.get("quantity"));
  return {
    name: String(formData.get("name") ?? "").trim(),
    quantity: Number.isFinite(quantity) && quantity >= 0 ? quantity : 0,
    unit: String(formData.get("unit") ?? "").trim() || "pcs",
    location: nullable(formData.get("location")),
    notes: nullable(formData.get("notes")),
  };
}

function revalidateAll() {
  revalidatePath("/inventory");
}

export async function createInventoryItem(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const values = readForm(formData);
  if (!values.name) return { error: "Name is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("inventory_items").insert(values);
  if (error) return { error: error.message };

  revalidateAll();
  return null;
}

export async function updateInventoryItem(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const values = readForm(formData);
  if (!values.name) return { error: "Name is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory_items")
    .update(values)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidateAll();
  return null;
}

export async function deleteInventoryItem(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  revalidateAll();
  return null;
}
