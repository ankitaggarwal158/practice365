import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format.",
});

const baseQuerySchema = z.object({
  module: z.string().optional(),
  entityType: z.string().optional(),
  action: z.string().optional(),
  startDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  search: z.string().optional(),
  page: z.preprocess((val) => (val ? parseInt(val as string, 10) : 1), z.number().min(1).default(1)),
  limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : 25), z.number().min(1).max(100).default(25)),
});

export const listAuditLogsQuerySchema = baseQuerySchema.extend({
  userId: objectIdSchema.optional(),
  entityId: objectIdSchema.optional(),
});

export const entityTimelineQuerySchema = baseQuerySchema;
export const userActivityQuerySchema = baseQuerySchema;

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
