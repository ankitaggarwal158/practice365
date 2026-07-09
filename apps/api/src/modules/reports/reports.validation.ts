import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format.",
});

const dateFilterSchema = z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional());

const baseQuerySchema = z.object({
  fromDate: dateFilterSchema,
  toDate: dateFilterSchema,
  page: z.preprocess((val) => (val ? parseInt(val as string, 10) : 1), z.number().min(1).default(1)),
  limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : 25), z.number().min(1).max(100).default(25)),
  sort: z.string().optional(),
});

export const matterReportQuerySchema = baseQuerySchema.extend({
  status: z.enum(["OPEN", "ON_HOLD", "CLOSED", "ARCHIVED"]).optional(),
  practiceAreaId: objectIdSchema.optional(),
  responsibleAttorneyId: objectIdSchema.optional(),
  clientId: objectIdSchema.optional(),
});

export const clientReportQuerySchema = baseQuerySchema.extend({
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  clientType: z.enum(["INDIVIDUAL", "ORGANIZATION"]).optional(),
});

export const timeReportQuerySchema = baseQuerySchema.extend({
  matterId: objectIdSchema.optional(),
  userId: objectIdSchema.optional(),
  billingType: z.enum(["BILLABLE", "NON_BILLABLE"]).optional(),
});

export const invoiceReportQuerySchema = baseQuerySchema.extend({
  status: z.enum(["DRAFT", "SENT", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"]).optional(),
  clientId: objectIdSchema.optional(),
  matterId: objectIdSchema.optional(),
});

export const revenueReportQuerySchema = baseQuerySchema.extend({
  paymentMethod: z.enum(["STRIPE", "CASH", "CHECK", "BANK_TRANSFER", "OTHER"]).optional(),
});

export const userActivityReportQuerySchema = baseQuerySchema.extend({
  userId: objectIdSchema.optional(),
  module: z.string().optional(),
  action: z.string().optional(),
});

export const exportReportQuerySchema = z.object({
  type: z.enum(["matters", "clients", "time", "invoices", "revenue", "user-activity"]),
  format: z.enum(["csv", "pdf"]),
  // Accept any extra query filters since they will be validated based on the type dynamically
});

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw AppError.validation("Validation failed.", errors);
    }

    req.query = result.data as any;
    next();
  };
}
