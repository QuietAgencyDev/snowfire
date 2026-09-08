import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { woodReadiness } from "./readiness.ts";

describe("wood readiness", () => {
  it("starts empty without a delivery file", () => {
    const report = woodReadiness({
      firewood_preferences: [],
      firewood_stack_location: null,
      firewood_notes: null,
      latitude: null,
      longitude: null,
    });

    assert.equal(report.score, 0);
    assert.match(report.nextStep, /address/i);
  });

  it("scores a complete woodshed file", () => {
    const report = woodReadiness({
      firewood_preferences: ["deliver_to_property", "truck_access"],
      firewood_stack_location: "Left of the garage, on the crib",
      firewood_notes: "Do not block the side door",
      latitude: 44.3,
      longitude: -78.32,
    });

    assert.equal(report.score, 100);
  });
});
