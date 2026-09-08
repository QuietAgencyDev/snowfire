import { formatPropertyAddress, type AddressParts } from "@/lib/properties/address";
import {
  asFirewoodPreferenceList,
  firewoodPreferenceLabel,
} from "@/lib/firewood/options";

type BriefProperty = AddressParts & {
  name: string;
  firewood_preferences: string[] | null;
  firewood_stack_location: string | null;
  firewood_notes: string | null;
};

export type WoodBrief = {
  title: string;
  address: string;
  client: string;
  phone: string;
  how: string[];
  where: string[];
  stack: string;
  notes: string;
};

export function buildWoodBrief(input: {
  property: BriefProperty;
  profile: { first_name: string; last_name: string; phone: string | null };
}): WoodBrief {
  const prefs = asFirewoodPreferenceList(input.property.firewood_preferences);
  const howIds = new Set([
    "deliver_to_property",
    "pickup_yard",
    "stack_on_delivery",
    "split_stove_small",
  ]);

  return {
    title: `${input.property.name} · wood delivery`,
    address: formatPropertyAddress(input.property),
    client: `${input.profile.first_name} ${input.profile.last_name}`.trim(),
    phone: input.profile.phone || "No phone on file",
    how: prefs.filter((id) => howIds.has(id)).map(firewoodPreferenceLabel),
    where: prefs.filter((id) => !howIds.has(id)).map(firewoodPreferenceLabel),
    stack: input.property.firewood_stack_location || "Not set",
    notes: input.property.firewood_notes || "None noted",
  };
}

export function woodBriefText(brief: WoodBrief): string {
  const list = (items: string[]) => (items.length ? items.join(", ") : "None checked");

  return [
    brief.title.toUpperCase(),
    brief.address,
    `Client: ${brief.client} · ${brief.phone}`,
    `How: ${list(brief.how)}`,
    `Where: ${list(brief.where)}`,
    `Stack: ${brief.stack}`,
    `Notes: ${brief.notes}`,
    "SnowFire.ca · woodshed file — not a paid order",
  ].join("\n");
}
