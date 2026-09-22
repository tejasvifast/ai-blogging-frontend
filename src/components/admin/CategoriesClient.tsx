"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  useCategories,
  useTags,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from "@/hooks/useCategories";
import { ApiError, fieldErrors } from "@/lib/api/errors";
import type { Category, Tag } from "@/types";

type CategoryForm = { name: string; slug?: string; description?: string; icon?: string; color?: string };
type TagForm = { name: string; slug?: string };

export function CategoriesClient() {
  return (
    <div>
      <AdminPageHeader title="Categories & Tags" description="Organize your content taxonomy." />
      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <CategoriesPanel />
        </TabsContent>
        <TabsContent value="tags">
          <TagsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CategoriesPanel() {
  const { data, isLoading } = useCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [editing, setEditing] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const form = useForm<CategoryForm>({ defaultValues: { name: "", slug: "", description: "", icon: "", color: "" } });

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", slug: "", description: "", icon: "", color: "" });
    setDialogOpen(true);
  }
  function openEdit(c: Category) {
    setEditing(c);
    form.reset({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      icon: c.icon ?? "",
      color: c.color ?? "",
    });
    setDialogOpen(true);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const input = {
      name: values.name,
      ...(values.slug ? { slug: values.slug } : {}),
      ...(values.description ? { description: values.description } : {}),
      ...(values.icon ? { icon: values.icon } : {}),
      ...(values.color ? { color: values.color } : {}),
    };
    try {
      if (editing) {
        await updateCat.mutateAsync({ id: editing.id, input });
        toast.success("Category updated");
      } else {
        await createCat.mutateAsync(input);
        toast.success("Category created");
      }
      setDialogOpen(false);
    } catch (err) {
      handleFormError(err, form);
    }
  });

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deleteCat.mutateAsync(toDelete.id);
      toast.success("Category deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete");
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" /> New Category
        </Button>
      </div>
      <Card>
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="p-12 text-center text-[var(--color-muted-foreground)]">No categories yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Slug</TableHead>
                <TableHead className="w-20">Posts</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="font-medium">
                      {c.icon ? `${c.icon} ` : ""}
                      {c.name}
                    </span>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-[var(--color-muted-foreground)] sm:table-cell">
                    {c.slug}
                  </TableCell>
                  <TableCell>{c._count?.posts ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(c)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => setToDelete(c)}
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
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Name" error={form.formState.errors.name?.message}>
              <Input {...form.register("name", { required: "Name is required" })} />
            </Field>
            <Field label="Slug (optional)">
              <Input placeholder="auto from name" {...form.register("slug")} />
            </Field>
            <Field label="Description (optional)">
              <Textarea rows={2} {...form.register("description")} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Icon (emoji)">
                <Input placeholder="🤖" {...form.register("icon")} />
              </Field>
              <Field label="Color (hex)">
                <Input placeholder="#4f46e5" {...form.register("color")} />
              </Field>
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
        title="Delete category?"
        description={toDelete ? `“${toDelete.name}” will be deleted. Posts must not reference it.` : ""}
        confirmLabel="Delete"
        destructive
        loading={deleteCat.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}

function TagsPanel() {
  const { data, isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [editing, setEditing] = useState<Tag | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Tag | null>(null);
  const form = useForm<TagForm>({ defaultValues: { name: "", slug: "" } });

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", slug: "" });
    setDialogOpen(true);
  }
  function openEdit(t: Tag) {
    setEditing(t);
    form.reset({ name: t.name, slug: t.slug });
    setDialogOpen(true);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const input = { name: values.name, ...(values.slug ? { slug: values.slug } : {}) };
    try {
      if (editing) {
        await updateTag.mutateAsync({ id: editing.id, input });
        toast.success("Tag updated");
      } else {
        await createTag.mutateAsync(input);
        toast.success("Tag created");
      }
      setDialogOpen(false);
    } catch (err) {
      handleFormError(err, form);
    }
  });

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deleteTag.mutateAsync(toDelete.id);
      toast.success("Tag deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete");
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" /> New Tag
        </Button>
      </div>
      <Card>
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="p-12 text-center text-[var(--color-muted-foreground)]">No tags yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Slug</TableHead>
                <TableHead className="w-20">Posts</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="hidden font-mono text-xs text-[var(--color-muted-foreground)] sm:table-cell">
                    {t.slug}
                  </TableCell>
                  <TableCell>{t._count?.posts ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(t)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => setToDelete(t)}
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
            <DialogTitle>{editing ? "Edit tag" : "New tag"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Name" error={form.formState.errors.name?.message}>
              <Input {...form.register("name", { required: "Name is required" })} />
            </Field>
            <Field label="Slug (optional)">
              <Input placeholder="auto from name" {...form.register("slug")} />
            </Field>
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
        title="Delete tag?"
        description={toDelete ? `“${toDelete.name}” will be deleted.` : ""}
        confirmLabel="Delete"
        destructive
        loading={deleteTag.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleFormError(err: unknown, form: any) {
  if (err instanceof ApiError) {
    const fields = fieldErrors(err);
    Object.keys(fields).forEach((key) => {
      const message = fields[key]?.[0];
      if (message) form.setError(key, { message });
    });
    toast.error(err.message);
  } else {
    toast.error("Something went wrong.");
  }
}
