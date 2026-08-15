import Link from "next/link";

import { getAppSettings } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { AppearanceCard } from "./appearance-card";
import { AssetConfigForm } from "./asset-config-form";
import { ImportCard } from "./import-card";

export const dynamic = "force-dynamic";

const TABS = [
  { value: "appearance", label: "Appearance" },
  { value: "config", label: "Asset Configuration" },
  { value: "data", label: "Data" },
] as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const tabParam = params.tab;
  const tab = (Array.isArray(tabParam) ? tabParam[0] : tabParam) || "appearance";

  const settings = await getAppSettings();

  return (
    <div className="space-y-6 p-8">
      <h1 className="font-heading text-2xl font-semibold">Settings</h1>

      <div className="inline-flex overflow-hidden rounded-md border">
        {TABS.map((t, i) => (
          <Link
            key={t.value}
            href={`/settings?tab=${t.value}`}
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition",
              i > 0 && "border-l",
              tab === t.value
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-muted",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "appearance" && <AppearanceCard />}
      {tab === "config" && <AssetConfigForm settings={settings} />}
      {tab === "data" && <ImportCard />}
    </div>
  );
}
