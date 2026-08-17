"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { Download, FileDown, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { importAssetsCsv } from "../assets/actions";

function isError(state: unknown): state is { error: string } {
  return typeof state === "object" && state !== null && "error" in state;
}

export function ImportCard() {
  const [state, formAction, pending] = useActionState(importAssetsCsv, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Data</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          variant="outline"
          nativeButton={false}
          className="w-fit"
          render={<Link href="/assets/export" />}
        >
          <Download />
          Export All Data (CSV)
        </Button>

        <div className="flex flex-col gap-1.5">
          <Button
            variant="outline"
            nativeButton={false}
            className="w-fit"
            render={<Link href="/assets/template" />}
          >
            <FileDown />
            Download Import Template (CSV)
          </Button>
          <p className="text-xs text-muted-foreground">
            Empty spreadsheet with the right columns — fill it in and upload
            it below.
          </p>
        </div>

        <form ref={formRef} action={formAction} className="flex flex-col gap-2">
          <input
            type="file"
            name="file"
            accept=".csv"
            className="hidden"
            id="csv-import-input"
            onChange={() => formRef.current?.requestSubmit()}
          />
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            className="w-fit"
            onClick={() => document.getElementById("csv-import-input")?.click()}
          >
            <Upload />
            {pending ? "Importing…" : "Import from CSV"}
          </Button>
          {state && isError(state) && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state && !isError(state) && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Imported {state.count} {state.count === 1 ? "asset" : "assets"}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
