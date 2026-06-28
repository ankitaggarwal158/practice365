/**
 * Lead Management Module
 *
 * Module ID: 021
 * Responsibility: Track business opportunities, notes, activities, attachments, and conversions.
 */

export { leadRouter } from "./lead.routes.js";
export { Lead, LeadNote, LeadActivity, LeadAttachment } from "./schemas/lead.schema.js";
export * as leadService from "./lead.service.js";
export type * from "./lead.types.js";
