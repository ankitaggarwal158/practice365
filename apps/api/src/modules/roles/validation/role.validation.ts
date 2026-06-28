import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { AppError } from "../../../shared/app-error.js";

// ─── Zod Schemas ─────────────────────────────────────────────

export const createRoleSchema = z.object({
  name: z
    .string({ error: "Role name is required." })
    .min(1, "Role name cannot be empty.")
    .max(50, "Role name must not exceed 50 characters."),
  description: z.string().max(200, "Description must not exceed 200 characters.").optional().default(""),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, "Role name cannot be empty.").max(50, "Role name must not exceed 50 characters.").optional(),
  description: z.string().max(200, "Description must not exceed 200 characters.").optional(),
});

export const assignPermissionsSchema = z.object({
  permissionIds: z.array(
    z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid Permission ID format.",
    })
  ),
});

export const assignRolesSchema = z.object({
  roleIds: z.array(
    z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid Role ID format.",
    })
  ),
});

export const idParamSchema = z.object({
  id: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ID format.",
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

export function validateParams(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw AppError.validation("Invalid route parameters.", errors);
    }

    req.params = result.data as any;
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

      throw AppError.validation("Invalid query parameters.", errors);
    }

    req.query = result.data as any;
    next();
  };
}
