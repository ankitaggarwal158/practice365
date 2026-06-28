import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async Express handler to automatically catch errors
 * and forward them to the Express error-handling middleware.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
