import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/bookings/status-pill";
import { CrewJobControls } from "@/components/jobs/crew-job-controls";
import { MaterialsForm } from "@/components/jobs/materials-form";
import { PhotoCompare } from "@/components/properties/photo-compare";
import { getSessionProfile } from "@/lib/auth/session";
import { listJobMaterials } from "@/lib/jobs/materials";
import { getJobById, listJobPhotos } from "@/lib/jobs/queries";
import { crewCanOpenJob, jobStatusLabel } from "@/lib/jobs/transitions";
import { googleMapsDirectionsUrl, googleMapsQuery } from "@/lib/maps/urls";

export const metadata: Metadata = {
  title: "Job",
};

export default async function CrewJobPage({
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

  if (!job || !crewCanOpenJob(job.assigned_crew_id, profile.id)) {
    notFound();
  }

  const [photos, materials] = await Promise.all([
    listJobPhotos(job.id),
    listJobMaterials(job.id),
  ]);
  const beforePhotos = photos.filter((photo) => photo.photo_type === "BEFORE");
  const afterPhotos = photos.filter((photo) => photo.photo_type === "AFTER");
  const beforeUrl = beforePhotos[0]?.signedUrl;
  const afterUrl = afterPhotos[0]?.signedUrl;
  const mapsQuery = googleMapsQuery({
    address: job.property_address,
    latitude: job.latitude,
    longitude: job.longitude,
  });

  return (
    <div className="grid gap-5">
      <Link href="/crew" className="font-black text-sky-800 underline">
        Back to route
      </Link>
      <article className="rounded-3xl bg-slate-950 p-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">
              {job.service_name}
            </p>
            <h1 className="mt-2 text-4xl font-black">{job.property_name}</h1>
            <p className="mt-2 text-lg font-bold text-white/90">{job.property_address}</p>
          </div>
          <StatusPill label={jobStatusLabel(job.status)} tone="ice" />
        </div>
        <a
          href={googleMapsDirectionsUrl(mapsQuery)}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex h-16 w-full items-center justify-center rounded-2xl bg-white text-xl font-black text-slate-950"
        >
          Navigate
        </a>
      </article>

      <section className="grid gap-2 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5 font-bold text-slate-800">
        <p>
          <span className="font-black text-orange-800">Surface: </span>
          {job.driveway_type || "Not set"}
        </p>
        <p>
          <span className="font-black text-orange-800">Snow pile: </span>
          {job.snow_storage_location || "Not set"}
        </p>
        <p>
          <span className="font-black text-orange-800">Hazards: </span>
          {job.hazards || "None noted"}
        </p>
        <p>
          <span className="font-black text-orange-800">Instructions: </span>
          {job.special_instructions || job.customer_notes || "None"}
        </p>
      </section>

      {beforeUrl ? (
        <p className="font-bold text-slate-700">BEFORE photo on file ({beforePhotos.length}).</p>
      ) : null}
      {afterUrl ? (
        <p className="font-bold text-slate-700">AFTER photo on file ({afterPhotos.length}).</p>
      ) : null}

      {beforeUrl && afterUrl ? (
        <PhotoCompare
          beforeUrl={beforeUrl}
          afterUrl={afterUrl}
          beforeLabel="Before"
          afterLabel="After"
          detail="Proof from this job."
        />
      ) : null}

      {materials.length > 0 ? (
        <section className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-5">
          <h2 className="font-black text-amber-900">Materials logged</h2>
          <ul className="mt-2 grid gap-1 font-bold text-slate-800">
            {materials.map((material) => (
              <li key={material.id}>
                {material.quantity} {material.unit} {material.material_name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {job.status !== "COMPLETED" && job.status !== "CANCELLED" && job.status !== "FAILED" ? (
        <>
          <MaterialsForm jobId={job.id} />
          <CrewJobControls
            jobId={job.id}
            status={job.status}
            beforeCount={beforePhotos.length}
            afterCount={afterPhotos.length}
            crewNotes={job.crew_notes}
          />
        </>
      ) : (
        <p className="font-black text-slate-800">This job is closed.</p>
      )}
      <Link href={`/crew/jobs/${job.id}/report`} className="font-black text-sky-800 underline">
        Printable job file
      </Link>
    </div>
  );
}
