import { Request, Response } from "express";
import { processJobs } from "./worker.js";
import { config } from "../../config/index.js";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";

export async function processQueue(req: Request, res: Response): Promise<void> {
  const token = req.headers["x-jobs-token"] as string;

  if (!token || token !== config.jobsToken) {
    throw AppError.forbidden("Invalid jobs token.");
  }

  // Await the queue processing to ensure serverless containers stay active
  await processJobs();

  sendSuccess(res, { status: "success", message: "Queue processed successfully." });
}
