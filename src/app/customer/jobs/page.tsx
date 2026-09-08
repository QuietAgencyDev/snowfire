import type { Metadata } from "next";
import { JobCard } from "@/components/jobs/job-card";
import { getSessionProfile } from "@/lib/auth/session";
import { listCustomerJobs } from "@/lib/jobs/queries";

export const metadata: Metadata = {
  title: "Jobs",
};

export default async function CustomerJobsPage() {
  const profile = await getSessionProfile();
  const jobs = profile ? await listCustomerJobs(profile.id) : [];

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
          History
        </p>
        <h1 className="mt-1 text-4xl font-black text-slate-950">Your jobs</h1>
        <p className="mt-2 font-bold text-slate-700">
          Work that was dispatched to your property. Empty means nothing has been assigned yet.
        </p>
      </div>
      {jobs.length === 0 ? (
        <p className="font-bold text-slate-600">No jobs on this account yet.</p>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} href={`/customer/jobs/${job.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
