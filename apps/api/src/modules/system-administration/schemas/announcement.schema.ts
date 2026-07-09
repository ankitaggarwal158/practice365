import mongoose, { Schema } from "mongoose";
import { SystemAnnouncementDocument, AnnouncementSeverity } from "../system-settings.types.js";

const systemAnnouncementSchema = new Schema<SystemAnnouncementDocument>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: Object.values(AnnouncementSeverity),
      required: true,
      default: AnnouncementSeverity.INFO,
    },
    startsAt: { type: Date, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "system_announcements",
  }
);

export const SystemAnnouncementModel = mongoose.model<SystemAnnouncementDocument>("SystemAnnouncement", systemAnnouncementSchema);
export default SystemAnnouncementModel;
