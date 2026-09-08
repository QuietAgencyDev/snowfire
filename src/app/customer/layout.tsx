import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionProfile } from "@/lib/auth/session";
import { countUnreadNotifications } from "@/lib/notifications/queries";

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

  const unreadCount = await countUnreadNotifications(profile.id);

  return (
    <AppShell
      role={profile.role}
      firstName={profile.first_name}
      lastName={profile.last_name}
      email={profile.email}
      title="Customer"
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
