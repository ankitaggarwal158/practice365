import { httpClient } from "../../../services/http-client";
import {
  CalendarEvent,
  CreateEventRequest,
  UpdateEventRequest,
} from "../types/calendar.types";

export interface ListEventsParams {
  start?: string;
  end?: string;
  matterId?: string;
  assignedUserId?: string;
  eventType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

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

export const calendarApi = {
  listEvents: (params: ListEventsParams) =>
    httpClient.getPaginated<CalendarEvent>(`/calendar/events${buildQueryString(params)}`),

  getEvent: (id: string) =>
    httpClient.get<CalendarEvent>(`/calendar/events/${id}`),

  createEvent: (data: CreateEventRequest) =>
    httpClient.post<CalendarEvent>("/calendar/events", data),

  updateEvent: (id: string, data: UpdateEventRequest) =>
    httpClient.patch<CalendarEvent>(`/calendar/events/${id}`, data),

  deleteEvent: (id: string) =>
    httpClient.delete<void>(`/calendar/events/${id}`),

  completeEvent: (id: string, status: "COMPLETED" | "UPCOMING") =>
    httpClient.patch<CalendarEvent>(`/calendar/events/${id}/complete`, { status }),
};
