import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceReport } from "@/components/jobs/service-report";
import { getSessionProfile } from "@/lib/auth/session";
import { listJobMaterials } from "@/lib/jobs/materials";
import { getJobById, listJobPhotos } from "@/lib/jobs/queries";
import { crewCanOpenJob } from "@/lib/jobs/transitions";

export const metadata: Metadata = {
  title: "Service report",
};

export default async function CrewJobReportPage({
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

  return (
    <ServiceReport
      job={job}
      photos={photos}
      materials={materials}
      backHref={`/crew/jobs/${job.id}`}
      backLabel="Back to job"
    />
  );
}
