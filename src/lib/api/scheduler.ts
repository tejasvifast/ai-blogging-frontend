import { apiClient, unwrap } from "./client";
import type {
  ApiSuccess,
  CreateCronJobInput,
  CronJob,
  MaintenanceTask,
  UpdateCronJobInput,
} from "@/types";

/** Scheduler / cron endpoints — ADMIN only. "Run now" is async (202 + jobId). */
export const schedulerApi = {
  list: () =>
    unwrap<CronJob[]>(apiClient.get<ApiSuccess<CronJob[]>>("/admin/scheduler/cron-jobs")),

  get: (id: string) =>
    unwrap<CronJob>(apiClient.get<ApiSuccess<CronJob>>(`/admin/scheduler/cron-jobs/${id}`)),

  create: (input: CreateCronJobInput) =>
    unwrap<CronJob>(apiClient.post<ApiSuccess<CronJob>>("/admin/scheduler/cron-jobs", input)),

  update: (id: string, input: UpdateCronJobInput) =>
    unwrap<CronJob>(
      apiClient.patch<ApiSuccess<CronJob>>(`/admin/scheduler/cron-jobs/${id}`, input),
    ),

  remove: (id: string) =>
    apiClient.delete(`/admin/scheduler/cron-jobs/${id}`).then(() => undefined),

  runNow: (id: string) =>
    unwrap<{ jobId: string }>(
      apiClient.post<ApiSuccess<{ jobId: string }>>(`/admin/scheduler/cron-jobs/${id}/run`),
    ),

  runMaintenance: (task: MaintenanceTask) =>
    unwrap<{ jobId: string }>(
      apiClient.post<ApiSuccess<{ jobId: string }>>(`/admin/scheduler/maintenance/${task}/run`),
    ),
};
