import express from "express";
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

// Validate required configuration before starting
validateConfig();

const app = express();

// ─── Global Middleware ───────────────────────────────────────
app.use(cors({ origin: config.corsOrigin }));
app.use(helmet());
app.use(morgan(config.logLevel));
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api", rolesRouter);
app.use("/api", firmRouter);
app.use("/api", intakeRouter);
app.use("/api", leadRouter);
app.use("/api", conflictCheckRouter);
app.use("/api", clientRouter);

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
