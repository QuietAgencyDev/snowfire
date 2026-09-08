export const SERVICE_OPTION_GROUPS = [
  {
    id: "treatment",
    title: "Salt, sand, and melt",
    blurb: "Pick how you want ice handled. The crew sees this on every visit.",
    tone: "fire" as const,
    options: [
      { id: "salted", label: "Salted", hint: "Rock salt on the driveway after clearing" },
      { id: "unsalted", label: "Unsalted", hint: "No salt — pets, well water, or new concrete" },
      { id: "sand", label: "Sand", hint: "Grit for traction, no chloride" },
      { id: "ice_melt", label: "Ice melt", hint: "Bagged melt, usually gentler than rock salt" },
      { id: "calcium", label: "Calcium chloride", hint: "Works when it is bitterly cold" },
      { id: "magnesium", label: "Magnesium chloride", hint: "Easier on concrete and metal" },
    ],
  },
  {
    id: "areas",
    title: "Clear these spots",
    blurb: "Check every surface you want finished, not just the apron.",
    tone: "ice" as const,
    options: [
      { id: "driveway", label: "Driveway", hint: "Main plow and shovel path" },
      { id: "walkways", label: "Walkways", hint: "House walks and side paths" },
      { id: "steps", label: "Steps", hint: "Front or back stairs" },
      { id: "porch", label: "Porch / landing", hint: "Keep the entrance clear" },
      { id: "sidewalk", label: "Municipal sidewalk", hint: "If you are responsible for the boulevard" },
      { id: "mailbox", label: "Mailbox path", hint: "A clean path to the box" },
      { id: "hydrant", label: "Fire hydrant", hint: "Keep the hydrant open" },
      { id: "parking_pad", label: "Parking pad / extra stall", hint: "Second car or visitor spot" },
    ],
  },
  {
    id: "roof",
    title: "Roof salt pucks",
    blurb: "Ice dams start at the eaves. Pucks open a melt path before water backs under the shingles.",
    tone: "gold" as const,
    options: [
      {
        id: "roof_salt_pucks",
        label: "Salt pucks on the roof",
        hint: "Place pucks along eaves, valleys, and known ice-dam lines",
      },
      {
        id: "ice_dam_history",
        label: "This roof ice-dams",
        hint: "We have had ice dams, ice candles, or a roof leak",
      },
      {
        id: "steep_roof",
        label: "Steep or two-storey roof",
        hint: "Ladder or lift may be needed — note it for the crew",
      },
      {
        id: "solar_or_skylight",
        label: "Solar, skylight, or satellite",
        hint: "Keep pucks and melt off glass and panels",
      },
    ],
  },
  {
    id: "dispatch",
    title: "When we roll out",
    blurb:
      "The snowfall that sends a crew. A lower trigger means more visits over the winter, so it costs more.",
    tone: "ice" as const,
    options: [
      {
        id: "trigger_priority",
        label: "Priority — roll at 2.5 cm",
        hint: "Cleared before most people leave for work, instead of waiting for 5 cm",
      },
    ],
  },
  {
    id: "site",
    title: "Site and access",
    blurb: "These details keep the crew safe and on time.",
    tone: "forest" as const,
    options: [
      { id: "cars_moved", label: "Cars will be moved", hint: "Driveway empty before we arrive" },
      { id: "gate_code", label: "Gate or code access", hint: "Write the code in instructions" },
      { id: "pets_on_site", label: "Pets on site", hint: "We will watch for animals" },
      { id: "heated_driveway", label: "Heated driveway", hint: "Do not salt over heating loops" },
      { id: "new_concrete", label: "New concrete / interlock", hint: "Avoid harsh salt" },
      { id: "steep_grade", label: "Steep grade", hint: "Extra traction needed" },
      { id: "low_clearance", label: "Low wires or branches", hint: "Watch the plow height" },
      { id: "quiet_hours", label: "Quiet hours", hint: "Note the window in instructions" },
    ],
  },
] as const;

export const SERVICE_OPTION_IDS = SERVICE_OPTION_GROUPS.flatMap((group) =>
  group.options.map((option) => option.id),
);

export type ServicePreferenceId = (typeof SERVICE_OPTION_IDS)[number];

const DEICE_IDS = new Set(["salted", "ice_melt", "calcium", "magnesium", "roof_salt_pucks"]);

export function isServicePreferenceId(value: string): value is ServicePreferenceId {
  return (SERVICE_OPTION_IDS as readonly string[]).includes(value);
}

export function parseServicePreferences(values: unknown[]): ServicePreferenceId[] {
  return values.filter((value): value is ServicePreferenceId => {
    return typeof value === "string" && isServicePreferenceId(value);
  });
}

export function asPreferenceList(value: unknown): ServicePreferenceId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return parseServicePreferences(value);
}

export function prefersDeicing(preferences: readonly string[]): boolean {
  return preferences.some((value) => DEICE_IDS.has(value));
}

export function servicePreferenceLabel(id: string): string {
  for (const group of SERVICE_OPTION_GROUPS) {
    const match = group.options.find((option) => option.id === id);
    if (match) {
      return match.label;
    }
  }

  return id;
}
