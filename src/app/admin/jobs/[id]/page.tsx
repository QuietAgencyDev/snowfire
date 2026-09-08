import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/bookings/status-pill";
import { AssignForm } from "@/components/jobs/assign-form";
import { PhotoCompare } from "@/components/properties/photo-compare";
import { getJobById, listCrewMembers, listJobPhotos } from "@/lib/jobs/queries";
import { listJobMaterials } from "@/lib/jobs/materials";
import { jobStatusLabel } from "@/lib/jobs/transitions";

export const metadata: Metadata = {
  title: "Job",
};

export default async function AdminJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, crew, photos, materials] = await Promise.all([
    getJobById(id),
    listCrewMembers(),
    listJobPhotos(id),
    listJobMaterials(id),
  ]);

  if (!job) {
    notFound();
  }

  const before = photos.find((photo) => photo.photo_type === "BEFORE")?.signedUrl;
  const after = photos.find((photo) => photo.photo_type === "AFTER")?.signedUrl;
  const canAssign = job.status === "UNASSIGNED" || job.status === "ASSIGNED";

  return (
    <div className="grid gap-5">
      <Link href="/admin/jobs" className="font-black text-sky-800 underline">
        Back to jobs
      </Link>
      <article className="rounded-3xl border-2 border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black text-slate-950">{job.service_name}</h1>
            <p className="mt-2 text-lg font-bold text-sky-800">{job.customer_name}</p>
            <p className="mt-1 font-bold text-slate-800">{job.property_name}</p>
            <p className="font-bold text-slate-700">{job.property_address}</p>
          </div>
          <StatusPill label={jobStatusLabel(job.status)} tone="ice" />
        </div>
        <dl className="mt-6 grid gap-3 font-bold text-slate-800">
          <div>
            <dt className="font-black text-slate-500">Crew</dt>
            <dd>{job.crew_name || "Unassigned"}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Hazards</dt>
            <dd>{job.hazards || "None noted"}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Instructions</dt>
            <dd>{job.special_instructions || job.customer_notes || "None"}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Proof</dt>
            <dd>
              {photos.filter((photo) => photo.photo_type === "BEFORE").length} before ·{" "}
              {photos.filter((photo) => photo.photo_type === "AFTER").length} after
            </dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Materials</dt>
            <dd>
              {materials.length === 0
                ? "None logged"
                : materials
                    .map((material) => `${material.quantity} ${material.unit} ${material.material_name}`)
                    .join(" · ")}
            </dd>
          </div>
        </dl>
        {canAssign ? (
          <div className="mt-6">
            <AssignForm jobId={job.id} crew={crew} assignedCrewId={job.assigned_crew_id} />
          </div>
        ) : null}
        <Link
          href={`/admin/jobs/${job.id}/report`}
          className="mt-6 inline-flex h-12 items-center font-black text-sky-800 underline"
        >
          Printable job file
        </Link>
      </article>
      {before && after ? (
        <PhotoCompare
          beforeUrl={before}
          afterUrl={after}
          beforeLabel="Before"
          afterLabel="After"
          detail="Crew proof from this job."
        />
      ) : null}
    </div>
  );
}
