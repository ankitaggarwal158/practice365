import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/app-error.js";

export const updateFirmSettingsSchema = z.object({
  timezone: z.string().min(1, "Timezone cannot be empty.").optional(),
  currency: z.string().min(1, "Currency cannot be empty.").optional(),
  dateFormat: z.string().min(1, "Date format cannot be empty.").optional(),
  timeFormat: z.enum(["12_HOUR", "24_HOUR"], {
    message: "Time format must be either '12_HOUR' or '24_HOUR'.",
  }).optional(),
  matterNumberPrefix: z.string().max(10).optional(),
  matterNextNumber: z.number().min(1).optional(),
  clientNumberPrefix: z.string().max(10).optional(),
  clientNextNumber: z.number().min(1).optional(),
  invoiceNumberPrefix: z.string().max(10).optional(),
  invoiceNextNumber: z.number().min(1).optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid primary hex color format.").optional(),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid secondary hex color format.").optional(),
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
