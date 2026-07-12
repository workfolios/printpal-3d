import { nextTestPlanSchema } from "../../domain/schemas/nextTestPlanSchema";
import type { NextTestPlan } from "../../domain/types";
import type { PrintPalDatabase } from "../db";

export class NextTestPlanRepository {
  constructor(private readonly db: PrintPalDatabase) {}

  async create(plan: NextTestPlan): Promise<NextTestPlan> {
    const validated = nextTestPlanSchema.parse(plan);
    await this.db.nextTestPlans.add(validated);
    return validated;
  }

  async get(nextTestPlanId: string): Promise<NextTestPlan | undefined> {
    return this.db.nextTestPlans.get(nextTestPlanId);
  }

  async listByProject(projectId: string): Promise<NextTestPlan[]> {
    return this.db.nextTestPlans.where("projectId").equals(projectId).sortBy("updatedAt");
  }

  async update(
    nextTestPlanId: string,
    patch: Partial<
      Omit<NextTestPlan, "nextTestPlanId" | "projectId" | "schemaVersion" | "createdAt">
    >,
    now = new Date().toISOString(),
  ): Promise<NextTestPlan> {
    const current = await this.get(nextTestPlanId);
    if (!current) throw new Error(`Next-test plan not found: ${nextTestPlanId}`);
    const validated = nextTestPlanSchema.parse({ ...current, ...patch, updatedAt: now });
    await this.db.nextTestPlans.put(validated);
    return validated;
  }

  async delete(nextTestPlanId: string): Promise<void> {
    await this.db.nextTestPlans.delete(nextTestPlanId);
  }
}
