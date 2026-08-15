import Link from "next/link";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, statusBadgeClass } from "@/lib/assets";
import { getAppSettings, getAssets, type AssetFilters } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { AddAssetDialog } from "./add-asset-dialog";
import { AssetFilters as AssetFilterBar } from "./asset-filters";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** At the ends of the range there is nothing to link to, so it degrades to a
 * plain disabled button — Base UI needs a real <button> in that case. */
function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <Button variant="outline" size="icon" disabled aria-label={label}>
        {children}
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={label}
      nativeButton={false}
      render={<a href={href} />}
    >
      {children}
    </Button>
  );
}

function readFilters(params: Record<string, string | string[] | undefined>) {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
  };
  return {
    q: one("q"),
    type: one("type"),
    status: one("status"),
    location: one("location"),
  } satisfies AssetFilters;
}

export default async function AssetListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filters = readFilters(params);
  const page = Math.max(1, Number(params.page) || 1);

  const [{ assets, total }, settings] = await Promise.all([
    getAssets(filters, {
      from: (page - 1) * PAGE_SIZE,
      to: page * PAGE_SIZE - 1,
    }),
    getAppSettings(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);

  const pageHref = (target: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) next.set(key, value);
    }
    if (target > 1) next.set("page", String(target));
    const query = next.toString();
    return query ? `/assets?${query}` : "/assets";
  };

  const exportHref = (() => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) next.set(key, value);
    }
    const query = next.toString();
    return query ? `/assets/export?${query}` : "/assets/export";
  })();

  return (
    <div className="space-y-4 p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Assets</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "asset" : "assets"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={exportHref} />}
          >
            <Download />
            Export CSV
          </Button>
          <AddAssetDialog settings={settings} />
        </div>
      </div>

      <AssetFilterBar
        locations={settings.locations}
        types={settings.assetTypes}
      />

      <Card className="overflow-hidden py-0">
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Tag</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Brand / Model</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Warranty End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No assets match the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="hover:underline"
                        >
                          {asset.asset_tag}
                        </Link>
                      </TableCell>
                      <TableCell>{asset.type}</TableCell>
                      <TableCell>
                        {[asset.brand, asset.model].filter(Boolean).join(" ") ||
                          "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {asset.serial || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(statusBadgeClass(asset.status))}
                        >
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{asset.assigned_to || "—"}</TableCell>
                      <TableCell>{asset.location || "—"}</TableCell>
                      <TableCell>{formatDate(asset.warranty_end)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="justify-between border-t py-3">
          <span className="text-xs text-muted-foreground">
            Showing {first}–{last} of {total} · page {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <PageLink
              href={pageHref(page - 1)}
              disabled={page <= 1}
              label="Previous page"
            >
              <ChevronLeft />
            </PageLink>
            <PageLink
              href={pageHref(page + 1)}
              disabled={page >= totalPages}
              label="Next page"
            >
              <ChevronRight />
            </PageLink>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
