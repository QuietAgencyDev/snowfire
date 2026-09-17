import assert from "node:assert/strict";
import { test } from "node:test";
import { internalPath } from "./safe-path.ts";

test("keeps ordinary in-app destinations", () => {
  assert.equal(internalPath("/reset-password"), "/reset-password");
  assert.equal(internalPath("/customer/properties/1"), "/customer/properties/1");
  assert.equal(internalPath("/admin?tab=jobs"), "/admin?tab=jobs");
});

test("refuses anything that would leave the site", () => {
  // Protocol-relative: a browser reads this as a host, not a path.
  assert.equal(internalPath("//evil.example.com"), null);
  assert.equal(internalPath("//evil.example.com/reset-password"), null);
  assert.equal(internalPath("https://evil.example.com"), null);
  assert.equal(internalPath("http://evil.example.com"), null);
  assert.equal(internalPath("javascript:alert(1)"), null);
  // Backslashes, which some clients fold into forward slashes.
  assert.equal(internalPath("/\\evil.example.com"), null);
  assert.equal(internalPath("\\\\evil.example.com"), null);
});

test("refuses relative and empty values", () => {
  assert.equal(internalPath("reset-password"), null);
  assert.equal(internalPath(""), null);
  assert.equal(internalPath(null), null);
  assert.equal(internalPath(undefined), null);
});
