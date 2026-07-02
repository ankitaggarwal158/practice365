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

async function performFetch(url: string, options: RequestOptions, token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (!options.skipAuth) {
    const accessToken = token || localStorage.getItem("accessToken");
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    body: options.body instanceof FormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
  });

  const json = await response.json();
  return { response, json };
}

async function executeRequest(url: string, options: RequestOptions) {
  let { response, json } = await performFetch(url, options);

  // If unauthorized and auth is not skipped, attempt silent refresh
  if (response.status === 401 && !options.skipAuth) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshJson = await refreshResponse.json();
          if (refreshJson.success !== false && refreshJson.data) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshJson.data;
            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            // Retry original request with the new access token
            const retry = await performFetch(url, options, newAccessToken);
            response = retry.response;
            json = retry.json;
          }
        } else {
          // Refresh token expired or invalid — force logout
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Auto token refresh failed:", err);
      }
    }
  }

  if (!response.ok || json.success === false) {
    throw new ApiClientError(
      json.message || "An unexpected error occurred.",
      response.status,
      json.errors
    );
  }

  return json;
}

async function request<T>(endpoint: string, options: RequestOptions): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const json = await executeRequest(url, options);
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
  const json = await executeRequest(url, options);
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
