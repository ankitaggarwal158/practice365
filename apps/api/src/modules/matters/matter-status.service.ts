import { AppError } from "../../shared/app-error.js";
import { MATTER_STATUSES, MATTER_ERROR_MESSAGES } from "./matter.constants.js";

/**
 * Validates lifecycle status transitions for matters.
 * Allowed:
 * OPEN -> ON_HOLD, CLOSED
 * ON_HOLD -> OPEN
 * CLOSED -> ARCHIVED, OPEN (reopen)
 * ARCHIVED -> OPEN (restore)
 */
export function validateTransition(
  currentStatus: string,
  newStatus: string
): void {
  if (currentStatus === newStatus) return;

  const validTransitions: Record<string, string[]> = {
    [MATTER_STATUSES.OPEN]: [MATTER_STATUSES.ON_HOLD, MATTER_STATUSES.CLOSED],
    [MATTER_STATUSES.ON_HOLD]: [MATTER_STATUSES.OPEN],
    [MATTER_STATUSES.CLOSED]: [MATTER_STATUSES.ARCHIVED, MATTER_STATUSES.OPEN],
    [MATTER_STATUSES.ARCHIVED]: [MATTER_STATUSES.OPEN],
  };

  const allowed = validTransitions[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw AppError.badRequest(
      `${MATTER_ERROR_MESSAGES.INVALID_STATUS_TRANSITION} Cannot transition from ${currentStatus} to ${newStatus}.`
    );
  }
}
