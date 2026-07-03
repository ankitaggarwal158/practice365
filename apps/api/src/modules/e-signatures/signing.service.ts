import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { SignatureRequest } from "./schemas/signature-request.schema.js";
import { SignatureRequestSigner } from "./schemas/signature-request-signer.schema.js";
import { SignatureEvent } from "./schemas/signature-event.schema.js";
import { REQUEST_STATUS, SIGNING_MODE, SIGNER_STATUS, EVENT_TYPE } from "./signature-request.constants.js";
import { signatureDocumentService } from "./signature-document.service.js";
import { signatureEmailService } from "./signature-email.service.js";
import { documentRepository } from "../documents/document.repository.js";

export class SigningService {
  async loadSigningSession(token: string) {
    // 1. Find signer
    const signer = await SignatureRequestSigner.findOne({ token });
    if (!signer) {
      throw AppError.notFound("Invalid or expired signing link.");
    }

    // 2. Find request
    const request = await SignatureRequest.findOne({ _id: signer.requestId, deleted: false });
    if (!request) {
      throw AppError.notFound("Signature request has been deleted.");
    }

    // 3. Validate status
    if (request.status === REQUEST_STATUS.CANCELLED) {
      throw AppError.badRequest("This signature request has been cancelled by the firm.");
    }
    if (request.status === REQUEST_STATUS.EXPIRED) {
      throw AppError.badRequest("This signature request has expired.");
    }
    if (request.expiresAt && request.expiresAt.getTime() < Date.now()) {
      request.status = REQUEST_STATUS.EXPIRED;
      await request.save();
      throw AppError.badRequest("This signature request has expired.");
    }

    // 4. Validate sequential order
    if (request.signingMode === SIGNING_MODE.SEQUENTIAL) {
      // Find all signers for this request
      const allSigners = await SignatureRequestSigner.find({ requestId: request._id }).sort({ signingOrder: 1 });
      
      // Ensure all signers with a lower signingOrder have status === SIGNED
      const previousUnsigned = allSigners.filter(
        (s) => s.signingOrder < signer.signingOrder && s.status !== SIGNER_STATUS.SIGNED
      );

      if (previousUnsigned.length > 0) {
        throw AppError.forbidden("It is not your turn to sign this document yet.");
      }
    }

    // 5. Update Status to VIEWED if PENDING
    if (signer.status === SIGNER_STATUS.PENDING) {
      signer.status = SIGNER_STATUS.VIEWED;
      signer.viewedAt = new Date();
      await signer.save();

      // If request is still SENT, set to VIEWED
      if (request.status === REQUEST_STATUS.SENT) {
        request.status = REQUEST_STATUS.VIEWED;
        await request.save();
      }

      await SignatureEvent.create({
        requestId: request._id,
        signerId: signer._id,
        eventType: EVENT_TYPE.VIEWED,
        metadata: { message: `Document viewed by signer: ${signer.fullName} (${signer.email}).` },
      });
    }

    // 6. Get Document Metadata for display
    const docMeta = await documentRepository.findById(request.documentId, request.firmId);

    return {
      request,
      signer,
      documentName: docMeta?.documentName || "document.pdf",
      documentId: request.documentId,
    };
  }

  async submitSignature(
    token: string,
    payload: { signatureData: string; ip: string; userAgent: string }
  ) {
    const session = await this.loadSigningSession(token);
    const { request, signer } = session;

    if (signer.status === SIGNER_STATUS.SIGNED) {
      throw AppError.badRequest("You have already signed this document.");
    }

    // Update signer info
    signer.status = SIGNER_STATUS.SIGNED;
    signer.signedAt = new Date();
    signer.signatureIp = payload.ip;
    signer.signatureUserAgent = payload.userAgent;
    signer.signatureData = payload.signatureData;
    await signer.save();

    await SignatureEvent.create({
      requestId: request._id,
      signerId: signer._id,
      eventType: EVENT_TYPE.SIGNED,
      metadata: {
        message: `Signature applied by signer: ${signer.fullName} (${signer.email}).`,
        ip: payload.ip,
        userAgent: payload.userAgent,
      },
    });

    // Check progress
    const allSigners = await SignatureRequestSigner.find({ requestId: request._id }).sort({ signingOrder: 1 });
    const totalCount = allSigners.length;
    const signedCount = allSigners.filter((s) => s.status === SIGNER_STATUS.SIGNED).length;

    if (signedCount === totalCount) {
      // Completed!
      request.status = REQUEST_STATUS.COMPLETED;
      request.completedAt = new Date();
      await request.save();

      // Generate completed signed PDF
      const completedDocumentId = await signatureDocumentService.generateAndSaveSignedPDF(
        request,
        request.createdBy.toString()
      );

      request.signedDocumentId = new Types.ObjectId(completedDocumentId);
      await request.save();

      await SignatureEvent.create({
        requestId: request._id,
        eventType: EVENT_TYPE.COMPLETED,
        metadata: { message: "All signatures obtained. Completed signed PDF document compiled." },
      });
    } else {
      // Partially signed
      request.status = REQUEST_STATUS.PARTIALLY_SIGNED;
      await request.save();

      // If sequential, invite the next signer
      if (request.signingMode === SIGNING_MODE.SEQUENTIAL) {
        const nextSigner = allSigners.find((s) => s.signingOrder === signer.signingOrder + 1);
        if (nextSigner) {
          await signatureEmailService.sendSigningInvitation(nextSigner, request.requestTitle);
          await SignatureEvent.create({
            requestId: request._id,
            signerId: nextSigner._id,
            eventType: EVENT_TYPE.EMAIL_DELIVERED,
            metadata: { message: `Signing invitation sent to next sequential signer: ${nextSigner.fullName} (${nextSigner.email}).` },
          });
        }
      }
    }

    return request.status;
  }
}

export const signingService = new SigningService();
export default signingService;
