import { httpClient } from "@/services/http-client";
import type {
  Lead,
  PaginatedLeads,
  CreateLeadRequest,
  UpdateLeadRequest,
  LeadNote,
  LeadAttachment,
} from "../types/lead.types";

export interface ListLeadsParams {
  page?: number;
  limit?: number;
  status?: string;
  source?: string;
  ownerId?: string;
  practiceArea?: string;
  q?: string;
}

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([_, val]) => val !== undefined && val !== null && val !== ""
  );
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}

export const leadApi = {
  listLeads: (params: ListLeadsParams) =>
    httpClient.get<PaginatedLeads>(`/leads${buildQueryString(params)}`),

  getLead: (id: string) =>
    httpClient.get<Lead>(`/leads/${id}`),

  createLead: (data: CreateLeadRequest) =>
    httpClient.post<Lead>("/leads", data),

  updateLead: (id: string, data: UpdateLeadRequest) =>
    httpClient.patch<Lead>(`/leads/${id}`, data),

  changeStatus: (id: string, status: string, options?: { lostReason?: string; consultationDate?: string }) =>
    httpClient.patch<Lead>(`/leads/${id}/status`, { status, ...options }),

  assignLead: (id: string, ownerId: string) =>
    httpClient.patch<Lead>(`/leads/${id}/assign`, { ownerId }),

  addNote: (id: string, note: string) =>
    httpClient.post<LeadNote>(`/leads/${id}/notes`, { note }),

  uploadAttachment: (id: string, documentId: string) =>
    httpClient.post<LeadAttachment>(`/leads/${id}/attachments`, { documentId }),

  convertLead: (id: string) =>
    httpClient.post<Lead>(`/leads/${id}/convert`),
};
