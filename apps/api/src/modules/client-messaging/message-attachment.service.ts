import { documentUploadService } from "../documents/document-upload.service.js";
import * as messageThreadRepository from "./message-thread.repository.js";
import { MessageAttachmentDocument } from "./message-thread.types.js";

export class MessageAttachmentService {
  async saveAttachment(
    firmId: string,
    senderId: string,
    messageId: string,
    matterId: string,
    clientId: string,
    file: Express.Multer.File
  ): Promise<MessageAttachmentDocument> {
    // 1. Save document to Document Management system
    const documentMeta = await documentUploadService.uploadDocument(
      firmId,
      senderId,
      file,
      {
        matterId,
        clientId,
        category: "Client Communication",
        description: `Uploaded via Client Messaging for Matter: ${matterId}`,
      }
    );

    // 2. Link the uploaded document to the message
    const attachment = await messageThreadRepository.createAttachment({
      messageId: new Object(messageId) as any,
      documentId: documentMeta._id,
      fileName: file.originalname,
      uploadedBy: new Object(senderId) as any,
    });

    return attachment;
  }
}

export const messageAttachmentService = new MessageAttachmentService();
export default messageAttachmentService;
