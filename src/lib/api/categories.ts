import { apiClient, unwrap } from "./client";
import type {
  ApiSuccess,
  Category,
  CreateCategoryInput,
  CreateTagInput,
  Tag,
  UpdateCategoryInput,
  UpdateTagInput,
} from "@/types";

export const categoriesApi = {
  list: () => unwrap<Category[]>(apiClient.get<ApiSuccess<Category[]>>("/categories")),
  getBySlug: (slug: string) =>
    unwrap<Category>(apiClient.get<ApiSuccess<Category>>(`/categories/${slug}`)),
  create: (input: CreateCategoryInput) =>
    unwrap<Category>(apiClient.post<ApiSuccess<Category>>("/admin/categories", input)),
  update: (id: string, input: UpdateCategoryInput) =>
    unwrap<Category>(apiClient.patch<ApiSuccess<Category>>(`/admin/categories/${id}`, input)),
  remove: (id: string) =>
    apiClient.delete(`/admin/categories/${id}`).then(() => undefined),
};

export const tagsApi = {
  list: () => unwrap<Tag[]>(apiClient.get<ApiSuccess<Tag[]>>("/tags")),
  getBySlug: (slug: string) => unwrap<Tag>(apiClient.get<ApiSuccess<Tag>>(`/tags/${slug}`)),
  create: (input: CreateTagInput) =>
    unwrap<Tag>(apiClient.post<ApiSuccess<Tag>>("/admin/tags", input)),
  update: (id: string, input: UpdateTagInput) =>
    unwrap<Tag>(apiClient.patch<ApiSuccess<Tag>>(`/admin/tags/${id}`, input)),
  remove: (id: string) => apiClient.delete(`/admin/tags/${id}`).then(() => undefined),
};
