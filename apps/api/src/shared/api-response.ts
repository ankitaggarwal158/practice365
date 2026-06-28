import { Response } from "express";

/**
 * Standardized success response per API conventions (004 §6).
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200
): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Standardized paginated success response per API conventions (004 §7).
 */
export function sendPaginatedSuccess<T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  },
  statusCode = 200
): void {
  res.status(statusCode).json({
    success: true,
    data,
    pagination,
  });
}

/**
 * Standardized error response per API conventions (004 §6).
 */
export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown[]
): void {
  const response: { success: false; message: string; errors?: unknown[] } = {
    success: false,
    message,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
}
