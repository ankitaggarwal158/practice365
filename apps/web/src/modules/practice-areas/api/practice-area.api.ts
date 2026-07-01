import { httpClient } from "../../../services/http-client";
import {
  PracticeArea,
  CreatePracticeAreaRequest,
  UpdatePracticeAreaRequest,
  ReorderPracticeAreasRequest,
} from "../types/practice-area.types";

export async function getPracticeAreas(): Promise<PracticeArea[]> {
  return httpClient.get<PracticeArea[]>("/practice-areas");
}

export async function getActivePracticeAreas(): Promise<PracticeArea[]> {
  return httpClient.get<PracticeArea[]>("/practice-areas/active");
}

export async function getPracticeArea(id: string): Promise<PracticeArea> {
  return httpClient.get<PracticeArea>(`/practice-areas/${id}`);
}

export async function createPracticeArea(data: CreatePracticeAreaRequest): Promise<PracticeArea> {
  return httpClient.post<PracticeArea>("/practice-areas", data);
}

export async function updatePracticeArea(id: string, data: UpdatePracticeAreaRequest): Promise<PracticeArea> {
  return httpClient.patch<PracticeArea>(`/practice-areas/${id}`, data);
}

export async function updatePracticeAreaStatus(id: string, isActive: boolean): Promise<PracticeArea> {
  return httpClient.patch<PracticeArea>(`/practice-areas/${id}/status`, { isActive });
}

export async function reorderPracticeAreas(data: ReorderPracticeAreasRequest): Promise<void> {
  await httpClient.patch("/practice-areas/reorder", data);
}

export async function deletePracticeArea(id: string): Promise<void> {
  await httpClient.delete(`/practice-areas/${id}`);
}
