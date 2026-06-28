import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { forgotPasswordSchema } from "../schemas/auth.schemas";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";

/**
 * Forgot Password page.
 *
 * User story: As a user, I want to request a password reset,
 * so I can regain access to my account.
 */
export function ForgotPasswordPage() {
  const { forgotPassword, isLoading, isSuccess, error } = useForgotPassword();

  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const result = forgotPasswordSchema.safeParse({ email });
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

    await forgotPassword(email);
  }

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Check your email</h2>
            <p className="mt-2 text-sm leading-relaxed text-surface-200/50">
              If an account with that email exists, we've sent a password reset
              link. Please check your inbox and spam folder.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-block text-sm text-brand-400 transition-colors hover:text-brand-300"
          >
            ← Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Forgot password?</h2>
          <p className="mt-1 text-sm text-surface-200/50">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <FormField
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors["email"]}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            }
          />

          <Button type="submit" isLoading={isLoading}>
            Send reset link
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
