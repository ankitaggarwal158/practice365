import nodemailer from "nodemailer";
import { config } from "../../config/index.js";

export interface SendEmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: nodemailer.Transporter | null = null;

if (config.smtpHost && config.smtpUser && config.smtpPass) {
  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

export async function sendEmail(payload: SendEmailPayload): Promise<void> {
  const mailOptions = {
    from: config.smtpFrom,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`[EMAIL] Email successfully sent to ${payload.to}`);
    } catch (err: any) {
      console.error(`[EMAIL] Failed to send email to ${payload.to}:`, err.message);
      throw err;
    }
  } else {
    console.log("-----------------------------------------");
    console.log("[EMAIL] (SMTP MOCK FALLBACK) Email Content:");
    console.log(`From:    ${config.smtpFrom}`);
    console.log(`To:      ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log("-----------------------------------------");
    console.log(payload.text);
    console.log("-----------------------------------------");
  }
}
