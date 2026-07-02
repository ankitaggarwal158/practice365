import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { calendarApi, ListEventsParams } from "../api/calendar.api";
import { CreateEventRequest, UpdateEventRequest, CalendarEvent } from "../types/calendar.types";

export const calendarKeys = {
  all: ["calendar"] as const,
  lists: () => ["calendar", "list"] as const,
  list: (params: ListEventsParams) => ["calendar", "list", params] as const,
  detail: (id: string) => ["calendar", "detail", id] as const,
};

export function useCalendarEvents(params: ListEventsParams) {
  return useQuery({
    queryKey: calendarKeys.list(params),
    queryFn: () => calendarApi.listEvents(params),
  });
}

export function useCalendarEvent(id: string) {
  return useQuery({
    queryKey: calendarKeys.detail(id),
    queryFn: () => calendarApi.getEvent(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventRequest) => calendarApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      toast.success("Event created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create event");
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventRequest }) =>
      calendarApi.updateEvent(id, data),
    onSuccess: (data: CalendarEvent) => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      queryClient.setQueryData(calendarKeys.detail(data.id), data);
      toast.success("Event updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update event");
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => calendarApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      toast.success("Event deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete event");
    },
  });
}

export function useCompleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "COMPLETED" | "UPCOMING" }) =>
      calendarApi.completeEvent(id, status),
    onSuccess: (data: CalendarEvent) => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      queryClient.setQueryData(calendarKeys.detail(data.id), data);
      toast.success(
        data.status === "COMPLETED" ? "Event marked as completed" : "Event marked as upcoming"
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to update event completion status"
      );
    },
  });
}
