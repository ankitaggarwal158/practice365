import { httpClient } from "../../../services/http-client";
import {
  MatterContact,
  CreateMatterContactRequest,
  UpdateMatterContactRequest,
  MatterContactLink,
  DuplicateCheckResult,
  PaginatedResult,
  ContactRole,
} from "../types/matter-contact.types";

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([_, val]) => val !== undefined && val !== null && val !== ""
  );
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}

export async function listMatterContacts(params: {
  page?: number;
  limit?: number;
  contactType?: string;
  isActive?: boolean;
  search?: string;
}): Promise<PaginatedResult<MatterContact>> {
  return httpClient.get<PaginatedResult<MatterContact>>(`/matter-contacts${buildQueryString(params)}`);
}

export async function getMatterContact(id: string): Promise<MatterContact> {
  return httpClient.get<MatterContact>(`/matter-contacts/${id}`);
}

export async function createMatterContact(data: CreateMatterContactRequest): Promise<MatterContact> {
  return httpClient.post<MatterContact>("/matter-contacts", data);
}

export async function updateMatterContact(
  id: string,
  data: UpdateMatterContactRequest
): Promise<MatterContact> {
  return httpClient.patch<MatterContact>(`/matter-contacts/${id}`, data);
}

export async function deleteMatterContact(id: string): Promise<void> {
  await httpClient.delete(`/matter-contacts/${id}`);
}

export async function archiveMatterContact(id: string, isActive: boolean): Promise<MatterContact> {
  return httpClient.patch<MatterContact>(`/matter-contacts/${id}/archive`, { isActive });
}

export async function checkDuplicates(
  data: {
    contactType: string;
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    email?: string;
    phone?: string;
  },
  excludeId?: string
): Promise<DuplicateCheckResult> {
  const queryStr = excludeId ? buildQueryString({ excludeId }) : "";
  return httpClient.post<DuplicateCheckResult>(`/matter-contacts/duplicates${queryStr}`, data);
}

export async function getMatterContactLinks(matterId: string): Promise<MatterContactLink[]> {
  return httpClient.get<MatterContactLink[]>(`/matters/${matterId}/contacts`);
}

export async function updateMatterContactLinks(
  matterId: string,
  contacts: Array<{ contactId: string; role: ContactRole }>
): Promise<MatterContactLink[]> {
  return httpClient.patch<MatterContactLink[]>(`/matters/${matterId}/contacts`, { contacts });
}
