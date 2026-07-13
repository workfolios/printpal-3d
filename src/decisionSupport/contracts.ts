import { z } from "zod";
import { createApiResponseEnvelopeSchema } from "../domain/schemas/apiSchema";
import { idSchema, jsonValueSchema, stringListSchema } from "../domain/schemas/commonSchema";
import { nextTestPlanContentSchema } from "../domain/schemas/nextTestPlanSchema";

export const DECISION_SUPPORT_MODEL = "gemini-2.5-flash";
export const COMPARISON_INTERPRETATION_PROMPT_VERSION = "comparison-interpretation-v0.4.0";
export const COMPARISON_INTERPRETATION_RULES_VERSION = "comparison-interpretation-rules-v1.0.0";
export const NEXT_TEST_PROMPT_VERSION = "next-test-v0.4.0";
export const NEXT_TEST_RULES_VERSION = "next-test-rules-v1.0.0";

const factSnapshotSchema = z.object({
  label: z.string().trim().min(1),
  value: jsonValueSchema,
});

const factChangeSchema = z.object({
  label: z.string().trim().min(1),
  attemptAValue: jsonValueSchema.optional(),
  attemptBValue: jsonValueSchema.optional(),
});

export const deterministicComparisonPackageSchema = z.object({
  projectId: idSchema,
  comparisonId: idSchema,
  attemptAId: idSchema,
  attemptBId: idSchema,
  constants: z.array(factSnapshotSchema).default([]),
  changes: z.array(factChangeSchema).default([]),
  intentionalChanges: stringListSchema,
  unknownChanges: stringListSchema,
  missingInformation: stringListSchema,
  outcomeDifferences: stringListSchema,
  supportedObservations: stringListSchema,
  deterministicUncertainties: stringListSchema,
});

export const comparisonInterpretationContentSchema = z.object({
  interpretationSummary: z.string().trim().min(1),
  modelInferences: stringListSchema,
  alternateExplanations: stringListSchema,
  interpretationUncertainties: stringListSchema,
  interpretationSourceChecks: stringListSchema,
});

export const interpretationResponseEnvelopeSchema = createApiResponseEnvelopeSchema(
  comparisonInterpretationContentSchema,
);
export const nextTestResponseEnvelopeSchema = createApiResponseEnvelopeSchema(
  nextTestPlanContentSchema,
);

export type DeterministicComparisonPackage = z.infer<typeof deterministicComparisonPackageSchema>;
export type ComparisonInterpretationContent = z.infer<typeof comparisonInterpretationContentSchema>;
export type InterpretationResponseEnvelope = z.infer<typeof interpretationResponseEnvelopeSchema>;
export type NextTestResponseEnvelope = z.infer<typeof nextTestResponseEnvelopeSchema>;
