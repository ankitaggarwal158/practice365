import { httpClient, API_BASE_URL } from "../../../services/http-client";
import { AuditLog, AuditLogFilters } from "../types";

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([_, val]) => val !== undefined && val !== null && val !== ""
  );
  if (entries.length === 0) return "";
  return (
    "?" +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&")
  );
}

export const auditLogApi = {
  listAuditLogs: (params: AuditLogFilters) =>
    httpClient.getPaginated<AuditLog>(`/audit-logs${buildQueryString(params)}`),

  getAuditLog: (id: string) =>
    httpClient.get<AuditLog>(`/audit-logs/${id}`),

  getEntityTimeline: (entityId: string, params?: Omit<AuditLogFilters, "entityId">) =>
    httpClient.getPaginated<AuditLog>(
      `/audit-logs/entity/${entityId}${buildQueryString(params)}`
    ),

  getUserActivity: (userId: string, params?: Omit<AuditLogFilters, "userId">) =>
    httpClient.getPaginated<AuditLog>(
      `/audit-logs/user/${userId}${buildQueryString(params)}`
    ),

  exportAuditLogs: async (params: AuditLogFilters): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      `${API_BASE_URL}/audit-logs/export${buildQueryString(params)}`,
      {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to export audit logs.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `audit_log_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
export default auditLogApi;
