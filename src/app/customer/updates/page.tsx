import type { Metadata } from "next";
import { UpdatesList } from "@/components/updates/updates-list";
import { getSessionProfile } from "@/lib/auth/session";
import { listMyNotifications } from "@/lib/notifications/queries";

export const metadata: Metadata = {
  title: "Updates",
};

export default async function CustomerUpdatesPage() {
  const profile = await getSessionProfile();
  const items = profile ? await listMyNotifications(profile.id) : [];

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Inbox</p>
        <h1 className="mt-1 text-4xl font-black text-slate-950">Updates</h1>
        <p className="mt-2 font-bold text-slate-700">
          Real booking and job events for this account. We will not invent a visit here.
        </p>
      </div>
      <UpdatesList items={items} role={profile?.role ?? "CUSTOMER"} />
    </div>
  );
}
