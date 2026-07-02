import mongoose, { Schema } from "mongoose";
import { CONTACT_ROLES } from "../matter-contact.constants.js";
import { MatterContactLinkDocument } from "../matter-contact.types.js";

const matterContactLinkSchema = new Schema<MatterContactLinkDocument>({
  matterId: {
    type: Schema.Types.ObjectId,
    ref: "Matter",
    required: true,
    index: true,
  },
  contactId: {
    type: Schema.Types.ObjectId,
    ref: "MatterContact",
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: CONTACT_ROLES,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a contact is linked to a matter only once
matterContactLinkSchema.index({ matterId: 1, contactId: 1 }, { unique: true });

export const MatterContactLink = mongoose.model<MatterContactLinkDocument>(
  "MatterContactLink",
  matterContactLinkSchema,
  "matter_contact_links"
);
