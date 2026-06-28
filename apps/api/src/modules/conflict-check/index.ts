/**
 * Conflict Check Module
 *
 * Module ID: 022
 * Responsibility: Track entity conflict checks, manual ad-hoc search, and record attorney clearance notes.
 */

export { conflictCheckRouter } from "./conflict-check.routes.js";
export { ConflictCheck } from "./schemas/conflict-check.schema.js";
export * as conflictCheckService from "./conflict-check.service.js";
export type * from "./conflict-check.types.js";
