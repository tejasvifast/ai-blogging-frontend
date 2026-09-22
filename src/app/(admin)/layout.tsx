import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Middleware already gates /admin to logged-in users; this adds the role check
  // and is a safe fallback if middleware is bypassed.
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <AdminSidebar user={session.user} />
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
