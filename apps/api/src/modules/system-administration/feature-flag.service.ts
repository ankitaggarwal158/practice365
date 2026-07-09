import * as systemSettingsRepository from "./system-settings.repository.js";
import { recordAuditEvent } from "../audit-log/index.js";

export async function listFeatureFlags() {
  return systemSettingsRepository.listFeatureFlags();
}

/**
 * Centrally evaluates if a feature flag is enabled.
 * Returns false if the flag does not exist in the database.
 */
export async function checkFeatureEnabled(key: string): Promise<boolean> {
  const flag = await systemSettingsRepository.findFeatureFlagByKey(key);
  return flag ? flag.enabled : false;
}

export async function updateFeatureFlag(
  id: string,
  enabled: boolean,
  userId: string,
  firmId: string,
  auditOptions: { ipAddress?: string; userAgent?: string }
) {
  const flag = await systemSettingsRepository.findFeatureFlagById(id);
  if (!flag) {
    throw new Error("Feature flag not found.");
  }

  const previousState = flag.toObject();
  const currentState = await systemSettingsRepository.updateFeatureFlag(id, enabled, userId);

  await recordAuditEvent({
    firmId,
    userId,
    module: "System Administration",
    action: "FEATURE_FLAG_UPDATED",
    entityType: "FeatureFlag",
    entityId: id,
    previousState,
    currentState: currentState?.toObject(),
    ipAddress: auditOptions.ipAddress,
    userAgent: auditOptions.userAgent,
    metadata: {
      message: `Feature flag "${flag.featureKey}" set to ${enabled ? "ENABLED" : "DISABLED"}.`,
    },
  });

  return currentState;
}
