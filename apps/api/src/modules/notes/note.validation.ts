import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { ENTITY_TYPES } from "./note.constants.js";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format.",
});

export const createNoteSchema = z.object({
  entityType: z.enum(ENTITY_TYPES, {
    message: "entityType must be a valid system entity type.",
  }),
  entityId: objectIdSchema,
  title: z.string().max(150).optional().default(""),
  content: z.string().min(1, "Content cannot be empty."),
});

export const updateNoteSchema = z.object({
  title: z.string().max(150).optional(),
  content: z.string().min(1, "Content cannot be empty.").optional(),
});

export const pinNoteSchema = z.object({
  isPinned: z.boolean({
    message: "isPinned status is required.",
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
