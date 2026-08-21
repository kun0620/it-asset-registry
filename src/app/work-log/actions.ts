"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_OPTIONS,
  LOG_STATUS_OPTIONS,
  type LogCategory,
  type LogStatus,
} from "@/lib/worklog";

export type ActionResult = { error: string } | null;

/** Matches the "— None —" sentinel the Related Asset select submits. */
const NO_ASSET = "__none__";

function readForm(formData: FormData) {
  const category = String(formData.get("category") ?? "");
  const status = String(formData.get("status") ?? "");
  const assetId = String(formData.get("asset_id") ?? "");
  const tagsText = String(formData.get("tags") ?? "");

  return {
    log_date: String(formData.get("log_date") ?? "").trim() || null,
    title: String(formData.get("title") ?? "").trim(),
    category: (CATEGORY_OPTIONS as readonly string[]).includes(category)
      ? (category as LogCategory)
      : ("Other" as LogCategory),
    status: (LOG_STATUS_OPTIONS as readonly string[]).includes(status)
      ? (status as LogStatus)
      : ("Done" as LogStatus),
    duration_min: Number(formData.get("duration_min")) || 0,
    asset_id: !assetId || assetId === NO_ASSET ? null : assetId,
    detail: String(formData.get("detail") ?? "").trim() || null,
    tags: tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  };
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/work-log");
}

export async function createLog(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const values = readForm(formData);
  if (!values.title) return { error: "Title is required." };
  if (!values.log_date) return { error: "Date is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("work_logs").insert(values);
  if (error) return { error: error.message };

  revalidateAll();
  return null;
}

export async function updateLog(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const values = readForm(formData);
  if (!values.title) return { error: "Title is required." };
  if (!values.log_date) return { error: "Date is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("work_logs")
    .update(values)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidateAll();
  return null;
}
