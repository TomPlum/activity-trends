"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, HeartPulse, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { NAV_ITEMS } from "./nav";

const COLLAPSE_KEY = "nav-collapsed";

function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex flex-col gap-1", collapsed ? "px-2" : "px-3")}>
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-label={collapsed ? item.label : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <Icon className={cn("h-[18px] w-[18px] shrink-0", active && item.accent)} />
            {!collapsed && item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        collapsed ? "justify-center px-2 py-5" : "px-6 py-5",
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <HeartPulse className="h-5 w-5" />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-sm font-semibold">Activity Trends</p>
          <p className="text-xs text-muted-foreground">Apple Health dashboard</p>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore the persisted collapse state on mount (kept out of the initial
  // render to avoid a hydration mismatch against the server's expanded markup).
  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  return (
    <div
      className={cn(
        "min-h-screen lg:grid",
        collapsed ? "lg:grid-cols-[72px_1fr]" : "lg:grid-cols-[260px_1fr]",
      )}
    >
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r bg-card/40 lg:flex">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
          <Brand collapsed={collapsed} />
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-3 h-8 w-8 text-muted-foreground"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              onClick={toggleCollapsed}
            >
              <PanelLeftClose className="h-[18px] w-[18px]" />
            </Button>
          )}
        </div>
        {collapsed && (
          <div className="flex justify-center pb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              aria-label="Expand sidebar"
              title="Expand sidebar"
              onClick={toggleCollapsed}
            >
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            </Button>
          </div>
        )}
        <div className="mt-2 flex-1">
          <NavLinks collapsed={collapsed} />
        </div>
        <div
          className={cn(
            "flex items-center border-t py-4",
            collapsed ? "justify-center px-2" : "justify-between px-6",
          )}
        >
          {!collapsed && (
            <span className="text-xs text-muted-foreground">Read-only · public</span>
          )}
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <NavLinks onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="text-sm font-semibold">Activity Trends</span>
          <ThemeToggle />
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
