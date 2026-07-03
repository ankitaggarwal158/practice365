import { Types } from "mongoose";
import { ClientPortalUserModel } from "./schemas/client-portal-user.schema.js";
import { ClientPortalSessionModel } from "./schemas/client-portal-session.schema.js";
import { ClientPortalUser, ClientPortalSession } from "./portal.types.js";

export class PortalRepository {
  async findByEmail(email: string): Promise<ClientPortalUser | null> {
    return ClientPortalUserModel.findOne({ 
      email: email.toLowerCase(), 
      deleted: false 
    })
      .populate("clientId")
      .exec();
  }

  async findById(id: string | Types.ObjectId): Promise<ClientPortalUser | null> {
    return ClientPortalUserModel.findOne({ _id: id, deleted: false })
      .populate("clientId")
      .exec();
  }

  async create(data: Partial<ClientPortalUser>): Promise<ClientPortalUser> {
    const user = new ClientPortalUserModel(data);
    return user.save();
  }

  async update(id: string | Types.ObjectId, data: Partial<ClientPortalUser>): Promise<ClientPortalUser | null> {
    return ClientPortalUserModel.findOneAndUpdate(
      { _id: id, deleted: false },
      { $set: data },
      { new: true }
    ).exec();
  }

  async findByResetToken(tokenHash: string): Promise<ClientPortalUser | null> {
    return ClientPortalUserModel.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
      deleted: false,
    }).exec();
  }

  // Session Operations
  async createSession(data: Partial<ClientPortalSession>): Promise<ClientPortalSession> {
    const session = new ClientPortalSessionModel(data);
    return session.save();
  }

  async findSessionByToken(refreshToken: string): Promise<ClientPortalSession | null> {
    return ClientPortalSessionModel.findOne({ refreshToken })
      .populate("portalUserId")
      .exec();
  }

  async deleteSession(refreshToken: string): Promise<void> {
    await ClientPortalSessionModel.deleteOne({ refreshToken }).exec();
  }

  async deleteSessionsForUser(portalUserId: string | Types.ObjectId): Promise<void> {
    await ClientPortalSessionModel.deleteMany({ portalUserId }).exec();
  }
}

export const portalRepository = new PortalRepository();
