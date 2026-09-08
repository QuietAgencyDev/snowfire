import { formatPropertyAddress } from "@/lib/properties/address";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FirewoodOrderView } from "@/types/database";

type OrderRow = {
  id: string;
  customer_id: string;
  property_id: string;
  status: FirewoodOrderView["status"];
  delivery_date: string | null;
  delivery_notes: string | null;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  stripe_payment_intent_id: string | null;
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
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
  firewood_order_items: Array<{
    quantity: number;
    firewood_products: { name: string; quantity_unit: string } | { name: string; quantity_unit: string }[] | null;
  }> | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function asView(row: OrderRow): FirewoodOrderView {
  const item = first(row.firewood_order_items);
  const property = first(row.properties);
  const profile = first(row.profiles);

  return {
    id: row.id,
    customer_id: row.customer_id,
    property_id: row.property_id,
    status: row.status,
    delivery_date: row.delivery_date,
    delivery_notes: row.delivery_notes,
    subtotal: row.subtotal,
    delivery_fee: row.delivery_fee,
    tax: row.tax,
    total: row.total,
    stripe_payment_intent_id: row.stripe_payment_intent_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    property_name: property?.name ?? "Property",
    property_address: property ? formatPropertyAddress(property) : "Address unavailable",
    customer_name: profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Customer",
    product_name: first(item?.firewood_products)?.name ?? "Firewood",
    quantity: item?.quantity ?? 0,
    quantity_unit: first(item?.firewood_products)?.quantity_unit ?? "unit",
  };
}

const ORDER_SELECT = `
  id, customer_id, property_id, status, delivery_date, delivery_notes,
  subtotal, delivery_fee, tax, total, stripe_payment_intent_id, created_at, updated_at,
  properties ( name, address_line_1, address_line_2, city, province, postal_code ),
  profiles!firewood_orders_customer_id_fkey ( first_name, last_name ),
  firewood_order_items ( quantity, firewood_products ( name, quantity_unit ) )
`;

export async function listCustomerWoodOrders(customerId: string): Promise<FirewoodOrderView[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("firewood_orders")
    .select(ORDER_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as OrderRow[]).map(asView);
}

export async function getCustomerWoodOrder(
  orderId: string,
  customerId: string,
): Promise<FirewoodOrderView | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("firewood_orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .eq("customer_id", customerId)
    .maybeSingle();

  return data ? asView(data as unknown as OrderRow) : null;
}

export async function listOpenWoodOrders(): Promise<FirewoodOrderView[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("firewood_orders")
    .select(ORDER_SELECT)
    .in("status", ["PENDING", "CONFIRMED", "PREPARING"])
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as OrderRow[]).map(asView);
}

export async function getAdminWoodOrder(orderId: string): Promise<FirewoodOrderView | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("firewood_orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .maybeSingle();

  return data ? asView(data as unknown as OrderRow) : null;
}
