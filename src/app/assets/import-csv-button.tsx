"use client";

import { useActionState, useRef } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { importAssetsCsv } from "./actions";

export function ImportCsvButton() {
  const [state, formAction, pending] = useActionState(importAssetsCsv, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="relative">
      <input
        type="file"
        name="file"
        accept=".csv"
        className="hidden"
        id="asset-list-import-input"
        onChange={() => formRef.current?.requestSubmit()}
      />
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() =>
          document.getElementById("asset-list-import-input")?.click()
        }
      >
        <Upload />
        {pending ? "Importing…" : "Import CSV"}
      </Button>

      {state && (
        <div className="absolute top-full right-0 z-10 mt-1 w-64 rounded-md border bg-popover p-2 text-xs shadow-md">
          {"error" in state ? (
            <span className="text-destructive">{state.error}</span>
          ) : (
            <span className="text-emerald-700 dark:text-emerald-400">
              Imported {state.count} {state.count === 1 ? "asset" : "assets"}
            </span>
          )}
        </div>
      )}
    </form>
  );
}
