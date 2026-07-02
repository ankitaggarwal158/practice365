import { Document, Types } from "mongoose";

export interface PracticeAreaDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  name: string;
  code: string;
  description: string;
  displayOrder: number;
  color: string;
  icon: string;
  defaultHourlyRate: number;
  isSystem: boolean;
  isActive: boolean;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePracticeAreaRequest {
  name: string;
  code: string;
  description?: string;
  color?: string;
  icon?: string;
  defaultHourlyRate?: number;
}

export interface UpdatePracticeAreaRequest {
  name?: string;
  description?: string;
  displayOrder?: number;
  color?: string;
  icon?: string;
  defaultHourlyRate?: number;
}

export interface PracticeAreaReorderItem {
  id: string;
  displayOrder: number;
}

export interface ReorderPracticeAreasRequest {
  practiceAreas: PracticeAreaReorderItem[];
}

export interface PracticeAreaResponseData {
  id: string;
  firmId: string;
  name: string;
  code: string;
  description: string;
  displayOrder: number;
  color: string;
  icon: string;
  defaultHourlyRate: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
