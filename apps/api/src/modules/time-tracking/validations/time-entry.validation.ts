import { z } from "zod";
import { BillingType } from "../constants/time-entry.constants.js";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdPattern, "Invalid ObjectId format");

export const CreateTimeEntrySchema = z.object({
  body: z.object({
    matterId: objectIdSchema.optional(),
    clientId: objectIdSchema.optional(),
    description: z.string().max(2000).optional(),
    date: z.string().datetime().or(z.date()).optional(),
    durationMinutes: z.number().min(0, "Duration cannot be negative"),
    billingType: z.nativeEnum(BillingType).optional(),
    hourlyRate: z.number().min(0).optional(),
  }).refine(data => data.matterId || data.clientId, {
    message: "Must specify either matterId or clientId",
    path: ["matterId"],
  }),
});

export const UpdateTimeEntrySchema = z.object({
  body: z.object({
    matterId: objectIdSchema.optional(),
    clientId: objectIdSchema.optional(),
    description: z.string().max(2000).optional(),
    date: z.string().datetime().or(z.date()).optional(),
    durationMinutes: z.number().min(0).optional(),
    billingType: z.nativeEnum(BillingType).optional(),
    hourlyRate: z.number().min(0).optional(),
  }),
});

export const StartTimerSchema = z.object({
  body: z.object({
    matterId: objectIdSchema.optional(),
    clientId: objectIdSchema.optional(),
    description: z.string().max(2000).optional(),
    billingType: z.nativeEnum(BillingType).optional(),
  }).refine(data => data.matterId || data.clientId, {
    message: "Must specify either matterId or clientId to start a timer",
    path: ["matterId"],
  }),
});

export const SearchTimeEntriesSchema = z.object({
  query: z.object({
    matterId: objectIdSchema.optional(),
    clientId: objectIdSchema.optional(),
    userId: objectIdSchema.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    billingType: z.nativeEnum(BillingType).optional(),
    status: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
