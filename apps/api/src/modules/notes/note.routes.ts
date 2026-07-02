import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { requirePermission } from "../roles/index.js";
import { validate, createNoteSchema, updateNoteSchema, pinNoteSchema } from "./note.validation.js";
import * as noteController from "./note.controller.js";

const router = Router();

router.get(
  "/notes",
  requirePermission("NOTES_VIEW"),
  asyncHandler(noteController.listNotes)
);

router.get(
  "/notes/:id",
  requirePermission("NOTES_VIEW"),
  asyncHandler(noteController.getNote)
);

router.post(
  "/notes",
  requirePermission("NOTES_MANAGE"),
  validate(createNoteSchema),
  asyncHandler(noteController.createNote)
);

router.patch(
  "/notes/:id",
  requirePermission("NOTES_MANAGE"),
  validate(updateNoteSchema),
  asyncHandler(noteController.updateNote)
);

router.delete(
  "/notes/:id",
  requirePermission("NOTES_MANAGE"),
  asyncHandler(noteController.deleteNote)
);

router.patch(
  "/notes/:id/pin",
  requirePermission("NOTES_MANAGE"),
  validate(pinNoteSchema),
  asyncHandler(noteController.pinNote)
);

export { router as noteRouter };
