import { Request, Response } from "express";
import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { User } from "../users/schemas/user.schema.js";
import { messageThreadService } from "./message-thread.service.js";
import { MatterMessageModel } from "./schemas/message.schema.js";
import { MessageThreadModel } from "./schemas/message-thread.schema.js";
import * as messageThreadRepository from "./message-thread.repository.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw AppError.unauthorized("User profile not found.");
  }
  return user.firmId.toString();
}

// ─── Formatters ──────────────────────────────────────────────────

function formatThread(thread: any) {
  return {
    id: thread._id.toString(),
    firmId: thread.firmId.toString(),
    matterId: thread.matterId?._id
      ? {
          id: thread.matterId._id.toString(),
          title: thread.matterId.title,
          matterNumber: thread.matterId.matterNumber,
        }
      : thread.matterId?.toString(),
    clientId: thread.clientId?._id
      ? {
          id: thread.clientId._id.toString(),
          firstName: thread.clientId.firstName || "",
          lastName: thread.clientId.lastName || "",
          companyName: thread.clientId.companyName || "",
          clientType: thread.clientId.clientType,
        }
      : thread.clientId?.toString(),
    lastMessageId: thread.lastMessageId
      ? {
          id: thread.lastMessageId._id.toString(),
          message: thread.lastMessageId.message,
          senderType: thread.lastMessageId.senderType,
          createdAt: thread.lastMessageId.createdAt.toISOString(),
        }
      : null,
    lastMessageAt: thread.lastMessageAt ? thread.lastMessageAt.toISOString() : null,
    lastMessageBy: thread.lastMessageBy?.toString() || null,
    unreadClientCount: thread.unreadClientCount,
    unreadFirmCount: thread.unreadFirmCount,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
  };
}

function formatMessage(msg: any) {
  return {
    id: msg._id.toString(),
    threadId: msg.threadId.toString(),
    firmId: msg.firmId.toString(),
    matterId: msg.matterId.toString(),
    senderType: msg.senderType,
    senderId: msg.senderId.toString(),
    message: msg.message,
    deliveryStatus: msg.deliveryStatus,
    deliveredAt: msg.deliveredAt ? msg.deliveredAt.toISOString() : null,
    readAt: msg.readAt ? msg.readAt.toISOString() : null,
    hasAttachments: msg.hasAttachments,
    createdAt: msg.createdAt.toISOString(),
  };
}

// ─── Firm Staff Controllers ───────────────────────────────────────

export async function listThreads(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { page, limit, search } = req.query as any;

  const paginated = await messageThreadService.listThreads(firmId, {
    page,
    limit,
    search,
  });

  res.status(200).json({
    success: true,
    data: paginated.docs.map(formatThread),
    pagination: {
      page: paginated.page,
      limit: paginated.limit,
      total: paginated.totalDocs,
      pages: paginated.totalPages,
    },
  });
}

export async function getThreadDetails(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { matterId } = req.params as any;
  const userId = req.user!.userId;

  const thread = await messageThreadService.getThreadDetails(matterId, firmId, {
    type: "FIRM_USER",
    id: userId,
  });

  res.status(200).json({
    success: true,
    data: formatThread(thread),
  });
}

export async function listMessages(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { matterId } = req.params as any;
  const { page, limit } = req.query as any;
  const userId = req.user!.userId;

  const paginated = await messageThreadService.listMessages(
    matterId,
    firmId,
    { page, limit },
    { type: "FIRM_USER", id: userId }
  );

  res.status(200).json({
    success: true,
    data: paginated.docs.map(formatMessage),
    pagination: {
      page: paginated.page,
      limit: paginated.limit,
      total: paginated.totalDocs,
      pages: paginated.totalPages,
    },
  });
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { matterId } = req.params as any;
  const { message } = req.body;
  const userId = req.user!.userId;

  const msg = await messageThreadService.sendMessage(firmId, matterId, {
    senderType: "FIRM_USER",
    senderId: userId,
    message,
  });

  res.status(201).json({
    success: true,
    data: formatMessage(msg),
  });
}

export async function uploadAttachment(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { matterId } = req.params as any;
  const userId = req.user!.userId;

  if (!req.file) {
    throw AppError.badRequest("No file uploaded.");
  }

  const msg = await messageThreadService.uploadAttachment(
    firmId,
    matterId,
    "FIRM_USER",
    userId,
    req.file
  );

  res.status(201).json({
    success: true,
    data: formatMessage(msg),
  });
}

// ─── Portal Client Controllers ────────────────────────────────────

export async function listPortalThreads(req: Request, res: Response): Promise<void> {
  if (!req.portalUser) {
    throw AppError.unauthorized();
  }
  const { clientId, firmId } = req.portalUser;
  const { page, limit, search } = req.query as any;

  const paginated = await messageThreadService.listPortalThreads(clientId, firmId, {
    page,
    limit,
    search,
  });

  res.status(200).json({
    success: true,
    data: paginated.docs.map(formatThread),
    pagination: {
      page: paginated.page,
      limit: paginated.limit,
      total: paginated.totalDocs,
      pages: paginated.totalPages,
    },
  });
}

