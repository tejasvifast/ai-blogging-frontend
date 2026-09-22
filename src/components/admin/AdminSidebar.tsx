"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Sparkles,
  CalendarClock,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SITE_NAME } from "@/lib/constants";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** ADMIN-only items are hidden from EDITORs. */
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/categories", label: "Categories & Tags", icon: FolderTree },
  { href: "/admin/ai-generate", label: "AI Generate", icon: Sparkles },
  { href: "/admin/scheduler", label: "Scheduler", icon: CalendarClock, adminOnly: true },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: Role;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = user.role === "ADMIN";

  const items = NAV.filter((item) => !item.adminOnly || isAdmin);

  const nav = (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-5">
        <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="font-serif text-lg font-bold tracking-tight">{SITE_NAME}</span>
          <span className="rounded bg-[var(--color-muted)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Admin
          </span>
        </Link>
        <button
          type="button"
          className="md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <X className="size-5" />
        </button>
      </div>

      {nav}

      <div className="border-t border-[var(--color-border)] p-3">
        <Link
          href="/"
          className="mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
        >
          <ExternalLink className="size-4" />
          View site
        </Link>
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-muted)] text-xs font-semibold uppercase">
            {(user.name ?? user.email ?? "?").charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name ?? "Admin"}</p>
            <p className="truncate text-xs text-[var(--color-muted-foreground)]">{user.role}</p>
          </div>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          className="mt-1 w-full justify-start text-[var(--color-muted-foreground)] hover:text-red-500"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-background)] px-4 md:hidden">
        <button type="button" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu className="size-6" />
        </button>
        <span className="font-serif font-bold">{SITE_NAME} Admin</span>
        <ThemeToggle />
      </div>
      {/* Spacer so content isn't hidden under the mobile bar */}
      <div className="h-14 md:hidden" aria-hidden />

      {/* Desktop fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-[var(--color-border)] bg-[var(--color-card)] md:block">
        {sidebarInner}
      </aside>

      {/* Mobile slide-over */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-[var(--color-border)] bg-[var(--color-card)]">
            {sidebarInner}
          </aside>
        </div>
      )}
    </>
  );
}
