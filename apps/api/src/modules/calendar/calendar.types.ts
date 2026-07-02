import { Document, Types } from "mongoose";

export type EventType =
  | "COURT_DATE"
  | "HEARING"
  | "MEETING"
  | "DEADLINE"
  | "APPOINTMENT"
  | "REMINDER"
  | "INTERNAL_EVENT"
  | "OTHER";

export type EventStatus =
  | "UPCOMING"
  | "COMPLETED"
  | "MISSED"
  | "CANCELLED";

export interface CalendarEventDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  matterId?: Types.ObjectId | null;
  title: string;
  description: string;
  eventType: EventType;
  startDateTime: Date;
  endDateTime: Date;
  allDay: boolean;
  location: string;
  assignedUsers: Types.ObjectId[];
  reminderOffsets: number[];
  status: EventStatus;
  completedAt?: Date | null;
  completedBy?: Types.ObjectId | null;
  deleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
