import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { PARTY_TYPES } from "./opposing-party.constants.js";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format.",
});

export const createOpposingPartySchema = z.object({
  partyType: z.enum(PARTY_TYPES, {
    message: "partyType must be INDIVIDUAL or ORGANIZATION.",
  }),
  firstName: z.string().max(50).optional().default(""),
  lastName: z.string().max(50).optional().default(""),
  organizationName: z.string().max(100).optional().default(""),
  email: z.string().email("Invalid email format.").or(z.string().length(0)).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  alternatePhone: z.string().max(30).optional().default(""),
  website: z.string().max(200).optional().default(""),
  addressLine1: z.string().max(150).optional().default(""),
  addressLine2: z.string().max(150).optional().default(""),
  city: z.string().max(100).optional().default(""),
  state: z.string().max(100).optional().default(""),
  postalCode: z.string().max(20).optional().default(""),
  country: z.string().max(100).optional().default(""),
  notes: z.string().max(2000).optional().default(""),
});

export const updateOpposingPartySchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  organizationName: z.string().max(100).optional(),
  email: z.string().email("Invalid email format.").or(z.string().length(0)).optional(),
  phone: z.string().max(30).optional(),
  alternatePhone: z.string().max(30).optional(),
  website: z.string().max(200).optional(),
  addressLine1: z.string().max(150).optional(),
  addressLine2: z.string().max(150).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});

export const linkMatterSchema = z.object({
  opposingPartyIds: z.array(objectIdSchema),
});

export const checkDuplicatesSchema = z.object({
  partyType: z.enum(PARTY_TYPES),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  organizationName: z.string().max(100).optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
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
