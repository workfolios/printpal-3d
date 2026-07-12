import { z } from "zod";
import { OUTPUT_ORIGINS } from "../origins";
import { ATTEMPT_STATUSES, PROJECT_STATUSES } from "../lifecycle";

export const CURRENT_RECORD_SCHEMA_VERSION = 1 as const;

export const idSchema = z.string().uuid();
export const isoDateTimeSchema = z.string().datetime();
export const nonEmptyTextSchema = z.string().trim().min(1);
export const optionalTextSchema = z.string().trim().optional();
export const stringListSchema = z.array(nonEmptyTextSchema).default([]);

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ]),
);

export const outputOriginSchema = z.enum(OUTPUT_ORIGINS);
export const projectStatusSchema = z.enum(PROJECT_STATUSES);
export const attemptStatusSchema = z.enum(ATTEMPT_STATUSES);

export const printerTechnologySchema = z.enum([
  "FFF_FDM",
  "MSLA_LCD_RESIN",
  "SLA_RESIN",
  "DLP_RESIN",
  "OTHER",
  "UNKNOWN",
]);

export const outcomeStatusSchema = z.enum([
  "SUCCESSFUL",
  "PARTIALLY_SUCCESSFUL",
  "FAILED",
  "ABORTED",
  "NOT_YET_EVALUATED",
]);

export const successCriterionStatusSchema = z.enum([
  "MET",
  "PARTIALLY_MET",
  "NOT_MET",
  "NOT_EVALUATED",
]);

export const sourceCategorySchema = z.enum([
  "MANUFACTURER_DOCUMENTATION",
  "TDS_SDS",
  "SLICER_DOCUMENTATION",
  "VERIFIED_PROFILE",
  "COMMUNITY_SOURCE",
  "PERSONAL_NOTE",
  "OTHER",
]);

export const sourceAuthoritySchema = z.enum([
  "AUTHORITATIVE",
  "SUPPORTING",
  "COMMUNITY",
  "PERSONAL",
  "UNVERIFIED",
]);
