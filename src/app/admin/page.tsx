import type { Metadata } from "next";
import { ComingSoon } from "@/components/brand/coming-soon";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Operations</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Live job counts, revenue, and dispatch will land here after booking
          and crew workflows exist. Counts are omitted until they are real.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ComingSoon
          title="Today’s jobs"
          description="No operational numbers yet. Phase 4 will populate this from jobs."
        />
        <ComingSoon
          title="Customers and crew"
          description="Admin directories and role management are not built yet."
        />
      </div>
    </div>
  );
}
