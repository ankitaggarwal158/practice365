import { z } from "zod";
import { Types } from "mongoose";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format.",
});

export const sendMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message content cannot be empty."),
  }),
});

export const getThreadSchema = z.object({
  params: z.object({
    matterId: objectIdSchema,
  }),
});

export const listThreadsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 25)),
    search: z.string().optional(),
  }),
});

export const listMessagesSchema = z.object({
  params: z.object({
    matterId: objectIdSchema,
  }),
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
  }),
});

export const markReadSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
