import fs from "fs";
import path from "path";
import crypto from "crypto";
import { promisify } from "util";
import { Readable } from "stream";
import { AppError } from "../../shared/app-error.js";

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "documents");

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}
ensureUploadDir().catch(console.error);

export class StorageService {
  async saveFile(firmId: string, fileBuffer: Buffer, originalName: string): Promise<{ storageKey: string; fileHash: string; fileSize: number }> {
    const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const extension = path.extname(originalName);
    const uniqueFilename = `${firmId}_${Date.now()}_${crypto.randomBytes(8).toString("hex")}${extension}`;
    const storageKey = path.join(UPLOAD_DIR, uniqueFilename);

    await fs.promises.writeFile(storageKey, fileBuffer);

    return {
      storageKey,
      fileHash,
      fileSize: fileBuffer.length,
    };
  }

  async deleteFile(storageKey: string): Promise<void> {
    try {
      await unlink(storageKey);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw AppError.internal("Failed to delete file from storage");
      }
    }
  }

  getFileStream(storageKey: string): Readable {
    if (!fs.existsSync(storageKey)) {
      throw AppError.notFound("File not found in storage");
    }
    return fs.createReadStream(storageKey);
  }
}

export const storageService = new StorageService();
