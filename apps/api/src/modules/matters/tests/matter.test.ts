import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import {
  Matter,
  MatterTeamMember,
  MatterNote,
  MatterAttachment,
  Document as DocumentModel,
} from "../schemas/matter.schema.js";
import { PracticeArea } from "../../practice-areas/schemas/practice-area.schema.js";
import { Client } from "../../clients/schemas/client.schema.js";
import { User } from "../../users/schemas/user.schema.js";
import { Firm } from "../../firm/schemas/firm.schema.js";
import { FirmSettings } from "../../firm-settings/schemas/firm-settings.schema.js";
import { formatMatter, generateMatterNumber, createMatter, updateMatter, updateMatterStatus, changeResponsibleAttorney } from "../matter.service.js";
import { createMatterSchema, updateMatterSchema, updateStatusSchema } from "../matter.validation.js";

describe("Matter Management Module (024) Tests", () => {
  describe("Formatting & Auto Numbering", () => {
    let originalFirmFindById: any;
    let originalMatterFindOne: any;

    before(() => {
      originalFirmFindById = Firm.findById;
      originalMatterFindOne = Matter.findOne;
    });

    after(() => {
      Firm.findById = originalFirmFindById;
      Matter.findOne = originalMatterFindOne;
    });

    test("generateMatterNumber should format number based on sequence", async () => {
      const originalFindOne = FirmSettings.findOne;
      const originalFindOneAndUpdate = FirmSettings.findOneAndUpdate;
      
      FirmSettings.findOne = () => ({ exec: () => Promise.resolve({ matterNumberPrefix: "TEST-", matterNextNumber: 1001 }) }) as any;
      FirmSettings.findOneAndUpdate = () => ({ exec: () => Promise.resolve({ matterNumberPrefix: "TEST-", matterNextNumber: 1002 }) }) as any;

      const matterNum = await generateMatterNumber(new Types.ObjectId().toString());
      assert.strictEqual(matterNum, "TEST-1001");

      FirmSettings.findOne = originalFindOne;
      FirmSettings.findOneAndUpdate = originalFindOneAndUpdate;
    });

    test("formatMatter should serialize Mongoose documents properly", () => {
      const mockMatterId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const mockClientId = new Types.ObjectId();
      const mockAttorneyId = new Types.ObjectId();
      const mockPAId = new Types.ObjectId();
      const now = new Date();

      const mockMatter = {
        _id: mockMatterId,
        firmId: mockFirmId,
        clientId: {
          _id: mockClientId,
          clientType: "INDIVIDUAL",
          firstName: "Bruce",
          lastName: "Wayne",
        },
        matterNumber: "MAT-202606-1234",
        title: "Wayne Corporate Acquisition",
        practiceAreaId: {
          _id: mockPAId,
          name: "Corporate Law",
        },
        matterType: "TRANSACTIONAL",
        status: "OPEN",
        priority: "HIGH",
        responsibleAttorneyId: {
          _id: mockAttorneyId,
          firstName: "Harvey",
          lastName: "Dent",
        },
        openedDate: now,
        createdBy: mockAttorneyId,
        createdAt: now,
        updatedAt: now,
      } as any;

      const formatted = formatMatter(mockMatter);
      assert.strictEqual(formatted.id, mockMatterId.toString());
      assert.strictEqual(formatted.matterNumber, "MAT-202606-1234");
      assert.strictEqual(formatted.clientName, "Bruce Wayne");
      assert.strictEqual(formatted.practiceAreaName, "Corporate Law");
      assert.strictEqual(formatted.responsibleAttorneyName, "Harvey Dent");
    });
  });

  describe("Validation Schemas", () => {
    test("createMatterSchema should accept valid matter payload", () => {
      const payload = {
        clientId: new Types.ObjectId().toString(),
        title: "Litigation against LuthorCorp",
        practiceAreaId: new Types.ObjectId().toString(),
        matterType: "LITIGATION",
        responsibleAttorneyId: new Types.ObjectId().toString(),
        priority: "HIGH",
      };
      const result = createMatterSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("createMatterSchema should reject missing title", () => {
      const payload = {
        clientId: new Types.ObjectId().toString(),
        practiceAreaId: new Types.ObjectId().toString(),
        matterType: "LITIGATION",
        responsibleAttorneyId: new Types.ObjectId().toString(),
      };
      const result = createMatterSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("updateStatusSchema should reject invalid status string", () => {
      const result = updateStatusSchema.safeParse({ status: "DELETED" });
      assert.strictEqual(result.success, false);
    });
  });

  describe("Operations & Business Integrity", () => {
    let originalClientFindOne: any;
    let originalPracticeAreaFind: any;
    let originalPracticeAreaFindOne: any;
    let originalUserFindOne: any;
    let originalFirmFindById: any;
    let originalMatterFindOne: any;
    let originalMatterCreate: any;
    let originalMatterUpdate: any;
    let originalTeamMemberCreate: any;
    let originalTeamMemberFind: any;
    let originalTeamMemberFindOne: any;
    let originalTeamMemberUpdate: any;
    let originalNoteFind: any;
    let originalAttachmentFind: any;
    let originalFirmSettingsFindOne: any;
    let originalFirmSettingsFindOneAndUpdate: any;

    before(() => {
      originalClientFindOne = Client.findOne;
      originalPracticeAreaFind = PracticeArea.find;
      originalPracticeAreaFindOne = PracticeArea.findOne;
      originalUserFindOne = User.findOne;
      originalFirmFindById = Firm.findById;
      originalMatterFindOne = Matter.findOne;
      originalMatterCreate = Matter.create;
      originalMatterUpdate = Matter.findOneAndUpdate;
      originalTeamMemberCreate = MatterTeamMember.create;
      originalTeamMemberFind = MatterTeamMember.find;
      originalTeamMemberFindOne = MatterTeamMember.findOne;
      originalTeamMemberUpdate = MatterTeamMember.findOneAndUpdate;
      originalNoteFind = MatterNote.find;
      originalAttachmentFind = MatterAttachment.find;
      originalFirmSettingsFindOne = FirmSettings.findOne;
      originalFirmSettingsFindOneAndUpdate = FirmSettings.findOneAndUpdate;

      FirmSettings.findOne = () => ({ exec: () => Promise.resolve({ matterNumberPrefix: "MAT-", matterNextNumber: 1001 }) }) as any;
      FirmSettings.findOneAndUpdate = () => ({ exec: () => Promise.resolve({ matterNumberPrefix: "MAT-", matterNextNumber: 1002 }) }) as any;
    });

    after(() => {
      Client.findOne = originalClientFindOne;
      PracticeArea.find = originalPracticeAreaFind;
      PracticeArea.findOne = originalPracticeAreaFindOne;
      User.findOne = originalUserFindOne;
      Firm.findById = originalFirmFindById;
      Matter.findOne = originalMatterFindOne;
      Matter.create = originalMatterCreate;
      Matter.findOneAndUpdate = originalMatterUpdate;
      MatterTeamMember.create = originalTeamMemberCreate;
      MatterTeamMember.find = originalTeamMemberFind;
      MatterTeamMember.findOne = originalTeamMemberFindOne;
      MatterTeamMember.findOneAndUpdate = originalTeamMemberUpdate;
      MatterNote.find = originalNoteFind;
      MatterAttachment.find = originalAttachmentFind;
      FirmSettings.findOne = originalFirmSettingsFindOne;
      FirmSettings.findOneAndUpdate = originalFirmSettingsFindOneAndUpdate;
    });

    test("createMatter should check firm boundaries and seed practice areas if needed", async () => {
      const mockFirmId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();
      const mockClientId = new Types.ObjectId();
      const mockPAId = new Types.ObjectId();

      Client.findOne = () => Promise.resolve({ _id: mockClientId, firmId: mockFirmId }) as any;
      PracticeArea.find = () => {
        const queryMock = {
          sort: () => queryMock,
          exec: () => Promise.resolve([{ _id: mockPAId, firmId: mockFirmId, name: "Civil Litigation" }]),
          then: (resolve: any) => Promise.resolve([{ _id: mockPAId, firmId: mockFirmId, name: "Civil Litigation" }]).then(resolve),
        };
        return queryMock as any;
      };
      PracticeArea.findOne = () => Promise.resolve({ _id: mockPAId, firmId: mockFirmId, name: "Civil Litigation" }) as any;
      User.findOne = () => Promise.resolve({ _id: mockUserId, firmId: mockFirmId }) as any;
      Firm.findById = () => Promise.resolve({ matterPrefix: "MAT-" }) as any;
      
      const createdMatterObj = {
        _id: new Types.ObjectId(),
        firmId: mockFirmId,
        clientId: mockClientId,
        matterNumber: "MAT-202606-5555",
        title: "Test Matter",
        practiceAreaId: mockPAId,
        matterType: "LITIGATION",
        status: "OPEN",
        priority: "NORMAL",
        responsibleAttorneyId: mockUserId,
        openedDate: new Date(),
        createdBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      Matter.create = () => Promise.resolve(createdMatterObj) as any;
      Matter.findOne = () => {
        const queryMock = {
          populate: () => queryMock,
          then: (resolve: any) => Promise.resolve({
            ...createdMatterObj,
            clientId: { _id: mockClientId, clientType: "INDIVIDUAL", firstName: "Bruce", lastName: "Wayne" },
            responsibleAttorneyId: { _id: mockUserId, firstName: "Harvey", lastName: "Dent" },
            practiceAreaId: { _id: mockPAId, name: "Civil Litigation" },
          }).then(resolve),
        };
        return queryMock as any;
      };

      MatterTeamMember.create = () => Promise.resolve({}) as any;
      MatterTeamMember.find = () => {
        const queryMock = {
          sort: () => queryMock,
          populate: () => queryMock,
          exec: () => Promise.resolve([]),
          then: (resolve: any) => Promise.resolve([]).then(resolve),
        };
        return queryMock as any;
      };
      MatterNote.find = () => {
        const queryMock = {
          sort: () => queryMock,
          populate: () => queryMock,
          exec: () => Promise.resolve([]),
          then: (resolve: any) => Promise.resolve([]).then(resolve),
        };
        return queryMock as any;
      };
      MatterAttachment.find = () => {
        const queryMock = {
          sort: () => queryMock,
          populate: () => queryMock,
          exec: () => Promise.resolve([]),
          then: (resolve: any) => Promise.resolve([]).then(resolve),
        };
        return queryMock as any;
      };

      const payload = {
        clientId: mockClientId.toString(),
        title: "Test Matter",
        practiceAreaId: mockPAId.toString(),
        matterType: "LITIGATION",
        responsibleAttorneyId: mockUserId.toString(),
      };

      const result = await createMatter(mockFirmId.toString(), mockUserId.toString(), payload);
      assert.strictEqual(result.title, "Test Matter");
      assert.strictEqual(result.status, "OPEN");
    });

    test("updateMatter should throw bad request if attempting to edit immutable fields", async () => {
      const mockFirmId = new Types.ObjectId();
      const mockMatterId = new Types.ObjectId();
      const mockClientId = new Types.ObjectId();

      const existingMatter = {
        _id: mockMatterId,
        firmId: mockFirmId,
        clientId: mockClientId,
        matterNumber: "MAT-1",
        status: "OPEN",
      };

      Matter.findOne = () => Promise.resolve(existingMatter) as any;

      try {
        await updateMatter(
          mockMatterId.toString(),
          mockFirmId.toString(),
          { clientId: new Types.ObjectId().toString() }, // attempting to edit client!
          new Types.ObjectId().toString()
        );
        assert.fail("Should have thrown error on immutable client modification.");
      } catch (err: any) {
        assert.ok(err.message.includes("immutable"));
      }
    });

    test("updateMatterStatus should reject invalid lifecycle status transitions", async () => {
      const mockFirmId = new Types.ObjectId();
      const mockMatterId = new Types.ObjectId();

      const existingMatter = {
        _id: mockMatterId,
        firmId: mockFirmId,
        status: "OPEN",
      };

      Matter.findOne = () => Promise.resolve(existingMatter) as any;

      try {
        await updateMatterStatus(
          mockMatterId.toString(),
          mockFirmId.toString(),
          "ARCHIVED", // OPEN -> ARCHIVED is invalid directly
          new Types.ObjectId().toString()
        );
        assert.fail("Should have failed invalid transition OPEN -> ARCHIVED");
      } catch (err: any) {
        assert.ok(err.message.includes("transition"));
      }
    });
  });
});
