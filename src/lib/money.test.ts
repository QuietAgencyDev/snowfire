import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addCents, applyTaxBps, formatCadFromCents } from "./money.ts";

describe("money", () => {
  it("adds integer cents only", () => {
    assert.equal(addCents(1000, 130, 25), 1155);
    assert.throws(() => addCents(10.5, 1));
  });

  it("applies tax in basis points", () => {
    assert.equal(applyTaxBps(10000, 1300), 1300);
  });

  it("formats CAD from cents", () => {
    assert.equal(formatCadFromCents(12345), "$123.45");
  });
});
