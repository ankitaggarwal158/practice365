import { Request, Response } from "express";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";
import { signatureRequestService } from "./signature-request.service.js";
import { signingService } from "./signing.service.js";
import { documentDownloadService } from "../documents/document-download.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId.toString();
}

export function formatSignatureRequest(request: any) {
  return {
    id: request._id.toString(),
    firmId: request.firmId.toString(),
    matterId: request.matterId ? request.matterId.toString() : null,
    documentId: request.documentId.toString(),
    signedDocumentId: request.signedDocumentId ? request.signedDocumentId.toString() : null,
    requestTitle: request.requestTitle,
    signingMode: request.signingMode,
    status: request.status,
    expiresAt: request.expiresAt ? request.expiresAt.toISOString() : null,
    completedAt: request.completedAt ? request.completedAt.toISOString() : null,
    cancelledAt: request.cancelledAt ? request.cancelledAt.toISOString() : null,
    cancelledBy: request.cancelledBy ? request.cancelledBy.toString() : null,
    createdBy: request.createdBy.toString(),
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}

export function formatSigner(signer: any) {
  return {
    id: signer._id.toString(),
    requestId: signer.requestId.toString(),
    fullName: signer.fullName,
    email: signer.email,
    signingOrder: signer.signingOrder,
    status: signer.status,
    viewedAt: signer.viewedAt ? signer.viewedAt.toISOString() : null,
    signedAt: signer.signedAt ? signer.signedAt.toISOString() : null,
    declinedAt: signer.declinedAt ? signer.declinedAt.toISOString() : null,
    signatureIp: signer.signatureIp,
    signatureUserAgent: signer.signatureUserAgent,
  };
}

export function formatEvent(event: any) {
  return {
    id: event._id.toString(),
    requestId: event.requestId.toString(),
    signerId: event.signerId ? event.signerId.toString() : null,
    eventType: event.eventType,
    metadata: event.metadata,
    createdAt: event.createdAt.toISOString(),
  };
}

export async function listRequests(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { matterId, documentId, status, search, page, limit } = req.query;

  const pageNum = page ? parseInt(String(page)) : 1;
  const limitNum = limit ? parseInt(String(limit)) : 50;
  const skip = (pageNum - 1) * limitNum;

  const filter = {
    matterId: matterId ? String(matterId) : undefined,
    documentId: documentId ? String(documentId) : undefined,
    status: status ? String(status) : undefined,
    search: search ? String(search) : undefined,
  };

  const paginated = await signatureRequestService.listRequests(firmId, filter, skip, limitNum);

  res.status(200).json({
    success: true,
    data: paginated.data.map(formatSignatureRequest),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: paginated.total,
      pages: Math.ceil(paginated.total / limitNum),
    },
  });
}

export async function getRequest(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;

  const details = await signatureRequestService.getRequestDetails(id, firmId);
  if (!details) {
    throw AppError.notFound("Signature request not found.");
  }

  res.status(200).json({
    success: true,
    data: {
      request: formatSignatureRequest(details.request),
      signers: details.signers.map(formatSigner),
      events: details.events.map(formatEvent),
    },
  });
}

export async function createRequest(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;

  const details = await signatureRequestService.createRequest(firmId, userId, req.body);

  res.status(201).json({
    success: true,
    data: {
      request: formatSignatureRequest(details!.request),
      signers: details!.signers.map(formatSigner),
      events: details!.events.map(formatEvent),
    },
  });
}

export async function sendRequest(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const id = req.params.id as string;

  const details = await signatureRequestService.sendRequest(id, firmId, userId);

  res.status(200).json({
    success: true,
    data: {
      request: formatSignatureRequest(details!.request),
      signers: details!.signers.map(formatSigner),
      events: details!.events.map(formatEvent),
    },
  });
}

export async function cancelRequest(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const id = req.params.id as string;

  const details = await signatureRequestService.cancelRequest(id, firmId, userId);

  res.status(200).json({
    success: true,
    data: {
      request: formatSignatureRequest(details!.request),
      signers: details!.signers.map(formatSigner),
      events: details!.events.map(formatEvent),
    },
  });
}

export async function sendReminders(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;

  const result = await signatureRequestService.sendReminders(id, firmId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
}

export async function softDeleteRequest(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const id = req.params.id as string;

  await signatureRequestService.softDeleteRequest(id, firmId, userId);

  res.status(200).json({
    success: true,
    message: "Signature request deleted successfully.",
  });
}

export async function loadSigningSession(req: Request, res: Response): Promise<void> {
  const token = req.params.token as string;
  const session = await signingService.loadSigningSession(token);

  res.status(200).json({
    success: true,
    data: {
      request: formatSignatureRequest(session.request),
      signer: formatSigner(session.signer),
      documentName: session.documentName,
      documentId: session.documentId.toString(),
    },
  });
}

export async function submitSignature(req: Request, res: Response): Promise<void> {
  const token = req.params.token as string;
  const { signature } = req.body;
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "Unknown Browser";

  const status = await signingService.submitSignature(token, {
    signatureData: signature,
    ip,
    userAgent,
  });

  res.status(200).json({
    success: true,
    data: {
      status,
    },
  });
}

export async function downloadSignedDocument(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;

  const details = await signatureRequestService.getRequestDetails(id, firmId);
  if (!details) {
    throw AppError.notFound("Signature request not found.");
  }

  if (details.request.status !== "COMPLETED" || !details.request.signedDocumentId) {
    throw AppError.badRequest("Completed signed document is not compiled yet.");
  }

  const download = await documentDownloadService.getDownloadStream(
    firmId,
    details.request.signedDocumentId.toString()
  );

  const disposition = req.query.preview === "true" ? "inline" : "attachment";
  res.setHeader("Content-Type", download.mimeType);
  res.setHeader("Content-Disposition", `${disposition}; filename="${download.fileName}"`);
  res.setHeader("Content-Length", download.fileSize);

  download.stream.pipe(res);
}
