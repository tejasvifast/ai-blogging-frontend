"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Container } from "./Container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface NavCategory {
  name: string;
  slug: string;
}

export function Header({ categories = [] }: { categories?: NavCategory[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    ...categories.slice(0, 4).map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
    { label: "About", href: "/about" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-serif text-xl font-bold tracking-tight">
              {SITE_NAME}
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-[var(--color-primary)]",
                    isActive(link.href)
                      ? "text-[var(--color-foreground)]"
                      : "text-[var(--color-muted-foreground)]",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild aria-label="Search">
              <Link href="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            <ThemeToggle />
            <UserMenu />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </Container>

      {mobileOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-background)] md:hidden">
          <Container>
            <nav className="flex flex-col py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "py-2.5 text-sm font-medium",
                    isActive(link.href)
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-muted-foreground)]",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}

function UserMenu() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--color-muted)]" />;
  }

  if (!isAuthenticated) {
    return (
      <Button asChild size="sm" className="ml-1">
        <Link href="/login">Sign in</Link>
      </Button>
    );
  }

  const initial = user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-primary-foreground)]"
          aria-label="Account menu"
        >
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate">{user?.name}</span>
          <span className="truncate text-xs font-normal text-[var(--color-muted-foreground)]">
            {user?.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/dashboard">
            <LayoutDashboard />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-red-500 focus:text-red-500"
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
