import { Types } from "mongoose";
import { DocumentFolder } from "./schemas/document-folder.schema.js";
import { DocumentFolder as IDocumentFolder } from "./document.types.js";

export class DocumentFolderRepository {
  async create(data: Partial<IDocumentFolder>): Promise<IDocumentFolder> {
    const folder = new DocumentFolder(data);
    await folder.save();
    return folder.toObject();
  }

  async findById(id: string | Types.ObjectId, firmId: string | Types.ObjectId): Promise<IDocumentFolder | null> {
    return DocumentFolder.findOne({ _id: id, firmId }).lean();
  }

  async findAllByFirm(firmId: string | Types.ObjectId): Promise<IDocumentFolder[]> {
    return DocumentFolder.find({ firmId }).sort({ displayOrder: 1, folderName: 1 }).lean();
  }

  async update(
    id: string | Types.ObjectId,
    firmId: string | Types.ObjectId,
    data: Partial<IDocumentFolder>
  ): Promise<IDocumentFolder | null> {
    return DocumentFolder.findOneAndUpdate({ _id: id, firmId }, { $set: data }, { new: true }).lean();
  }

  async delete(id: string | Types.ObjectId, firmId: string | Types.ObjectId): Promise<boolean> {
    const result = await DocumentFolder.deleteOne({ _id: id, firmId });
    return result.deletedCount > 0;
  }

  async countChildren(folderId: string | Types.ObjectId, firmId: string | Types.ObjectId): Promise<number> {
    return DocumentFolder.countDocuments({ parentFolderId: folderId, firmId });
  }
}

export const documentFolderRepository = new DocumentFolderRepository();
