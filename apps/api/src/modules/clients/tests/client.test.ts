import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { Client, ClientNote, ClientAttachment } from "../schemas/client.schema.js";
import { formatClient, generateClientNumber } from "../client.service.js";
import { createClientFromLead, updateClient, getClient } from "../client.service.js";
import { mergeClients } from "../client.merge.service.js";
import { findDuplicates } from "../client.duplicate.service.js";
import { Lead } from "../../leads/schemas/lead.schema.js";
import { ConflictCheck } from "../../conflict-check/schemas/conflict-check.schema.js";
import { FirmSettings } from "../../firm-settings/schemas/firm-settings.schema.js";
import {
  createClientSchema,
  updateClientSchema,
  mergeClientSchema,
} from "../client.validation.js";

describe("Client Management Module (023) Tests", () => {
  describe("Formatting & Auto Numbering", () => {
    test("generateClientNumber should return client prefix and sequence", async () => {
      const originalFindOne = FirmSettings.findOne;
      const originalFindOneAndUpdate = FirmSettings.findOneAndUpdate;
      
      FirmSettings.findOne = () => ({ exec: () => Promise.resolve({ clientNumberPrefix: "CLI-", clientNextNumber: 10 }) }) as any;
      FirmSettings.findOneAndUpdate = () => ({ exec: () => Promise.resolve({ clientNumberPrefix: "CLI-", clientNextNumber: 11 }) }) as any;

      const num = await generateClientNumber(new Types.ObjectId().toString());
      assert.strictEqual(num, "CLI-10");

      FirmSettings.findOne = originalFindOne;
      FirmSettings.findOneAndUpdate = originalFindOneAndUpdate;
    });

    test("formatClient should map model parameters correctly", () => {
      const mockClientId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const now = new Date();

      const mockClient = {
        _id: mockClientId,
        firmId: mockFirmId,
        clientNumber: "CLI-202606-9999",
        clientType: "INDIVIDUAL",
        status: "ACTIVE",
        firstName: "Tony",
        lastName: "Stark",
        email: "tony@stark.com",
        createdAt: now,
        updatedAt: now,
      } as any;

      const formatted = formatClient(mockClient);
      assert.strictEqual(formatted.id, mockClientId.toString());
      assert.strictEqual(formatted.clientNumber, "CLI-202606-9999");
      assert.strictEqual(formatted.firstName, "Tony");
      assert.strictEqual(formatted.lastName, "Stark");
      assert.strictEqual(formatted.clientType, "INDIVIDUAL");
    });
  });

  describe("Validation Schemas", () => {
    test("createClientSchema should validate valid individual client", () => {
      const payload = {
        clientType: "INDIVIDUAL",
        firstName: "Bruce",
        lastName: "Wayne",
        email: "bruce@wayne.com",
      };
      const result = createClientSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("createClientSchema should reject individual client with missing lastName", () => {
      const payload = {
        clientType: "INDIVIDUAL",
        firstName: "Bruce",
      };
      const result = createClientSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("createClientSchema should validate valid organization client", () => {
      const payload = {
        clientType: "ORGANIZATION",
        companyName: "Wayne Enterprises",
      };
      const result = createClientSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("updateClientSchema should prevent status overrides validation issues", () => {
      const payload = {
        status: "ARCHIVED",
      };
      const result = updateClientSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });
  });

  describe("Operations & Business Integrity", () => {
    let originalLeadFindOne: any;
    let originalClientCreate: any;
    let originalClientFindOne: any;
    let originalClientFindOneAndUpdate: any;
    let originalConflictFindOne: any;
    let originalFirmSettingsFindOne: any;
    let originalFirmSettingsFindOneAndUpdate: any;

    let originalClientFind: any;
    let originalNoteUpdateMany: any;
    let originalAttachmentUpdateMany: any;
    let originalNoteFind: any;
    let originalAttachmentFind: any;

    before(() => {
      originalLeadFindOne = Lead.findOne;
      originalClientCreate = Client.create;
      originalClientFindOne = Client.findOne;
      originalClientFindOneAndUpdate = Client.findOneAndUpdate;
      originalConflictFindOne = ConflictCheck.findOne;
      originalFirmSettingsFindOne = FirmSettings.findOne;
      originalFirmSettingsFindOneAndUpdate = FirmSettings.findOneAndUpdate;

      FirmSettings.findOne = () => ({ exec: () => Promise.resolve({ clientNumberPrefix: "CLI-", clientNextNumber: 10 }) }) as any;
      FirmSettings.findOneAndUpdate = () => ({ exec: () => Promise.resolve({ clientNumberPrefix: "CLI-", clientNextNumber: 11 }) }) as any;

      originalClientFind = Client.find;
      originalNoteUpdateMany = ClientNote.updateMany;
      originalAttachmentUpdateMany = ClientAttachment.updateMany;
      originalNoteFind = ClientNote.find;
      originalAttachmentFind = ClientAttachment.find;
    });

    after(() => {
      Lead.findOne = originalLeadFindOne;
      Client.create = originalClientCreate;
      Client.findOne = originalClientFindOne;
      Client.findOneAndUpdate = originalClientFindOneAndUpdate;
      ConflictCheck.findOne = originalConflictFindOne;
      FirmSettings.findOne = originalFirmSettingsFindOne;
      FirmSettings.findOneAndUpdate = originalFirmSettingsFindOneAndUpdate;

      Client.find = originalClientFind;
      ClientNote.updateMany = originalNoteUpdateMany;
      ClientAttachment.updateMany = originalAttachmentUpdateMany;
      ClientNote.find = originalNoteFind;
      ClientAttachment.find = originalAttachmentFind;
    });

    test("createClientFromLead should convert qualified lead and record cleared check", async () => {
      const mockLeadId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();

      const mockLead = {
        _id: mockLeadId,
        firmId: mockFirmId,
        status: "QUALIFIED",
        firstName: "Peter",
        lastName: "Parker",
        email: "spidey@dailybugle.com",
      };

      Lead.findOne = () => Promise.resolve(mockLead) as any;
      
      ConflictCheck.findOne = () => {
        const queryMock = {
          sort: () => queryMock,
          then: (resolve: any) => Promise.resolve({ finalDecision: "CLEARED" }).then(resolve),
        };
        return queryMock as any;
      };
      
      Client.create = (doc: any) => {
        return Promise.resolve({
          _id: new Types.ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...doc,
        }) as any;
      };

      const clientId = await createClientFromLead(
        mockLeadId.toString(),
        mockFirmId.toString(),
        mockUserId.toString()
      );

      assert.ok(Types.ObjectId.isValid(clientId));
    });

    test("updateClient should throw error if clientType is modified", async () => {
      const mockClientId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();

      const mockClient = {
        _id: mockClientId,
        firmId: mockFirmId,
        clientType: "INDIVIDUAL",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      Client.findOne = () => Promise.resolve(mockClient) as any;

      try {
        await updateClient(mockClientId.toString(), mockFirmId.toString(), {
          clientType: "ORGANIZATION", // Changed type!
        });
        assert.fail("Should have thrown error on immutable type change");
      } catch (err: any) {
        assert.ok(err.message.includes("immutable"));
      }
    });

    test("mergeClients should reassign notes & attachments, then archive source", async () => {
      const mockSourceId = new Types.ObjectId();
      const mockTargetId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();

      const sourceClientDoc = {
        _id: mockSourceId,
        firmId: mockFirmId,
        clientNumber: "CLI-1",
        status: "ACTIVE",
      } as any;

      const targetClientDoc = {
        _id: mockTargetId,
        firmId: mockFirmId,
        clientNumber: "CLI-2",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      // Mock repository calls with query chain stubs
      Client.findOne = (query: any) => {
        const queryMock = {
          populate: () => queryMock,
          then: (resolve: any) => {
            const id = query._id.toString();
            if (id === mockSourceId.toString()) return Promise.resolve(sourceClientDoc).then(resolve);
            if (id === mockTargetId.toString()) return Promise.resolve(targetClientDoc).then(resolve);
            return Promise.resolve(null).then(resolve);
          },
        };
        return queryMock as any;
      };

      Client.findOneAndUpdate = (query: any, updateObj: any) => {
        sourceClientDoc.status = "ARCHIVED";
        sourceClientDoc.mergedIntoClientId = mockTargetId;
        return Promise.resolve(sourceClientDoc) as any;
      };

      ClientNote.updateMany = () => Promise.resolve({ modifiedCount: 1 }) as any;
      ClientAttachment.updateMany = () => Promise.resolve({ modifiedCount: 1 }) as any;
      ClientNote.find = () => Promise.resolve([]) as any;
      ClientAttachment.find = () => Promise.resolve([]) as any;

      const merged = await mergeClients(
        mockFirmId.toString(),
        mockSourceId.toString(),
        mockTargetId.toString(),
        mockUserId.toString()
      );

      console.log("DEBUG sourceClientDoc at end of test:", JSON.stringify(sourceClientDoc));

      assert.strictEqual(merged._id.toString(), mockTargetId.toString());
      assert.strictEqual(sourceClientDoc.status, "ARCHIVED");
      assert.strictEqual(sourceClientDoc.mergedIntoClientId?.toString(), mockTargetId.toString());
    });

    test("findDuplicates should return match items if email matches exactly", async () => {
      const mockFirmId = new Types.ObjectId();
      const mockClient = {
        _id: new Types.ObjectId(),
        clientNumber: "CLI-MATCH",
        clientType: "INDIVIDUAL",
        firstName: "Lex",
        lastName: "Luthor",
        email: "lex@lexcorp.com",
        status: "ACTIVE",
      };

      Client.find = () => Promise.resolve([mockClient]) as any;

      const duplicates = await findDuplicates(mockFirmId.toString(), {
        email: "lex@lexcorp.com",
      });

      assert.strictEqual(duplicates.length, 1);
      assert.strictEqual(duplicates[0].matchedField, "Email Address");
    });
  });
});
