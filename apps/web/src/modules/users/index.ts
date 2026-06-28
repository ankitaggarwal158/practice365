/**
 * User Management Module — Frontend
 *
 * Module ID: 011
 * Responsibility: User directory views, details, invites, preferences and invitation acceptance.
 */

// Layout
export { DashboardLayout } from "./components/DashboardLayout";

// Pages
export { UserListPage } from "./pages/UserListPage";
export { UserDetailsPage } from "./pages/UserDetailsPage";
export { UserProfilePage } from "./pages/UserProfilePage";
export { AcceptInvitationPage } from "./pages/AcceptInvitationPage";

// Hooks
export { useUsers } from "./hooks/useUsers";
export { useUser } from "./hooks/useUser";
export { useCurrentUser } from "./hooks/useCurrentUser";
export { useUserMutations } from "./hooks/useUserMutations";
export { useCreateUser } from "./hooks/useCreateUser";
export { useUpdateUser } from "./hooks/useUpdateUser";
export { useUpdatePreferences } from "./hooks/useUpdatePreferences";
export { useChangeUserStatus } from "./hooks/useChangeUserStatus";

// API
export { userApi } from "./api/user.api";

// Types
export * from "./types/user.types";
