import type { SnowMarket } from "@/lib/pricing/rate-card";

export type BillingFrequency = "PREPAID" | "MONTHLY";

/** Paying the whole season up front funds salt and fuel before the first storm. */
export const PREPAY_DISCOUNT_BPS = 800;

/** Guardian bills activation plus the first of each winter month. */
const INSTALMENT_MONTHS = [1, 2, 3];

const SEASON_DATES: Record<SnowMarket, { start: [number, number]; end: [number, number] }> = {
  BARRIE: { start: [11, 15], end: [4, 15] },
  GTA: { start: [11, 1], end: [4, 30] },
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function assertIsoDate(value: string): void {
  if (!ISO_DATE.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error("Dates must be ISO yyyy-mm-dd.");
  }
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function toEpochDay(value: string): number {
  assertIsoDate(value);

  return Math.round(Date.parse(`${value}T00:00:00Z`) / 86_400_000);
}

/** Inclusive day count, so a single-day span counts as one day of service. */
export function daysInclusive(start: string, end: string): number {
  return toEpochDay(end) - toEpochDay(start) + 1;
}

export type SeasonWindow = {
  startDate: string;
  endDate: string;
  label: string;
};

/**
 * Resolves the winter a date belongs to. July onward looks forward to the
 * coming season; anything earlier belongs to the season already under way.
 */
export function seasonWindow(market: SnowMarket, onDate: string): SeasonWindow {
  assertIsoDate(onDate);

  const year = Number(onDate.slice(0, 4));
  const month = Number(onDate.slice(5, 7));
  const startYear = month >= 7 ? year : year - 1;
  const endYear = startYear + 1;
  const dates = SEASON_DATES[market];

  return {
    startDate: isoDate(startYear, dates.start[0], dates.start[1]),
    endDate: isoDate(endYear, dates.end[0], dates.end[1]),
    label: `${startYear}–${String(endYear).slice(2)}`,
  };
}

export type ProratedSeason = {
  amountCents: number;
  startDate: string;
  coveredDays: number;
  totalDays: number;
  prorated: boolean;
};

/** A mid-season signup pays for the winter that is left, not the whole thing. */
export function prorateSeason(
  priceCents: number,
  window: SeasonWindow,
  joinDate: string,
): ProratedSeason {
  if (!Number.isInteger(priceCents) || priceCents < 0) {
    throw new Error("Season price must be integer cents.");
  }

  assertIsoDate(joinDate);

  if (joinDate > window.endDate) {
    throw new Error("This season has already ended.");
  }

  const startDate = joinDate > window.startDate ? joinDate : window.startDate;
  const totalDays = daysInclusive(window.startDate, window.endDate);
  const coveredDays = daysInclusive(startDate, window.endDate);

  return {
    amountCents:
      coveredDays >= totalDays
        ? priceCents
        : Math.round((priceCents * coveredDays) / totalDays),
    startDate,
    coveredDays,
    totalDays,
    prorated: coveredDays < totalDays,
  };
}

export function prepayTotal(amountCents: number): number {
  if (!Number.isInteger(amountCents) || amountCents < 0) {
    throw new Error("Amount must be integer cents.");
  }

  return amountCents - Math.round((amountCents * PREPAY_DISCOUNT_BPS) / 10_000);
}

export type Instalment = {
  dueDate: string;
  amountCents: number;
  label: string;
};

/**
 * Prepaid bills once on activation at a discount. Monthly bills on activation
 * and then the first of each winter month still ahead, so a late signup gets
 * fewer, larger instalments rather than back-dated ones.
 */
export function billingSchedule(input: {
  amountCents: number;
  frequency: BillingFrequency;
  startDate: string;
  endDate: string;
}): Instalment[] {
  if (!Number.isInteger(input.amountCents) || input.amountCents < 0) {
    throw new Error("Amount must be integer cents.");
  }

  assertIsoDate(input.startDate);
  assertIsoDate(input.endDate);

  if (input.frequency === "PREPAID") {
    return [
      {
        dueDate: input.startDate,
        amountCents: prepayTotal(input.amountCents),
        label: "Season prepaid",
      },
    ];
  }

  const endYear = Number(input.endDate.slice(0, 4));
  const dueDates = [
    input.startDate,
    ...INSTALMENT_MONTHS.map((month) => isoDate(endYear, month, 1)).filter(
      (date) => date > input.startDate && date <= input.endDate,
    ),
  ];

  const each = Math.floor(input.amountCents / dueDates.length);
  const remainder = input.amountCents - each * dueDates.length;

  return dueDates.map((dueDate, index) => ({
    dueDate,
    amountCents: index === 0 ? each + remainder : each,
    label: index === 0 ? "On activation" : `Instalment ${index + 1}`,
  }));
}

export function billingFrequencyLabel(frequency: string): string {
  return frequency === "PREPAID" ? "Prepaid in full" : "Monthly instalments";
}

export function contractStatusLabel(status: string): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "ACTIVE":
      return "Active";
    case "PAUSED":
      return "Paused";
    case "EXPIRED":
      return "Expired";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

/**
 * A plain-language record of what was sold, stored on the contract so the
 * terms survive later edits to the rate card.
 */
export function termSheet(input: {
  marketLabel: string;
  drivewayClassLabel: string;
  triggerCm: number;
  season: SeasonWindow;
  prorated: ProratedSeason;
  frequency: BillingFrequency;
}): string {
  const lines = [
    `${input.marketLabel} rate card · ${input.drivewayClassLabel} driveway.`,
    `Crew rolls at ${input.triggerCm} cm, unlimited visits, ${input.season.startDate} to ${input.season.endDate}.`,
    `Billing: ${billingFrequencyLabel(input.frequency).toLowerCase()}.`,
  ];

  if (input.prorated.prorated) {
    lines.push(
      `Mid-season start ${input.prorated.startDate} — prorated to ${input.prorated.coveredDays} of ${input.prorated.totalDays} days.`,
    );
  }

  return lines.join("\n");
}
