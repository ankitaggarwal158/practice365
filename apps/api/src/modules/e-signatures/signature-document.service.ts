import { Types } from "mongoose";
import PDFDocument from "pdfkit";
import { documentRepository } from "../documents/document.repository.js";
import { documentVersionRepository } from "../documents/document-version.repository.js";
import { storageService } from "../documents/storage.service.js";
import { SignatureRequestDocument, SignatureRequestSignerDocument, SignatureEventDocument } from "./signature-request.types.js";
import { SignatureEvent } from "./schemas/signature-event.schema.js";
import { SignatureRequestSigner } from "./schemas/signature-request-signer.schema.js";

export class SignatureDocumentService {
  async generateAndSaveSignedPDF(
    request: SignatureRequestDocument,
    userId: string
  ): Promise<string> {
    const firmId = request.firmId.toString();

    // 1. Fetch signers and audit events
    const signers = await SignatureRequestSigner.find({ requestId: request._id }).sort({ signingOrder: 1 });
    const events = await SignatureEvent.find({ requestId: request._id }).sort({ createdAt: 1 });

    // 2. Fetch original document name if available
    const originalDoc = await documentRepository.findById(request.documentId, request.firmId);
    const docName = originalDoc?.documentName || "document.pdf";

    // 3. Generate PDF Buffer
    const pdfBuffer = await this.buildCertificatePDF(request, docName, signers, events);

    // 4. Save file to storage system
    const originalFilename = `Signed_${docName.replace(/\.pdf$/i, "")}.pdf`;
    const storageResult = await storageService.saveFile(firmId, pdfBuffer, originalFilename);

    // 5. Create Document records
    const docId = new Types.ObjectId();
    const versionId = new Types.ObjectId();

    await documentVersionRepository.create({
      _id: versionId,
      documentId: docId,
      versionNumber: 1,
      storageKey: storageResult.storageKey,
      fileHash: storageResult.fileHash,
      mimeType: "application/pdf",
      fileSize: storageResult.fileSize,
      uploadedBy: new Types.ObjectId(userId),
      notes: `E-Signature completion certificate for request: ${request.requestTitle}`,
    });

    const docMeta = await documentRepository.create({
      _id: docId,
      firmId: request.firmId,
      matterId: request.matterId || null,
      currentVersionId: versionId,
      documentName: originalFilename,
      originalFileName: originalFilename,
      description: `Digitally signed completed copy of document: ${docName}.`,
      category: "Signed Contracts",
      tags: ["signed", "e-signature"],
      mimeType: "application/pdf",
      fileExtension: "pdf",
      fileSize: storageResult.fileSize,
      createdBy: new Types.ObjectId(userId),
    });

    console.log(`[AUDIT] Signed PDF Generated and saved: ID=${docId}, Name=${originalFilename}, RequestID=${request._id}`);
    return docId.toString();
  }

  private buildCertificatePDF(
    request: SignatureRequestDocument,
    originalDocName: string,
    signers: SignatureRequestSignerDocument[],
    events: SignatureEventDocument[]
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // Header Banner
      doc.rect(0, 0, doc.page.width, 100).fill("#101827");
      
      // Document Title
      doc.fillColor("#ffffff")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("PRACTICE365 SIGNING CERTIFICATE", 50, 40);

      // Certificate Details
      doc.fillColor("#000000")
        .fontSize(10)
        .font("Helvetica")
        .text("This document is a legally binding electronic signature audit log.", 50, 120);

      // Section: Request Summary
      doc.fontSize(14)
        .font("Helvetica-Bold")
        .text("Document Request Details", 50, 150);

      doc.fontSize(10)
        .font("Helvetica")
        .text(`Request Title: ${request.requestTitle}`, 50, 175)
        .text(`Original File: ${originalDocName}`, 50, 190)
        .text(`Request Status: ${request.status}`, 50, 205)
        .text(`Signing Mode: ${request.signingMode}`, 50, 220)
        .text(`Completion Date: ${new Date().toUTCString()}`, 50, 235);

      // Divider line
      doc.moveTo(50, 260).lineTo(doc.page.width - 50, 260).strokeColor("#e5e7eb").stroke();

      // Section: Signers and Signatures
      doc.fillColor("#000000")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Signer Details & Digital Signatures", 50, 280);

      let currentY = 305;

      signers.forEach((signer, index) => {
        // Prevent overflowing page
        if (currentY > doc.page.height - 180) {
          doc.addPage();
          currentY = 50;
        }

        doc.fillColor("#111827")
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(`Signer ${index + 1}: ${signer.fullName} (${signer.status})`, 50, currentY);

        doc.fillColor("#4b5563")
          .fontSize(9.5)
          .font("Helvetica")
          .text(`Email: ${signer.email}`, 55, currentY + 18)
          .text(`IP Address: ${signer.signatureIp || "N/A"}`, 55, currentY + 31)
          .text(`User Agent: ${signer.signatureUserAgent || "N/A"}`, 55, currentY + 44)
          .text(`Signed At: ${signer.signedAt ? signer.signedAt.toUTCString() : "N/A"}`, 55, currentY + 57);

        // Render visual signature if present
        if (signer.signatureData && signer.status === "SIGNED") {
          try {
            // Check if signatureData is base64 png
            if (signer.signatureData.startsWith("data:image/png;base64,")) {
              const base64Data = signer.signatureData.split(",")[1];
              const imageBuffer = Buffer.from(base64Data, "base64");
              doc.image(imageBuffer, doc.page.width - 200, currentY + 15, { width: 140, height: 50 });
            } else {
              // Draw signature placeholder styling
              doc.fillColor("#1d4ed8")
                .fontSize(18)
                .font("Courier-Oblique")
                .text(`/s/ ${signer.fullName}`, doc.page.width - 200, currentY + 30);
            }
          } catch (e) {
            // Fallback text
            doc.fillColor("#1d4ed8")
              .fontSize(16)
              .font("Courier-Oblique")
              .text(`/s/ ${signer.fullName}`, doc.page.width - 200, currentY + 30);
          }
        } else {
          doc.fillColor("#9ca3af")
            .fontSize(11)
            .font("Helvetica-Oblique")
            .text("Pending Signature", doc.page.width - 200, currentY + 30);
        }

        // Draw individual divider
        doc.moveTo(50, currentY + 80).lineTo(doc.page.width - 50, currentY + 80).strokeColor("#f3f4f6").stroke();
        currentY += 95;
      });

      // Section: Audit Events
      if (currentY > doc.page.height - 150) {
        doc.addPage();
        currentY = 50;
      }

      doc.fillColor("#000000")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Immutable Audit Trail Events", 50, currentY);

      currentY += 25;

      events.forEach((ev) => {
        if (currentY > doc.page.height - 50) {
          doc.addPage();
          currentY = 50;
        }

        const dateStr = ev.createdAt.toUTCString();
        const detail = ev.metadata?.message || `${ev.eventType}`;

        doc.fillColor("#6b7280")
          .fontSize(8.5)
          .font("Helvetica-Bold")
          .text(dateStr, 50, currentY, { width: 130 });

        doc.fillColor("#111827")
          .fontSize(9)
          .font("Helvetica")
          .text(detail, 190, currentY, { width: doc.page.width - 240 });

        currentY += 20;
      });

      doc.end();
    });
  }
}

export const signatureDocumentService = new SignatureDocumentService();
export default signatureDocumentService;
