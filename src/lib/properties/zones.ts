import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PropertyZone } from "@/types/database";

export async function listPropertyZones(propertyId: string): Promise<PropertyZone[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("property_zones")
    .select("*")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true });

  return (data ?? []) as PropertyZone[];
}
