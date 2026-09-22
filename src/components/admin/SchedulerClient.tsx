"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Play, Loader2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "./ConfirmDialog";
import { AdminPageHeader } from "./AdminPageHeader";
import { useCategories } from "@/hooks/useCategories";
import {
  useCronJobs,
  useCreateCronJob,
  useUpdateCronJob,
  useDeleteCronJob,
  useRunCronNow,
  useRunMaintenance,
} from "@/hooks/useScheduler";
import { ApiError } from "@/lib/api/errors";
import type { AiProvider, CronJob, MaintenanceTask } from "@/types";

type CronForm = {
  name: string;
  description?: string;
  cronExpression: string;
  enabled: boolean;
  topic: string;
  categoryId: string;
  provider: AiProvider;
  autoPublish: boolean;
};

export function SchedulerClient() {
  const { data, isLoading } = useCronJobs();
  const { data: categories } = useCategories();
  const createJob = useCreateCronJob();
  const updateJob = useUpdateCronJob();
  const deleteJob = useDeleteCronJob();
  const runNow = useRunCronNow();
  const maintenance = useRunMaintenance();

  const [editing, setEditing] = useState<CronJob | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CronJob | null>(null);

  const form = useForm<CronForm>({
    defaultValues: {
      name: "",
      description: "",
      cronExpression: "0 9 * * *",
      enabled: true,
      topic: "",
      categoryId: "",
      provider: "anthropic",
      autoPublish: true,
    },
  });
  const enabled = form.watch("enabled");
  const autoPublish = form.watch("autoPublish");

  function openCreate() {
    setEditing(null);
    form.reset({
      name: "",
      description: "",
      cronExpression: "0 9 * * *",
      enabled: true,
      topic: "",
      categoryId: "",
      provider: "anthropic",
      autoPublish: true,
    });
    setDialogOpen(true);
  }
  function openEdit(job: CronJob) {
    setEditing(job);
    form.reset({
      name: job.name,
      description: job.description ?? "",
      cronExpression: job.cronExpression,
      enabled: job.enabled,
      topic: job.config?.topic ?? job.config?.topics?.[0] ?? "",
      categoryId: job.config?.categoryId ?? "",
      provider: job.config?.provider ?? "anthropic",
      autoPublish: job.config?.autoPublish ?? true,
    });
    setDialogOpen(true);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const input = {
      name: values.name,
      cronExpression: values.cronExpression,
      enabled: values.enabled,
      ...(values.description ? { description: values.description } : {}),
      config: {
        topic: values.topic,
        categoryId: values.categoryId,
        provider: values.provider,
        autoPublish: values.autoPublish,
      },
    };
    try {
      if (editing) {
        await updateJob.mutateAsync({ id: editing.id, input });
        toast.success("Cron job updated");
      } else {
        await createJob.mutateAsync(input);
        toast.success("Cron job created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save");
    }
  });

  async function toggleEnabled(job: CronJob) {
    try {
      await updateJob.mutateAsync({ id: job.id, input: { enabled: !job.enabled } });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update");
    }
  }

  async function handleRunNow(job: CronJob) {
    try {
      await runNow.mutateAsync(job.id);
      toast.success(`“${job.name}” enqueued`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to run");
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deleteJob.mutateAsync(toDelete.id);
      toast.success("Cron job deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete");
    }
  }

  async function handleMaintenance(task: MaintenanceTask) {
    try {
      await maintenance.mutateAsync(task);
      toast.success(`Queued: ${task}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to queue task");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Scheduler"
        description="Automate recurring AI generation with cron jobs. Requires the backend worker."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> New Cron Job
          </Button>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Maintenance tasks</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            disabled={maintenance.isPending}
            onClick={() => handleMaintenance("publish-scheduled")}
          >
            <Wrench className="size-4" /> Publish scheduled now
          </Button>
          <Button
            variant="outline"
            disabled={maintenance.isPending}
            onClick={() => handleMaintenance("cleanup-drafts")}
          >
            <Wrench className="size-4" /> Cleanup old drafts
          </Button>
        </CardContent>
      </Card>

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="p-12 text-center text-[var(--color-muted-foreground)]">
            No cron jobs configured.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden w-32 sm:table-cell">Schedule</TableHead>
                <TableHead className="w-24">Enabled</TableHead>
                <TableHead className="hidden md:table-cell">Next run</TableHead>
                <TableHead className="hidden lg:table-cell">Last</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="font-medium">{job.name}</div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">
                      Runs: {job.runCount}
                    </div>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs sm:table-cell">
                    {job.cronExpression}
                  </TableCell>
                  <TableCell>
                    <Switch checked={job.enabled} onCheckedChange={() => toggleEnabled(job)} />
                  </TableCell>
                  <TableCell className="hidden text-sm text-[var(--color-muted-foreground)] md:table-cell">
                    {job.nextRunAt ? new Date(job.nextRunAt).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {job.lastRunStatus ? (
                      <span
                        className={
                          job.lastRunStatus === "SUCCESS"
                            ? "text-xs text-green-600"
                            : "text-xs text-red-500"
                        }
                      >
                        {job.lastRunStatus}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--color-muted-foreground)]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Run now"
                        disabled={runNow.isPending}
                        onClick={() => handleRunNow(job)}
                      >
                        <Play className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(job)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => setToDelete(job)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit cron job" : "New cron job"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input {...form.register("name", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea rows={2} {...form.register("description")} />
            </div>
            <div className="space-y-1.5">
              <Label>Cron expression</Label>
              <Input placeholder="0 9 * * *" className="font-mono" {...form.register("cronExpression", { required: true })} />
              <p className="text-xs text-[var(--color-muted-foreground)]">
                e.g. <code>0 9 * * *</code> = every day at 09:00.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Topic</Label>
              <Input placeholder="Weekly AI news roundup" {...form.register("topic", { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select {...form.register("categoryId", { required: true })}>
                  <option value="">Select…</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Provider</Label>
                <Select {...form.register("provider")}>
                  <option value="anthropic">Anthropic</option>
                  <option value="openai">OpenAI</option>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Enabled</Label>
              <Switch checked={enabled} onCheckedChange={(v) => form.setValue("enabled", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Auto-publish generated posts</Label>
              <Switch checked={autoPublish} onCheckedChange={(v) => form.setValue("autoPublish", v)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                {editing ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete cron job?"
        description={toDelete ? `“${toDelete.name}” will be removed.` : ""}
        confirmLabel="Delete"
        destructive
        loading={deleteJob.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
