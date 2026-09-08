"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { geocodeAddress } from "@/lib/maps/geocode";
import {
  extensionForImageType,
  isAllowedImageFile,
  PROPERTY_MEDIA_BUCKET,
  propertyPhotoPath,
} from "@/lib/photos/paths";
import { formatPropertyAddress, isOwnProperty } from "@/lib/properties/address";
import {
  parseClientInfoForm,
  parsePropertyForm,
  propertyPhotoSchema,
  type PropertyInput,
} from "@/lib/properties/schema";
import { getCustomerProperty } from "@/lib/properties/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PropertyFormState = {
  error?: string;
  message?: string;
};

function configurationError(): PropertyFormState {
  return { error: "Supabase is not configured." };
}

function toPropertyRow(input: PropertyInput, customerId: string) {
  return {
    customer_id: customerId,
    name: input.name,
    property_type: input.propertyType,
    address_line_1: input.addressLine1,
    address_line_2: input.addressLine2,
    city: input.city,
    province: input.province,
    postal_code: input.postalCode,
    driveway_type: input.drivewayType,
    driveway_length: input.drivewayLength,
    driveway_width: input.drivewayWidth,
    parking_area: input.parkingArea,
    walkway_count: input.walkwayCount,
    steps_count: input.stepsCount,
    snow_storage_location: input.snowStorageLocation,
    deicing_required: input.deicingRequired,
    service_preferences: input.servicePreferences,
    roof_type: input.roofType,
    roof_notes: input.roofNotes,
    salt_puck_count: input.saltPuckCount,
    firewood_preferences: input.firewoodPreferences,
    firewood_stack_location: input.firewoodStackLocation,
    firewood_notes: input.firewoodNotes,
    hazards: input.hazards,
    special_instructions: input.specialInstructions,
  };
}

async function coordinatesFor(input: PropertyInput) {
  const point = await geocodeAddress(formatPropertyAddress({
    address_line_1: input.addressLine1,
    address_line_2: input.addressLine2,
    city: input.city,
    province: input.province,
    postal_code: input.postalCode,
  }));

  if (!point) {
    return { latitude: null, longitude: null };
  }

  return {
    latitude: point.latitude,
    longitude: point.longitude,
  };
}

export async function createPropertyAction(
  _prev: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  const profile = await getSessionProfile();

  if (!profile || profile.role !== "CUSTOMER") {
    return { error: "Sign in as a customer to add a property." };
  }

  const parsed = parsePropertyForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the property details." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return configurationError();
  }

  const coordinates = await coordinatesFor(parsed.data);
  const { data, error } = await supabase
    .from("properties")
    .insert({
      ...toPropertyRow(parsed.data, profile.id),
      ...coordinates,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Unable to save this property right now." };
  }

  revalidatePath("/customer");
  revalidatePath("/customer/properties");
  redirect(`/customer/properties/${data.id}`);
}

export async function updatePropertyAction(
  _prev: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  const profile = await getSessionProfile();
  const propertyId = String(formData.get("propertyId") ?? "");

  if (!profile || profile.role !== "CUSTOMER") {
    return { error: "Sign in as a customer to edit a property." };
  }

  const existing = await getCustomerProperty(propertyId, profile.id);

  if (!existing || !isOwnProperty(existing.customer_id, profile.id)) {
    return { error: "That property was not found." };
  }

  const parsed = parsePropertyForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the property details." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return configurationError();
  }

  const coordinates = await coordinatesFor(parsed.data);
  const { error } = await supabase
    .from("properties")
    .update({
      ...toPropertyRow(parsed.data, profile.id),
      ...coordinates,
    })
    .eq("id", propertyId)
    .eq("customer_id", profile.id);

  if (error) {
    return { error: "Unable to update this property right now." };
  }

  revalidatePath("/customer");
  revalidatePath("/customer/properties");
  revalidatePath(`/customer/properties/${propertyId}`);
  redirect(`/customer/properties/${propertyId}`);
}

export async function updateClientInfoAction(
  _prev: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  const profile = await getSessionProfile();

  if (!profile || profile.role !== "CUSTOMER") {
    return { error: "Sign in to update your contact details." };
  }

  const parsed = parseClientInfoForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your contact details." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return configurationError();
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone,
    })
    .eq("id", profile.id)
    .eq("user_id", profile.user_id);

  if (error) {
    return { error: "Unable to update your contact details right now." };
  }

  const returnTo = String(formData.get("returnTo") ?? "/customer/properties");
  revalidatePath("/customer");
  revalidatePath(returnTo);
  return { message: "Client info saved." };
}

export async function uploadPropertyPhotoAction(
  _prev: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  const profile = await getSessionProfile();

  if (!profile || profile.role !== "CUSTOMER") {
    return { error: "Sign in as a customer to upload photos." };
  }

  const parsed = propertyPhotoSchema.safeParse({
    propertyId: formData.get("propertyId"),
    photoType: formData.get("photoType"),
    caption: formData.get("caption"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Choose a photo type." };
  }

  const property = await getCustomerProperty(parsed.data.propertyId, profile.id);

  if (!property || !isOwnProperty(property.customer_id, profile.id)) {
    return { error: "That property was not found." };
  }

  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a driveway photo to upload." };
  }

  if (!isAllowedImageFile(file)) {
    return {
      error: "Use a JPEG, PNG, or WebP photo under 6 MB.",
    };
  }

  const extension = extensionForImageType(file.type);

  if (!extension) {
    return { error: "Use a JPEG, PNG, or WebP photo." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return configurationError();
  }

  const storagePath = propertyPhotoPath(
    property.id,
    parsed.data.photoType,
    crypto.randomUUID(),
    extension,
  );

  const { error: uploadError } = await supabase.storage
    .from(PROPERTY_MEDIA_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { error: "Unable to upload that photo right now." };
  }

  const { error: insertError } = await supabase.from("property_photos").insert({
    property_id: property.id,
    uploaded_by: profile.id,
    storage_path: storagePath,
    photo_type: parsed.data.photoType,
    caption: parsed.data.caption,
  });

  if (insertError) {
    await supabase.storage.from(PROPERTY_MEDIA_BUCKET).remove([storagePath]);
    return { error: "The photo uploaded, but it could not be saved to the property." };
  }

  revalidatePath(`/customer/properties/${property.id}`);
  return { message: "Photo added." };
}

export async function deletePropertyPhotoAction(formData: FormData): Promise<void> {
  const profile = await getSessionProfile();
  const photoId = String(formData.get("photoId") ?? "");
  const propertyId = String(formData.get("propertyId") ?? "");

  if (!profile || profile.role !== "CUSTOMER") {
    return;
  }

  const property = await getCustomerProperty(propertyId, profile.id);

  if (!property || !isOwnProperty(property.customer_id, profile.id)) {
    return;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return;
  }

  const { data: photo } = await supabase
    .from("property_photos")
    .select("id, storage_path, property_id")
    .eq("id", photoId)
    .eq("property_id", property.id)
    .maybeSingle();

  if (!photo) {
    return;
  }

  await supabase.storage.from(PROPERTY_MEDIA_BUCKET).remove([photo.storage_path]);
  await supabase
    .from("property_photos")
    .delete()
    .eq("id", photo.id)
    .eq("property_id", property.id);

  revalidatePath(`/customer/properties/${property.id}`);
}
