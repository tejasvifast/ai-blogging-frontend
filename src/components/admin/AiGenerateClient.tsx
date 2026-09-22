"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Sparkles, Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPageHeader } from "./AdminPageHeader";
import { useCategories, useTags } from "@/hooks/useCategories";
import { useGenerateArticle, useAiJob, useGenerationLogs } from "@/hooks/useAi";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { AiProvider } from "@/types";

type GenForm = {
  topic: string;
  categoryId: string;
  provider: AiProvider;
  contentModel?: string;
  autoPublish: boolean;
};

export function AiGenerateClient() {
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const generate = useGenerateArticle();
  const [jobId, setJobId] = useState<string | null>(null);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const job = useAiJob(jobId);
  const logs = useGenerationLogs({ page: 1, limit: 20 });

  const form = useForm<GenForm>({
    defaultValues: { topic: "", categoryId: "", provider: "anthropic", contentModel: "", autoPublish: false },
  });
  const autoPublish = form.watch("autoPublish");

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await generate.mutateAsync({
        topic: values.topic,
        categoryId: values.categoryId,
        provider: values.provider,
        autoPublish: values.autoPublish,
        ...(tagIds.length ? { tagIds } : {}),
        ...(values.contentModel ? { contentModel: values.contentModel } : {}),
      });
      setJobId(res.jobId);
      toast.success("Generation queued");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to enqueue");
    }
  });

  const state = job.data?.state;
  const progress =
    typeof job.data?.progress === "number" ? job.data.progress : state === "completed" ? 100 : 0;
  const result = job.data?.result;

  return (
    <div>
      <AdminPageHeader
        title="AI Generate"
        description="Generate a full article from a topic. Requires the backend worker to be running."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New generation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="The future of AI in web development"
                  {...form.register("topic", { required: true })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="categoryId">Category</Label>
                <Select id="categoryId" {...form.register("categoryId", { required: true })}>
                  <option value="">Select a category…</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tags (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {tags?.map((t) => {
                    const active = tagIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          setTagIds((prev) =>
                            prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id],
                          )
                        }
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium",
                          active
                            ? "border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                            : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]",
                        )}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="provider">Provider</Label>
                  <Select id="provider" {...form.register("provider")}>
                    <option value="anthropic">Anthropic</option>
                    <option value="openai">OpenAI</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contentModel">Model (optional)</Label>
                  <Input id="contentModel" placeholder="default" {...form.register("contentModel")} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-[var(--color-border)] px-3 py-2">
                <div>
                  <Label>Auto-publish</Label>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Publish immediately when generation finishes.
                  </p>
                </div>
                <Switch checked={autoPublish} onCheckedChange={(v) => form.setValue("autoPublish", v)} />
              </div>
              <Button type="submit" className="w-full" disabled={generate.isPending}>
                {generate.isPending ? <Loader2 className="animate-spin" /> : <Sparkles className="size-4" />}
                Generate article
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job status</CardTitle>
          </CardHeader>
          <CardContent>
            {!jobId ? (
              <p className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
                Submit a topic to start generating.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-muted-foreground)]">Job</span>
                  <code className="rounded bg-[var(--color-muted)] px-1.5 py-0.5 text-xs">{jobId}</code>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{state ?? "loading…"}</span>
                    <span className="text-[var(--color-muted-foreground)]">{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-muted)]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        state === "failed" ? "bg-red-500" : "bg-[var(--color-primary)]",
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {state === "completed" && result && (
                  <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-600">
                    <CheckCircle2 className="size-4" />
                    <span className="flex-1">Article created ({result.status}).</span>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/posts/${result.postId}/edit`}>
                        Open <ExternalLink className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                )}
                {state === "failed" && (
                  <div className="flex items-start gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-600">
                    <XCircle className="mt-0.5 size-4 shrink-0" />
                    <span>{job.data?.failedReason ?? "Generation failed."}</span>
                  </div>
                )}
                {(state === "waiting" || state === "active" || state === "delayed") && (
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Working… this needs the backend <code>npm run worker</code> process running.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Generation history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {logs.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !logs.data || logs.data.items.length === 0 ? (
            <p className="p-8 text-center text-sm text-[var(--color-muted-foreground)]">
              No generations yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="hidden w-24 sm:table-cell">Tokens</TableHead>
                  <TableHead className="hidden w-24 sm:table-cell">Cost</TableHead>
                  <TableHead className="hidden md:table-cell">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.data.items.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.model}</TableCell>
                    <TableCell>
                      <span
                        className={
                          l.status === "SUCCESS"
                            ? "text-xs font-medium text-green-600"
                            : "text-xs font-medium text-red-500"
                        }
                      >
                        {l.status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{l.totalTokens ?? "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {l.cost != null ? `$${l.cost.toFixed(4)}` : "—"}
                    </TableCell>
                    <TableCell className="hidden text-sm text-[var(--color-muted-foreground)] md:table-cell">
                      {new Date(l.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
