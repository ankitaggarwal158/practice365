import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth";

/**
 * Wrapper that redirects authenticated users away from auth pages (login, etc.)
 * to the dashboard. Prevents logged-in users from seeing the login form.
 */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to where they came from, or dashboard
    const from = (location.state as { from?: Location })?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
