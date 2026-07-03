import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import {
  createSignatureRequestSchema,
  submitSignatureSchema,
} from "../signature-request.validation.js";
import { SignatureRequest } from "../schemas/signature-request.schema.js";
import { SignatureRequestSigner } from "../schemas/signature-request-signer.schema.js";
import { SignatureEvent } from "../schemas/signature-event.schema.js";
import { signingService } from "../signing.service.js";
import { REQUEST_STATUS, SIGNING_MODE, SIGNER_STATUS } from "../signature-request.constants.js";
import { documentRepository } from "../../documents/document.repository.js";
import { signatureDocumentService } from "../signature-document.service.js";

describe("Electronic Signatures Module (039) Tests", () => {
  describe("Validation Schemas", () => {
    test("createSignatureRequestSchema should validate valid input parameters", () => {
      const payload = {
        documentId: new Types.ObjectId().toString(),
        requestTitle: "NDA for Client Consultation",
        signingMode: "SEQUENTIAL",
        signers: [
          { fullName: "Alice Smith", email: "alice@example.com", signingOrder: 1 },
          { fullName: "Bob Jones", email: "bob@example.com", signingOrder: 2 },
        ],
      };
      const result = createSignatureRequestSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("createSignatureRequestSchema should fail if no signers specified", () => {
      const payload = {
        documentId: new Types.ObjectId().toString(),
        requestTitle: "NDA for Client Consultation",
        signingMode: "PARALLEL",
        signers: [],
      };
      const result = createSignatureRequestSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("submitSignatureSchema should validate valid signature payload", () => {
      const payload = {
        signature: "data:image/png;base64,iVBORw0KGgoAAAAN...",
        acceptedTerms: true,
      };
      const result = submitSignatureSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("submitSignatureSchema should fail if terms not accepted", () => {
      const payload = {
        signature: "data:image/png;base64,...",
        acceptedTerms: false,
      };
      const result = submitSignatureSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe("Signing Workflow & Authorization Business Rules", () => {
    let originalRequestFindOne: any;
    let originalSignerFindOne: any;
    let originalSignerFind: any;
    let originalDocumentFindById: any;
    let originalGeneratePDF: any;
    let originalEventCreate: any;

    before(() => {
      originalRequestFindOne = SignatureRequest.findOne;
      originalSignerFindOne = SignatureRequestSigner.findOne;
      originalSignerFind = SignatureRequestSigner.find;
      originalDocumentFindById = documentRepository.findById;
      originalGeneratePDF = signatureDocumentService.generateAndSaveSignedPDF;
      originalEventCreate = SignatureEvent.create;

      (SignatureEvent as any).create = () => Promise.resolve({} as any);
    });

    after(() => {
      SignatureRequest.findOne = originalRequestFindOne;
      SignatureRequestSigner.findOne = originalSignerFindOne;
      SignatureRequestSigner.find = originalSignerFind;
      documentRepository.findById = originalDocumentFindById;
      signatureDocumentService.generateAndSaveSignedPDF = originalGeneratePDF;
      SignatureEvent.create = originalEventCreate;
    });

    test("should prevent out-of-order sequential signing", async () => {
      const requestId = new Types.ObjectId();
      const token1 = "token_signer_1";
      const token2 = "token_signer_2";

      // Mock signers list
      const signer1 = {
        _id: new Types.ObjectId(),
        requestId,
        fullName: "Alice",
        email: "alice@example.com",
        signingOrder: 1,
        status: SIGNER_STATUS.PENDING,
        token: token1,
        save: async function () { return this; }
      };

      const signer2 = {
        _id: new Types.ObjectId(),
        requestId,
        fullName: "Bob",
        email: "bob@example.com",
        signingOrder: 2,
        status: SIGNER_STATUS.PENDING,
        token: token2,
        save: async function () { return this; }
      };

      const request = {
        _id: requestId,
        firmId: new Types.ObjectId(),
        documentId: new Types.ObjectId(),
        requestTitle: "Contract",
        signingMode: SIGNING_MODE.SEQUENTIAL,
        status: REQUEST_STATUS.SENT,
        save: async function () { return this; }
      };

      // Mock Signer finds
      (SignatureRequestSigner as any).findOne = (query: any) => {
        if (query.token === token1) return Promise.resolve(signer1 as any);
        if (query.token === token2) return Promise.resolve(signer2 as any);
        return Promise.resolve(null);
      };

      // Mock Request find
      (SignatureRequest as any).findOne = () => Promise.resolve(request as any);

      // Mock list of all signers with sort query chain helper
      (SignatureRequestSigner as any).find = () => {
        return {
          sort: () => Promise.resolve([signer1, signer2]),
        } as any;
      };

      // Mock Document find
      documentRepository.findById = () => Promise.resolve({ documentName: "test.pdf" } as any);

      // 1. Signer 1 (order 1) loads session - should succeed
      const session1 = await signingService.loadSigningSession(token1);
      assert.strictEqual(session1.signer.fullName, "Alice");

      // 2. Signer 2 (order 2) tries to load session before Signer 1 signed - should throw Forbidden Error
      try {
        await signingService.loadSigningSession(token2);
        assert.fail("Out-of-order sequential signing should have failed.");
      } catch (err: any) {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.message, "It is not your turn to sign this document yet.");
      }
    });

    test("should complete request and compile PDF once final signer signs", async () => {
      const requestId = new Types.ObjectId();
      const token1 = "token_signer_1";

      const signer1 = {
        _id: new Types.ObjectId(),
        requestId,
        fullName: "Alice",
        email: "alice@example.com",
        signingOrder: 1,
        status: SIGNER_STATUS.VIEWED,
        token: token1,
        save: async function () { return this; }
      };

      const request = {
        _id: requestId,
        firmId: new Types.ObjectId(),
        documentId: new Types.ObjectId(),
        requestTitle: "Contract",
        signingMode: SIGNING_MODE.PARALLEL,
        status: REQUEST_STATUS.VIEWED,
        createdBy: new Types.ObjectId(),
        save: async function () { return this; }
      };

      (SignatureRequestSigner as any).findOne = () => Promise.resolve(signer1 as any);
      (SignatureRequest as any).findOne = () => Promise.resolve(request as any);
      (SignatureRequestSigner as any).find = () => {
        return {
          sort: () => Promise.resolve([signer1]),
        } as any;
      };
      documentRepository.findById = () => Promise.resolve({ documentName: "test.pdf" } as any);

      // Mock event creation
      SignatureEvent.create = () => Promise.resolve({} as any);

      // Mock PDF compilation service
      let pdfGenerated = false;
      signatureDocumentService.generateAndSaveSignedPDF = async () => {
        pdfGenerated = true;
        return new Types.ObjectId().toString();
      };

      // Submit signature
      const newStatus = await signingService.submitSignature(token1, {
        signatureData: "data:image/png;base64,...",
        ip: "127.0.0.1",
        userAgent: "Test Agent",
      });

      assert.strictEqual(newStatus, REQUEST_STATUS.COMPLETED);
      assert.strictEqual(request.status, REQUEST_STATUS.COMPLETED);
      assert.strictEqual(signer1.status, SIGNER_STATUS.SIGNED);
      assert.strictEqual(pdfGenerated, true);
    });
  });
});
