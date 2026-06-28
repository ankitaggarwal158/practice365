import { Document, Types } from "mongoose";

export interface MatchRecord {
  entityType: "LEAD" | "CLIENT" | "MATTER" | "OPPOSING_PARTY";
  entityId: string;
  entityName: string;
  matchedField: string;
  matchedValue: string;
  similarityScore: number; // 0.0 to 1.0 similarity level
}

export interface ConflictEngineResult {
  overallResult: "NO_CONFLICT" | "POSSIBLE_CONFLICT" | "CONFIRMED_CONFLICT";
  matches: MatchRecord[];
}

export interface ConflictCheckDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  leadId?: Types.ObjectId;
  clientId?: Types.ObjectId;
  matterId?: Types.ObjectId;
  requestedBy: Types.ObjectId;
  reviewedBy?: Types.ObjectId;
  overallResult: "NO_CONFLICT" | "POSSIBLE_CONFLICT" | "CONFIRMED_CONFLICT";
  finalDecision: "PENDING" | "CLEARED" | "WAIVED" | "REJECTED";
  reviewNotes?: string;
  completedAt?: Date;
  createdAt: Date;
  matches: MatchRecord[]; // We store the historical match records inside the check
}

export interface ConflictCheckResponseData {
  id: string;
  firmId: string;
  leadId?: string;
  clientId?: string;
  matterId?: string;
  requestedBy: string;
  requestedByName?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  overallResult: string;
  finalDecision: string;
  reviewNotes: string;
  completedAt?: string;
  createdAt: string;
  matches: MatchRecord[];
}
