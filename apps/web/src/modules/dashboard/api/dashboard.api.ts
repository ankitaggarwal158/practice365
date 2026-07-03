import { httpClient } from "@/services/http-client";
import {
  DashboardSummary,
  DashboardWidgetsData,
  ActivityItem,
  QuickActionItem,
} from "../types/dashboard.types";

export const dashboardApi = {
  getDashboardSummary: () =>
    httpClient.get<DashboardSummary>("/dashboard"),

  getDashboardWidgets: () =>
    httpClient.get<DashboardWidgetsData>("/dashboard/widgets"),

  getDashboardActivity: () =>
    httpClient.get<ActivityItem[]>("/dashboard/activity"),

  getQuickActions: () =>
    httpClient.get<QuickActionItem[]>("/dashboard/quick-actions"),
};
export default dashboardApi;
