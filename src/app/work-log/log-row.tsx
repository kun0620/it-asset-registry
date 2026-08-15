"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
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
import { categoryBadgeClass, logStatusBadgeClass, type WorkLogWithAsset } from "@/lib/worklog";
import { cn } from "@/lib/utils";
import { updateLog } from "./actions";
import { LogFields } from "./log-fields";

export function LogRow({
  log,
  assetOptions,
}: {
  log: WorkLogWithAsset;
  assetOptions: { id: string; asset_tag: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateLog.bind(null, log.id),
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
        nativeButton={false}
        render={<TableRow className="cursor-pointer" />}
      >
        <TableCell className="w-16 text-muted-foreground">
          {log.duration_min ? `${log.duration_min} min` : "—"}
        </TableCell>
        <TableCell>
          <div className="font-medium">{log.title}</div>
          {log.asset && (
            <div className="text-xs text-muted-foreground">
              {log.asset.asset_tag}
            </div>
          )}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={cn(categoryBadgeClass(log.category))}>
            {log.category}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={cn(logStatusBadgeClass(log.status))}>
            {log.status}
          </Badge>
        </TableCell>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Edit Log</DialogTitle>
            <DialogDescription>
              {log.asset ? (
                <>
                  Linked to{" "}
                  <Link href={`/assets/${log.asset.id}`} className="hover:underline">
                    {log.asset.asset_tag}
                  </Link>
                </>
              ) : (
                "Not linked to an asset."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <LogFields log={log} assetOptions={assetOptions} />
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
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
