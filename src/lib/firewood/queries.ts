import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FirewoodProduct, ServiceCatalogItem } from "@/types/database";

export async function listActiveFirewoodProducts(): Promise<FirewoodProduct[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("firewood_products")
    .select("*")
    .eq("active", true)
    .order("price", { ascending: true });

  return (data ?? []) as FirewoodProduct[];
}

export async function getActiveFirewoodProduct(
  productId: string,
): Promise<FirewoodProduct | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("firewood_products")
    .select("*")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();

  return (data as FirewoodProduct | null) ?? null;
}

export async function listActiveServices(): Promise<ServiceCatalogItem[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("services")
    .select("id, name, description, category, service_type, active, base_price, pricing_model")
    .eq("active", true)
    .order("name", { ascending: true });

  return (data ?? []) as ServiceCatalogItem[];
}
