import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { Matter } from "../matters/schemas/matter.schema.js";
import { recordAuditEvent } from "../audit-log/audit-event.service.js";
import * as messageThreadRepository from "./message-thread.repository.js";
import { messageAttachmentService } from "./message-attachment.service.js";
import { messageNotificationService } from "./message-notification.service.js";
import {
  MessageThreadDocument,
  MatterMessageDocument,
  MessageAttachmentDocument,
  ListThreadsFilter,
  ListMessagesFilter,
} from "./message-thread.types.js";

export class MessageThreadService {
  // ─── Thread Operations ──────────────────────────────────────────

  async getOrCreateThread(
    matterId: string,
    firmId: string
  ): Promise<MessageThreadDocument> {
    const existing = await messageThreadRepository.findThreadByMatterId(matterId, firmId);
    if (existing) {
      return existing;
    }

    // Verify matter exists and belongs to firm
    const matter = await Matter.findOne({
      _id: new Types.ObjectId(matterId),
      firmId: new Types.ObjectId(firmId),
    });

    if (!matter) {
      throw AppError.notFound("Matter not found or access denied.");
    }

    // Create new thread
    const thread = await messageThreadRepository.createThread({
      firmId: new Types.ObjectId(firmId),
      matterId: new Types.ObjectId(matterId),
      clientId: matter.clientId,
      unreadClientCount: 0,
      unreadFirmCount: 0,
      lastMessageId: null,
      lastMessageAt: null,
      lastMessageBy: null,
    });

    return messageThreadRepository.findThreadById(thread._id.toString(), firmId) as Promise<MessageThreadDocument>;
  }

  async getThreadDetails(
    matterId: string,
    firmId: string,
    requester: { type: "FIRM_USER" | "CLIENT"; id: string }
  ): Promise<MessageThreadDocument> {
    const thread = await this.getOrCreateThread(matterId, firmId);

    // Authorization checks
    if (requester.type === "CLIENT") {
      if (thread.clientId.toString() !== requester.id) {
        throw AppError.forbidden("Access denied to this conversation thread.");
      }
    }

    return thread;
  }

  async listThreads(
    firmId: string,
    filter: ListThreadsFilter
  ): Promise<messageThreadRepository.PaginatedDocs<MessageThreadDocument>> {
    return messageThreadRepository.listThreadsForFirm(firmId, filter);
  }

  async listPortalThreads(
    clientId: string,
    firmId: string,
    filter: ListThreadsFilter
  ): Promise<messageThreadRepository.PaginatedDocs<MessageThreadDocument>> {
    return messageThreadRepository.listThreadsForClient(clientId, firmId, filter);
  }

  // ─── Message Operations ──────────────────────────────────────────

  async listMessages(
    matterId: string,
    firmId: string,
    filter: ListMessagesFilter,
    requester: { type: "FIRM_USER" | "CLIENT"; id: string }
  ): Promise<messageThreadRepository.PaginatedDocs<MatterMessageDocument>> {
    const thread = await this.getOrCreateThread(matterId, firmId);

    // Authorization checks
    if (requester.type === "CLIENT") {
      if (thread.clientId.toString() !== requester.id) {
        throw AppError.forbidden("Access denied to this conversation thread.");
      }
    }

    const paginated = await messageThreadRepository.listMessages(thread._id.toString(), filter);

    // Mark messages as read for this recipient
    await messageThreadRepository.markMessagesAsRead(thread._id.toString(), requester.type);

    return paginated;
  }

