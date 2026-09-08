import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceReport } from "@/components/jobs/service-report";
import { getSessionProfile } from "@/lib/auth/session";
import { listJobMaterials } from "@/lib/jobs/materials";
import { getJobById, listJobPhotos } from "@/lib/jobs/queries";

export const metadata: Metadata = {
  title: "Service report",
};

export default async function CustomerJobReportPage({
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

  const [photos, materials] = await Promise.all([
    listJobPhotos(job.id),
    listJobMaterials(job.id),
  ]);

  return (
    <ServiceReport
      job={job}
      photos={photos}
      materials={materials}
      backHref={`/customer/jobs/${job.id}`}
      backLabel="Back to job"
    />
  );
}
