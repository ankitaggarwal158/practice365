import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/app-error.js";
import { Types } from "mongoose";
import { BillingType } from "./fixed-charge.constants.js";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format.",
});

export const createFixedChargeSchema = z.object({
  matterId: objectIdSchema,
  clientId: objectIdSchema,
  clientDescription: z.string().min(1, "Client description is required.").max(500),
  internalNote: z.string().max(2000).optional(),
  amount: z.number().positive("Amount must be positive."),
  billingType: z.enum([BillingType.BILLABLE, BillingType.NON_BILLABLE]).optional(),
  date: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format.",
  }),
});

export const updateFixedChargeSchema = z.object({
  clientDescription: z.string().min(1, "Description cannot be empty.").max(500).optional(),
  internalNote: z.string().max(2000).optional(),
  amount: z.number().positive("Amount must be positive.").optional(),
  billingType: z.enum([BillingType.BILLABLE, BillingType.NON_BILLABLE]).optional(),
  date: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format.",
  }),
});

export const listFixedChargeQuerySchema = z.object({
  matterId: z.string().optional(),
  clientId: z.string().optional(),
  isBilled: z.enum(["true", "false"]).transform(v => v === "true").optional(),
  billingType: z.enum([BillingType.BILLABLE, BillingType.NON_BILLABLE]).optional(),
  page: z.string().optional().transform(v => parseInt(v || "1", 10)),
  limit: z.string().optional().transform(v => parseInt(v || "50", 10)),
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
