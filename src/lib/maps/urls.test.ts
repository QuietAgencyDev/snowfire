import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  googleMapsDirectionsUrl,
  googleMapsEmbedUrl,
  googleMapsExternalUrl,
  googleMapsQuery,
} from "./urls.ts";

describe("map urls", () => {
  it("prefers coordinates when both are present", () => {
    assert.equal(
      googleMapsQuery({
        address: "12 Maple St, Peterborough, ON",
        latitude: 44.3,
        longitude: -78.32,
      }),
      "44.3,-78.32",
    );
  });

  it("builds an embed without requiring a Maps key", () => {
    const url = googleMapsEmbedUrl("44.3,-78.32");
    assert.match(url, /maps\.google\.com/);
    assert.match(url, /output=embed/);
  });

  it("uses the official embed when a key is present", () => {
    const url = googleMapsEmbedUrl("12 Maple St", "test-key");
    assert.match(url, /maps\/embed\/v1\/place/);
    assert.match(url, /key=test-key/);
  });

  it("builds open and directions links", () => {
    assert.match(googleMapsExternalUrl("44.3,-78.32"), /api=1/);
    assert.match(googleMapsDirectionsUrl("44.3,-78.32"), /destination=/);
  });
});
