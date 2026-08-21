import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, statusBadgeClass } from "@/lib/assets";
import { getAppSettings, getAsset, getAssetLogs } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { AssetForm } from "./asset-form";

export const dynamic = "force-dynamic";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) notFound();

  const [logs, settings] = await Promise.all([
    getAssetLogs(id),
    getAppSettings(),
  ]);

  return (
    <div className="space-y-4 p-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        nativeButton={false}
        render={<Link href="/assets" />}
      >
        <ChevronLeft />
        Back to Assets
      </Button>

      <div className="flex items-center gap-3">
        <h1 className="font-heading text-2xl font-semibold">
          {asset.asset_tag}
        </h1>
        <Badge variant="outline" className={cn(statusBadgeClass(asset.status))}>
          {asset.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <AssetForm
          asset={asset}
          locations={settings.locations}
          types={settings.assetTypes}
        />

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              <ol className="space-y-0">
                {logs.map((log) => (
                  <li
                    key={log.id}
                    className="flex gap-3 border-b py-3 last:border-0 last:pb-0"
                  >
                    <span
                      aria-hidden
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{log.action}</div>
                      {log.detail && (
                        <div className="text-sm text-muted-foreground">
                          {log.detail}
                        </div>
                      )}
                      <div className="mt-0.5 text-xs text-muted-foreground/80">
                        {formatDateTime(log.created_at)}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
