import { z } from "zod";
import { isoDateTimeSchema, outputOriginSchema, stringListSchema } from "./commonSchema";

export const planSchema = z.object({
  objectiveSummary: z.string().trim().min(1),
  readinessConsiderations: stringListSchema,
  printerWatchOuts: stringListSchema,
  materialWatchOuts: stringListSchema,
  assumptions: stringListSchema,
  missingInformation: stringListSchema,
  sourceChecks: stringListSchema,
  variablesToRecord: stringListSchema,
  expectedOutcomeCriteria: stringListSchema,
  userEdits: z.string().trim().optional(),
  origin: outputOriginSchema,
  promptVersion: z.string().trim().optional(),
  rulesVersion: z.string().trim().optional(),
  generatedAt: isoDateTimeSchema,
});

export type Plan = z.infer<typeof planSchema>;
