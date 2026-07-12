import { z } from "zod";
import { isoDateTimeSchema, outputOriginSchema } from "./commonSchema";

export function createApiResponseEnvelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    ok: z.boolean(),
    data: dataSchema.nullable(),
    origin: outputOriginSchema,
    model: z.string().trim().optional(),
    promptVersion: z.string().trim().optional(),
    rulesVersion: z.string().trim().optional(),
    warnings: z.array(z.string().trim().min(1)).default([]),
    generatedAt: isoDateTimeSchema,
    errorCode: z.string().trim().optional(),
  });
}

export const apiResponseEnvelopeSchema = createApiResponseEnvelopeSchema(z.unknown());

export type ApiResponseEnvelope<T = unknown> = {
  ok: boolean;
  data: T | null;
  origin: "AI_ASSISTED" | "RULES_BASED_FALLBACK" | "USER_AUTHORED" | "AI_ASSISTED_USER_EDITED";
  model?: string;
  promptVersion?: string;
  rulesVersion?: string;
  warnings: string[];
  generatedAt: string;
  errorCode?: string;
};
