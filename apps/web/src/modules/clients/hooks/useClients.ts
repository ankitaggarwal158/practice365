import { useState, useEffect, useCallback } from "react";
import { clientApi, ListClientsParams } from "../api/client.api";
import { Client } from "../types/client.types";
import { ApiClientError } from "@/services/http-client";

export function useClients(params: ListClientsParams) {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await clientApi.listClients(params);
      setClients(response.data);
      setPagination(response.pagination);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch clients list.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.limit, params.status, params.clientType, params.q]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    pagination,
    isLoading,
    error,
    refetch: fetchClients,
  };
}
