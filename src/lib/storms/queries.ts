import { listActiveServices } from "@/lib/firewood/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AdminPropertyRow, ServiceCatalogItem, StormEvent } from "@/types/database";

export async function listStorms(): Promise<StormEvent[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("storm_events")
    .select("*")
    .order("start_time", { ascending: false });

  return (data ?? []) as StormEvent[];
}

export async function getStorm(stormId: string): Promise<StormEvent | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from("storm_events").select("*").eq("id", stormId).maybeSingle();

  return (data as StormEvent | null) ?? null;
}

export async function listAdminProperties(): Promise<AdminPropertyRow[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: true });

  const rows = properties ?? [];

  if (rows.length === 0) {
    return [];
  }

  const customerIds = [...new Set(rows.map((row) => row.customer_id as string))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("id", customerIds);

  const names = new Map(
    (profiles ?? []).map((profile) => [
      profile.id as string,
      {
        customer_name: `${profile.first_name} ${profile.last_name}`.trim() || "Customer",
        customer_email: (profile.email as string) ?? "",
      },
    ]),
  );

  return rows.map((row) => {
    const person = names.get(row.customer_id as string);

    return {
      ...(row as AdminPropertyRow),
      customer_name: person?.customer_name ?? "Customer",
      customer_email: person?.customer_email ?? "",
    };
  });
}

export async function getDefaultStormService(): Promise<ServiceCatalogItem | null> {
  const services = await listActiveServices();
  const snow = services.filter(
    (service) => service.category === "SNOW" && service.service_type !== "ROOF_SALT_PUCKS",
  );

  return (
    snow.find((service) => service.service_type === "PER_STORM") ??
    snow.find((service) => service.service_type === "ONE_TIME") ??
    snow[0] ??
    null
  );
}
