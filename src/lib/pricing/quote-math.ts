export type BookingMode = "ADMIN_APPROVAL" | "AUTO_CONFIRM";

export type SnowQuote = {
  amountCents: number;
  custom: boolean;
  label: string;
};

export function quoteSnowService(input: {
  basePrice: number;
  pricingModel: string;
}): SnowQuote {
  if (!Number.isInteger(input.basePrice) || input.basePrice < 0) {
    throw new Error("Service price must be integer cents.");
  }

  if (input.pricingModel === "CUSTOM_QUOTE" || input.basePrice === 0) {
    return {
      amountCents: 0,
      custom: true,
      label: "Custom quote after the visit",
    };
  }

  return {
    amountCents: input.basePrice,
    custom: false,
    label: "Listed price",
  };
}

export function quoteFirewoodLoad(input: {
  unitPriceCents: number;
  quantity: number;
  taxBps: number;
  deliveryFeeCents?: number;
}): { subtotal: number; deliveryFee: number; tax: number; total: number } {
  const deliveryFee = input.deliveryFeeCents ?? 0;

  if (!Number.isInteger(input.unitPriceCents) || input.unitPriceCents < 0) {
    throw new Error("Unit price must be integer cents.");
  }

  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    throw new Error("Quantity must be a whole number of at least 1.");
  }

  if (!Number.isInteger(input.taxBps) || input.taxBps < 0) {
    throw new Error("Tax rate must be integer basis points.");
  }

  if (!Number.isInteger(deliveryFee) || deliveryFee < 0) {
    throw new Error("Delivery fee must be integer cents.");
  }

  const subtotal = input.unitPriceCents * input.quantity;
  const taxable = subtotal + deliveryFee;
  const tax = Math.round((taxable * input.taxBps) / 10_000);

  return {
    subtotal,
    deliveryFee,
    tax,
    total: subtotal + deliveryFee + tax,
  };
}

export function canFulfillInventory(inventory: number, quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= inventory;
}

export function initialRequestStatus(mode: BookingMode): "ADMIN_REVIEW" | "APPROVED" {
  return mode === "AUTO_CONFIRM" ? "APPROVED" : "ADMIN_REVIEW";
}

export function isOnOrAfterDay(requested: string, today: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(requested) && /^\d{4}-\d{2}-\d{2}$/.test(today) && requested >= today;
}

export function todayInTimeZone(timeZone: string, at = new Date()): string {
  return at.toLocaleDateString("en-CA", { timeZone });
}
