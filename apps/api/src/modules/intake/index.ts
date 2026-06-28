/**
 * Intake Module
 *
 * Module ID: 020
 * Responsibility: Capture prospective client enquiries, notes, attachments, and lead conversions.
 */

export { intakeRouter } from "./intake.routes.js";
export { Intake, IntakeNote, IntakeAttachment } from "./schemas/intake.schema.js";
export type * from "./intake.types.js";
