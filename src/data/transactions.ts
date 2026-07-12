import { attemptSchema } from "../domain/schemas/attemptSchema";
import { projectSchema } from "../domain/schemas/projectSchema";
import type { Attempt, Project } from "../domain/types";
import type { PrintPalDatabase } from "./db";

export async function createProjectWithFirstAttempt(
  db: PrintPalDatabase,
  project: Project,
  attempt: Attempt,
): Promise<{ project: Project; attempt: Attempt }> {
  if (project.projectId !== attempt.projectId) {
    throw new Error("Project and first attempt must share the same projectId.");
  }

  const validatedAttempt = attemptSchema.parse(attempt);
  const validatedProject = projectSchema.parse({
    ...project,
    attemptIds: Array.from(new Set([...project.attemptIds, attempt.attemptId])),
  });

  await db.transaction("rw", db.projects, db.attempts, async () => {
    await db.projects.add(validatedProject);
    await db.attempts.add(validatedAttempt);
  });

  return { project: validatedProject, attempt: validatedAttempt };
}

export async function deleteProjectCascade(db: PrintPalDatabase, projectId: string): Promise<void> {
  await db.transaction(
    "rw",
    db.projects,
    db.attempts,
    db.comparisons,
    db.nextTestPlans,
    async () => {
      await db.comparisons.where("projectId").equals(projectId).delete();
      await db.nextTestPlans.where("projectId").equals(projectId).delete();
      await db.attempts.where("projectId").equals(projectId).delete();
      await db.projects.delete(projectId);
    },
  );
}

export async function clearAllLocalData(db: PrintPalDatabase): Promise<void> {
  await db.transaction(
    "rw",
    db.projects,
    db.attempts,
    db.comparisons,
    db.nextTestPlans,
    db.appSettings,
    async () => {
      await Promise.all([
        db.projects.clear(),
        db.attempts.clear(),
        db.comparisons.clear(),
        db.nextTestPlans.clear(),
        db.appSettings.clear(),
      ]);
    },
  );
}

export async function getStorageCounts(db: PrintPalDatabase) {
  const [projects, attempts, comparisons, nextTestPlans, appSettings] = await Promise.all([
    db.projects.count(),
    db.attempts.count(),
    db.comparisons.count(),
    db.nextTestPlans.count(),
    db.appSettings.count(),
  ]);

  return { projects, attempts, comparisons, nextTestPlans, appSettings };
}
