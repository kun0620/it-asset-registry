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
import { createInventoryItem } from "./actions";
import { ItemFields } from "./item-fields";

export function AddItemDialog({ locations }: { locations: string[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createInventoryItem,
    null,
  );
  const wasPending = useRef(false);

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
            Add Item
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xl">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
            <DialogDescription>
              Track a consumable or bulk item by quantity.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <ItemFields locations={locations} />
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
              {pending ? "Adding…" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
