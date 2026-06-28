import { useState, type FormEvent } from "react";
import { updateOwnProfileSchema } from "../schemas/user.schemas";
import { FormField } from "@/modules/auth/components/FormField";
import { Button } from "@/modules/auth/components/Button";
import { Alert } from "@/modules/auth/components/Alert";

interface UserProfileFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    displayName?: string;
    phone?: string;
    avatarUrl?: string;
    jobTitle?: string;
  };
  onSave: (data: any) => Promise<unknown>;
  isOwnProfile?: boolean;
}

export function UserProfileForm({ initialData, onSave, isOwnProfile = true }: UserProfileFormProps) {
  const [firstName, setFirstName] = useState(initialData.firstName || "");
  const [lastName, setLastName] = useState(initialData.lastName || "");
  const [displayName, setDisplayName] = useState(initialData.displayName || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || "");
  const [jobTitle, setJobTitle] = useState(initialData.jobTitle || "");
  
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const payload = isOwnProfile
      ? { firstName, lastName, displayName, phone, avatarUrl, jobTitle }
      : { firstName, lastName, phone, jobTitle };

    const validation = updateOwnProfileSchema.safeParse(payload);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as string;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsPending(true);
    try {
      await onSave(payload);
      setSuccess("Profile updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField
          label="First Name"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={fieldErrors["firstName"]}
          placeholder="John"
          required
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
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField
          label="Job Title"
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          error={fieldErrors["jobTitle"]}
          placeholder="Senior Attorney"
        />

        <FormField
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={fieldErrors["phone"]}
          placeholder="+1 (555) 019-2834"
        />
      </div>

      {isOwnProfile && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Display Name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={fieldErrors["displayName"]}
            placeholder="John D."
          />

          <FormField
            label="Avatar URL"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            error={fieldErrors["avatarUrl"]}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-surface-800">
        <Button
          type="submit"
          isLoading={isPending}
          className="!w-auto px-8"
        >
          Save Profile Changes
        </Button>
      </div>
    </form>
  );
}
export default UserProfileForm;
