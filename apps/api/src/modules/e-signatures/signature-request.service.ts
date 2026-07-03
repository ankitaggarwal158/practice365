import crypto from "crypto";
import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { documentRepository } from "../documents/document.repository.js";
import { SignatureRequest } from "./schemas/signature-request.schema.js";
import { SignatureRequestSigner } from "./schemas/signature-request-signer.schema.js";
import { SignatureEvent } from "./schemas/signature-event.schema.js";
import { REQUEST_STATUS, SIGNING_MODE, SIGNER_STATUS, EVENT_TYPE } from "./signature-request.constants.js";
import { signatureRequestRepository } from "./signature-request.repository.js";
import { signatureEmailService } from "./signature-email.service.js";
import { CreateSignatureRequestPayload } from "./signature-request.types.js";

export class SignatureRequestService {
  async createRequest(
    firmId: string,
    userId: string,
    payload: CreateSignatureRequestPayload
  ) {
    // 1. Verify document exists, belongs to this firm, and is not deleted
    const document = await documentRepository.findById(payload.documentId, firmId);
    if (!document) {
      throw AppError.notFound("Reference document not found in the firm directory.");
    }

    // 2. Map and validate signers
    if (!payload.signers || payload.signers.length === 0) {
      throw AppError.badRequest("At least one signer must be specified for a request.");
    }

    const request = await signatureRequestRepository.create({
      firmId: new Types.ObjectId(firmId),
      matterId: payload.matterId ? new Types.ObjectId(payload.matterId) : null,
      documentId: new Types.ObjectId(payload.documentId),
      requestTitle: payload.requestTitle || `Signature Request - ${document.documentName}`,
      signingMode: payload.signingMode || SIGNING_MODE.PARALLEL,
      status: REQUEST_STATUS.DRAFT,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
      createdBy: new Types.ObjectId(userId),
    });

    const signersToSave = payload.signers.map((s, idx) => {
      const order = payload.signingMode === SIGNING_MODE.SEQUENTIAL
        ? (s.signingOrder || idx + 1)
        : 1;

      return {
        requestId: request._id,
        fullName: s.fullName,
        email: s.email.toLowerCase().trim(),
        signingOrder: order,
        status: SIGNER_STATUS.PENDING,
        token: crypto.randomBytes(32).toString("hex"),
      };
    });

    await SignatureRequestSigner.insertMany(signersToSave);

    // Record audit event
    await SignatureEvent.create({
      requestId: request._id,
      eventType: EVENT_TYPE.CREATED,
      metadata: { message: `Signature request created by User: ${userId}.` },
    });

    return this.getRequestDetails(request._id.toString(), firmId);
  }

  async sendRequest(requestId: string, firmId: string, userId: string) {
    const request = await signatureRequestRepository.findById(requestId, firmId);
    if (!request) {
      throw AppError.notFound("Signature request not found.");
    }

    if (request.status !== REQUEST_STATUS.DRAFT) {
      throw AppError.badRequest("Only draft requests can be sent.");
    }

    // Check if expiresAt is in the past
    if (request.expiresAt && request.expiresAt.getTime() < Date.now()) {
      throw AppError.badRequest("Cannot send a request with an expiration date in the past.");
    }

    request.status = REQUEST_STATUS.SENT;
    await request.save();

    const signers = await SignatureRequestSigner.find({ requestId: request._id }).sort({ signingOrder: 1 });

    // Send invitations
    if (request.signingMode === SIGNING_MODE.SEQUENTIAL) {
      // Invite only the first signer
      const firstSigner = signers.find((s) => s.signingOrder === 1);
      if (firstSigner) {
        await signatureEmailService.sendSigningInvitation(firstSigner, request.requestTitle);
        await SignatureEvent.create({
          requestId: request._id,
          signerId: firstSigner._id,
          eventType: EVENT_TYPE.EMAIL_DELIVERED,
          metadata: { message: `Signing invitation sent to first signer: ${firstSigner.fullName} (${firstSigner.email}).` },
        });
      }
    } else {
      // Invite everyone in parallel
      for (const signer of signers) {
        await signatureEmailService.sendSigningInvitation(signer, request.requestTitle);
        await SignatureEvent.create({
          requestId: request._id,
          signerId: signer._id,
          eventType: EVENT_TYPE.EMAIL_DELIVERED,
          metadata: { message: `Signing invitation sent to parallel signer: ${signer.fullName} (${signer.email}).` },
        });
      }
    }

    await SignatureEvent.create({
      requestId: request._id,
      eventType: EVENT_TYPE.SENT,
      metadata: { message: `Signature request sent for signing by User: ${userId}.` },
    });

    return this.getRequestDetails(requestId, firmId);
  }

