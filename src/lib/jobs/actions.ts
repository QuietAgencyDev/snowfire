"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { getAdminRequest } from "@/lib/bookings/queries";
import {
  canTransition,
  crewCanOpenJob,
  isJobStatus,
  photoGate,
  timestampFieldFor,
  type JobStatus,
} from "@/lib/jobs/transitions";
import { getJobById, listJobPhotos } from "@/lib/jobs/queries";
import { writeNotification } from "@/lib/notifications/write";
import {
  extensionForImageType,
  isAllowedImageFile,
  jobPhotoPath,
  MAX_PROPERTY_PHOTO_LABEL,
  PROPERTY_MEDIA_BUCKET,
} from "@/lib/photos/paths";
import { isAdminRole } from "@/lib/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type JobFormState = {
  error?: string;
  message?: string;
};

function revalidateJob(jobId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/crew");
  revalidatePath(`/crew/jobs/${jobId}`);
  revalidatePath("/customer");
  revalidatePath("/customer/jobs");
  revalidatePath(`/customer/jobs/${jobId}`);
  revalidatePath(`/customer/jobs/${jobId}/report`);
  revalidatePath(`/admin/jobs/${jobId}/report`);
  revalidatePath(`/crew/jobs/${jobId}/report`);
  revalidatePath("/customer/updates");
  revalidatePath("/crew/updates");
  revalidatePath("/admin/updates");
  revalidatePath("/customer/requests");
}

export async function dispatchJobAction(
  _prev: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const profile = await getSessionProfile();

  if (!profile || !isAdminRole(profile.role)) {
    return { error: "Only operations can dispatch a visit." };
  }

  const requestId = String(formData.get("requestId") ?? "");
  const crewId = String(formData.get("crewId") ?? "").trim();
  const request = await getAdminRequest(requestId);

  if (!request || request.status !== "APPROVED") {
    return { error: "Dispatch starts from an approved visit." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  if (crewId) {
    const { data: crew } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", crewId)
      .eq("role", "CREW")
      .maybeSingle();

    if (!crew) {
      return { error: "Choose a crew member." };
    }
  }

  const status: JobStatus = crewId ? "ASSIGNED" : "UNASSIGNED";
  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      property_id: request.property_id,
      customer_id: request.customer_id,
      service_id: request.service_id,
      assigned_crew_id: crewId || null,
      scheduled_start: `${request.requested_date}T13:00:00.000Z`,
      status,
      priority: "NORMAL",
      customer_notes: request.customer_notes,
    })
    .select("id")
    .single();

  if (error || !job) {
    return { error: "Unable to create this job right now." };
  }

  const { error: requestError } = await supabase
    .from("service_requests")
    .update({ status: "CONVERTED_TO_JOB" })
    .eq("id", request.id)
    .eq("status", "APPROVED");

  if (requestError) {
    await supabase.from("jobs").delete().eq("id", job.id);
    return { error: "Unable to convert that visit into a job." };
  }

  if (crewId) {
    await writeNotification({
      userId: crewId,
      type: "CREW_ASSIGNED",
      title: "Job assigned",
      body: `${request.service_name} at ${request.property_name} is on your route.`,
      metadata: { jobId: job.id },
    });
  }

  await writeNotification({
    userId: request.customer_id,
    type: "CREW_ASSIGNED",
    title: status === "ASSIGNED" ? "Crew assigned" : "Visit dispatched",
    body: "A job exists for this visit. It is not complete until the crew finishes.",
    metadata: { jobId: job.id },
  });

  revalidateJob(job.id);
  redirect(`/admin/jobs/${job.id}`);
}