export async function getPortalThreadDetails(req: Request, res: Response): Promise<void> {
  if (!req.portalUser) {
    throw AppError.unauthorized();
  }
  const { clientId, firmId } = req.portalUser;
  const { matterId } = req.params as any;

  const thread = await messageThreadService.getThreadDetails(matterId, firmId, {
    type: "CLIENT",
    id: clientId,
  });

  res.status(200).json({
    success: true,
    data: formatThread(thread),
  });
}

export async function listPortalMessages(req: Request, res: Response): Promise<void> {
  if (!req.portalUser) {
    throw AppError.unauthorized();
  }
  const { clientId, firmId } = req.portalUser;
  const { matterId } = req.params as any;
  const { page, limit } = req.query as any;

  const paginated = await messageThreadService.listMessages(
    matterId,
    firmId,
    { page, limit },
    { type: "CLIENT", id: clientId }
  );

  res.status(200).json({
    success: true,
    data: paginated.docs.map(formatMessage),
    pagination: {
      page: paginated.page,
      limit: paginated.limit,
      total: paginated.totalDocs,
      pages: paginated.totalPages,
    },
  });
}

export async function sendPortalMessage(req: Request, res: Response): Promise<void> {
  if (!req.portalUser) {
    throw AppError.unauthorized();
  }
  const { clientId, firmId } = req.portalUser;
  const { matterId } = req.params as any;
  const { message } = req.body;

  const msg = await messageThreadService.sendMessage(firmId, matterId, {
    senderType: "CLIENT",
    senderId: clientId,
    message,
  });

  res.status(201).json({
    success: true,
    data: formatMessage(msg),
  });
}

export async function uploadPortalAttachment(req: Request, res: Response): Promise<void> {
  if (!req.portalUser) {
    throw AppError.unauthorized();
  }
  const { clientId, firmId } = req.portalUser;
  const { matterId } = req.params as any;

  if (!req.file) {
    throw AppError.badRequest("No file uploaded.");
  }

  const msg = await messageThreadService.uploadAttachment(
    firmId,
    matterId,
    "CLIENT",
    clientId,
    req.file
  );

  res.status(201).json({
    success: true,
    data: formatMessage(msg),
  });
}

// ─── Shared Mark Read Controller ───────────────────────────────────

export async function markMessageRead(req: Request, res: Response): Promise<void> {
  const { id } = req.params as any;

  if (!Types.ObjectId.isValid(id)) {
    throw AppError.badRequest("Invalid Message ID.");
  }

  const messageDoc = await MatterMessageModel.findById(id);
  if (!messageDoc) {
    throw AppError.notFound("Message not found.");
  }

  const thread = await MessageThreadModel.findById(messageDoc.threadId);
  if (!thread) {
    throw AppError.notFound("Message thread not found.");
  }

  // Determine if staff user or portal user and validate authorization
  if (req.user) {
    const firmId = await getRequestingUserFirmId(req);
    if (thread.firmId.toString() !== firmId) {
      throw AppError.forbidden("Access denied.");
    }
    // Only mark read if the sender was a CLIENT
    if (messageDoc.senderType === "CLIENT" && messageDoc.deliveryStatus === "DELIVERED") {
      messageDoc.deliveryStatus = "READ";
      messageDoc.readAt = new Date();
      await messageDoc.save();

      // Decrement unread counts safely (or just set read flags on repository)
      await messageThreadRepository.markMessagesAsRead(thread._id.toString(), "FIRM_USER");
    }
  } else if (req.portalUser) {
    const { clientId, firmId } = req.portalUser;
    if (thread.firmId.toString() !== firmId || thread.clientId.toString() !== clientId) {
      throw AppError.forbidden("Access denied.");
    }
    // Only mark read if the sender was a FIRM_USER
    if (messageDoc.senderType === "FIRM_USER" && messageDoc.deliveryStatus === "DELIVERED") {
      messageDoc.deliveryStatus = "READ";
      messageDoc.readAt = new Date();
      await messageDoc.save();

      await messageThreadRepository.markMessagesAsRead(thread._id.toString(), "CLIENT");
    }
  } else {
    throw AppError.unauthorized();
  }

  res.status(200).json({
    success: true,
    data: { id, deliveryStatus: "READ" },
  });
}

export async function getMessageAttachments(req: Request, res: Response): Promise<void> {
  const { id } = req.params as any;
  const attachments = await messageThreadService.getMessageAttachments(id);
  res.status(200).json({
    success: true,
    data: attachments.map((att) => ({
      id: att._id.toString(),
      messageId: att.messageId.toString(),
      documentId: att.documentId.toString(),
      fileName: att.fileName,
      uploadedBy: att.uploadedBy.toString(),
      createdAt: att.createdAt.toISOString(),
    })),
  });
}

export async function getPortalMessageAttachments(req: Request, res: Response): Promise<void> {
  const { id } = req.params as any;
  const attachments = await messageThreadService.getMessageAttachments(id);
  res.status(200).json({
    success: true,
    data: attachments.map((att) => ({
      id: att._id.toString(),
      messageId: att.messageId.toString(),
      documentId: att.documentId.toString(),
      fileName: att.fileName,
      uploadedBy: att.uploadedBy.toString(),
      createdAt: att.createdAt.toISOString(),
    })),
  });
}
