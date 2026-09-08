import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseServicePreferences,
  prefersDeicing,
  servicePreferenceLabel,
} from "./service-options.ts";

describe("service preferences", () => {
  it("keeps only known treatment options", () => {
    assert.deepEqual(parseServicePreferences(["salted", "hacked", "unsalted"]), [
      "salted",
      "unsalted",
    ]);
  });

  it("treats salt and melt as de-icing", () => {
    assert.equal(prefersDeicing(["unsalted", "sand"]), false);
    assert.equal(prefersDeicing(["salted"]), true);
    assert.equal(prefersDeicing(["ice_melt"]), true);
    assert.equal(prefersDeicing(["roof_salt_pucks"]), true);
  });

  it("labels options for the customer", () => {
    assert.equal(servicePreferenceLabel("unsalted"), "Unsalted");
    assert.equal(servicePreferenceLabel("mailbox"), "Mailbox path");
    assert.equal(servicePreferenceLabel("roof_salt_pucks"), "Salt pucks on the roof");
  });
});
