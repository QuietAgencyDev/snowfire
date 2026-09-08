import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceReport } from "@/components/jobs/service-report";
import { listJobMaterials } from "@/lib/jobs/materials";
import { getJobById, listJobPhotos } from "@/lib/jobs/queries";

export const metadata: Metadata = {
  title: "Service report",
};

export default async function AdminJobReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
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
      backHref={`/admin/jobs/${job.id}`}
      backLabel="Back to job"
      showCost
    />
  );
}
