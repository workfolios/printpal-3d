import { z } from "zod";
import {
  isoDateTimeSchema,
  outcomeStatusSchema,
  outputOriginSchema,
  stringListSchema,
  successCriterionStatusSchema,
} from "./commonSchema";

export const successCriterionResultSchema = z.object({
  criterion: z.string().trim().min(1),
  status: successCriterionStatusSchema,
  notes: z.string().trim().optional(),
});

export const outcomeSchema = z.object({
  status: outcomeStatusSchema,
  completedAt: isoDateTimeSchema.optional(),
  successCriteriaResults: z.array(successCriterionResultSchema).default([]),
  observations: stringListSchema,
  deviationsOrDefects: stringListSchema,
  unexpectedConditions: stringListSchema,
  postProcessingPerformed: stringListSchema,
  lessonsLearned: stringListSchema,
  userNotes: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  summaryOrigin: outputOriginSchema.optional(),
});

export type SuccessCriterionResult = z.infer<typeof successCriterionResultSchema>;
export type Outcome = z.infer<typeof outcomeSchema>;
