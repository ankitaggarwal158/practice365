import { Document, Types } from "mongoose";
import { PartyType } from "./opposing-party.constants.js";

export interface OpposingPartyDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  partyType: PartyType;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  isActive: boolean;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatterOpposingPartyDocument extends Document {
  _id: Types.ObjectId;
  matterId: Types.ObjectId;
  opposingPartyId: Types.ObjectId;
  role?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
}

export interface CreateOpposingPartyRequest {
  partyType: PartyType;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
}

export interface UpdateOpposingPartyRequest {
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
}

export interface AssociateMatterRequest {
  opposingPartyIds: string[];
}

export interface OpposingPartyResponseData {
  id: string;
  firmId: string;
  partyType: PartyType;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MatterAssociationResponseData {
  id: string;
  matterId: string;
  opposingPartyId: string;
  role?: string;
  opposingParty?: OpposingPartyResponseData;
  createdAt: string;
}
