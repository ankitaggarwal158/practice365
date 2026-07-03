import { z } from "zod";

export const PortalLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const PortalForgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address format"),
  }),
});

export const PortalResetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  }),
});

export const PortalProfileUpdateSchema = z.object({
  body: z.object({
    phone: z.string().max(30).optional(),
    address: z.object({
      street: z.string().max(200).optional(),
      city: z.string().max(100).optional(),
      state: z.string().max(100).optional(),
      zipCode: z.string().max(20).optional(),
      country: z.string().max(100).optional(),
    }).optional(),
  }),
});
