export interface MatterSummary {
  openCount: number;
  onHoldCount: number;
  closedCount: number;
}

export interface CalendarSummary {
  upcomingEventsCount: number;
  upcomingDeadlinesCount: number;
}

export interface BillingSummaryData {
  draftCount: number;
  draftTotal: number;
  outstandingCount: number;
  outstandingTotal: number;
  overdueCount: number;
  overdueTotal: number;
}

export interface DocumentsSummary {
  totalCount: number;
}

export interface TimeTrackingSummaryData {
  todayHours: number;
  weekHours: number;
  monthHours: number;
  todayBillableHours: number;
  weekBillableHours: number;
  monthBillableHours: number;
}

export interface ActivityItem {
  id: string;
  type: "MATTER" | "DOCUMENT" | "INVOICE" | "TIME_ENTRY" | "CALENDAR_EVENT";
  action: "created" | "updated" | "deleted" | "uploaded" | "logged" | "status_changed" | "completed";
  title: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export interface DashboardSummary {
  matters: MatterSummary | null;
  calendar: CalendarSummary | null;
  billing: BillingSummaryData | null;
  documents: DocumentsSummary | null;
  timeTracking: TimeTrackingSummaryData | null;
  activity: ActivityItem[];
  uncollectedRetainers?: any[] | null;
}

export interface QuickActionItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  permissionCode: string;
}

export interface DashboardWidgetsData {
  myMatters: any[] | null;
  upcomingEvents: any[] | null;
  upcomingDeadlines: any[] | null;
  recentDocuments: any[] | null;
  billingSummary: BillingSummaryData | null;
  timeSummary: TimeTrackingSummaryData | null;
  uncollectedRetainerMatters?: any[] | null;
  staleMatters?: any[] | null;
  pendingLeads?: any[] | null;
}
