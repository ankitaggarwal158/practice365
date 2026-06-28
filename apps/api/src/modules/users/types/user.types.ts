import { Types, Document } from "mongoose";

export enum UserStatus {
  PENDING_INVITATION = "PENDING_INVITATION",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DEACTIVATED = "DEACTIVATED",
}

export enum TimeFormat {
  TWELVE = "12",
  TWENTY_FOUR = "24",
}

export interface NotificationPreferences {
  email: boolean;
  marketing?: boolean;
}

export interface UserPreferences {
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: TimeFormat;
  notificationPreferences: NotificationPreferences;
}

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  jobTitle?: string;
  status: UserStatus;
  
  // Preferences
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: TimeFormat;
  notificationPreferences: NotificationPreferences;

  // Authentication Fields (from Auth module stub)
  passwordHash: string;
  isEmailVerified: boolean;
  isDisabled: boolean;
  failedLoginAttempts: number;
  lockoutUntil: Date | null;

  // Invitation Info
  invitedBy?: Types.ObjectId;
  invitationSentAt?: Date;
  invitationAcceptedAt?: Date;

  // Timestamps / Audit
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvitationTokenDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  firmId: Types.ObjectId;
  tokenHash: string;
  email: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Request Interfaces ──────────────────────────────────────

export interface InviteUserRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
}

export interface ChangeStatusRequest {
  status: UserStatus;
}

export interface UpdatePreferencesRequest {
  timezone?: string;
  language?: string;
  dateFormat?: string;
  timeFormat?: TimeFormat;
  notificationPreferences?: Partial<NotificationPreferences>;
}

export interface UpdateOwnProfileRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  jobTitle?: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password?: string;
}

// ─── Response Interfaces ─────────────────────────────────────

export interface UserResponseData {
  id: string;
  firmId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  jobTitle?: string;
  status: UserStatus;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: TimeFormat;
  notificationPreferences: NotificationPreferences;
  invitedBy?: string;
  invitationSentAt?: string;
  invitationAcceptedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UserListResponseData {
  users: UserResponseData[];
  pagination: PaginationMeta;
}
