import { Types } from "mongoose";
import { timeEntryRepository } from "./time-entry.repository.js";
import { TimeEntryModel } from "./schemas/time-entry.schema.js";
import { TimerStatus, BillingType } from "./constants/time-entry.constants.js";
import { resolveHourlyRate } from "./utils/rate-resolver.js";
import { AppError } from "../../shared/app-error.js";

export class TimerService {
  async startTimer(firmId: string, userId: string, data: { matterId?: string; clientId?: string; clientDescription?: string; internalNote?: string; billingType?: BillingType }) {
    const now = new Date();
    const { hourlyRate, billingType } = await resolveHourlyRate(userId, data.matterId, data.billingType);
    
    const timer = await timeEntryRepository.create({
      firmId: new Types.ObjectId(firmId),
      userId: new Types.ObjectId(userId),
      matterId: data.matterId ? new Types.ObjectId(data.matterId) : undefined,
      clientId: data.clientId ? new Types.ObjectId(data.clientId) : undefined,
      clientDescription: data.clientDescription || "Timer started",
      internalNote: data.internalNote || "",
      date: now,
      timerStatus: TimerStatus.RUNNING,
      billingType,
      timerStartedAt: now,
      lastResumedAt: now,
      accumulatedSeconds: 0,
      durationMinutes: 0,
      hourlyRate,
      billableAmount: 0,
      createdBy: new Types.ObjectId(userId),
    });
    console.log(`[AUDIT] Timer started: entryId=${timer._id}, userId=${userId}, firmId=${firmId}`);
    return timer;
  }

  async pauseTimer(firmId: string, userId: string, timerId: string) {
    const timer = await timeEntryRepository.findById(timerId, firmId);
    if (!timer || timer.userId.toString() !== userId) {
      throw AppError.notFound("Timer not found.");
    }
    if (timer.timerStatus !== TimerStatus.RUNNING) {
      throw AppError.badRequest("Timer is not currently running.");
    }

    const now = new Date();
    const resumedAt = timer.lastResumedAt || timer.timerStartedAt || now;
    const sessionSeconds = Math.floor((now.getTime() - resumedAt.getTime()) / 1000);
    const newAccumulated = (timer.accumulatedSeconds || 0) + sessionSeconds;
    
    // Update live duration in minutes
    const durationMinutes = Math.floor(newAccumulated / 60);
    const billableAmount = timer.billingType === BillingType.NON_BILLABLE ? 0 : (durationMinutes / 60) * timer.hourlyRate;

    const paused = await timeEntryRepository.update(timer._id, firmId, {
      timerStatus: TimerStatus.PAUSED,
      accumulatedSeconds: newAccumulated,
      durationMinutes,
      billableAmount
    });
    console.log(`[AUDIT] Timer paused: entryId=${timer._id}, userId=${userId}, firmId=${firmId}, durationMinutes=${durationMinutes}`);
    return paused;
  }

  async resumeTimer(firmId: string, userId: string, timerId: string) {
    const timer = await timeEntryRepository.findById(timerId, firmId);
    if (!timer || timer.userId.toString() !== userId) {
      throw AppError.notFound("Timer not found.");
    }
    if (timer.timerStatus !== TimerStatus.PAUSED) {
      throw AppError.badRequest("Timer is not paused.");
    }

    const resumed = await timeEntryRepository.update(timer._id, firmId, {
      timerStatus: TimerStatus.RUNNING,
      lastResumedAt: new Date(),
    });
    console.log(`[AUDIT] Timer resumed: entryId=${timer._id}, userId=${userId}, firmId=${firmId}`);
    return resumed;
  }

  async stopTimer(firmId: string, userId: string, timerId: string) {
    const timer = await timeEntryRepository.findById(timerId, firmId);
    if (!timer || timer.userId.toString() !== userId) {
      throw AppError.notFound("Timer not found.");
    }

    const now = new Date();
    let newAccumulated = timer.accumulatedSeconds || 0;

    if (timer.timerStatus === TimerStatus.RUNNING) {
      const resumedAt = timer.lastResumedAt || timer.timerStartedAt || now;
      const sessionSeconds = Math.floor((now.getTime() - resumedAt.getTime()) / 1000);
      newAccumulated += sessionSeconds;
    }

    const durationMinutes = Math.floor(newAccumulated / 60);
    const billableAmount = timer.billingType === BillingType.NON_BILLABLE ? 0 : (durationMinutes / 60) * timer.hourlyRate;

    const stopped = await timeEntryRepository.update(timer._id, firmId, {
      timerStatus: TimerStatus.STOPPED,
      timerStoppedAt: now,
      accumulatedSeconds: newAccumulated,
      durationMinutes,
      billableAmount
    });
    console.log(`[AUDIT] Timer stopped: entryId=${timer._id}, userId=${userId}, firmId=${firmId}, durationMinutes=${durationMinutes}`);
    return stopped;
  }

  async getActiveTimers(firmId: string, userId: string) {
    return TimeEntryModel.find({
      userId: new Types.ObjectId(userId),
      firmId: new Types.ObjectId(firmId),
      timerStatus: { $in: [TimerStatus.RUNNING, TimerStatus.PAUSED] },
      deletedAt: { $exists: false },
    }).exec();
  }
}

export const timerService = new TimerService();
