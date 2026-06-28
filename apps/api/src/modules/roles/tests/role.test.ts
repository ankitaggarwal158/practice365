import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { Role } from "../schemas/role.schema.js";
import { Permission } from "../schemas/permission.schema.js";
import { RolePermission } from "../schemas/role-permission.schema.js";
import { UserRole } from "../schemas/user-role.schema.js";
import { User } from "../../users/schemas/user.schema.js";
import { formatRole } from "../service/role.service.js";
import { requirePermission } from "../middleware/authorization.middleware.js";
import * as permissionService from "../service/permission.service.js";
import {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionsSchema,
  assignRolesSchema,
  idParamSchema,
} from "../validation/role.validation.js";

describe("Roles & Permissions Module (012) Tests", () => {
  describe("formatRole Utility", () => {
    test("should correctly format a RoleDocument", () => {
      const mockRoleId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();
      const now = new Date();

      const mockRole = {
        _id: mockRoleId,
        firmId: mockFirmId,
        name: "Test Role",
        description: "Test Description",
        isSystemRole: false,
        isActive: true,
        createdBy: mockUserId,
        createdAt: now,
        updatedAt: now,
      } as any;

      const formatted = formatRole(mockRole);

      assert.strictEqual(formatted.id, mockRoleId.toString());
      assert.strictEqual(formatted.firmId, mockFirmId.toString());
      assert.strictEqual(formatted.name, "Test Role");
      assert.strictEqual(formatted.description, "Test Description");
      assert.strictEqual(formatted.isSystemRole, false);
      assert.strictEqual(formatted.isActive, true);
      assert.strictEqual(formatted.createdBy, mockUserId.toString());
      assert.strictEqual(formatted.createdAt, now.toISOString());
      assert.strictEqual(formatted.updatedAt, now.toISOString());
    });
  });

  describe("Validation Schemas", () => {
    test("createRoleSchema should validate valid payload", () => {
      const payload = {
        name: "Associate Attorney",
        description: "Assists lead attorney",
      };
      const result = createRoleSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("createRoleSchema should fail on empty name", () => {
      const payload = {
        name: "",
      };
      const result = createRoleSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("assignPermissionsSchema should fail on invalid permission object ID", () => {
      const payload = {
        permissionIds: ["invalid-id"],
      };
      const result = assignPermissionsSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("assignRolesSchema should validate valid array of ObjectIds", () => {
      const payload = {
        roleIds: [new Types.ObjectId().toString(), new Types.ObjectId().toString()],
      };
      const result = assignRolesSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("idParamSchema should validate valid ObjectId", () => {
      const result = idParamSchema.safeParse({ id: new Types.ObjectId().toString() });
      assert.strictEqual(result.success, true);
    });
  });

  describe("Permission Evaluation & Middleware", () => {
    let originalUserRoleFind: any;
    let originalRolePermissionFind: any;

    before(() => {
      originalUserRoleFind = UserRole.find;
      originalRolePermissionFind = RolePermission.find;
    });

    after(() => {
      UserRole.find = originalUserRoleFind;
      RolePermission.find = originalRolePermissionFind;
    });

    test("permissionService.hasPermission should return true if user has role with permission", async () => {
      const mockUserId = new Types.ObjectId().toString();
      const mockRoleId = new Types.ObjectId();
      const mockPermissionId = new Types.ObjectId();

      // Mock UserRole.find to return our mock role assignment
      UserRole.find = () => {
        return {
          populate: () => [
            {
              userId: mockUserId,
              roleId: {
                _id: mockRoleId,
                name: "Attorney",
                isActive: true,
              },
            },
          ],
        } as any;
      };

      // Mock RolePermission.find to return our permission
      RolePermission.find = () => {
        return {
          populate: () => [
            {
              roleId: mockRoleId,
              permissionId: {
                _id: mockPermissionId,
                code: "USERS_VIEW",
                name: "View Users",
              },
            },
          ],
        } as any;
      };

      const hasView = await permissionService.hasPermission(mockUserId, "USERS_VIEW");
      const hasCreate = await permissionService.hasPermission(mockUserId, "USERS_CREATE");

      assert.strictEqual(hasView, true, "Should have USERS_VIEW permission");
      assert.strictEqual(hasCreate, false, "Should not have USERS_CREATE permission");
    });

    test("requirePermission middleware should grant access if user has permission", async () => {
      const mockUserId = new Types.ObjectId().toString();
      const req: any = {
        user: {
          userId: mockUserId,
        },
      };
      const res: any = {};
      let nextCalled = false;
      let nextError: any = null;

      const next = (err?: any) => {
        nextCalled = true;
        nextError = err;
        if (err) console.error("TEST MIDDLEWARE ERROR:", err);
      };

      // Mock UserRole.find and RolePermission.find
      UserRole.find = () => ({ populate: () => [{ roleId: { _id: new Types.ObjectId(), isActive: true } }] } as any);
      RolePermission.find = () => ({ populate: () => [{ permissionId: { code: "USERS_VIEW" } }] } as any);

      const middleware = requirePermission("USERS_VIEW");
      await middleware(req, res, next);

      assert.ok(!nextError, "Should not pass error to next()");
      assert.strictEqual(nextCalled, true);
    });

    test("requirePermission middleware should deny access with 403 if user lacks permission", async () => {
      const mockUserId = new Types.ObjectId().toString();
      const req: any = {
        user: {
          userId: mockUserId,
        },
      };
      const res: any = {};
      let nextCalled = false;
      let nextError: any = null;

      const next = (err?: any) => {
        nextCalled = true;
        nextError = err;
      };

      // User has no permissions
      UserRole.find = () => ({ populate: () => [] } as any);

      const middleware = requirePermission("USERS_DELETE");
      await middleware(req, res, next);

      assert.strictEqual(nextCalled, true);
      assert.ok(nextError, "Should pass error to next()");
      assert.strictEqual(nextError.statusCode, 403, "Error should be 403 Forbidden");
    });
  });
});
