import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdPattern, "Invalid ObjectId format");

export const SearchNotificationsSchema = z.object({
  query: z.object({
    isRead: z.string().or(z.boolean()).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const MarkReadSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const DeleteNotificationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const UpdatePreferencesSchema = z.object({
  body: z.object({
    emailNotifications: z.boolean().optional(),
    inAppNotifications: z.boolean().optional(),
    calendarReminders: z.boolean().optional(),
    billingNotifications: z.boolean().optional(),
    taskNotifications: z.boolean().optional(),
  }),
});

import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/app-error.js";

export function validate(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      throw AppError.validation("Validation failed.", errors);
    }

    // Set parsed values
    const parsed = result.data as any;
    if (parsed?.body) req.body = parsed.body;
    if (parsed?.query) req.query = parsed.query;
    if (parsed?.params) req.params = parsed.params;

    next();
  };
}
