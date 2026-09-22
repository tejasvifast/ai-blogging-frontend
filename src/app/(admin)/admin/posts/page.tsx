import type { Metadata } from "next";
import { PostsListClient } from "@/components/admin/PostsListClient";

export const metadata: Metadata = { title: "Posts" };

export default function AdminPostsPage() {
  return <PostsListClient />;
}
