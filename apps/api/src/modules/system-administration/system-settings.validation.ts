import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/app-error.js";
import { AnnouncementSeverity } from "./system-settings.types.js";

export const updateSettingsSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().min(1, "Maintenance message cannot be empty.").optional(),
  applicationName: z.string().min(1, "Application name cannot be empty.").optional(),
  defaultTimezone: z.string().min(1, "Default timezone cannot be empty.").optional(),
});

export const updateFeatureFlagSchema = z.object({
  enabled: z.boolean(),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title cannot be empty."),
  message: z.string().min(1, "Message cannot be empty."),
  severity: z.nativeEnum(AnnouncementSeverity, {
    message: "Invalid severity type. Must be INFO, WARNING, or ERROR.",
  }),
  startsAt: z.string().datetime({ offset: true }),
  expiresAt: z.string().datetime({ offset: true }),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

export function validateBody(schema: z.ZodSchema) {
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
