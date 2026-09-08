import { z } from "zod";
import { isOnOrAfterDay } from "@/lib/pricing/quote-math";
import { PREFERRED_TIMES } from "@/lib/bookings/labels";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export const bookingRequestSchema = z.object({
  propertyId: z.string().uuid("Choose a property."),
  serviceId: z.string().uuid("Choose a service."),
  requestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  preferredTime: z.enum(PREFERRED_TIMES),
  customerNotes: z.preprocess(asString, z.string().trim().max(2000)),
});

export const woodRequestSchema = z.object({
  propertyId: z.string().uuid("Choose a delivery property."),
  productId: z.string().uuid("Choose a product."),
  quantity: z.coerce.number().int().min(1, "Order at least one unit."),
  fulfillment: z.enum(["delivery", "pickup"]),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.").optional().or(z.literal("")),
  deliveryNotes: z.preprocess(asString, z.string().trim().max(2000)),
});

export function parseBookingForm(formData: FormData, today: string) {
  const parsed = bookingRequestSchema.safeParse({
    propertyId: formData.get("propertyId"),
    serviceId: formData.get("serviceId"),
    requestedDate: formData.get("requestedDate"),
    preferredTime: formData.get("preferredTime"),
    customerNotes: formData.get("customerNotes"),
  });

  if (!parsed.success) {
    return parsed;
  }

  if (!isOnOrAfterDay(parsed.data.requestedDate, today)) {
    return {
      success: false as const,
      error: {
        issues: [{ message: "Choose today or a later date." }],
      },
    };
  }

  return parsed;
}

export function parseWoodRequestForm(formData: FormData, today: string) {
  const parsed = woodRequestSchema.safeParse({
    propertyId: formData.get("propertyId"),
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
    fulfillment: formData.get("fulfillment"),
    deliveryDate: formData.get("deliveryDate"),
    deliveryNotes: formData.get("deliveryNotes"),
  });

  if (!parsed.success) {
    return parsed;
  }

  if (parsed.data.fulfillment === "delivery" && !parsed.data.deliveryDate) {
    return {
      success: false as const,
      error: {
        issues: [{ message: "Choose a delivery date." }],
      },
    };
  }

  const date = parsed.data.deliveryDate || today;

  if (!isOnOrAfterDay(date, today)) {
    return {
      success: false as const,
      error: {
        issues: [{ message: "Choose today or a later date." }],
      },
    };
  }

  return {
    success: true as const,
    data: {
      ...parsed.data,
      deliveryDate: parsed.data.fulfillment === "pickup" ? parsed.data.deliveryDate || null : date,
    },
  };
}
