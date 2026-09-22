import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SchedulerClient } from "@/components/admin/SchedulerClient";

export const metadata: Metadata = { title: "Scheduler" };

export default async function SchedulerPage() {
  // Scheduler/cron routes are ADMIN-only on the backend; gate the page to match
  // (the sidebar already hides it from EDITORs — this is defense-in-depth).
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/dashboard");

  return <SchedulerClient />;
}
