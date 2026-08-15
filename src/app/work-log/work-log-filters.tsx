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
import { CATEGORY_OPTIONS, LOG_STATUS_OPTIONS } from "@/lib/worklog";

const ALL = "__all__";

const RANGE_LABELS: Record<string, string> = {
  all: "All time",
  week: "This week",
  month: "This month",
  custom: "Custom range",
};

export function WorkLogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const urlQuery = params.get("q") ?? "";
  const [search, setSearch] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);

  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setSearch(urlQuery);
  }

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== ALL) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`${pathname}?${next}`));
  };

  useEffect(() => {
    if (search === urlQuery) return;
    const timer = setTimeout(() => setParam("q", search), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, urlQuery]);

  const range = params.get("range") ?? "all";
  const category = params.get("category") ?? ALL;
  const status = params.get("status") ?? ALL;
  const customFrom = params.get("from") ?? "";
  const customTo = params.get("to") ?? "";

  const hasFilters =
    Boolean(params.get("q")) ||
    range !== "all" ||
    category !== ALL ||
    status !== ALL;

  const setCustomDate = (key: "from" | "to", value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`${pathname}?${next}`));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-56 max-w-sm flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search title, detail"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select value={range} onValueChange={(v) => setParam("range", String(v))}>
        <SelectTrigger className="w-40">
          <SelectValue>{(v) => RANGE_LABELS[String(v)] ?? "All time"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All time</SelectItem>
          <SelectItem value="week">This week</SelectItem>
          <SelectItem value="month">This month</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>

      {range === "custom" && (
        <>
          <Input
            type="date"
            className="w-36"
            value={customFrom}
            onChange={(e) => setCustomDate("from", e.target.value)}
          />
          <Input
            type="date"
            className="w-36"
            value={customTo}
            onChange={(e) => setCustomDate("to", e.target.value)}
          />
        </>
      )}

      <Select
        value={category}
        onValueChange={(v) => setParam("category", String(v))}
      >
        <SelectTrigger className="w-40">
          <SelectValue>
            {(v) => (v === ALL ? "All Categories" : String(v))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Categories</SelectItem>
          {CATEGORY_OPTIONS.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => setParam("status", String(v))}>
        <SelectTrigger className="w-40">
          <SelectValue>{(v) => (v === ALL ? "All Statuses" : String(v))}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Statuses</SelectItem>
          {LOG_STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
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
