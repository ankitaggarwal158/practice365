import { useState, type FormEvent } from "react";
import { inviteUserSchema } from "../schemas/user.schemas";
import { FormField } from "@/modules/auth/components/FormField";
import { Button } from "@/modules/auth/components/Button";
import { Alert } from "@/modules/auth/components/Alert";
import { useUserMutations } from "../hooks/useUserMutations";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const { inviteUser, isPending } = useUserMutations();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = inviteUserSchema.safeParse({ email, firstName, lastName });
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
      await inviteUser({ email, firstName, lastName });
      onSuccess();
      onClose();
      setEmail("");
      setFirstName("");
      setLastName("");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-900/90 p-6 shadow-2xl backdrop-blur-md animate-slide-up">
        <div className="flex items-center justify-between border-b border-surface-800 pb-4">
          <h3 className="text-lg font-semibold text-white">Invite Team Member</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-surface-200/50 hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-4">
            <Alert type="error" message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <FormField
            label="First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={fieldErrors["firstName"]}
            placeholder="Jane"
            required
            autoFocus
          />

          <FormField
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={fieldErrors["lastName"]}
            placeholder="Doe"
            required
          />

          <FormField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors["email"]}
            placeholder="jane.doe@example.com"
            required
          />

          <div className="mt-6 flex items-center gap-3 border-t border-surface-800 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="!w-auto flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isPending}
              className="flex-1"
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default InviteUserModal;
