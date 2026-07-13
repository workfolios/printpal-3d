import { z } from "zod";
import {
  CURRENT_RECORD_SCHEMA_VERSION,
  idSchema,
  isoDateTimeSchema,
  outputOriginSchema,
  stringListSchema,
} from "./commonSchema";

export const nextTestApprovalStatusSchema = z.enum(["DRAFT", "ACCEPTED", "REJECTED"]);

export const nextTestPlanContentSchema = z.object({
  testQuestion: z.string().trim().min(1),
  primaryVariable: z.string().trim().min(1),
  supportingVariable: z.string().trim().optional(),
  constants: stringListSchema,
  observationOrMeasurementPlan: stringListSchema,
  sourceChecks: stringListSchema,
  expectedLearning: z.string().trim().min(1),
  uncertainty: stringListSchema,
});

export const nextTestPlanSchema = nextTestPlanContentSchema.extend({
  nextTestPlanId: idSchema,
  projectId: idSchema,
  schemaVersion: z.literal(CURRENT_RECORD_SCHEMA_VERSION),
  originatingComparisonId: idSchema,
  approvalStatus: nextTestApprovalStatusSchema,
  userEdits: z.string().trim().optional(),
  origin: outputOriginSchema,
  model: z.string().trim().optional(),
  promptVersion: z.string().trim().optional(),
  rulesVersion: z.string().trim().optional(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export type NextTestPlanContent = z.infer<typeof nextTestPlanContentSchema>;
export type NextTestPlan = z.infer<typeof nextTestPlanSchema>;
