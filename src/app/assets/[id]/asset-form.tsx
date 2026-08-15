"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Asset } from "@/lib/assets";
import { deleteAsset, updateAsset } from "../actions";
import { AssetFields } from "../asset-fields";

export function AssetForm({
  asset,
  locations,
}: {
  asset: Asset;
  locations: string[];
}) {
  const [state, formAction, pending] = useActionState(
    updateAsset.bind(null, asset.id),
    null,
  );
  const [deleting, startDelete] = useTransition();
  const [saved, setSaved] = useState(false);
  const wasPending = useRef(false);

  // Confirm only on the falling edge of a submit that returned no error —
  // checking `state` alone would flash the banner on first render.
  useEffect(() => {
    const justFinished = wasPending.current && !pending;
    wasPending.current = pending;
    if (!justFinished || state !== null) return;
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(timer);
  }, [state, pending]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Dialog>
          <DialogTrigger
            render={
              <Button type="button" variant="destructive">
                <Trash2 />
                Delete
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete {asset.asset_tag}?</DialogTitle>
              <DialogDescription>
                This cannot be undone. The asset and its timeline will be
                permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose
                render={
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                }
              />
              <Button
                type="button"
                variant="destructive"
                disabled={deleting}
                onClick={() => startDelete(() => void deleteAsset(asset.id))}
              >
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>

      {state?.error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {saved && !state?.error && (
        <p className="rounded-md border border-emerald-600/40 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          Saved successfully
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Asset details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* The fields are uncontrolled, so they keep their initial
              defaultValues after a save. Remounting on updated_at reloads
              them from the freshly revalidated row. */}
          <AssetFields
            key={asset.updated_at}
            asset={asset}
            locations={locations}
            includeNotes
            includePurchaseDate
          />
        </CardContent>
      </Card>
    </form>
  );
}
