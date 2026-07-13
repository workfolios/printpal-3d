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
    interpretationSummary: z.string().trim().optional(),
    interpretationUncertainties: stringListSchema,
    interpretationSourceChecks: stringListSchema,
    userEdits: z.string().trim().optional(),
    origin: outputOriginSchema,
    promptVersion: z.string().trim().optional(),
    interpretationOrigin: outputOriginSchema.optional(),
    interpretationPromptVersion: z.string().trim().optional(),
    interpretationRulesVersion: z.string().trim().optional(),
    interpretationModel: z.string().trim().optional(),
    interpretedAt: isoDateTimeSchema.optional(),
    nextTestPlanId: idSchema.optional(),
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

    const hasInterpretation =
      Boolean(comparison.interpretationSummary) ||
      comparison.modelInferences.length > 0 ||
      comparison.alternateExplanations.length > 0 ||
      comparison.interpretationUncertainties.length > 0 ||
      comparison.interpretationSourceChecks.length > 0;

    if (hasInterpretation && !comparison.interpretationOrigin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["interpretationOrigin"],
        message: "An interpreted comparison requires an interpretation origin.",
      });
    }
    if (comparison.interpretationOrigin && !comparison.interpretedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["interpretedAt"],
        message: "An interpreted comparison requires an interpreted timestamp.",
      });
    }
  });

export type FieldSnapshot = z.infer<typeof fieldSnapshotSchema>;
export type FieldChange = z.infer<typeof fieldChangeSchema>;
export type Comparison = z.infer<typeof comparisonSchema>;
