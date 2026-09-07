import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAccessPath,
  homePathForRole,
  isAdminRole,
  isUserRole,
} from "./roles.ts";

describe("roles", () => {
  it("accepts known roles only", () => {
    assert.equal(isUserRole("CUSTOMER"), true);
    assert.equal(isUserRole("CREW"), true);
    assert.equal(isUserRole("ADMIN"), true);
    assert.equal(isUserRole("SUPER_ADMIN"), true);
    assert.equal(isUserRole("owner"), false);
    assert.equal(isUserRole(null), false);
  });

  it("routes each role to its home", () => {
    assert.equal(homePathForRole("CUSTOMER"), "/customer");
    assert.equal(homePathForRole("CREW"), "/crew");
    assert.equal(homePathForRole("ADMIN"), "/admin");
    assert.equal(homePathForRole("SUPER_ADMIN"), "/admin");
  });

  it("keeps role surfaces separate", () => {
    assert.equal(canAccessPath("CUSTOMER", "/customer/properties"), true);
    assert.equal(canAccessPath("CUSTOMER", "/admin"), false);
    assert.equal(canAccessPath("CREW", "/crew/jobs"), true);
    assert.equal(canAccessPath("CREW", "/customer"), false);
    assert.equal(canAccessPath("ADMIN", "/admin/jobs"), true);
    assert.equal(canAccessPath("ADMIN", "/crew"), false);
    assert.equal(isAdminRole("SUPER_ADMIN"), true);
  });
});
