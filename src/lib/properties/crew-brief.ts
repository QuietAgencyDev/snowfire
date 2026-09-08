import { formatPropertyAddress, type AddressParts } from "./address";
import { asPreferenceList, servicePreferenceLabel } from "./service-options";
import type { IceRiskReport } from "../weather/ice-risk";
import type { LocalWeatherReport } from "../weather/types";

type BriefProperty = AddressParts & {
  name: string;
  driveway_type: string | null;
  snow_storage_location: string | null;
  roof_type: string | null;
  roof_notes: string | null;
  salt_puck_count: number | null;
  hazards: string | null;
  special_instructions: string | null;
  service_preferences: string[] | null;
};

export type CrewBrief = {
  title: string;
  address: string;
  client: string;
  phone: string;
  weatherLine: string;
  iceLine: string;
  treatments: string[];
  areas: string[];
  roof: string[];
  site: string[];
  hazards: string;
  instructions: string;
  storage: string;
  surface: string;
  roofType: string;
  puckCount: string;
  roofNotes: string;
};

export function buildCrewBrief(input: {
  property: BriefProperty;
  profile: { first_name: string; last_name: string; phone: string | null };
  weather: LocalWeatherReport | null;
  risk: IceRiskReport | null;
}): CrewBrief {
  const prefs = asPreferenceList(input.property.service_preferences);
  const treatmentIds = new Set([
    "salted",
    "unsalted",
    "sand",
    "ice_melt",
    "calcium",
    "magnesium",
  ]);
  const areaIds = new Set([
    "driveway",
    "walkways",
    "steps",
    "porch",
    "sidewalk",
    "mailbox",
    "hydrant",
    "parking_pad",
  ]);
  const roofIds = new Set([
    "roof_salt_pucks",
    "ice_dam_history",
    "steep_roof",
    "solar_or_skylight",
  ]);

  return {
    title: `${input.property.name} · crew brief`,
    address: formatPropertyAddress(input.property),
    client: `${input.profile.first_name} ${input.profile.last_name}`.trim(),
    phone: input.profile.phone || "No phone on file",
    weatherLine: input.weather
      ? `${Math.round(input.weather.temperatureC)}°C · ${input.weather.summary}`
      : "Weather unlocks after the address is pinned.",
    iceLine: input.risk
      ? `${input.risk.label} · ${input.risk.next48hSnowCm} cm snow / 48h`
      : "Ice risk appears with the local forecast.",
    treatments: prefs.filter((id) => treatmentIds.has(id)).map(servicePreferenceLabel),
    areas: prefs.filter((id) => areaIds.has(id)).map(servicePreferenceLabel),
    roof: prefs.filter((id) => roofIds.has(id)).map(servicePreferenceLabel),
    site: prefs
      .filter((id) => !treatmentIds.has(id) && !areaIds.has(id) && !roofIds.has(id))
      .map(servicePreferenceLabel),
    hazards: input.property.hazards || "None noted",
    instructions: input.property.special_instructions || "None noted",
    storage: input.property.snow_storage_location || "Not set",
    surface: input.property.driveway_type || "Not set",
    roofType: input.property.roof_type || "Not set",
    puckCount:
      input.property.salt_puck_count && input.property.salt_puck_count > 0
        ? String(input.property.salt_puck_count)
        : "Not set",
    roofNotes: input.property.roof_notes || "None noted",
  };
}

export function crewBriefText(brief: CrewBrief): string {
  const list = (items: string[]) => (items.length ? items.join(", ") : "None checked");

  return [
    brief.title.toUpperCase(),
    brief.address,
    `Client: ${brief.client} · ${brief.phone}`,
    `Now: ${brief.weatherLine}`,
    `Ice: ${brief.iceLine}`,
    `Surface: ${brief.surface} · Snow pile: ${brief.storage}`,
    `Treatment: ${list(brief.treatments)}`,
    `Clear: ${list(brief.areas)}`,
    `Roof: ${brief.roofType} · ${brief.puckCount} pucks · ${list(brief.roof)}`,
    `Roof notes: ${brief.roofNotes}`,
    `Site: ${list(brief.site)}`,
    `Hazards: ${brief.hazards}`,
    `Instructions: ${brief.instructions}`,
    "SnowFire.ca · property file — not a booked job",
  ].join("\n");
}
