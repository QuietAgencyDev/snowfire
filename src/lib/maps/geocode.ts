import { getMapsApiKey } from "@/lib/env";

export type GeocodedPoint = {
  latitude: number;
  longitude: number;
  source: "google" | "nominatim";
};

type NominatimResult = {
  lat: string;
  lon: string;
};

type GoogleGeocodeResponse = {
  status: string;
  results?: Array<{
    geometry?: {
      location?: {
        lat: number;
        lng: number;
      };
    };
  }>;
};

export async function geocodeAddress(address: string): Promise<GeocodedPoint | null> {
  const mapsApiKey = getMapsApiKey();

  if (mapsApiKey) {
    const google = await geocodeWithGoogle(address, mapsApiKey);
    if (google) {
      return google;
    }
  }

  return geocodeWithNominatim(address);
}

async function geocodeWithGoogle(
  address: string,
  key: string,
): Promise<GeocodedPoint | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("region", "ca");
  url.searchParams.set("key", key);

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 7 } });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as GoogleGeocodeResponse;
  const location = payload.results?.[0]?.geometry?.location;

  if (payload.status !== "OK" || !location) {
    return null;
  }

  return {
    latitude: location.lat,
    longitude: location.lng,
    source: "google",
  };
}

async function geocodeWithNominatim(address: string): Promise<GeocodedPoint | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "ca");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "SnowFire/1.0 (property geocoding)",
    },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!response.ok) {
    return null;
  }

  const results = (await response.json()) as NominatimResult[];
  const match = results[0];

  if (!match) {
    return null;
  }

  const latitude = Number(match.lat);
  const longitude = Number(match.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude, source: "nominatim" };
}
