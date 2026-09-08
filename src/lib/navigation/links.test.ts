import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canAccessPath } from "../roles.ts";
import {
  initials,
  isActiveEntry,
  isActivePath,
  navHrefs,
  primaryNav,
  updatesHref,
} from "./links.ts";

describe("primary navigation", () => {
  it("never offers a link the role cannot open", () => {
    for (const role of ["CUSTOMER", "CREW", "ADMIN", "SUPER_ADMIN"] as const) {
      for (const href of [...navHrefs(role), updatesHref(role)]) {
        assert.equal(canAccessPath(role, href), true, `${role} cannot open ${href}`);
      }
    }
  });

  it("keeps the top bar short enough to read", () => {
    for (const role of ["CUSTOMER", "CREW", "ADMIN", "SUPER_ADMIN"] as const) {
      assert.equal(primaryNav(role).length <= 4, true);
    }
  });

  it("groups the long customer list behind menus", () => {
    const customer = primaryNav("CUSTOMER");

    assert.equal(customer.filter((entry) => entry.kind === "menu").length >= 2, true);
    assert.equal(navHrefs("CUSTOMER").length > customer.length, true);
  });
});

describe("active path", () => {
  it("matches a section and its children", () => {
    assert.equal(isActivePath("/customer/properties", "/customer/properties"), true);
    assert.equal(isActivePath("/customer/properties/abc", "/customer/properties"), true);
    assert.equal(isActivePath("/customer/propertiesx", "/customer/properties"), false);
  });

  it("keeps a role home from swallowing every page", () => {
    assert.equal(isActivePath("/customer", "/customer"), true);
    assert.equal(isActivePath("/customer/jobs", "/customer"), false);
    assert.equal(isActivePath("/admin/storms", "/admin"), false);
  });

  it("lights the menu that owns the current page", () => {
    const [, properties] = primaryNav("CUSTOMER");

    assert.equal(isActiveEntry("/customer/properties/abc", properties), true);
    assert.equal(isActiveEntry("/customer/book", properties), false);
  });
});

describe("initials", () => {
  it("builds a two-letter avatar", () => {
    assert.equal(initials("Quinn", "Poole"), "QP");
    assert.equal(initials("quinn", ""), "Q");
    assert.equal(initials("", ""), "SF");
  });
});
