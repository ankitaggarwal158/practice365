import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Briefcase, FileText, DollarSign, User, LogOut, Shield } from "lucide-react";
import { usePortalProfile } from "../hooks/usePortal";
import { PortalApiClient } from "../api/portal.api";

export const PortalLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile } = usePortalProfile();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("portalRefreshToken");
    if (refreshToken) {
      try {
        await PortalApiClient.logout(refreshToken);
      } catch (err) {
        console.error("Logout failed:", err);
      }
    }
    localStorage.removeItem("portalAccessToken");
    localStorage.removeItem("portalRefreshToken");
    localStorage.removeItem("portalUser");
    navigate("/portal/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/portal", icon: Home },
    { label: "My Matters", path: "/portal/matters", icon: Briefcase },
    { label: "Documents", path: "/portal/documents", icon: FileText },
    { label: "Invoices", path: "/portal/invoices", icon: DollarSign },
    { label: "Profile Settings", path: "/portal/profile", icon: User },
  ];

  const clientName = profile
    ? profile.clientType === "INDIVIDUAL"
      ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
      : profile.companyName
    : "Client Portal User";

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-surface-900 border-r border-white/[0.06] flex flex-col justify-between p-4 hidden md:flex">
        <div className="space-y-8">
          {/* Logo / Branding */}
          <div className="flex items-center gap-2.5 px-2.5 py-1.5">
            <div className="h-9 w-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block">Client Portal</span>
              <span className="text-[10px] text-surface-400 font-semibold tracking-wider uppercase block">Practice365</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/portal"
                  ? location.pathname === "/portal"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-brand-500/10 text-brand-400 border border-brand-500/15"
                      : "text-surface-400 hover:text-white hover:bg-surface-850 border border-transparent"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? "text-brand-400" : "text-surface-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="border-t border-white/[0.06] pt-4 space-y-4">
          <div className="px-2">
            <span className="text-xs text-surface-400 block">Logged in as</span>
            <span className="text-sm font-bold text-white block truncate">{clientName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 hover:border-red-500/15 border border-transparent rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="bg-surface-900 border-b border-white/[0.06] md:hidden px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-500" />
            <span className="font-extrabold text-white text-sm">Client Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 transition-colors p-1"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Mobile Nav Sticky */}
        <nav className="bg-surface-900 border-t border-white/[0.06] md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/portal"
                ? location.pathname === "/portal"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-all ${
                  isActive ? "text-brand-400" : "text-surface-400"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate max-w-[60px]">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>

        {/* Contents area */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 bg-surface-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
