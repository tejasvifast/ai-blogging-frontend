import { apiClient, unwrap, unwrapList } from "./client";
import type {
  AiJobStatus,
  ApiSuccess,
  EnqueuedJob,
  GenerateArticleInput,
  GenerationLog,
  GenerationLogListParams,
} from "@/types";

/**
 * AI generation is an async job-queue model (NOT SSE):
 *   1. POST /admin/ai/generate → 202 { jobId }
 *   2. poll GET /admin/ai/jobs/:id until state is completed | failed
 */
export const aiApi = {
  generate: (input: GenerateArticleInput) =>
    unwrap<EnqueuedJob>(apiClient.post<ApiSuccess<EnqueuedJob>>("/admin/ai/generate", input)),

  jobStatus: (jobId: string) =>
    unwrap<AiJobStatus>(apiClient.get<ApiSuccess<AiJobStatus>>(`/admin/ai/jobs/${jobId}`)),

  logs: (params?: GenerationLogListParams) =>
    unwrapList<GenerationLog>(
      apiClient.get<ApiSuccess<GenerationLog[]>>("/admin/ai/logs", { params }),
    ),
};
