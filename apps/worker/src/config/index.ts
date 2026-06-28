import "dotenv/config";

export const workerConfig = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL ?? "info",
  pollInterval: parseInt(process.env.WORKER_POLL_INTERVAL ?? "5000", 10),
} as const;
