import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatPostalCode,
  formatPropertyAddress,
  isOwnProperty,
  propertyCoordinates,
} from "./address.ts";

describe("property address", () => {
  it("formats Canadian postal codes", () => {
    assert.equal(formatPostalCode("k1a0b1"), "K1A 0B1");
    assert.equal(formatPostalCode("K1A 0B1"), "K1A 0B1");
  });

  it("builds a single-line address", () => {
    assert.equal(
      formatPropertyAddress({
        address_line_1: "12 Maple St",
        address_line_2: "Unit 4",
        city: "Peterborough",
        province: "ON",
        postal_code: "k9j2n1",
      }),
      "12 Maple St, Unit 4, Peterborough, ON K9J 2N1",
    );
  });

  it("reads numeric coordinates stored as strings", () => {
    assert.deepEqual(
      propertyCoordinates({ latitude: "44.309100", longitude: "-78.319700" }),
      { latitude: 44.3091, longitude: -78.3197 },
    );
    assert.equal(propertyCoordinates({ latitude: null, longitude: -78.3 }), null);
  });

  it("keeps customer A from claiming customer B property", () => {
    assert.equal(isOwnProperty("customer-a", "customer-a"), true);
    assert.equal(isOwnProperty("customer-a", "customer-b"), false);
  });
});
