import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth";
import { UserAvatar } from "./UserAvatar";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      label: "Staff Directory",
      path: "/users",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 21m-5.38-2.999a4.125 4.125 0 00-7.533 2.493 9.337 9.337 0 004.121.952 9.38 9.38 0 002.625-.372m-2.625-.372v-.003c0-1.113.285-2.16.786-3.07m2.625 3.072v-.109A11.386 11.386 0 0010.089 21m0-10.089A4.125 4.125 0 1010.089 2.5a4.125 4.125 0 000 8.25zm5-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
      ),
    },
    {
      label: "Roles & Permissions",
      path: "/roles",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      label: "Intake Management",
      path: "/intakes",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      label: "Lead Management",
      path: "/leads",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.005 9.005 0 00-12 0m12 0a9 9 0 00-12 0m12 0c0-1.657-1.343-3-3-3H9c-1.657 0-3 1.343-3 3m12 0a9 9 0 01-12 0M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Client Directory",
      path: "/clients",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 21" />
        </svg>
      ),
    },
    {
      label: "Matter Management",
      path: "/matters",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.884 2.223v6.12c0 1.242 1.008 2.25 2.25 2.25h15a2.25 2.25 0 002.25-2.25v-6.12a2.25 2.25 0 00-1.884-2.223m-16.5 0v-1.636a2.25 2.25 0 012.25-2.25h5.518c.28 0 .55.103.757.29l1.83 1.644a1.25 1.25 0 00.839.31h5.073c.28 0 .55-.103.757-.29l1.83-1.644a1.25 1.25 0 01.839-.31h1.161v1.636" />
        </svg>
      ),
    },
    {
      label: "Conflict Check",
      path: "/conflict-checks",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623" />
        </svg>
      ),
    },
    {
      label: "Firm Settings",
      path: "/firm",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 16.5h1.5M13.5 16.5H15M6 21v-3a1 1 0 011-1h2a1 1 0 011 1v3m4 0v-3a1 1 0 011-1h2a1 1 0 011 1v3" />
        </svg>
      ),
    },
    {
      label: "My Profile",
      path: "/profile",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-dvh bg-surface-950 text-surface-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/[0.06] bg-surface-900/60 backdrop-blur-md flex flex-col justify-between">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">
              Practice<span className="text-brand-400">365</span>
            </span>
          </Link>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== "/" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-brand-500/10 text-brand-300 border-l-2 border-brand-400"
                      : "text-surface-200/60 hover:bg-white/[0.03] hover:text-surface-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card / Logout */}
        <div className="border-t border-white/[0.06] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <UserAvatar
              firstName={user?.email ? user.email.charAt(0) : "U"}
              lastName={user?.email ? user.email.charAt(1) : "S"}
              size="sm"
            />
            <div className="overflow-hidden">
              <span className="block text-xs font-semibold text-white truncate">
                Logged in as
              </span>
              <span className="block text-[11px] text-surface-200/50 truncate">
                {user?.email}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="rounded-lg p-2 text-surface-200/50 hover:bg-white/[0.04] hover:text-danger/80 transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
export default DashboardLayout;
