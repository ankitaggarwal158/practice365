import mongoose, { Schema } from "mongoose";
import { UserRoleDocument } from "../types/role.types.js";

const userRoleSchema = new Schema<UserRoleDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "user_roles",
  }
);

// Prevent duplicate role assignments to the same user
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

export const UserRole = mongoose.model<UserRoleDocument>("UserRole", userRoleSchema);
export default UserRole;
