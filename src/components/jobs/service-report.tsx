import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PrintButton } from "@/components/command/print-button";
import { PhotoCompare } from "@/components/properties/photo-compare";
import { jobStatusLabel } from "@/lib/jobs/transitions";
import type { JobMaterial, JobPhotoView, JobView } from "@/types/database";

function formatWhen(iso: string | null) {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type ServiceReportProps = {
  job: JobView;
  photos: JobPhotoView[];
  materials: JobMaterial[];
  backHref: string;
  backLabel: string;
  showCost?: boolean;
};

export function ServiceReport({
  job,
  photos,
  materials,
  backHref,
  backLabel,
  showCost = false,
}: ServiceReportProps) {
  const before = photos.find((photo) => photo.photo_type === "BEFORE")?.signedUrl;
  const after = photos.find((photo) => photo.photo_type === "AFTER")?.signedUrl;
  const completed = job.status === "COMPLETED";

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={backHref} className="font-black text-sky-800 underline">
          {backLabel}
        </Link>
        <PrintButton />
      </div>
      <article className="rounded-3xl border-2 border-slate-900 bg-white p-6 print:border-0">
        <div className="flex items-start justify-between gap-4 border-b-2 border-slate-200 pb-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
            SnowFire.ca · {completed ? "service report" : "job file"}
          </p>
          <BrandLogo variant="mascot" size="sm" className="h-20 w-auto shrink-0" />
        </div>
        <h1 className="mt-4 text-4xl font-black text-slate-950">{job.service_name}</h1>
        <p className="mt-2 text-xl font-bold text-sky-800">{job.property_name}</p>
        <p className="font-bold text-slate-700">{job.property_address}</p>
        <p className="mt-2 font-black text-slate-800">
          {job.customer_name}
          {job.crew_name ? ` · Crew: ${job.crew_name}` : ""}
        </p>
        <p className="mt-1 font-bold text-slate-600">{jobStatusLabel(job.status)}</p>

        <dl className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-sky-50 p-4">
            <dt className="font-black text-sky-900">Arrived</dt>
            <dd className="mt-1 font-bold">{formatWhen(job.arrival_time)}</dd>
          </div>
          <div className="rounded-2xl bg-orange-50 p-4">
            <dt className="font-black text-orange-900">Completed</dt>
            <dd className="mt-1 font-bold">{formatWhen(job.completion_time)}</dd>
          </div>
        </dl>

        <section className="mt-6 rounded-2xl bg-slate-50 p-4">
          <h2 className="font-black text-slate-900">Site notes</h2>
          <p className="mt-1 font-bold">Surface: {job.driveway_type || "Not set"}</p>
          <p className="mt-1 font-bold">Snow pile: {job.snow_storage_location || "Not set"}</p>
          <p className="mt-1 font-bold">Hazards: {job.hazards || "None noted"}</p>
          <p className="mt-1 font-bold">
            Instructions: {job.special_instructions || job.customer_notes || "None"}
          </p>
          {job.crew_notes ? (
            <p className="mt-1 font-bold">Crew notes: {job.crew_notes}</p>
          ) : null}
        </section>

        <section className="mt-6 rounded-2xl bg-amber-50 p-4">
          <h2 className="font-black text-amber-900">Materials</h2>
          {materials.length === 0 ? (
            <p className="mt-1 font-bold">None logged on this visit.</p>
          ) : (
            <ul className="mt-2 grid gap-1 font-bold">
              {materials.map((material) => (
                <li key={material.id}>
                  {material.quantity} {material.unit} {material.material_name}
                  {showCost && material.cost > 0 ? ` · ${material.cost}¢ internal` : ""}
                </li>
              ))}
            </ul>
          )}
        </section>

        {!completed ? (
          <p className="mt-6 font-bold text-slate-600">
            This is not a completed service report until the crew finishes and saves proof.
          </p>
        ) : null}
      </article>
      {before && after ? (
        <PhotoCompare
          beforeUrl={before}
          afterUrl={after}
          beforeLabel="Before"
          afterLabel="After"
          detail="Proof from this visit."
        />
      ) : (
        <p className="font-bold text-slate-600 print:hidden">
          Before and after photos appear here after the crew saves them.
        </p>
      )}
    </div>
  );
}
