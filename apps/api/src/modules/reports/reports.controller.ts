import { Request, Response } from "express";
import * as reportsService from "./reports.service.js";
import { ReportType } from "./reports.types.js";
import * as userService from "../users/service/user.service.js";
import { AppError } from "../../shared/app-error.js";

// Extracts client IP and User Agent safely
function getAuditOptions(req: Request) {
  return {
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: req.headers["user-agent"],
  };
}

// Retrieves the requesting user's firmId dynamically
async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  if (!user || !user.firmId) {
    throw AppError.forbidden("Access denied. User not associated with any firm.");
  }
  return user.firmId.toString();
}

export async function getMattersReport(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const result = await reportsService.getMatterReport(firmId, userId, req.query, getAuditOptions(req));
  
  res.status(200).json({
    success: true,
    data: result.docs,
    summary: result.summary,
    pagination: {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 25,
      total: result.total,
      pages: Math.ceil(result.total / (req.query.limit ? parseInt(req.query.limit as string, 10) : 25)),
    },
  });
}

export async function getClientsReport(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const result = await reportsService.getClientReport(firmId, userId, req.query, getAuditOptions(req));
  
  res.status(200).json({
    success: true,
    data: result.docs,
    summary: result.summary,
    pagination: {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 25,
      total: result.total,
      pages: Math.ceil(result.total / (req.query.limit ? parseInt(req.query.limit as string, 10) : 25)),
    },
  });
}

export async function getTimeReport(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const result = await reportsService.getTimeReport(firmId, userId, req.query, getAuditOptions(req));
  
  res.status(200).json({
    success: true,
    data: result.docs,
    summary: result.summary,
    pagination: {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 25,
      total: result.total,
      pages: Math.ceil(result.total / (req.query.limit ? parseInt(req.query.limit as string, 10) : 25)),
    },
  });
}

export async function getInvoicesReport(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const result = await reportsService.getInvoiceReport(firmId, userId, req.query, getAuditOptions(req));
  
  res.status(200).json({
    success: true,
    data: result.docs,
    summary: result.summary,
    pagination: {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 25,
      total: result.total,
      pages: Math.ceil(result.total / (req.query.limit ? parseInt(req.query.limit as string, 10) : 25)),
    },
  });
}

export async function getRevenueReport(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const result = await reportsService.getRevenueReport(firmId, userId, req.query, getAuditOptions(req));
  
  res.status(200).json({
    success: true,
    data: result.docs,
    summary: result.summary,
    pagination: {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 25,
      total: result.total,
      pages: Math.ceil(result.total / (req.query.limit ? parseInt(req.query.limit as string, 10) : 25)),
    },
  });
}

export async function getUserActivityReport(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const result = await reportsService.getUserActivityReport(firmId, userId, req.query, getAuditOptions(req));
  
  res.status(200).json({
    success: true,
    data: result.docs,
    summary: result.summary,
    pagination: {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 25,
      total: result.total,
      pages: Math.ceil(result.total / (req.query.limit ? parseInt(req.query.limit as string, 10) : 25)),
    },
  });
}

export async function exportReport(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const type = req.query.type as ReportType;
  const format = req.query.format as "csv" | "pdf";

  // Strip type and format from filters
  const filters = { ...req.query };
  delete filters.type;
  delete filters.format;

  const result = await reportsService.exportReport(
    firmId,
    userId,
    type,
    format,
    filters,
    getAuditOptions(req)
  );

  res.setHeader("Content-Type", result.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
  res.status(200).send(result.data);
}
