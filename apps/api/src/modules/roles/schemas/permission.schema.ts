import mongoose, { Schema } from "mongoose";
import { PermissionDocument } from "../types/role.types.js";

const permissionSchema = new Schema<PermissionDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "permissions",
  }
);

export const Permission = mongoose.model<PermissionDocument>("Permission", permissionSchema);
export default Permission;
