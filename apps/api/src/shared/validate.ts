import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "./app-error.js";

export const validateRequest = (schema: z.ZodType<any, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return next(AppError.validation("Validation failed", errors));
      }
      return next(error);
    }
  };
};
