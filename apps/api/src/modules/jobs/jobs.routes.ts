import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import * as jobsController from "./jobs.controller.js";

const router = Router();

router.post("/jobs/process", asyncHandler(jobsController.processQueue));

export const jobsRouter = router;
export default router;
