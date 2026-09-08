import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSnowWeather, weatherCodeLabel } from "./codes.ts";

describe("weather codes", () => {
  it("labels snow and rain", () => {
    assert.equal(weatherCodeLabel(75), "Heavy snow");
    assert.equal(weatherCodeLabel(63), "Rain");
    assert.equal(weatherCodeLabel(null), "Unknown conditions");
  });

  it("flags snow-producing codes", () => {
    assert.equal(isSnowWeather(73), true);
    assert.equal(isSnowWeather(3), false);
  });
});
