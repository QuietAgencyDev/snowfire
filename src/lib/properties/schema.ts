import { z } from "zod";
import { formatPostalCode } from "./address";
import { PROVINCE_CODES } from "./provinces";
import { parseFirewoodPreferences } from "../firewood/options";
import { parseServicePreferences, prefersDeicing } from "./service-options";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

const optionalText = z.preprocess(asString, z.string().trim().transform((value) => (value ? value : null)));

const optionalCount = z.preprocess(asString, z.string().trim().transform((value) => {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}));

const optionalMeasure = z.preprocess(asString, z.string().trim().transform((value) => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}));

export const propertySchema = z.object({
  name: z.string().trim().min(1, "Give this property a name."),
  propertyType: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
  addressLine1: z.string().trim().min(3, "Enter the street address."),
  addressLine2: optionalText,
  city: z.string().trim().min(2, "Enter the city."),
  province: z.enum(PROVINCE_CODES, { error: "Choose a province or territory." }),
  postalCode: z
    .string()
    .trim()
    .transform(formatPostalCode)
    .refine((value) => /^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(value), {
      message: "Enter a Canadian postal code, like K1A 0B1.",
    }),
  drivewayType: optionalText,
  drivewayLength: optionalMeasure,
  drivewayWidth: optionalMeasure,
  parkingArea: optionalText,
  walkwayCount: optionalCount,
  stepsCount: optionalCount,
  snowStorageLocation: optionalText,
  deicingRequired: z.boolean(),
  servicePreferences: z.array(z.string()),
  roofType: optionalText,
  roofNotes: optionalText,
  saltPuckCount: optionalCount,
  firewoodPreferences: z.array(z.string()),
  firewoodStackLocation: optionalText,
  firewoodNotes: optionalText,
  hazards: optionalText,
  specialInstructions: optionalText,
});

export const clientInfoSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
});

export const propertyPhotoSchema = z.object({
  propertyId: z.string().uuid(),
  photoType: z.enum(["DRIVEWAY", "DRIVEWAY_FINISHED"]),
  caption: optionalText,
});

export type PropertyInput = z.infer<typeof propertySchema>;
export type ClientInfoInput = z.infer<typeof clientInfoSchema>;

export function parsePropertyForm(formData: FormData) {
  const servicePreferences = parseServicePreferences(formData.getAll("servicePreference"));
  const firewoodPreferences = parseFirewoodPreferences(formData.getAll("firewoodPreference"));

  return propertySchema.safeParse({
    name: formData.get("name"),
    propertyType: formData.get("propertyType"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2"),
    city: formData.get("city"),
    province: formData.get("province"),
    postalCode: formData.get("postalCode"),
    drivewayType: formData.get("drivewayType"),
    drivewayLength: formData.get("drivewayLength"),
    drivewayWidth: formData.get("drivewayWidth"),
    parkingArea: formData.get("parkingArea"),
    walkwayCount: formData.get("walkwayCount"),
    stepsCount: formData.get("stepsCount"),
    snowStorageLocation: formData.get("snowStorageLocation"),
    deicingRequired:
      formData.get("deicingRequired") === "on" || prefersDeicing(servicePreferences),
    servicePreferences,
    roofType: formData.get("roofType"),
    roofNotes: formData.get("roofNotes"),
    saltPuckCount: formData.get("saltPuckCount"),
    firewoodPreferences,
    firewoodStackLocation: formData.get("firewoodStackLocation"),
    firewoodNotes: formData.get("firewoodNotes"),
    hazards: formData.get("hazards"),
    specialInstructions: formData.get("specialInstructions"),
  });
}

export function parseClientInfoForm(formData: FormData) {
  return clientInfoSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
  });
}
