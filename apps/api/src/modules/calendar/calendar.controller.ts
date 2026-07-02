import { Request, Response } from "express";
import * as calendarService from "./calendar.service.js";
import { CalendarEventDocument } from "./calendar.types.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId.toString();
}

export function formatEvent(event: CalendarEventDocument) {
  return {
    id: event._id.toString(),
    firmId: event.firmId.toString(),
    matterId: event.matterId ? event.matterId.toString() : null,
    title: event.title,
    description: event.description,
    eventType: event.eventType,
    startDateTime: event.startDateTime.toISOString(),
    endDateTime: event.endDateTime.toISOString(),
    allDay: event.allDay,
    location: event.location,
    assignedUsers: (event.assignedUsers || []).map((u: any) => ({
      id: u._id?.toString() || u.toString(),
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      displayName: u.displayName || "",
    })),
    reminderOffsets: event.reminderOffsets,
    status: event.status,
    completedAt: event.completedAt ? event.completedAt.toISOString() : null,
    completedBy: event.completedBy ? {
      id: (event.completedBy as any)._id?.toString() || event.completedBy.toString(),
      firstName: (event.completedBy as any).firstName || "",
      lastName: (event.completedBy as any).lastName || "",
      displayName: (event.completedBy as any).displayName || "",
    } : null,
    createdBy: event.createdBy ? {
      id: (event.createdBy as any)._id?.toString() || event.createdBy.toString(),
      firstName: (event.createdBy as any).firstName || "",
      lastName: (event.createdBy as any).lastName || "",
      displayName: (event.createdBy as any).displayName || "",
    } : null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

export async function listEvents(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { start, end, matterId, assignedUserId, eventType, status, search, page, limit } = req.query;

  const filter = {
    start: start ? String(start) : undefined,
    end: end ? String(end) : undefined,
    matterId: matterId ? String(matterId) : undefined,
    assignedUserId: assignedUserId ? String(assignedUserId) : undefined,
    eventType: eventType ? String(eventType) : undefined,
    status: status ? String(status) : undefined,
    search: search ? String(search) : undefined,
    page: page ? parseInt(String(page)) : undefined,
    limit: limit ? parseInt(String(limit)) : undefined,
  };

  const paginated = await calendarService.listEvents(firmId, filter);

  res.status(200).json({
    success: true,
    data: paginated.docs.map(formatEvent),
    pagination: {
      page: paginated.page,
      limit: paginated.limit,
      total: paginated.totalDocs,
      pages: paginated.totalPages,
    },
  });
}

export async function getEvent(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const eventId = req.params.id as string;

  const event = await calendarService.getEvent(eventId, firmId);
  res.status(200).json({
    success: true,
    data: formatEvent(event),
  });
}

export async function createEvent(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const {
    matterId,
    title,
    description,
    eventType,
    startDateTime,
    endDateTime,
    allDay,
    location,
    assignedUsers,
    reminderOffsets,
    status,
  } = req.body;

  const created = await calendarService.createEvent(firmId, userId, {
    matterId,
    title,
    description,
    eventType,
    startDateTime,
    endDateTime,
    allDay,
    location,
    assignedUsers,
    reminderOffsets,
    status,
  });

  res.status(201).json({
    success: true,
    data: formatEvent(created),
  });
}

export async function updateEvent(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const eventId = req.params.id as string;
  const {
    matterId,
    title,
    description,
    eventType,
    startDateTime,
    endDateTime,
    allDay,
    location,
    assignedUsers,
    reminderOffsets,
    status,
  } = req.body;

  const updated = await calendarService.updateEvent(eventId, firmId, {
    matterId,
    title,
    description,
    eventType,
    startDateTime,
    endDateTime,
    allDay,
    location,
    assignedUsers,
    reminderOffsets,
    status,
  }, userId);

  res.status(200).json({
    success: true,
    data: formatEvent(updated),
  });
}

export async function completeEvent(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const eventId = req.params.id as string;
  const { status } = req.body;

  const updated = await calendarService.completeEvent(eventId, firmId, userId, status);
  res.status(200).json({
    success: true,
    data: formatEvent(updated),
  });
}

export async function deleteEvent(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const eventId = req.params.id as string;

  await calendarService.softDeleteEvent(eventId, firmId, userId);

  res.status(200).json({
    success: true,
    message: "Calendar event deleted successfully.",
  });
}
