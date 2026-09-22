import type { Metadata } from "next";
import { DashboardClient } from "@/components/admin/DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <DashboardClient />;
}
