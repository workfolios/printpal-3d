import { z } from "zod";
import {
  CURRENT_RECORD_SCHEMA_VERSION,
  idSchema,
  isoDateTimeSchema,
  projectStatusSchema,
  stringListSchema,
} from "./commonSchema";

export const projectSchema = z
  .object({
    projectId: idSchema,
    schemaVersion: z.literal(CURRENT_RECORD_SCHEMA_VERSION),
    title: z.string().trim().min(1).max(160),
    purpose: z.string().trim().min(1),
    description: z.string().trim().optional(),
    successCriteria: z.array(z.string().trim().min(1)).min(1),
    tags: stringListSchema,
    status: projectStatusSchema,
    attemptIds: z.array(idSchema).default([]),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
    archivedAt: isoDateTimeSchema.optional(),
    generalNotes: z.string().trim().optional(),
  })
  .superRefine((project, ctx) => {
    if (project.status === "ARCHIVED" && !project.archivedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["archivedAt"],
        message: "Archived projects must include archivedAt.",
      });
    }
  });

export type Project = z.infer<typeof projectSchema>;
