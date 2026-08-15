"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASSET_STATUSES, ASSET_TYPES } from "@/lib/assets";

const ALL = "__all__";

export function AssetFilters({ locations }: { locations: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const urlQuery = params.get("q") ?? "";
  const [search, setSearch] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);

  // Adjust state during render when the URL changes from outside (e.g. Clear)
  // rather than in an effect, which would cause a cascading re-render.
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setSearch(urlQuery);
  }

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== ALL) next.set(key, value);
    else next.delete(key);
    // Any filter change invalidates the current page offset.
    next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next}`));
  };

  // Typing shouldn't fire a query per keystroke.
  useEffect(() => {
    if (search === urlQuery) return;
    const timer = setTimeout(() => setParam("q", search), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, urlQuery]);

  const type = params.get("type") ?? ALL;
  const status = params.get("status") ?? ALL;
  const location = params.get("location") ?? ALL;
  const hasFilters =
    Boolean(params.get("q")) ||
    type !== ALL ||
    status !== ALL ||
    location !== ALL;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-60 flex-1 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search tag, serial, holder name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select
        name="type"
        value={type}
        onValueChange={(v) => setParam("type", String(v))}
      >
        <SelectTrigger className="w-40">
          <SelectValue>{(v) => (v === ALL ? "All Types" : String(v))}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Types</SelectItem>
          {ASSET_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        name="status"
        value={status}
        onValueChange={(v) => setParam("status", String(v))}
      >
        <SelectTrigger className="w-40">
          <SelectValue>
            {(v) => (v === ALL ? "All Statuses" : String(v))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Statuses</SelectItem>
          {ASSET_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        name="location"
        value={location}
        onValueChange={(v) => setParam("location", String(v))}
      >
        <SelectTrigger className="w-48">
          <SelectValue>
            {(v) => (v === ALL ? "All Locations" : String(v))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Locations</SelectItem>
          {locations.map((l) => (
            <SelectItem key={l} value={l}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          onClick={() => startTransition(() => router.replace(pathname))}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
