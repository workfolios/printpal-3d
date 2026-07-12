import { z } from "zod";
import { isoDateTimeSchema, nonEmptyTextSchema, outputOriginSchema, stringListSchema } from "./commonSchema";

export const planContentSchema = z.object({
  objectiveSummary: nonEmptyTextSchema,
  readinessConsiderations: stringListSchema,
  printerWatchOuts: stringListSchema,
  materialWatchOuts: stringListSchema,
  assumptions: stringListSchema,
  missingInformation: stringListSchema,
  sourceChecks: stringListSchema,
  variablesToRecord: stringListSchema,
  expectedOutcomeCriteria: stringListSchema,
});

export const planSchema = planContentSchema.extend({
  userEdits: z.string().trim().optional(),
  origin: outputOriginSchema,
  promptVersion: z.string().trim().optional(),
  rulesVersion: z.string().trim().optional(),
  generatedAt: isoDateTimeSchema,
});

export type PlanContent = z.infer<typeof planContentSchema>;
export type Plan = z.infer<typeof planSchema>;
