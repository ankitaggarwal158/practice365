import { Types } from "mongoose";
import { LeadActivity } from "./schemas/lead.schema.js";

export async function logActivity(
  leadId: string,
  userId: string,
  activityType:
    | "CREATED"
    | "UPDATED"
    | "ASSIGNED"
    | "CONTACTED"
    | "CONSULTATION_SCHEDULED"
    | "CONSULTATION_COMPLETED"
    | "ENGAGEMENT_SENT"
    | "STATUS_CHANGED"
    | "LOST"
    | "CONVERTED",
  description: string,
  metadata?: any
): Promise<void> {
  await LeadActivity.create({
    leadId: new Types.ObjectId(leadId),
    userId: new Types.ObjectId(userId),
    activityType,
    description,
    metadata,
  });
}
