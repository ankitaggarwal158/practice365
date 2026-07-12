import "dotenv/config";

export const config = {
  // ─── Application ─────────────────────────────────────────
  port: parseInt(process.env.API_PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // ─── Database ────────────────────────────────────────────
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/practice365",

  // ─── CORS ────────────────────────────────────────────────
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  // ─── Logging ─────────────────────────────────────────────
  logLevel: process.env.LOG_LEVEL || "dev",

  // ─── JWT ─────────────────────────────────────────────────
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
  jwtAccessExpiry: parseInt(process.env.JWT_ACCESS_EXPIRY || "900", 10),
  jwtRefreshExpiry: parseInt(process.env.JWT_REFRESH_EXPIRY || "604800", 10),

  // ─── Password Reset ─────────────────────────────────────
  passwordResetExpiry: parseInt(process.env.PASSWORD_RESET_EXPIRY || "3600", 10),

  // ─── Email Verification ──────────────────────────────────
  emailVerificationExpiry: parseInt(process.env.EMAIL_VERIFICATION_EXPIRY || "86400", 10),

  // ─── Account Lockout ─────────────────────────────────────
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5", 10),
  loginLockoutDuration: parseInt(process.env.LOGIN_LOCKOUT_DURATION || "900", 10),

  // ─── SMTP Email ──────────────────────────────────────────
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || "Practice365 <no-reply@practice365.com>",
  workerPollInterval: parseInt(process.env.WORKER_POLL_INTERVAL || "5000", 10),
  jobsToken: process.env.JOBS_TOKEN || "local-jobs-token-secret-change-me",
} as const;

/**
 * Validate that required secrets are set in production.
 * Fail fast if critical configuration is missing.
 */
export function validateConfig(): void {
  if (config.nodeEnv === "production") {
    const requiredSecrets = [
      { key: "JWT_ACCESS_SECRET", value: process.env.JWT_ACCESS_SECRET },
      { key: "JWT_REFRESH_SECRET", value: process.env.JWT_REFRESH_SECRET },
    ];

    const missing = requiredSecrets.filter((s) => !s.value);
    if (missing.length > 0) {
      const keys = missing.map((s) => s.key).join(", ");
      throw new Error(`Missing required environment variables: ${keys}`);
    }
  }
}
