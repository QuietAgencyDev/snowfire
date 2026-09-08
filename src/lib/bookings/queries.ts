import { formatPropertyAddress } from "@/lib/properties/address";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ServiceCatalogItem, ServiceRequestView } from "@/types/database";

type RequestRow = {
  id: string;
  customer_id: string;
  property_id: string;
  service_id: string;
  requested_date: string;
  preferred_time: string | null;
  status: ServiceRequestView["status"];
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  properties: {
    name: string;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    province: string;
    postal_code: string;
  } | null;
  services: {
    name: string;
    service_type: string;
    pricing_model: string;
    base_price: number;
  } | null;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function asView(row: RequestRow): ServiceRequestView {
  const property = first(row.properties);
  const service = first(row.services);
  const profile = first(row.profiles);

  return {
    id: row.id,
    customer_id: row.customer_id,
    property_id: row.property_id,
    service_id: row.service_id,
    requested_date: row.requested_date,
    preferred_time: row.preferred_time,
    status: row.status,
    customer_notes: row.customer_notes,
    admin_notes: row.admin_notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    property_name: property?.name ?? "Property",
    property_address: property
      ? formatPropertyAddress(property)
      : "Address unavailable",
    service_name: service?.name ?? "Service",
    service_type: service?.service_type ?? "",
    pricing_model: service?.pricing_model ?? "CUSTOM_QUOTE",
    base_price: service?.base_price ?? 0,
    customer_name: profile
      ? `${profile.first_name} ${profile.last_name}`.trim()
      : "Customer",
    customer_email: profile?.email ?? "",
  };
}

const REQUEST_SELECT = `
  id, customer_id, property_id, service_id, requested_date, preferred_time,
  status, customer_notes, admin_notes, created_at, updated_at,
  properties ( name, address_line_1, address_line_2, city, province, postal_code ),
  services ( name, service_type, pricing_model, base_price ),
  profiles!service_requests_customer_id_fkey ( first_name, last_name, email )
`;

export async function listSnowServices(): Promise<ServiceCatalogItem[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("services")
    .select("id, name, description, category, service_type, active, base_price, pricing_model")
    .eq("active", true)
    .eq("category", "SNOW")
    .order("name", { ascending: true });

  return (data ?? []) as ServiceCatalogItem[];
}

export async function listCustomerRequests(customerId: string): Promise<ServiceRequestView[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("service_requests")
    .select(REQUEST_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as RequestRow[]).map(asView);
}

export async function getCustomerRequest(
  requestId: string,
  customerId: string,
): Promise<ServiceRequestView | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("service_requests")
    .select(REQUEST_SELECT)
    .eq("id", requestId)
    .eq("customer_id", customerId)
    .maybeSingle();

  return data ? asView(data as unknown as RequestRow) : null;
}

export async function listReviewRequests(): Promise<ServiceRequestView[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("service_requests")
    .select(REQUEST_SELECT)
    .in("status", ["CUSTOMER_REQUESTED", "ADMIN_REVIEW", "APPROVED"])
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as RequestRow[]).map(asView);
}

export async function getAdminRequest(requestId: string): Promise<ServiceRequestView | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("service_requests")
    .select(REQUEST_SELECT)
    .eq("id", requestId)
    .maybeSingle();

  return data ? asView(data as unknown as RequestRow) : null;
}
