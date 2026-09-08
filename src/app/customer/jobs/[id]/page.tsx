import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/bookings/status-pill";
import { PhotoCompare } from "@/components/properties/photo-compare";
import { getSessionProfile } from "@/lib/auth/session";
import { getJobById, listJobPhotos } from "@/lib/jobs/queries";
import { jobStatusLabel } from "@/lib/jobs/transitions";

export const metadata: Metadata = {
  title: "Job",
};

export default async function CustomerJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getSessionProfile();

  if (!profile) {
    notFound();
  }

  const job = await getJobById(id);

  if (!job || job.customer_id !== profile.id) {
    notFound();
  }

  const photos = await listJobPhotos(job.id);
  const before = photos.find((photo) => photo.photo_type === "BEFORE")?.signedUrl;
  const after = photos.find((photo) => photo.photo_type === "AFTER")?.signedUrl;

  return (
    <div className="grid gap-5">
      <Link href="/customer/jobs" className="font-black text-sky-800 underline">
        Back to jobs
      </Link>
      <article className="rounded-3xl border-2 border-sky-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black text-slate-950">{job.service_name}</h1>
            <p className="mt-2 text-lg font-bold text-sky-800">{job.property_name}</p>
            <p className="font-bold text-slate-700">{job.property_address}</p>
          </div>
          <StatusPill
            label={jobStatusLabel(job.status)}
            tone={job.status === "COMPLETED" ? "forest" : "ice"}
          />
        </div>
        <p className="mt-6 font-bold text-slate-700">
          {job.crew_name ? `Crew: ${job.crew_name}` : "Waiting for a crew assignment."}
        </p>
        {job.crew_notes ? (
          <p className="mt-2 font-bold text-slate-700">Crew notes: {job.crew_notes}</p>
        ) : null}
        {job.status === "COMPLETED" ? (
          <Link
            href={`/customer/jobs/${job.id}/report`}
            className="mt-4 inline-flex h-12 items-center font-black text-sky-800 underline"
          >
            Printable service report
          </Link>
        ) : null}
      </article>
      {before && after ? (
        <PhotoCompare
          beforeUrl={before}
          afterUrl={after}
          beforeLabel="Before"
          afterLabel="After"
          detail="Proof from the completed visit."
        />
      ) : (
        <p className="font-bold text-slate-600">
          Proof appears here after the crew saves before and after photos.
        </p>
      )}
    </div>
  );
}
