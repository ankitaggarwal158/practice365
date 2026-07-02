import { httpClient } from "../../../services/http-client";
import {
  OpposingParty,
  CreateOpposingPartyRequest,
  UpdateOpposingPartyRequest,
  MatterAssociation,
  DuplicateCheckResult,
  PaginatedResult,
} from "../types/opposing-party.types";

export async function listOpposingParties(params: {
  page?: number;
  limit?: number;
  partyType?: string;
  isActive?: boolean;
  search?: string;
}): Promise<PaginatedResult<OpposingParty>> {
  return httpClient.get<PaginatedResult<OpposingParty>>("/opposing-parties", { params });
}

export async function getOpposingParty(id: string): Promise<OpposingParty> {
  return httpClient.get<OpposingParty>(`/opposing-parties/${id}`);
}

export async function createOpposingParty(data: CreateOpposingPartyRequest): Promise<OpposingParty> {
  return httpClient.post<OpposingParty>("/opposing-parties", data);
}

export async function updateOpposingParty(
  id: string,
  data: UpdateOpposingPartyRequest
): Promise<OpposingParty> {
  return httpClient.patch<OpposingParty>(`/opposing-parties/${id}`, data);
}

export async function deleteOpposingParty(id: string): Promise<void> {
  await httpClient.delete(`/opposing-parties/${id}`);
}

export async function archiveOpposingParty(id: string, isActive: boolean): Promise<OpposingParty> {
  return httpClient.patch<OpposingParty>(`/opposing-parties/${id}/archive`, { isActive });
}

export async function checkDuplicates(
  data: {
    partyType: string;
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    email?: string;
    phone?: string;
  },
  excludeId?: string
): Promise<DuplicateCheckResult> {
  const params = excludeId ? { excludeId } : undefined;
  return httpClient.post<DuplicateCheckResult>("/opposing-parties/duplicates", data, { params });
}

export async function getMatterAssociations(matterId: string): Promise<MatterAssociation[]> {
  return httpClient.get<MatterAssociation[]>(`/matters/${matterId}/opposing-parties`);
}

export async function linkOpposingParties(
  matterId: string,
  opposingPartyIds: string[]
): Promise<MatterAssociation[]> {
  return httpClient.patch<MatterAssociation[]>(`/matters/${matterId}/opposing-parties`, {
    opposingPartyIds,
  });
}

export async function unlinkOpposingParty(matterId: string, partyId: string): Promise<void> {
  await httpClient.delete(`/matters/${matterId}/opposing-parties/${partyId}`);
}
