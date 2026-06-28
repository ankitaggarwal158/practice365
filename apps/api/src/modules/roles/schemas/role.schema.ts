import mongoose, { Schema } from "mongoose";
import { RoleDocument } from "../types/role.types.js";

const roleSchema = new Schema<RoleDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      ref: "Firm",
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isSystemRole: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "roles",
  }
);

// Ensure role names are unique within a firm (firmId can be null for system roles)
roleSchema.index({ firmId: 1, name: 1 }, { unique: true });

export const Role = mongoose.model<RoleDocument>("Role", roleSchema);
export default Role;
