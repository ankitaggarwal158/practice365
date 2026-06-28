import { useUserMutations } from "./useUserMutations";

export function useChangeUserStatus() {
  const { changeUserStatus, isPending, error } = useUserMutations();
  
  return {
    changeUserStatus,
    isPending,
    error,
  };
}
export default useChangeUserStatus;
