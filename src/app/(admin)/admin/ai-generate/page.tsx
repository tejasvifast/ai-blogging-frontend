import type { Metadata } from "next";
import { AiGenerateClient } from "@/components/admin/AiGenerateClient";

export const metadata: Metadata = { title: "AI Generate" };

export default function AiGeneratePage() {
  return <AiGenerateClient />;
}
