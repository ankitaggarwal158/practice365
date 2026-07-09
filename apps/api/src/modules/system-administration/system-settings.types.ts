import { Document, Types } from "mongoose";

export interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  applicationName: string;
  defaultTimezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SystemSettingsDocument = SystemSettings & Document;

export interface FeatureFlag {
  featureKey: string;
  displayName: string;
  enabled: boolean;
  description: string;
  updatedBy: Types.ObjectId;
  updatedAt: Date;
}

export type FeatureFlagDocument = FeatureFlag & Document;

export enum AnnouncementSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export interface SystemAnnouncement {
  title: string;
  message: string;
  severity: AnnouncementSeverity;
  startsAt: Date;
  expiresAt: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  deletedAt?: Date;
}

export type SystemAnnouncementDocument = SystemAnnouncement & Document;
