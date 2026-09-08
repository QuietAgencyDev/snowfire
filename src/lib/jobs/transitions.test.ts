import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canTransition,
  crewCanOpenJob,
  nextCrewAction,
  photoGate,
} from "./transitions.ts";

describe("job transitions", () => {
  it("only moves forward along the crew graph", () => {
    assert.equal(canTransition("ASSIGNED", "EN_ROUTE"), true);
    assert.equal(canTransition("EN_ROUTE", "ARRIVED"), true);
    assert.equal(canTransition("ARRIVED", "IN_PROGRESS"), true);
    assert.equal(canTransition("IN_PROGRESS", "COMPLETED"), true);
    assert.equal(canTransition("ASSIGNED", "COMPLETED"), false);
    assert.equal(canTransition("COMPLETED", "IN_PROGRESS"), false);
  });

  it("keeps crew off an unassigned job", () => {
    assert.equal(crewCanOpenJob(null, "crew-1"), false);
    assert.equal(crewCanOpenJob("crew-2", "crew-1"), false);
    assert.equal(crewCanOpenJob("crew-1", "crew-1"), true);
  });

  it("requires before and after photos at the right gates", () => {
    assert.equal(
      photoGate("ARRIVED", "IN_PROGRESS", {
        beforeCount: 0,
        afterCount: 0,
        beforeRequired: true,
        afterRequired: true,
      }),
      "Take a BEFORE photo first.",
    );
    assert.equal(
      photoGate("IN_PROGRESS", "COMPLETED", {
        beforeCount: 1,
        afterCount: 0,
        beforeRequired: true,
        afterRequired: true,
      }),
      "Take an AFTER photo first.",
    );
    assert.equal(
      photoGate("IN_PROGRESS", "COMPLETED", {
        beforeCount: 1,
        afterCount: 1,
        beforeRequired: true,
        afterRequired: true,
      }),
      null,
    );
  });

  it("labels the next crew action", () => {
    assert.equal(nextCrewAction("ASSIGNED")?.to, "EN_ROUTE");
    assert.equal(nextCrewAction("COMPLETED"), null);
  });
});
