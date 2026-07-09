import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config, validateConfig } from "./config/index.js";
import { connectDatabase } from "./database/connection.js";
import { globalErrorHandler } from "./shared/error-handler.js";
import { authRouter } from "./modules/auth/index.js";
import { userRouter } from "./modules/users/index.js";
import { rolesRouter, seedSystemPermissionsAndRoles } from "./modules/roles/index.js";
import { firmRouter } from "./modules/firm/index.js";
import { intakeRouter } from "./modules/intake/index.js";
import { leadRouter } from "./modules/leads/index.js";
import { conflictCheckRouter } from "./modules/conflict-check/index.js";
import { clientRouter } from "./modules/clients/index.js";
import { matterRouter } from "./modules/matters/index.js";
import { practiceAreaRouter } from "./modules/practice-areas/index.js";
import { opposingPartyRouter } from "./modules/opposing-parties/index.js";
import { matterContactRouter } from "./modules/matter-contacts/index.js";
import { noteRouter } from "./modules/notes/index.js";
import { calendarRouter } from "./modules/calendar/index.js";
import { documentRouter } from "./modules/documents/index.js";
import { timeEntryRouter } from "./modules/time-tracking/index.js";
import { invoiceRouter } from "./modules/billing/index.js";
import { portalRouter } from "./modules/client-portal/index.js";
import { signatureRequestRouter } from "./modules/e-signatures/index.js";
import { dashboardRouter } from "./modules/dashboard/index.js";
import { notificationRouter } from "./modules/notifications/index.js";
import { auditLogRouter } from "./modules/audit-log/index.js";
import { firmSettingsRouter } from "./modules/firm-settings/index.js";
import { reportsRouter } from "./modules/reports/index.js";
import { systemSettingsRouter, checkMaintenanceMode } from "./modules/system-administration/index.js";

// Validate required configuration before starting
validateConfig();

const app = express();

// ─── Global Middleware ───────────────────────────────────────
app.use(cors({ origin: config.corsOrigin }));
app.use(helmet());
app.use(morgan(config.logLevel));
app.use(express.json());
app.use(checkMaintenanceMode);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ─── Health Check ────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api", systemSettingsRouter);
app.use("/api/users", userRouter);
app.use("/api", rolesRouter);
app.use("/api", firmRouter);
app.use("/api", intakeRouter);
app.use("/api", leadRouter);
app.use("/api", conflictCheckRouter);
app.use("/api", clientRouter);
app.use("/api", matterRouter);
app.use("/api", practiceAreaRouter);
app.use("/api", opposingPartyRouter);
app.use("/api", matterContactRouter);
app.use("/api", noteRouter);
app.use("/api", calendarRouter);
app.use("/api/documents", documentRouter);
app.use("/api/time-entries", timeEntryRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api", portalRouter);
app.use("/api", signatureRequestRouter);
app.use("/api", dashboardRouter);
app.use("/api", notificationRouter);
app.use("/api", auditLogRouter);
app.use("/api", firmSettingsRouter);
app.use("/api", reportsRouter);


// ─── Global Error Handler (must be last) ─────────────────────
app.use(globalErrorHandler);

// ─── Start Server ────────────────────────────────────────────
async function start(): Promise<void> {
  await connectDatabase();
  await seedSystemPermissionsAndRoles();

  app.listen(config.port, () => {
    console.log(`API server listening on port ${config.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

export { app };
