import { Types } from "mongoose";
import { AuditLog } from "../audit-log/schemas/audit-log.schema.js";
import { MatterNote, Document } from "./schemas/matter.schema.js";
import { CalendarEvent } from "../calendar/schemas/calendar-event.schema.js";
import { DocumentMeta } from "../documents/schemas/document.schema.js";
import { MatterMessageModel } from "../client-messaging/schemas/message.schema.js";
import { TimeEntryModel } from "../time-tracking/schemas/time-entry.schema.js";
import { InvoiceModel } from "../billing/schemas/invoice.schema.js";

export interface TimelineItem {
  id: string;
  type: "AUDIT_LOG" | "NOTE" | "CALENDAR_EVENT" | "DOCUMENT" | "MESSAGE" | "TIME_ENTRY" | "INVOICE";
  action: string;
  title: string;
  description?: string;
  creatorName?: string;
  date: Date;
}

export async function getMatterTimeline(
  matterId: string,
  firmId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: TimelineItem[]; total: number; page: number; limit: number }> {
  const mId = new Types.ObjectId(matterId);
  const fId = new Types.ObjectId(firmId);

  const [
    auditLogs,
    notes,
    events,
    documents,
    messages,
    timeEntries,
    invoices,
  ] = await Promise.all([
    // Audit logs for this matter
    AuditLog.find({ entityId: mId, firmId })
      .populate("userId", "firstName lastName")
      .exec(),

    // Notes on this matter
    MatterNote.find({ matterId: mId })
      .populate("userId", "firstName lastName")
      .exec(),

    // Calendar events
    CalendarEvent.find({ matterId: mId, firmId, deleted: { $ne: true } })
      .populate("createdBy", "firstName lastName")
      .exec(),

    // Document uploads
    DocumentMeta.find({ matterId: mId, firmId, deleted: false })
      .populate("createdBy", "firstName lastName")
      .exec(),

    // Portal Messages
    MatterMessageModel.find({ matterId: mId, firmId })
      .populate("senderId", "firstName lastName")
      .exec(),

    // Time entries
    TimeEntryModel.find({ matterId: mId, firmId, deleted: false })
      .populate("userId", "firstName lastName")
      .exec(),

    // Invoices
    InvoiceModel.find({ matterId: mId, firmId, deleted: false })
      .populate("createdBy", "firstName lastName")
      .exec(),
  ]);

  const timelineItems: TimelineItem[] = [];

  // 1. Map Audit Logs
  auditLogs.forEach((log: any) => {
    const creator = log.userId ? `${log.userId.firstName} ${log.userId.lastName}`.trim() : "System";
    timelineItems.push({
      id: log._id.toString(),
      type: "AUDIT_LOG",
      action: log.action,
      title: `${log.action} in ${log.module}`,
      description: log.metadata?.message || `Action ${log.action} performed`,
      creatorName: creator,
      date: log.createdAt,
    });
  });

  // 2. Map Notes
  notes.forEach((note: any) => {
    const creator = note.userId ? `${note.userId.firstName} ${note.userId.lastName}`.trim() : "Unknown";
    timelineItems.push({
      id: note._id.toString(),
      type: "NOTE",
      action: "created",
      title: "Note Added",
      description: note.note,
      creatorName: creator,
      date: note.createdAt,
    });
  });

  // 3. Map Calendar Events
  events.forEach((evt: any) => {
    const creator = evt.createdBy ? `${evt.createdBy.firstName} ${evt.createdBy.lastName}`.trim() : "Unknown";
    timelineItems.push({
      id: evt._id.toString(),
      type: "CALENDAR_EVENT",
      action: "scheduled",
      title: `${evt.eventType}: ${evt.title}`,
      description: evt.description || undefined,
      creatorName: creator,
      date: evt.createdAt,
    });
  });

  // 4. Map Documents
  documents.forEach((doc: any) => {
    const creator = doc.createdBy ? `${doc.createdBy.firstName} ${doc.createdBy.lastName}`.trim() : "Unknown";
    timelineItems.push({
      id: doc._id.toString(),
      type: "DOCUMENT",
      action: "uploaded",
      title: `Document Uploaded: ${doc.documentName}`,
      description: doc.description || undefined,
      creatorName: creator,
      date: doc.createdAt,
    });
  });

  // 5. Map Messages
  messages.forEach((msg: any) => {
    const creator = msg.senderType === "CLIENT" ? "Client" : msg.senderId ? `${msg.senderId.firstName} ${msg.senderId.lastName}`.trim() : "Firm User";
    timelineItems.push({
      id: msg._id.toString(),
      type: "MESSAGE",
      action: "sent",
      title: `Portal Message Sent`,
      description: msg.message,
      creatorName: creator,
      date: msg.createdAt,
    });
  });

  // 6. Map Time Entries
  timeEntries.forEach((te: any) => {
    const creator = te.userId ? `${te.userId.firstName} ${te.userId.lastName}`.trim() : "Unknown";
    timelineItems.push({
      id: te._id.toString(),
      type: "TIME_ENTRY",
      action: "logged",
      title: `Time Entry Logged: ${te.durationMinutes} mins`,
      description: te.clientDescription || undefined,
      creatorName: creator,
      date: te.date,
    });
  });

  // 7. Map Invoices
  invoices.forEach((inv: any) => {
    const creator = inv.createdBy ? `${inv.createdBy.firstName} ${inv.createdBy.lastName}`.trim() : "Unknown";
    timelineItems.push({
      id: inv._id.toString(),
      type: "INVOICE",
      action: "created",
      title: `Invoice Generated: ${inv.invoiceNumber}`,
      description: `Status: ${inv.status}. Total: $${inv.totalAmount}`,
      creatorName: creator,
      date: inv.createdAt,
    });
  });

  // Sort timeline chronologically (latest first)
  timelineItems.sort((a, b) => b.date.getTime() - a.date.getTime());

  const skip = (page - 1) * limit;
  const paginatedData = timelineItems.slice(skip, skip + limit);

  return {
    data: paginatedData,
    total: timelineItems.length,
    page,
    limit,
  };
}
