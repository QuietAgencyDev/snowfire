import type { Property } from "@/types/database";

export type SnowMarket = "BARRIE" | "GTA";
export type DrivewayClass = "SINGLE" | "DOUBLE" | "TRIPLE" | "LONG";
export type DispatchTrigger = "STANDARD" | "PRIORITY";

/** Service preference id that upgrades a property to the low-snowfall trigger. */
export const PRIORITY_TRIGGER_ID = "trigger_priority";

/** A lower dispatch trigger means more roll-outs per season. Guardian prices the same spread. */
export const PRIORITY_MULTIPLIER_BPS = 13_500;

/** Used when a property has no driveway measurements on file. */
export const DEFAULT_DRIVEWAY_CLASS: DrivewayClass = "DOUBLE";

type ClassRate = {
  label: string;
  seasonalCents: number;
  perVisitCents: number;
};

type MarketRate = {
  label: string;
  season: string;
  triggerCm: number;
  priorityTriggerCm: number;
  typicalEvents: number;
  saltCents: number;
  classes: Record<DrivewayClass, ClassRate>;
};

export const RATE_CARD: Record<SnowMarket, MarketRate> = {
  BARRIE: {
    label: "Barrie / Simcoe",
    season: "Nov 15 – Apr 15",
    triggerCm: 5,
    priorityTriggerCm: 2.5,
    typicalEvents: 28,
    saltCents: 3_500,
    classes: {
      SINGLE: { label: "Single-width", seasonalCents: 69_500, perVisitCents: 5_500 },
      DOUBLE: { label: "Double-width", seasonalCents: 86_500, perVisitCents: 7_000 },
      TRIPLE: { label: "Triple / L-shaped", seasonalCents: 109_500, perVisitCents: 9_000 },
      LONG: { label: "Long / rural laneway", seasonalCents: 139_500, perVisitCents: 11_500 },
    },
  },
  GTA: {
    label: "Toronto / GTA",
    season: "Nov 1 – Apr 30",
    triggerCm: 5,
    priorityTriggerCm: 2.5,
    typicalEvents: 18,
    saltCents: 4_500,
    classes: {
      SINGLE: { label: "1-car", seasonalCents: 56_500, perVisitCents: 6_500 },
      DOUBLE: { label: "2-car", seasonalCents: 69_500, perVisitCents: 8_500 },
      TRIPLE: { label: "3-car", seasonalCents: 82_500, perVisitCents: 11_000 },
      LONG: { label: "Long / circular", seasonalCents: 105_000, perVisitCents: 14_000 },
    },
  },
};

const SIMCOE_CITIES = new Set([
  "barrie",
  "innisfil",
  "oro medonte",
  "springwater",
  "essa",
  "angus",
  "alliston",
  "new tecumseth",
  "bradford",
  "bradford west gwillimbury",
  "beeton",
  "tottenham",
  "cookstown",
  "thornton",
  "minesing",
  "midhurst",
  "shanty bay",
  "hawkestone",
  "orillia",
  "ramara",
  "severn",
  "coldwater",
  "washago",
  "midland",
  "penetanguishene",
  "tay",
  "tiny",
  "elmvale",
  "wasaga beach",
  "stayner",
  "clearview",
  "collingwood",
  "port mcnicoll",
  "victoria harbour",
]);

