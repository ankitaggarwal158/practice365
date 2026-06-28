import { useState, useCallback } from "react";
import { userApi } from "../api/user.api";
import { UserStatus, InviteUserRequest, UpdateUserRequest, AcceptInvitationRequest } from "../types/user.types";
import { ApiClientError } from "@/services/http-client";

export function useUserMutations() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteUser = useCallback(async (data: InviteUserRequest) => {
    setIsPending(true);
    setError(null);
    try {
      const result = await userApi.inviteUser(data);
      return result;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        throw err;
      }
      const genericMsg = "Failed to send user invitation.";
      setError(genericMsg);
      throw new Error(genericMsg);
    } finally {
      setIsPending(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: UpdateUserRequest) => {
    setIsPending(true);
    setError(null);
    try {
      const result = await userApi.updateUser(id, data);
      return result;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        throw err;
      }
      const genericMsg = "Failed to update user.";
      setError(genericMsg);
      throw new Error(genericMsg);
    } finally {
      setIsPending(false);
    }
  }, []);

  const changeUserStatus = useCallback(async (id: string, status: UserStatus) => {
    setIsPending(true);
    setError(null);
    try {
      const result = await userApi.changeUserStatus(id, { status });
      return result;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        throw err;
      }
      const genericMsg = "Failed to change user status.";
      setError(genericMsg);
      throw new Error(genericMsg);
    } finally {
      setIsPending(false);
    }
  }, []);

  const acceptInvitation = useCallback(async (data: AcceptInvitationRequest) => {
    setIsPending(true);
    setError(null);
    try {
      const result = await userApi.acceptInvitation(data);
      return result;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        throw err;
      }
      const genericMsg = "Failed to accept user invitation.";
      setError(genericMsg);
      throw new Error(genericMsg);
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    inviteUser,
    updateUser,
    changeUserStatus,
    acceptInvitation,
    isPending,
    error,
  };
}
export default useUserMutations;
