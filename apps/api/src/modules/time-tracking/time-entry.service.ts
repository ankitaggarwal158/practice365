import { Types } from "mongoose";
import { timeEntryRepository } from "./time-entry.repository.js";
import { CreateTimeEntryDTO, UpdateTimeEntryDTO } from "./types/time-entry.types.js";
import { TimerStatus, BillingType } from "./constants/time-entry.constants.js";
import { resolveHourlyRate } from "./utils/rate-resolver.js";
import { AppError } from "../../shared/app-error.js";

export class TimeEntryService {
  async createManualEntry(firmId: string, userId: string, data: CreateTimeEntryDTO) {
    const { hourlyRate, billingType } = await resolveHourlyRate(userId, data.matterId, data.billingType);
    const billableAmount = billingType === BillingType.NON_BILLABLE ? 0 : (data.durationMinutes / 60) * hourlyRate;

    const entry = await timeEntryRepository.create({
      firmId: new Types.ObjectId(firmId),
      userId: new Types.ObjectId(userId),
      matterId: data.matterId ? new Types.ObjectId(data.matterId) : undefined,
      clientId: data.clientId ? new Types.ObjectId(data.clientId) : undefined,
      description: data.description,
      date: data.date ? new Date(data.date) : new Date(),
      durationMinutes: data.durationMinutes,
      hourlyRate,
      billableAmount,
      billingType,
      timerStatus: TimerStatus.MANUAL,
    });
    console.log(`[AUDIT] Time entry created manually: entryId=${entry._id}, userId=${userId}, firmId=${firmId}, durationMinutes=${entry.durationMinutes}`);
    return entry;
  }

  async getEntryById(id: string, firmId: string) {
    const entry = await timeEntryRepository.findById(id, firmId);
    if (!entry) throw AppError.notFound("Time entry not found");
    return entry;
  }

  async updateEntry(id: string, firmId: string, data: UpdateTimeEntryDTO) {
    const entry = await this.getEntryById(id, firmId);

    if (entry.isBilled) {
      if (
        (data.durationMinutes !== undefined && data.durationMinutes !== entry.durationMinutes) ||
        (data.billingType !== undefined && data.billingType !== entry.billingType) ||
        (data.hourlyRate !== undefined && data.hourlyRate !== entry.hourlyRate) ||
        (data.matterId !== undefined && data.matterId !== entry.matterId?.toString()) ||
        (data.clientId !== undefined && data.clientId !== entry.clientId?.toString()) ||
        (data.date !== undefined && new Date(data.date).getTime() !== new Date(entry.date).getTime())
      ) {
        throw AppError.badRequest("Cannot modify duration, billing type, rates, dates or associations on a billed time entry.");
      }
    }
    
    // Recalculate billable amount if duration, matter, or rate changed
    const matterId = data.matterId || entry.matterId?.toString();
    const { hourlyRate, billingType } = await resolveHourlyRate(entry.userId.toString(), matterId, data.billingType || entry.billingType);
    const durationMinutes = data.durationMinutes ?? entry.durationMinutes;
    const billableAmount = billingType === BillingType.NON_BILLABLE ? 0 : (durationMinutes / 60) * hourlyRate;

    const updateData: any = {
      ...data,
      hourlyRate,
      durationMinutes,
      billableAmount,
      billingType,
    };

    if (data.matterId) updateData.matterId = new Types.ObjectId(data.matterId);
    if (data.clientId) updateData.clientId = new Types.ObjectId(data.clientId);
    if (data.date) updateData.date = new Date(data.date);

    const updated = await timeEntryRepository.update(id, firmId, updateData);
    console.log(`[AUDIT] Time entry updated: entryId=${id}, userId=${entry.userId}, firmId=${firmId}`);
    return updated;
  }

  async deleteEntry(id: string, firmId: string) {
    const success = await timeEntryRepository.softDelete(id, firmId);
    if (!success) throw AppError.notFound("Time entry not found");
    console.log(`[AUDIT] Time entry soft-deleted: entryId=${id}, firmId=${firmId}`);
    return true;
  }

  async search(filters: any) {
    return timeEntryRepository.search(filters);
  }
}

export const timeEntryService = new TimeEntryService();
