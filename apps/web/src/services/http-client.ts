const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

/**
 * Shared HTTP client for API communication.
 * Per module architecture (002 §6): frontend should never call fetch directly outside the API layer.
 */

interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

async function request<T>(endpoint: string, options: RequestOptions): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Attach access token if available and not explicitly skipped
  if (!options.skipAuth) {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    throw new ApiClientError(
      json.message || "An unexpected error occurred.",
      response.status,
      json.errors
    );
  }

  return json.data as T;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

async function requestPaginated<T>(
  endpoint: string,
  options: RequestOptions
): Promise<PaginatedData<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (!options.skipAuth) {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    throw new ApiClientError(
      json.message || "An unexpected error occurred.",
      response.status,
      json.errors
    );
  }

  return {
    data: json.data as T[],
    pagination: json.pagination,
  };
}

export const httpClient = {
  get: <T>(endpoint: string, skipAuth = false) =>
    request<T>(endpoint, { method: "GET", skipAuth }),

  getPaginated: <T>(endpoint: string, skipAuth = false) =>
    requestPaginated<T>(endpoint, { method: "GET", skipAuth }),

  post: <T>(endpoint: string, body?: unknown, skipAuth = false) =>
    request<T>(endpoint, { method: "POST", body, skipAuth }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PATCH", body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};

export { ApiClientError };
