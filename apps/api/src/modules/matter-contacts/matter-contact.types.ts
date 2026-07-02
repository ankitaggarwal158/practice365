import { Document, Types } from "mongoose";
import { CONTACT_TYPES, CONTACT_ROLES } from "./matter-contact.constants.js";

export type ContactType = typeof CONTACT_TYPES[number];
export type ContactRole = typeof CONTACT_ROLES[number];

export interface MatterContactDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  contactType: ContactType;
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
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatterContactLinkDocument extends Document {
  _id: Types.ObjectId;
  matterId: Types.ObjectId;
  contactId: Types.ObjectId;
  role: ContactRole;
  createdBy: Types.ObjectId;
  createdAt: Date;
}
