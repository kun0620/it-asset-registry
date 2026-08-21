"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AppSettings } from "@/lib/queries";
import { updateAppSettings } from "./actions";
import { ListEditor } from "./list-editor";

export function AssetConfigForm({ settings }: { settings: AppSettings }) {
  const [state, formAction, pending] = useActionState(updateAppSettings, null);
  const [saved, setSaved] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    const justFinished = wasPending.current && !pending;
    wasPending.current = pending;
    if (!justFinished || state !== null) return;
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(timer);
  }, [state, pending]);

  return (
    <form action={formAction} className="grid max-w-lg gap-4">
      <Card>
        <CardContent className="grid gap-1.5">
          <Label htmlFor="asset_tag_prefix">Asset Tag Prefix</Label>
          <Input
            id="asset_tag_prefix"
            name="asset_tag_prefix"
            defaultValue={settings.assetTagPrefix}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location list</CardTitle>
        </CardHeader>
        <CardContent>
          <ListEditor
            name="locations"
            label="Locations"
            items={settings.locations}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asset Type list</CardTitle>
        </CardHeader>
        <CardContent>
          <ListEditor
            name="asset_types"
            label="Asset Types"
            items={settings.assetTypes}
          />
        </CardContent>
      </Card>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {saved && !state?.error && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Saved successfully
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
