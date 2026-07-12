import { httpClient } from "@/services/http-client";
import type {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  ClientNote,
  ClientAttachment,
  DuplicateCheckResponse,
} from "../types/client.types";

export interface ListClientsParams {
  page?: number;
  limit?: number;
  status?: string;
  clientType?: string;
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

export const clientApi = {
  listClients: (params: ListClientsParams) =>
    httpClient.getPaginated<Client>(`/clients${buildQueryString(params)}`),

  getClient: (id: string) =>
    httpClient.get<Client>(`/clients/${id}`),

  createClient: (data: CreateClientRequest) =>
    httpClient.post<Client>("/clients", data),

  updateClient: (id: string, data: UpdateClientRequest) =>
    httpClient.patch<Client>(`/clients/${id}`, data),

  addNote: (id: string, note: string) =>
    httpClient.post<ClientNote>(`/clients/${id}/notes`, { note }),

  uploadAttachment: (id: string, documentId: string) =>
    httpClient.post<ClientAttachment>(`/clients/${id}/attachments`, { documentId }),

  findDuplicates: (params: { firstName?: string; lastName?: string; companyName?: string; email?: string }) =>
    httpClient.get<DuplicateCheckResponse[]>(`/clients/duplicates/check${buildQueryString(params)}`),

  mergeClients: (sourceClientId: string, targetClientId: string) =>
    httpClient.post<Client>(`/clients/${sourceClientId}/merge`, { targetClientId }),
};
