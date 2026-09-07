import type { Metadata } from "next";
import { ComingSoon } from "@/components/brand/coming-soon";

export const metadata: Metadata = {
  title: "Crew",
};

export default function CrewDashboardPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Today’s route</h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Assigned jobs will show here with large Arrive / Before / After
          controls. The field workflow is Phase 4.
        </p>
      </div>
      <ComingSoon
        title="Job execution"
        description="No jobs are listed because dispatch is not built yet. This screen will not invent a route."
      />
    </div>
  );
}
