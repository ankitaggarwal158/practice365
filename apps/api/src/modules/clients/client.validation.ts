import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/app-error.js";
import { Types } from "mongoose";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format.",
});

const addressSchema = z.object({
  street: z.string().max(150).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
});

// ─── Zod Schemas ─────────────────────────────────────────────

export const createClientSchema = z
  .object({
    clientType: z.enum(["INDIVIDUAL", "ORGANIZATION"]),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    companyName: z.string().max(100).optional(),
    email: z.string().email("Invalid email format.").or(z.string().length(0)).optional(),
    phone: z.string().max(30).optional(),
    website: z.string().url("Invalid website URL format.").or(z.string().length(0)).optional(),
    address: addressSchema.optional(),
    customFields: z.record(z.string(), z.any()).optional(),
    leadId: objectIdSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.clientType === "INDIVIDUAL") {
        return !!data.firstName?.trim() && !!data.lastName?.trim();
      }
      return !!data.companyName?.trim();
    },
    {
      message: "firstName and lastName are required for INDIVIDUAL clients. companyName is required for ORGANIZATION clients.",
      path: ["firstName"],
    }
  );

export const updateClientSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  companyName: z.string().max(100).optional(),
  email: z.string().email("Invalid email format.").or(z.string().length(0)).optional(),
  phone: z.string().max(30).optional(),
  website: z.string().url("Invalid URL.").or(z.string().length(0)).optional(),
  address: addressSchema.optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  customFields: z.record(z.string(), z.any()).optional(),
});

export const addNoteSchema = z.object({
  content: z.string().min(1, "Note content cannot be empty.").max(5000),
});

export const addAttachmentSchema = z.object({
  fileName: z.string().min(1, "Filename required.").max(255),
  fileSize: z.number().positive("Size must be positive."),
  mimeType: z.string().min(1, "Mimetype required."),
  key: z.string().min(1, "Storage file key required."),
});

export const mergeClientSchema = z.object({
  targetClientId: objectIdSchema,
});

export const duplicateSearchSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
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
