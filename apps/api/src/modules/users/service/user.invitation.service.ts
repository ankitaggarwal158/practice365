import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { AppError } from "../../../shared/app-error.js";
import * as userRepository from "../repository/user.repository.js";
import * as invitationTokenRepository from "../repository/invitation-token.repository.js";
import { generateSecureToken, hashToken } from "../../auth/auth.tokens.js";
import { UserStatus, UserResponseData } from "../types/user.types.js";
import { USER_ERROR_MESSAGES, INVITATION_TOKEN_EXPIRY } from "../constants/user.constants.js";
import { formatUser } from "./user.service.js";
import { Role, UserRole } from "../../roles/index.js";

export async function inviteUser(
  email: string,
  firstName: string,
  lastName: string,
  invitedByUserId: string,
  firmId: string
): Promise<UserResponseData> {
  const normalizedEmail = email.toLowerCase().trim();
  
  let user = await userRepository.findByEmail(normalizedEmail);
  
  if (user) {
    if (user.status !== UserStatus.PENDING_INVITATION) {
      throw AppError.conflict(USER_ERROR_MESSAGES.DUPLICATE_EMAIL);
    }
    
    // Resending/updating pending user info
    user = await userRepository.updateUser(user._id.toString(), {
      firstName,
      lastName,
      invitedBy: new Types.ObjectId(invitedByUserId),
      invitationSentAt: new Date(),
    });
  } else {
    // Create new pending user
    user = await userRepository.createUser({
      email: normalizedEmail,
      firstName,
      lastName,
      firmId: new Types.ObjectId(firmId),
      status: UserStatus.PENDING_INVITATION,
      invitedBy: new Types.ObjectId(invitedByUserId),
      invitationSentAt: new Date(),
    });

    // Auto-assign "Staff" system role
    const staffRole = await Role.findOne({ name: "Staff", isSystemRole: true });
    if (staffRole && user) {
      await UserRole.create({
        userId: user._id,
        roleId: staffRole._id,
        assignedBy: new Types.ObjectId(invitedByUserId),
        assignedAt: new Date(),
      });
    }
  }
  
  if (!user) {
    throw AppError.internal("Failed to create user account.");
  }
  
  // Invalidate any active previous tokens for this email
  await invitationTokenRepository.invalidatePreviousTokens(normalizedEmail);
  
  // Generate invitation token
  const tokenRaw = generateSecureToken();
  const tokenHash = hashToken(tokenRaw);
  const expiresAt = new Date(Date.now() + INVITATION_TOKEN_EXPIRY * 1000);
  
  await invitationTokenRepository.createInvitationToken({
    userId: user._id,
    firmId: user.firmId,
    tokenHash,
    email: normalizedEmail,
    expiresAt,
  });
  
  // Log invitation link to console
  console.log(`[INVITATION SENT] Email: ${normalizedEmail}, Link: http://localhost:5173/accept-invitation?token=${tokenRaw}`);
  
  return formatUser(user);
}

export async function acceptInvitation(
  token: string,
  password?: string
): Promise<UserResponseData> {
  if (!password) {
    throw AppError.badRequest(USER_ERROR_MESSAGES.PASSWORD_REQUIRED);
  }
  
  const tokenHash = hashToken(token);
  const invitationToken = await invitationTokenRepository.findValidToken(tokenHash);
  
  if (!invitationToken) {
    throw AppError.badRequest(USER_ERROR_MESSAGES.INVALID_INVITATION_TOKEN);
  }
  
  const user = await userRepository.findById(invitationToken.userId.toString());
  if (!user) {
    throw AppError.notFound(USER_ERROR_MESSAGES.USER_NOT_FOUND);
  }
  
  // Generate password hash
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  // Mark token as consumed
  await invitationTokenRepository.consumeToken(invitationToken._id);
  
  // Update user to active
  const updatedUser = await userRepository.updateUser(user._id.toString(), {
    status: UserStatus.ACTIVE,
    passwordHash,
    isEmailVerified: true,
    invitationAcceptedAt: new Date(),
  });
  
  if (!updatedUser) {
    throw AppError.internal("Failed to activate user account.");
  }
  
  return formatUser(updatedUser);
}
