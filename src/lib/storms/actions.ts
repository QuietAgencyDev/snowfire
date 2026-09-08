"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { listOpenJobPropertyIds } from "@/lib/jobs/queries";
import { writeNotification } from "@/lib/notifications/write";
import { formatPropertyAddress, propertyCoordinates } from "@/lib/properties/address";
import { isAdminRole } from "@/lib/roles";
import { stormJobPriority } from "@/lib/storms/priority";
import { getDefaultStormService, getStorm } from "@/lib/storms/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { iceRisk } from "@/lib/weather/ice-risk";
import { getLocalWeatherReport } from "@/lib/weather/open-meteo";

export type StormFormState = {
  error?: string;
  message?: string;
};

const STORM_STATUSES = ["MONITORING", "ACTIVE", "PROCESSING", "COMPLETED"] as const;

function easternIso(local: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) {
    return null;
  }

  const month = Number(local.slice(5, 7));
  const offset = month >= 3 && month <= 10 ? "-04:00" : "-05:00";
  const date = new Date(`${local}:00${offset}`);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function revalidateStorm(stormId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath("/admin/storms");
  revalidatePath(`/admin/storms/${stormId}`);
}

export async function createStormAction(
  _prev: StormFormState,
  formData: FormData,
): Promise<StormFormState> {
  const profile = await getSessionProfile();

  if (!profile || !isAdminRole(profile.role)) {
    return { error: "Only operations can open a storm desk." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const startLocal = String(formData.get("startTime") ?? "").trim();
  const estimatedRaw = String(formData.get("estimatedSnowfall") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const markActive = String(formData.get("markActive") ?? "") === "on";
  const startTime = easternIso(startLocal);

  if (!name) {
    return { error: "Name the storm." };
  }

  if (!startTime) {
    return { error: "Set a start time in Eastern time." };
  }

  const estimated = estimatedRaw ? Number(estimatedRaw) : null;

  if (estimatedRaw && (!Number.isFinite(estimated) || (estimated ?? 0) < 0)) {
    return { error: "Estimated snow must be a number of centimetres." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("storm_events")
    .insert({
      name,
      start_time: startTime,
      estimated_snowfall: estimated,
      notes: notes || null,
      status: markActive ? "ACTIVE" : "MONITORING",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Unable to save this storm right now." };
  }

  revalidateStorm(data.id);
  redirect(`/admin/storms/${data.id}`);
}

export async function updateStormStatusAction(
  _prev: StormFormState,
  formData: FormData,
): Promise<StormFormState> {
  const profile = await getSessionProfile();

  if (!profile || !isAdminRole(profile.role)) {
    return { error: "Only operations can update a storm." };
  }

  const stormId = String(formData.get("stormId") ?? "");
  const status = String(formData.get("status") ?? "");
  const actualRaw = String(formData.get("actualSnowfall") ?? "").trim();

  if (!STORM_STATUSES.includes(status as (typeof STORM_STATUSES)[number])) {
    return { error: "That storm status is not valid." };
  }

  const storm = await getStorm(stormId);

  if (!storm) {
    return { error: "That storm was not found." };
  }

  const actual = actualRaw ? Number(actualRaw) : null;

  if (actualRaw && (!Number.isFinite(actual) || (actual ?? 0) < 0)) {
    return { error: "Actual snow must be a number of centimetres." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const patch: Record<string, string | number | null> = { status };

  if (actual != null) {
    patch.actual_snowfall = actual;
  }

  if (status === "COMPLETED" && !storm.end_time) {
    patch.end_time = new Date().toISOString();
  }

  const { error } = await supabase.from("storm_events").update(patch).eq("id", storm.id);

  if (error) {
    return { error: "Unable to update this storm right now." };
  }

  revalidateStorm(storm.id);
  return { message: "Storm updated." };
}

export async function queueStormJobAction(
  _prev: StormFormState,
  formData: FormData,
): Promise<StormFormState> {
  const profile = await getSessionProfile();

  if (!profile || !isAdminRole(profile.role)) {
    return { error: "Only operations can queue a storm visit." };
  }

  const stormId = String(formData.get("stormId") ?? "");
  const propertyId = String(formData.get("propertyId") ?? "");
  const storm = await getStorm(stormId);

  if (!storm) {
    return { error: "That storm was not found." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .maybeSingle();

  if (!property) {
    return { error: "That property was not found." };
  }

  const openIds = await listOpenJobPropertyIds();

  if (openIds.has(property.id)) {
    return { error: "This driveway already has an open job." };
  }

  const service = await getDefaultStormService();

  if (!service) {
    return { error: "No snow service is on the catalog." };
  }

  const coords = propertyCoordinates(property);
  const weather = coords
    ? await getLocalWeatherReport(coords.latitude, coords.longitude)
    : null;
  const risk = weather ? iceRisk(weather) : null;
  const priority = stormJobPriority(risk?.level);

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      property_id: property.id,
      customer_id: property.customer_id,
      service_id: service.id,
      scheduled_start: storm.start_time,
      status: "UNASSIGNED",
      priority,
      customer_notes: `Queued from storm: ${storm.name}`,
      weather_snapshot: risk
        ? {
            stormId: storm.id,
            stormName: storm.name,
            iceScore: risk.score,
            iceLevel: risk.level,
            next48hSnowCm: risk.next48hSnowCm,
            source: weather?.source ?? "Open-Meteo",
          }
        : { stormId: storm.id, stormName: storm.name },
    })
    .select("id")
    .single();

  if (error || !job) {
    return { error: "Unable to queue this driveway right now." };
  }

  await writeNotification({
    userId: property.customer_id,
    type: "CREW_ASSIGNED",
    title: "Storm visit queued",
    body: `${service.name} is queued for ${property.name} during ${storm.name}. No crew is assigned yet.`,
    metadata: { jobId: job.id },
  });

  revalidateStorm(storm.id);
  revalidatePath("/admin/jobs");
  revalidatePath("/customer/jobs");
  revalidatePath("/customer/updates");

  return {
    message: `Queued ${formatPropertyAddress(property)}. Assign crew from the job.`,
  };
}
