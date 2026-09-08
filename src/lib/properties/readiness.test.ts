import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { winterReadiness } from "./readiness.ts";

const baseProperty = {
  latitude: null,
  longitude: null,
  driveway_type: null,
  snow_storage_location: null,
  hazards: null,
  special_instructions: null,
  service_preferences: [] as string[],
};

describe("winter readiness", () => {
  it("starts low when the file is empty", () => {
    const report = winterReadiness({
      property: baseProperty,
      profile: { phone: null },
      drivewayPhotoCount: 0,
      finishedPhotoCount: 0,
    });

    assert.equal(report.score < 20, true);
    assert.match(report.nextStep, /address/i);
  });

  it("scores a complete winter file highly", () => {
    const report = winterReadiness({
      property: {
        latitude: 44.3,
        longitude: -78.32,
        driveway_type: "Asphalt",
        snow_storage_location: "Left lawn",
        hazards: "Steep apron",
        special_instructions: "Gate 1234",
        service_preferences: ["salted", "driveway", "walkways"],
      },
      profile: { phone: "7055550100" },
      drivewayPhotoCount: 1,
      finishedPhotoCount: 1,
    });

    assert.equal(report.score, 100);
    assert.match(report.headline, /Award-ready/i);
  });
});
