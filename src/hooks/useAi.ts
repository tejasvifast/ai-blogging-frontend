"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { aiApi } from "@/lib/api/ai";
import { queryKeys } from "@/lib/query-keys";
import type { GenerateArticleInput, GenerationLogListParams } from "@/types";

/** Enqueue an AI article generation job (returns { jobId }). */
export function useGenerateArticle() {
  return useMutation({
    mutationFn: (input: GenerateArticleInput) => aiApi.generate(input),
  });
}

/**
 * Poll a generation job until it reaches a terminal state. Pass `jobId = null`
 * (or "") to disable polling.
 */
export function useAiJob(jobId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.ai.job(jobId ?? ""),
    queryFn: () => aiApi.jobStatus(jobId as string),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      return state === "completed" || state === "failed" ? false : 1500;
    },
  });
}

/** Generation history / cost logs. */
export function useGenerationLogs(params?: GenerationLogListParams) {
  return useQuery({
    queryKey: queryKeys.ai.logs(params),
    queryFn: () => aiApi.logs(params),
  });
}