  async sendMessage(
    firmId: string,
    matterId: string,
    payload: {
      senderType: "FIRM_USER" | "CLIENT";
      senderId: string;
      message: string;
    }
  ): Promise<MatterMessageDocument> {
    const { senderType, senderId, message } = payload;
    if (!message || !message.trim()) {
      throw AppError.badRequest("Message body cannot be empty.");
    }

    const thread = await this.getOrCreateThread(matterId, firmId);

    // Authorization checks
    if (senderType === "CLIENT") {
      if (thread.clientId.toString() !== senderId) {
        throw AppError.forbidden("Access denied. You cannot send messages for this matter.");
      }
    }

    // Create the message
    const msg = await messageThreadRepository.createMessage({
      threadId: thread._id,
      firmId: new Types.ObjectId(firmId),
      matterId: new Types.ObjectId(matterId),
      senderType,
      senderId: new Types.ObjectId(senderId),
      message: message.trim(),
      deliveryStatus: "DELIVERED",
      deliveredAt: new Date(),
      readAt: null,
      hasAttachments: false,
    });

    // Update last message pointer and unread counts
    await messageThreadRepository.updateThreadLastMessage(
      thread._id.toString(),
      msg._id.toString(),
      senderType,
      senderId
    );

    // Record Timeline & Audit Event
    await recordAuditEvent({
      firmId,
      userId: senderType === "FIRM_USER" ? senderId : null,
      module: "Client Messaging",
      entityType: "Matter",
      entityId: matterId,
      action: "Message Sent",
      metadata: {
        threadId: thread._id.toString(),
        messageId: msg._id.toString(),
        senderType,
        senderId,
      },
    });

    // Trigger Notification
    await messageNotificationService.notifyRecipient(
      firmId,
      matterId,
      senderType,
      senderId,
      message
    );

    return msg;
  }

  // ─── Attachment Operations ──────────────────────────────────────────

  async uploadAttachment(
    firmId: string,
    matterId: string,
    senderType: "FIRM_USER" | "CLIENT",
    senderId: string,
    file: Express.Multer.File
  ): Promise<MatterMessageDocument> {
    if (!file) {
      throw AppError.badRequest("No file provided for upload.");
    }

    const thread = await this.getOrCreateThread(matterId, firmId);

    // Authorization checks
    if (senderType === "CLIENT") {
      if (thread.clientId.toString() !== senderId) {
        throw AppError.forbidden("Access denied. You cannot send attachments for this matter.");
      }
    }

    // Create a database placeholder message for the attachment
    const messageText = `Shared file: ${file.originalname}`;
    const msg = await messageThreadRepository.createMessage({
      threadId: thread._id,
      firmId: new Types.ObjectId(firmId),
      matterId: new Types.ObjectId(matterId),
      senderType,
      senderId: new Types.ObjectId(senderId),
      message: messageText,
      deliveryStatus: "DELIVERED",
      deliveredAt: new Date(),
      readAt: null,
      hasAttachments: true,
    });

    // Save attachment details (uploads it to core Document system)
    await messageAttachmentService.saveAttachment(
      firmId,
      senderId,
      msg._id.toString(),
      matterId,
      thread.clientId.toString(),
      file
    );

    // Update last message pointer and unread counts
    await messageThreadRepository.updateThreadLastMessage(
      thread._id.toString(),
      msg._id.toString(),
      senderType,
      senderId
    );

    // Record Timeline & Audit Event
    await recordAuditEvent({
      firmId,
      userId: senderType === "FIRM_USER" ? senderId : null,
      module: "Client Messaging",
      entityType: "Matter",
      entityId: matterId,
      action: "Attachment Uploaded",
      metadata: {
        threadId: thread._id.toString(),
        messageId: msg._id.toString(),
        senderType,
        senderId,
        fileName: file.originalname,
      },
    });

    // Trigger Notification
    await messageNotificationService.notifyRecipient(
      firmId,
      matterId,
      senderType,
      senderId,
      messageText
    );

    return msg;
  }

  async getMessageAttachments(
    messageId: string
  ): Promise<MessageAttachmentDocument[]> {
    return messageThreadRepository.findAttachmentsByMessageId(messageId);
  }
}

export const messageThreadService = new MessageThreadService();
export default messageThreadService;
