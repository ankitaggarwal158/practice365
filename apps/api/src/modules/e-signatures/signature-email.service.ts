import { SignatureRequestSignerDocument } from "./signature-request.types.js";

export class SignatureEmailService {
  async sendSigningInvitation(signer: SignatureRequestSignerDocument, requestTitle: string): Promise<void> {
    const link = `http://localhost:5173/sign/${signer.token}`;
    console.log(
      `[SIGNING INVITATION SENT] To: ${signer.fullName} <${signer.email}>, Request: "${requestTitle}", Link: ${link}`
    );
  }

  async sendSigningReminder(signer: SignatureRequestSignerDocument, requestTitle: string): Promise<void> {
    const link = `http://localhost:5173/sign/${signer.token}`;
    console.log(
      `[SIGNING REMINDER SENT] To: ${signer.fullName} <${signer.email}>, Request: "${requestTitle}", Link: ${link}`
    );
  }
}

export const signatureEmailService = new SignatureEmailService();
export default signatureEmailService;
