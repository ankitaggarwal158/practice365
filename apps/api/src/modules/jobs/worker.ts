import { Job, JobStatus, IJob } from "./schemas/job.schema.js";
import { sendEmail } from "../../shared/services/email.service.js";

type JobHandler = (data: any) => Promise<void>;

const handlers = new Map<string, JobHandler>();

/**
 * Register a function to handle jobs of a specific type.
 */
export function registerHandler(name: string, handler: JobHandler): void {
  handlers.set(name, handler);
  console.log(`[WORKER] Registered handler for job: ${name}`);
}

/**
 * Atomic processing of a single job.
 * Returns true if a job was found and processed, false if queue is empty.
 */
async function processNextJob(): Promise<boolean> {
  const now = new Date();
  
  // Find oldest pending job and atomically lock it by updating status to processing
  const job = await Job.findOneAndUpdate(
    {
      status: JobStatus.PENDING,
      runAt: { $lte: now },
    },
    {
      $set: {
        status: JobStatus.PROCESSING,
        processedAt: now,
      },
      $inc: {
        attempts: 1,
      },
    },
    {
      new: true,
      sort: { runAt: 1 }, // FIFO: oldest first
    }
  );

  if (!job) {
    return false;
  }

  console.log(`[WORKER] Locked job: ${job.name} (ID: ${job._id}) - Attempt ${job.attempts}/${job.maxAttempts}`);

  const handler = handlers.get(job.name);

  if (!handler) {
    const errorMsg = `No handler registered for job: ${job.name}`;
    console.error(`[WORKER] ${errorMsg}`);
    
    await Job.updateOne(
      { _id: job._id },
      {
        $set: {
          status: JobStatus.FAILED,
          failedAt: new Date(),
          error: errorMsg,
        },
      }
    );
    return true;
  }

  try {
    // Run the registered handler
    await handler(job.data);

    // Update job on success
    await Job.updateOne(
      { _id: job._id },
      {
        $set: {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
        },
      }
    );
    console.log(`[WORKER] Job completed: ${job.name} (ID: ${job._id})`);
  } catch (err: any) {
    const errorMsg = err.message || "Unknown error occurred";
    console.error(`[WORKER] Job failed: ${job.name} (ID: ${job._id}). Error: ${errorMsg}`);

    if (job.attempts >= job.maxAttempts) {
      // Mark as failed permanently if attempts are exhausted
      await Job.updateOne(
        { _id: job._id },
        {
          $set: {
            status: JobStatus.FAILED,
            failedAt: new Date(),
            error: errorMsg,
          },
        }
      );
    } else {
      // Re-queue the job to try again
      await Job.updateOne(
        { _id: job._id },
        {
          $set: {
            status: JobStatus.PENDING,
            error: errorMsg,
          },
        }
      );
    }
  }

  return true;
}

/**
 * Process all pending jobs in a loop until none are left.
 */
export async function processJobs(): Promise<void> {
  console.log("[WORKER] Checking for pending jobs...");
  let hasMore = true;
  while (hasMore) {
    hasMore = await processNextJob();
  }
}

// ─── Register Default Handlers ────────────────────────────────
registerHandler("send-email", async (data) => {
  await sendEmail({
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
  });
});
