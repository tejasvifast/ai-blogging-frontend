import type { Metadata } from "next";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export const metadata: Metadata = { title: "Categories & Tags" };

export default function CategoriesPage() {
  return <CategoriesClient />;
}
