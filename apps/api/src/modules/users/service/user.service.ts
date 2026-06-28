import { AppError } from "../../../shared/app-error.js";
import * as userRepository from "../repository/user.repository.js";
import { UserDocument, UserStatus, UserResponseData, UserListResponseData, UserPreferences } from "../types/user.types.js";
import { USER_ERROR_MESSAGES } from "../constants/user.constants.js";

export function formatUser(user: UserDocument): UserResponseData {
  return {
    id: user._id.toString(),
    firmId: user.firmId.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    jobTitle: user.jobTitle,
    status: user.status,
    timezone: user.timezone,
    language: user.language,
    dateFormat: user.dateFormat,
    timeFormat: user.timeFormat,
    notificationPreferences: user.notificationPreferences,
    invitedBy: user.invitedBy?.toString(),
    invitationSentAt: user.invitationSentAt?.toISOString(),
    invitationAcceptedAt: user.invitationAcceptedAt?.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function listUsers(
  firmId: string,
  query: {
    page: number;
    limit: number;
    sortBy: string;
    order: "asc" | "desc";
    status?: UserStatus;
    q?: string;
  }
): Promise<UserListResponseData> {
  const { users, total } = await userRepository.findByFirmId(firmId, query);
  
  return {
    users: users.map(formatUser),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit) || 1,
    },
  };
}

export async function getUserById(
  id: string,
  requestingFirmId: string
): Promise<UserResponseData> {
  const user = await userRepository.findById(id);
  if (!user) {
    throw AppError.notFound(USER_ERROR_MESSAGES.USER_NOT_FOUND);
  }
  
  if (user.firmId.toString() !== requestingFirmId) {
    throw AppError.forbidden(USER_ERROR_MESSAGES.ACCESS_DENIED_SAME_FIRM);
  }
  
  return formatUser(user);
}

export async function updateUser(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    jobTitle?: string;
  },
  requestingFirmId: string
): Promise<UserResponseData> {
  const user = await userRepository.findById(id);
  if (!user) {
    throw AppError.notFound(USER_ERROR_MESSAGES.USER_NOT_FOUND);
  }
  
  if (user.firmId.toString() !== requestingFirmId) {
    throw AppError.forbidden(USER_ERROR_MESSAGES.ACCESS_DENIED_SAME_FIRM);
  }
  
  const updatedUser = await userRepository.updateUser(id, data);
  if (!updatedUser) {
    throw AppError.notFound(USER_ERROR_MESSAGES.USER_NOT_FOUND);
  }
  
  return formatUser(updatedUser);
}

export async function changeUserStatus(
  id: string,
  status: UserStatus,
  requestingFirmId: string
): Promise<UserResponseData> {
  const user = await userRepository.findById(id);
  if (!user) {
    throw AppError.notFound(USER_ERROR_MESSAGES.USER_NOT_FOUND);
  }
  
  if (user.firmId.toString() !== requestingFirmId) {
    throw AppError.forbidden(USER_ERROR_MESSAGES.ACCESS_DENIED_SAME_FIRM);
  }
  
  const current = user.status;
  if (current === status) {
    return formatUser(user);
  }
  
  let isValidTransition = false;
  
  if (current === UserStatus.PENDING_INVITATION) {
    // Admin can cancel/deactivate a pending invitation
    isValidTransition = status === UserStatus.DEACTIVATED;
  } else if (current === UserStatus.ACTIVE) {
    isValidTransition = status === UserStatus.SUSPENDED || status === UserStatus.DEACTIVATED;
  } else if (current === UserStatus.SUSPENDED) {
    isValidTransition = status === UserStatus.ACTIVE || status === UserStatus.DEACTIVATED;
  } else if (current === UserStatus.DEACTIVATED) {
    // Reactivate a deactivated user
    isValidTransition = status === UserStatus.ACTIVE;
  }
  
  if (!isValidTransition) {
    throw AppError.badRequest(USER_ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
  }
  
  const updatedUser = await userRepository.updateUserStatus(id, status);
  if (!updatedUser) {
    throw AppError.notFound(USER_ERROR_MESSAGES.USER_NOT_FOUND);
  }
  
  return formatUser(updatedUser);
}

export async function getCurrentUser(userId: string): Promise<UserResponseData> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw AppError.unauthorized();
  }
  return formatUser(user);
}

export async function updateOwnProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phone?: string;
    avatarUrl?: string;
    jobTitle?: string;
  }
): Promise<UserResponseData> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw AppError.notFound(USER_ERROR_MESSAGES.USER_NOT_FOUND);
  }
  
  // Exclude/prevent modifying system managed fields in the controller/validation layer.
  // We'll perform the update directly here.
  const updatedUser = await userRepository.updateUser(userId, data);
  if (!updatedUser) {
    throw AppError.notFound(USER_ERROR_MESSAGES.USER_NOT_FOUND);
  }
  
  return formatUser(updatedUser);
}

export async function updatePreferences(
  userId: string,
  preferences: {
    timezone?: string;
    language?: string;
    dateFormat?: string;
    timeFormat?: any;
    notificationPreferences?: any;
  }
): Promise<UserResponseData> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw AppError.notFound(USER_ERROR_MESSAGES.USER_NOT_FOUND);
  }
  
  const updatedUser = await userRepository.updateUserPreferences(userId, preferences);
  if (!updatedUser) {
    throw AppError.notFound(USER_ERROR_MESSAGES.USER_NOT_FOUND);
  }
  
  return formatUser(updatedUser);
}
