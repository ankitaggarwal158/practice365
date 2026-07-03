import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SignatureApiClient } from "../api/signature.api";
import { CreateSignatureRequestPayload, SubmitSignaturePayload } from "../types/signature.types";

export const signatureKeys = {
  all: ["signatures"] as const,
  lists: () => ["signatures", "list"] as const,
  list: (params: any) => ["signatures", "list", params] as const,
  detail: (id: string) => ["signatures", "detail", id] as const,
  session: (token: string) => ["signatures", "session", token] as const,
};

export function useSignatureRequests(params: {
  matterId?: string;
  documentId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: signatureKeys.list(params),
    queryFn: () => SignatureApiClient.listRequests(params),
  });
}

export function useSignatureRequest(id: string) {
  return useQuery({
    queryKey: signatureKeys.detail(id),
    queryFn: () => SignatureApiClient.getRequest(id),
    enabled: !!id,
  });
}

export function useCreateSignatureRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSignatureRequestPayload) =>
      SignatureApiClient.createRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signatureKeys.all });
      toast.success("Signature request created successfully as draft.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create signature request.");
    },
  });
}

export function useSendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SignatureApiClient.sendRequest(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: signatureKeys.all });
      queryClient.setQueryData(signatureKeys.detail(data.request.id), data);
      toast.success("Signature request sent successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to send signature request.");
    },
  });
}

export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SignatureApiClient.cancelRequest(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: signatureKeys.all });
      queryClient.setQueryData(signatureKeys.detail(data.request.id), data);
      toast.success("Signature request cancelled successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to cancel signature request.");
    },
  });
}

export function useSendReminders() {
  return useMutation({
    mutationFn: (id: string) => SignatureApiClient.sendReminders(id),
    onSuccess: (data) => {
      toast.success(data.message || "Reminders dispatched successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to send reminders.");
    },
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SignatureApiClient.deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signatureKeys.all });
      toast.success("Signature request deleted successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete signature request.");
    },
  });
}

// Guest hooks
export function useSigningSession(token: string) {
  return useQuery({
    queryKey: signatureKeys.session(token),
    queryFn: () => SignatureApiClient.loadSigningSession(token),
    enabled: !!token,
    retry: false, // Don't auto-retry guest loading session errors
  });
}

export function useSubmitSignature(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitSignaturePayload) =>
      SignatureApiClient.submitSignature(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signatureKeys.session(token) });
      toast.success("Your signature has been submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit signature.");
    },
  });
}
