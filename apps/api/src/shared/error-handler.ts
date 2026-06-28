import { Request, Response, NextFunction } from "express";
import { AppError } from "./app-error.js";

/**
 * Global Express error-handling middleware.
 * Must be registered last in the middleware chain.
 *
 * Per security standards (005 §15): never expose stack traces,
 * database errors, or internal implementation details.
 */
export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && err.errors.length > 0 ? { errors: err.errors } : {}),
    });
    return;
  }

  // Unexpected error — log but never expose internals
  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
}
