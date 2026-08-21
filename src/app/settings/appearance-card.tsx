"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggleGroup } from "@/components/theme-toggle-group";

export function AppearanceCard() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Theme</CardTitle>
      </CardHeader>
      <CardContent>
        <ThemeToggleGroup />
      </CardContent>
    </Card>
  );
}
