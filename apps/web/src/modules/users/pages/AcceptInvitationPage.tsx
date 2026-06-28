import { useState, useEffect, type FormEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { acceptInvitationSchema } from "../schemas/user.schemas";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { FormField } from "@/modules/auth/components/FormField";
import { Button } from "@/modules/auth/components/Button";
import { Alert } from "@/modules/auth/components/Alert";
import { useUserMutations } from "../hooks/useUserMutations";

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { acceptInvitation, isPending } = useUserMutations();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) {
      setError("Invitation link is missing or invalid. Please check your email.");
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setFieldErrors({});

    const validation = acceptInvitationSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as string;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    try {
      await acceptInvitation({ token, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation.");
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Invitation Accepted!</h2>
            <p className="mt-2 text-sm text-surface-200/50">
              Your profile has been activated successfully. You can now log in using your credentials.
            </p>
          </div>
          <Link
            to="/login"
            className="block w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-400 shadow-lg shadow-brand-500/20 hover:shadow-brand-400/30 transition-all duration-200"
          >
            Sign In to Practice365
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface-950 p-4">
      <AuthLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Join Practice365</h2>
            <p className="mt-1 text-sm text-surface-200/50">
              Configure your password to accept the invitation and activate your account.
            </p>
          </div>

          {error && <Alert type="error" message={error} />}

          {token && (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <FormField
                label="Create Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors["password"]}
                placeholder="••••••••"
                required
                autoFocus
              />

              <FormField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={fieldErrors["confirmPassword"]}
                placeholder="••••••••"
                required
              />

              <Button type="submit" isLoading={isPending}>
                Activate Account
              </Button>
            </form>
          )}
        </div>
      </AuthLayout>
    </div>
  );
}
export default AcceptInvitationPage;
