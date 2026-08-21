"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Editable string list submitted as repeated same-name fields — the server
 * action reads it back with `formData.getAll(name)`. Controlled (unlike the
 * asset/log forms) because rows need to be added and removed dynamically.
 */
export function ListEditor({
  name,
  label,
  items,
}: {
  name: string;
  label: string;
  items: string[];
}) {
  const [rows, setRows] = useState(items.length > 0 ? items : [""]);

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        {rows.map((value, i) => (
          <div key={i} className="flex gap-2">
            <Input
              name={name}
              value={value}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((v, idx) => (idx === i ? e.target.value : v)),
                )
              }
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Remove ${value || "item"}`}
              onClick={() =>
                setRows((prev) => prev.filter((_, idx) => idx !== i))
              }
            >
              <X />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        className="w-fit"
        onClick={() => setRows((prev) => [...prev, ""])}
      >
        <Plus />
        Add {label.replace(/s$/, "")}
      </Button>
    </div>
  );
}
