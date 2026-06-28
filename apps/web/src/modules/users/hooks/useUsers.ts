import { useState, useEffect, useCallback } from "react";
import { userApi } from "../api/user.api";
import { UserResponseData, PaginationMeta } from "../types/user.types";
import { ApiClientError } from "@/services/http-client";

export interface UseUsersFilters {
  page: number;
  limit: number;
  sortBy: string;
  order: "asc" | "desc";
  status?: string;
  q?: string;
}

export function useUsers(initialFilters: Partial<UseUsersFilters> = {}) {
  const [users, setUsers] = useState<UserResponseData[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 25,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState<UseUsersFilters>({
    page: 1,
    limit: 25,
    sortBy: "createdAt",
    order: "desc",
    status: "",
    q: "",
    ...initialFilters,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.listUsers({
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        order: filters.order,
        status: filters.status || undefined,
        q: filters.q || undefined,
      });
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to fetch users.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateFilters = useCallback((newFilters: Partial<UseUsersFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 if changing query, status, or sorting,
      // to avoid pagination out-of-bounds errors.
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  return {
    users,
    pagination,
    filters,
    isLoading,
    error,
    refetch: fetchUsers,
    updateFilters,
  };
}
export default useUsers;
