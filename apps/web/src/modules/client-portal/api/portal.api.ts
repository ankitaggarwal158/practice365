import { API_BASE_URL, ApiClientError } from "../../../services/http-client";
import {
  PortalAuthResponse,
  PortalProfile,
  PortalMatter,
  PortalDocument,
  PortalInvoice,
} from "../types/portal.types";

export class PortalApiClient {
  private static async performFetch(endpoint: string, method: string, body?: any, skipAuth = false) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (!skipAuth) {
      const token = localStorage.getItem("portalAccessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Auto Refresh Token logic for Client Portal
    if (response.status === 401 && !skipAuth) {
      const refreshToken = localStorage.getItem("portalRefreshToken");
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/portal/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshJson = await refreshRes.json();
            if (refreshJson.success && refreshJson.accessToken) {
              localStorage.setItem("portalAccessToken", refreshJson.accessToken);
              localStorage.setItem("portalRefreshToken", refreshJson.refreshToken);

              // Retry original request with the new access token
              headers["Authorization"] = `Bearer ${refreshJson.accessToken}`;
              const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
              });
              const retryJson = await retryRes.json();
              if (retryRes.ok && retryJson.success !== false) {
                return retryJson.data;
              }
            }
          }
        } catch (err) {
          console.error("Portal silent refresh failed:", err);
        }
      }
      
      // Clear and logout portal user
      localStorage.removeItem("portalAccessToken");
      localStorage.removeItem("portalRefreshToken");
      localStorage.removeItem("portalUser");
      window.location.href = "/portal/login";
      throw new Error("Portal session expired.");
    }

    const json = await response.json();

    if (!response.ok || json.success === false) {
      throw new ApiClientError(
        json.message || "An unexpected error occurred.",
        response.status,
        json.errors
      );
    }

    return json.data;
  }

  static get<T>(endpoint: string): Promise<T> {
    return this.performFetch(endpoint, "GET");
  }

  static post<T>(endpoint: string, body?: any, skipAuth = false): Promise<T> {
    return this.performFetch(endpoint, "POST", body, skipAuth);
  }

  static patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.performFetch(endpoint, "PATCH", body);
  }

  // Auth methods
  static async login(body: any): Promise<PortalAuthResponse> {
    return this.post<PortalAuthResponse>("/portal/login", body, true);
  }

  static async logout(refreshToken: string): Promise<void> {
    await this.post("/portal/logout", { refreshToken }, true);
    localStorage.removeItem("portalAccessToken");
    localStorage.removeItem("portalRefreshToken");
    localStorage.removeItem("portalUser");
  }

  static async forgotPassword(email: string): Promise<void> {
    await this.post("/portal/forgot-password", { email }, true);
  }

  static async resetPassword(body: any): Promise<void> {
    await this.post("/portal/reset-password", body, true);
  }

  // Portal data fetching methods
  static getProfile(): Promise<PortalProfile> {
    return this.get<PortalProfile>("/portal/profile");
  }

  static updateProfile(body: any): Promise<PortalProfile> {
    return this.patch<PortalProfile>("/portal/profile", body);
  }

  static listMatters(search?: string): Promise<PortalMatter[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return this.get<PortalMatter[]>(`/portal/matters${query}`);
  }

  static getMatterDetails(id: string): Promise<PortalMatter> {
    return this.get<PortalMatter>(`/portal/matters/${id}`);
  }

  static listDocuments(search?: string): Promise<PortalDocument[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return this.get<PortalDocument[]>(`/portal/documents${query}`);
  }

  static listInvoices(search?: string): Promise<PortalInvoice[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return this.get<PortalInvoice[]>(`/portal/invoices${query}`);
  }

  // File Download helpers
  static async downloadDocument(id: string, defaultFileName: string): Promise<void> {
    await this.downloadFile(`/portal/documents/${id}/download`, defaultFileName);
  }

  static async downloadInvoicePDF(id: string, defaultFileName: string): Promise<void> {
    await this.downloadFile(`/portal/invoices/${id}/download`, defaultFileName);
  }

  private static async downloadFile(endpoint: string, defaultFileName: string): Promise<void> {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem("portalAccessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    if (!res.ok) {
      throw new Error("Failed to download file.");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    const disposition = res.headers.get("content-disposition");
    let fileName = defaultFileName;
    if (disposition && disposition.indexOf("attachment") !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        fileName = decodeURIComponent(matches[1].replace(/['"]/g, ""));
      }
    }

    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
}
