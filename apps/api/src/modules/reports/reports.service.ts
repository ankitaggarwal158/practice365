import * as reportsRepository from "./reports.repository.js";
import * as csvExportService from "./csv-export.service.js";
import * as pdfExportService from "./pdf-export.service.js";
import { recordAuditEvent } from "../audit-log/index.js";
import { ReportType } from "./reports.types.js";

interface ReportAuditOptions {
  ipAddress?: string;
  userAgent?: string;
}

export async function getMatterReport(firmId: string, userId: string, filters: any, auditOptions?: ReportAuditOptions) {
  const result = await reportsRepository.queryMattersReport(firmId, filters);
  
  // Record audit log
  await recordAuditEvent({
    firmId,
    userId,
    module: "Reports",
    action: "GENERATE_MATTERS_REPORT",
    entityType: "Report",
    metadata: { filters },
    ipAddress: auditOptions?.ipAddress,
    userAgent: auditOptions?.userAgent,
  });

  return result;
}

export async function getClientReport(firmId: string, userId: string, filters: any, auditOptions?: ReportAuditOptions) {
  const result = await reportsRepository.queryClientsReport(firmId, filters);
  
  // Record audit log
  await recordAuditEvent({
    firmId,
    userId,
    module: "Reports",
    action: "GENERATE_CLIENTS_REPORT",
    entityType: "Report",
    metadata: { filters },
    ipAddress: auditOptions?.ipAddress,
    userAgent: auditOptions?.userAgent,
  });

  return result;
}

export async function getTimeReport(firmId: string, userId: string, filters: any, auditOptions?: ReportAuditOptions) {
  const result = await reportsRepository.queryTimeReport(firmId, filters);
  
  // Record audit log
  await recordAuditEvent({
    firmId,
    userId,
    module: "Reports",
    action: "GENERATE_TIME_REPORT",
    entityType: "Report",
    metadata: { filters },
    ipAddress: auditOptions?.ipAddress,
    userAgent: auditOptions?.userAgent,
  });

  return result;
}

export async function getInvoiceReport(firmId: string, userId: string, filters: any, auditOptions?: ReportAuditOptions) {
  const result = await reportsRepository.queryInvoicesReport(firmId, filters);
  
  // Record audit log
  await recordAuditEvent({
    firmId,
    userId,
    module: "Reports",
    action: "GENERATE_INVOICES_REPORT",
    entityType: "Report",
    metadata: { filters },
    ipAddress: auditOptions?.ipAddress,
    userAgent: auditOptions?.userAgent,
  });

  return result;
}

export async function getRevenueReport(firmId: string, userId: string, filters: any, auditOptions?: ReportAuditOptions) {
  const result = await reportsRepository.queryRevenueReport(firmId, filters);
  
  // Record audit log
  await recordAuditEvent({
    firmId,
    userId,
    module: "Reports",
    action: "GENERATE_REVENUE_REPORT",
    entityType: "Report",
    metadata: { filters },
    ipAddress: auditOptions?.ipAddress,
    userAgent: auditOptions?.userAgent,
  });

  return result;
}

export async function getUserActivityReport(firmId: string, userId: string, filters: any, auditOptions?: ReportAuditOptions) {
  const result = await reportsRepository.queryUserActivityReport(firmId, filters);
  
  // Record audit log
  await recordAuditEvent({
    firmId,
    userId,
    module: "Reports",
    action: "GENERATE_USER_ACTIVITY_REPORT",
    entityType: "Report",
    metadata: { filters },
    ipAddress: auditOptions?.ipAddress,
    userAgent: auditOptions?.userAgent,
  });

  return result;
}

export async function exportReport(
  firmId: string,
  userId: string,
  type: ReportType,
  format: "csv" | "pdf",
  filters: any,
  auditOptions?: ReportAuditOptions
): Promise<{ data: string | Buffer; mimeType: string; fileName: string }> {
  // Override page & limit filters for export to fetch maximum logs up to 10k
  const exportFilters = { ...filters, page: 1, limit: 10000 };

  let queryResult;
  let actionName = "";
  let fileNamePrefix = "";

  switch (type) {
    case "matters":
      queryResult = await reportsRepository.queryMattersReport(firmId, exportFilters);
      actionName = "EXPORT_MATTERS_REPORT";
      fileNamePrefix = "matter_report";
      break;
    case "clients":
      queryResult = await reportsRepository.queryClientsReport(firmId, exportFilters);
      actionName = "EXPORT_CLIENTS_REPORT";
      fileNamePrefix = "client_report";
      break;
    case "time":
      queryResult = await reportsRepository.queryTimeReport(firmId, exportFilters);
      actionName = "EXPORT_TIME_REPORT";
      fileNamePrefix = "time_report";
      break;
    case "invoices":
      queryResult = await reportsRepository.queryInvoicesReport(firmId, exportFilters);
      actionName = "EXPORT_INVOICES_REPORT";
      fileNamePrefix = "invoice_report";
      break;
    case "revenue":
      queryResult = await reportsRepository.queryRevenueReport(firmId, exportFilters);
      actionName = "EXPORT_REVENUE_REPORT";
      fileNamePrefix = "revenue_report";
      break;
    case "user-activity":
      queryResult = await reportsRepository.queryUserActivityReport(firmId, exportFilters);
      actionName = "EXPORT_USER_ACTIVITY_REPORT";
      fileNamePrefix = "user_activity_report";
      break;
  }

  // Record audit log for export
  await recordAuditEvent({
    firmId,
    userId,
    module: "Reports",
    action: actionName,
    entityType: "Report",
    metadata: { filters, format },
    ipAddress: auditOptions?.ipAddress,
    userAgent: auditOptions?.userAgent,
  });

  const dateStr = new Date().toISOString().split("T")[0];

  if (format === "csv") {
    const csvContent = await csvExportService.exportToCsv(type, queryResult.docs);
    return {
      data: csvContent,
      mimeType: "text/csv",
      fileName: `${fileNamePrefix}_${dateStr}.csv`,
    };
  } else {
    const pdfBuffer = await pdfExportService.exportToPdf(type, queryResult.docs, queryResult.summary, filters);
    return {
      data: pdfBuffer,
      mimeType: "application/pdf",
      fileName: `${fileNamePrefix}_${dateStr}.pdf`,
    };
  }
}
