import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_DRIVEWAY_CLASS,
  RATE_CARD,
  drivewaySizing,
  dispatchTriggerFor,
  effectivePerPushCents,
  marketForCity,
  perVisitCents,
  quoteSnowRate,
  roundToFiveDollars,
  seasonalCents,
} from "./rate-card.ts";

describe("market", () => {
  it("separates the Simcoe snow belt from the GTA", () => {
    assert.equal(marketForCity("Barrie"), "BARRIE");
    assert.equal(marketForCity("  wasaga beach "), "BARRIE");
    assert.equal(marketForCity("Oro-Medonte"), "BARRIE");
    assert.equal(marketForCity("Toronto"), "GTA");
    assert.equal(marketForCity("Vaughan"), "GTA");
  });

  it("falls back to the GTA card for an unknown city", () => {
    assert.equal(marketForCity(null), "GTA");
    assert.equal(marketForCity(""), "GTA");
  });
});

describe("driveway sizing", () => {
  it("reads width in metres", () => {
    assert.equal(drivewaySizing({ widthMetres: 3.2 }).drivewayClass, "SINGLE");
    assert.equal(drivewaySizing({ widthMetres: 5.5 }).drivewayClass, "DOUBLE");
    assert.equal(drivewaySizing({ widthMetres: 8 }).drivewayClass, "TRIPLE");
  });

  it("treats a long run as a laneway regardless of width", () => {
    assert.equal(drivewaySizing({ lengthMetres: 40, widthMetres: 3 }).drivewayClass, "LONG");
  });

  it("accepts numerics stored as strings", () => {
    assert.equal(drivewaySizing({ widthMetres: "6.0" }).drivewayClass, "DOUBLE");
  });

  it("flags an unmeasured driveway instead of guessing silently", () => {
    const sizing = drivewaySizing({});

    assert.equal(sizing.drivewayClass, DEFAULT_DRIVEWAY_CLASS);
    assert.equal(sizing.measured, false);
    assert.equal(drivewaySizing({ widthMetres: 4.2 }).measured, true);
  });
});

describe("dispatch trigger", () => {
  it("stays standard unless the property opts into priority", () => {
    assert.equal(dispatchTriggerFor(null), "STANDARD");
    assert.equal(dispatchTriggerFor(["salted"]), "STANDARD");
    assert.equal(dispatchTriggerFor(["salted", "trigger_priority"]), "PRIORITY");
  });
});

describe("rate card money", () => {
  it("keeps every published price in whole cents", () => {
    for (const market of ["BARRIE", "GTA"] as const) {
      for (const cls of ["SINGLE", "DOUBLE", "TRIPLE", "LONG"] as const) {
        for (const trigger of ["STANDARD", "PRIORITY"] as const) {
          assert.equal(Number.isInteger(seasonalCents(market, cls, trigger)), true);
        }
        assert.equal(Number.isInteger(perVisitCents(market, cls)), true);
      }
    }
  });

  it("charges more for a lower dispatch trigger", () => {
    const standard = seasonalCents("BARRIE", "DOUBLE", "STANDARD");
    const priority = seasonalCents("BARRIE", "DOUBLE", "PRIORITY");

    assert.equal(priority > standard, true);
    assert.equal(priority, roundToFiveDollars(standard * 1.35));
  });

  it("prices Barrie above the GTA on the same driveway", () => {
    assert.equal(
      seasonalCents("BARRIE", "DOUBLE", "STANDARD") > seasonalCents("GTA", "DOUBLE", "STANDARD"),
      true,
    );
  });

  it("climbs with driveway size", () => {
    const sizes = ["SINGLE", "DOUBLE", "TRIPLE", "LONG"] as const;

    for (let index = 1; index < sizes.length; index += 1) {
      assert.equal(
        seasonalCents("GTA", sizes[index], "STANDARD") >
          seasonalCents("GTA", sizes[index - 1], "STANDARD"),
        true,
      );
    }
  });

  it("stays inside the published market band", () => {
    assert.equal(seasonalCents("BARRIE", "SINGLE", "STANDARD") >= 65_000, true);
    assert.equal(seasonalCents("BARRIE", "LONG", "PRIORITY") <= 200_000, true);
    assert.equal(seasonalCents("GTA", "SINGLE", "STANDARD") >= 50_000, true);
  });

  it("reports what a seasonal contract earns per roll-out", () => {
    const seasonal = seasonalCents("BARRIE", "DOUBLE", "STANDARD");
    const perPush = effectivePerPushCents(seasonal, RATE_CARD.BARRIE.typicalEvents);

    assert.equal(perPush, Math.round(seasonal / 28));
    assert.equal(perPush < perVisitCents("BARRIE", "DOUBLE"), true);
    assert.throws(() => effectivePerPushCents(seasonal, 0));
  });
});

describe("snow rate quote", () => {
  it("quotes a season and a single visit from the same driveway", () => {
    const property = { city: "Barrie", widthMetres: 5.5, preferences: [] };
    const season = quoteSnowRate({ serviceType: "SEASONAL", ...property });
    const visit = quoteSnowRate({ serviceType: "ONE_TIME", ...property });

    assert.equal(season?.unit, "SEASON");
    assert.equal(season?.amountCents, 86_500);
    assert.equal(season?.drivewayClassLabel, "Double-width");
    assert.equal(visit?.unit, "VISIT");
    assert.equal(visit?.amountCents, 7_000);
  });

  it("prices a per-storm service like a visit", () => {
    const storm = quoteSnowRate({ serviceType: "PER_STORM", city: "Toronto", widthMetres: 3 });

    assert.equal(storm?.unit, "VISIT");
    assert.equal(storm?.amountCents, perVisitCents("GTA", "SINGLE"));
  });

  it("refuses to invent a price for a service with no published rate", () => {
    assert.equal(quoteSnowRate({ serviceType: "ROOF_SALT_PUCKS", city: "Barrie" }), null);
    assert.equal(quoteSnowRate({ serviceType: "SOMETHING_NEW", city: "Barrie" }), null);
  });

  it("carries the priority trigger through to the quote", () => {
    const quote = quoteSnowRate({
      serviceType: "SEASONAL",
      city: "Toronto",
      widthMetres: 5.5,
      preferences: ["trigger_priority"],
    });

    assert.equal(quote?.trigger, "PRIORITY");
    assert.equal(quote?.triggerCm, 2.5);
    assert.equal(quote?.amountCents, seasonalCents("GTA", "DOUBLE", "PRIORITY"));
  });
});
