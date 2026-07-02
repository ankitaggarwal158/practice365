import { httpClient } from "../../../services/http-client.js";
import { DocumentFolder, DocumentMeta, DocumentSearchFilters, DocumentVersion } from "../types/document.types.js";

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([_, val]) => val !== undefined && val !== null && val !== ""
  );
  if (entries.length === 0) return "";
  return (
    "?" +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&")
  );
}

export const documentApi = {
  // Folders
  getFolders: () => httpClient.get<DocumentFolder[]>("/documents/folders"),
  createFolder: (data: { folderName: string; parentFolderId?: string | null }) => 
    httpClient.post<DocumentFolder>("/documents/folders", data),
  updateFolder: (id: string, data: { folderName: string }) => 
    httpClient.patch<DocumentFolder>(`/documents/folders/${id}`, data),
  deleteFolder: (id: string) => 
    httpClient.delete(`/documents/folders/${id}`),

  // Documents
  searchDocuments: (filters: DocumentSearchFilters) => 
    httpClient.get<{ data: DocumentMeta[]; total: number }>(`/documents${buildQueryString(filters)}`),
  getDocument: (id: string) => 
    httpClient.get<DocumentMeta>(`/documents/${id}`),
  
  uploadDocument: (data: { file: File; matterId?: string; folderId?: string | null; category?: string; description?: string }) => {
    const formData = new FormData();
    formData.append("file", data.file);
    if (data.matterId) formData.append("matterId", data.matterId);
    if (data.folderId) formData.append("folderId", data.folderId);
    if (data.category) formData.append("category", data.category);
    if (data.description) formData.append("description", data.description);

    return httpClient.post<DocumentMeta>("/documents", formData);
  },

  updateDocument: (id: string, data: { documentName?: string; description?: string; category?: string; folderId?: string | null }) =>
    httpClient.patch<DocumentMeta>(`/documents/${id}`, data),
  
  deleteDocument: (id: string) => 
    httpClient.delete(`/documents/${id}`),

  // Versions
  getVersions: (id: string) => 
    httpClient.get<DocumentVersion[]>(`/documents/${id}/versions`),
  
  uploadVersion: (id: string, file: File, notes: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("notes", notes);
    return httpClient.post<DocumentMeta>(`/documents/${id}/version`, formData);
  }
};
