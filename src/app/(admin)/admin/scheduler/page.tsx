import type { Metadata } from "next";
import { SchedulerClient } from "@/components/admin/SchedulerClient";

export const metadata: Metadata = { title: "Scheduler" };

export default function SchedulerPage() {
  return <SchedulerClient />;
}
