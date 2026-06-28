/**
 * Authentication Module
 *
 * Module ID: 010
 * Responsibility: Identity verification and session management.
 * Does NOT handle authorization — that belongs to Roles & Permissions.
 */

export { authRouter } from "./routes/auth.routes.js";
export { authenticate } from "./middleware/auth.middleware.js";
