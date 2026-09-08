import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extensionForImageType, jobPhotoPath, propertyPhotoPath } from "./paths.ts";

describe("property photo paths", () => {
  it("keeps photos under the property folder", () => {
    assert.equal(
      propertyPhotoPath(
        "11111111-1111-1111-1111-111111111111",
        "DRIVEWAY",
        "abc",
        "jpg",
      ),
      "properties/11111111-1111-1111-1111-111111111111/DRIVEWAY/abc.jpg",
    );
  });

  it("keeps job proof under the job folder", () => {
    assert.equal(
      jobPhotoPath("22222222-2222-2222-2222-222222222222", "BEFORE", "xyz", "jpg"),
      "jobs/22222222-2222-2222-2222-222222222222/BEFORE/xyz.jpg",
    );
  });

  it("accepts common image types only", () => {
    assert.equal(extensionForImageType("image/jpeg"), "jpg");
    assert.equal(extensionForImageType("image/png"), "png");
    assert.equal(extensionForImageType("image/heic"), null);
  });
});
