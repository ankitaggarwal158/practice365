import { portalRepository } from "./portal.repository.js";
import { portalPasswordService } from "./portal-password.service.js";
import { portalSessionService } from "./portal-session.service.js";
import { PortalStatus } from "./portal.constants.js";
import { AppError } from "../../shared/app-error.js";
import { hashToken } from "../auth/auth.tokens.js";
import { config } from "../../config/index.js";
import { enqueue } from "../jobs/service/queue.service.js";

export const portalAuthService = {
  async login(
    email: string,
    password: string,
    meta: { ipAddress: string; userAgent: string }
  ) {
    const user = await portalRepository.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized("Invalid email or password.");
    }

    if (user.portalStatus === PortalStatus.DISABLED) {
      throw AppError.forbidden("Your portal access has been disabled.");
    }

    if (user.portalStatus === PortalStatus.PENDING) {
      throw AppError.forbidden("Your portal account is pending activation.");
    }

    // Check Lockout
    if (portalPasswordService.isAccountLocked(user)) {
      throw AppError.forbidden(`This account is locked. Please try again after ${new Date(user.lockedUntil!).toLocaleTimeString()}.`);
    }

    // Check if lockout has expired
    if (user.portalStatus === PortalStatus.LOCKED && user.lockedUntil && user.lockedUntil <= new Date()) {
      await portalPasswordService.resetFailedAttempts(user);
    }

    const isPasswordValid = await portalPasswordService.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await portalPasswordService.handleFailedAttempt(user);
      throw AppError.unauthorized("Invalid email or password.");
    }

    // Success - Reset attempts & create session
    await portalPasswordService.resetFailedAttempts(user);
    await portalRepository.update(user._id, { lastLoginAt: new Date() });

    const sessionData = await portalSessionService.createSession(
      user._id.toString(),
      user.clientId._id.toString(),
      user.firmId.toString(),
      meta
    );

    console.log(`[AUDIT] Portal User Logged In: ID=${user._id}, Email=${user.email}`);

    return {
      ...sessionData,
      user: {
        id: user._id.toString(),
        clientId: user.clientId._id.toString(),
        firmId: user.firmId.toString(),
        email: user.email,
      },
    };
  },

  async logout(refreshToken: string) {
    const session = await portalRepository.findSessionByToken(refreshToken);
    if (session) {
      await portalSessionService.revokeSession(refreshToken);
      console.log(`[AUDIT] Portal User Logged Out: PortalUserId=${session.portalUserId}`);
    }
  },

  async forgotPassword(email: string) {
    const user = await portalRepository.findByEmail(email);
    if (!user) {
      // Return success to prevent enumeration
      console.log(`[WARN] Portal Password Reset requested for non-existent email: ${email}`);
      return;
    }

    const rawToken = await portalPasswordService.generateResetToken(user);
    
    // Enqueue email sending job
    const resetLink = `${config.corsOrigin}/portal/reset-password?token=${rawToken}`;
    await enqueue("send-email", {
      to: email,
      subject: "Reset your Practice365 Client Portal Password",
      text: `Hello,\n\nYou requested a password reset for your Practice365 Client Portal account. Click the link below to set a new password:\n\n${resetLink}\n\nThis link will expire in 1 hour. If you did not request this reset, you can safely ignore this email.`,
      html: `<p>Hello,</p><p>You requested a password reset for your Practice365 Client Portal account. Click the link below to set a new password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link will expire in 1 hour. If you did not request this reset, you can safely ignore this email.</p>`,
    });
  },

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = hashToken(rawToken);
    const user = await portalRepository.findByResetToken(tokenHash);
    if (!user) {
      throw AppError.badRequest("Invalid or expired reset token.");
    }

    const passwordHash = await portalPasswordService.hashPassword(newPassword);
    
    await portalRepository.update(user._id, {
      passwordHash,
      passwordChangedAt: new Date(),
      resetTokenHash: undefined,
      resetTokenExpiresAt: undefined,
    });

    // Revoke all sessions for this user to force re-auth
    await portalRepository.deleteSessionsForUser(user._id);

    console.log(`[AUDIT] Portal User Password Reset Successful: ID=${user._id}`);
  }
};
