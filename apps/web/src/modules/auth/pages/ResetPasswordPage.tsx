import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useResetPassword } from "../hooks/useResetPassword";
import { resetPasswordSchema } from "../schemas/auth.schemas";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";

/**
 * Reset Password page.
 *
 * User story: As a user, I want to securely choose a new password,
 * using a temporary reset link.
 */
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { resetPassword, isLoading, isSuccess, error } = useResetPassword();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    if (!token) {
      setFieldErrors({ token: "Invalid or missing reset token." });
      return;
    }

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    await resetPassword(token, password);
  }

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
              This password reset link is invalid or has expired.
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="inline-block text-sm text-brand-400 transition-colors hover:text-brand-300"
          >
            Request a new link
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
            <h2 className="text-xl font-semibold text-white">Password reset successful</h2>
            <p className="mt-2 text-sm text-surface-200/50">
              Your password has been updated. You can now sign in with your new
              password.
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

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Set new password</h2>
          <p className="mt-1 text-sm text-surface-200/50">
            Choose a strong password for your account
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <FormField
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors["password"]}
            placeholder="••••••••"
            autoComplete="new-password"
            autoFocus
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            }
          />

          <FormField
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors["confirmPassword"]}
            placeholder="••••••••"
            autoComplete="new-password"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            }
          />

          <Button type="submit" isLoading={isLoading}>
            Reset password
          </Button>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-surface-200/50 transition-colors hover:text-surface-100"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
