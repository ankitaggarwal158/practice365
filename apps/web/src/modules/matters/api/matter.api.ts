import { httpClient } from "@/services/http-client";
import type {
  Matter,
  PaginatedMatters,
  CreateMatterRequest,
  UpdateMatterRequest,
  MatterTeamMember,
  PracticeArea,
} from "../types/matter.types";

export interface ListMattersParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  practiceAreaId?: string;
  clientId?: string;
  responsibleAttorneyId?: string;
  query?: string;
}

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([_, val]) => val !== undefined && val !== null && val !== ""
  );
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}

export const matterApi = {
  listMatters: (params: ListMattersParams) =>
    httpClient.get<PaginatedMatters>(`/matters${buildQueryString(params)}`),

  getMatter: (id: string) =>
    httpClient.get<Matter>(`/matters/${id}`),

  createMatter: (data: CreateMatterRequest) =>
    httpClient.post<Matter>("/matters", data),

  updateMatter: (id: string, data: UpdateMatterRequest) =>
    httpClient.patch<Matter>(`/matters/${id}`, data),

  updateMatterStatus: (id: string, status: string) =>
    httpClient.patch<Matter>(`/matters/${id}/status`, { status }),

  updateMatterTeam: (id: string, teamMembers: Array<{ userId: string; role: string }>) =>
    httpClient.patch<MatterTeamMember[]>(`/matters/${id}/team`, { teamMembers }),

  changeResponsibleAttorney: (id: string, responsibleAttorneyId: string) =>
    httpClient.patch<Matter>(`/matters/${id}/attorney`, { responsibleAttorneyId }),

  archiveMatter: (id: string) =>
    httpClient.patch<Matter>(`/matters/${id}/archive`),

  reopenMatter: (id: string) =>
    httpClient.patch<Matter>(`/matters/${id}/reopen`),

  addNote: (id: string, note: string) =>
    httpClient.post<Matter>(`/matters/${id}/notes`, { note }),

  updateNote: (id: string, noteId: string, note: string) =>
    httpClient.put<Matter>(`/matters/${id}/notes/${noteId}`, { note }),

  deleteNote: (id: string, noteId: string) =>
    httpClient.delete<Matter>(`/matters/${id}/notes/${noteId}`),

  uploadAttachment: (
    id: string,
    fileData: { fileName: string; fileSize: number; mimeType: string; key: string }
  ) =>
    httpClient.post<Matter>(`/matters/${id}/attachments`, fileData),

  deleteAttachment: (id: string, attachmentId: string) =>
    httpClient.delete<Matter>(`/matters/${id}/attachments/${attachmentId}`),

  listPracticeAreas: () =>
    httpClient.get<PracticeArea[]>("/matters/practice-areas"),
};
