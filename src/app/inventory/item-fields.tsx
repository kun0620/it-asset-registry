"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { InventoryItem } from "@/lib/inventory";

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

/**
 * Shared by the Add dialog and each row's Edit dialog — uncontrolled, the
 * server action reads values straight off the submitted FormData. The
 * Inventory page mounts one of these per row plus one for Add, all at
 * once, so ids are namespaced per instance with useId() — the Work Log
 * page hit exactly this collision with plain "title" etc. ids.
 */
export function ItemFields({
  item,
  locations,
}: {
  item?: InventoryItem;
  locations: string[];
}) {
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Name"
          htmlFor={fieldId("name")}
          className="grid gap-1.5 sm:col-span-2"
        >
          <Input
            id={fieldId("name")}
            name="name"
            required
            placeholder="HDMI Cable 2m"
            defaultValue={item?.name ?? ""}
          />
        </Field>

        <Field label="Quantity" htmlFor={fieldId("quantity")}>
          <Input
            id={fieldId("quantity")}
            name="quantity"
            type="number"
            min={0}
            required
            defaultValue={item?.quantity ?? 0}
          />
        </Field>

        <Field label="Unit" htmlFor={fieldId("unit")}>
          <Input
            id={fieldId("unit")}
            name="unit"
            placeholder="pcs"
            defaultValue={item?.unit ?? "pcs"}
          />
        </Field>

        <Field
          label="Location"
          htmlFor={fieldId("location")}
          className="grid gap-1.5 sm:col-span-2"
        >
          <Input
            id={fieldId("location")}
            name="location"
            list={fieldId("location-list")}
            placeholder="e.g. Server Room"
            defaultValue={item?.location ?? ""}
          />
          <datalist id={fieldId("location-list")}>
            {locations.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Notes" htmlFor={fieldId("notes")}>
          <Textarea
            id={fieldId("notes")}
            name="notes"
            rows={3}
            defaultValue={item?.notes ?? ""}
          />
        </Field>
      </div>
    </>
  );
}
