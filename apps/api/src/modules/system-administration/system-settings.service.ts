import * as systemSettingsRepository from "./system-settings.repository.js";
import { recordAuditEvent } from "../audit-log/index.js";

export async function getSettings() {
  return systemSettingsRepository.getSettings();
}

export async function updateSettings(
  data: any,
  userId: string,
  firmId: string,
  auditOptions: { ipAddress?: string; userAgent?: string }
) {
  const previousState = await systemSettingsRepository.getSettings();
  const currentState = await systemSettingsRepository.updateSettings(data);

  await recordAuditEvent({
    firmId,
    userId,
    module: "System Administration",
    action: "SYSTEM_SETTINGS_CHANGED",
    previousState: previousState.toObject(),
    currentState: currentState.toObject(),
    ipAddress: auditOptions.ipAddress,
    userAgent: auditOptions.userAgent,
    metadata: { message: "System settings updated." },
  });

  return currentState;
}
