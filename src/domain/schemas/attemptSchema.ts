import { z } from "zod";
import {
  CURRENT_RECORD_SCHEMA_VERSION,
  attemptStatusSchema,
  idSchema,
  isoDateTimeSchema,
  printerTechnologySchema,
} from "./commonSchema";
import { materialContextSchema, printerContextSchema, processContextSchema } from "./contextSchemas";
import { outcomeSchema } from "./outcomeSchema";
import { planSchema } from "./planSchema";
import { sourceReferenceSchema } from "./sourceReferenceSchema";

export const attemptSchema = z
  .object({
    attemptId: idSchema,
    projectId: idSchema,
    schemaVersion: z.literal(CURRENT_RECORD_SCHEMA_VERSION),
    parentAttemptId: idSchema.optional(),
    attemptNumber: z.number().int().positive(),
    status: attemptStatusSchema,
    printerContext: printerContextSchema,
    materialContext: materialContextSchema,
    processContext: processContextSchema,
    sourceReferences: z.array(sourceReferenceSchema).default([]),
    plan: planSchema.optional(),
    outcome: outcomeSchema.optional(),
    comparisonIds: z.array(idSchema).default([]),
    nextTestPlanId: idSchema.optional(),
    printerTechnologyIndex: printerTechnologySchema,
    materialClassIndex: z.string().trim().min(1),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
    completedAt: isoDateTimeSchema.optional(),
  })
  .superRefine((attempt, ctx) => {
    if (attempt.parentAttemptId === attempt.attemptId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["parentAttemptId"],
        message: "An attempt cannot be its own parent.",
      });
    }

    if (attempt.printerTechnologyIndex !== attempt.printerContext.technology) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["printerTechnologyIndex"],
        message: "printerTechnologyIndex must match printerContext.technology.",
      });
    }

    if (attempt.materialClassIndex !== attempt.materialContext.materialClass) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["materialClassIndex"],
        message: "materialClassIndex must match materialContext.materialClass.",
      });
    }
  });

export type Attempt = z.infer<typeof attemptSchema>;
