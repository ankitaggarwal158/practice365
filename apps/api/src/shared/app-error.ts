/**
 * Custom application error class.
 * Distinguishes operational errors (expected) from programming errors (unexpected).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    errors?: unknown[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Preserve proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: unknown[]): AppError {
    return new AppError(message, 400, true, errors);
  }

  static unauthorized(message = "Authentication required."): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message = "Access denied."): AppError {
    return new AppError(message, 403);
  }

  static notFound(message = "Resource not found."): AppError {
    return new AppError(message, 404);
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409);
  }

  static validation(message: string, errors?: unknown[]): AppError {
    return new AppError(message, 422, true, errors);
  }

  static internal(message = "Internal server error."): AppError {
    return new AppError(message, 500, false);
  }
}
