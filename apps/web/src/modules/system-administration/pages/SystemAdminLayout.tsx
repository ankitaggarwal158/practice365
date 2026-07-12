import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCurrentUserPermissions } from "@/modules/roles";

export function SystemAdminLayout() {
  const { permissions = [], isLoading: isAuthLoading } = useCurrentUserPermissions();
  const location = useLocation();
  const navigate = useNavigate();

  const isSystemAdmin = permissions.includes("SYSTEM_ADMIN");

  useEffect(() => {
    if (!isAuthLoading && !isSystemAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAuthLoading, isSystemAdmin, navigate]);

  useEffect(() => {
    if (location.pathname === "/system" || location.pathname === "/system/") {
      navigate("/system/settings", { replace: true });
    }
  }, [location.pathname, navigate]);

  if (isAuthLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isSystemAdmin) {
    return null;
  }

  const tabs = [
    { id: "settings", name: "System Settings", path: "/system/settings" },
    { id: "flags", name: "Feature Flags", path: "/system/flags" },
    { id: "announcements", name: "Announcements", path: "/system/announcements" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">System Administration</h1>
        <p className="text-sm text-surface-200/50">
          Global operational control console. Manage application maintenance mode, feature rollout states, and announcements.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-white/[0.06] mb-8">
        <nav className="flex gap-6 -mb-px" aria-label="System Administration Tabs">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? "border-brand-400 text-brand-300"
                    : "border-transparent text-surface-200/55 hover:text-white hover:border-white/10"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Nested Route View */}
      <Outlet />
    </div>
  );
}
export default SystemAdminLayout;
