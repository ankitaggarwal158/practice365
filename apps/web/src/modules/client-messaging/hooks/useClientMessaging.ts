import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientMessagingApi, portalMessagingApi } from "../api/client-messaging.api";
import { MessageThread, MatterMessage } from "../types";

export function useMessageThread(matterId: string, isPortal = false) {
  const api = isPortal ? portalMessagingApi : clientMessagingApi;

  return useQuery<MessageThread, Error>({
    queryKey: ["messageThread", matterId, isPortal],
    queryFn: () => api.getThreadDetails(matterId),
    enabled: !!matterId,
  });
}

export function useMessages(matterId: string, isPortal = false) {
  const api = isPortal ? portalMessagingApi : clientMessagingApi;
  const queryClient = useQueryClient();

  return useQuery<MatterMessage[], Error>({
    queryKey: ["messages", matterId, isPortal],
    queryFn: async () => {
      const messages = await api.listMessages(matterId);
      // Invalidate messageThread stats to reset unread counters locally
      queryClient.invalidateQueries({ queryKey: ["messageThread", matterId, isPortal] });
      return messages;
    },
    enabled: !!matterId,
    refetchInterval: 10000, // Poll messages every 10 seconds for real-time feel
  });
}

export function useSendMessage(matterId: string, isPortal = false) {
  const api = isPortal ? portalMessagingApi : clientMessagingApi;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => api.sendMessage(matterId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", matterId, isPortal] });
      queryClient.invalidateQueries({ queryKey: ["messageThread", matterId, isPortal] });
    },
  });
}

export function useUploadAttachment(matterId: string, isPortal = false) {
  const api = isPortal ? portalMessagingApi : clientMessagingApi;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => api.uploadAttachment(matterId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", matterId, isPortal] });
      queryClient.invalidateQueries({ queryKey: ["messageThread", matterId, isPortal] });
    },
  });
}

export function useMarkMessageRead(matterId: string, isPortal = false) {
  const api = isPortal ? portalMessagingApi : clientMessagingApi;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => api.markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", matterId, isPortal] });
    },
  });
}
