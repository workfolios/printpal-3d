import { z } from "zod";
import {
  CURRENT_RECORD_SCHEMA_VERSION,
  idSchema,
  isoDateTimeSchema,
  jsonValueSchema,
  outputOriginSchema,
  stringListSchema,
} from "./commonSchema";

const fieldSnapshotSchema = z.object({
  fieldPath: z.string().trim().min(1),
  label: z.string().trim().min(1),
  value: jsonValueSchema,
});

const fieldChangeSchema = z.object({
  fieldPath: z.string().trim().min(1),
  label: z.string().trim().min(1),
  attemptAValue: jsonValueSchema.optional(),
  attemptBValue: jsonValueSchema.optional(),
});

export const comparisonSchema = z
  .object({
    comparisonId: idSchema,
    projectId: idSchema,
    schemaVersion: z.literal(CURRENT_RECORD_SCHEMA_VERSION),
    attemptAId: idSchema,
    attemptBId: idSchema,
    constants: z.array(fieldSnapshotSchema).default([]),
    changes: z.array(fieldChangeSchema).default([]),
    intentionalChanges: stringListSchema,
    unknownChanges: stringListSchema,
    missingInformation: stringListSchema,
    outcomeDifferences: stringListSchema,
    supportedObservations: stringListSchema,
    modelInferences: stringListSchema,
    alternateExplanations: stringListSchema,
    uncertainties: stringListSchema,
    userEdits: z.string().trim().optional(),
    origin: outputOriginSchema,
    promptVersion: z.string().trim().optional(),
    createdAt: isoDateTimeSchema,
  })
  .superRefine((comparison, ctx) => {
    if (comparison.attemptAId === comparison.attemptBId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["attemptBId"],
        message: "A comparison requires two different attempts.",
      });
    }
  });

export type FieldSnapshot = z.infer<typeof fieldSnapshotSchema>;
export type FieldChange = z.infer<typeof fieldChangeSchema>;
export type Comparison = z.infer<typeof comparisonSchema>;
