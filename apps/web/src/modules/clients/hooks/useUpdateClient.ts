import { useState } from "react";
import { clientApi } from "../api/client.api";
import { UpdateClientRequest } from "../types/client.types";
import { ApiClientError } from "@/services/http-client";

export function useUpdateClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: string, data: UpdateClientRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await clientApi.updateClient(id, data);
      return updated;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to update client.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (id: string, note: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const createdNote = await clientApi.addNote(id, note);
      return createdNote;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to add note.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAttachment = async (id: string, documentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const createdAttachment = await clientApi.uploadAttachment(id, documentId);
      return createdAttachment;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to add attachment.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    update,
    addNote,
    uploadAttachment,
    isLoading,
    error,
  };
}
