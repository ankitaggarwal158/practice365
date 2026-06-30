import { httpClient } from "@/services/http-client";
import type {
  Intake,
  PaginatedIntakes,
  CreateIntakeRequest,
  UpdateIntakeRequest,
  IntakeNote,
  IntakeAttachment,
} from "../types/intake.types";

export interface ListIntakesParams {
  page?: number;
  limit?: number;
  status?: string;
  source?: string;
  assignedTo?: string;
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

export const intakeApi = {
  listIntakes: (params: ListIntakesParams) =>
    httpClient.getPaginated<Intake>(`/intakes${buildQueryString(params)}`),

  getIntake: (id: string) =>
    httpClient.get<Intake>(`/intakes/${id}`),

  createIntake: (data: CreateIntakeRequest) =>
    httpClient.post<Intake>("/intakes", data),

  updateIntake: (id: string, data: UpdateIntakeRequest) =>
    httpClient.patch<Intake>(`/intakes/${id}`, data),

  updateStatus: (id: string, status: string, rejectedReason?: string) =>
    httpClient.patch<Intake>(`/intakes/${id}/status`, { status, rejectedReason }),

  assignIntake: (id: string, assignedTo: string | null) =>
    httpClient.patch<Intake>(`/intakes/${id}/assign`, { assignedTo }),

  addNote: (id: string, note: string) =>
    httpClient.post<IntakeNote>(`/intakes/${id}/notes`, { note }),

  uploadAttachment: (id: string, documentId: string) =>
    httpClient.post<IntakeAttachment>(`/intakes/${id}/attachments`, { documentId }),

  convertToLead: (id: string) =>
    httpClient.post<Intake>(`/intakes/${id}/convert`),
};
