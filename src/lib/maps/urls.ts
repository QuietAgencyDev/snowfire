export function googleMapsQuery(input: {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}): string {
  if (input.latitude != null && input.longitude != null) {
    return `${input.latitude},${input.longitude}`;
  }

  return input.address;
}

export function googleMapsEmbedUrl(
  query: string,
  mapsApiKey?: string | null,
): string {
  if (mapsApiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapsApiKey)}&q=${encodeURIComponent(query)}`;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`;
}

export function googleMapsExternalUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function googleMapsDirectionsUrl(query: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}
