import { dashboardRepository } from "./dashboard.repository.js";
import { ActivityItem, TimeTrackingSummaryData } from "./dashboard.types.js";

// Helper to check if dates are on the same day
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Helper to get start of dates
function getStartOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfThisWeek(): Date {
  const today = getStartOfToday();
  const day = today.getDay();
  // Set to Sunday of current week
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - day);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

function getStartOfThisMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

// Compile logged time summaries
export async function calculateTimeSummary(
  firmId: string,
  userId: string
): Promise<TimeTrackingSummaryData> {
  const startOfMonth = getStartOfThisMonth();
  const startOfWeek = getStartOfThisWeek();
  const startOfToday = getStartOfToday();

  // Fetch entries since start of month
  const entries = await dashboardRepository.findTimeEntries(firmId, userId, startOfMonth);

  let todayHours = 0;
  let weekHours = 0;
  let monthHours = 0;

  let todayBillableHours = 0;
  let weekBillableHours = 0;
  let monthBillableHours = 0;

  for (const entry of entries) {
    const entryDate = new Date(entry.date);
    const hours = entry.durationMinutes / 60;
    const isBillable = entry.billingType === "BILLABLE";

    // Month stats (all entries since they are from startOfMonth)
    monthHours += hours;
    if (isBillable) monthBillableHours += hours;

    // Week stats
    if (entryDate >= startOfWeek) {
      weekHours += hours;
      if (isBillable) weekBillableHours += hours;
    }

    // Today stats
    if (isSameDay(entryDate, startOfToday) || entryDate >= startOfToday) {
      todayHours += hours;
      if (isBillable) todayBillableHours += hours;
    }
  }

  return {
    todayHours: Math.round(todayHours * 100) / 100,
    weekHours: Math.round(weekHours * 100) / 100,
    monthHours: Math.round(monthHours * 100) / 100,
    todayBillableHours: Math.round(todayBillableHours * 100) / 100,
    weekBillableHours: Math.round(weekBillableHours * 100) / 100,
    monthBillableHours: Math.round(monthBillableHours * 100) / 100,
  };
}

// Compile unified chronological activity list
export async function getAggregatedActivity(firmId: string, limit = 10): Promise<ActivityItem[]> {
  const raw = await dashboardRepository.findRawActivityData(firmId, limit);
  const items: ActivityItem[] = [];

  // 1. Process Matters
  for (const matter of raw.matters) {
    const createdAt = new Date(matter.createdAt).getTime();
    const updatedAt = new Date(matter.updatedAt).getTime();
    const action = Math.abs(updatedAt - createdAt) < 2000 ? "created" : "updated";
    
    items.push({
      id: `matter-${matter._id}`,
      type: "MATTER",
      action,
      title: `${matter.matterNumber}: ${matter.title}`,
      timestamp: matter.updatedAt.toISOString(),
      userId: matter.createdBy?._id?.toString(),
      userName: matter.createdBy ? `${matter.createdBy.firstName} ${matter.createdBy.lastName}` : "System",
    });
  }

  // 2. Process Documents
  for (const doc of raw.documents) {
    items.push({
      id: `doc-${doc._id}`,
      type: "DOCUMENT",
      action: "uploaded",
      title: doc.documentName,
      timestamp: doc.createdAt.toISOString(),
      userId: doc.createdBy?._id?.toString(),
      userName: doc.createdBy ? `${doc.createdBy.firstName} ${doc.createdBy.lastName}` : "System",
    });
  }

  // 3. Process Invoices
  for (const inv of raw.invoices) {
    const createdAt = new Date(inv.createdAt).getTime();
    const updatedAt = new Date(inv.updatedAt).getTime();
    const action = Math.abs(updatedAt - createdAt) < 2000 ? "created" : "status_changed";

    items.push({
      id: `invoice-${inv._id}`,
      type: "INVOICE",
      action,
      title: `Invoice ${inv.invoiceNumber} (${inv.status})`,
      timestamp: inv.updatedAt.toISOString(),
      userId: inv.createdBy?._id?.toString(),
      userName: inv.createdBy ? `${inv.createdBy.firstName} ${inv.createdBy.lastName}` : "System",
    });
  }

  // 4. Process Time Entries
  for (const te of raw.timeEntries) {
    const createdAt = new Date(te.createdAt).getTime();
    const updatedAt = new Date(te.updatedAt).getTime();
    const action = Math.abs(updatedAt - createdAt) < 2000 ? "logged" : "updated";

    items.push({
      id: `time-${te._id}`,
      type: "TIME_ENTRY",
      action,
      title: `${te.durationMinutes} minutes logged - ${te.description || "No description"}`,
      timestamp: te.updatedAt.toISOString(),
      userId: te.userId?._id?.toString(),
      userName: te.userId ? `${te.userId.firstName} ${te.userId.lastName}` : "System",
    });
  }

  // 5. Process Calendar Events
  for (const event of raw.calendarEvents) {
    const createdAt = new Date(event.createdAt).getTime();
    const updatedAt = new Date(event.updatedAt).getTime();
    const action = Math.abs(updatedAt - createdAt) < 2000 ? "created" : "updated";

    items.push({
      id: `event-${event._id}`,
      type: "CALENDAR_EVENT",
      action: event.eventType === "DEADLINE" && action === "created" ? "created" : action,
      title: `${event.eventType === "DEADLINE" ? "Deadline" : "Event"}: ${event.title}`,
      timestamp: event.updatedAt.toISOString(),
      userId: event.createdBy?._id?.toString(),
      userName: event.createdBy ? `${event.createdBy.firstName} ${event.createdBy.lastName}` : "System",
    });
  }

  // Sort by timestamp descending
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
}
