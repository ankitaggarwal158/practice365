import { httpClient } from "../../../services/http-client";
import { TimeEntry, TimeEntryFormData, BillingType } from "../types/time-entry.types";

export interface TimeEntryFilters {
  page?: number;
  limit?: number;
  matterId?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  billingType?: string;
}

export interface TimeEntrySearchResponse {
  data: TimeEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const timeEntryService = {
  // Manual entries
  createEntry: async (data: TimeEntryFormData): Promise<TimeEntry> => {
    const response = await httpClient.post<{ data: TimeEntry }>("/api/time-entries", data);
    return response.data;
  },

  updateEntry: async (id: string, data: Partial<TimeEntryFormData>): Promise<TimeEntry> => {
    const response = await httpClient.patch<{ data: TimeEntry }>(`/api/time-entries/${id}`, data);
    return response.data;
  },

  deleteEntry: async (id: string): Promise<void> => {
    await httpClient.delete(`/api/time-entries/${id}`);
  },

  searchEntries: async (filters: TimeEntryFilters): Promise<TimeEntrySearchResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
    
    const response = await httpClient.get<TimeEntrySearchResponse>(`/api/time-entries?${params.toString()}`);
    return response;
  },

  // Timer actions
  getActiveTimer: async (): Promise<TimeEntry | null> => {
    const response = await httpClient.get<{ data: TimeEntry | null }>("/api/time-entries/timer/active");
    return response.data;
  },

  startTimer: async (data: { matterId?: string; clientId?: string; description?: string; billingType?: BillingType }): Promise<TimeEntry> => {
    const response = await httpClient.post<{ data: TimeEntry }>("/api/time-entries/timer/start", data);
    return response.data;
  },

  pauseTimer: async (): Promise<TimeEntry> => {
    const response = await httpClient.post<{ data: TimeEntry }>("/api/time-entries/timer/pause", {});
    return response.data;
  },

  resumeTimer: async (): Promise<TimeEntry> => {
    const response = await httpClient.post<{ data: TimeEntry }>("/api/time-entries/timer/resume", {});
    return response.data;
  },

  stopTimer: async (): Promise<TimeEntry> => {
    const response = await httpClient.post<{ data: TimeEntry }>("/api/time-entries/timer/stop", {});
    return response.data;
  }
};
