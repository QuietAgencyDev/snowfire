export const FACE_CORDS_PER_FULL = 3;

export type WoodHeatUse = "ambiance" | "backup" | "primary";

export type CordEstimate = {
  fullCords: number;
  faceCords: number;
  use: WoodHeatUse;
  heatedSqFt: number;
  headline: string;
  detail: string;
};

const USE_FACTOR: Record<WoodHeatUse, number> = {
  ambiance: 0.35,
  backup: 0.7,
  primary: 1,
};

export function estimateCords(input: {
  heatedSqFt: number;
  use: WoodHeatUse;
}): CordEstimate {
  const heatedSqFt = Number.isFinite(input.heatedSqFt)
    ? Math.max(0, input.heatedSqFt)
    : 0;
  const factor = USE_FACTOR[input.use];
  const fullCords =
    heatedSqFt <= 0
      ? 0
      : Number(Math.max(0.25, (heatedSqFt / 900) * factor).toFixed(2));
  const faceCords = Number((fullCords * FACE_CORDS_PER_FULL).toFixed(1));

  const headlines: Record<WoodHeatUse, string> = {
    ambiance: "Weekend fires, not whole-house heat",
    backup: "Backup heat for outages and cold snaps",
    primary: "Primary heat for an Ontario winter",
  };

  return {
    fullCords,
    faceCords,
    use: input.use,
    heatedSqFt,
    headline: headlines[input.use],
    detail:
      heatedSqFt <= 0
        ? "Enter the heated square footage to size the woodshed."
        : `About ${faceCords} face cord${faceCords === 1 ? "" : "s"} (${fullCords} full) for ${heatedSqFt} sq ft. This is a yard estimate, not a quote.`,
  };
}

export function formatUnit(unit: string, quantity = 1): string {
  return quantity === 1 ? unit : `${unit}s`;
}
