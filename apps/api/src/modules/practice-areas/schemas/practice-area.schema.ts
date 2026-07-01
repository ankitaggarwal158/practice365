import mongoose, { Schema } from "mongoose";
import { PracticeAreaDocument } from "../practice-area.types.js";

const practiceAreaSchema = new Schema<PracticeAreaDocument>(
  {
    firmId: { type: Schema.Types.ObjectId, required: true, ref: "Firm", index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    displayOrder: { type: Number, required: true, default: 0 },
    color: { type: String, trim: true, default: "" },
    icon: { type: String, trim: true, default: "" },
    isSystem: { type: Boolean, required: true, default: false },
    isActive: { type: Boolean, required: true, default: true },
    deleted: { type: Boolean, required: true, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "practice_areas" }
);

practiceAreaSchema.index({ firmId: 1, name: 1 }, { unique: true });
practiceAreaSchema.index({ firmId: 1, code: 1 }, { unique: true });
practiceAreaSchema.index({ firmId: 1, displayOrder: 1 });
practiceAreaSchema.index({ firmId: 1, isActive: 1 });

export const PracticeArea = mongoose.model<PracticeAreaDocument>("PracticeArea", practiceAreaSchema);
