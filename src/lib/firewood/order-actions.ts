"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { parseWoodRequestForm } from "@/lib/bookings/schema";
import { customerCanCancelWoodOrder } from "@/lib/bookings/labels";
import { writeNotification } from "@/lib/notifications/write";
import { isOwnProperty } from "@/lib/properties/address";
import { getCustomerProperty } from "@/lib/properties/queries";
import {
  canFulfillInventory,
  quoteFirewoodLoad,
  todayInTimeZone,
} from "@/lib/pricing/quote-math";
import { isAdminRole } from "@/lib/roles";
import { getOntarioTaxBps } from "@/lib/settings/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type WoodOrderFormState = {
  error?: string;
  message?: string;
};

export async function createWoodRequestAction(
  _prev: WoodOrderFormState,
  formData: FormData,
): Promise<WoodOrderFormState> {
  const profile = await getSessionProfile();

  if (!profile || profile.role !== "CUSTOMER") {
    return { error: "Sign in as a customer to request wood." };
  }

  const parsed = parseWoodRequestForm(formData, todayInTimeZone("America/Toronto"));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the wood request." };
  }

  const property = await getCustomerProperty(parsed.data.propertyId, profile.id);

  if (!property || !isOwnProperty(property.customer_id, profile.id)) {
    return { error: "That property was not found." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { data: product } = await supabase
    .from("firewood_products")
    .select("*")
    .eq("id", parsed.data.productId)
    .eq("active", true)
    .maybeSingle();

  if (!product) {
    return { error: "That product is not in the yard." };
  }

  if (parsed.data.fulfillment === "delivery" && !product.delivery_available) {
    return { error: "This load is pickup only." };
  }

  if (parsed.data.fulfillment === "pickup" && !product.pickup_available) {
    return { error: "This load is delivery only." };
  }

  if (!canFulfillInventory(product.inventory_quantity, parsed.data.quantity)) {
    return { error: "The crib does not have that many left." };
  }

  const taxBps = await getOntarioTaxBps();
  const totals = quoteFirewoodLoad({
    unitPriceCents: product.price,
    quantity: parsed.data.quantity,
    taxBps,
  });
  const notes = [
    parsed.data.fulfillment === "pickup" ? "Pickup at the yard." : "Deliver to the property.",
    parsed.data.deliveryNotes,
  ]
    .filter(Boolean)
    .join(" ");

  const { data: order, error: orderError } = await supabase
    .from("firewood_orders")
    .insert({
      customer_id: profile.id,
      property_id: property.id,
      status: "PENDING",
      delivery_date: parsed.data.deliveryDate,
      delivery_notes: notes || null,
      subtotal: totals.subtotal,
      delivery_fee: totals.deliveryFee,
      tax: totals.tax,
      total: totals.total,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: "Unable to save this wood request right now." };
  }

  const { error: itemError } = await supabase.from("firewood_order_items").insert({
    order_id: order.id,
    product_id: product.id,
    quantity: parsed.data.quantity,
    unit_price: product.price,
    total: totals.subtotal,
  });

  if (itemError) {
    await supabase.from("firewood_orders").delete().eq("id", order.id).eq("customer_id", profile.id);
    return { error: "Unable to save this wood request right now." };
  }

  await writeNotification({
    userId: profile.id,
    type: "FIREWOOD_ORDER_RECEIVED",
    title: "Wood request received",
    body: `${product.name} is requested, not paid, and not confirmed.`,
    metadata: { orderId: order.id },
  });

  revalidatePath("/customer");
  revalidatePath("/customer/firewood");
  revalidatePath("/customer/requests");
  revalidatePath("/admin");
  redirect(`/customer/orders/${order.id}`);
}

export async function cancelWoodRequestAction(formData: FormData): Promise<void> {
  const profile = await getSessionProfile();
  const orderId = String(formData.get("orderId") ?? "");

  if (!profile || profile.role !== "CUSTOMER" || !orderId) {
    return;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return;
  }

  const { data } = await supabase
    .from("firewood_orders")
    .select("id, status")
    .eq("id", orderId)
    .eq("customer_id", profile.id)
    .maybeSingle();

  if (!data || !customerCanCancelWoodOrder(data.status)) {
    return;
  }

  await supabase
    .from("firewood_orders")
    .update({ status: "CANCELLED" })
    .eq("id", orderId)
    .eq("customer_id", profile.id)
    .eq("status", "PENDING");

  revalidatePath("/customer/requests");
  revalidatePath(`/customer/orders/${orderId}`);
  revalidatePath("/admin");
}

export async function reviewWoodRequestAction(
  _prev: WoodOrderFormState,
  formData: FormData,
): Promise<WoodOrderFormState> {
  const profile = await getSessionProfile();

  if (!profile || !isAdminRole(profile.role)) {
    return { error: "Only operations can accept a wood request." };
  }

  const orderId = String(formData.get("orderId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  if (!orderId || (decision !== "CONFIRMED" && decision !== "CANCELLED")) {
    return { error: "Choose accept or cancel." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { data: order } = await supabase
    .from("firewood_orders")
    .select("id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.status !== "PENDING") {
    return { error: "That wood request is no longer pending." };
  }

  if (decision === "CANCELLED") {
    const { error } = await supabase
      .from("firewood_orders")
      .update({ status: "CANCELLED" })
      .eq("id", orderId)
      .eq("status", "PENDING");

    if (error) {
      return { error: "Unable to cancel that request right now." };
    }

    revalidatePath("/admin");
    redirect(`/admin/orders/${orderId}`);
  }

  const { data: items } = await supabase
    .from("firewood_order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  const item = items?.[0];

  if (!item) {
    return { error: "That request has no wood on it." };
  }

  const { data: product } = await supabase
    .from("firewood_products")
    .select("id, inventory_quantity")
    .eq("id", item.product_id)
    .maybeSingle();

  if (!product || !canFulfillInventory(product.inventory_quantity, item.quantity)) {
    return { error: "The crib does not have enough left to accept this load." };
  }

  const { data: updated, error: stockError } = await supabase
    .from("firewood_products")
    .update({ inventory_quantity: product.inventory_quantity - item.quantity })
    .eq("id", product.id)
    .gte("inventory_quantity", item.quantity)
    .select("id")
    .maybeSingle();

  if (stockError || !updated) {
    return { error: "The crib does not have enough left to accept this load." };
  }

  const { error } = await supabase
    .from("firewood_orders")
    .update({ status: "CONFIRMED" })
    .eq("id", orderId)
    .eq("status", "PENDING");

  if (error) {
    await supabase
      .from("firewood_products")
      .update({ inventory_quantity: product.inventory_quantity })
      .eq("id", product.id);
    return { error: "Unable to accept that request right now." };
  }

  revalidatePath("/admin");
  revalidatePath("/customer/firewood");
  revalidatePath("/customer/requests");
  redirect(`/admin/orders/${orderId}`);
}