export function normalizeCity(city: string | null | undefined): string {
  return (city ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function marketForCity(city: string | null | undefined): SnowMarket {
  return SIMCOE_CITIES.has(normalizeCity(city)) ? "BARRIE" : "GTA";
}

function toMetres(value: string | number | null | undefined): number | null {
  const parsed = typeof value === "string" ? Number(value) : value;

  if (typeof parsed !== "number" || !Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export type DrivewaySizing = {
  drivewayClass: DrivewayClass;
  /** False when no measurements were on file and the default class was used. */
  measured: boolean;
};

export function drivewaySizing(input: {
  lengthMetres?: string | number | null;
  widthMetres?: string | number | null;
}): DrivewaySizing {
  const length = toMetres(input.lengthMetres);
  const width = toMetres(input.widthMetres);

  if (length !== null && length >= 25) {
    return { drivewayClass: "LONG", measured: true };
  }

  if (width !== null) {
    if (width < 4) {
      return { drivewayClass: "SINGLE", measured: true };
    }

    if (width < 6.5) {
      return { drivewayClass: "DOUBLE", measured: true };
    }

    return { drivewayClass: "TRIPLE", measured: true };
  }

  return { drivewayClass: DEFAULT_DRIVEWAY_CLASS, measured: false };
}

export function dispatchTriggerFor(
  preferences: readonly string[] | null | undefined,
): DispatchTrigger {
  return (preferences ?? []).includes(PRIORITY_TRIGGER_ID) ? "PRIORITY" : "STANDARD";
}

/** Rate cards are published in whole five-dollar steps so quotes stay readable. */
export function roundToFiveDollars(cents: number): number {
  return Math.round(cents / 500) * 500;
}

export function seasonalCents(
  market: SnowMarket,
  drivewayClass: DrivewayClass,
  trigger: DispatchTrigger,
): number {
  const base = RATE_CARD[market].classes[drivewayClass].seasonalCents;

  if (trigger === "STANDARD") {
    return base;
  }

  return roundToFiveDollars((base * PRIORITY_MULTIPLIER_BPS) / 10_000);
}

export function perVisitCents(market: SnowMarket, drivewayClass: DrivewayClass): number {
  return RATE_CARD[market].classes[drivewayClass].perVisitCents;
}

/** What a seasonal contract actually earns each time the crew rolls out. */
export function effectivePerPushCents(seasonal: number, events: number): number {
  if (!Number.isInteger(events) || events <= 0) {
    throw new Error("Event count must be a whole number above zero.");
  }

  return Math.round(seasonal / events);
}

export type RateUnit = "SEASON" | "VISIT";

export type SnowRateQuote = {
  amountCents: number;
  unit: RateUnit;
  unitLabel: string;
  market: SnowMarket;
  marketLabel: string;
  season: string;
  drivewayClass: DrivewayClass;
  drivewayClassLabel: string;
  trigger: DispatchTrigger;
  triggerCm: number;
  /** False when the driveway class was defaulted rather than measured. */
  measured: boolean;
};

const SEASONAL_TYPES = new Set(["SEASONAL"]);
const PER_VISIT_TYPES = new Set(["ONE_TIME", "PER_STORM"]);

/**
 * Returns null when a service has no published rate — those stay a custom quote
 * rather than getting a made-up number.
 */
export function quoteSnowRate(input: {
  serviceType: string;
  city?: string | null;
  lengthMetres?: string | number | null;
  widthMetres?: string | number | null;
  preferences?: readonly string[] | null;
}): SnowRateQuote | null {
  const seasonal = SEASONAL_TYPES.has(input.serviceType);
  const perVisit = PER_VISIT_TYPES.has(input.serviceType);

  if (!seasonal && !perVisit) {
    return null;
  }

  const market = marketForCity(input.city);
  const { drivewayClass, measured } = drivewaySizing({
    lengthMetres: input.lengthMetres,
    widthMetres: input.widthMetres,
  });
  const trigger = dispatchTriggerFor(input.preferences);
  const card = RATE_CARD[market];

  return {
    amountCents: seasonal
      ? seasonalCents(market, drivewayClass, trigger)
      : perVisitCents(market, drivewayClass),
    unit: seasonal ? "SEASON" : "VISIT",
    unitLabel: seasonal ? "per season" : "per visit",
    market,
    marketLabel: card.label,
    season: card.season,
    drivewayClass,
    drivewayClassLabel: card.classes[drivewayClass].label,
    trigger,
    triggerCm: trigger === "PRIORITY" ? card.priorityTriggerCm : card.triggerCm,
    measured,
  };
}

export function quoteSnowRateForProperty(
  serviceType: string,
  property: Pick<
    Property,
    "city" | "driveway_length" | "driveway_width" | "service_preferences"
  >,
): SnowRateQuote | null {
  return quoteSnowRate({
    serviceType,
    city: property.city,
    lengthMetres: property.driveway_length,
    widthMetres: property.driveway_width,
    preferences: property.service_preferences,
  });
}
