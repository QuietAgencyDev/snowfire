"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { getAdminRequest } from "@/lib/bookings/queries";
import { getContract, hasLiveContract } from "@/lib/contracts/queries";
import {
  billingSchedule,
  prorateSeason,
  seasonWindow,
  termSheet,
  type BillingFrequency,
} from "@/lib/contracts/terms";
import { formatCadFromCents } from "@/lib/money";
import { writeNotification } from "@/lib/notifications/write";
import { quoteSnowRateForProperty } from "@/lib/pricing/rate-card";
import { todayInTimeZone } from "@/lib/pricing/quote-math";
import { getPropertyForStaff } from "@/lib/properties/queries";
import { isAdminRole } from "@/lib/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ContractStatus } from "@/types/database";

export type ContractFormState = {
  error?: string;
  message?: string;
};

const FREQUENCIES: BillingFrequency[] = ["PREPAID", "MONTHLY"];

const STATUSES: ContractStatus[] = ["DRAFT", "ACTIVE", "PAUSED", "EXPIRED", "CANCELLED"];

function revalidateContracts(contractId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/contracts");
  revalidatePath("/customer");
  revalidatePath("/customer/contracts");

  if (contractId) {
    revalidatePath(`/admin/contracts/${contractId}`);
  }
}

export async function issueContractAction(
  _prev: ContractFormState,
  formData: FormData,
): Promise<ContractFormState> {
  const profile = await getSessionProfile();

  if (!profile || !isAdminRole(profile.role)) {
    return { error: "Only operations can issue a contract." };
  }

  const requestId = String(formData.get("requestId") ?? "");
  const frequencyRaw = String(formData.get("billingFrequency") ?? "PREPAID");
  const frequency = FREQUENCIES.includes(frequencyRaw as BillingFrequency)
    ? (frequencyRaw as BillingFrequency)
    : "PREPAID";

  const request = await getAdminRequest(requestId);

  if (!request) {
    return { error: "That request was not found." };
  }

  if (request.service_type !== "SEASONAL") {
    return { error: "Only a seasonal request becomes a contract." };
  }

  if (request.status !== "APPROVED") {
    return { error: "Approve the request before issuing the contract." };
  }

  const property = await getPropertyForStaff(request.property_id);

  if (!property) {
    return { error: "That property was not found." };
  }

  if (await hasLiveContract(property.id)) {
    return { error: "This driveway already has a live contract." };
  }

  const rate = quoteSnowRateForProperty("SEASONAL", property);

  if (!rate) {
    return { error: "No seasonal rate is published for this driveway." };
  }

  const today = todayInTimeZone("America/Toronto");
  const window = seasonWindow(rate.market, today);

  let prorated;

  try {
    prorated = prorateSeason(rate.amountCents, window, today);
  } catch {
    return { error: "That season has already ended. Start the next one instead." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("contracts")
    .insert({
      customer_id: request.customer_id,
      property_id: property.id,
      service_id: request.service_id,
      contract_type: "SEASONAL",
      start_date: prorated.startDate,
      end_date: window.endDate,
      status: "DRAFT",
      price: prorated.amountCents,
      billing_frequency: frequency,
      terms: termSheet({
        marketLabel: rate.marketLabel,
        drivewayClassLabel: rate.drivewayClassLabel,
        triggerCm: rate.triggerCm,
        season: window,
        prorated,
        frequency,
      }),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Unable to issue this contract right now." };
  }

  revalidateContracts(data.id);
  redirect(`/admin/contracts/${data.id}`);
}

export async function updateContractStatusAction(
  _prev: ContractFormState,
  formData: FormData,
): Promise<ContractFormState> {
  const profile = await getSessionProfile();

  if (!profile || !isAdminRole(profile.role)) {
    return { error: "Only operations can change a contract." };
  }

  const contractId = String(formData.get("contractId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!STATUSES.includes(status as ContractStatus)) {
    return { error: "That contract status is not valid." };
  }

  const contract = await getContract(contractId);

  if (!contract) {
    return { error: "That contract was not found." };
  }

  if (contract.status === status) {
    return { message: "Already there." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { error } = await supabase
    .from("contracts")
    .update({ status })
    .eq("id", contract.id);

  if (error) {
    return { error: "Unable to update this contract right now." };
  }

  if (status === "ACTIVE") {
    const schedule = billingSchedule({
      amountCents: contract.price,
      frequency: contract.billing_frequency === "MONTHLY" ? "MONTHLY" : "PREPAID",
      startDate: contract.start_date,
      endDate: contract.end_date ?? contract.start_date,
    });
    const firstDue = schedule[0];

    await writeNotification({
      userId: contract.customer_id,
      type: "BOOKING_APPROVED",
      title: "Your season is booked",
      body: `${contract.property_name} is covered to ${contract.end_date}. First payment is ${formatCadFromCents(firstDue.amountCents)} on ${firstDue.dueDate}. Nothing is charged until Stripe is live.`,
      metadata: { contractId: contract.id },
    });
  }

  revalidateContracts(contract.id);
  return { message: "Contract updated." };
}
