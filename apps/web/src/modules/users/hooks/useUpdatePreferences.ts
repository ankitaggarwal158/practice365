import { useCurrentUser } from "./useCurrentUser";

export function useUpdatePreferences() {
  const { updatePreferences, isUpdatingPreferences, error } = useCurrentUser();
  
  return {
    updatePreferences,
    isPending: isUpdatingPreferences,
    error,
  };
}
export default useUpdatePreferences;
