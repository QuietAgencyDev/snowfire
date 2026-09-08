"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { customerCanCancelRequest } from "@/lib/bookings/labels";
import { parseBookingForm } from "@/lib/bookings/schema";
import { writeNotification } from "@/lib/notifications/write";
import { isOwnProperty } from "@/lib/properties/address";
import { getCustomerProperty } from "@/lib/properties/queries";
import { initialRequestStatus, todayInTimeZone } from "@/lib/pricing/quote-math";
import { isAdminRole } from "@/lib/roles";
import { getBookingMode } from "@/lib/settings/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type BookingFormState = {
  error?: string;
  message?: string;
};

export async function createBookingRequestAction(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const profile = await getSessionProfile();

  if (!profile || profile.role !== "CUSTOMER") {
    return { error: "Sign in as a customer to request a visit." };
  }

  const parsed = parseBookingForm(formData, todayInTimeZone("America/Toronto"));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the request details." };
  }

  const property = await getCustomerProperty(parsed.data.propertyId, profile.id);

  if (!property || !isOwnProperty(property.customer_id, profile.id)) {
    return { error: "That property was not found." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { data: service } = await supabase
    .from("services")
    .select("id, name, category, active")
    .eq("id", parsed.data.serviceId)
    .eq("active", true)
    .maybeSingle();

  if (!service || service.category !== "SNOW") {
    return { error: "Choose a snow service from the catalog." };
  }

  const mode = await getBookingMode();
  const status = initialRequestStatus(mode);
  const { data, error } = await supabase
    .from("service_requests")
    .insert({
      customer_id: profile.id,
      property_id: property.id,
      service_id: service.id,
      requested_date: parsed.data.requestedDate,
      preferred_time: parsed.data.preferredTime,
      customer_notes: parsed.data.customerNotes || null,
      status,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Unable to complete this booking right now." };
  }

  await supabase.from("audit_logs").insert({
    user_id: profile.id,
    action: "BOOKING_CREATED",
    entity_type: "service_request",
    entity_id: data.id,
    metadata: { status, service: service.name },
  });

  await writeNotification({
    userId: profile.id,
    type: "BOOKING_RECEIVED",
    title: status === "APPROVED" ? "Visit approved" : "Visit requested",
    body:
      status === "APPROVED"
        ? `${service.name} is approved and waiting for dispatch. It is not a crew job yet.`
        : `${service.name} is in review. We will not invent a crew visit until it is approved.`,
    metadata: { requestId: data.id },
  });

  revalidatePath("/customer");
  revalidatePath("/customer/requests");
  revalidatePath("/admin");
  redirect(`/customer/requests/${data.id}`);
}

export async function cancelBookingRequestAction(formData: FormData): Promise<void> {
  const profile = await getSessionProfile();
  const requestId = String(formData.get("requestId") ?? "");

  if (!profile || profile.role !== "CUSTOMER" || !requestId) {
    return;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return;
  }

  const { data } = await supabase
    .from("service_requests")
    .select("id, status")
    .eq("id", requestId)
    .eq("customer_id", profile.id)
    .maybeSingle();

  if (!data || !customerCanCancelRequest(data.status)) {
    return;
  }

  await supabase
    .from("service_requests")
    .update({ status: "CANCELLED" })
    .eq("id", requestId)
    .eq("customer_id", profile.id);

  revalidatePath("/customer");
  revalidatePath("/customer/requests");
  revalidatePath(`/customer/requests/${requestId}`);
  revalidatePath("/admin");
}

export async function reviewBookingRequestAction(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const profile = await getSessionProfile();

  if (!profile || !isAdminRole(profile.role)) {
    return { error: "Only operations can review a visit." };
  }

  const requestId = String(formData.get("requestId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const adminNotes = String(formData.get("adminNotes") ?? "").trim();

  if (!requestId || (decision !== "APPROVED" && decision !== "DECLINED")) {
    return { error: "Choose approve or decline." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { data: existing } = await supabase
    .from("service_requests")
    .select("id, status, customer_id")
    .eq("id", requestId)
    .maybeSingle();

  if (!existing || (existing.status !== "ADMIN_REVIEW" && existing.status !== "CUSTOMER_REQUESTED")) {
    return { error: "That request is no longer waiting for review." };
  }

  const { error } = await supabase
    .from("service_requests")
    .update({
      status: decision,
      admin_notes: adminNotes || null,
    })
    .eq("id", requestId);

  if (error) {
    return { error: "Unable to update that request right now." };
  }

  await writeNotification({
    userId: existing.customer_id,
    type: decision === "APPROVED" ? "BOOKING_APPROVED" : "BOOKING_DECLINED",
    title: decision === "APPROVED" ? "Visit approved" : "Visit declined",
    body:
      decision === "APPROVED"
        ? "Your visit is approved and waiting for dispatch. No crew job exists yet."
        : adminNotes || "Operations declined this visit request.",
    metadata: { requestId },
  });

  revalidatePath("/admin");
  revalidatePath("/customer/requests");
  redirect(`/admin/requests/${requestId}`);
}
