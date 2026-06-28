import { Types } from "mongoose";
import { User } from "../schemas/user.schema.js";
import { UserDocument, UserStatus, UserPreferences } from "../types/user.types.js";

export async function findById(id: string): Promise<UserDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return User.findById(id);
}

export async function findByEmail(email: string): Promise<UserDocument | null> {
  return User.findOne({ email: email.toLowerCase() });
}

export interface FindUsersOptions {
  page: number;
  limit: number;
  sortBy: string;
  order: "asc" | "desc";
  status?: UserStatus;
  q?: string;
}

export async function findByFirmId(
  firmId: string,
  options: FindUsersOptions
): Promise<{ users: UserDocument[]; total: number }> {
  const { page, limit, sortBy, order, status, q } = options;
  
  const query: any = { firmId: new Types.ObjectId(firmId) };
  
  if (status) {
    query.status = status;
  }
  
  if (q && q.trim()) {
    const searchRegex = new RegExp(q.trim(), "i");
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { displayName: searchRegex },
    ];
  }
  
  const sortOptions: any = {};
  // Avoid using arbitrary fields for sort options without validating/mapping them if required
  const allowedSortFields = ["firstName", "lastName", "email", "status", "createdAt", "updatedAt"];
  const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  
  sortOptions[finalSortBy] = order === "asc" ? 1 : -1;
  
  const skip = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    User.find(query).sort(sortOptions).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);
  
  return { users, total };
}

export async function createUser(data: Partial<UserDocument>): Promise<UserDocument> {
  return User.create(data);
}

export async function updateUser(
  id: string,
  data: Partial<UserDocument>
): Promise<UserDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  
  return User.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );
}

export async function updateUserStatus(
  id: string,
  status: UserStatus
): Promise<UserDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  
  const updateObj: any = { status };
  
  // Also synchronize standard isEmailVerified or isDisabled flags if needed
  if (status === UserStatus.ACTIVE) {
    updateObj.isDisabled = false;
    updateObj.isEmailVerified = true;
  } else if (status === UserStatus.SUSPENDED || status === UserStatus.DEACTIVATED) {
    updateObj.isDisabled = true;
  }
  
  return User.findByIdAndUpdate(
    id,
    { $set: updateObj },
    { new: true, runValidators: true }
  );
}

export async function updateUserPreferences(
  id: string,
  preferences: Partial<UserPreferences>
): Promise<UserDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  
  const updateObj: any = {};
  
  if (preferences.timezone !== undefined) updateObj.timezone = preferences.timezone;
  if (preferences.language !== undefined) updateObj.language = preferences.language;
  if (preferences.dateFormat !== undefined) updateObj.dateFormat = preferences.dateFormat;
  if (preferences.timeFormat !== undefined) updateObj.timeFormat = preferences.timeFormat;
  
  if (preferences.notificationPreferences !== undefined) {
    if (preferences.notificationPreferences.email !== undefined) {
      updateObj["notificationPreferences.email"] = preferences.notificationPreferences.email;
    }
    if (preferences.notificationPreferences.marketing !== undefined) {
      updateObj["notificationPreferences.marketing"] = preferences.notificationPreferences.marketing;
    }
  }
  
  return User.findByIdAndUpdate(
    id,
    { $set: updateObj },
    { new: true, runValidators: true }
  );
}

export async function updateLastLogin(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) return;
  await User.findByIdAndUpdate(id, { $set: { lastLoginAt: new Date() } });
}
