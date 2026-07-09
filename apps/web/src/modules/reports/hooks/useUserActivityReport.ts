import { useQuery } from "@tanstack/react-query";
import reportsApi from "../api/reports.api";

export function useUserActivityReport(filters: any) {
  return useQuery({
    queryKey: ["reports", "user-activity", filters],
    queryFn: () => reportsApi.getUserActivityReport(filters),
    placeholderData: (prev) => prev,
  });
}
