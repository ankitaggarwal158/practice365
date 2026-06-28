import { test, describe } from "node:test";
import assert from "node:assert";
import { formatUser } from "../service/user.service.js";
import { UserStatus, TimeFormat, UserDocument } from "../types/user.types.js";
import { Types } from "mongoose";
import {
  inviteUserSchema,
  updatePreferencesSchema,
  acceptInvitationSchema,
  listUsersQuerySchema,
} from "../validation/user.validation.js";

describe("User Management Module (011) Tests", () => {
  describe("formatUser Utility", () => {
    test("should correctly format a mock UserDocument", () => {
      const mockId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const mockInvitedBy = new Types.ObjectId();
      const now = new Date();
      
      const mockUser = {
        _id: mockId,
        firmId: mockFirmId,
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        displayName: "John D.",
        phone: "+15551234567",
        avatarUrl: "http://example.com/avatar.png",
        jobTitle: "Attorney",
        status: UserStatus.ACTIVE,
        timezone: "America/New_York",
        language: "en",
        dateFormat: "MM/DD/YYYY",
        timeFormat: TimeFormat.TWELVE,
        notificationPreferences: {
          email: true,
          marketing: false,
        },
        invitedBy: mockInvitedBy,
        invitationSentAt: now,
        invitationAcceptedAt: now,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
      } as unknown as UserDocument;

      const formatted = formatUser(mockUser);

      assert.strictEqual(formatted.id, mockId.toString());
      assert.strictEqual(formatted.firmId, mockFirmId.toString());
      assert.strictEqual(formatted.email, "test@example.com");
      assert.strictEqual(formatted.firstName, "John");
      assert.strictEqual(formatted.lastName, "Doe");
      assert.strictEqual(formatted.displayName, "John D.");
      assert.strictEqual(formatted.phone, "+15551234567");
      assert.strictEqual(formatted.avatarUrl, "http://example.com/avatar.png");
      assert.strictEqual(formatted.jobTitle, "Attorney");
      assert.strictEqual(formatted.status, UserStatus.ACTIVE);
      assert.strictEqual(formatted.timezone, "America/New_York");
      assert.strictEqual(formatted.language, "en");
      assert.strictEqual(formatted.dateFormat, "MM/DD/YYYY");
      assert.strictEqual(formatted.timeFormat, TimeFormat.TWELVE);
      assert.deepStrictEqual(formatted.notificationPreferences, {
        email: true,
        marketing: false,
      });
      assert.strictEqual(formatted.invitedBy, mockInvitedBy.toString());
      assert.strictEqual(formatted.invitationSentAt, now.toISOString());
      assert.strictEqual(formatted.invitationAcceptedAt, now.toISOString());
      assert.strictEqual(formatted.lastLoginAt, now.toISOString());
      assert.strictEqual(formatted.createdAt, now.toISOString());
      assert.strictEqual(formatted.updatedAt, now.toISOString());
    });
  });

  describe("Validation Schemas", () => {
    test("inviteUserSchema should validate valid invite request", () => {
      const payload = {
        email: "jane.doe@example.com",
        firstName: "Jane",
        lastName: "Doe",
      };
      const result = inviteUserSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("inviteUserSchema should fail on invalid email", () => {
      const payload = {
        email: "not-an-email",
        firstName: "Jane",
        lastName: "Doe",
      };
      const result = inviteUserSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("updatePreferencesSchema should validate preferences update", () => {
      const payload = {
        timezone: "Europe/London",
        timeFormat: TimeFormat.TWENTY_FOUR,
        notificationPreferences: {
          email: false,
        },
      };
      const result = updatePreferencesSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("acceptInvitationSchema should require at least 8 chars password", () => {
      const invalidPayload = {
        token: "some-secure-token",
        password: "short",
      };
      const validPayload = {
        token: "some-secure-token",
        password: "longenoughpassword",
      };
      
      assert.strictEqual(acceptInvitationSchema.safeParse(invalidPayload).success, false);
      assert.strictEqual(acceptInvitationSchema.safeParse(validPayload).success, true);
    });

    test("listUsersQuerySchema should parse and apply default pagination parameters", () => {
      const emptyPayload = {};
      const result = listUsersQuerySchema.safeParse(emptyPayload);
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 1);
      assert.strictEqual(result.data.limit, 25);
      assert.strictEqual(result.data.sortBy, "createdAt");
      assert.strictEqual(result.data.order, "desc");
    });
  });
});
