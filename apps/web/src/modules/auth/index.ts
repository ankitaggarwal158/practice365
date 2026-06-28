/**
 * Authentication Module — Frontend
 *
 * Module ID: 010
 * Responsibility: Auth UI pages, hooks, and API client.
 */

// Pages
export { LoginPage } from "./pages/LoginPage";
export { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
export { ResetPasswordPage } from "./pages/ResetPasswordPage";
export { VerifyEmailPage } from "./pages/VerifyEmailPage";

// Hooks
export { AuthProvider, useAuth } from "./hooks/useAuth";
export { useForgotPassword } from "./hooks/useForgotPassword";
export { useResetPassword } from "./hooks/useResetPassword";
export { useVerifyEmail } from "./hooks/useVerifyEmail";

// API
export { authApi } from "./api/auth.api";
