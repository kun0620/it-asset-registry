"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORY_OPTIONS,
  LOG_STATUS_OPTIONS,
  type WorkLogWithAsset,
} from "@/lib/worklog";

export const NO_ASSET = "__none__";

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className ?? "grid gap-1.5"}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Shared by the Add dialog and each row's Edit dialog — uncontrolled, the
 * server action reads values straight off the submitted FormData. The Work
 * Log page mounts one LogFields per row plus one for Add, all at once, so
 * ids are namespaced per instance with useId() — plain "title" etc. would
 * collide across every open/closed dialog on the page.
 */
export function LogFields({
  log,
  assetOptions,
}: {
  log?: WorkLogWithAsset;
  assetOptions: { id: string; asset_tag: string }[];
}) {
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Date" htmlFor={fieldId("log_date")}>
        <Input
          id={fieldId("log_date")}
          name="log_date"
          type="date"
          required
          defaultValue={log?.log_date ?? todayIso()}
        />
      </Field>

      <Field label="Duration (min)" htmlFor={fieldId("duration_min")}>
        <Input
          id={fieldId("duration_min")}
          name="duration_min"
          type="number"
          min={0}
          defaultValue={log?.duration_min ?? 0}
        />
      </Field>

      <Field
        label="Title"
        htmlFor={fieldId("title")}
        className="grid gap-1.5 sm:col-span-2"
      >
        <Input
          id={fieldId("title")}
          name="title"
          required
          defaultValue={log?.title ?? ""}
        />
      </Field>

      <Field label="Category">
        <Select name="category" defaultValue={log?.category ?? CATEGORY_OPTIONS[0]}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Status">
        <Select name="status" defaultValue={log?.status ?? "Done"}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOG_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Related Asset" className="grid gap-1.5 sm:col-span-2">
        <Select name="asset_id" defaultValue={log?.asset_id ?? NO_ASSET}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(v) =>
                v === NO_ASSET
                  ? "— None —"
                  : (assetOptions.find((a) => a.id === v)?.asset_tag ?? "— None —")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_ASSET}>— None —</SelectItem>
            {assetOptions.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.asset_tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field
        label="Detail"
        htmlFor={fieldId("detail")}
        className="grid gap-1.5 sm:col-span-2"
      >
        <Textarea
          id={fieldId("detail")}
          name="detail"
          rows={3}
          defaultValue={log?.detail ?? ""}
        />
      </Field>

      <Field
        label="Tags"
        htmlFor={fieldId("tags")}
        className="grid gap-1.5 sm:col-span-2"
      >
        <Input
          id={fieldId("tags")}
          name="tags"
          placeholder="e.g. network, ups"
          defaultValue={log?.tags?.join(", ") ?? ""}
        />
      </Field>
    </div>
  );
}
