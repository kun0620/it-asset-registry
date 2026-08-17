"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

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
import { TableCell, TableRow } from "@/components/ui/table";
import type { InventoryItem } from "@/lib/inventory";
import { deleteInventoryItem, updateInventoryItem } from "./actions";
import { ItemFields } from "./item-fields";

export function ItemRow({
  item,
  locations,
}: {
  item: InventoryItem;
  locations: string[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateInventoryItem.bind(null, item.id),
    null,
  );
  const [deleting, startDelete] = useTransition();
  const wasPending = useRef(false);

  useEffect(() => {
    const justFinished = wasPending.current && !pending;
    wasPending.current = pending;
    if (justFinished && state === null) setOpen(false);
  }, [state, pending]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        nativeButton={false}
        render={<TableRow className="cursor-pointer" />}
      >
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell>
          {item.quantity} {item.unit}
        </TableCell>
        <TableCell>{item.location || "—"}</TableCell>
        <TableCell className="max-w-xs truncate text-muted-foreground">
          {item.notes || "—"}
        </TableCell>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <ItemFields item={item} locations={locations} />
          </div>

          {state?.error && (
            <p className="pb-2 text-sm text-destructive">{state.error}</p>
          )}

          <DialogFooter className="justify-between sm:justify-between">
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
                  <DialogTitle>Delete {item.name}?</DialogTitle>
                  <DialogDescription>
                    This cannot be undone.
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
                    onClick={() =>
                      startDelete(async () => {
                        await deleteInventoryItem(item.id);
                        setOpen(false);
                      })
                    }
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="flex gap-2">
              <DialogClose
                render={
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                }
              />
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
