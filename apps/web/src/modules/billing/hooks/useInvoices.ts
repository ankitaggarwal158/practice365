import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceApi, InvoiceFilters } from "../api/invoice.api";
import { CreateInvoiceDTO, UpdateInvoiceDTO, RecordPaymentDTO } from "../types/invoice.types";
import { toast } from "sonner";

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (filters: InvoiceFilters) => [...invoiceKeys.lists(), filters] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  paymentsList: (id: string) => [...invoiceKeys.detail(id), "payments"] as const,
};

export function useInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: () => invoiceApi.listInvoices(filters),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoiceApi.getInvoice(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateInvoiceDTO) => invoiceApi.createInvoice(data),
    onSuccess: () => {
      toast.success("Invoice created successfully as draft");
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create invoice");
    }
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceDTO }) => invoiceApi.updateInvoice(id, data),
    onSuccess: (data) => {
      toast.success("Invoice draft updated successfully");
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data._id) });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update invoice");
    }
  });
}

export function useIssueInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => invoiceApi.issueInvoice(id),
    onSuccess: (data) => {
      toast.success("Invoice issued successfully");
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data._id) });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to issue invoice");
    }
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => invoiceApi.cancelInvoice(id),
    onSuccess: (data) => {
      toast.success("Invoice cancelled successfully");
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data._id) });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to cancel invoice");
    }
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => invoiceApi.deleteInvoice(id),
    onSuccess: () => {
      toast.success("Invoice draft deleted successfully");
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete invoice");
    }
  });
}

export function useRecordPayment(invoiceId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RecordPaymentDTO) => invoiceApi.recordPayment(invoiceId, data),
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.paymentsList(invoiceId) });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to record payment");
    }
  });
}

export function useInvoicePayments(id: string) {
  return useQuery({
    queryKey: invoiceKeys.paymentsList(id),
    queryFn: () => invoiceApi.getInvoicePayments(id),
    enabled: !!id,
  });
}
