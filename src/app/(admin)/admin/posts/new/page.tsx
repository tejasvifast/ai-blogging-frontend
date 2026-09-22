import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostForm } from "@/components/admin/PostForm";

export const metadata: Metadata = { title: "New Post" };

export default function NewPostPage() {
  return (
    <div>
      <AdminPageHeader title="New Post" description="Write and publish a new article." />
      <PostForm />
    </div>
  );
}
