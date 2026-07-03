import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "../api/document.api.js";
import { DocumentSearchFilters } from "../types/document.types.js";

export const useFolders = () => {
  return useQuery({
    queryKey: ["documents", "folders"],
    queryFn: documentApi.getFolders,
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentApi.createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
    },
  });
};

export const useDocuments = (filters: DocumentSearchFilters) => {
  return useQuery({
    queryKey: ["documents", filters],
    queryFn: () => documentApi.searchDocuments(filters),
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => documentApi.getDocument(id),
    enabled: !!id,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentApi.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof documentApi.updateDocument>[1] }) =>
      documentApi.updateDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documents", variables.id] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};

export const useDocumentVersions = (id: string) => {
  return useQuery({
    queryKey: ["documents", id, "versions"],
    queryFn: () => documentApi.getVersions(id),
    enabled: !!id,
  });
};

export const useUploadVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file, notes }: { id: string; file: File; notes: string }) =>
      documentApi.uploadVersion(id, file, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["documents", variables.id, "versions"] });
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { folderName: string } }) =>
      documentApi.updateFolder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentApi.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
    },
  });
};
