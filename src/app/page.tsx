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
import { getDashboardData, getWorkLogStats } from "@/lib/queries";
import { categoryBadgeClass, logStatusBadgeClass } from "@/lib/worklog";
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
        <CardDescription className="text-[11px] tracking-wide text-primary uppercase">
          {label}
        </CardDescription>
        <CardTitle className={cn("font-heading text-3xl font-semibold", accent)}>
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
  const [{ stats, expiringSoon, recentActivity }, workLog] = await Promise.all([
    getDashboardData(),
    getWorkLogStats(),
  ]);

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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">
            Work Log Summary
          </h2>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/work-log" />}>
            View all
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            label="Logs this week"
            value={workLog.week}
            description="Entries logged since Monday"
          />
          <StatCard
            label="Logs this month"
            value={workLog.month}
            description="Entries logged this calendar month"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Logs by category (last 30 days)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {workLog.categoryBreakdown.map((row) => (
                <div key={row.category} className="flex items-center gap-2.5">
                  <span className="w-24 shrink-0 text-xs">{row.category}</span>
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-5 shrink-0 text-right text-xs">
                    {row.count}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logging frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
                {workLog.heatmap.map((cell) => (
                  <div
                    key={cell.date}
                    title={`${cell.date}: ${cell.count}`}
                    className={cn(
                      "size-[11px] rounded-[2px]",
                      cell.count === 0 && "bg-muted",
                      cell.count === 1 && "bg-primary/35",
                      cell.count === 2 && "bg-primary/65",
                      cell.count >= 3 && "bg-primary",
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Recent logs</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workLog.recent.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No logs match the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  workLog.recent.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(log.log_date)}
                      </TableCell>
                      <TableCell className="font-medium">{log.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(categoryBadgeClass(log.category))}
                        >
                          {log.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(logStatusBadgeClass(log.status))}
                        >
                          {log.status}
                        </Badge>
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
