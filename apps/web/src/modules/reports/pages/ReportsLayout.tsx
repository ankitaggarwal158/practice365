import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCurrentUserPermissions } from "@/modules/roles";

export function ReportsLayout() {
  const { permissions = [], isLoading: isAuthLoading } = useCurrentUserPermissions();
  const location = useLocation();
  const navigate = useNavigate();

  const hasMattersView = permissions.includes("MATTERS_VIEW");
  const hasClientsView = permissions.includes("CLIENTS_VIEW");
  const hasTimeEntriesView = permissions.includes("TIME_ENTRIES_VIEW");
  const hasInvoicesView = permissions.includes("INVOICES_VIEW");
  const hasAuditView = permissions.includes("AUDIT_VIEW");

  const reportsTabs = [
    { id: "matters", name: "Matters Report", path: "/reports/matters", allowed: hasMattersView },
    { id: "clients", name: "Client Directory", path: "/reports/clients", allowed: hasClientsView },
    { id: "time", name: "Time Tracking", path: "/reports/time", allowed: hasTimeEntriesView },
    { id: "billing", name: "Billing & Revenue", path: "/reports/billing", allowed: hasInvoicesView },
    { id: "user-activity", name: "User Activity", path: "/reports/user-activity", allowed: hasAuditView },
  ];

  const allowedTabs = reportsTabs.filter((tab) => tab.allowed);

  // If client lands exactly on "/reports", redirect them to their first permitted tab
  useEffect(() => {
    if (location.pathname === "/reports" || location.pathname === "/reports/") {
      const firstTab = allowedTabs[0];
      if (firstTab) {
        navigate(firstTab.path, { replace: true });
      }
    }
  }, [location.pathname, allowedTabs, navigate]);

  if (isAuthLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (allowedTabs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Access Denied. You do not have permissions to view system reports.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">System Reports</h1>
        <p className="text-sm text-surface-200/50">
          On-demand metrics summaries and records exports to analyze daily productivity, workload status, and finances.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-white/[0.06] mb-8">
        <nav className="flex gap-6 -mb-px" aria-label="Reports Directory Tabs">
          {allowedTabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer select-none ${isActive
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

      {/* Main card wrapper for reports pages */}
      <div className="rounded-2xl border border-white/[0.06] bg-surface-900/40 backdrop-blur-md p-6 sm:p-8 shadow-xl">
        <Outlet />
      </div>
    </div>
  );
}
export default ReportsLayout;
