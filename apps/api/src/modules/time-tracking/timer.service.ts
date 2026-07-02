import { Types } from "mongoose";
import { timeEntryRepository } from "./time-entry.repository.js";
import { TimerStatus, BillingType } from "./constants/time-entry.constants.js";
import { resolveHourlyRate } from "./utils/rate-resolver.js";
import { AppError } from "../../shared/app-error.js";

export class TimerService {
  async startTimer(firmId: string, userId: string, data: { matterId?: string; clientId?: string; description?: string; billingType?: BillingType }) {
    // Check for existing active timer
    const activeTimer = await timeEntryRepository.findActiveTimerForUser(userId, firmId);
    if (activeTimer) {
      throw AppError.badRequest("User already has an active timer. Please stop it first.");
    }


    const now = new Date();
    const { hourlyRate, billingType } = await resolveHourlyRate(userId, data.matterId, data.billingType);
    
    return timeEntryRepository.create({
      firmId: new Types.ObjectId(firmId),
      userId: new Types.ObjectId(userId),
      matterId: data.matterId ? new Types.ObjectId(data.matterId) : undefined,
      clientId: data.clientId ? new Types.ObjectId(data.clientId) : undefined,
      description: data.description || "Timer started",
      date: now,
      timerStatus: TimerStatus.RUNNING,
      billingType,
      timerStartedAt: now,
      lastResumedAt: now,
      accumulatedSeconds: 0,
      durationMinutes: 0,
      hourlyRate,
      billableAmount: 0,
    });
  }

  async pauseTimer(firmId: string, userId: string) {
    const activeTimer = await timeEntryRepository.findActiveTimerForUser(userId, firmId);
    if (!activeTimer) {
      throw AppError.notFound("No active timer found to pause.");
    }
    if (activeTimer.timerStatus !== TimerStatus.RUNNING) {
      throw AppError.badRequest("Timer is not currently running.");
    }

    const now = new Date();
    const resumedAt = activeTimer.lastResumedAt || activeTimer.timerStartedAt || now;
    const sessionSeconds = Math.floor((now.getTime() - resumedAt.getTime()) / 1000);
    const newAccumulated = (activeTimer.accumulatedSeconds || 0) + sessionSeconds;
    
    // Update live duration in minutes
    const durationMinutes = Math.floor(newAccumulated / 60);
    const billableAmount = activeTimer.billingType === BillingType.NON_BILLABLE ? 0 : (durationMinutes / 60) * activeTimer.hourlyRate;

    return timeEntryRepository.update(activeTimer._id, firmId, {
      timerStatus: TimerStatus.PAUSED,
      accumulatedSeconds: newAccumulated,
      durationMinutes,
      billableAmount
    });
  }

  async resumeTimer(firmId: string, userId: string) {
    const activeTimer = await timeEntryRepository.findActiveTimerForUser(userId, firmId);
    if (!activeTimer) {
      throw AppError.notFound("No active timer found to resume.");
    }
    if (activeTimer.timerStatus !== TimerStatus.PAUSED) {
      throw AppError.badRequest("Timer is not paused.");
    }

    return timeEntryRepository.update(activeTimer._id, firmId, {
      timerStatus: TimerStatus.RUNNING,
      lastResumedAt: new Date(),
    });
  }

  async stopTimer(firmId: string, userId: string) {
    const activeTimer = await timeEntryRepository.findActiveTimerForUser(userId, firmId);
    if (!activeTimer) {
      throw AppError.notFound("No active timer found to stop.");
    }

    const now = new Date();
    let newAccumulated = activeTimer.accumulatedSeconds || 0;

    if (activeTimer.timerStatus === TimerStatus.RUNNING) {
      const resumedAt = activeTimer.lastResumedAt || activeTimer.timerStartedAt || now;
      const sessionSeconds = Math.floor((now.getTime() - resumedAt.getTime()) / 1000);
      newAccumulated += sessionSeconds;
    }

    const durationMinutes = Math.floor(newAccumulated / 60);
    const billableAmount = activeTimer.billingType === BillingType.NON_BILLABLE ? 0 : (durationMinutes / 60) * activeTimer.hourlyRate;

    return timeEntryRepository.update(activeTimer._id, firmId, {
      timerStatus: TimerStatus.STOPPED,
      timerStoppedAt: now,
      accumulatedSeconds: newAccumulated,
      durationMinutes,
      billableAmount
    });
  }

  async getActiveTimer(firmId: string, userId: string) {
    return timeEntryRepository.findActiveTimerForUser(userId, firmId);
  }
}

export const timerService = new TimerService();
