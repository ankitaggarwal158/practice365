import { Types } from "mongoose";
import { Matter } from "./schemas/matter.schema.js";
import { AuditLog } from "../audit-log/schemas/audit-log.schema.js";
import { CalendarEvent } from "../calendar/schemas/calendar-event.schema.js";
import { MatterMessageModel } from "../client-messaging/schemas/message.schema.js";
import { AppError } from "../../shared/app-error.js";

export async function getMatterSummary(matterId: string, firmId: string) {
  const mId = new Types.ObjectId(matterId);
  const fId = new Types.ObjectId(firmId);

  // 1. Get Matter
  const matter = await Matter.findOne({ _id: mId, firmId: fId });
  if (!matter) {
    throw AppError.notFound("Matter not found");
  }

  // 2. Last activity date (from audit logs)
  const lastLog = await AuditLog.findOne({ entityId: mId, firmId: fId })
    .sort({ createdAt: -1 })
    .exec();

  // 3. Next upcoming deadline
  const nextDeadline = await CalendarEvent.findOne({
    matterId: mId,
    firmId: fId,
    eventType: "DEADLINE",
    startDateTime: { $gte: new Date() },
    deleted: { $ne: true },
  })
    .sort({ startDateTime: 1 })
    .exec();

  // 4. Last client contact (from messages)
  const lastMessage = await MatterMessageModel.findOne({
    matterId: mId,
    firmId: fId,
  })
    .sort({ createdAt: -1 })
    .exec();

  return {
    status: matter.status,
    retainerStatus: {
      agreed: matter.retainerAmountAgreed,
      collected: matter.retainerCollected,
      amountCollected: matter.retainerAmountCollected,
    },
    lastActivityDate: lastLog ? lastLog.createdAt : matter.updatedAt,
    nextUpcomingDeadline: nextDeadline ? {
      title: nextDeadline.title,
      date: nextDeadline.startDateTime,
    } : null,
    lastClientContact: lastMessage ? {
      date: lastMessage.createdAt,
      method: "Portal Message",
    } : null,
  };
}
