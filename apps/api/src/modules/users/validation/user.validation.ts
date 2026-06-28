import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { AppError } from "../../../shared/app-error.js";
import { UserStatus, TimeFormat } from "../types/user.types.js";

// ─── Zod Schemas ─────────────────────────────────────────────

export const inviteUserSchema = z.object({
  email: z
    .string({ error: "Email is required." })
    .email("Invalid email format."),
  firstName: z
    .string({ error: "First name is required." })
    .min(1, "First name is required."),
  lastName: z
    .string({ error: "Last name is required." })
    .min(1, "Last name is required."),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name cannot be empty.").optional(),
  lastName: z.string().min(1, "Last name cannot be empty.").optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
});

export const changeStatusSchema = z.object({
  status: z.nativeEnum(UserStatus, { error: "Invalid status value." }),
});

export const updatePreferencesSchema = z.object({
  timezone: z.string().min(1, "Timezone cannot be empty.").optional(),
  language: z.string().min(1, "Language cannot be empty.").optional(),
  dateFormat: z.string().min(1, "Date format cannot be empty.").optional(),
  timeFormat: z.nativeEnum(TimeFormat).optional(),
  notificationPreferences: z
    .object({
      email: z.boolean().optional(),
      marketing: z.boolean().optional(),
    })
    .optional(),
});

export const updateOwnProfileSchema = z.object({
  firstName: z.string().min(1, "First name cannot be empty.").optional(),
  lastName: z.string().min(1, "Last name cannot be empty.").optional(),
  displayName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url("Invalid avatar URL format.").or(z.string().length(0)).optional(),
  jobTitle: z.string().optional(),
});

export const acceptInvitationSchema = z.object({
  token: z
    .string({ error: "Token is required." })
    .min(1, "Token is required."),
  password: z
    .string({ error: "Password is required." })
    .min(8, "Password must be at least 8 characters."),
});

export const listUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10)),
  limit: z
    .string()
    .optional()
    .default("25")
    .transform((val) => parseInt(val, 10)),
  sortBy: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: z.nativeEnum(UserStatus).optional(),
  q: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid User ID format.",
  }),
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

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw AppError.validation("Validation failed.", errors);
    }

    req.query = result.data as any;
    next();
  };
}

export function validateParams(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw AppError.validation("Validation failed.", errors);
    }

    req.params = result.data as any;
    next();
  };
}