  async cancelRequest(requestId: string, firmId: string, userId: string) {
    const request = await signatureRequestRepository.findById(requestId, firmId);
    if (!request) {
      throw AppError.notFound("Signature request not found.");
    }

    if ([REQUEST_STATUS.COMPLETED, REQUEST_STATUS.CANCELLED, REQUEST_STATUS.DECLINED].includes(request.status as any)) {
      throw AppError.badRequest(`Cannot cancel a signature request in ${request.status} status.`);
    }

    request.status = REQUEST_STATUS.CANCELLED;
    request.cancelledAt = new Date();
    request.cancelledBy = new Types.ObjectId(userId);
    await request.save();

    await SignatureEvent.create({
      requestId: request._id,
      eventType: EVENT_TYPE.CANCELLED,
      metadata: { message: `Signature request cancelled by User: ${userId}.` },
    });

    return this.getRequestDetails(requestId, firmId);
  }

  async sendReminders(requestId: string, firmId: string) {
    const request = await signatureRequestRepository.findById(requestId, firmId);
    if (!request) {
      throw AppError.notFound("Signature request not found.");
    }

    if (![REQUEST_STATUS.SENT, REQUEST_STATUS.VIEWED, REQUEST_STATUS.PARTIALLY_SIGNED].includes(request.status as any)) {
      throw AppError.badRequest("Can only send reminders for active, unsigned requests.");
    }

    const signers = await SignatureRequestSigner.find({ requestId: request._id }).sort({ signingOrder: 1 });

    if (request.signingMode === SIGNING_MODE.SEQUENTIAL) {
      // Find the current active signer
      const activeSigner = signers.find((s) => s.status === SIGNER_STATUS.PENDING || s.status === SIGNER_STATUS.VIEWED);
      if (activeSigner) {
        await signatureEmailService.sendSigningReminder(activeSigner, request.requestTitle);
      }
    } else {
      // Remind all pending parallel signers
      const pendingSigners = signers.filter((s) => s.status === SIGNER_STATUS.PENDING || s.status === SIGNER_STATUS.VIEWED);
      for (const signer of pendingSigners) {
        await signatureEmailService.sendSigningReminder(signer, request.requestTitle);
      }
    }

    return { success: true, message: "Reminders dispatched successfully." };
  }

  async softDeleteRequest(requestId: string, firmId: string, userId: string) {
    const request = await signatureRequestRepository.findById(requestId, firmId);
    if (!request) {
      throw AppError.notFound("Signature request not found.");
    }

    const deleted = await signatureRequestRepository.softDelete(requestId, firmId, userId);
    return { success: deleted };
  }

  async getRequestDetails(requestId: string, firmId: string) {
    const request = await signatureRequestRepository.findById(requestId, firmId);
    if (!request) {
      return null;
    }

    const signers = await SignatureRequestSigner.find({ requestId: request._id }).sort({ signingOrder: 1 });
    const events = await SignatureEvent.find({ requestId: request._id }).sort({ createdAt: -1 });

    return {
      request,
      signers,
      events,
    };
  }

  async listRequests(firmId: string, filters: any, skip: number, limit: number) {
    return signatureRequestRepository.list(firmId, filters, skip, limit);
  }
}

export const signatureRequestService = new SignatureRequestService();
export default signatureRequestService;
