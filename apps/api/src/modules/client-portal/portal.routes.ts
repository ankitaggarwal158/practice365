import { Router } from "express";
import { portalAuthController } from "./portal-auth.controller.js";
import { portalAuthenticate } from "./portal-auth.middleware.js";
import { validateRequest } from "../../shared/validate.js";
import {
  PortalLoginSchema,
  PortalForgotPasswordSchema,
  PortalResetPasswordSchema,
  PortalProfileUpdateSchema,
} from "./portal.validation.js";

const router = Router();

// Guest Auth Endpoints
router.post("/portal/login", validateRequest(PortalLoginSchema), portalAuthController.login);
router.post("/portal/logout", portalAuthController.logout);
router.post("/portal/refresh", portalAuthController.refresh);
router.post("/portal/forgot-password", validateRequest(PortalForgotPasswordSchema), portalAuthController.forgotPassword);
router.post("/portal/reset-password", validateRequest(PortalResetPasswordSchema), portalAuthController.resetPassword);

// Guarded Client Portal Endpoints
router.use("/portal", portalAuthenticate);

router.get("/profile", portalAuthController.getProfile);
router.patch("/profile", validateRequest(PortalProfileUpdateSchema), portalAuthController.updateProfile);

router.get("/matters", portalAuthController.getMatters);
router.get("/matters/:id", portalAuthController.getMatterDetails);

router.get("/documents", portalAuthController.getDocuments);
router.get("/documents/:id/download", portalAuthController.downloadDocument);

router.get("/invoices", portalAuthController.getInvoices);
router.get("/invoices/:id/download", portalAuthController.downloadInvoicePDF);

export const portalRouter = router;
export default router;
