"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, FileText, LayoutGrid, List, LogOut, Settings } from "lucide-react";

import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/assets", label: "Assets", icon: List },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/work-log", label: "Work Log", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-1 border-r bg-card p-3">
      <div className="flex items-center gap-2 px-2 py-3">
        <LayoutGrid className="size-5 text-primary" />
        <span className="font-heading text-base font-semibold">
          IT Asset Registry
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Button
              key={href}
              variant={active ? "secondary" : "ghost"}
              className={cn("justify-start gap-2", !active && "text-foreground")}
              nativeButton={false}
              render={<Link href={href} />}
            >
              <Icon className="size-4" />
              {label}
            </Button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Separator className="my-3" />
        <div className="px-2 pb-2 text-xs">
          <div className="font-medium">Nattapong T.</div>
          <div className="text-muted-foreground">IT Engineer</div>
        </div>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-2 text-foreground"
          >
            <LogOut className="size-4" />
            Log out
          </Button>
        </form>
      </div>
    </aside>
  );
}
