import { z } from "zod";
import { printerTechnologySchema, stringListSchema } from "./commonSchema";

export const printerContextSchema = z.object({
  technology: printerTechnologySchema,
  alias: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
  model: z.string().trim().optional(),
  configurationNotes: z.string().trim().optional(),
  hardwareReference: z.string().trim().optional(),
  firmwareOrModificationNote: z.string().trim().optional(),
  unknownInformation: z.boolean().default(false),
});

export const materialContextSchema = z.object({
  materialClass: z.string().trim().min(1),
  manufacturer: z.string().trim().optional(),
  productOrResinName: z.string().trim().optional(),
  color: z.string().trim().optional(),
  batchOrLotReference: z.string().trim().optional(),
  openedAt: z.string().datetime().optional(),
  approximateAge: z.string().trim().optional(),
  storageOrConditioningNotes: z.string().trim().optional(),
  observedConditionNotes: z.string().trim().optional(),
  unknownInformation: z.boolean().default(false),
});

export const processContextSchema = z.object({
  slicerName: z.string().trim().optional(),
  slicerVersion: z.string().trim().optional(),
  profileReference: z.string().trim().optional(),
  fileOrDesignReference: z.string().trim().optional(),
  settingsSnapshotOrNotes: z.string().trim().optional(),
  plannedVariables: stringListSchema,
  environmentalObservations: z.string().trim().optional(),
  postProcessingPlan: z.string().trim().optional(),
  changesFromParentAttempt: stringListSchema,
});

export type PrinterContext = z.infer<typeof printerContextSchema>;
export type MaterialContext = z.infer<typeof materialContextSchema>;
export type ProcessContext = z.infer<typeof processContextSchema>;
