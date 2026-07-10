import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/app-error.js";
import { LEAD_STATUSES, LEAD_SOURCES } from "./lead.constants.js";
import { CONTACT_METHODS } from "../intake/intake.constants.js";
import { Types } from "mongoose";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format.",
});

// ─── Zod Schemas ─────────────────────────────────────────────

export const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(50),
  lastName: z.string().min(1, "Last name is required.").max(50),
  companyName: z.string().max(100).optional(),
  email: z.string().email("Invalid email format.").or(z.string().length(0)).optional(),
  phone: z.string().max(30).optional(),
  preferredContactMethod: z.enum(CONTACT_METHODS).optional(),
  practiceArea: z.string().max(100).optional(),
  subject: z.string().min(1, "Subject/summary is required.").max(200),
  description: z.string().max(2000).optional(),
  ownerId: objectIdSchema.optional(), // Defaults to creator on backend
  customFields: z.record(z.string(), z.any()).optional(),
});

export const updateLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(50).optional(),
  lastName: z.string().min(1, "Last name is required.").max(50).optional(),
  companyName: z.string().max(100).optional(),
  email: z.string().email("Invalid email format.").or(z.string().length(0)).optional(),
  phone: z.string().max(30).optional(),
  preferredContactMethod: z.enum(CONTACT_METHODS).optional(),
  practiceArea: z.string().max(100).optional(),
  subject: z.string().min(1, "Subject/summary is required.").max(200).optional(),
  description: z.string().max(2000).optional(),
  customFields: z.record(z.string(), z.any()).optional(),
});

export const changeStatusSchema = z.object({
  status: z.enum(LEAD_STATUSES, {
    message: `Status must be one of: ${LEAD_STATUSES.join(", ")}`,
  }),
  lostReason: z.string().max(500).optional(),
  consultationDate: z.string().datetime({ message: "Invalid date format." }).or(z.date()).optional(),
});

export const assignLeadSchema = z.object({
  ownerId: objectIdSchema,
});

export const addNoteSchema = z.object({
  note: z.string().min(1, "Note content cannot be empty.").max(2000),
});

export const uploadAttachmentSchema = z.object({
  documentId: objectIdSchema,
});

export const convertLeadSchema = z.object({
  manualSignatureAttestation: z.boolean().optional(),
  attestationNote: z.string().max(2000).optional(),
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
