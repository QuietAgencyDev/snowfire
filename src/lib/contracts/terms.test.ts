import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PREPAY_DISCOUNT_BPS,
  billingSchedule,
  contractStatusLabel,
  daysInclusive,
  prepayTotal,
  prorateSeason,
  seasonWindow,
  termSheet,
} from "./terms.ts";

describe("season window", () => {
  it("uses the market's own start and end dates", () => {
    const barrie = seasonWindow("BARRIE", "2026-09-07");
    const gta = seasonWindow("GTA", "2026-09-07");

    assert.equal(barrie.startDate, "2026-11-15");
    assert.equal(barrie.endDate, "2027-04-15");
    assert.equal(gta.startDate, "2026-11-01");
    assert.equal(gta.endDate, "2027-04-30");
  });

  it("labels the winter that spans two years", () => {
    assert.equal(seasonWindow("BARRIE", "2026-09-07").label, "2026–27");
  });

  it("looks forward from summer and back from spring", () => {
    assert.equal(seasonWindow("GTA", "2026-07-01").startDate, "2026-11-01");
    assert.equal(seasonWindow("GTA", "2027-02-10").startDate, "2026-11-01");
    assert.equal(seasonWindow("GTA", "2026-06-30").startDate, "2025-11-01");
  });

  it("rejects anything that is not an ISO date", () => {
    assert.throws(() => seasonWindow("GTA", "Sept 7 2026"));
    assert.throws(() => seasonWindow("GTA", "2026-13-01"));
  });
});

describe("day counting", () => {
  it("counts both endpoints", () => {
    assert.equal(daysInclusive("2026-11-01", "2026-11-01"), 1);
    assert.equal(daysInclusive("2026-11-01", "2026-11-30"), 30);
  });

  it("crosses a leap day", () => {
    assert.equal(daysInclusive("2028-02-28", "2028-03-01"), 3);
  });
});

describe("proration", () => {
  const window = seasonWindow("GTA", "2026-09-07");

  it("charges the full price when signing before the season opens", () => {
    const full = prorateSeason(69_500, window, "2026-09-07");

    assert.equal(full.amountCents, 69_500);
    assert.equal(full.prorated, false);
    assert.equal(full.startDate, window.startDate);
  });

  it("charges for the winter that is left when joining late", () => {
    const late = prorateSeason(69_500, window, "2027-02-01");

    assert.equal(late.prorated, true);
    assert.equal(late.startDate, "2027-02-01");
    assert.equal(late.coveredDays, daysInclusive("2027-02-01", "2027-04-30"));
    assert.equal(late.amountCents < 69_500, true);
    assert.equal(
      late.amountCents,
      Math.round((69_500 * late.coveredDays) / late.totalDays),
    );
  });

  it("still bills a whole number of cents", () => {
    for (const day of ["2026-12-03", "2027-01-17", "2027-03-29"]) {
      assert.equal(Number.isInteger(prorateSeason(86_500, window, day).amountCents), true);
    }
  });

  it("refuses to sell a season that has already ended", () => {
    assert.throws(() => prorateSeason(69_500, window, "2027-05-01"));
  });
});

describe("prepay", () => {
  it("discounts a lump sum", () => {
    assert.equal(prepayTotal(100_000), 100_000 - (100_000 * PREPAY_DISCOUNT_BPS) / 10_000);
    assert.equal(prepayTotal(0), 0);
  });
});

describe("billing schedule", () => {
  const window = seasonWindow("GTA", "2026-09-07");

  it("bills a prepaid season once, at the discount", () => {
    const schedule = billingSchedule({
      amountCents: 69_500,
      frequency: "PREPAID",
      startDate: window.startDate,
      endDate: window.endDate,
    });

    assert.equal(schedule.length, 1);
    assert.equal(schedule[0].dueDate, "2026-11-01");
    assert.equal(schedule[0].amountCents, prepayTotal(69_500));
  });

  it("bills activation plus the first of each winter month", () => {
    const schedule = billingSchedule({
      amountCents: 69_500,
      frequency: "MONTHLY",
      startDate: window.startDate,
      endDate: window.endDate,
    });

    assert.deepEqual(
      schedule.map((item) => item.dueDate),
      ["2026-11-01", "2027-01-01", "2027-02-01", "2027-03-01"],
    );
  });

  it("drops instalment dates that already passed", () => {
    const schedule = billingSchedule({
      amountCents: 40_000,
      frequency: "MONTHLY",
      startDate: "2027-02-10",
      endDate: window.endDate,
    });

    assert.deepEqual(
      schedule.map((item) => item.dueDate),
      ["2027-02-10", "2027-03-01"],
    );
  });

  it("never loses or invents a cent when splitting", () => {
    for (const amount of [69_500, 86_501, 1, 99_999]) {
      const schedule = billingSchedule({
        amountCents: amount,
        frequency: "MONTHLY",
        startDate: window.startDate,
        endDate: window.endDate,
      });
      const summed = schedule.reduce((total, item) => total + item.amountCents, 0);

      assert.equal(summed, amount);
      assert.equal(
        schedule.every((item) => Number.isInteger(item.amountCents)),
        true,
      );
    }
  });

  it("puts the rounding remainder on the first instalment", () => {
    const schedule = billingSchedule({
      amountCents: 1_003,
      frequency: "MONTHLY",
      startDate: window.startDate,
      endDate: window.endDate,
    });

    assert.equal(schedule[0].amountCents >= schedule[1].amountCents, true);
  });
});

describe("term sheet", () => {
  it("records the trigger and the season on the contract", () => {
    const window = seasonWindow("BARRIE", "2026-09-07");
    const sheet = termSheet({
      marketLabel: "Barrie / Simcoe",
      drivewayClassLabel: "Double-width",
      triggerCm: 2.5,
      season: window,
      prorated: prorateSeason(86_500, window, "2026-09-07"),
      frequency: "PREPAID",
    });

    assert.match(sheet, /Barrie \/ Simcoe/);
    assert.match(sheet, /2\.5 cm/);
    assert.match(sheet, /2026-11-15/);
    assert.doesNotMatch(sheet, /Mid-season/);
  });

  it("spells out a mid-season start", () => {
    const window = seasonWindow("BARRIE", "2027-01-20");
    const sheet = termSheet({
      marketLabel: "Barrie / Simcoe",
      drivewayClassLabel: "Double-width",
      triggerCm: 5,
      season: window,
      prorated: prorateSeason(86_500, window, "2027-01-20"),
      frequency: "MONTHLY",
    });

    assert.match(sheet, /Mid-season start 2027-01-20/);
  });
});

describe("labels", () => {
  it("names every contract status", () => {
    for (const status of ["DRAFT", "ACTIVE", "PAUSED", "EXPIRED", "CANCELLED"]) {
      assert.notEqual(contractStatusLabel(status), status);
    }
  });
});
