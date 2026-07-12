import { comparisonSchema } from "../../domain/schemas/comparisonSchema";
import type { Comparison } from "../../domain/types";
import type { PrintPalDatabase } from "../db";

export class ComparisonRepository {
  constructor(private readonly db: PrintPalDatabase) {}

  async create(comparison: Comparison): Promise<Comparison> {
    const validated = comparisonSchema.parse(comparison);
    await this.db.comparisons.add(validated);
    return validated;
  }

  async get(comparisonId: string): Promise<Comparison | undefined> {
    return this.db.comparisons.get(comparisonId);
  }

  async listByProject(projectId: string): Promise<Comparison[]> {
    return this.db.comparisons.where("projectId").equals(projectId).sortBy("createdAt");
  }

  async delete(comparisonId: string): Promise<void> {
    await this.db.comparisons.delete(comparisonId);
  }
}
