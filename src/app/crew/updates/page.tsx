import type { Metadata } from "next";
import { UpdatesList } from "@/components/updates/updates-list";
import { getSessionProfile } from "@/lib/auth/session";
import { listMyNotifications } from "@/lib/notifications/queries";

export const metadata: Metadata = {
  title: "Updates",
};

export default async function CrewUpdatesPage() {
  const profile = await getSessionProfile();
  const items = profile ? await listMyNotifications(profile.id) : [];

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Inbox</p>
        <h1 className="mt-1 text-4xl font-black text-slate-950">Updates</h1>
        <p className="mt-2 font-bold text-slate-700">
          Assignments for you. Empty means nothing has been put on your route.
        </p>
      </div>
      <UpdatesList items={items} role={profile?.role ?? "CREW"} />
    </div>
  );
}
