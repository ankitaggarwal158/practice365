import { httpClient } from "@/services/http-client";
import type {
  ConflictCheck,
  PaginatedConflictChecks,
  ManualSearchRequest,
  ConflictEngineResult,
} from "../types/conflict-check.types";

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([_, val]) => val !== undefined && val !== null && val !== ""
  );
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}

export const conflictCheckApi = {
  listConflictChecks: (params?: { page?: number; limit?: number }) =>
    httpClient.getPaginated<ConflictCheck>(`/conflict-checks${buildQueryString(params)}`),

  getConflictCheck: (id: string) =>
    httpClient.get<ConflictCheck>(`/conflict-checks/${id}`),

  runConflictCheck: (leadId: string) =>
    httpClient.post<ConflictCheck>("/conflict-checks", { leadId }),

  manualSearch: (data: ManualSearchRequest) =>
    httpClient.post<ConflictEngineResult>("/conflict-checks/manual-search", data),

  reviewConflict: (id: string, decision: "CLEARED" | "WAIVED" | "REJECTED", reviewNotes?: string) =>
    httpClient.patch<ConflictCheck>(`/conflict-checks/${id}/review`, { decision, reviewNotes }),
};
