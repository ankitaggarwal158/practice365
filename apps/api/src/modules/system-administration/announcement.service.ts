import * as systemSettingsRepository from "./system-settings.repository.js";
import { recordAuditEvent } from "../audit-log/index.js";

export async function listAnnouncements() {
  return systemSettingsRepository.listAnnouncements(false);
}

export async function listActiveAnnouncements() {
  return systemSettingsRepository.listActiveAnnouncements();
}

export async function createAnnouncement(
  data: any,
  userId: string,
  firmId: string,
  auditOptions: { ipAddress?: string; userAgent?: string }
) {
  const announcement = await systemSettingsRepository.createAnnouncement(data, userId);

  await recordAuditEvent({
    firmId,
    userId,
    module: "System Administration",
    action: "ANNOUNCEMENT_CREATED",
    entityType: "SystemAnnouncement",
    entityId: announcement._id.toString(),
    currentState: announcement.toObject(),
    ipAddress: auditOptions.ipAddress,
    userAgent: auditOptions.userAgent,
    metadata: { message: `Announcement "${data.title}" published.` },
  });

  return announcement;
}

export async function updateAnnouncement(
  id: string,
  data: any,
  userId: string,
  firmId: string,
  auditOptions: { ipAddress?: string; userAgent?: string }
) {
  const previous = await systemSettingsRepository.findAnnouncementById(id);
  if (!previous) {
    throw new Error("Announcement not found or already deleted.");
  }

  const previousState = previous.toObject();
  const current = await systemSettingsRepository.updateAnnouncement(id, data);

  await recordAuditEvent({
    firmId,
    userId,
    module: "System Administration",
    action: "ANNOUNCEMENT_UPDATED",
    entityType: "SystemAnnouncement",
    entityId: id,
    previousState,
    currentState: current?.toObject(),
    ipAddress: auditOptions.ipAddress,
    userAgent: auditOptions.userAgent,
    metadata: { message: `Announcement "${previous.title}" updated.` },
  });

  return current;
}

export async function softDeleteAnnouncement(
  id: string,
  userId: string,
  firmId: string,
  auditOptions: { ipAddress?: string; userAgent?: string }
) {
  const previous = await systemSettingsRepository.findAnnouncementById(id);
  if (!previous) {
    throw new Error("Announcement not found or already deleted.");
  }

  const previousState = previous.toObject();
  const current = await systemSettingsRepository.softDeleteAnnouncement(id);

  await recordAuditEvent({
    firmId,
    userId,
    module: "System Administration",
    action: "ANNOUNCEMENT_DELETED",
    entityType: "SystemAnnouncement",
    entityId: id,
    previousState,
    currentState: current?.toObject(),
    ipAddress: auditOptions.ipAddress,
    userAgent: auditOptions.userAgent,
    metadata: { message: `Announcement "${previous.title}" deleted.` },
  });

  return current;
}
