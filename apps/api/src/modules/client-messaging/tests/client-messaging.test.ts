import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { sendMessageSchema, getThreadSchema } from "../message-thread.validation.js";
import { MessageThreadService } from "../message-thread.service.js";
import { MessageThreadModel } from "../schemas/message-thread.schema.js";
import { MatterMessageModel } from "../schemas/message.schema.js";
import { Matter } from "../../matters/schemas/matter.schema.js";

describe("Client Messaging Module (046) Tests", () => {
  describe("Validation Schemas", () => {
    test("sendMessageSchema should validate valid input message payload", () => {
      const payload = {
        body: {
          message: "Hello world!",
        },
      };
      const result = sendMessageSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("sendMessageSchema should fail if message body is empty", () => {
      const payload = {
        body: {
          message: "",
        },
      };
      const result = sendMessageSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("getThreadSchema should validate valid matterId parameter", () => {
      const payload = {
        params: {
          matterId: new Types.ObjectId().toString(),
        },
      };
      const result = getThreadSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("getThreadSchema should fail with invalid matterId format", () => {
      const payload = {
        params: {
          matterId: "not-a-valid-object-id",
        },
      };
      const result = getThreadSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe("Business & Security Rules", () => {
    const threadService = new MessageThreadService();
    let originalThreadFindOne: any;
    let originalThreadCreate: any;
    let originalMatterFindOne: any;
    let originalMessageCreate: any;
    let originalMessageUpdateMany: any;
    let originalThreadUpdateOne: any;

    before(() => {
      originalThreadFindOne = MessageThreadModel.findOne;
      originalThreadCreate = MessageThreadModel.create;
      originalMatterFindOne = Matter.findOne;
      originalMessageCreate = MatterMessageModel.create;
      originalMessageUpdateMany = MatterMessageModel.updateMany;
      originalThreadUpdateOne = MessageThreadModel.updateOne;
    });

    after(() => {
      MessageThreadModel.findOne = originalThreadFindOne;
      MessageThreadModel.create = originalThreadCreate;
      Matter.findOne = originalMatterFindOne;
      MatterMessageModel.create = originalMessageCreate;
      MatterMessageModel.updateMany = originalMessageUpdateMany;
      MessageThreadModel.updateOne = originalThreadUpdateOne;
    });

    test("should throw forbidden error if portal client tries to access another client's thread", async () => {
      const matterId = new Types.ObjectId().toString();
      const firmId = new Types.ObjectId().toString();
      const correctClientId = new Types.ObjectId().toString();
      const maliciousClientId = new Types.ObjectId().toString();

      // Self-returning mock query to handle infinite populate chain
      const mockQuery: any = {
        populate: () => mockQuery,
        exec: () =>
          Promise.resolve({
            _id: new Types.ObjectId(),
            firmId: new Types.ObjectId(firmId),
            matterId: new Types.ObjectId(matterId),
            clientId: new Types.ObjectId(correctClientId),
            unreadClientCount: 0,
            unreadFirmCount: 0,
          }),
      };
      MessageThreadModel.findOne = (() => mockQuery) as any;

      try {
        await threadService.getThreadDetails(matterId, firmId, {
          type: "CLIENT",
          id: maliciousClientId,
        });
        assert.fail("Should have failed with forbidden");
      } catch (err: any) {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.message, "Access denied to this conversation thread.");
      }
    });

    test("should permit portal client to view their own matter's thread", async () => {
      const matterId = new Types.ObjectId().toString();
      const firmId = new Types.ObjectId().toString();
      const clientId = new Types.ObjectId().toString();

      const mockQuery: any = {
        populate: () => mockQuery,
        exec: () =>
          Promise.resolve({
            _id: new Types.ObjectId(),
            firmId: new Types.ObjectId(firmId),
            matterId: new Types.ObjectId(matterId),
            clientId: new Types.ObjectId(clientId),
            unreadClientCount: 0,
            unreadFirmCount: 0,
          }),
      };
      MessageThreadModel.findOne = (() => mockQuery) as any;

      const thread = await threadService.getThreadDetails(matterId, firmId, {
        type: "CLIENT",
        id: clientId,
      });

      assert.ok(thread);
      assert.strictEqual(thread.clientId.toString(), clientId);
    });
  });
});
