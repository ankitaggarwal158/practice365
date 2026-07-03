import mongoose, { Schema } from "mongoose";
import { ClientPortalUser } from "../portal.types.js";
import { PortalStatus } from "../portal.constants.js";

const ClientPortalUserSchema = new Schema<ClientPortalUser>(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    portalStatus: { 
      type: String, 
      enum: Object.values(PortalStatus), 
      default: PortalStatus.PENDING, 
      required: true,
      index: true 
    },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
    failedLoginAttempts: { type: Number, default: 0, required: true },
    lockedUntil: { type: Date },
    resetTokenHash: { type: String },
    resetTokenExpiresAt: { type: Date },
    deleted: { type: Boolean, default: false, required: true },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for uniqueness within firm and client lookup
ClientPortalUserSchema.index({ firmId: 1, email: 1 }, { unique: true });
ClientPortalUserSchema.index({ firmId: 1, clientId: 1 });

export const ClientPortalUserModel = mongoose.model<ClientPortalUser>(
  "ClientPortalUser",
  ClientPortalUserSchema,
  "client_portal_users"
);
