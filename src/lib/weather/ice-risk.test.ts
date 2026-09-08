import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { iceRisk } from "./ice-risk.ts";
import type { LocalWeatherReport } from "./types.ts";

function report(hourly: LocalWeatherReport["hourly"], weatherCode = 1): LocalWeatherReport {
  return {
    observedAt: "2026-01-10T12:00",
    timezone: "America/Toronto",
    temperatureC: hourly[0]?.temperatureC ?? 0,
    apparentTemperatureC: 0,
    humidityPct: 70,
    windKmh: 10,
    precipitationMm: 0,
    snowfallCm: 0,
    weatherCode,
    summary: "Test",
    source: "Open-Meteo",
    hourly,
    daily: [],
  };
}

describe("ice risk", () => {
  it("stays low when hours stay warm and dry", () => {
    const result = iceRisk(
      report([
        { time: "a", temperatureC: 4, weatherCode: 1, snowfallCm: 0, precipitationMm: 0 },
        { time: "b", temperatureC: 3, weatherCode: 1, snowfallCm: 0, precipitationMm: 0 },
      ]),
    );

    assert.equal(result.level, "low");
    assert.equal(result.freezeThawCount, 0);
    assert.equal(result.iceDamWatch, false);
  });

  it("rises when the freeze line is crossed and the surface is wet", () => {
    const result = iceRisk(
      report([
        { time: "a", temperatureC: 2, weatherCode: 61, snowfallCm: 0, precipitationMm: 1 },
        { time: "b", temperatureC: -1, weatherCode: 66, snowfallCm: 0, precipitationMm: 1 },
        { time: "c", temperatureC: 1, weatherCode: 66, snowfallCm: 0, precipitationMm: 1 },
      ], 66),
    );

    assert.equal(result.freezeThawCount >= 1, true);
    assert.equal(result.level === "high" || result.level === "severe", true);
  });
});
