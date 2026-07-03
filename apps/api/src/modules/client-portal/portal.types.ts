import { Types } from "mongoose";
import { PortalStatus } from "./portal.constants.js";

export interface ClientPortalUser {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  clientId: Types.ObjectId;
  email: string;
  passwordHash: string;
  portalStatus: PortalStatus;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  resetTokenHash?: string;
  resetTokenExpiresAt?: Date;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientPortalSession {
  _id: Types.ObjectId;
  portalUserId: Types.ObjectId;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
}
