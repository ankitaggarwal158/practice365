import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import * as dashboardService from "../dashboard.service.js";
import { dashboardRepository } from "../dashboard.repository.js";
import * as aggregationService from "../dashboard-aggregation.service.js";

describe("Dashboard Module (040) Tests", () => {
  describe("Time Tracking Aggregation Logic", () => {
    let originalFindTimeEntries: any;

    before(() => {
      originalFindTimeEntries = dashboardRepository.findTimeEntries;
    });

    after(() => {
      dashboardRepository.findTimeEntries = originalFindTimeEntries;
    });

    test("calculateTimeSummary should correctly calculate hours logged for today, this week, and this month", async () => {
      const mockFirmId = new Types.ObjectId().toString();
      const mockUserId = new Types.ObjectId().toString();

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(today.getDate() - 14);

      // Mock entries
      const mockEntries = [
        { date: today, durationMinutes: 120, billingType: "BILLABLE" }, // 2 hrs billable today
        { date: today, durationMinutes: 60, billingType: "NON_BILLABLE" }, // 1 hr non-billable today
        { date: yesterday, durationMinutes: 180, billingType: "BILLABLE" }, // 3 hrs billable yesterday
        { date: twoWeeksAgo, durationMinutes: 240, billingType: "BILLABLE" }, // 4 hrs billable two weeks ago
      ];

      dashboardRepository.findTimeEntries = () => Promise.resolve(mockEntries) as any;

      const summary = await aggregationService.calculateTimeSummary(mockFirmId, mockUserId);

      // Verify Month stats: all entries = 2 + 1 + 3 + 4 = 10 hrs. Billable = 2 + 3 + 4 = 9 hrs
      assert.strictEqual(summary.monthHours, 10);
      assert.strictEqual(summary.monthBillableHours, 9);

      // Verify Week stats: today + yesterday = 2 + 1 + 3 = 6 hrs. Billable = 2 + 3 = 5 hrs
      assert.strictEqual(summary.weekHours, 6);
      assert.strictEqual(summary.weekBillableHours, 5);

      // Verify Today stats: today = 2 + 1 = 3 hrs. Billable = 2 hrs
      assert.strictEqual(summary.todayHours, 3);
      assert.strictEqual(summary.todayBillableHours, 2);
    });
  });

  describe("Chronological Activity Feed Merging", () => {
    let originalFindRawActivityData: any;

    before(() => {
      originalFindRawActivityData = dashboardRepository.findRawActivityData;
    });

    after(() => {
      dashboardRepository.findRawActivityData = originalFindRawActivityData;
    });

    test("getAggregatedActivity should correctly format and sort events chronologically", async () => {
      const mockFirmId = new Types.ObjectId().toString();
      const user1 = { firstName: "John", lastName: "Doe", _id: new Types.ObjectId() };
      const date1 = new Date("2026-07-01T10:00:00.000Z");
      const date2 = new Date("2026-07-01T12:00:00.000Z");
      const date3 = new Date("2026-07-01T14:00:00.000Z");

      const mockRawData = {
        matters: [
          {
            _id: new Types.ObjectId(),
            matterNumber: "MAT-001",
            title: "Test Matter",
            createdAt: date1,
            updatedAt: date1,
            createdBy: user1,
          },
        ],
        documents: [
          {
            _id: new Types.ObjectId(),
            documentName: "Agreement.pdf",
            createdAt: date3,
            createdBy: user1,
          },
        ],
        invoices: [
          {
            _id: new Types.ObjectId(),
            invoiceNumber: "INV-001",
            status: "DRAFT",
            createdAt: date2,
            updatedAt: date2,
            createdBy: user1,
          },
        ],
        timeEntries: [],
        calendarEvents: [],
      };

      dashboardRepository.findRawActivityData = () => Promise.resolve(mockRawData) as any;

      const activity = await aggregationService.getAggregatedActivity(mockFirmId, 10);

      assert.strictEqual(activity.length, 3);
      
      // Verify descending date sort (date3 -> date2 -> date1)
      assert.strictEqual(activity[0].type, "DOCUMENT");
      assert.strictEqual(activity[0].title, "Agreement.pdf");
      assert.strictEqual(activity[0].userName, "John Doe");

      assert.strictEqual(activity[1].type, "INVOICE");
      assert.strictEqual(activity[1].title, "Invoice INV-001 (DRAFT)");

      assert.strictEqual(activity[2].type, "MATTER");
      assert.strictEqual(activity[2].title, "MAT-001: Test Matter");
    });
  });

  describe("Permission Filtering & Visibility", () => {
    let originalHasPermission: any;
    let originalCountMattersByStatus: any;
    let originalCountUpcomingEventsAndDeadlines: any;
    let originalGetInvoicesSummary: any;
    let originalCountDocuments: any;
    let originalFindTimeEntries: any;
    let originalFindRawActivityData: any;

    before(() => {
      originalHasPermission = dashboardService.permissionHelper.hasPermission;
      originalCountMattersByStatus = dashboardRepository.countMattersByStatus;
      originalCountUpcomingEventsAndDeadlines = dashboardRepository.countUpcomingEventsAndDeadlines;
      originalGetInvoicesSummary = dashboardRepository.getInvoicesSummary;
      originalCountDocuments = dashboardRepository.countDocuments;
      originalFindTimeEntries = dashboardRepository.findTimeEntries;
      originalFindRawActivityData = dashboardRepository.findRawActivityData;
    });

    after(() => {
      dashboardService.permissionHelper.hasPermission = originalHasPermission;
      dashboardRepository.countMattersByStatus = originalCountMattersByStatus;
      dashboardRepository.countUpcomingEventsAndDeadlines = originalCountUpcomingEventsAndDeadlines;
      dashboardRepository.getInvoicesSummary = originalGetInvoicesSummary;
      dashboardRepository.countDocuments = originalCountDocuments;
      dashboardRepository.findTimeEntries = originalFindTimeEntries;
      dashboardRepository.findRawActivityData = originalFindRawActivityData;
    });

    test("getDashboardSummary should filter out widgets the user does not have permission to view", async () => {
      const mockFirmId = new Types.ObjectId().toString();
      const mockUserId = new Types.ObjectId().toString();

      // Mock user permissions: has MATTERS_VIEW but NOT INVOICES_VIEW or CALENDAR_VIEW
      dashboardService.permissionHelper.hasPermission = async (_userId, permissionCode) => {
        return permissionCode === "MATTERS_VIEW" || permissionCode === "DOCUMENTS_VIEW";
      };

      dashboardRepository.countMattersByStatus = () => Promise.resolve({ open: 5, onHold: 1, closed: 2 }) as any;
      dashboardRepository.countDocuments = () => Promise.resolve(12) as any;
      dashboardRepository.findRawActivityData = () => Promise.resolve({
        matters: [], documents: [], invoices: [], timeEntries: [], calendarEvents: []
      }) as any;

      const summary = await dashboardService.getDashboardSummary(mockFirmId, mockUserId);

      // Matters and Docs are returned
      assert.ok(summary.matters);
      assert.strictEqual(summary.matters?.openCount, 5);
      assert.ok(summary.documents);
      assert.strictEqual(summary.documents?.totalCount, 12);

      // Billing and Calendar are null
      assert.strictEqual(summary.billing, null);
      assert.strictEqual(summary.calendar, null);
      assert.strictEqual(summary.timeTracking, null);
    });

    test("getQuickActions should filter actions by user permissions", async () => {
      const mockUserId = new Types.ObjectId().toString();

      // Mock user permissions: user can create matters and log time, but not invoices or events
      dashboardService.permissionHelper.hasPermission = async (_userId, permissionCode) => {
        return permissionCode === "MATTERS_CREATE" || permissionCode === "TIME_ENTRIES_CREATE";
      };

      const actions = await dashboardService.getQuickActions(mockUserId);

      // Assert only permitted actions are returned
      assert.strictEqual(actions.length, 2);
      assert.strictEqual(actions[0].id, "create-matter");
      assert.strictEqual(actions[1].id, "log-time");
    });
  });
});
