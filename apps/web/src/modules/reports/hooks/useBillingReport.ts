import { useQuery } from "@tanstack/react-query";
import reportsApi from "../api/reports.api";

export function useInvoiceReport(filters: any) {
  return useQuery({
    queryKey: ["reports", "invoices", filters],
    queryFn: () => reportsApi.getInvoiceReport(filters),
    placeholderData: (prev) => prev,
  });
}

export function useRevenueReport(filters: any) {
  return useQuery({
    queryKey: ["reports", "revenue", filters],
    queryFn: () => reportsApi.getRevenueReport(filters),
    placeholderData: (prev) => prev,
  });
}
