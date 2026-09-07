import type { Metadata } from "next";
import { ComingSoon } from "@/components/brand/coming-soon";
import { getSessionProfile } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Customer",
};

export default async function CustomerDashboardPage() {
  const profile = await getSessionProfile();
  const name = profile?.first_name || "there";

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Good to see you, {name}.
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          This is your Snow & Fire home. Properties, booking, and service
          history will appear here once those phases are built. Nothing on this
          page is simulated.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ComingSoon
          title="Properties"
          description="Add driveways, hazards, and snow-storage notes. Phase 2."
        />
        <ComingSoon
          title="Book snow or order firewood"
          description="Booking and firewood checkout are not live yet."
        />
      </div>
    </div>
  );
}
