import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getSessionProfile();

  if (!profile || profile.role !== "CUSTOMER") {
    redirect("/login");
  }

  return (
    <AppShell role={profile.role} firstName={profile.first_name} title="Customer">
      {children}
    </AppShell>
  );
}
