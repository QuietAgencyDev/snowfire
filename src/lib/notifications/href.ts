export type NotificationSurface = "CUSTOMER" | "CREW" | "ADMIN";

function asId(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function notificationSurface(role: string): NotificationSurface {
  if (role === "CREW") {
    return "CREW";
  }

  if (role === "CUSTOMER") {
    return "CUSTOMER";
  }

  return "ADMIN";
}

export function notificationHref(
  role: string,
  metadata: Record<string, unknown> | null | undefined,
): string | null {
  const surface = notificationSurface(role);
  const jobId = asId(metadata?.jobId);
  const requestId = asId(metadata?.requestId);
  const orderId = asId(metadata?.orderId);
  const contractId = asId(metadata?.contractId);

  if (jobId) {
    if (surface === "CUSTOMER") {
      return `/customer/jobs/${jobId}`;
    }

    if (surface === "CREW") {
      return `/crew/jobs/${jobId}`;
    }

    return `/admin/jobs/${jobId}`;
  }

  if (requestId) {
    if (surface === "CUSTOMER") {
      return `/customer/requests/${requestId}`;
    }

    if (surface === "ADMIN") {
      return `/admin/requests/${requestId}`;
    }

    return null;
  }

  if (orderId) {
    if (surface === "CUSTOMER") {
      return `/customer/orders/${orderId}`;
    }

    if (surface === "ADMIN") {
      return `/admin/orders/${orderId}`;
    }

    return null;
  }

  if (contractId) {
    if (surface === "CUSTOMER") {
      return "/customer/contracts";
    }

    if (surface === "ADMIN") {
      return `/admin/contracts/${contractId}`;
    }

    return null;
  }

  return null;
}
