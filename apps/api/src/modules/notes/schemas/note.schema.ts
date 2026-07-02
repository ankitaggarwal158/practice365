import mongoose, { Schema } from "mongoose";
import { ENTITY_TYPES } from "../note.constants.js";
import { NoteDocument } from "../note.types.js";

const noteSchema = new Schema<NoteDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      ref: "Firm",
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ENTITY_TYPES,
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Single field indexes from specification
noteSchema.index({ createdAt: -1 });

// Composite indexes
noteSchema.index({ firmId: 1, entityType: 1, entityId: 1 });

export const Note = mongoose.model<NoteDocument>("Note", noteSchema, "notes");
