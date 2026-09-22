import type { Metadata } from "next";
import { PostEditClient } from "@/components/admin/PostEditClient";

export const metadata: Metadata = { title: "Edit Post" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostEditClient id={id} />;
}
