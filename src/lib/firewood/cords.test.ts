import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimateCords } from "./cords.ts";

describe("cord estimate", () => {
  it("stays empty until square footage is entered", () => {
    const result = estimateCords({ heatedSqFt: 0, use: "primary" });
    assert.equal(result.fullCords, 0);
    assert.match(result.detail, /Enter the heated/i);
  });

  it("sizes a primary-heat house in full and face cords", () => {
    const result = estimateCords({ heatedSqFt: 1800, use: "primary" });
    assert.equal(result.fullCords, 2);
    assert.equal(result.faceCords, 6);
    assert.match(result.detail, /yard estimate/i);
  });

  it("asks for less wood when the stove is just ambiance", () => {
    const primary = estimateCords({ heatedSqFt: 1800, use: "primary" });
    const ambiance = estimateCords({ heatedSqFt: 1800, use: "ambiance" });
    assert.equal(ambiance.fullCords < primary.fullCords, true);
  });
});
