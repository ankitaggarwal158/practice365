import { Job, JobStatus } from "../schemas/job.schema.js";
import { processJobs } from "../worker.js";

export interface EnqueueOptions {
  runAt?: Date;
  maxAttempts?: number;
}

export async function enqueue(
  name: string,
  data: Record<string, any>,
  options?: EnqueueOptions
): Promise<void> {
  await Job.create({
    name,
    data,
    status: JobStatus.PENDING,
    runAt: options?.runAt || new Date(),
    maxAttempts: options?.maxAttempts !== undefined ? options.maxAttempts : 3,
  });
  
  console.log(`[QUEUE] Enqueued job: ${name}`);

  // In serverless (Vercel) environments, trigger the worker immediately
  // to process the pending job in the background of the same request lifecycle.
  if (process.env.VERCEL) {
    processJobs().catch((err) => {
      console.error("[QUEUE] Error triggering worker for enqueued job:", err);
    });
  }
}
