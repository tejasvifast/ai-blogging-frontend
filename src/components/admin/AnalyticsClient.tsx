"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "./AdminPageHeader";
import { useAdminPosts } from "@/hooks/usePosts";
import { useGenerationLogs } from "@/hooks/useAi";
import type { PostStatus } from "@/types";

const STATUS_COLORS: Record<PostStatus, string> = {
  PUBLISHED: "#22c55e",
  DRAFT: "#64748b",
  SCHEDULED: "#f59e0b",
  ARCHIVED: "#ef4444",
};

export function AnalyticsClient() {
  const { data: postsData, isLoading: postsLoading } = useAdminPosts({ page: 1, limit: 100 });
  const { data: logsData, isLoading: logsLoading } = useGenerationLogs({ page: 1, limit: 100 });

  const posts = postsData?.items ?? [];
  const logs = logsData?.items ?? [];

  // Posts by status
  const statusCounts = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});
  const statusData = (Object.keys(STATUS_COLORS) as PostStatus[])
    .map((s) => ({ name: s.charAt(0) + s.slice(1).toLowerCase(), value: statusCounts[s] ?? 0, status: s }))
    .filter((d) => d.value > 0);

  // Top posts by views
  const topPosts = [...posts]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 8)
    .map((p) => ({ name: p.title.length > 24 ? p.title.slice(0, 24) + "…" : p.title, views: p.views ?? 0 }));

  // AI cost by day
  const byDay = new Map<string, { date: string; cost: number; tokens: number }>();
  for (const l of logs) {
    const date = new Date(l.createdAt).toISOString().slice(0, 10);
    const entry = byDay.get(date) ?? { date, cost: 0, tokens: 0 };
    entry.cost += l.cost ?? 0;
    entry.tokens += l.totalTokens ?? 0;
    byDay.set(date, entry);
  }
  const costData = Array.from(byDay.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ date: d.date.slice(5), cost: Number(d.cost.toFixed(4)), tokens: d.tokens }));

  const totalCost = logs.reduce((s, l) => s + (l.cost ?? 0), 0);
  const totalTokens = logs.reduce((s, l) => s + (l.totalTokens ?? 0), 0);
  const totalViews = posts.reduce((s, p) => s + (p.views ?? 0), 0);

  const loading = postsLoading || logsLoading;

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Derived from your posts and AI generation logs."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[var(--color-muted-foreground)]">Total views</p>
            {loading ? <Skeleton className="mt-1 h-7 w-20" /> : <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[var(--color-muted-foreground)]">AI tokens used</p>
            {loading ? <Skeleton className="mt-1 h-7 w-20" /> : <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[var(--color-muted-foreground)]">AI spend (total)</p>
            {loading ? <Skeleton className="mt-1 h-7 w-20" /> : <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Posts by status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : statusData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label>
                    {statusData.map((d) => (
                      <Cell key={d.status} fill={STATUS_COLORS[d.status]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top posts by views</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : topPosts.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topPosts} layout="vertical" margin={{ left: 10, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontSize: 11 }}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                  <Bar dataKey="views" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">AI cost over time</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : costData.length === 0 ? (
              <EmptyChart label="No AI generations logged yet." />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={costData} margin={{ left: 4, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="cost" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.5rem",
  color: "var(--color-foreground)",
  fontSize: "0.8rem",
} as const;

function EmptyChart({ label = "No data yet." }: { label?: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-[var(--color-muted-foreground)]">
      {label}
    </div>
  );
}
