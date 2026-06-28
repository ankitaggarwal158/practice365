import { useState } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { UserProfileForm } from "../components/UserProfileForm";
import { UserPreferencesForm } from "../components/UserPreferencesForm";
import { UserAvatar } from "../components/UserAvatar";
import { Alert } from "@/modules/auth/components/Alert";

type Tab = "profile" | "preferences";

export function UserProfilePage() {
  const {
    currentUser,
    isLoading,
    error,
    updateProfile,
    updatePreferences,
  } = useCurrentUser();

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="p-8">
        <Alert type="error" message={error || "Profile failed to load."} />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 space-y-6 max-w-4xl mx-auto w-full">
      {/* Header section with avatar */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <UserAvatar
          avatarUrl={currentUser.avatarUrl}
          firstName={currentUser.firstName}
          lastName={currentUser.lastName}
          size="lg"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {currentUser.firstName} {currentUser.lastName}
          </h1>
          <p className="text-sm text-surface-200/50">
            Manage your personal profile details, timezone, language, and date format preferences.
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-surface-800">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 focus:outline-none select-none ${
            activeTab === "profile"
              ? "border-brand-400 text-brand-300"
              : "border-transparent text-surface-200/60 hover:text-surface-100"
          }`}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 focus:outline-none select-none ${
            activeTab === "preferences"
              ? "border-brand-400 text-brand-300"
              : "border-transparent text-surface-200/60 hover:text-surface-100"
          }`}
        >
          System Preferences
        </button>
      </div>

      {/* Tab Panels */}
      <div className="rounded-2xl border border-white/[0.06] bg-surface-900/40 p-6 backdrop-blur-md">
        {activeTab === "profile" ? (
          <UserProfileForm
            initialData={{
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              displayName: currentUser.displayName,
              phone: currentUser.phone,
              avatarUrl: currentUser.avatarUrl,
              jobTitle: currentUser.jobTitle,
            }}
            onSave={updateProfile}
            isOwnProfile={true}
          />
        ) : (
          <UserPreferencesForm
            initialPreferences={{
              timezone: currentUser.timezone,
              language: currentUser.language,
              dateFormat: currentUser.dateFormat,
              timeFormat: currentUser.timeFormat,
              notificationPreferences: currentUser.notificationPreferences,
            }}
            onSave={updatePreferences}
          />
        )}
      </div>
    </div>
  );
}
export default UserProfilePage;
