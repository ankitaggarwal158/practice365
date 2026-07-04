import { ListAuditLogsFilter } from "./audit-log.types.js";
import * as auditLogRepository from "./audit-log.repository.js";

/**
 * Exports audit logs for a firm matching the filters to a CSV string.
 */
export async function exportToCsv(
  firmId: string,
  filter: Omit<ListAuditLogsFilter, "page" | "limit">
): Promise<string> {
  // Fetch up to 10,000 logs for the export to prevent memory overflow
  const paginated = await auditLogRepository.findAll(firmId, {
    ...filter,
    page: 1,
    limit: 10000,
  });

  const headers = [
    "Timestamp",
    "User ID",
    "User Name",
    "User Email",
    "Module",
    "Action",
    "Entity Type",
    "Entity ID",
    "IP Address",
    "User Agent",
    "Metadata",
  ];

  const csvRows = [headers.join(",")];

  for (const log of paginated.docs) {
    const user = log.userId as any;
    const userName = user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "";
    const userEmail = user?.email || "";

    const row = [
      log.createdAt ? log.createdAt.toISOString() : new Date().toISOString(),
      user?._id?.toString() || "",
      userName,
      userEmail,
      log.module,
      log.action,
      log.entityType || "",
      log.entityId?.toString() || "",
      log.ipAddress || "",
      log.userAgent || "",
      log.metadata ? JSON.stringify(log.metadata) : "",
    ];

    // Escape double quotes and wrap in quotes to handle commas
    const escapedRow = row.map((val) => {
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });

    csvRows.push(escapedRow.join(","));
  }

  return csvRows.join("\n");
}
