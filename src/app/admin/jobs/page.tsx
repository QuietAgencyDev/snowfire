import type { Metadata } from "next";
import Link from "next/link";
import { JobCard } from "@/components/jobs/job-card";
import { listOpenJobs } from "@/lib/jobs/queries";

export const metadata: Metadata = {
  title: "Jobs",
};

export default async function AdminJobsPage() {
  const jobs = await listOpenJobs();

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
          Operations
        </p>
        <h1 className="mt-1 text-4xl font-black text-slate-950">Open jobs</h1>
        <p className="mt-2 font-bold text-slate-700">
          Only visits that were approved and dispatched. This list does not invent a route.
        </p>
      </div>
      {jobs.length === 0 ? (
        <p className="font-bold text-slate-600">
          No open jobs. Approve a visit, then dispatch it.{" "}
          <Link href="/admin" className="text-sky-800 underline">
            Inbox
          </Link>
        </p>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} href={`/admin/jobs/${job.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
