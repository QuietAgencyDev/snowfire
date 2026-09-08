import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PROPERTY_MEDIA_BUCKET } from "@/lib/photos/paths";
import type { PhotoType, Property, PropertyPhoto, PropertyPhotoView } from "@/types/database";

export async function listCustomerProperties(customerId: string): Promise<Property[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true });

  return (data ?? []) as Property[];
}

export async function getCustomerProperty(
  propertyId: string,
  customerId: string,
): Promise<Property | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("customer_id", customerId)
    .maybeSingle();

  return (data as Property | null) ?? null;
}

/** Reads a property without scoping to an owner. RLS still gates this to staff. */
export async function getPropertyForStaff(propertyId: string): Promise<Property | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .maybeSingle();

  return (data as Property | null) ?? null;
}

export async function listPropertyPhotos(
  propertyId: string,
  photoType?: PhotoType,
): Promise<PropertyPhotoView[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("property_photos")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (photoType) {
    query = query.eq("photo_type", photoType);
  }

  const { data } = await query;
  const photos = (data ?? []) as PropertyPhoto[];

  return Promise.all(
    photos.map(async (photo) => {
      const { data: signed } = await supabase.storage
        .from(PROPERTY_MEDIA_BUCKET)
        .createSignedUrl(photo.storage_path, 60 * 60);

      return {
        ...photo,
        signedUrl: signed?.signedUrl ?? null,
      };
    }),
  );
}
