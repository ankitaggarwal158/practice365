import { SignatureRequestSignerDocument } from "./signature-request.types.js";
import { config } from "../../config/index.js";
import { enqueue } from "../jobs/service/queue.service.js";

export class SignatureEmailService {
  async sendSigningInvitation(signer: SignatureRequestSignerDocument, requestTitle: string): Promise<void> {
    const link = `${config.corsOrigin}/sign/${signer.token}`;
    await enqueue("send-email", {
      to: signer.email,
      subject: `Signature Request: ${requestTitle}`,
      text: `Hello ${signer.fullName},\n\nYou have been requested to sign the document "${requestTitle}". Click the link below to review and sign:\n\n${link}`,
      html: `<p>Hello ${signer.fullName},</p><p>You have been requested to sign the document "<strong>${requestTitle}</strong>".</p><p>Click the link below to review and sign:</p><p><a href="${link}">${link}</a></p>`,
    });
  }

  async sendSigningReminder(signer: SignatureRequestSignerDocument, requestTitle: string): Promise<void> {
    const link = `${config.corsOrigin}/sign/${signer.token}`;
    await enqueue("send-email", {
      to: signer.email,
      subject: `REMINDER: Signature Request: ${requestTitle}`,
      text: `Hello ${signer.fullName},\n\nThis is a reminder to sign the document "${requestTitle}". Click the link below to review and sign:\n\n${link}`,
      html: `<p>Hello ${signer.fullName},</p><p>This is a reminder to sign the document "<strong>${requestTitle}</strong>".</p><p>Click the link below to review and sign:</p><p><a href="${link}">${link}</a></p>`,
    });
  }
}

export const signatureEmailService = new SignatureEmailService();
export default signatureEmailService;
