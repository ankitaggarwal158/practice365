import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "../api/note.api";
import { CreateNoteRequest, UpdateNoteRequest } from "../types/note.types";

export const noteKeys = {
  all: ["notes"] as const,
  lists: () => ["notes", "list"] as const,
  list: (params: any) => ["notes", "list", params] as const,
  detail: (id: string) => ["notes", "detail", id] as const,
};

export function useNotes(params: {
  entityType?: string;
  entityId?: string;
  authorId?: string;
  isPinned?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: noteKeys.list(params),
    queryFn: () => api.listNotes(params),
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => api.getNote(id),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteRequest) => api.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      toast.success("Note created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create note");
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteRequest }) =>
      api.updateNote(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      queryClient.setQueryData(noteKeys.detail(data.id), data);
      toast.success("Note updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update note");
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      toast.success("Note deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete note");
    },
  });
}

export function usePinNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      api.pinNote(id, isPinned),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      queryClient.setQueryData(noteKeys.detail(data.id), data);
      toast.success(data.isPinned ? "Note pinned to top" : "Note unpinned");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to toggle pin");
    },
  });
}
