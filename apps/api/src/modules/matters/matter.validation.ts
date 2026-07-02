import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/app-error.js";
import { Types } from "mongoose";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format.",
});

// ─── Zod Schemas ─────────────────────────────────────────────

export const createMatterSchema = z.object({
  clientId: objectIdSchema,
  title: z.string().min(1, "Title is required.").max(255),
  practiceAreaId: objectIdSchema,
  matterType: z.enum(["LITIGATION", "TRANSACTIONAL", "CONSULTATION", "ADVISORY", "REGULATORY", "OTHER"]),
  responsibleAttorneyId: objectIdSchema,
  description: z.string().max(2000).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional().default("NORMAL"),
  clientReference: z.string().max(100).optional(),
  courtFileNumber: z.string().max(100).optional(),
  statuteOfLimitations: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format for statuteOfLimitations.",
  }),
  estimatedValue: z.number().nonnegative("Estimated value cannot be negative.").optional(),
  conflictCheckId: objectIdSchema.optional(),
  leadId: objectIdSchema.optional(),
  billingMethod: z.enum(["HOURLY", "FLAT_FEE", "CONTINGENCY"]).optional().default("HOURLY"),
  customHourlyRate: z.number().min(0, "Rate cannot be negative").optional(),
  flatFeeAmount: z.number().min(0, "Amount cannot be negative").optional(),
});

export const updateMatterSchema = z.object({
  title: z.string().min(1, "Title cannot be empty.").max(255).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  practiceAreaId: objectIdSchema.optional(),
  matterType: z.enum(["LITIGATION", "TRANSACTIONAL", "CONSULTATION", "ADVISORY", "REGULATORY", "OTHER"]).optional(),
  clientReference: z.string().max(100).optional(),
  courtFileNumber: z.string().max(100).optional(),
  statuteOfLimitations: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format.",
  }),
  estimatedValue: z.number().nonnegative("Estimated value cannot be negative.").optional(),
  billingMethod: z.enum(["HOURLY", "FLAT_FEE", "CONTINGENCY"]).optional(),
  customHourlyRate: z.number().min(0, "Rate cannot be negative").optional(),
  flatFeeAmount: z.number().min(0, "Amount cannot be negative").optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["OPEN", "ON_HOLD", "CLOSED", "ARCHIVED"]),
});

export const updateTeamSchema = z.object({
  teamMembers: z.array(
    z.object({
      userId: objectIdSchema,
      role: z.string().min(1, "Role is required.").max(100),
    })
  ),
});

export const changeAttorneySchema = z.object({
  responsibleAttorneyId: objectIdSchema,
});

export const addNoteSchema = z.object({
  note: z.string().min(1, "Note content cannot be empty.").max(5000),
});

export const uploadAttachmentSchema = z.object({
  fileName: z.string().min(1, "File name is required.").max(255),
  fileSize: z.number().positive("Size must be positive."),
  mimeType: z.string().min(1, "Mime type is required."),
  key: z.string().min(1, "Storage file key is required."),
});

// ─── Middleware Factory ───────────────────────────────────────

export function validate(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw AppError.validation("Validation failed.", errors);
    }

    req.body = result.data;
    next();
  };
}
