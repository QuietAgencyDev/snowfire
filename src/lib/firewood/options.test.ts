import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  firewoodPreferenceLabel,
  parseFirewoodPreferences,
} from "./options.ts";

describe("firewood preferences", () => {
  it("keeps only known yard options", () => {
    assert.deepEqual(
      parseFirewoodPreferences(["deliver_to_property", "hacked", "covered_storage"]),
      ["deliver_to_property", "covered_storage"],
    );
  });

  it("labels options for the yard file", () => {
    assert.equal(firewoodPreferenceLabel("stack_on_delivery"), "Stack it for me");
    assert.equal(firewoodPreferenceLabel("truck_access"), "Truck can reach the stack");
  });
});
