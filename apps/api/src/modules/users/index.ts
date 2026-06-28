/**
 * User Management Module
 *
 * Module ID: 011
 * Responsibility: Managing internal firm users, profiles, preferences, status, and invitations.
 */

export { userRouter } from "./routes/user.routes.js";
export { User } from "./schemas/user.schema.js";
export { formatUser } from "./service/user.service.js";
export { findById, findByEmail } from "./repository/user.repository.js";
export type { UserDocument } from "./types/user.types.js";
