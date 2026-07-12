import { z } from "zod";
import { isoDateTimeSchema, jsonValueSchema } from "../domain/schemas/commonSchema";

export const appSettingRecordSchema = z.object({
  key: z.string().trim().min(1),
  value: jsonValueSchema,
  updatedAt: isoDateTimeSchema,
});

export type AppSettingRecord = z.infer<typeof appSettingRecordSchema>;
