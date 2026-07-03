import { Types } from "mongoose";
import { Matter, MatterTeamMember } from "../matters/index.js";
import { CalendarEvent } from "../calendar/index.js";
import { DocumentMeta } from "../documents/index.js";
import { InvoiceModel, InvoiceStatus } from "../billing/index.js";
import { TimeEntryModel } from "../time-tracking/index.js";

// ─── Matter Queries ──────────────────────────────────────────

export async function countMattersByStatus(firmId: string): Promise<{
  open: number;
  onHold: number;
  closed: number;
}> {
  const fId = new Types.ObjectId(firmId);
  const [open, onHold, closed] = await Promise.all([
    Matter.countDocuments({ firmId: fId, status: "OPEN" }),
    Matter.countDocuments({ firmId: fId, status: "ON_HOLD" }),
    Matter.countDocuments({ firmId: fId, status: "CLOSED" }),
  ]);
  return { open, onHold, closed };
}

export async function findMyMatters(firmId: string, userId: string, limit = 10): Promise<any[]> {
  const fId = new Types.ObjectId(firmId);
  const uId = new Types.ObjectId(userId);

  // 1. Find matter IDs where user is a team member
  const teamMemberships = await MatterTeamMember.find({ userId: uId });
  const teamMatterIds = teamMemberships.map((m) => m.matterId);

  // 2. Query matters where user is responsible attorney OR on the team
  return Matter.find({
    firmId: fId,
    status: { $in: ["OPEN", "ON_HOLD"] },
    $or: [
      { responsibleAttorneyId: uId },
      { _id: { $in: teamMatterIds } },
    ],
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate("clientId", "firstName lastName companyName clientNumber")
    .populate("responsibleAttorneyId", "firstName lastName email")
    .populate("practiceAreaId", "name");
}

export async function findRecentMattersList(firmId: string, limit = 10): Promise<any[]> {
  return Matter.find({ firmId: new Types.ObjectId(firmId) })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate("clientId", "firstName lastName companyName")
    .populate("responsibleAttorneyId", "firstName lastName");
}

// ─── Calendar Queries ────────────────────────────────────────

export async function countUpcomingEventsAndDeadlines(firmId: string): Promise<{
  events: number;
  deadlines: number;
}> {
  const fId = new Types.ObjectId(firmId);
  const now = new Date();

  const [events, deadlines] = await Promise.all([
    CalendarEvent.countDocuments({
      firmId: fId,
      deleted: { $ne: true },
      eventType: { $ne: "DEADLINE" },
      startDateTime: { $gte: now },
    }),
    CalendarEvent.countDocuments({
      firmId: fId,
      deleted: { $ne: true },
      eventType: "DEADLINE",
      startDateTime: { $gte: now },
    }),
  ]);
  return { events, deadlines };
}

export async function findUpcomingEvents(firmId: string, limit = 5): Promise<any[]> {
  const fId = new Types.ObjectId(firmId);
  return CalendarEvent.find({
    firmId: fId,
    deleted: { $ne: true },
    eventType: { $ne: "DEADLINE" },
    startDateTime: { $gte: new Date() },
  })
    .sort({ startDateTime: 1 })
    .limit(limit)
    .populate("matterId", "title matterNumber")
    .populate("assignedUsers", "firstName lastName");
}

export async function findUpcomingDeadlines(firmId: string, limit = 5): Promise<any[]> {
  const fId = new Types.ObjectId(firmId);
  return CalendarEvent.find({
    firmId: fId,
    deleted: { $ne: true },
    eventType: "DEADLINE",
    startDateTime: { $gte: new Date() },
  })
    .sort({ startDateTime: 1 })
    .limit(limit)
    .populate("matterId", "title matterNumber")
    .populate("assignedUsers", "firstName lastName");
}

// ─── Billing Queries ──────────────────────────────────────────

export async function getInvoicesSummary(firmId: string): Promise<{
  draftCount: number;
  draftTotal: number;
  outstandingCount: number;
  outstandingTotal: number;
  overdueCount: number;
  overdueTotal: number;
}> {
  const fId = new Types.ObjectId(firmId);
  const now = new Date();

  // Fetch all active invoices for the firm
  const invoices = await InvoiceModel.find({
    firmId: fId,
    deleted: { $ne: true },
    status: { $ne: InvoiceStatus.CANCELLED },
  });

  let draftCount = 0;
  let draftTotal = 0;
  let outstandingCount = 0;
  let outstandingTotal = 0;
  let overdueCount = 0;
  let overdueTotal = 0;

  for (const inv of invoices) {
    if (inv.status === InvoiceStatus.DRAFT) {
      draftCount++;
      draftTotal += inv.totalAmount;
    } else if (inv.status === InvoiceStatus.ISSUED || inv.status === InvoiceStatus.PARTIALLY_PAID) {
      if (inv.balanceDue > 0) {
        outstandingCount++;
        outstandingTotal += inv.balanceDue;

        // Check if overdue
        if (inv.dueDate && new Date(inv.dueDate) < now) {
          overdueCount++;
          overdueTotal += inv.balanceDue;
        }
      }
    }
  }

  return {
    draftCount,
    draftTotal: Math.round(draftTotal * 100) / 100,
    outstandingCount,
    outstandingTotal: Math.round(outstandingTotal * 100) / 100,
    overdueCount,
    overdueTotal: Math.round(overdueTotal * 100) / 100,
  };
}

export async function findOutstandingInvoices(firmId: string, limit = 5): Promise<any[]> {
  const fId = new Types.ObjectId(firmId);
  return InvoiceModel.find({
    firmId: fId,
    deleted: { $ne: true },
    status: { $in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID] },
    balanceDue: { $gt: 0 },
  })
    .sort({ dueDate: 1 })
    .limit(limit)
    .populate("clientId", "firstName lastName companyName");
}

// ─── Documents Queries ────────────────────────────────────────

export async function countDocuments(firmId: string): Promise<number> {
  return DocumentMeta.countDocuments({
    firmId: new Types.ObjectId(firmId),
    deleted: { $ne: true },
  });
}

export async function findRecentDocuments(firmId: string, limit = 5): Promise<any[]> {
  return DocumentMeta.find({
    firmId: new Types.ObjectId(firmId),
    deleted: { $ne: true },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("matterId", "title matterNumber")
    .populate("createdBy", "firstName lastName");
}

// ─── Time Tracking Queries ─────────────────────────────────────

export async function findTimeEntries(
  firmId: string,
  userId: string,
  startDate: Date
): Promise<any[]> {
  return TimeEntryModel.find({
    firmId: new Types.ObjectId(firmId),
    userId: new Types.ObjectId(userId),
    deletedAt: null,
    date: { $gte: startDate },
  });
}

// ─── Activity Log Queries ──────────────────────────────────────

// Pull recent entries from various tables to build an activity log
export async function findRawActivityData(firmId: string, limit = 10): Promise<{
  matters: any[];
  documents: any[];
  invoices: any[];
  timeEntries: any[];
  calendarEvents: any[];
}> {
  const fId = new Types.ObjectId(firmId);
  const [matters, documents, invoices, timeEntries, calendarEvents] = await Promise.all([
    // Matters
    Matter.find({ firmId: fId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate("createdBy", "firstName lastName"),
    // Documents
    DocumentMeta.find({ firmId: fId, deleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("createdBy", "firstName lastName"),
    // Invoices
    InvoiceModel.find({ firmId: fId, deleted: { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate("createdBy", "firstName lastName"),
    // Time Entries
    TimeEntryModel.find({ firmId: fId, deletedAt: null })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate("userId", "firstName lastName"),
    // Calendar Events
    CalendarEvent.find({ firmId: fId, deleted: { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate("createdBy", "firstName lastName"),
  ]);

  return {
    matters,
    documents,
    invoices,
    timeEntries,
    calendarEvents,
  };
}

export const dashboardRepository = {
  countMattersByStatus,
  findMyMatters,
  findRecentMattersList,
  countUpcomingEventsAndDeadlines,
  findUpcomingEvents,
  findUpcomingDeadlines,
  getInvoicesSummary,
  findOutstandingInvoices,
  countDocuments,
  findRecentDocuments,
  findTimeEntries,
  findRawActivityData,
};
