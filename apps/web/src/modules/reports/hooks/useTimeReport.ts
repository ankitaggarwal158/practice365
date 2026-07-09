import { useQuery } from "@tanstack/react-query";
import reportsApi from "../api/reports.api";

export function useTimeReport(filters: any) {
  return useQuery({
    queryKey: ["reports", "time", filters],
    queryFn: () => reportsApi.getTimeReport(filters),
    placeholderData: (prev) => prev,
  });
}
