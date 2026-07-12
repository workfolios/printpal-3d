import { z } from "zod";
import {
  CURRENT_RECORD_SCHEMA_VERSION,
  idSchema,
  isoDateTimeSchema,
  outputOriginSchema,
  stringListSchema,
} from "./commonSchema";

export const nextTestApprovalStatusSchema = z.enum(["DRAFT", "ACCEPTED", "REJECTED"]);

export const nextTestPlanSchema = z.object({
  nextTestPlanId: idSchema,
  projectId: idSchema,
  schemaVersion: z.literal(CURRENT_RECORD_SCHEMA_VERSION),
  originatingComparisonId: idSchema,
  testQuestion: z.string().trim().min(1),
  primaryVariable: z.string().trim().min(1),
  supportingVariable: z.string().trim().optional(),
  constants: stringListSchema,
  observationOrMeasurementPlan: stringListSchema,
  sourceChecks: stringListSchema,
  expectedLearning: z.string().trim().min(1),
  uncertainty: stringListSchema,
  approvalStatus: nextTestApprovalStatusSchema,
  userEdits: z.string().trim().optional(),
  origin: outputOriginSchema,
  promptVersion: z.string().trim().optional(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export type NextTestPlan = z.infer<typeof nextTestPlanSchema>;
