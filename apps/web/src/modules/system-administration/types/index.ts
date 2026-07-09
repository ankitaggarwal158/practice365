export interface SystemSettings {
  _id: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  applicationName: string;
  defaultTimezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlag {
  _id: string;
  featureKey: string;
  displayName: string;
  enabled: boolean;
  description: string;
  updatedAt: string;
}

export enum AnnouncementSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export interface SystemAnnouncement {
  _id: string;
  title: string;
  message: string;
  severity: AnnouncementSeverity;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}

export interface SystemHealth {
  db: "CONNECTED" | "DISCONNECTED";
  api: "HEALTHY" | "UNHEALTHY";
  uptime: number;
}
