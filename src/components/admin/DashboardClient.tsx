"use client";

import Link from "next/link";
import {
  FileText,
  Eye,
  Sparkles,
  DollarSign,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { AdminPageHeader } from "./AdminPageHeader";
import { useAdminPosts } from "@/hooks/usePosts";
import { useGenerationLogs } from "@/hooks/useAi";

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex size-11 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-[var(--color-muted-foreground)]">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-7 w-16" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardClient() {
  // Pull a wide page to compute simple stats client-side (no analytics endpoint).
  const all = useAdminPosts({ page: 1, limit: 100 });
  const published = useAdminPosts({ page: 1, limit: 1, status: "PUBLISHED" });
  const drafts = useAdminPosts({ page: 1, limit: 1, status: "DRAFT" });
  const scheduled = useAdminPosts({ page: 1, limit: 1, status: "SCHEDULED" });
  const logs = useGenerationLogs({ page: 1, limit: 100 });

  const posts = all.data?.items ?? [];
  const totalPosts = all.data?.meta?.total ?? posts.length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views ?? 0), 0);

  const now = new Date();
  const monthCost = (logs.data?.items ?? [])
    .filter((l) => {
      const d = new Date(l.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, l) => sum + (l.cost ?? 0), 0);

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  const recentLogs = (logs.data?.items ?? []).slice(0, 5);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of your content and AI usage."
        actions={
          <Button asChild>
            <Link href="/admin/posts/new">
              <Plus className="size-4" /> New Post
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total posts" value={totalPosts} icon={FileText} loading={all.isLoading} />
        <StatCard
          label="Published"
          value={published.data?.meta?.total ?? 0}
          icon={FileText}
          loading={published.isLoading}
        />
        <StatCard label="Total views" value={totalViews.toLocaleString()} icon={Eye} loading={all.isLoading} />
        <StatCard
          label="AI cost (month)"
          value={`$${monthCost.toFixed(2)}`}
          icon={DollarSign}
          loading={logs.isLoading}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Drafts" value={drafts.data?.meta?.total ?? 0} icon={FileText} loading={drafts.isLoading} />
        <StatCard
          label="Scheduled"
          value={scheduled.data?.meta?.total ?? 0}
          icon={FileText}
          loading={scheduled.isLoading}
        />
        <StatCard
          label="AI generations"
          value={logs.data?.meta?.total ?? 0}
          icon={Sparkles}
          loading={logs.isLoading}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent posts</CardTitle>
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href="/admin/posts">
                View all <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {all.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : recentPosts.length === 0 ? (
              <p className="py-4 text-sm text-[var(--color-muted-foreground)]">No posts yet.</p>
            ) : (
              recentPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/posts/${p.id}/edit`}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-[var(--color-muted)]"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.title}</span>
                  <StatusBadge status={p.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent AI generations</CardTitle>
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href="/admin/ai-generate">
                Generate <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {logs.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : recentLogs.length === 0 ? (
              <p className="py-4 text-sm text-[var(--color-muted-foreground)]">No generations yet.</p>
            ) : (
              recentLogs.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.model}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {new Date(l.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={
                      l.status === "SUCCESS"
                        ? "text-xs font-medium text-green-600"
                        : "text-xs font-medium text-red-500"
                    }
                  >
                    {l.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
