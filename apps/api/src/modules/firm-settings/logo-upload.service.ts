import path from "path";
import fs from "fs";
import crypto from "crypto";
import { AppError } from "../../shared/app-error.js";

const LOGO_DIR = path.join(process.cwd(), "uploads", "logos");

async function ensureLogoDir() {
  if (!fs.existsSync(LOGO_DIR)) {
    await fs.promises.mkdir(LOGO_DIR, { recursive: true });
  }
}

export async function uploadLogo(firmId: string, file: Express.Multer.File): Promise<string> {
  if (!file) {
    throw AppError.badRequest("No logo file provided.");
  }

  // 1. Validate file size (2MB limit)
  const maxBytes = 2 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw AppError.badRequest("Logo image size must be less than 2MB.");
  }

  // 2. Validate MIME type
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw AppError.badRequest("Only JPEG, PNG, GIF, and WEBP image files are allowed.");
  }

  await ensureLogoDir();

  // Generate unique filename to replace any old settings cache issues
  const extension = path.extname(file.originalname) || ".png";
  const uniqueName = `${firmId}_logo_${crypto.randomBytes(4).toString("hex")}${extension}`;
  const filePath = path.join(LOGO_DIR, uniqueName);

  await fs.promises.writeFile(filePath, file.buffer);

  // Return the relative serving URL path
  return `/uploads/logos/${uniqueName}`;
}
