import useNotificationPreferences from "../hooks/useNotificationPreferences";

export function NotificationPreferencesForm() {
  const { preferences, isLoading, error, savePreferences } = useNotificationPreferences();

  const handleToggle = async (key: string, currentValue: boolean) => {
    try {
      await savePreferences({ [key]: !currentValue });
    } catch (err) {
      console.error(`Failed to update preference: ${key}`, err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 py-6 animate-pulse">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex justify-between items-center bg-white/5 h-14 rounded-xl px-4" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl p-4">
        {error}
      </div>
    );
  }

  if (!preferences) return null;

  const preferenceItems = [
    {
      key: "inAppNotifications",
      title: "In-App Notifications",
      description: "Receive alert badges and sound reminders inside the web application.",
      value: preferences.inAppNotifications,
    },
    {
      key: "emailNotifications",
      title: "Email Notifications",
      description: "Receive daily briefings, invitation links, and summaries in your inbox.",
      value: preferences.emailNotifications,
    },
    {
      key: "calendarReminders",
      title: "Calendar & Deadline Reminders",
      description: "Get alerts before scheduled case meetings and critical court dates.",
      value: preferences.calendarReminders,
      isSubOption: preferences.emailNotifications,
    },
    {
      key: "billingNotifications",
      title: "Billing & Invoices",
      description: "Receive notices on invoice drafts, collections due, and overdue alerts.",
      value: preferences.billingNotifications,
      isSubOption: preferences.emailNotifications,
    },
    {
      key: "taskNotifications",
      title: "Matters & Task Assignments",
      description: "Stay updated when you are assigned as a responsible attorney or collaborator.",
      value: preferences.taskNotifications,
      isSubOption: preferences.emailNotifications,
    },
  ];

  return (
    <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
        <p className="text-sm text-surface-200/50 mt-1">
          Configure how you receive updates and alerts regarding your work.
        </p>
      </div>

      <div className="divide-y divide-white/[0.04] border-t border-b border-white/[0.04]">
        {preferenceItems.map((item) => {
          // Disable sub-options if master email setting is off
          const isDisabled = item.isSubOption === false;

          return (
            <div
              key={item.key}
              className={`py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-opacity duration-200 ${
                isDisabled ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              <div className="max-w-xl">
                <label
                  htmlFor={item.key}
                  className="text-sm font-semibold text-white cursor-pointer"
                >
                  {item.title}
                </label>
                <p className="text-xs text-surface-200/40 mt-1">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  id={item.key}
                  disabled={isDisabled}
                  onClick={() => handleToggle(item.key, item.value)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    item.value ? "bg-brand-500" : "bg-surface-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      item.value ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NotificationPreferencesForm;
