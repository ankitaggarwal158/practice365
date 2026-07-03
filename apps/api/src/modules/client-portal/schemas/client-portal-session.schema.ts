import mongoose, { Schema } from "mongoose";
import { ClientPortalSession } from "../portal.types.js";

const ClientPortalSessionSchema = new Schema<ClientPortalSession>(
  {
    portalUserId: { 
      type: Schema.Types.ObjectId, 
      ref: "ClientPortalUser", 
      required: true, 
      index: true 
    },
    refreshToken: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ClientPortalSessionModel = mongoose.model<ClientPortalSession>(
  "ClientPortalSession",
  ClientPortalSessionSchema,
  "client_portal_sessions"
);
