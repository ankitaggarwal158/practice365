import { useParams, Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useUserMutations } from "../hooks/useUserMutations";
import { UserStatus } from "../types/user.types";
import { UserAvatar } from "../components/UserAvatar";
import { UserStatusBadge } from "../components/UserStatusBadge";
import { UserProfileForm } from "../components/UserProfileForm";
import { Alert } from "@/modules/auth/components/Alert";

export function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading, error, refetch } = useUser(id);
  const { changeUserStatus, updateUser, isPending } = useUserMutations();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 space-y-4">
        <Link to="/users" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12l7.5-7.5" />
          </svg>
          Back to Directory
        </Link>
        <Alert type="error" message={error || "User not found."} />
      </div>
    );
  }

  const handleStatusChange = async (newStatus: UserStatus) => {
    if (!id) return;
    try {
      await changeUserStatus(id, newStatus);
      refetch();
    } catch (err) {
      // Error is stored/handled in mutation hook or custom popups
    }
  };

  const handleProfileSave = async (updatedData: any) => {
    if (!id) return;
    await updateUser(id, updatedData);
    refetch();
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Back Link */}
      <Link
        to="/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-200/60 hover:text-white transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12l7.5-7.5" />
        </svg>
        Back to Staff Directory
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: User Card & Status Controls */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.06] bg-surface-900/40 p-6 text-center backdrop-blur-md">
            <UserAvatar
              avatarUrl={user.avatarUrl}
              firstName={user.firstName}
              lastName={user.lastName}
              size="xl"
            />
            <h2 className="mt-4 text-xl font-bold text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-surface-200/50">{user.jobTitle || "No Title Set"}</p>
            <p className="mt-1 text-xs text-surface-200/40">{user.email}</p>

            <div className="mt-4 flex justify-center">
              <UserStatusBadge status={user.status} />
            </div>

            <div className="mt-6 border-t border-surface-800/60 pt-4 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-surface-200/40">Joined:</span>
                <span className="text-surface-200">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              {user.lastLoginAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-surface-200/40">Last login:</span>
                  <span className="text-surface-200">
                    {new Date(user.lastLoginAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Administrative Actions Panel */}
          <div className="rounded-2xl border border-white/[0.06] bg-surface-900/40 p-6 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-semibold text-white">Administrative Operations</h3>
            <p className="text-xs text-surface-200/50">
              Manage status transitions. Deactivated or suspended members lose authentication access immediately.
            </p>

            <div className="space-y-2 pt-2">
              {/* Suspend / Reactivate Controls */}
              {user.status === UserStatus.ACTIVE && (
                <button
                  onClick={() => handleStatusChange(UserStatus.SUSPENDED)}
                  disabled={isPending}
                  className="w-full flex items-center justify-center rounded-xl border border-danger/30 bg-danger/5 py-2.5 text-xs font-semibold text-danger hover:bg-danger/10 disabled:opacity-50 transition-all duration-200"
                >
                  Suspend User Access
                </button>
              )}

              {(user.status === UserStatus.SUSPENDED || user.status === UserStatus.DEACTIVATED) && (
                <button
                  onClick={() => handleStatusChange(UserStatus.ACTIVE)}
                  disabled={isPending}
                  className="w-full flex items-center justify-center rounded-xl border border-success/30 bg-success/5 py-2.5 text-xs font-semibold text-success hover:bg-success/10 disabled:opacity-50 transition-all duration-200"
                >
                  Reactivate Access
                </button>
              )}

              {/* Deactivate Option */}
              {user.status !== UserStatus.DEACTIVATED && (
                <button
                  onClick={() => handleStatusChange(UserStatus.DEACTIVATED)}
                  disabled={isPending}
                  className="w-full flex items-center justify-center rounded-xl border border-surface-800 bg-surface-850 py-2.5 text-xs font-semibold text-surface-200/80 hover:bg-white/[0.02] hover:text-white disabled:opacity-50 transition-all duration-200"
                >
                  Deactivate User Account
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/[0.06] bg-surface-900/40 p-6 backdrop-blur-md space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Staff Member Details</h3>
              <p className="text-xs text-surface-200/50">
                Modify contact credentials and roles for this user.
              </p>
            </div>
            
            <UserProfileForm
              initialData={{
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                jobTitle: user.jobTitle,
                defaultHourlyRate: user.defaultHourlyRate,
              }}
              onSave={handleProfileSave}
              isOwnProfile={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
export default UserDetailsPage;
