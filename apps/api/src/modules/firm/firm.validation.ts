import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/app-error.js";

// ─── Zod Schemas ─────────────────────────────────────────────

export const updateFirmProfileSchema = z.object({
  name: z.string().min(1, "Firm name cannot be empty.").max(100).optional(),
  legalName: z.string().min(1, "Legal name cannot be empty.").max(100).optional(),
  displayName: z.string().min(1, "Display name cannot be empty.").max(100).optional(),
  website: z.string().url("Invalid website URL format.").or(z.string().length(0)).optional(),
  email: z.string().email("Invalid email format.").or(z.string().length(0)).optional(),
  phone: z.string().max(30).optional(),
  addressLine1: z.string().max(150).optional(),
  addressLine2: z.string().max(150).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
});

export const updateSettingsSchema = z.object({
  timezone: z.string().min(1, "Timezone cannot be empty.").optional(),
  currency: z.string().min(1, "Currency cannot be empty.").optional(),
  locale: z.string().min(1, "Locale cannot be empty.").optional(),
  dateFormat: z.string().min(1, "Date format cannot be empty.").optional(),
  timeFormat: z.enum(["12", "24"], {
    message: "Time format must be either '12' or '24'.",
  }).optional(),
  defaultBillingRate: z.number().min(0, "Hourly billing rate cannot be negative.").optional(),
  invoicePrefix: z.string().max(10).optional(),
  matterPrefix: z.string().max(10).optional(),
});

export const updateBrandingSchema = z.object({
  logoUrl: z.string().url("Invalid logo URL format.").or(z.string().length(0)).optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color format.").optional(),
});

// ─── Validation Middleware Factories ───────────────────────────

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
