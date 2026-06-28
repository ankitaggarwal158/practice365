import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/app-error.js";
import { Types } from "mongoose";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format.",
});

// ─── Zod Schemas ─────────────────────────────────────────────

export const executeCheckSchema = z.object({
  leadId: objectIdSchema,
});

export const manualSearchSchema = z.object({
  personName: z.string().max(100).optional(),
  organizationName: z.string().max(100).optional(),
  email: z.string().email("Invalid email format.").or(z.string().length(0)).optional(),
  phone: z.string().max(30).optional(),
}).refine(
  (data) => data.personName || data.organizationName || data.email || data.phone,
  {
    message: "At least one search field (name, organization, email, or phone) must be provided.",
  }
);

export const reviewDecisionSchema = z.object({
  decision: z.enum(["CLEARED", "WAIVED", "REJECTED"]),
  reviewNotes: z.string().max(1000).optional(),
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
