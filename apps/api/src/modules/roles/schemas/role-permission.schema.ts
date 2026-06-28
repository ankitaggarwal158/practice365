import mongoose, { Schema } from "mongoose";
import { RolePermissionDocument } from "../types/role.types.js";

const rolePermissionSchema = new Schema<RolePermissionDocument>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
    },
    permissionId: {
      type: Schema.Types.ObjectId,
      ref: "Permission",
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "role_permissions",
  }
);

// Prevent duplicate permissions assigned to the same role
rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

export const RolePermission = mongoose.model<RolePermissionDocument>(
  "RolePermission",
  rolePermissionSchema
);
export default RolePermission;
