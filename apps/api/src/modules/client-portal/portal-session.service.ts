import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { config } from "../../config/index.js";
import { portalRepository } from "./portal.repository.js";
import { generateRefreshToken } from "../auth/auth.tokens.js";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export interface PortalJwtPayload {
  portalUserId: string;
  clientId: string;
  firmId: string;
  sessionId: string;
}

export const portalSessionService = {
  generateAccessToken(payload: PortalJwtPayload): string {
    return jwt.sign(payload, config.jwtAccessSecret, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  },

  verifyAccessToken(token: string): PortalJwtPayload | null {
    try {
      return jwt.verify(token, config.jwtAccessSecret) as PortalJwtPayload;
    } catch {
      return null;
    }
  },

  async createSession(
    portalUserId: string,
    clientId: string,
    firmId: string,
    meta: { ipAddress: string; userAgent: string }
  ) {
    const rawRefreshToken = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    const session = await portalRepository.createSession({
      portalUserId: new Types.ObjectId(portalUserId),
      refreshToken: rawRefreshToken,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      expiresAt,
    });

    const accessToken = this.generateAccessToken({
      portalUserId,
      clientId,
      firmId,
      sessionId: session._id.toString(),
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 15 * 60, // 15 mins in seconds
    };
  },

  async refreshSession(
    refreshToken: string,
    meta: { ipAddress: string; userAgent: string }
  ) {
    const session = await portalRepository.findSessionByToken(refreshToken);
    if (!session) {
      throw new Error("Invalid refresh token.");
    }
    if (session.expiresAt < new Date()) {
      await portalRepository.deleteSession(refreshToken);
      throw new Error("Refresh token expired.");
    }

    const user = session.portalUserId as any;
    if (!user || user.deleted || user.portalStatus !== "ACTIVE") {
      throw new Error("User account is inactive or deleted.");
    }

    // Rotate refresh token
    const newRawRefreshToken = generateRefreshToken();
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    session.refreshToken = newRawRefreshToken;
    session.ipAddress = meta.ipAddress;
    session.userAgent = meta.userAgent;
    session.expiresAt = newExpiresAt;
    await (session as any).save();

    const accessToken = this.generateAccessToken({
      portalUserId: user._id.toString(),
      clientId: user.clientId.toString(),
      firmId: user.firmId.toString(),
      sessionId: session._id.toString(),
    });

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
      expiresIn: 15 * 60,
    };
  },

  async revokeSession(refreshToken: string) {
    await portalRepository.deleteSession(refreshToken);
  }
};
