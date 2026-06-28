import { useUserMutations } from "./useUserMutations";

export function useCreateUser() {
  const { inviteUser, isPending, error } = useUserMutations();
  
  return {
    createUser: inviteUser,
    isPending,
    error,
  };
}
export default useCreateUser;
