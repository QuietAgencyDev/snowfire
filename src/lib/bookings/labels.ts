import type { FirewoodOrderStatus, ServiceRequestStatus } from "@/types/database";

export const PREFERRED_TIMES = [
  "First available",
  "Morning",
  "Afternoon",
  "Evening",
] as const;

export function requestStatusLabel(status: ServiceRequestStatus): string {
  switch (status) {
    case "CUSTOMER_REQUESTED":
      return "Requested";
    case "ADMIN_REVIEW":
      return "In review";
    case "APPROVED":
      return "Approved — waiting for dispatch";
    case "DECLINED":
      return "Declined";
    case "CANCELLED":
      return "Cancelled";
    case "CONVERTED_TO_JOB":
      return "Converted to a job";
  }
}

export function woodOrderStatusLabel(status: FirewoodOrderStatus): string {
  switch (status) {
    case "PENDING":
      return "Requested — not paid";
    case "CONFIRMED":
      return "Yard accepted — not paid";
    case "PREPARING":
      return "Preparing";
    case "OUT_FOR_DELIVERY":
      return "Out for delivery";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
  }
}

export function customerCanCancelRequest(status: ServiceRequestStatus): boolean {
  return status === "CUSTOMER_REQUESTED" || status === "ADMIN_REVIEW" || status === "APPROVED";
}

export function customerCanCancelWoodOrder(status: FirewoodOrderStatus): boolean {
  return status === "PENDING";
}
