import mongoose, { Schema } from "mongoose";
import { FeatureFlagDocument } from "../system-settings.types.js";

const featureFlagSchema = new Schema<FeatureFlagDocument>(
  {
    featureKey: { type: String, required: true, unique: true, index: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    enabled: { type: Boolean, required: true, default: false },
    description: { type: String, default: "", trim: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: "feature_flags",
  }
);

export const FeatureFlagModel = mongoose.model<FeatureFlagDocument>("FeatureFlag", featureFlagSchema);
export default FeatureFlagModel;
