import mongoose, { Schema } from "mongoose";
import { CalendarEventDocument } from "../calendar.types.js";

const calendarEventSchema = new Schema<CalendarEventDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      ref: "Firm",
      required: true,
      index: true,
    },
    matterId: {
      type: Schema.Types.ObjectId,
      ref: "Matter",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    eventType: {
      type: String,
      enum: [
        "COURT_DATE",
        "HEARING",
        "MEETING",
        "DEADLINE",
        "APPOINTMENT",
        "REMINDER",
        "INTERNAL_EVENT",
        "OTHER",
      ],
      required: true,
    },
    startDateTime: {
      type: Date,
      required: true,
      index: true,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    assignedUsers: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    reminderOffsets: {
      type: [Number],
      default: [],
    },
    status: {
      type: String,
      enum: ["UPCOMING", "COMPLETED", "MISSED", "CANCELLED"],
      required: true,
      default: "UPCOMING",
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Single field indexes from specification
calendarEventSchema.index({ assignedUsers: 1 });

// Composite indexes
calendarEventSchema.index({ firmId: 1, startDateTime: 1 });
calendarEventSchema.index({ firmId: 1, assignedUsers: 1 });

export const CalendarEvent = mongoose.model<CalendarEventDocument>(
  "CalendarEvent",
  calendarEventSchema,
  "calendar_events"
);
