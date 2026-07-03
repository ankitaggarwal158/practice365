import bcrypt from "bcryptjs";
import { generateSecureToken, hashToken } from "../auth/auth.tokens.js";
import { portalRepository } from "./portal.repository.js";
import { ClientPortalUser } from "./portal.types.js";
import { PortalStatus } from "./portal.constants.js";

const BCRYPT_SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export const portalPasswordService = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  isAccountLocked(user: ClientPortalUser): boolean {
    if (user.portalStatus === PortalStatus.LOCKED && user.lockedUntil) {
      if (user.lockedUntil > new Date()) {
        return true;
      }
    }
    return false;
  },

  async handleFailedAttempt(user: ClientPortalUser): Promise<void> {
    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    const updates: Partial<ClientPortalUser> = {
      failedLoginAttempts: failedAttempts,
    };

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      updates.portalStatus = PortalStatus.LOCKED;
      updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      console.log(`[AUDIT] Portal User Locked: Email=${user.email}, LockedUntil=${updates.lockedUntil}`);
    }

    await portalRepository.update(user._id, updates);
  },

  async resetFailedAttempts(user: ClientPortalUser): Promise<void> {
    const updates: Partial<ClientPortalUser> = {
      failedLoginAttempts: 0,
      lockedUntil: undefined,
    };
    if (user.portalStatus === PortalStatus.LOCKED) {
      updates.portalStatus = PortalStatus.ACTIVE;
    }
    await portalRepository.update(user._id, updates);
  },

  async generateResetToken(user: ClientPortalUser): Promise<string> {
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await portalRepository.update(user._id, {
      resetTokenHash: tokenHash,
      resetTokenExpiresAt,
    });

    return rawToken;
  },

  async clearResetToken(userId: string): Promise<void> {
    await portalRepository.update(userId, {
      resetTokenHash: undefined,
      resetTokenExpiresAt: undefined,
    });
  }
};
