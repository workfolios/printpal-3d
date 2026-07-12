import { z } from "zod";
import {
  idSchema,
  isoDateTimeSchema,
  nonEmptyTextSchema,
  sourceAuthoritySchema,
  sourceCategorySchema,
} from "./commonSchema";

export const sourceReferenceSchema = z.object({
  sourceId: idSchema,
  category: sourceCategorySchema,
  title: nonEmptyTextSchema,
  url: z.string().url().optional(),
  publisherOrOwner: z.string().trim().optional(),
  accessedAt: isoDateTimeSchema.optional(),
  notes: z.string().trim().optional(),
  authorityClassification: sourceAuthoritySchema.default("UNVERIFIED"),
  createdAt: isoDateTimeSchema,
});

export type SourceReference = z.infer<typeof sourceReferenceSchema>;
