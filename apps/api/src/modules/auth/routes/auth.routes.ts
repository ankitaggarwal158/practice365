import { Router } from "express";
import { asyncHandler } from "../../../shared/async-handler.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../validation/auth.validation.js";
import {
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validation/auth.validation.js";
import * as authController from "../controller/auth.controller.js";

const router = Router();

// ─── Public Routes (No Auth Required) ────────────────────────

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(authController.login)
);

router.post(
  "/refresh",
  validate(refreshSchema),
  asyncHandler(authController.refresh)
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword)
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword)
);

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  asyncHandler(authController.verifyEmail)
);

// ─── Protected Routes (Auth Required) ────────────────────────

router.post(
  "/logout",
  authenticate,
  asyncHandler(authController.logout)
);

router.post(
  "/logout-all",
  authenticate,
  asyncHandler(authController.logoutAll)
);

router.get(
  "/me",
  authenticate,
  asyncHandler(authController.me)
);

export { router as authRouter };
