import { Types } from "mongoose";
import { MessageThreadModel } from "./schemas/message-thread.schema.js";
import { MatterMessageModel } from "./schemas/message.schema.js";
import { MessageAttachmentModel } from "./schemas/message-attachment.schema.js";
import {
  MessageThreadDocument,
  MatterMessageDocument,
  MessageAttachmentDocument,
  ListThreadsFilter,
  ListMessagesFilter,
} from "./message-thread.types.js";

export interface PaginatedDocs<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

// ─── Thread Operations ──────────────────────────────────────────

export async function findThreadByMatterId(
  matterId: string,
  firmId: string
): Promise<MessageThreadDocument | null> {
  if (!Types.ObjectId.isValid(matterId) || !Types.ObjectId.isValid(firmId)) {
    return null;
  }
  return MessageThreadModel.findOne({
    matterId: new Types.ObjectId(matterId),
    firmId: new Types.ObjectId(firmId),
  })
    .populate("lastMessageId")
    .populate("matterId", "title matterNumber")
    .populate("clientId", "firstName lastName companyName clientType")
    .exec();
}

export async function findThreadById(
  id: string,
  firmId: string
): Promise<MessageThreadDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) {
    return null;
  }
  return MessageThreadModel.findOne({
    _id: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
  })
    .populate("lastMessageId")
    .populate("matterId", "title matterNumber")
    .populate("clientId", "firstName lastName companyName clientType")
    .exec();
}

export async function createThread(
  payload: Partial<MessageThreadDocument>
): Promise<MessageThreadDocument> {
  return MessageThreadModel.create(payload);
}

export async function listThreadsForFirm(
  firmId: string,
  filter: ListThreadsFilter
): Promise<PaginatedDocs<MessageThreadDocument>> {
  const page = filter.page || 1;
  const limit = filter.limit || 25;
  const skip = (page - 1) * limit;

  const query: any = {
    firmId: new Types.ObjectId(firmId),
  };

  const [docs, totalDocs] = await Promise.all([
    MessageThreadModel.find(query)
      .populate("lastMessageId")
      .populate("matterId", "title matterNumber")
      .populate("clientId", "firstName lastName companyName clientType")
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    MessageThreadModel.countDocuments(query),
  ]);

  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages: Math.ceil(totalDocs / limit) || 1,
  };
}

export async function listThreadsForClient(
  clientId: string,
  firmId: string,
  filter: ListThreadsFilter
): Promise<PaginatedDocs<MessageThreadDocument>> {
  const page = filter.page || 1;
  const limit = filter.limit || 25;
  const skip = (page - 1) * limit;

  const query: any = {
    clientId: new Types.ObjectId(clientId),
    firmId: new Types.ObjectId(firmId),
  };

  const [docs, totalDocs] = await Promise.all([
    MessageThreadModel.find(query)
      .populate("lastMessageId")
      .populate("matterId", "title matterNumber")
      .populate("clientId", "firstName lastName companyName clientType")
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    MessageThreadModel.countDocuments(query),
  ]);

  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages: Math.ceil(totalDocs / limit) || 1,
  };
}

// ─── Message Operations ──────────────────────────────────────────

export async function createMessage(
  payload: Partial<MatterMessageDocument>
): Promise<MatterMessageDocument> {
  return MatterMessageModel.create(payload);
}

export async function listMessages(
  threadId: string,
  filter: ListMessagesFilter
): Promise<PaginatedDocs<MatterMessageDocument>> {
  const page = filter.page || 1;
  const limit = filter.limit || 50;
  const skip = (page - 1) * limit;

  const query = {
    threadId: new Types.ObjectId(threadId),
  };

  const [docs, totalDocs] = await Promise.all([
    MatterMessageModel.find(query)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    MatterMessageModel.countDocuments(query),
  ]);

  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages: Math.ceil(totalDocs / limit) || 1,
  };
}

export async function markMessagesAsRead(
  threadId: string,
  recipientType: "FIRM_USER" | "CLIENT"
): Promise<void> {
  const targetSenderType = recipientType === "FIRM_USER" ? "CLIENT" : "FIRM_USER";
  const now = new Date();

  await MatterMessageModel.updateMany(
    {
      threadId: new Types.ObjectId(threadId),
      senderType: targetSenderType,
      deliveryStatus: "DELIVERED",
    },
    {
      $set: {
        deliveryStatus: "READ",
        readAt: now,
      },
    }
  );

  // Update thread unread count
  const threadUpdate: any = {};
  if (recipientType === "FIRM_USER") {
    threadUpdate.unreadFirmCount = 0;
  } else {
    threadUpdate.unreadClientCount = 0;
  }

  await MessageThreadModel.updateOne(
    { _id: new Types.ObjectId(threadId) },
    { $set: threadUpdate }
  );
}

export async function updateThreadLastMessage(
  threadId: string,
  messageId: string,
  senderType: "FIRM_USER" | "CLIENT",
  senderId: string
): Promise<void> {
  const mId = new Types.ObjectId(messageId);
  const sId = new Types.ObjectId(senderId);
  const now = new Date();

  const incUpdate: any = {};
  if (senderType === "FIRM_USER") {
    incUpdate.unreadClientCount = 1;
  } else {
    incUpdate.unreadFirmCount = 1;
  }

  await MessageThreadModel.updateOne(
    { _id: new Types.ObjectId(threadId) },
    {
      $set: {
        lastMessageId: mId,
        lastMessageAt: now,
        lastMessageBy: sId,
      },
      $inc: incUpdate,
    }
  );
}

// ─── Attachment Operations ──────────────────────────────────────────

export async function createAttachment(
  payload: Partial<MessageAttachmentDocument>
): Promise<MessageAttachmentDocument> {
  return MessageAttachmentModel.create(payload);
}

export async function findAttachmentsByMessageId(
  messageId: string
): Promise<MessageAttachmentDocument[]> {
  if (!Types.ObjectId.isValid(messageId)) return [];
  return MessageAttachmentModel.find({
    messageId: new Types.ObjectId(messageId),
  })
    .populate("documentId")
    .exec();
}
