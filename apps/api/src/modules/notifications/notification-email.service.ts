export class NotificationEmailService {
  async sendEmailNotification(
    userEmail: string,
    userName: string,
    title: string,
    message: string
  ): Promise<void> {
    // Print mock email log to console for development verification
    console.log(
      `[EMAIL NOTIFICATION SENT] To: ${userName} <${userEmail}>, Subject: "${title}", Body: "${message}"`
    );
  }
}

export const notificationEmailService = new NotificationEmailService();
export default notificationEmailService;
