import { z } from "zod";

export const inviteUserSchema = z.object({
  email: z
    .string({ error: "Email is required." })
    .email("Please enter a valid email address."),
  firstName: z
    .string({ error: "First name is required." })
    .min(1, "First name is required."),
  lastName: z
    .string({ error: "Last name is required." })
    .min(1, "Last name is required."),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required.").optional(),
  lastName: z.string().min(1, "Last name is required.").optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
});

export const updateOwnProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required.").optional(),
  lastName: z.string().min(1, "Last name is required.").optional(),
  displayName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url("Please enter a valid URL.").or(z.string().length(0)).optional(),
  jobTitle: z.string().optional(),
});

export const acceptInvitationSchema = z.object({
  password: z
    .string({ error: "Password is required." })
    .min(8, "Password must be at least 8 characters."),
  confirmPassword: z
    .string({ error: "Please confirm your password." })
    .min(1, "Please confirm your password."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export type InviteUserFormData = z.infer<typeof inviteUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type UpdateOwnProfileFormData = z.infer<typeof updateOwnProfileSchema>;
export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;
