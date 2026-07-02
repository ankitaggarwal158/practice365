import { Document, Types } from "mongoose";
import { ENTITY_TYPES } from "./note.constants.js";

export type EntityType = typeof ENTITY_TYPES[number];

export interface NoteDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  entityType: EntityType;
  entityId: Types.ObjectId;
  title?: string;
  content: string;
  authorId: Types.ObjectId;
  isPinned: boolean;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
