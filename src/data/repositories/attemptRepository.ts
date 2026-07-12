import { canTransitionAttemptStatus } from "../../domain/lifecycle";
import { attemptSchema } from "../../domain/schemas/attemptSchema";
import type { Attempt, AttemptStatus } from "../../domain/types";
import type { PrintPalDatabase } from "../db";

export class AttemptRepository {
  constructor(private readonly db: PrintPalDatabase) {}

  async create(attempt: Attempt): Promise<Attempt> {
    const validated = attemptSchema.parse(attempt);
    await this.db.attempts.add(validated);
    return validated;
  }

  async get(attemptId: string): Promise<Attempt | undefined> {
    return this.db.attempts.get(attemptId);
  }

  async listByProject(projectId: string): Promise<Attempt[]> {
    return this.db.attempts.where("projectId").equals(projectId).sortBy("attemptNumber");
  }

  async update(
    attemptId: string,
    patch: Partial<Omit<Attempt, "attemptId" | "projectId" | "schemaVersion" | "createdAt">>,
    now = new Date().toISOString(),
  ): Promise<Attempt> {
    const current = await this.require(attemptId);
    const validated = attemptSchema.parse({ ...current, ...patch, updatedAt: now });
    await this.db.attempts.put(validated);
    return validated;
  }

  async transitionStatus(
    attemptId: string,
    status: AttemptStatus,
    now = new Date().toISOString(),
  ): Promise<Attempt> {
    const current = await this.require(attemptId);
    if (!canTransitionAttemptStatus(current.status, status)) {
      throw new Error(`Invalid attempt status transition: ${current.status} -> ${status}`);
    }

    return this.update(
      attemptId,
      {
        status,
        completedAt:
          status === "PRINTED" || status === "OUTCOME_RECORDED" || status === "COMPARED"
            ? current.completedAt ?? now
            : current.completedAt,
      },
      now,
    );
  }

  async delete(attemptId: string): Promise<void> {
    await this.db.attempts.delete(attemptId);
  }

  private async require(attemptId: string): Promise<Attempt> {
    const attempt = await this.get(attemptId);
    if (!attempt) throw new Error(`Attempt not found: ${attemptId}`);
    return attempt;
  }
}
