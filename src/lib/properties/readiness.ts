function propertyCoordinates(property: {
  latitude: string | number | null;
  longitude: string | number | null;
}): boolean {
  const latitude =
    property.latitude == null || property.latitude === ""
      ? null
      : Number(property.latitude);
  const longitude =
    property.longitude == null || property.longitude === ""
      ? null
      : Number(property.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude);
}

function preferenceList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

type ReadinessProperty = {
  latitude: string | number | null;
  longitude: string | number | null;
  driveway_type: string | null;
  snow_storage_location: string | null;
  hazards: string | null;
  special_instructions: string | null;
  service_preferences: string[] | null;
};

export type ReadinessCheck = {
  id: string;
  label: string;
  done: boolean;
  points: number;
};

export type ReadinessReport = {
  score: number;
  max: number;
  checks: ReadinessCheck[];
  headline: string;
  nextStep: string;
};

const TREATMENT_IDS = new Set([
  "salted",
  "unsalted",
  "sand",
  "ice_melt",
  "calcium",
  "magnesium",
]);

const AREA_IDS = new Set([
  "driveway",
  "walkways",
  "steps",
  "porch",
  "sidewalk",
  "mailbox",
  "hydrant",
  "parking_pad",
]);

export function winterReadiness(input: {
  property: ReadinessProperty;
  profile: { phone: string | null };
  drivewayPhotoCount: number;
  finishedPhotoCount: number;
}): ReadinessReport {
  const prefs = preferenceList(input.property.service_preferences);
  const checks: ReadinessCheck[] = [
    {
      id: "pin",
      label: "Address pinned on the map",
      done: Boolean(propertyCoordinates(input.property)),
      points: 20,
    },
    {
      id: "treatment",
      label: "Salted, unsalted, or melt chosen",
      done: prefs.some((id) => TREATMENT_IDS.has(id)),
      points: 15,
    },
    {
      id: "areas",
      label: "Surfaces to clear are checked",
      done: prefs.some((id) => AREA_IDS.has(id)),
      points: 10,
    },
    {
      id: "surface",
      label: "Driveway surface noted",
      done: Boolean(input.property.driveway_type),
      points: 10,
    },
    {
      id: "storage",
      label: "Snow storage spot written",
      done: Boolean(input.property.snow_storage_location),
      points: 10,
    },
    {
      id: "photo",
      label: "Client driveway photo",
      done: input.drivewayPhotoCount > 0,
      points: 15,
    },
    {
      id: "finished",
      label: "Finished driveway photo",
      done: input.finishedPhotoCount > 0,
      points: 5,
    },
    {
      id: "phone",
      label: "Phone on the client card",
      done: Boolean(input.profile.phone && input.profile.phone.length >= 7),
      points: 10,
    },
    {
      id: "hazards",
      label: "Hazards or site notes",
      done: Boolean(input.property.hazards || input.property.special_instructions),
      points: 5,
    },
  ];

  const max = checks.reduce((sum, check) => sum + check.points, 0);
  const earned = checks
    .filter((check) => check.done)
    .reduce((sum, check) => sum + check.points, 0);
  const score = Math.round((earned / max) * 100);
  const next = checks.find((check) => !check.done);

  return {
    score,
    max,
    checks,
    headline:
      score >= 90
        ? "Award-ready property file"
        : score >= 70
          ? "Crew-ready — a few details left"
          : score >= 40
            ? "Good start — finish the winter file"
            : "Let’s build this driveway’s winter file",
    nextStep: next ? `Next: ${next.label.toLowerCase()}.` : "This property file is complete.",
  };
}
