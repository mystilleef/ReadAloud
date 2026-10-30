import type { ItemStatusResponse } from "chrome-webstore-upload";
import { describe, expect, it } from "vitest";
import { isPendingReview } from "../review-status";

const statusWith = (
  submittedItemRevisionStatus: unknown,
): ItemStatusResponse => ({
  itemId: "item-id",
  lastAsyncUploadState: "SUCCEEDED",
  name: "publishers/publisher-id/items/item-id",
  publicKey: "public-key",
  publishedItemRevisionStatus: { state: "PUBLISHED" },
  submittedItemRevisionStatus,
  takenDown: false,
});

describe("isPendingReview", () => {
  it("returns true when the submitted revision is pending review", () => {
    expect(isPendingReview(statusWith({ state: "PENDING_REVIEW" }))).toBe(true);
  });

  it.each([
    "STAGED",
    "PUBLISHED",
    "PUBLISHED_TO_TESTERS",
    "REJECTED",
    "CANCELLED",
  ])("returns false when the submitted revision is %s", (state) => {
    expect(isPendingReview(statusWith({ state }))).toBe(false);
  });

  it.each([undefined, null, {}])(
    "returns false when the submitted revision is %o",
    (submitted) => {
      expect(isPendingReview(statusWith(submitted))).toBe(false);
    },
  );
});
