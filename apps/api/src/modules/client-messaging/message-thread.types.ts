import { Document, Types } from "mongoose";

export interface MessageThread {
  firmId: Types.ObjectId;
  matterId: Types.ObjectId;
  clientId: Types.ObjectId;
  lastMessageId: Types.ObjectId | null;
  lastMessageAt: Date | null;
  lastMessageBy: Types.ObjectId | null;
  unreadClientCount: number;
  unreadFirmCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageThreadDocument = MessageThread & Document<Types.ObjectId>;

export type SenderType = "FIRM_USER" | "CLIENT";
export type DeliveryStatus = "DELIVERED" | "READ";

export interface MatterMessage {
  threadId: Types.ObjectId;
  firmId: Types.ObjectId;
  matterId: Types.ObjectId;
  senderType: SenderType;
  senderId: Types.ObjectId;
  message: string;
  deliveryStatus: DeliveryStatus;
  deliveredAt: Date | null;
  readAt: Date | null;
  hasAttachments: boolean;
  createdAt: Date;
}

export type MatterMessageDocument = MatterMessage & Document<Types.ObjectId>;

export interface MessageAttachment {
  messageId: Types.ObjectId;
  documentId: Types.ObjectId;
  fileName: string;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
}

export type MessageAttachmentDocument = MessageAttachment & Document<Types.ObjectId>;

export interface ListThreadsFilter {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListMessagesFilter {
  page?: number;
  limit?: number;
}
