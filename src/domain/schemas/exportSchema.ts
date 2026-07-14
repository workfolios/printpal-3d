import { z } from "zod";
import { attemptSchema } from "./attemptSchema";
import { comparisonSchema } from "./comparisonSchema";
import {
  CURRENT_RECORD_SCHEMA_VERSION,
  isoDateTimeSchema,
  jsonValueSchema,
  outputOriginSchema,
} from "./commonSchema";
import { nextTestPlanSchema } from "./nextTestPlanSchema";
import { projectSchema } from "./projectSchema";

export const appSettingExportRecordSchema = z.object({
  key: z.string().trim().min(1),
  value: jsonValueSchema,
  updatedAt: isoDateTimeSchema,
});

export const projectExportPayloadSchema = z.object({
  project: projectSchema,
  attempts: z.array(attemptSchema),
  comparisons: z.array(comparisonSchema).default([]),
  nextTestPlans: z.array(nextTestPlanSchema).default([]),
});

export const fullBackupPayloadSchema = z.object({
  projects: z.array(projectSchema),
  attempts: z.array(attemptSchema),
  comparisons: z.array(comparisonSchema),
  nextTestPlans: z.array(nextTestPlanSchema),
  appSettings: z.union([z.array(appSettingExportRecordSchema), z.record(jsonValueSchema)]).default([]),
});

const exportEnvelopeBaseSchema = z.object({
  format: z.literal("PRINTPAL_3D"),
  schemaVersion: z.literal(CURRENT_RECORD_SCHEMA_VERSION),
  appVersion: z.string().trim().min(1),
  exportedAt: isoDateTimeSchema,
  sourceOrigin: outputOriginSchema,
});

export const projectExportEnvelopeSchema = exportEnvelopeBaseSchema.extend({
  exportType: z.literal("PROJECT"),
  payload: projectExportPayloadSchema,
});

export const fullBackupEnvelopeSchema = exportEnvelopeBaseSchema.extend({
  exportType: z.literal("FULL_BACKUP"),
  payload: fullBackupPayloadSchema,
});

export const printPalExportEnvelopeSchema = z.discriminatedUnion("exportType", [
  projectExportEnvelopeSchema,
  fullBackupEnvelopeSchema,
]);

export type AppSettingExportRecord = z.infer<typeof appSettingExportRecordSchema>;
export type ProjectExportPayload = z.infer<typeof projectExportPayloadSchema>;
export type FullBackupPayload = z.infer<typeof fullBackupPayloadSchema>;
export type PrintPalExportEnvelope = z.infer<typeof printPalExportEnvelopeSchema>;
