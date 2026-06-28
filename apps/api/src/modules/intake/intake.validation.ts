import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/app-error.js";
import { INTAKE_SOURCES, INTAKE_STATUSES, CONTACT_METHODS } from "./intake.constants.js";
import { Types } from "mongoose";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format.",
});

// ─── Zod Schemas ─────────────────────────────────────────────

export const createIntakeSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(50),
  lastName: z.string().min(1, "Last name is required.").max(50),
  companyName: z.string().max(100).optional(),
  email: z.string().email("Invalid email format.").or(z.string().length(0)).optional(),
  phone: z.string().max(30).optional(),
  preferredContactMethod: z.enum(CONTACT_METHODS).optional(),
  practiceArea: z.string().max(100).optional(),
  subject: z.string().min(1, "Subject/summary is required.").max(200),
  description: z.string().max(2000).optional(),
  source: z.enum(INTAKE_SOURCES, {
    message: `Source must be one of: ${INTAKE_SOURCES.join(", ")}`,
  }),
});

export const updateIntakeSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(50).optional(),
  lastName: z.string().min(1, "Last name is required.").max(50).optional(),
  companyName: z.string().max(100).optional(),
  email: z.string().email("Invalid email format.").or(z.string().length(0)).optional(),
  phone: z.string().max(30).optional(),
  preferredContactMethod: z.enum(CONTACT_METHODS).optional(),
  practiceArea: z.string().max(100).optional(),
  subject: z.string().min(1, "Subject/summary is required.").max(200).optional(),
  description: z.string().max(2000).optional(),
  source: z.enum(INTAKE_SOURCES).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(INTAKE_STATUSES, {
    message: `Status must be one of: ${INTAKE_STATUSES.join(", ")}`,
  }),
  rejectedReason: z.string().max(500).optional(),
});

export const assignIntakeSchema = z.object({
  assignedTo: objectIdSchema.nullable(),
});

export const addNoteSchema = z.object({
  note: z.string().min(1, "Note content cannot be empty.").max(2000),
});

export const uploadAttachmentSchema = z.object({
  documentId: objectIdSchema,
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
