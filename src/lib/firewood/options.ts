export const FIREWOOD_OPTION_GROUPS = [
  {
    id: "how",
    title: "How the wood arrives",
    blurb: "The yard uses this so the truck does not guess at your door.",
    options: [
      { id: "deliver_to_property", label: "Deliver here", hint: "Drop at this property" },
      { id: "pickup_yard", label: "I will pick up", hint: "Customer loads at the yard" },
      { id: "stack_on_delivery", label: "Stack it for me", hint: "Do not dump and leave" },
      { id: "split_stove_small", label: "Split small for a stove", hint: "Shorter splits, not furnace chunks" },
    ],
  },
  {
    id: "where",
    title: "Where it lives",
    blurb: "A dry crib now means easier lighting in January.",
    options: [
      { id: "covered_storage", label: "Covered crib ready", hint: "Roof or tarp already in place" },
      { id: "truck_access", label: "Truck can reach the stack", hint: "No tight gate or soft lawn" },
      { id: "rear_yard", label: "Back yard stack", hint: "Carry or wheel past the house" },
      { id: "side_yard", label: "Side yard stack", hint: "Shorter carry from the street" },
    ],
  },
] as const;

export const FIREWOOD_OPTION_IDS = FIREWOOD_OPTION_GROUPS.flatMap((group) =>
  group.options.map((option) => option.id),
);

export type FirewoodPreferenceId = (typeof FIREWOOD_OPTION_IDS)[number];

export function isFirewoodPreferenceId(value: string): value is FirewoodPreferenceId {
  return (FIREWOOD_OPTION_IDS as readonly string[]).includes(value);
}

export function parseFirewoodPreferences(values: unknown[]): FirewoodPreferenceId[] {
  return values.filter((value): value is FirewoodPreferenceId => {
    return typeof value === "string" && isFirewoodPreferenceId(value);
  });
}

export function asFirewoodPreferenceList(value: unknown): FirewoodPreferenceId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return parseFirewoodPreferences(value);
}

export function firewoodPreferenceLabel(id: string): string {
  for (const group of FIREWOOD_OPTION_GROUPS) {
    const match = group.options.find((option) => option.id === id);
    if (match) {
      return match.label;
    }
  }

  return id;
}
