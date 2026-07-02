import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format.",
});

export const createEventSchema = z.object({
  matterId: objectIdSchema.nullable().optional(),
  title: z.string().min(1, "Title is required.").max(150),
  description: z.string().optional().default(""),
  eventType: z.enum([
    "COURT_DATE",
    "HEARING",
    "MEETING",
    "DEADLINE",
    "APPOINTMENT",
    "REMINDER",
    "INTERNAL_EVENT",
    "OTHER",
  ]),
  startDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date format.",
  }).transform((val) => new Date(val)),
  endDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date format.",
  }).transform((val) => new Date(val)),
  allDay: z.boolean().optional().default(false),
  location: z.string().optional().default(""),
  assignedUsers: z.array(objectIdSchema).optional().default([]),
  reminderOffsets: z.array(z.number()).optional().default([]),
  status: z.enum(["UPCOMING", "COMPLETED", "MISSED", "CANCELLED"]).optional().default("UPCOMING"),
}).refine((data) => data.endDateTime >= data.startDateTime, {
  message: "End date must be on or after start date.",
  path: ["endDateTime"],
});

export const updateEventSchema = z.object({
  matterId: objectIdSchema.nullable().optional(),
  title: z.string().min(1, "Title is required.").max(150).optional(),
  description: z.string().optional(),
  eventType: z.enum([
    "COURT_DATE",
    "HEARING",
    "MEETING",
    "DEADLINE",
    "APPOINTMENT",
    "REMINDER",
    "INTERNAL_EVENT",
    "OTHER",
  ]).optional(),
  startDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date format.",
  }).transform((val) => new Date(val)).optional(),
  endDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date format.",
  }).transform((val) => new Date(val)).optional(),
  allDay: z.boolean().optional(),
  location: z.string().optional(),
  assignedUsers: z.array(objectIdSchema).optional(),
  reminderOffsets: z.array(z.number()).optional(),
  status: z.enum(["UPCOMING", "COMPLETED", "MISSED", "CANCELLED"]).optional(),
});

export const completeEventSchema = z.object({
  status: z.enum(["COMPLETED", "UPCOMING"]),
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
