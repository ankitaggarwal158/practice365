import { Types } from "mongoose";
import { RecordAuditEventInput } from "./audit-log.types.js";
import * as auditLogRepository from "./audit-log.repository.js";

/**
 * Deeply traverses an object or array to replace sensitive fields with a masked value.
 */
export function maskSensitiveData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  if (typeof data === "object") {
    // If it's a Mongoose ObjectId or Date, return it as-is to preserve type
    if (data instanceof Types.ObjectId || data instanceof Date) {
      return data;
    }

    const masked: any = {};
    const sensitiveKeywords = [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
      "auth",
      "credential",
      "signature",
    ];

    for (const key of Object.keys(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeywords.some((keyword) =>
        lowerKey.includes(keyword)
      );

      if (isSensitive) {
        masked[key] = "********";
      } else {
        masked[key] = maskSensitiveData(data[key]);
      }
    }
    return masked;
  }

  return data;
}

/**
 * Centrally records an audit event to the audit_logs collection.
 * Recursively masks sensitive fields in previousState, currentState, and metadata.
 */
export async function recordAuditEvent(input: RecordAuditEventInput): Promise<void> {
  const payload: any = {
    firmId: new Types.ObjectId(input.firmId),
    userId: input.userId ? new Types.ObjectId(input.userId) : null,
    module: input.module,
    action: input.action,
    previousState: maskSensitiveData(input.previousState),
    currentState: maskSensitiveData(input.currentState),
    ipAddress: input.ipAddress || null,
    userAgent: input.userAgent || null,
    metadata: maskSensitiveData(input.metadata),
  };

  if (input.entityType) {
    payload.entityType = input.entityType;
  }

  if (input.entityId && Types.ObjectId.isValid(input.entityId)) {
    payload.entityId = new Types.ObjectId(input.entityId);
  }

  await auditLogRepository.create(payload);
}
