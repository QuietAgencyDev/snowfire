import type { Property } from "@/types/database";

export type AddressParts = {
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  province: string;
  postal_code: string;
};

export function formatPostalCode(value: string): string {
  const compact = value.replace(/\s+/g, "").toUpperCase();

  if (compact.length === 6) {
    return `${compact.slice(0, 3)} ${compact.slice(3)}`;
  }

  return value.trim().toUpperCase();
}

export function formatPropertyAddress(property: AddressParts): string {
  const street = [property.address_line_1, property.address_line_2]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

  return `${street}, ${property.city}, ${property.province} ${formatPostalCode(property.postal_code)}`;
}

export function toCoordinate(value: Property["latitude"]): number | null {
  if (value == null || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isOwnProperty(customerId: string, profileId: string) {
  return customerId === profileId;
}

export function propertyCoordinates(property: Pick<Property, "latitude" | "longitude">): {
  latitude: number;
  longitude: number;
} | null {
  const latitude = toCoordinate(property.latitude);
  const longitude = toCoordinate(property.longitude);

  if (latitude == null || longitude == null) {
    return null;
  }

  return { latitude, longitude };
}
