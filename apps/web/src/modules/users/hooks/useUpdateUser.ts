import { useUserMutations } from "./useUserMutations";

export function useUpdateUser() {
  const { updateUser, isPending, error } = useUserMutations();
  
  return {
    updateUser,
    isPending,
    error,
  };
}
export default useUpdateUser;
