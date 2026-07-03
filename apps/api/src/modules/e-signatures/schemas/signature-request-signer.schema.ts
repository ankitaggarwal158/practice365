import mongoose, { Schema } from "mongoose";
import { SignatureRequestSignerDocument } from "../signature-request.types.js";
import { SIGNER_STATUS } from "../signature-request.constants.js";

const signatureRequestSignerSchema = new Schema<SignatureRequestSignerDocument>(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "SignatureRequest",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    signingOrder: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SIGNER_STATUS),
      default: SIGNER_STATUS.PENDING,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: null,
    },
    signedAt: {
      type: Date,
      default: null,
    },
    declinedAt: {
      type: Date,
      default: null,
    },
    signatureIp: {
      type: String,
      default: null,
    },
    signatureUserAgent: {
      type: String,
      default: null,
    },
    signatureData: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to search for signers of a request in order
signatureRequestSignerSchema.index({ requestId: 1, signingOrder: 1 });

export const SignatureRequestSigner = mongoose.model<SignatureRequestSignerDocument>(
  "SignatureRequestSigner",
  signatureRequestSignerSchema,
  "signature_request_signers"
);
