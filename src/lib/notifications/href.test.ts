import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { notificationHref, notificationSurface } from "./href.ts";

describe("notification href", () => {
  it("maps jobs to the signed-in surface", () => {
    assert.equal(notificationHref("CUSTOMER", { jobId: "j1" }), "/customer/jobs/j1");
    assert.equal(notificationHref("CREW", { jobId: "j1" }), "/crew/jobs/j1");
    assert.equal(notificationHref("ADMIN", { jobId: "j1" }), "/admin/jobs/j1");
    assert.equal(notificationHref("SUPER_ADMIN", { jobId: "j1" }), "/admin/jobs/j1");
  });

  it("keeps requests and wood orders off the crew surface", () => {
    assert.equal(notificationHref("CREW", { requestId: "r1" }), null);
    assert.equal(notificationHref("CUSTOMER", { requestId: "r1" }), "/customer/requests/r1");
    assert.equal(notificationHref("ADMIN", { orderId: "o1" }), "/admin/orders/o1");
  });

  it("sends contract notices to the season, not a per-contract customer page", () => {
    assert.equal(notificationHref("CUSTOMER", { contractId: "c1" }), "/customer/contracts");
    assert.equal(notificationHref("ADMIN", { contractId: "c1" }), "/admin/contracts/c1");
    assert.equal(notificationHref("CREW", { contractId: "c1" }), null);
  });

  it("treats unknown roles as operations", () => {
    assert.equal(notificationSurface("SUPER_ADMIN"), "ADMIN");
    assert.equal(notificationHref("CUSTOMER", {}), null);
  });
});
