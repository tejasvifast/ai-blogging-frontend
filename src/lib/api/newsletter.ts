import { apiClient, unwrap } from "./client";
import type { ApiSuccess, NewsletterSubscribeResponse } from "@/types";

export const newsletterApi = {
  subscribe: (email: string) =>
    unwrap<NewsletterSubscribeResponse>(
      apiClient.post<ApiSuccess<NewsletterSubscribeResponse>>("/newsletter/subscribe", {
        email,
      }),
    ),
};
