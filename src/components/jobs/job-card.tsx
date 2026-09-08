import Link from "next/link";
import { StatusPill } from "@/components/bookings/status-pill";
import { jobStatusLabel, type JobStatus } from "@/lib/jobs/transitions";
import type { JobView } from "@/types/database";

function tone(status: JobStatus) {
  if (status === "COMPLETED") return "forest" as const;
  if (status === "IN_PROGRESS" || status === "ARRIVED" || status === "EN_ROUTE") {
    return "ice" as const;
  }
  if (status === "ASSIGNED") return "fire" as const;
  return "slate" as const;
}

type JobCardProps = {
  job: JobView;
  href: string;
};

export function JobCard({ job, href }: JobCardProps) {
  return (
    <Link href={href} className="rounded-3xl border-2 border-slate-200 bg-white p-4 hover:border-sky-400">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-black text-slate-950">{job.service_name}</p>
          <p className="font-bold text-sky-800">{job.property_name}</p>
          <p className="font-bold text-slate-600">{job.property_address}</p>
          {job.crew_name ? (
            <p className="mt-1 font-bold text-slate-700">Crew: {job.crew_name}</p>
          ) : null}
        </div>
        <StatusPill label={jobStatusLabel(job.status)} tone={tone(job.status)} />
      </div>
    </Link>
  );
}
