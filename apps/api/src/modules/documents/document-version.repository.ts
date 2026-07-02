import { Types } from "mongoose";
import { DocumentVersion } from "./schemas/document-version.schema.js";
import { DocumentVersion as IDocumentVersion } from "./document.types.js";

export class DocumentVersionRepository {
  async create(data: Partial<IDocumentVersion>): Promise<IDocumentVersion> {
    const version = new DocumentVersion(data);
    await version.save();
    return version.toObject();
  }

  async findByDocumentId(documentId: string | Types.ObjectId): Promise<IDocumentVersion[]> {
    return DocumentVersion.find({ documentId }).sort({ versionNumber: -1 }).lean();
  }

  async getNextVersionNumber(documentId: string | Types.ObjectId): Promise<number> {
    const lastVersion = await DocumentVersion.findOne({ documentId }).sort({ versionNumber: -1 }).lean();
    return lastVersion ? lastVersion.versionNumber + 1 : 1;
  }
}

export const documentVersionRepository = new DocumentVersionRepository();
