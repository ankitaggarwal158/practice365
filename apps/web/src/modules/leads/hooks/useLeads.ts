import { useState, useEffect, useCallback } from "react";
import { leadApi, ListLeadsParams } from "../api/lead.api";
import { Lead } from "../types/lead.types";
import { ApiClientError } from "@/services/http-client";

export function useLeads(params: ListLeadsParams) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await leadApi.listLeads(params);
      setLeads(response.data);
      setPagination(response.pagination);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch leads list.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.limit, params.status, params.source, params.ownerId, params.practiceArea, params.q]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    pagination,
    isLoading,
    error,
    refetch: fetchLeads,
  };
}
