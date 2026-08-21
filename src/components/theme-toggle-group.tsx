"use client";

import { useTheme, type ThemeMode } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeToggleGroup() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex overflow-hidden rounded-md border">
      {OPTIONS.map((opt, i) => (
        <Button
          key={opt.value}
          type="button"
          variant={theme === opt.value ? "secondary" : "ghost"}
          className={cn("rounded-none", i > 0 && "border-l")}
          onClick={() => setTheme(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
