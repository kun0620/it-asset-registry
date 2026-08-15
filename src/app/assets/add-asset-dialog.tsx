"use client";

import { useActionState, useState } from "react";
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
import { createAsset } from "./actions";
import { AssetFields } from "./asset-fields";

export function AddAssetDialog({ locations }: { locations: string[] }) {
  const [open, setOpen] = useState(false);
  // On success the action redirects to the new asset, so the only state that
  // ever comes back here is a validation or uniqueness error.
  const [state, formAction, pending] = useActionState(createAsset, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Add Asset
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Add Asset</DialogTitle>
            <DialogDescription>
              Register a new asset. You can fill in the remaining details after
              saving.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <AssetFields locations={locations} />
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
              {pending ? "Adding…" : "Add Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
