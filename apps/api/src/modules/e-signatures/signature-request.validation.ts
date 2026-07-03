import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { SIGNING_MODE } from "./signature-request.constants.js";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format.",
});

export const createSignatureRequestSchema = z.object({
  documentId: objectIdSchema,
  matterId: z.string().optional().refine((val) => !val || Types.ObjectId.isValid(val), {
    message: "Invalid matterId format.",
  }),
  requestTitle: z.string().min(1, "Request title cannot be empty.").max(150),
  signingMode: z.enum([SIGNING_MODE.PARALLEL, SIGNING_MODE.SEQUENTIAL], {
    message: "signingMode must be PARALLEL or SEQUENTIAL.",
  }),
  expiresAt: z.string().datetime({ message: "expiresAt must be a valid ISO timestamp." }).optional(),
  signers: z.array(
    z.object({
      fullName: z.string().min(1, "Signer name is required."),
      email: z.string().email("Invalid signer email address."),
      signingOrder: z.number().int().min(1).optional(),
    })
  ).min(1, "At least one signer is required."),
});

export const submitSignatureSchema = z.object({
  signature: z.string().min(1, "Signature data is required."),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms to sign.",
  }),
});

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
