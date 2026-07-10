import { Types } from "mongoose";
import { Matter, MatterTeamMember, MatterNote } from "../matters/index.js";
import { Lead, LeadNote } from "../leads/index.js";
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

  const results = await InvoiceModel.aggregate([
    {
      $match: {
        firmId: fId,
        deleted: { $ne: true },
        status: { $ne: InvoiceStatus.CANCELLED },
      }
    },
    {
      $group: {
        _id: null,
        draftCount: {
          $sum: { $cond: [{ $eq: ["$status", InvoiceStatus.DRAFT] }, 1, 0] }
        },
        draftTotal: {
          $sum: { $cond: [{ $eq: ["$status", InvoiceStatus.DRAFT] }, "$totalAmount", 0] }
        },
        outstandingCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: ["$status", [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID]] },
                  { $gt: ["$balanceDue", 0] }
                ]
              },
              1,
              0
            ]
          }
        },
        outstandingTotal: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: ["$status", [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID]] },
                  { $gt: ["$balanceDue", 0] }
                ]
              },
              "$balanceDue",
              0
            ]
          }
        },
        overdueCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: ["$status", [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID]] },
                  { $gt: ["$balanceDue", 0] },
                  { $lt: ["$dueDate", now] }
                ]
              },
              1,
              0
            ]
          }
        },
        overdueTotal: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: ["$status", [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID]] },
                  { $gt: ["$balanceDue", 0] },
                  { $lt: ["$dueDate", now] }
                ]
              },
              "$balanceDue",
              0
            ]
          }
        }
      }
    }
  ]).exec();

  if (results.length === 0) {
    return {
      draftCount: 0,
      draftTotal: 0,
      outstandingCount: 0,
      outstandingTotal: 0,
      overdueCount: 0,
      overdueTotal: 0,
    };
  }

  const res = results[0];
  return {
    draftCount: res.draftCount,
    draftTotal: Math.round((res.draftTotal || 0) * 100) / 100,
    outstandingCount: res.outstandingCount,
    outstandingTotal: Math.round((res.outstandingTotal || 0) * 100) / 100,
    overdueCount: res.overdueCount,
    overdueTotal: Math.round((res.overdueTotal || 0) * 100) / 100,
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

export async function findMattersWithUncollectedRetainer(firmId: string, limit = 5): Promise<any[]> {
  const fId = new Types.ObjectId(firmId);
  const matters = await Matter.find({
    firmId: fId,
    retainerAmountAgreed: { $gt: 0 },
    retainerCollected: false,
  }).populate("clientId", "firstName lastName companyName");

  const matterIds = matters.map((m) => m._id);
  const timeEntries = await TimeEntryModel.find({
    firmId: fId,
    matterId: { $in: matterIds },
    deletedAt: null,
  });

  const mattersWithWorkIds = new Set(
    timeEntries.map((te) => te.matterId?.toString())
  );

  return matters
    .filter((m) => mattersWithWorkIds.has(m._id.toString()))
    .slice(0, limit);
}

export async function findStaleMatters(firmId: string, limit = 5): Promise<any[]> {
  const fId = new Types.ObjectId(firmId);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const matters = await Matter.find({
    firmId: fId,
    status: { $in: ["OPEN", "ON_HOLD"] }
  }).populate("clientId", "firstName lastName companyName");

  const staleMatters: any[] = [];

  for (const matter of matters) {
    const recentTime = await TimeEntryModel.findOne({
      firmId: fId,
      matterId: matter._id,
      date: { $gte: thirtyDaysAgo },
      deleted: false
    });
    if (recentTime) continue;

    const recentEvent = await CalendarEvent.findOne({
      firmId: fId,
      matterId: matter._id,
      createdAt: { $gte: thirtyDaysAgo },
      deleted: { $ne: true }
    });
    if (recentEvent) continue;

    const recentDoc = await DocumentMeta.findOne({
      firmId: fId,
      matterId: matter._id,
      createdAt: { $gte: thirtyDaysAgo },
      deleted: false
    });
    if (recentDoc) continue;

    const recentNote = await MatterNote.findOne({
      matterId: matter._id,
      createdAt: { $gte: thirtyDaysAgo }
    });
    if (recentNote) continue;

    staleMatters.push(matter);
    if (staleMatters.length >= limit) break;
  }

  return staleMatters;
}

export async function findPendingLeads(firmId: string, limit = 5): Promise<any[]> {
  const fId = new Types.ObjectId(firmId);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const leads = await Lead.find({
    firmId: fId,
    status: { $in: ["NEW", "CONTACTED"] }
  }).populate("ownerId", "firstName lastName");

  const pendingLeads: any[] = [];

  for (const lead of leads) {
    const recentNote = await LeadNote.findOne({
      leadId: lead._id,
      createdAt: { $gte: sevenDaysAgo }
    });
    if (recentNote) continue;

    if (lead.updatedAt >= sevenDaysAgo) continue;

    pendingLeads.push(lead);
    if (pendingLeads.length >= limit) break;
  }

  return pendingLeads;
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
  findMattersWithUncollectedRetainer,
  findStaleMatters,
  findPendingLeads,
};
