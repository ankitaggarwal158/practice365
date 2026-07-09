import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { SYSTEM_ROLES } from "../../roles/constants/role.constants.js";
import {
  updateSettingsSchema,
  createAnnouncementSchema,
} from "../system-settings.validation.js";
import { checkMaintenanceMode } from "../maintenance-mode.service.js";
import { AppError } from "../../../shared/app-error.js";
import { SystemSettingsModel } from "../schemas/system-settings.schema.js";
import { UserRole } from "../../roles/schemas/user-role.schema.js";
import { RolePermission } from "../../roles/schemas/role-permission.schema.js";

describe("System Administration Module (045) Tests", () => {
  describe("Roles & System Admin Permissions Seeding", () => {
    test("System Administrator role should possess SYSTEM_ADMIN permission", () => {
      const sysAdminRole = SYSTEM_ROLES.find((r) => r.name === "System Administrator");
      assert.ok(sysAdminRole);
      assert.ok(sysAdminRole.permissions.includes("SYSTEM_ADMIN"));
    });

    test("Firm Owner and Firm Administrator roles must NOT possess SYSTEM_ADMIN permission", () => {
      const ownerRole = SYSTEM_ROLES.find((r) => r.name === "Firm Owner");
      const adminRole = SYSTEM_ROLES.find((r) => r.name === "Firm Administrator");

      assert.ok(ownerRole);
      assert.ok(adminRole);
      assert.strictEqual(ownerRole.permissions.includes("SYSTEM_ADMIN"), false);
      assert.strictEqual(adminRole.permissions.includes("SYSTEM_ADMIN"), false);
    });
  });

  describe("Validation Schemas", () => {
    test("updateSettingsSchema should validate valid configs", () => {
      const payload = {
        maintenanceMode: true,
        maintenanceMessage: "Scheduled maintenance.",
        applicationName: "Custom P365",
        defaultTimezone: "America/New_York",
      };
      const result = updateSettingsSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("createAnnouncementSchema should validate correct startsAt/expiresAt formats", () => {
      const payload = {
        title: "Database upgrade",
        message: "Maintenance announcement message details.",
        severity: "WARNING",
        startsAt: "2026-07-09T12:00:00.000Z",
        expiresAt: "2026-07-09T18:00:00.000Z",
      };
      const result = createAnnouncementSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });
  });

  describe("Maintenance Mode Middleware", () => {
    let originalFindSettings: any;
    let originalFindUserRole: any;
    let originalFindRolePermission: any;

    before(() => {
      originalFindSettings = SystemSettingsModel.findOne;
      originalFindUserRole = UserRole.find;
      originalFindRolePermission = RolePermission.find;
    });

    after(() => {
      SystemSettingsModel.findOne = originalFindSettings;
      UserRole.find = originalFindUserRole;
      RolePermission.find = originalFindRolePermission;
    });

    test("should bypass maintenance checks for bypass list paths (e.g. /health)", async () => {
      SystemSettingsModel.findOne = () => Promise.resolve({
        maintenanceMode: true,
        maintenanceMessage: "Maintenance active.",
      }) as any;

      const req: any = { path: "/health", headers: {} };
      let nextCalled = false;
      const next = (err?: any) => {
        if (!err) nextCalled = true;
      };

      await checkMaintenanceMode(req, {} as any, next);
      assert.strictEqual(nextCalled, true);
    });

    test("should block authenticated non-admin requests when maintenance mode is active", async () => {
      SystemSettingsModel.findOne = () => Promise.resolve({
        maintenanceMode: true,
        maintenanceMessage: "Database upgrades in progress.",
      }) as any;

      UserRole.find = () => {
        return {
          populate: () => {
            return Promise.resolve([
              {
                roleId: {
                  _id: new Types.ObjectId(),
                  name: "Staff",
                  isActive: true,
                }
              }
            ]);
          }
        } as any;
      };

      RolePermission.find = () => {
        return {
          populate: () => {
            return Promise.resolve([
              {
                permissionId: {
                  code: "MATTERS_VIEW",
                }
              }
            ]);
          }
        } as any;
      };

      const req: any = {
        path: "/api/matters",
        user: { userId: new Types.ObjectId().toString(), sessionId: "session-123" },
        headers: {},
      };

      let errorThrown: any = null;
      const next = (err?: any) => {
        errorThrown = err;
      };

      await checkMaintenanceMode(req, {} as any, next);
      assert.ok(errorThrown instanceof AppError);
      assert.strictEqual(errorThrown.statusCode, 503);
      assert.strictEqual(errorThrown.message, "Database upgrades in progress.");
    });

    test("should allow authenticated system administrators during maintenance mode", async () => {
      SystemSettingsModel.findOne = () => Promise.resolve({
        maintenanceMode: true,
        maintenanceMessage: "Database upgrades in progress.",
      }) as any;

      UserRole.find = () => {
        return {
          populate: () => {
            return Promise.resolve([
              {
                roleId: {
                  _id: new Types.ObjectId(),
                  name: "System Administrator",
                  isActive: true,
                }
              }
            ]);
          }
        } as any;
      };

      RolePermission.find = () => {
        return {
          populate: () => {
            return Promise.resolve([
              {
                permissionId: {
                  code: "SYSTEM_ADMIN",
                }
              }
            ]);
          }
        } as any;
      };

      const req: any = {
        path: "/api/system/settings",
        user: { userId: new Types.ObjectId().toString(), sessionId: "session-123" },
        headers: {},
      };

      let nextCalled = false;
      const next = (err?: any) => {
        if (!err) nextCalled = true;
      };

      await checkMaintenanceMode(req, {} as any, next);
      assert.strictEqual(nextCalled, true);
    });
  });
});
