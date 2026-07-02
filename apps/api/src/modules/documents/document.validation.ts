import { z } from "zod";

export const documentFolderSchema = z.object({
  folderName: z.string().min(1, "Folder name is required").max(100),
  parentFolderId: z.string().nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const documentMetaUpdateSchema = z.object({
  documentName: z.string().min(1, "Document name is required").max(255).optional(),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  folderId: z.string().nullable().optional(),
});
