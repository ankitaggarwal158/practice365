import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../shared/app-error.js";

// ─── Zod Schemas ─────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string({ error: "Email is required." })
    .email("Invalid email format."),
  password: z
    .string({ error: "Password is required." })
    .min(1, "Password is required."),
});

export const refreshSchema = z.object({
  refreshToken: z
    .string({ error: "Refresh token is required." })
    .min(1, "Refresh token is required."),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ error: "Email is required." })
    .email("Invalid email format."),
});

export const resetPasswordSchema = z.object({
  token: z
    .string({ error: "Token is required." })
    .min(1, "Token is required."),
  password: z
    .string({ error: "Password is required." })
    .min(8, "Password must be at least 8 characters."),
});

export const verifyEmailSchema = z.object({
  token: z
    .string({ error: "Token is required." })
    .min(1, "Token is required."),
});

// ─── Validation Middleware Factory ───────────────────────────

/**
 * Creates Express middleware that validates `req.body` against a Zod schema.
 * Returns 422 Validation Error on failure per API conventions (004 §11).
 */
export function validate(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue: z.ZodIssue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw AppError.validation("Validation failed.", errors);
    }

    req.body = result.data;
    next();
  };
}
