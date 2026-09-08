import { formatPropertyAddress } from "@/lib/properties/address";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Contract, ContractView, Property } from "@/types/database";

type ContractRow = Contract & {
  properties: Property | Property[] | null;
  services: { name: string } | { name: string }[] | null;
  customer:
    | { first_name: string; last_name: string; email: string }
    | { first_name: string; last_name: string; email: string }[]
    | null;
};

const CONTRACT_SELECT = `
  *,
  properties (*),
  services ( name ),
  customer:profiles!contracts_customer_id_fkey ( first_name, last_name, email )
`;

function first<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function asView(row: ContractRow): ContractView {
  const property = first(row.properties);
  const service = first(row.services);
  const customer = first(row.customer);

  return {
    ...(row as Contract),
    property_name: property?.name ?? "Property",
    property_address: property ? formatPropertyAddress(property) : "",
    service_name: service?.name ?? "Seasonal Snow Contract",
    customer_name: customer
      ? `${customer.first_name} ${customer.last_name}`.trim() || "Customer"
      : "Customer",
    customer_email: customer?.email ?? "",
  };
}

export async function listCustomerContracts(customerId: string): Promise<ContractView[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("contracts")
    .select(CONTRACT_SELECT)
    .eq("customer_id", customerId)
    .order("start_date", { ascending: false });

  return ((data ?? []) as unknown as ContractRow[]).map(asView);
}

export async function listContracts(): Promise<ContractView[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("contracts")
    .select(CONTRACT_SELECT)
    .order("start_date", { ascending: false });

  return ((data ?? []) as unknown as ContractRow[]).map(asView);
}

export async function getContract(contractId: string): Promise<ContractView | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("contracts")
    .select(CONTRACT_SELECT)
    .eq("id", contractId)
    .maybeSingle();

  return data ? asView(data as unknown as ContractRow) : null;
}

/** A property can only carry one live season at a time. */
export async function hasLiveContract(propertyId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { count } = await supabase
    .from("contracts")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId)
    .in("status", ["DRAFT", "ACTIVE", "PAUSED"]);

  return (count ?? 0) > 0;
}
