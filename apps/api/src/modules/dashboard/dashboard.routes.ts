import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import * as dashboardController from "./dashboard.controller.js";

const router = Router();

// Apply authentication to all dashboard endpoints
router.use(authenticate);

router.get("/dashboard", asyncHandler(dashboardController.getDashboardSummary));
router.get("/dashboard/widgets", asyncHandler(dashboardController.getDashboardWidgets));
router.get("/dashboard/activity", asyncHandler(dashboardController.getDashboardActivity));
router.get("/dashboard/quick-actions", asyncHandler(dashboardController.getQuickActions));

export const dashboardRouter = router;
