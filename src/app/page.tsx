import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  WARRANTY_SOON_DAYS,
  formatDate,
  formatDateTime,
  statusBadgeClass,
} from "@/lib/assets";
import { getDashboardData } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: number;
  description: string;
  accent?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className={cn("font-heading text-3xl", accent)}>
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const { stats, expiringSoon, recentActivity } = await getDashboardData();

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all IT assets
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total assets"
          value={stats.total}
          description="All assets in the system"
        />
        <StatCard
          label="In use"
          value={stats.inUse}
          description="Currently deployed"
          accent="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="In stock"
          value={stats.inStock}
          description="Ready to deploy"
          accent="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          label={`Warranty due in ${WARRANTY_SOON_DAYS} days`}
          value={stats.warrantySoon}
          description="Plan renewal or replacement"
          accent="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Warranty ending soon</CardTitle>
            <Button
              variant="link"
              size="sm"
              nativeButton={false}
              render={<Link href="/assets" />}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Warranty End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringSoon.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No warranties expiring in the next {WARRANTY_SOON_DAYS}{" "}
                      days
                    </TableCell>
                  </TableRow>
                ) : (
                  expiringSoon.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <Link
                          href={`/assets/${asset.id}`}
                          className="font-medium hover:underline"
                        >
                          {asset.asset_tag}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {[asset.brand, asset.model]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </div>
                      </TableCell>
                      <TableCell>{asset.assigned_to || "—"}</TableCell>
                      <TableCell>{asset.location || "—"}</TableCell>
                      <TableCell className="font-medium text-amber-600 dark:text-amber-400">
                        {formatDate(asset.warranty_end)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No activity yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentActivity.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.asset ? (
                          <Link
                            href={`/assets/${log.asset.id}`}
                            className="hover:underline"
                          >
                            {log.asset.asset_tag}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            log.action === "Status changed" &&
                              statusBadgeClass("Repair"),
                          )}
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(log.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
