function preferenceList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

type WoodProperty = {
  firewood_preferences: string[] | null;
  firewood_stack_location: string | null;
  firewood_notes: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
};

export type WoodReadinessCheck = {
  id: string;
  label: string;
  done: boolean;
  points: number;
};

export type WoodReadinessReport = {
  score: number;
  checks: WoodReadinessCheck[];
  headline: string;
  nextStep: string;
};

export function woodReadiness(property: WoodProperty): WoodReadinessReport {
  const prefs = preferenceList(property.firewood_preferences);
  const latitude =
    property.latitude == null || property.latitude === ""
      ? null
      : Number(property.latitude);
  const longitude =
    property.longitude == null || property.longitude === ""
      ? null
      : Number(property.longitude);
  const pinned = Number.isFinite(latitude) && Number.isFinite(longitude);

  const checks: WoodReadinessCheck[] = [
    {
      id: "pin",
      label: "Delivery address pinned",
      done: pinned,
      points: 25,
    },
    {
      id: "how",
      label: "Deliver or pickup chosen",
      done: prefs.includes("deliver_to_property") || prefs.includes("pickup_yard"),
      points: 25,
    },
    {
      id: "stack",
      label: "Stack location written",
      done: Boolean(property.firewood_stack_location),
      points: 25,
    },
    {
      id: "access",
      label: "Access or crib noted",
      done:
        prefs.includes("truck_access") ||
        prefs.includes("covered_storage") ||
        Boolean(property.firewood_notes),
      points: 25,
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
    checks,
    headline:
      score >= 90
        ? "The truck can land this wood"
        : score >= 50
          ? "Woodshed file is halfway there"
          : "Tell us where the wood lives",
    nextStep: next ? `Next: ${next.label.toLowerCase()}.` : "Delivery file is complete.",
  };
}
