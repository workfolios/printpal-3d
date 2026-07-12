import { z } from "zod";
import { createApiResponseEnvelopeSchema } from "../domain/schemas/apiSchema";
import { planContentSchema } from "../domain/schemas/planSchema";

export const PLANNING_MODEL = "gemini-2.5-flash";
export const PLANNING_PROMPT_VERSION = "planning-v0.4.0";
export const PLANNING_RULES_VERSION = "planning-rules-v1.0.0";

export const planningRequestSchema = z.object({
  projectName: z.string().trim().min(1),
  printGoal: z.string().trim().min(1),
  printerTech: z.string().trim().min(1),
  printerName: z.string().trim().default(""),
  material: z.string().trim().min(1),
  purpose: z.string().trim().min(1),
  priority: z.string().trim().default(""),
  concerns: z.array(z.string().trim().min(1)).default([]),
  notes: z.string().trim().default(""),
  successCriteria: z.array(z.string().trim().min(1)).default([]),
  sourceReferenceSummaries: z.array(z.string().trim().min(1)).default([]),
});

export const planningResponseEnvelopeSchema = createApiResponseEnvelopeSchema(planContentSchema);

export type PlanningRequest = z.infer<typeof planningRequestSchema>;
export type PlanningResponseEnvelope = z.infer<typeof planningResponseEnvelopeSchema>;
