"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { getCustomerProperty } from "@/lib/properties/queries";
import { listPropertyZones } from "@/lib/properties/zones";
import { isAdminRole } from "@/lib/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { JobPriority } from "@/types/database";

export type ZoneFormState = {
  error?: string;
  message?: string;
};

const PRIORITIES: JobPriority[] = ["NORMAL", "HIGH", "URGENT"];

function revalidateProperty(propertyId: string) {
  revalidatePath(`/customer/properties/${propertyId}`);
  revalidatePath(`/customer/properties/${propertyId}/edit`);
}

export async function addPropertyZoneAction(
  _prev: ZoneFormState,
  formData: FormData,
): Promise<ZoneFormState> {
  const profile = await getSessionProfile();
  const propertyId = String(formData.get("propertyId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  const priorityRaw = String(formData.get("priority") ?? "NORMAL");
  const priority = PRIORITIES.includes(priorityRaw as JobPriority)
    ? (priorityRaw as JobPriority)
    : "NORMAL";

  if (!profile) {
    return { error: "Sign in to add a zone." };
  }

  if (!name) {
    return { error: "Name the zone." };
  }

  const property = await getCustomerProperty(propertyId, profile.id);
  const canWrite = property || isAdminRole(profile.role);

  if (!canWrite) {
    return { error: "That property was not found." };
  }

  if (property && property.property_type !== "COMMERCIAL") {
    return { error: "Zones are for commercial properties." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  if (!property && isAdminRole(profile.role)) {
    const { data: adminProperty } = await supabase
      .from("properties")
      .select("id, property_type")
      .eq("id", propertyId)
      .maybeSingle();

    if (!adminProperty || adminProperty.property_type !== "COMMERCIAL") {
      return { error: "Zones are for commercial properties." };
    }
  }

  const existing = await listPropertyZones(propertyId);

  const { error } = await supabase.from("property_zones").insert({
    property_id: propertyId,
    name,
    instructions: instructions || null,
    priority,
    sort_order: existing.length,
    photo_required: true,
  });

  if (error) {
    return { error: "Unable to save that zone right now." };
  }

  revalidateProperty(propertyId);
  return { message: "Zone saved." };
}

export async function deletePropertyZoneAction(formData: FormData): Promise<void> {
  const profile = await getSessionProfile();
  const zoneId = String(formData.get("zoneId") ?? "");
  const propertyId = String(formData.get("propertyId") ?? "");

  if (!profile || !zoneId || !propertyId) {
    return;
  }

  const property = await getCustomerProperty(propertyId, profile.id);

  if (!property && !isAdminRole(profile.role)) {
    return;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return;
  }

  await supabase.from("property_zones").delete().eq("id", zoneId).eq("property_id", propertyId);
  revalidateProperty(propertyId);
}
