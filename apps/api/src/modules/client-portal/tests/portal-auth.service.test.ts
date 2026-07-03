import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { portalAuthService } from "../portal-auth.service.js";
import { portalPasswordService } from "../portal-password.service.js";
import { portalSessionService } from "../portal-session.service.js";
import { portalRepository } from "../portal.repository.js";
import { PortalStatus } from "../portal.constants.js";
import {
  PortalLoginSchema,
  PortalForgotPasswordSchema,
  PortalResetPasswordSchema,
  PortalProfileUpdateSchema,
} from "../portal.validation.js";

describe("Client Portal Authentication & Services Tests", () => {
  describe("Zod Validation Schemas", () => {
    test("PortalLoginSchema validates correct inputs", () => {
      const payload = {
        body: {
          email: "client@example.com",
          password: "password123",
        },
      };
      const result = PortalLoginSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("PortalLoginSchema rejects invalid emails", () => {
      const payload = {
        body: {
          email: "not-an-email",
          password: "password123",
        },
      };
      const result = PortalLoginSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("PortalResetPasswordSchema requires min 8 char password", () => {
      const payload = {
        body: {
          token: "secure-raw-token",
          password: "short",
        },
      };
      const result = PortalResetPasswordSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("PortalProfileUpdateSchema accepts valid details", () => {
      const payload = {
        body: {
          phone: "+1234567890",
          address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
          },
        },
      };
      const result = PortalProfileUpdateSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });
  });

  describe("Password Management Logic", () => {
    test("hashPassword generates valid bcrypt hash and verifyPassword matches it", async () => {
      const password = "SuperSecretPassword123";
      const hash = await portalPasswordService.hashPassword(password);
      assert.ok(hash);
      assert.notStrictEqual(hash, password);

      const isValid = await portalPasswordService.verifyPassword(password, hash);
      assert.strictEqual(isValid, true);

      const isInvalid = await portalPasswordService.verifyPassword("WrongPassword", hash);
      assert.strictEqual(isInvalid, false);
    });

    test("isAccountLocked identifies locked accounts within duration", () => {
      const lockedUser: any = {
        portalStatus: PortalStatus.LOCKED,
        lockedUntil: new Date(Date.now() + 10 * 60 * 1000), // locked for 10 more minutes
      };
      assert.strictEqual(portalPasswordService.isAccountLocked(lockedUser), true);

      const unlockedUser: any = {
        portalStatus: PortalStatus.ACTIVE,
        lockedUntil: undefined,
      };
      assert.strictEqual(portalPasswordService.isAccountLocked(unlockedUser), false);

      const expiredLockUser: any = {
        portalStatus: PortalStatus.LOCKED,
        lockedUntil: new Date(Date.now() - 1000), // lockout expired 1s ago
      };
      assert.strictEqual(portalPasswordService.isAccountLocked(expiredLockUser), false);
    });
  });

  describe("Portal Auth Service Workflows", () => {
    let originalFindByEmail: any;
    let originalUpdate: any;
    let originalCreateSession: any;
    let originalFindByResetToken: any;
    let originalDeleteSessionsForUser: any;

    before(() => {
      originalFindByEmail = portalRepository.findByEmail;
      originalUpdate = portalRepository.update;
      originalCreateSession = portalRepository.createSession;
      originalFindByResetToken = portalRepository.findByResetToken;
      originalDeleteSessionsForUser = portalRepository.deleteSessionsForUser;
    });

    after(() => {
      portalRepository.findByEmail = originalFindByEmail;
      portalRepository.update = originalUpdate;
      portalRepository.createSession = originalCreateSession;
      portalRepository.findByResetToken = originalFindByResetToken;
      portalRepository.deleteSessionsForUser = originalDeleteSessionsForUser;
    });

    test("login throws unauthorized for non-existent users", async () => {
      portalRepository.findByEmail = () => Promise.resolve(null);

      await assert.rejects(
        portalAuthService.login("nonexistent@example.com", "password", {
          ipAddress: "127.0.0.1",
          userAgent: "test",
        }),
        /Invalid email or password/
      );
    });

    test("login throws forbidden if portal access is DISABLED", async () => {
      const mockUser: any = {
        _id: new Types.ObjectId(),
        email: "disabled@example.com",
        portalStatus: PortalStatus.DISABLED,
        deleted: false,
      };
      portalRepository.findByEmail = () => Promise.resolve(mockUser);

      await assert.rejects(
        portalAuthService.login(mockUser.email, "password", {
          ipAddress: "127.0.0.1",
          userAgent: "test",
        }),
        /portal access has been disabled/
      );
    });

    test("login handles successful match, resets lockout and creates token session", async () => {
      const mockClient = { _id: new Types.ObjectId() };
      const password = "password123";
      const hash = await portalPasswordService.hashPassword(password);
      const mockUser: any = {
        _id: new Types.ObjectId(),
        email: "active@example.com",
        passwordHash: hash,
        portalStatus: PortalStatus.ACTIVE,
        clientId: mockClient,
        firmId: new Types.ObjectId(),
        failedLoginAttempts: 2,
        deleted: false,
      };

      portalRepository.findByEmail = () => Promise.resolve(mockUser);
      
      const updatesCalled: any[] = [];
      portalRepository.update = (id, fields) => {
        updatesCalled.push(fields);
        return Promise.resolve(mockUser);
      };

      portalRepository.createSession = (data) => {
        return Promise.resolve({
          _id: new Types.ObjectId(),
          ...data,
        }) as any;
      };

      const loginResult = await portalAuthService.login(mockUser.email, password, {
        ipAddress: "127.0.0.1",
        userAgent: "test",
      });

      assert.ok(loginResult.accessToken);
      assert.ok(loginResult.refreshToken);
      assert.strictEqual(loginResult.user.email, mockUser.email);
      
      // Verify failed login attempts reset to 0 was called in one of the updates
      const resetCall = updatesCalled.find(u => u.failedLoginAttempts === 0);
      assert.ok(resetCall);
      
      // Verify lastLoginAt update was called
      const lastLoginCall = updatesCalled.find(u => u.lastLoginAt !== undefined);
      assert.ok(lastLoginCall);
    });

    test("forgotPassword generates secure tokens", async () => {
      const mockUser: any = {
        _id: new Types.ObjectId(),
        email: "forgot@example.com",
        deleted: false,
      };
      portalRepository.findByEmail = () => Promise.resolve(mockUser);
      
      let updatedFields: any = null;
      portalRepository.update = (id, fields) => {
        updatedFields = fields;
        return Promise.resolve(mockUser);
      };

      await portalAuthService.forgotPassword(mockUser.email);
      assert.ok(updatedFields.resetTokenHash);
      assert.ok(updatedFields.resetTokenExpiresAt);
    });

    test("resetPassword checks tokens and rotates sessions on success", async () => {
      const mockUser: any = {
        _id: new Types.ObjectId(),
        email: "reset@example.com",
        deleted: false,
      };
      portalRepository.findByResetToken = () => Promise.resolve(mockUser);
      
      let updatedFields: any = null;
      portalRepository.update = (id, fields) => {
        updatedFields = fields;
        return Promise.resolve(mockUser);
      };

      let sessionsRevokedUser: any = null;
      portalRepository.deleteSessionsForUser = (userId) => {
        sessionsRevokedUser = userId;
        return Promise.resolve();
      };

      await portalAuthService.resetPassword("raw-token", "NewSecurePassword123!");
      
      assert.ok(updatedFields.passwordHash);
      assert.strictEqual(updatedFields.resetTokenHash, undefined);
      assert.strictEqual(sessionsRevokedUser.toString(), mockUser._id.toString());
    });
  });
});
