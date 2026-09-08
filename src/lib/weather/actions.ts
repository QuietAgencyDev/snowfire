"use server";

import { geocodeAddress } from "@/lib/maps/geocode";
import { formatPropertyAddress } from "@/lib/properties/address";
import { CANADIAN_PROVINCES } from "@/lib/properties/provinces";
import { getLocalWeatherReport } from "@/lib/weather/open-meteo";
import type { LocalWeatherReport } from "@/lib/weather/types";

export type WeatherPreviewFields = {
  name: string;
  propertyType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
};

export type WeatherPreviewState = {
  error?: string;
  address?: string;
  report?: LocalWeatherReport;
  fields?: WeatherPreviewFields;
};

export async function previewPropertyWeatherAction(
  _prev: WeatherPreviewState,
  formData: FormData,
): Promise<WeatherPreviewState> {
  const fields: WeatherPreviewFields = {
    name: String(formData.get("name") ?? "").trim(),
    propertyType: String(formData.get("propertyType") ?? "RESIDENTIAL"),
    addressLine1: String(formData.get("addressLine1") ?? "").trim(),
    addressLine2: String(formData.get("addressLine2") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    province: String(formData.get("province") ?? "").trim(),
    postalCode: String(formData.get("postalCode") ?? "").trim(),
  };

  if (fields.addressLine1.length < 3 || fields.city.length < 2 || !fields.province) {
    return { error: "Add the street, city, and province first.", fields };
  }

  const provinceLabel =
    CANADIAN_PROVINCES.find((item) => item.value === fields.province)?.label ??
    fields.province;
  const address = formatPropertyAddress({
    address_line_1: fields.addressLine1,
    address_line_2: fields.addressLine2,
    city: fields.city,
    province: fields.province,
    postal_code: fields.postalCode || "A1A 1A1",
  });

  const point = await geocodeAddress(
    fields.postalCode
      ? address
      : `${fields.addressLine1}, ${fields.city}, ${provinceLabel}, Canada`,
  );

  if (!point) {
    return {
      error: "We could not pin that address yet. Check the street and postal code.",
      fields,
    };
  }

  const report = await getLocalWeatherReport(point.latitude, point.longitude);

  if (!report) {
    return {
      error: "Weather is unavailable for that pin right now. Try again in a minute.",
      fields,
    };
  }

  return { address, report, fields };
}
