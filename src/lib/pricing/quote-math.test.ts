import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canFulfillInventory,
  initialRequestStatus,
  isOnOrAfterDay,
  quoteFirewoodLoad,
  quoteSnowService,
} from "./quote-math.ts";

describe("snow quote", () => {
  it("treats a zero base price as a custom quote", () => {
    const quote = quoteSnowService({ basePrice: 0, pricingModel: "PER_EVENT" });
    assert.equal(quote.custom, true);
    assert.equal(quote.amountCents, 0);
  });

  it("uses a listed price when the catalog has cents", () => {
    const quote = quoteSnowService({ basePrice: 12900, pricingModel: "FIXED" });
    assert.equal(quote.custom, false);
    assert.equal(quote.amountCents, 12900);
  });
});

describe("firewood totals", () => {
  it("applies Ontario HST in basis points", () => {
    const totals = quoteFirewoodLoad({
      unitPriceCents: 18900,
      quantity: 2,
      taxBps: 1300,
    });

    assert.equal(totals.subtotal, 37800);
    assert.equal(totals.tax, 4914);
    assert.equal(totals.total, 42714);
  });

  it("blocks overselling the crib", () => {
    assert.equal(canFulfillInventory(7, 8), false);
    assert.equal(canFulfillInventory(7, 7), true);
  });
});

describe("booking gates", () => {
  it("honors admin approval vs auto confirm", () => {
    assert.equal(initialRequestStatus("ADMIN_APPROVAL"), "ADMIN_REVIEW");
    assert.equal(initialRequestStatus("AUTO_CONFIRM"), "APPROVED");
  });

  it("rejects a date before today", () => {
    assert.equal(isOnOrAfterDay("2026-09-06", "2026-09-07"), false);
    assert.equal(isOnOrAfterDay("2026-09-07", "2026-09-07"), true);
    assert.equal(isOnOrAfterDay("not-a-date", "2026-09-07"), false);
  });
});
