import NotificationPreferencesForm from "../components/NotificationPreferencesForm";

export function NotificationPreferencesPage() {
  return (
    <div className="flex-1 flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-surface-200/50">
          Manage your personal preference settings and account configurations.
        </p>
      </div>

      <NotificationPreferencesForm />
    </div>
  );
}

export default NotificationPreferencesPage;
