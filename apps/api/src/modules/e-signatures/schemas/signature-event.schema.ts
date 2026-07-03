import mongoose, { Schema } from "mongoose";
import { SignatureEventDocument } from "../signature-request.types.js";
import { EVENT_TYPE } from "../signature-request.constants.js";

const signatureEventSchema = new Schema<SignatureEventDocument>(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "SignatureRequest",
      required: true,
      index: true,
    },
    signerId: {
      type: Schema.Types.ObjectId,
      ref: "SignatureRequestSigner",
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      enum: Object.values(EVENT_TYPE),
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

signatureEventSchema.index({ createdAt: -1 });

export const SignatureEvent = mongoose.model<SignatureEventDocument>(
  "SignatureEvent",
  signatureEventSchema,
  "signature_events"
);
