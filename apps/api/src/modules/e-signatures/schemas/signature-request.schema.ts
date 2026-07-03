import mongoose, { Schema } from "mongoose";
import { SignatureRequestDocument } from "../signature-request.types.js";
import { REQUEST_STATUS, SIGNING_MODE } from "../signature-request.constants.js";

const signatureRequestSchema = new Schema<SignatureRequestDocument>(
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
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "DocumentMeta",
      required: true,
      index: true,
    },
    signedDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "DocumentMeta",
      default: null,
    },
    requestTitle: {
      type: String,
      required: true,
      trim: true,
    },
    signingMode: {
      type: String,
      enum: Object.values(SIGNING_MODE),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.DRAFT,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
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

// Composite indexes
signatureRequestSchema.index({ firmId: 1, status: 1 });
signatureRequestSchema.index({ firmId: 1, matterId: 1 });

export const SignatureRequest = mongoose.model<SignatureRequestDocument>(
  "SignatureRequest",
  signatureRequestSchema,
  "signature_requests"
);
