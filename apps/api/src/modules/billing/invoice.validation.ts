import { z } from "zod";
import { PaymentMethod } from "./invoice.constants.js";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdPattern, "Invalid ObjectId format");

const manualItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(1000),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  rate: z.number().min(0, "Rate cannot be negative"),
});

export const CreateInvoiceSchema = z.object({
  body: z.object({
    clientId: objectIdSchema,
    matterId: objectIdSchema.optional(),
    timeEntryIds: z.array(objectIdSchema).optional(),
    expenseIds: z.array(objectIdSchema).optional(),
    manualItems: z.array(manualItemSchema).optional(),
    dueDate: z.string().datetime().or(z.string()).or(z.date()).optional(),
    notes: z.string().max(3000).optional(),
  }),
});

export const UpdateInvoiceSchema = z.object({
  body: z.object({
    clientId: objectIdSchema.optional(),
    matterId: objectIdSchema.optional(),
    dueDate: z.string().datetime().or(z.string()).or(z.date()).optional(),
    notes: z.string().max(3000).optional(),
    timeEntryIds: z.array(objectIdSchema).optional(),
    manualItems: z.array(manualItemSchema).optional(),
  }),
});

export const RecordPaymentSchema = z.object({
  body: z.object({
    paymentDate: z.string().datetime().or(z.string()).or(z.date()).optional(),
    amount: z.number().min(0.01, "Payment amount must be at least 0.01"),
    paymentMethod: z.nativeEnum(PaymentMethod),
    referenceNumber: z.string().max(100).optional(),
    notes: z.string().max(2000).optional(),
  }),
});

export const SearchInvoicesSchema = z.object({
  query: z.object({
    clientId: objectIdSchema.optional(),
    matterId: objectIdSchema.optional(),
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    searchText: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
