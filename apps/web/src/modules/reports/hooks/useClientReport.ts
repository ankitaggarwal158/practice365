import { useQuery } from "@tanstack/react-query";
import reportsApi from "../api/reports.api";

export function useClientReport(filters: any) {
  return useQuery({
    queryKey: ["reports", "clients", filters],
    queryFn: () => reportsApi.getClientReport(filters),
    placeholderData: (prev) => prev,
  });
}
