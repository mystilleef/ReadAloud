import type { ItemStatusResponse } from "chrome-webstore-upload";

/**
 * Report whether the store still reviews a previous submission.
 *
 * The store rejects uploads during review, so deploy checks first to fail
 * with an actionable message instead of a bare FAILED_PRECONDITION.
 */
export function isPendingReview(status: ItemStatusResponse): boolean {
  const submitted = status.submittedItemRevisionStatus;
  return (
    typeof submitted === "object" &&
    submitted !== null &&
    "state" in submitted &&
    submitted.state === "PENDING_REVIEW"
  );
}
