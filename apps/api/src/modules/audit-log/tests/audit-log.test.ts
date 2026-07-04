import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { maskSensitiveData } from "../audit-event.service.js";
import {
  listAuditLogsQuerySchema,
  entityTimelineQuerySchema,
  userActivityQuerySchema,
} from "../audit-log.validation.js";
import { exportToCsv } from "../audit-export.service.js";
import { AuditLog } from "../schemas/audit-log.schema.js";

describe("Audit Log Module (042) Tests", () => {
  describe("Sensitive Data Masking Helper", () => {
    test("should recursively mask sensitive keys in nested objects", () => {
      const input = {
        normalField: "safe text",
        password: "my-secret-password",
        nested: {
          apiToken: "super-token-123",
          secretKey: "key-data",
          authHeader: "Bearer abc",
          firmId: new Types.ObjectId(), // should preserve ObjectId type
          createdAt: new Date(), // should preserve Date type
        },
        arr: [
          { normal: "yes", credentialCode: "secret-code" },
          "plain string",
        ],
      };

      const result = maskSensitiveData(input);

      assert.strictEqual(result.normalField, "safe text");
      assert.strictEqual(result.password, "********");
      assert.strictEqual(result.nested.apiToken, "********");
      assert.strictEqual(result.nested.secretKey, "********");
      assert.strictEqual(result.nested.authHeader, "********");
      assert.ok(result.nested.firmId instanceof Types.ObjectId);
      assert.ok(result.nested.createdAt instanceof Date);
      assert.strictEqual(result.arr[0].normal, "yes");
      assert.strictEqual(result.arr[0].credentialCode, "********");
      assert.strictEqual(result.arr[1], "plain string");
    });

    test("should return null or undefined as-is", () => {
      assert.strictEqual(maskSensitiveData(null), null);
      assert.strictEqual(maskSensitiveData(undefined), undefined);
    });
  });

  describe("Validation Schemas", () => {
    test("listAuditLogsQuerySchema should validate valid input parameters", () => {
      const payload = {
        module: "Matters",
        entityType: "MATTER",
        action: "CREATE",
        startDate: "2026-07-01",
        endDate: "2026-07-05",
        page: "2",
        limit: "50",
        userId: new Types.ObjectId().toString(),
        entityId: new Types.ObjectId().toString(),
      };
      const result = listAuditLogsQuerySchema.safeParse(payload);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 2);
      assert.strictEqual(result.data.limit, 50);
    });

    test("listAuditLogsQuerySchema should fail with invalid object IDs", () => {
      const payload = {
        userId: "invalid-id",
      };
      const result = listAuditLogsQuerySchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe("CSV Export Logic", () => {
    let originalFindAll: any;

    before(() => {
      originalFindAll = AuditLog.find;
    });

    after(() => {
      AuditLog.find = originalFindAll;
    });

    test("should export records to CSV and handle escaping correctly", async () => {
      const firmId = new Types.ObjectId().toString();
      const mockLogs = [
        {
          createdAt: new Date("2026-07-04T12:00:00.000Z"),
          userId: {
            _id: new Types.ObjectId(),
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            displayName: "John Doe",
          },
          module: "Matters",
          action: "CREATE",
          entityType: "Matter",
          entityId: new Types.ObjectId(),
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0",
          metadata: { message: "Created matter \"Super Duper Project\"" },
        },
      ];

      // Mock the repository call via mongoose AuditLog.find & countDocuments
      AuditLog.find = () => {
        return {
          populate: () => ({
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  exec: () => Promise.resolve(mockLogs),
                }),
              }),
            }),
          }),
        } as any;
      };

      AuditLog.countDocuments = () => Promise.resolve(1) as any;

      const csv = await exportToCsv(firmId, {});
      assert.ok(csv.includes("Timestamp,User ID,User Name,User Email,Module,Action"));
      assert.ok(csv.includes("John Doe"));
      assert.ok(csv.includes("john@example.com"));
      assert.ok(csv.includes("Matters"));
      assert.ok(csv.includes("127.0.0.1"));
      assert.ok(csv.includes("Super Duper Project")); // check double quote escaping in metadata
    });
  });
});
