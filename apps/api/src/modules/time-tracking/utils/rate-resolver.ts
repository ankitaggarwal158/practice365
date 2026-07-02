import { Matter } from "../../matters/schemas/matter.schema.js";
import { PracticeArea } from "../../practice-areas/schemas/practice-area.schema.js";
import { User } from "../../users/schemas/user.schema.js";
import { TIME_TRACKING_CONSTANTS, BillingType } from "../constants/time-entry.constants.js";

export interface RateResolutionResult {
  hourlyRate: number;
  billingType: BillingType;
}

export async function resolveHourlyRate(
  userId: string,
  matterId?: string,
  requestedBillingType?: BillingType
): Promise<RateResolutionResult> {
  let hourlyRate = 0;
  let billingType = requestedBillingType || BillingType.BILLABLE;

  if (matterId) {
    const matter = await Matter.findById(matterId);
    if (matter) {
      if (matter.billingMethod === "FLAT_FEE" || matter.billingMethod === "CONTINGENCY") {
        return {
          hourlyRate: 0,
          billingType: BillingType.NON_BILLABLE,
        };
      }

      if (matter.customHourlyRate !== undefined && matter.customHourlyRate !== null) {
        return {
          hourlyRate: matter.customHourlyRate,
          billingType,
        };
      }

      if (matter.practiceAreaId) {
        const practiceArea = await PracticeArea.findById(matter.practiceAreaId);
        if (practiceArea && practiceArea.defaultHourlyRate) {
          return {
            hourlyRate: practiceArea.defaultHourlyRate,
            billingType,
          };
        }
      }
    }
  }

  // Fallback to user default
  const user = await User.findById(userId);
  if (user && user.defaultHourlyRate) {
    return {
      hourlyRate: user.defaultHourlyRate,
      billingType,
    };
  }

  // Final fallback
  return {
    hourlyRate: TIME_TRACKING_CONSTANTS.DEFAULT_HOURLY_RATE,
    billingType,
  };
}
