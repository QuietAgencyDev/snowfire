export const WOOD_SPECIES = [
  {
    id: "mixed-hardwood",
    label: "Mixed hardwood",
    heat: 4,
    btuPerCordMillion: 24,
    spark: "Low",
    aroma: "Clean, quiet",
    bestFor: "Everyday stove heat",
  },
  {
    id: "maple",
    label: "Sugar maple",
    heat: 5,
    btuPerCordMillion: 29,
    spark: "Low",
    aroma: "Sweet, long coals",
    bestFor: "Overnight burns",
  },
  {
    id: "birch",
    label: "White birch",
    heat: 3,
    btuPerCordMillion: 21,
    spark: "Medium",
    aroma: "Bright, camp-fire",
    bestFor: "Shoulder season and kindling help",
  },
  {
    id: "kiln-hardwood",
    label: "Kiln-dried hardwood",
    heat: 5,
    btuPerCordMillion: 26,
    spark: "Low",
    aroma: "Very dry, fast light",
    bestFor: "Same-week delivery",
  },
  {
    id: "kindling",
    label: "Kindling",
    heat: 1,
    btuPerCordMillion: 0,
    spark: "Low",
    aroma: "Starter only",
    bestFor: "Getting the stove going",
  },
] as const;

export type WoodSpeciesId = (typeof WOOD_SPECIES)[number]["id"];

export function woodSpeciesById(id: string | null | undefined) {
  return WOOD_SPECIES.find((species) => species.id === id) ?? null;
}

export function heatLabel(heat: number): string {
  if (heat >= 5) {
    return "Hottest";
  }

  if (heat >= 4) {
    return "Hot";
  }

  if (heat >= 3) {
    return "Medium";
  }

  return "Starter";
}
