import { useQuery } from "@tanstack/react-query";
import reportsApi from "../api/reports.api";

export function useMatterReport(filters: any) {
  return useQuery({
    queryKey: ["reports", "matters", filters],
    queryFn: () => reportsApi.getMatterReport(filters),
    placeholderData: (prev) => prev, // Keeps screen stable during query load
  });
}
