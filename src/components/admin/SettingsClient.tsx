"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, ShieldCheck, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "./AdminPageHeader";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api/client";
import { ApiError, toApiError } from "@/lib/api/errors";

const DEFAULT_PATHS = "/, /blog";

export function SettingsClient() {
  const { user } = useAuth();
  const [paths, setPaths] = useState(DEFAULT_PATHS);
  const [revalidating, setRevalidating] = useState(false);

  async function handleRevalidate() {
    const list = paths
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (list.length === 0) {
      toast.error("Enter at least one path.");
      return;
    }
    setRevalidating(true);
    try {
      await apiClient.post("/admin/revalidate", { paths: list });
      toast.success(`Revalidated ${list.length} path(s)`);
    } catch (err) {
      const e = err instanceof ApiError ? err : toApiError(err);
      toast.error(e.message);
    } finally {
      setRevalidating(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Settings" description="Your profile and site maintenance." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="size-4" /> Profile
            </CardTitle>
            <CardDescription>Managed via your sign-in provider.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={user?.name ?? ""} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[var(--color-primary)]" />
                <span className="font-medium">{user?.role ?? "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="size-4" /> Revalidate cache
            </CardTitle>
            <CardDescription>
              Force the public site to rebuild specific paths (ISR on-demand revalidation).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="paths">Paths (comma separated)</Label>
              <Input
                id="paths"
                value={paths}
                onChange={(e) => setPaths(e.target.value)}
                placeholder="/, /blog, /blog/my-post"
              />
            </div>
            <Button onClick={handleRevalidate} disabled={revalidating}>
              {revalidating ? <Loader2 className="animate-spin" /> : <RefreshCw className="size-4" />}
              Revalidate now
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Admin access</CardTitle>
            <CardDescription>
              Roles are controlled by the backend, not editable here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              A user becomes <span className="font-medium text-[var(--color-foreground)]">ADMIN</span> when
              their email is in the backend&rsquo;s <code>ADMIN_EMAILS</code> allowlist (recomputed on every
              sign-in); everyone else is an <span className="font-medium text-[var(--color-foreground)]">EDITOR</span>.
              To change access, update <code>ADMIN_EMAILS</code> in the backend&rsquo;s environment and restart it.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
