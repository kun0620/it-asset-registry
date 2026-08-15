"use client";

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
import { ASSET_STATUSES, ASSET_TYPES, type Asset } from "@/lib/assets";

const NO_LOCATION = "__none__";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

/**
 * The editable columns of `assets`, shared by the Add dialog and the detail
 * form so the two can never drift apart. Uncontrolled — the server action
 * reads values straight off the submitted FormData.
 */
export function AssetFields({
  asset,
  locations,
  includeNotes = false,
  includePurchaseDate = false,
}: {
  asset?: Asset;
  locations: string[];
  includeNotes?: boolean;
  includePurchaseDate?: boolean;
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Asset Tag" htmlFor="asset_tag">
          <Input
            id="asset_tag"
            name="asset_tag"
            required
            placeholder="WDI-NB-021"
            defaultValue={asset?.asset_tag ?? ""}
          />
        </Field>

        <Field label="Type">
          <Select name="type" defaultValue={asset?.type ?? ASSET_TYPES[0]}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Brand" htmlFor="brand">
          <Input id="brand" name="brand" defaultValue={asset?.brand ?? ""} />
        </Field>

        <Field label="Model" htmlFor="model">
          <Input id="model" name="model" defaultValue={asset?.model ?? ""} />
        </Field>

        <Field label="Serial" htmlFor="serial">
          <Input id="serial" name="serial" defaultValue={asset?.serial ?? ""} />
        </Field>

        <Field label="Status">
          <Select name="status" defaultValue={asset?.status ?? "In Stock"}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Assigned To" htmlFor="assigned_to">
          <Input
            id="assigned_to"
            name="assigned_to"
            defaultValue={asset?.assigned_to ?? ""}
          />
        </Field>

        <Field label="Location">
          <Select
            name="location"
            defaultValue={asset?.location ?? NO_LOCATION}
            // The sentinel keeps the trigger from rendering blank; the action
            // trims it away because it is not a real location name.
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v) => (v === NO_LOCATION ? "— None —" : String(v))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_LOCATION}>— None —</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {includePurchaseDate && (
          <Field label="Purchase Date" htmlFor="purchase_date">
            <Input
              id="purchase_date"
              name="purchase_date"
              type="date"
              defaultValue={asset?.purchase_date ?? ""}
            />
          </Field>
        )}

        <Field label="Warranty End" htmlFor="warranty_end">
          <Input
            id="warranty_end"
            name="warranty_end"
            type="date"
            defaultValue={asset?.warranty_end ?? ""}
          />
        </Field>
      </div>

      {includeNotes && (
        <div className="mt-4">
          <Field label="Notes" htmlFor="notes">
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              defaultValue={asset?.notes ?? ""}
            />
          </Field>
        </div>
      )}
    </>
  );
}

export { NO_LOCATION };