export async function assignCrewAction(
  _prev: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const profile = await getSessionProfile();

  if (!profile || !isAdminRole(profile.role)) {
    return { error: "Only operations can assign crew." };
  }

  const jobId = String(formData.get("jobId") ?? "");
  const crewId = String(formData.get("crewId") ?? "").trim();
  const job = await getJobById(jobId);

  if (!job || (job.status !== "UNASSIGNED" && job.status !== "ASSIGNED")) {
    return { error: "That job cannot be assigned right now." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { data: crew } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", crewId)
    .eq("role", "CREW")
    .maybeSingle();

  if (!crew) {
    return { error: "Choose a crew member." };
  }

  const { error } = await supabase
    .from("jobs")
    .update({
      assigned_crew_id: crew.id,
      status: "ASSIGNED",
    })
    .eq("id", job.id);

  if (error) {
    return { error: "Unable to assign that job right now." };
  }

  await writeNotification({
    userId: crew.id,
    type: "CREW_ASSIGNED",
    title: "Job assigned",
    body: `${job.service_name} at ${job.property_name} is on your route.`,
    metadata: { jobId: job.id },
  });

  revalidateJob(job.id);
  return { message: "Crew assigned." };
}

export async function advanceJobAction(
  _prev: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const profile = await getSessionProfile();
  const jobId = String(formData.get("jobId") ?? "");
  const to = String(formData.get("toStatus") ?? "");
  const crewNotes = String(formData.get("crewNotes") ?? "").trim();

  if (!profile || !isJobStatus(to)) {
    return { error: "That status is not valid." };
  }

  const job = await getJobById(jobId);

  if (!job) {
    return { error: "That job was not found." };
  }

  const isCrew = profile.role === "CREW";
  const isAdmin = isAdminRole(profile.role);

  if (isCrew && !crewCanOpenJob(job.assigned_crew_id, profile.id)) {
    return { error: "This job is not on your route." };
  }

  if (!isCrew && !isAdmin) {
    return { error: "Only crew or operations can move a job." };
  }

  if (!canTransition(job.status, to)) {
    return { error: "That step is not allowed from here." };
  }

  const photos = await listJobPhotos(job.id);
  const gate = photoGate(job.status, to, {
    beforeCount: photos.filter((photo) => photo.photo_type === "BEFORE").length,
    afterCount: photos.filter((photo) => photo.photo_type === "AFTER").length,
    beforeRequired: job.before_photo_required,
    afterRequired: job.after_photo_required,
  });

  if (gate) {
    return { error: gate };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const stamp = timestampFieldFor(to);
  const patch: Record<string, string | null> = {
    status: to,
    crew_notes: crewNotes || job.crew_notes,
  };

  if (stamp) {
    patch[stamp] = new Date().toISOString();
  }

  const { error } = await supabase.from("jobs").update(patch).eq("id", job.id).eq("status", job.status);

  if (error) {
    return { error: "Unable to update this job right now." };
  }

  const notices: Record<string, { type: "CREW_EN_ROUTE" | "CREW_ARRIVED" | "JOB_STARTED" | "JOB_COMPLETED"; title: string; body: string }> = {
    EN_ROUTE: {
      type: "CREW_EN_ROUTE",
      title: "Crew en route",
      body: `The crew is heading to ${job.property_name}.`,
    },
    ARRIVED: {
      type: "CREW_ARRIVED",
      title: "Crew arrived",
      body: `The crew is on site at ${job.property_name}.`,
    },
    IN_PROGRESS: {
      type: "JOB_STARTED",
      title: "Work started",
      body: `Work started at ${job.property_name}.`,
    },
    COMPLETED: {
      type: "JOB_COMPLETED",
      title: "Job completed",
      body: `Work at ${job.property_name} is complete. Proof is on the job.`,
    },
  };

  const notice = notices[to];

  if (notice) {
    await writeNotification({
      userId: job.customer_id,
      type: notice.type,
      title: notice.title,
      body: notice.body,
      metadata: { jobId: job.id },
    });
  }

  revalidateJob(job.id);
  return { message: "Job updated." };
}

export async function uploadJobPhotoAction(
  _prev: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const profile = await getSessionProfile();
  const jobId = String(formData.get("jobId") ?? "");
  const photoType = String(formData.get("photoType") ?? "");

  if (!profile || (profile.role !== "CREW" && !isAdminRole(profile.role))) {
    return { error: "Only crew can upload job proof." };
  }

  if (photoType !== "BEFORE" && photoType !== "AFTER") {
    return { error: "Use a BEFORE or AFTER photo." };
  }

  const job = await getJobById(jobId);

  if (!job) {
    return { error: "That job was not found." };
  }

  if (profile.role === "CREW" && !crewCanOpenJob(job.assigned_crew_id, profile.id)) {
    return { error: "This job is not on your route." };
  }

  if (photoType === "BEFORE" && job.status !== "ARRIVED" && job.status !== "IN_PROGRESS") {
    return { error: "Arrive on site before taking the BEFORE photo." };
  }

  if (photoType === "AFTER" && job.status !== "IN_PROGRESS") {
    return { error: "Start work before taking the AFTER photo." };
  }

  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a photo." };
  }

  if (!isAllowedImageFile(file)) {
    return { error: `Use a JPEG, PNG, or WebP photo under ${MAX_PROPERTY_PHOTO_LABEL}.` };
  }

  const extension = extensionForImageType(file.type);

  if (!extension) {
    return { error: "Use a JPEG, PNG, or WebP photo." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const storagePath = jobPhotoPath(job.id, photoType, crypto.randomUUID(), extension);
  const { error: uploadError } = await supabase.storage
    .from(PROPERTY_MEDIA_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { error: "Unable to upload that photo right now." };
  }

  const { error: insertError } = await supabase.from("job_photos").insert({
    job_id: job.id,
    property_id: job.property_id,
    uploaded_by: profile.id,
    photo_type: photoType,
    storage_path: storagePath,
    captured_at: new Date().toISOString(),
  });

  if (insertError) {
    await supabase.storage.from(PROPERTY_MEDIA_BUCKET).remove([storagePath]);
    return { error: "The photo uploaded, but it could not be saved to the job." };
  }

  revalidateJob(job.id);
  return { message: `${photoType} photo saved.` };
}

export async function addJobMaterialAction(
  _prev: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const profile = await getSessionProfile();
  const jobId = String(formData.get("jobId") ?? "");
  const materialName = String(formData.get("materialName") ?? "").trim();
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const quantity = Number(quantityRaw);

  if (!profile || (profile.role !== "CREW" && !isAdminRole(profile.role))) {
    return { error: "Only crew or operations can log materials." };
  }

  if (!materialName || !unit) {
    return { error: "Name the material and the unit." };
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: "Quantity must be greater than zero." };
  }

  const job = await getJobById(jobId);

  if (!job) {
    return { error: "That job was not found." };
  }

  if (profile.role === "CREW" && !crewCanOpenJob(job.assigned_crew_id, profile.id)) {
    return { error: "This job is not on your route." };
  }

  if (job.status === "COMPLETED" || job.status === "CANCELLED" || job.status === "FAILED") {
    return { error: "This job is closed." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { error } = await supabase.from("job_materials").insert({
    job_id: job.id,
    material_name: materialName,
    quantity,
    unit,
    cost: 0,
  });

  if (error) {
    return { error: "Unable to save that material right now." };
  }

  revalidateJob(job.id);
  return { message: `${materialName} logged.` };
}
