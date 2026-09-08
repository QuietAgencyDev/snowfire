import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { stormJobPriority, stormWatchScore } from "./priority.ts";

describe("storm priority", () => {
  it("maps ice level to a job priority without inventing urgency", () => {
    assert.equal(stormJobPriority("severe"), "URGENT");
    assert.equal(stormJobPriority("high"), "HIGH");
    assert.equal(stormJobPriority("watch"), "NORMAL");
    assert.equal(stormJobPriority(null), "NORMAL");
  });

  it("ranks pinned driveways and parks already-queued ones lower", () => {
    const hot = stormWatchScore({
      iceScore: 80,
      next48hSnowCm: 12,
      hasOpenJob: false,
      hasPin: true,
    });
    const queued = stormWatchScore({
      iceScore: 80,
      next48hSnowCm: 12,
      hasOpenJob: true,
      hasPin: true,
    });
    const unpinned = stormWatchScore({
      iceScore: 80,
      next48hSnowCm: 12,
      hasOpenJob: false,
      hasPin: false,
    });

    assert.equal(hot > queued, true);
    assert.equal(unpinned, 0);
  });
});
