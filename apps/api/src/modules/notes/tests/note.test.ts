import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { formatNote } from "../note.controller.js";
import {
  createNoteSchema,
  updateNoteSchema,
  pinNoteSchema,
} from "../note.validation.js";
import { sanitizeHtmlContent, createNote, updateNote, softDeleteNote } from "../note.service.js";
import { Note } from "../schemas/note.schema.js";

describe("Notes Module (033) Tests", () => {
  describe("HTML Sanitization Helper", () => {
    test("should strip scripts, comments, and iframes from content", () => {
      const maliciousHTML = `
        <div>
          <script>alert('XSS')</script>
          <!-- This is a comment -->
          <iframe src="http://evil.com"></iframe>
          <p>This is safe content.</p>
        </div>
      `;
      const sanitized = sanitizeHtmlContent(maliciousHTML);
      
      assert.ok(!sanitized.includes("<script>"));
      assert.ok(!sanitized.includes("evil.com"));
      assert.ok(!sanitized.includes("comment"));
      assert.ok(sanitized.includes("<p>This is safe content.</p>"));
    });

    test("should strip inline event handlers", () => {
      const input = `<img src="x" onerror="alert('onerror')" onclick="alert('click')"/>`;
      const sanitized = sanitizeHtmlContent(input);

      assert.ok(!sanitized.includes("onerror"));
      assert.ok(!sanitized.includes("onclick"));
      assert.ok(sanitized.includes('<img src="x"/>'));
    });

    test("should disable javascript: URIs in href tags", () => {
      const input = `<a href="javascript:alert('xss')">Link</a>`;
      const sanitized = sanitizeHtmlContent(input);

      assert.ok(!sanitized.includes("javascript:"));
      assert.ok(sanitized.includes('href="#"'));
    });
  });

  describe("Validation Schemas", () => {
    test("createNoteSchema should validate valid input parameters", () => {
      const payload = {
        entityType: "MATTER",
        entityId: new Types.ObjectId().toString(),
        title: "Client meeting notes",
        content: "Discussed strategy.",
      };
      const result = createNoteSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("createNoteSchema should fail if entityType is invalid", () => {
      const payload = {
        entityType: "INVALID_ENTITY_ENUM",
        entityId: new Types.ObjectId().toString(),
        content: "Notes context.",
      };
      const result = createNoteSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("createNoteSchema should fail if content is empty", () => {
      const payload = {
        entityType: "LEAD",
        entityId: new Types.ObjectId().toString(),
        content: "",
      };
      const result = createNoteSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe("Authorization Security Rules", () => {
    let originalFindOne: any;
    let originalCreate: any;

    before(() => {
      originalFindOne = Note.findOne;
      originalCreate = Note.create;
    });

    after(() => {
      Note.findOne = originalFindOne;
      Note.create = originalCreate;
    });

    test("should permit author or manager to update note, but block others", async () => {
      const noteId = new Types.ObjectId().toString();
      const authorId = new Types.ObjectId().toString();
      const firmId = new Types.ObjectId().toString();

      // Mock finding the note
      Note.findOne = () => {
        return {
          populate: () => ({
            exec: () => Promise.resolve({
              _id: new Types.ObjectId(noteId),
              firmId: new Types.ObjectId(firmId),
              authorId: new Types.ObjectId(authorId),
              content: "Original notes.",
            }),
          }),
        } as any;
      };

      // Mock update call
      Note.findOneAndUpdate = () => {
        return {
          populate: () => ({
            exec: () => Promise.resolve({
              _id: new Types.ObjectId(noteId),
              content: "Updated notes.",
            }),
          }),
        } as any;
      };

      // 1. Author should succeed
      const authorRes = await updateNote(
        noteId,
        firmId,
        { content: "New content" },
        authorId,
        ["NOTES_VIEW"]
      );
      assert.ok(authorRes);

      // 2. Manager should succeed (even if not author)
      const managerRes = await updateNote(
        noteId,
        firmId,
        { content: "New content" },
        new Types.ObjectId().toString(),
        ["NOTES_VIEW", "NOTES_MANAGE"]
      );
      assert.ok(managerRes);

      // 3. Unauthorized user (neither author nor manager) should fail
      try {
        await updateNote(
          noteId,
          firmId,
          { content: "New content" },
          new Types.ObjectId().toString(),
          ["NOTES_VIEW"] // lacks NOTES_MANAGE
        );
        assert.fail("Should have thrown forbidden error.");
      } catch (err: any) {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.message, "You are not authorized to edit this note.");
      }
    });
  });
});
