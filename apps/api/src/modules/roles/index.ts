/**
 * Roles & Permissions Module
 *
 * Module ID: 012
 * Responsibility: Centralized Role-Based Access Control (RBAC) definition, evaluation, and enforcement.
 */

export { rolesRouter } from "./routes/role.routes.js";
export { requirePermission } from "./middleware/authorization.middleware.js";
export { seedSystemPermissionsAndRoles, hasPermission } from "./service/permission.service.js";
export { Role } from "./schemas/role.schema.js";
export { Permission } from "./schemas/permission.schema.js";
export { RolePermission } from "./schemas/role-permission.schema.js";
export { UserRole } from "./schemas/user-role.schema.js";
export type * from "./types/role.types.js";
