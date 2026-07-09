import { API_BASE_URL } from "../../../services/http-client";
import { ReportType } from "../types";

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

async function fetchReportData<T, S>(endpoint: string, params?: Record<string, any>): Promise<{ data: T[]; summary: S; pagination: any }> {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}${endpoint}${buildQueryString(params)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.message || "Failed to fetch report data.");
  }

  const json = await response.json();
  return {
    data: json.data || [],
    summary: json.summary || {},
    pagination: json.pagination || {},
  };
}

export const reportsApi = {
  getMatterReport: (params: any) =>
    fetchReportData<any, any>("/reports/matters", params),

  getClientReport: (params: any) =>
    fetchReportData<any, any>("/reports/clients", params),

  getTimeReport: (params: any) =>
    fetchReportData<any, any>("/reports/time", params),

  getInvoiceReport: (params: any) =>
    fetchReportData<any, any>("/reports/invoices", params),

  getRevenueReport: (params: any) =>
    fetchReportData<any, any>("/reports/revenue", params),

  getUserActivityReport: (params: any) =>
    fetchReportData<any, any>("/reports/user-activity", params),

  exportReport: async (type: ReportType, format: "csv" | "pdf", params: any): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    const exportParams = { ...params, type, format };
    const response = await fetch(
      `${API_BASE_URL}/reports/export${buildQueryString(exportParams)}`,
      {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to export report.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const extension = format === "csv" ? "csv" : "pdf";
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute(
      "download",
      `${type}_report_${dateStr}.${extension}`
    );
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default reportsApi;
