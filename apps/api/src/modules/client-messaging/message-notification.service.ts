import { User } from "../users/schemas/user.schema.js";
import { ClientPortalUserModel } from "../client-portal/schemas/client-portal-user.schema.js";
import { Client } from "../clients/schemas/client.schema.js";
import { Matter } from "../matters/schemas/matter.schema.js";
import { notificationEmailService } from "../notifications/notification-email.service.js";

export class MessageNotificationService {
  async notifyRecipient(
    firmId: string,
    matterId: string,
    senderType: "FIRM_USER" | "CLIENT",
    senderId: string,
    messageText: string
  ): Promise<void> {
    try {
      const matter = await Matter.findById(matterId);
      if (!matter) return;

      const preview = messageText.length > 60 ? `${messageText.substring(0, 57)}...` : messageText;

      if (senderType === "CLIENT") {
        // Sent by client -> notify responsible attorney
        const attorneyId = matter.responsibleAttorneyId;
        const attorney = await User.findById(attorneyId);
        if (!attorney) return;

        // Retrieve client details
        const client = await Client.findById(matter.clientId);
        const clientName = client
          ? client.clientType === "INDIVIDUAL"
            ? `${client.firstName || ""} ${client.lastName || ""}`.trim()
            : client.companyName || "Client"
          : "Client";

        const title = `New portal message for Matter: ${matter.title}`;
        const body = `You have received a new message from ${clientName} in the Client Portal regarding Matter: ${matter.title}.\n\nPreview: "${preview}"\n\nAccess your account at: ${process.env.APP_URL || "http://localhost:5173"}/matters/${matterId}`;

        await notificationEmailService.sendEmailNotification(
          attorney.email,
          attorney.displayName || `${attorney.firstName} ${attorney.lastName}`,
          title,
          body
        );
      } else {
        // Sent by firm user -> notify client
        const firmUser = await User.findById(senderId);
        const senderName = firmUser
          ? firmUser.displayName || `${firmUser.firstName} ${firmUser.lastName}`
          : "Your Attorney";

        // Find client portal user email
        const portalUser = await ClientPortalUserModel.findOne({
          clientId: matter.clientId,
          firmId: matter.firmId,
          deleted: false,
        });

        if (!portalUser) {
          console.log(`[NOTIFICATION SKIP] Client portal account not found or active for Client ID: ${matter.clientId}`);
          return;
        }

        const client = await Client.findById(matter.clientId);
        const recipientName = client
          ? `${client.firstName || ""} ${client.lastName || ""}`.trim()
          : "Client";

        const title = `New message from your attorney regarding Matter: ${matter.title}`;
        const body = `Hello ${recipientName},\n\nYou have received a new message from ${senderName} regarding Matter: ${matter.title}.\n\nPreview: "${preview}"\n\nLogin to the Client Portal to read the full message: ${process.env.APP_URL || "http://localhost:5173"}/portal/matters/${matterId}`;

        await notificationEmailService.sendEmailNotification(
          portalUser.email,
          recipientName,
          title,
          body
        );
      }
    } catch (error) {
      console.error("[NOTIFICATION ERROR] Failed to send message email notification:", error);
    }
  }
}

export const messageNotificationService = new MessageNotificationService();
export default messageNotificationService;
