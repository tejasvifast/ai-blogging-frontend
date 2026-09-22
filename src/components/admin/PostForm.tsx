"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownContent } from "@/components/public/MarkdownContent";
import { useCategories, useTags } from "@/hooks/useCategories";
import { useCreatePost, useUpdatePost } from "@/hooks/usePosts";
import { ApiError, fieldErrors } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { CreatePostInput, Post, PostStatus, UpdatePostInput } from "@/types";

const STATUSES: PostStatus[] = ["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"];

const postFormSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    slug: z.string().optional(),
    excerpt: z.string().max(400, "Excerpt is too long").optional(),
    content: z.string().min(1, "Content is required"),
    coverImage: z.union([z.string().url("Must be a valid URL"), z.literal("")]).optional(),
    coverImageAlt: z.string().max(200).optional(),
    metaTitle: z.string().max(70, "Keep meta title under 70 chars").optional(),
    metaDescription: z.string().max(200, "Keep meta description under 200 chars").optional(),
    keywords: z.string().optional(),
    categoryId: z.string().min(1, "Please choose a category"),
    status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
    isFeatured: z.boolean(),
    scheduledFor: z.string().optional(),
  })
  .refine((v) => v.status !== "SCHEDULED" || Boolean(v.scheduledFor), {
    message: "A future date is required to schedule a post",
    path: ["scheduledFor"],
  });

type PostFormValues = z.infer<typeof postFormSchema>;

/** ISO string → value for <input type="datetime-local">. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 16);
}

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const isEdit = Boolean(post);
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const [tagIds, setTagIds] = useState<string[]>(post?.tags.map((t) => t.id) ?? []);
  const [tab, setTab] = useState<"write" | "preview">("write");

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      content: post?.content ?? "",
      coverImage: post?.coverImage ?? "",
      coverImageAlt: post?.coverImageAlt ?? "",
      metaTitle: post?.metaTitle ?? "",
      metaDescription: post?.metaDescription ?? "",
      keywords: post?.keywords?.join(", ") ?? "",
      categoryId: post?.categoryId ?? "",
      status: post?.status ?? "DRAFT",
      isFeatured: post?.isFeatured ?? false,
      scheduledFor: toLocalInput(post?.scheduledFor ?? null),
    },
  });

  const content = form.watch("content");
  const status = form.watch("status");
  const isFeatured = form.watch("isFeatured");

  function toggleTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const keywords = (values.keywords ?? "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const payload: CreatePostInput = {
      title: values.title,
      content: values.content,
      categoryId: values.categoryId,
      status: values.status,
      isFeatured: values.isFeatured,
      tagIds,
      ...(values.slug ? { slug: values.slug } : {}),
      ...(values.excerpt ? { excerpt: values.excerpt } : {}),
      ...(values.coverImage ? { coverImage: values.coverImage } : {}),
      ...(values.coverImageAlt ? { coverImageAlt: values.coverImageAlt } : {}),
      ...(values.metaTitle ? { metaTitle: values.metaTitle } : {}),
      ...(values.metaDescription ? { metaDescription: values.metaDescription } : {}),
      ...(keywords.length ? { keywords } : {}),
      ...(values.status === "SCHEDULED" && values.scheduledFor
        ? { scheduledFor: new Date(values.scheduledFor).toISOString() }
        : {}),
    };

    try {
      if (isEdit && post) {
        await updatePost.mutateAsync({ id: post.id, input: payload as UpdatePostInput });
        toast.success("Post updated");
      } else {
        await createPost.mutateAsync(payload);
        toast.success("Post created");
      }
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        const fields = fieldErrors(err);
        (Object.keys(fields) as Array<keyof PostFormValues>).forEach((key) => {
          const message = fields[key as string]?.[0];
          if (message) form.setError(key, { message });
        });
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  });

  const isBusy = form.formState.isSubmitting;
  const errs = form.formState.errors;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="An engaging headline" {...form.register("title")} />
              {errs.title && <p className="text-xs text-red-500">{errs.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug <span className="text-[var(--color-muted-foreground)]">(optional — auto from title)</span></Label>
              <Input id="slug" placeholder="my-post-slug" {...form.register("slug")} />
              {errs.slug && <p className="text-xs text-red-500">{errs.slug.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" rows={2} placeholder="A short summary shown in listings" {...form.register("excerpt")} />
              {errs.excerpt && <p className="text-xs text-red-500">{errs.excerpt.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Content editor with write/preview tabs */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Content <span className="text-sm font-normal text-[var(--color-muted-foreground)]">(Markdown)</span></CardTitle>
            <div className="inline-flex rounded-md border border-[var(--color-border)] p-0.5">
              <button
                type="button"
                onClick={() => setTab("write")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium",
                  tab === "write" ? "bg-[var(--color-muted)]" : "text-[var(--color-muted-foreground)]",
                )}
              >
                <Pencil className="size-3.5" /> Write
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium",
                  tab === "preview" ? "bg-[var(--color-muted)]" : "text-[var(--color-muted-foreground)]",
                )}
              >
                <Eye className="size-3.5" /> Preview
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {tab === "write" ? (
              <Textarea
                className="min-h-[420px] font-mono text-sm"
                placeholder="# Write your article in Markdown..."
                {...form.register("content")}
              />
            ) : (
              <div className="min-h-[420px] rounded-md border border-[var(--color-border)] p-4">
                {content?.trim() ? (
                  <MarkdownContent content={content} />
                ) : (
                  <p className="text-sm text-[var(--color-muted-foreground)]">Nothing to preview yet.</p>
                )}
              </div>
            )}
            {errs.content && <p className="mt-1.5 text-xs text-red-500">{errs.content.message}</p>}
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="metaTitle">Meta title</Label>
              <Input id="metaTitle" {...form.register("metaTitle")} />
              {errs.metaTitle && <p className="text-xs text-red-500">{errs.metaTitle.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="metaDescription">Meta description</Label>
              <Textarea id="metaDescription" rows={2} {...form.register("metaDescription")} />
              {errs.metaDescription && <p className="text-xs text-red-500">{errs.metaDescription.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="keywords">Keywords <span className="text-[var(--color-muted-foreground)]">(comma separated)</span></Label>
              <Input id="keywords" placeholder="ai, blogging, seo" {...form.register("keywords")} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar column */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...form.register("status")}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            </div>

            {status === "SCHEDULED" && (
              <div className="space-y-1.5">
                <Label htmlFor="scheduledFor">Publish at</Label>
                <Input id="scheduledFor" type="datetime-local" {...form.register("scheduledFor")} />
                {errs.scheduledFor && <p className="text-xs text-red-500">{errs.scheduledFor.message}</p>}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="isFeatured">Featured</Label>
              <Switch
                id="isFeatured"
                checked={isFeatured}
                onCheckedChange={(v) => form.setValue("isFeatured", v)}
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" disabled={isBusy}>
                {isBusy && <Loader2 className="animate-spin" />}
                {isEdit ? "Save changes" : "Create post"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/posts")} disabled={isBusy}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Select {...form.register("categoryId")}>
              <option value="">Select a category…</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {errs.categoryId && <p className="mt-1.5 text-xs text-red-500">{errs.categoryId.message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {tags && tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const active = tagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
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
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)]">No tags yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cover image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="coverImage">Image URL</Label>
              <Input id="coverImage" placeholder="https://…" {...form.register("coverImage")} />
              {errs.coverImage && <p className="text-xs text-red-500">{errs.coverImage.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coverImageAlt">Alt text</Label>
              <Input id="coverImageAlt" {...form.register("coverImageAlt")} />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
