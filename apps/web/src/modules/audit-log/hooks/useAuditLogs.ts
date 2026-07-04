import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { auditLogApi } from "../api/audit-log.api";
import { AuditLogFilters } from "../types";

export const auditKeys = {
  all: ["auditLogs"] as const,
  lists: () => ["auditLogs", "list"] as const,
  list: (params: AuditLogFilters) => ["auditLogs", "list", params] as const,
  detail: (id: string) => ["auditLogs", "detail", id] as const,
  entityTimeline: (entityId: string, params?: any) =>
    ["auditLogs", "entity", entityId, params] as const,
  userActivity: (userId: string, params?: any) =>
    ["auditLogs", "user", userId, params] as const,
};

export function useAuditLogs(params: AuditLogFilters) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => auditLogApi.listAuditLogs(params),
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: auditKeys.detail(id),
    queryFn: () => auditLogApi.getAuditLog(id),
    enabled: !!id,
  });
}

export function useEntityTimeline(entityId: string, params?: Omit<AuditLogFilters, "entityId">) {
  return useQuery({
    queryKey: auditKeys.entityTimeline(entityId, params),
    queryFn: () => auditLogApi.getEntityTimeline(entityId, params),
    enabled: !!entityId,
  });
}

export function useUserActivity(userId: string, params?: Omit<AuditLogFilters, "userId">) {
  return useQuery({
    queryKey: auditKeys.userActivity(userId, params),
    queryFn: () => auditLogApi.getUserActivity(userId, params),
    enabled: !!userId,
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (params: AuditLogFilters) => auditLogApi.exportAuditLogs(params),
    onSuccess: () => {
      toast.success("Audit logs exported successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to export audit logs.");
    },
  });
}
