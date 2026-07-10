import * as roles from "../roles/index.js";
import { dashboardRepository } from "./dashboard.repository.js";
import * as aggregationService from "./dashboard-aggregation.service.js";
import {
  DashboardSummary,
  DashboardWidgetsData,
  QuickActionItem,
  ActivityItem,
} from "./dashboard.types.js";

export const permissionHelper = {
  hasPermission: (userId: string, permissionCode: string) => roles.hasPermission(userId, permissionCode),
};

export async function getDashboardSummary(
  firmId: string,
  userId: string
): Promise<DashboardSummary> {
  const [
    canViewMatters,
    canViewCalendar,
    canViewBilling,
    canViewDocs,
    canViewTime,
  ] = await Promise.all([
    permissionHelper.hasPermission(userId, "MATTERS_VIEW"),
    permissionHelper.hasPermission(userId, "CALENDAR_VIEW"),
    permissionHelper.hasPermission(userId, "INVOICES_VIEW"),
    permissionHelper.hasPermission(userId, "DOCUMENTS_VIEW"),
    permissionHelper.hasPermission(userId, "TIME_ENTRIES_VIEW"),
  ]);

  const [matters, calendar, billing, documents, timeTracking, rawActivity, uncollectedRetainers] = await Promise.all([
    // Matters count
    canViewMatters ? dashboardRepository.countMattersByStatus(firmId) : null,
    // Calendar events count
    canViewCalendar ? dashboardRepository.countUpcomingEventsAndDeadlines(firmId) : null,
    // Billing totals
    canViewBilling ? dashboardRepository.getInvoicesSummary(firmId) : null,
    // Documents count
    canViewDocs ? dashboardRepository.countDocuments(firmId) : null,
    // Time tracking calculation
    canViewTime ? aggregationService.calculateTimeSummary(firmId, userId) : null,
    // Recent activities (requires filtering by permission)
    aggregationService.getAggregatedActivity(firmId, 15),
    // Uncollected retainers list
    canViewMatters ? dashboardRepository.findMattersWithUncollectedRetainer(firmId) : null,
  ]);

  // Filter activities based on permissions
  const filteredActivity = rawActivity.filter((act: ActivityItem) => {
    if (act.type === "MATTER" && !canViewMatters) return false;
    if (act.type === "CALENDAR_EVENT" && !canViewCalendar) return false;
    if (act.type === "INVOICE" && !canViewBilling) return false;
    if (act.type === "DOCUMENT" && !canViewDocs) return false;
    if (act.type === "TIME_ENTRY" && !canViewTime) return false;
    return true;
  }).slice(0, 10);

  return {
    matters: matters ? { openCount: matters.open, onHoldCount: matters.onHold, closedCount: matters.closed } : null,
    calendar: calendar ? { upcomingEventsCount: calendar.events, upcomingDeadlinesCount: calendar.deadlines } : null,
    billing,
    documents: documents !== null ? { totalCount: documents } : null,
    timeTracking,
    activity: filteredActivity,
    uncollectedRetainers,
  };
}

export async function getDashboardWidgets(
  firmId: string,
  userId: string
): Promise<DashboardWidgetsData> {
  const [
    canViewMatters,
    canViewCalendar,
    canViewBilling,
    canViewDocs,
    canViewTime,
    canViewLeads,
  ] = await Promise.all([
    permissionHelper.hasPermission(userId, "MATTERS_VIEW"),
    permissionHelper.hasPermission(userId, "CALENDAR_VIEW"),
    permissionHelper.hasPermission(userId, "INVOICES_VIEW"),
    permissionHelper.hasPermission(userId, "DOCUMENTS_VIEW"),
    permissionHelper.hasPermission(userId, "TIME_ENTRIES_VIEW"),
    permissionHelper.hasPermission(userId, "LEADS_VIEW"),
  ]);

  const [
    myMatters,
    upcomingEvents,
    upcomingDeadlines,
    recentDocuments,
    billingSummary,
    timeSummary,
    uncollectedRetainerMatters,
    staleMatters,
    pendingLeads,
  ] = await Promise.all([
    canViewMatters ? dashboardRepository.findMyMatters(firmId, userId) : null,
    canViewCalendar ? dashboardRepository.findUpcomingEvents(firmId) : null,
    canViewCalendar ? dashboardRepository.findUpcomingDeadlines(firmId) : null,
    canViewDocs ? dashboardRepository.findRecentDocuments(firmId) : null,
    canViewBilling ? dashboardRepository.getInvoicesSummary(firmId) : null,
    canViewTime ? aggregationService.calculateTimeSummary(firmId, userId) : null,
    canViewMatters ? dashboardRepository.findMattersWithUncollectedRetainer(firmId) : null,
    canViewMatters ? dashboardRepository.findStaleMatters(firmId) : null,
    canViewLeads ? dashboardRepository.findPendingLeads(firmId) : null,
  ]);

  return {
    myMatters,
    upcomingEvents,
    upcomingDeadlines,
    recentDocuments,
    billingSummary,
    timeSummary,
    uncollectedRetainerMatters,
    staleMatters,
    pendingLeads,
  };
}

export async function getQuickActions(userId: string): Promise<QuickActionItem[]> {
  const actionsList = [
    {
      id: "create-matter",
      label: "Create Matter",
      icon: "Briefcase",
      path: "/matters/new",
      permissionCode: "MATTERS_CREATE",
    },
    {
      id: "add-event",
      label: "Add Event",
      icon: "Calendar",
      path: "/calendar/new",
      permissionCode: "CALENDAR_MANAGE",
    },
    {
      id: "upload-document",
      label: "Upload Document",
      icon: "Upload",
      path: "/documents/upload",
      permissionCode: "DOCUMENTS_MANAGE",
    },
    {
      id: "log-time",
      label: "Log Time",
      icon: "Clock",
      path: "/time-tracking/new",
      permissionCode: "TIME_ENTRIES_CREATE",
    },
    {
      id: "create-invoice",
      label: "Create Invoice",
      icon: "FileText",
      path: "/invoices/new",
      permissionCode: "INVOICES_CREATE",
    },
    {
      id: "new-intake",
      label: "New Intake",
      icon: "UserPlus",
      path: "/intakes/new",
      permissionCode: "INTAKES_CREATE",
    },
    {
      id: "new-lead",
      label: "New Lead",
      icon: "TrendingUp",
      path: "/leads/new",
      permissionCode: "LEADS_CREATE",
    },
    {
      id: "request-signature",
      label: "Request Signature",
      icon: "PenTool",
      path: "/e-signatures/new",
      permissionCode: "SIGNATURE_MANAGE",
    },
  ];

  // Evaluate permissions in parallel
  const checks = await Promise.all(
    actionsList.map((action) => permissionHelper.hasPermission(userId, action.permissionCode))
  );

  return actionsList.filter((_, idx) => checks[idx]);
}
