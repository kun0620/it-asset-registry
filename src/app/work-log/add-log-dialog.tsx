"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { createLog } from "./actions";
import { LogFields } from "./log-fields";

export function AddLogDialog({
  assetOptions,
}: {
  assetOptions: { id: string; asset_tag: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createLog, null);
  const wasPending = useRef(false);

  // Close only on the falling edge of a submit that returned no error —
  // there's no redirect target for a log entry to hang the close off of,
  // unlike the Add Asset dialog.
  useEffect(() => {
    const justFinished = wasPending.current && !pending;
    wasPending.current = pending;
    if (justFinished && state === null) setOpen(false);
  }, [state, pending]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Add Log
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Add Log</DialogTitle>
            <DialogDescription>
              Record a work log entry, optionally linked to an asset.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <LogFields assetOptions={assetOptions} />
          </div>

          {state?.error && (
            <p className="pb-2 text-sm text-destructive">{state.error}</p>
          )}

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add Log"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
