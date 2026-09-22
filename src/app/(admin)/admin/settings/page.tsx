import type { Metadata } from "next";
import { SettingsClient } from "@/components/admin/SettingsClient";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return <SettingsClient />;
}
