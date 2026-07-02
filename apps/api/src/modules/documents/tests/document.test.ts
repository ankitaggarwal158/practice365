import { describe, it, before, after, mock } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../../../database/connection.js";
import { documentFolderService } from "../document-folder.service.js";
import { documentUploadService } from "../document-upload.service.js";
import { documentSearchService } from "../document-search.service.js";
import { documentVersionService } from "../document-version.service.js";
import { storageService } from "../storage.service.js";

describe("Document Management Module", () => {
  let firmId: string;
  let userId: string;
  let folderId: string;
  let documentId: string;

  before(async () => {
    await connectDatabase();
    firmId = new mongoose.Types.ObjectId().toString();
    userId = new mongoose.Types.ObjectId().toString();

    // Mock storage service to prevent actual file writes during tests
    mock.method(storageService, "saveFile", async () => {
      return {
        storageKey: `mocked_key_${Date.now()}.txt`,
        fileHash: "mockhash",
        fileSize: 1024,
      };
    });
    mock.method(storageService, "deleteFile", async () => {});
    mock.method(storageService, "getFileStream", () => null);
  });

  after(async () => {
    await mongoose.connection.collection("document_folders").deleteMany({ firmId });
    await mongoose.connection.collection("documents").deleteMany({ firmId });
    await mongoose.connection.collection("document_versions").deleteMany({}); // No firmId on versions
    await disconnectDatabase();
  });

  it("should create a folder", async () => {
    const folder = await documentFolderService.createFolder(firmId, userId, {
      folderName: "Case Files",
    });
    assert.ok(folder._id);
    assert.strictEqual(folder.folderName, "Case Files");
    folderId = folder._id.toString();
  });

  it("should upload a new document to the folder", async () => {
    const file = {
      buffer: Buffer.from("test content"),
      originalname: "test.pdf",
      mimetype: "application/pdf",
      size: 1024,
    } as Express.Multer.File;

    const doc = await documentUploadService.uploadDocument(firmId, userId, file, {
      folderId,
      category: "Evidence",
      description: "A test file",
    });

    assert.ok(doc._id);
    assert.strictEqual(doc.documentName, "test.pdf");
    assert.strictEqual(doc.category, "Evidence");
    assert.ok(doc.currentVersionId);
    documentId = doc._id.toString();
  });

  it("should list documents and find the uploaded document", async () => {
    const result = await documentSearchService.searchDocuments(firmId, { folderId });
    assert.strictEqual(result.total, 1);
    assert.strictEqual(result.data[0].documentName, "test.pdf");
  });

  it("should upload a new version of the document", async () => {
    const newFile = {
      buffer: Buffer.from("updated content"),
      originalname: "test_v2.pdf",
      mimetype: "application/pdf",
      size: 2048,
    } as Express.Multer.File;

    const updatedDoc = await documentVersionService.uploadNewVersion(firmId, userId, documentId, newFile, "Fixes typo");
    assert.ok(updatedDoc);
    assert.strictEqual(updatedDoc.fileSize, 2048);
  });

  it("should retrieve version history containing 2 versions", async () => {
    const versions = await documentVersionService.getVersions(firmId, documentId);
    assert.strictEqual(versions.length, 2);
    assert.strictEqual(versions[0].versionNumber, 2); // newest first
    assert.strictEqual(versions[1].versionNumber, 1);
  });

  it("should soft delete the document", async () => {
    await documentSearchService.softDelete(firmId, documentId, userId);
    
    // Search should exclude deleted
    const result = await documentSearchService.searchDocuments(firmId, { folderId });
    assert.strictEqual(result.total, 0);
    assert.strictEqual(result.data.length, 0);
  });
});
