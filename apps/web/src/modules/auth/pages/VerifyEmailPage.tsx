import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useVerifyEmail } from "../hooks/useVerifyEmail";
import { AuthLayout } from "../components/AuthLayout";

/**
 * Verify Email page.
 *
 * User story: As a user, I want to verify my email address,
 * before accessing Practice365.
 *
 * Auto-triggers verification on mount using the token from the URL.
 */
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { verifyEmail, isLoading, isSuccess, error } = useVerifyEmail();

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  if (!token) {
    return (
      <AuthLayout>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
            <svg className="h-8 w-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Invalid link</h2>
            <p className="mt-2 text-sm text-surface-200/50">
              This verification link is invalid or has expired.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-block text-sm text-brand-400 transition-colors hover:text-brand-300"
          >
            Go to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10">
            <svg
              className="h-8 w-8 animate-spin text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Verifying your email...</h2>
            <p className="mt-2 text-sm text-surface-200/50">
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (error) {
    return (
      <AuthLayout>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
            <svg className="h-8 w-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Verification failed</h2>
            <p className="mt-2 text-sm text-surface-200/50">{error}</p>
          </div>
          <Link
            to="/login"
            className="inline-block text-sm text-brand-400 transition-colors hover:text-brand-300"
          >
            Go to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Email verified!</h2>
            <p className="mt-2 text-sm text-surface-200/50">
              Your email has been verified successfully. You can now sign in to your account.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-block text-sm text-brand-400 transition-colors hover:text-brand-300"
          >
            Sign in →
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return null;
}
