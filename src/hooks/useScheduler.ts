"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { schedulerApi } from "@/lib/api/scheduler";
import { queryKeys } from "@/lib/query-keys";
import type { CreateCronJobInput, MaintenanceTask, UpdateCronJobInput } from "@/types";

export function useCronJobs() {
  return useQuery({
    queryKey: queryKeys.scheduler.all,
    queryFn: () => schedulerApi.list(),
  });
}

export function useCronJob(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.scheduler.byId(id),
    queryFn: () => schedulerApi.get(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateCronJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCronJobInput) => schedulerApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.scheduler.all }),
  });
}

export function useUpdateCronJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCronJobInput }) =>
      schedulerApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.scheduler.all }),
  });
}

export function useDeleteCronJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulerApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.scheduler.all }),
  });
}

export function useRunCronNow() {
  return useMutation({
    mutationFn: (id: string) => schedulerApi.runNow(id),
  });
}

export function useRunMaintenance() {
  return useMutation({
    mutationFn: (task: MaintenanceTask) => schedulerApi.runMaintenance(task),
  });
}
