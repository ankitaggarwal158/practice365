import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/app-error.js";

export const createPracticeAreaSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  code: z.string().min(1, "Code is required").max(50, "Code is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  color: z.string().max(30).optional(),
  icon: z.string().max(50).optional(),
  defaultHourlyRate: z.number().min(0, "Hourly rate cannot be negative").optional(),
});

export const updatePracticeAreaSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
  description: z.string().max(500, "Description is too long").optional(),
  displayOrder: z.number().int().min(0).optional(),
  color: z.string().max(30).optional(),
  icon: z.string().max(50).optional(),
  defaultHourlyRate: z.number().min(0, "Hourly rate cannot be negative").optional(),
});

export const updateStatusSchema = z.object({
  isActive: z.boolean({
    message: "isActive must be a boolean",
  }),
});

export const reorderPracticeAreasSchema = z.object({
  practiceAreas: z.array(
    z.object({
      id: z.string().min(1, "ID is required"),
      displayOrder: z.number().int().min(0),
    })
  ).min(1, "At least one practice area is required for reordering"),
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
