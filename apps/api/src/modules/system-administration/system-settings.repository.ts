import { Types } from "mongoose";
import SystemSettingsModel from "./schemas/system-settings.schema.js";
import FeatureFlagModel from "./schemas/feature-flag.schema.js";
import SystemAnnouncementModel from "./schemas/announcement.schema.js";

// ─── Settings Repository ─────────────────────────────────────
export async function getSettings() {
  let settings = await SystemSettingsModel.findOne();
  if (!settings) {
    settings = await SystemSettingsModel.create({
      maintenanceMode: false,
      maintenanceMessage: "System is currently undergoing maintenance. Please try again later.",
      applicationName: "Practice365",
      defaultTimezone: "UTC",
    });
  }
  return settings;
}

export async function updateSettings(data: any) {
  const settings = await getSettings();
  Object.assign(settings, data);
  await settings.save();
  return settings;
}

// ─── Feature Flags Repository ─────────────────────────────────
export async function listFeatureFlags() {
  return FeatureFlagModel.find().sort({ featureKey: 1 });
}

export async function findFeatureFlagById(id: string) {
  if (!Types.ObjectId.isValid(id)) return null;
  return FeatureFlagModel.findById(id);
}

export async function findFeatureFlagByKey(key: string) {
  return FeatureFlagModel.findOne({ featureKey: key });
}

export async function upsertFeatureFlag(key: string, data: any, userId: string) {
  return FeatureFlagModel.findOneAndUpdate(
    { featureKey: key },
    { ...data, updatedBy: new Types.ObjectId(userId) },
    { new: true, upsert: true }
  );
}

export async function updateFeatureFlag(id: string, enabled: boolean, userId: string) {
  return FeatureFlagModel.findByIdAndUpdate(
    id,
    { enabled, updatedBy: new Types.ObjectId(userId) },
    { new: true }
  );
}

// ─── Announcements Repository ─────────────────────────────────
export async function listAnnouncements(includeDeleted = false) {
  const query: any = includeDeleted ? {} : { deletedAt: null };
  return SystemAnnouncementModel.find(query).sort({ createdAt: -1 });
}

export async function listActiveAnnouncements() {
  const now = new Date();
  return SystemAnnouncementModel.find({
    startsAt: { $lte: now },
    expiresAt: { $gte: now },
    deletedAt: null,
  }).sort({ startsAt: -1 });
}

export async function findAnnouncementById(id: string) {
  if (!Types.ObjectId.isValid(id)) return null;
  return SystemAnnouncementModel.findOne({ _id: new Types.ObjectId(id), deletedAt: null });
}

export async function createAnnouncement(data: any, userId: string) {
  return SystemAnnouncementModel.create({
    ...data,
    createdBy: new Types.ObjectId(userId),
  });
}

export async function updateAnnouncement(id: string, data: any) {
  return SystemAnnouncementModel.findOneAndUpdate(
    { _id: new Types.ObjectId(id), deletedAt: null },
    data,
    { new: true }
  );
}

export async function softDeleteAnnouncement(id: string) {
  return SystemAnnouncementModel.findOneAndUpdate(
    { _id: new Types.ObjectId(id), deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );
}
