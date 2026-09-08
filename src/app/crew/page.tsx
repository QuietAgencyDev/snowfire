import type { Metadata } from "next";
import { JobCard } from "@/components/jobs/job-card";
import { getSessionProfile } from "@/lib/auth/session";
import { listAssignedCrewJobs } from "@/lib/jobs/queries";

export const metadata: Metadata = {
  title: "Crew",
};

export default async function CrewDashboardPage() {
  const profile = await getSessionProfile();
  const jobs = profile ? await listAssignedCrewJobs(profile.id) : [];

  return (
    <div className="grid gap-5">
      <section className="rounded-3xl bg-gradient-to-r from-slate-950 to-sky-800 px-5 py-7 text-white">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">
          Today’s route
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Your jobs</h1>
        <p className="mt-3 text-lg font-bold text-white/90">
          Only jobs assigned to you. This screen will not invent a stop.
        </p>
      </section>
      {jobs.length === 0 ? (
        <p className="font-bold text-slate-700">
          Nothing on your route yet. Operations assigns a job from an approved visit.
        </p>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} href={`/crew/jobs/${job.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
