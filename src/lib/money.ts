export function assertCents(value: number): number {
  if (!Number.isInteger(value)) {
    throw new Error("Money values must be integer cents.");
  }

  return value;
}

export function addCents(...values: number[]): number {
  return values.reduce((sum, value) => sum + assertCents(value), 0);
}

export function applyTaxBps(amountCents: number, rateBps: number): number {
  assertCents(amountCents);

  if (!Number.isInteger(rateBps) || rateBps < 0) {
    throw new Error("Tax rate must be integer basis points.");
  }

  return Math.round((amountCents * rateBps) / 10_000);
}

export function formatCadFromCents(cents: number): string {
  assertCents(cents);

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}
