import { httpClient, API_BASE_URL, PaginatedData } from "@/services/http-client";
import {
  SignatureRequest,
  SignatureRequestDetails,
  CreateSignatureRequestPayload,
  SubmitSignaturePayload,
  SigningSession,
} from "../types/signature.types";

export class SignatureApiClient {
  static listRequests(filters: {
    matterId?: string;
    documentId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedData<SignatureRequest>> {
    const params = new URLSearchParams();
    if (filters.matterId) params.append("matterId", filters.matterId);
    if (filters.documentId) params.append("documentId", filters.documentId);
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    return httpClient.getPaginated<SignatureRequest>(`/signature-requests?${params.toString()}`);
  }

  static getRequest(id: string): Promise<SignatureRequestDetails> {
    return httpClient.get<SignatureRequestDetails>(`/signature-requests/${id}`);
  }

  static createRequest(payload: CreateSignatureRequestPayload): Promise<SignatureRequestDetails> {
    return httpClient.post<SignatureRequestDetails>("/signature-requests", payload);
  }

  static sendRequest(id: string): Promise<SignatureRequestDetails> {
    return httpClient.post<SignatureRequestDetails>(`/signature-requests/${id}/send`);
  }

  static cancelRequest(id: string): Promise<SignatureRequestDetails> {
    return httpClient.post<SignatureRequestDetails>(`/signature-requests/${id}/cancel`);
  }

  static sendReminders(id: string): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>(`/signature-requests/${id}/remind`);
  }

  static deleteRequest(id: string): Promise<{ success: boolean }> {
    return httpClient.delete<{ success: boolean }>(`/signature-requests/${id}`);
  }

  // Guest/Public actions
  static loadSigningSession(token: string): Promise<SigningSession> {
    return httpClient.get<SigningSession>(`/sign/${token}`, true);
  }

  static submitSignature(token: string, payload: SubmitSignaturePayload): Promise<{ status: string }> {
    return httpClient.post<{ status: string }>(`/sign/${token}`, payload, true);
  }

  // File Download
  static async downloadSignedDocument(id: string, defaultFileName: string): Promise<void> {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/signature-requests/${id}/download`, { headers });
    if (!res.ok) {
      throw new Error("Failed to download completed signature document.");
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
