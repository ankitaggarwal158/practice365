import { Types } from "mongoose";
import * as calendarRepository from "./calendar.repository.js";
import { CalendarEventDocument } from "./calendar.types.js";
import { AppError } from "../../shared/app-error.js";
import { Matter } from "../matters/schemas/matter.schema.js";
import { CalendarEvent } from "./schemas/calendar-event.schema.js";

/**
 * Custom XSS Sanitizer for plain text.
 */
function sanitizeText(text: string): string {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, ""); // simple HTML strip
}

/**
 * Validates that the referenced Matter exists and belongs to this firm.
 */
async function validateMatter(firmId: string, matterId: string): Promise<void> {
  if (!Types.ObjectId.isValid(matterId)) {
    throw AppError.validation("Invalid matter ID format.");
  }
  const exists = await Matter.findOne({
    _id: new Types.ObjectId(matterId),
    firmId: new Types.ObjectId(firmId),
  }).exec();

  if (!exists) {
    throw AppError.validation("The referenced matter is invalid or belongs to another firm.");
  }
}

/**
 * Reconciles overdue upcoming events to MISSED status.
 */
export async function reconcileOverdueEvent(
  event: CalendarEventDocument
): Promise<CalendarEventDocument> {
  const now = new Date();
  if (event.status === "UPCOMING" && event.endDateTime < now) {
    const updated = await CalendarEvent.findByIdAndUpdate(
      event._id,
      { $set: { status: "MISSED" } },
      { new: true }
    )
      .populate("assignedUsers", "firstName lastName displayName")
      .populate("createdBy", "firstName lastName displayName")
      .populate("completedBy", "firstName lastName displayName")
      .exec();
    return updated || event;
  }
  return event;
}

/**
 * Log mock reminder scheduling.
 */
export function scheduleRemindersForEvent(event: CalendarEventDocument): void {
  if (event.reminderOffsets && event.reminderOffsets.length > 0) {
    console.log(
      `[REMINDERS] Scheduled reminders for event "${event.title}" (${
        event._id
      }) with offsets: ${event.reminderOffsets.join(", ")} minutes`
    );
  }
}

export async function listEvents(
  firmId: string,
  filter: calendarRepository.CalendarListFilter
) {
  const paginated = await calendarRepository.findAll(firmId, filter);
  
  // Reconcile status of returned events
  const reconciledDocs = await Promise.all(
    paginated.docs.map((doc) => reconcileOverdueEvent(doc))
  );

  return {
    ...paginated,
    docs: reconciledDocs,
  };
}

export async function getEvent(id: string, firmId: string): Promise<CalendarEventDocument> {
  const event = await calendarRepository.findById(id, firmId);
  if (!event) {
    throw AppError.notFound("Calendar event not found.");
  }
  return reconcileOverdueEvent(event);
}

export async function createEvent(
  firmId: string,
  userId: string,
  data: {
    matterId?: string | null;
    title: string;
    description?: string;
    eventType: string;
    startDateTime: Date;
    endDateTime: Date;
    allDay?: boolean;
    location?: string;
    assignedUsers?: string[];
    reminderOffsets?: number[];
    status?: string;
  }
): Promise<CalendarEventDocument> {
  if (data.matterId) {
    await validateMatter(firmId, data.matterId);
  }

  const payload: Partial<CalendarEventDocument> = {
    firmId: new Types.ObjectId(firmId),
    matterId: data.matterId ? new Types.ObjectId(data.matterId) : null,
    title: sanitizeText(data.title),
    description: sanitizeText(data.description || ""),
    eventType: data.eventType as any,
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
    allDay: !!data.allDay,
    location: sanitizeText(data.location || ""),
    assignedUsers: (data.assignedUsers || []).map((id) => new Types.ObjectId(id)),
    reminderOffsets: data.reminderOffsets || [],
    status: (data.status as any) || "UPCOMING",
    createdBy: new Types.ObjectId(userId),
    deleted: false,
  };

  const created = await calendarRepository.create(payload);
  scheduleRemindersForEvent(created);
  return created;
}

export async function updateEvent(
  id: string,
  firmId: string,
  data: {
    matterId?: string | null;
    title?: string;
    description?: string;
    eventType?: string;
    startDateTime?: Date;
    endDateTime?: Date;
    allDay?: boolean;
    location?: string;
    assignedUsers?: string[];
    reminderOffsets?: number[];
    status?: string;
  },
  userId: string
): Promise<CalendarEventDocument> {
  const event = await calendarRepository.findById(id, firmId);
  if (!event) {
    throw AppError.notFound("Calendar event not found.");
  }

  if (data.matterId) {
    await validateMatter(firmId, data.matterId);
  }

  const updatePayload: Partial<CalendarEventDocument> = {};
  if (data.matterId !== undefined) {
    updatePayload.matterId = data.matterId ? new Types.ObjectId(data.matterId) : null;
  }
  if (data.title !== undefined) {
    updatePayload.title = sanitizeText(data.title);
  }
  if (data.description !== undefined) {
    updatePayload.description = sanitizeText(data.description);
  }
  if (data.eventType !== undefined) {
    updatePayload.eventType = data.eventType as any;
  }
  if (data.startDateTime !== undefined) {
    updatePayload.startDateTime = data.startDateTime;
  }
  if (data.endDateTime !== undefined) {
    updatePayload.endDateTime = data.endDateTime;
  }
  if (data.allDay !== undefined) {
    updatePayload.allDay = data.allDay;
  }
  if (data.location !== undefined) {
    updatePayload.location = sanitizeText(data.location);
  }
  if (data.assignedUsers !== undefined) {
    updatePayload.assignedUsers = data.assignedUsers.map((id) => new Types.ObjectId(id));
  }
  if (data.reminderOffsets !== undefined) {
    updatePayload.reminderOffsets = data.reminderOffsets;
  }
  if (data.status !== undefined) {
    updatePayload.status = data.status as any;
  }

  const updated = await calendarRepository.update(id, firmId, updatePayload);
  if (!updated) {
    throw AppError.notFound("Calendar event not found.");
  }

  if (data.reminderOffsets !== undefined || data.startDateTime !== undefined) {
    scheduleRemindersForEvent(updated);
  }

  return reconcileOverdueEvent(updated);
}

export async function completeEvent(
  id: string,
  firmId: string,
  userId: string,
  status: "COMPLETED" | "UPCOMING"
): Promise<CalendarEventDocument> {
  const event = await calendarRepository.findById(id, firmId);
  if (!event) {
    throw AppError.notFound("Calendar event not found.");
  }

  const updated = await calendarRepository.complete(id, firmId, userId, status);
  if (!updated) {
    throw AppError.notFound("Calendar event not found.");
  }

  return updated;
}

export async function softDeleteEvent(
  id: string,
  firmId: string,
  userId: string
): Promise<CalendarEventDocument> {
  const event = await calendarRepository.findById(id, firmId);
  if (!event) {
    throw AppError.notFound("Calendar event not found.");
  }

  const deleted = await calendarRepository.softDelete(id, firmId, userId);
  if (!deleted) {
    throw AppError.notFound("Calendar event not found.");
  }

  return deleted;
}
