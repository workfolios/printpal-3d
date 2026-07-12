import type { JsonValue } from "../../domain/schemas/commonSchema";
import { appSettingRecordSchema, type AppSettingRecord } from "../appSettings";
import type { PrintPalDatabase } from "../db";

export class SettingsRepository {
  constructor(private readonly db: PrintPalDatabase) {}

  async get(key: string): Promise<AppSettingRecord | undefined> {
    return this.db.appSettings.get(key);
  }

  async set(key: string, value: JsonValue, now = new Date().toISOString()): Promise<AppSettingRecord> {
    const validated = appSettingRecordSchema.parse({ key, value, updatedAt: now });
    await this.db.appSettings.put(validated);
    return validated;
  }

  async listAll(): Promise<AppSettingRecord[]> {
    return this.db.appSettings.orderBy("key").toArray();
  }

  async delete(key: string): Promise<void> {
    await this.db.appSettings.delete(key);
  }
}
