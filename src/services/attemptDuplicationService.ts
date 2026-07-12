import type { PrintPalDatabase } from "../data/db";
import { db as applicationDb } from "../data/db";
import { attemptSchema } from "../domain/schemas/attemptSchema";
import { projectSchema } from "../domain/schemas/projectSchema";
import type {
  Attempt,
  MaterialContext,
  PrinterContext,
  ProcessContext,
  Project,
} from "../domain/types";

export interface DuplicateAttemptInput {
  printerContext: PrinterContext;
  materialContext: MaterialContext;
  processContext: Omit<ProcessContext, "changesFromParentAttempt">;
  plannedChanges: string[];
}

export interface DuplicateAttemptIdentifiers {
  attemptId: string;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function uniqueNonEmpty(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function buildDuplicatedAttempt(
  sourceAttempt: Attempt,
  nextAttemptNumber: number,
  input: DuplicateAttemptInput,
  now: string,
  ids: DuplicateAttemptIdentifiers,
): Attempt {
  const plannedChanges = uniqueNonEmpty(input.plannedChanges);
  if (plannedChanges.length === 0) {
    throw new Error("Identify at least one planned change before creating the next Attempt.");
  }

  return attemptSchema.parse({
    attemptId: ids.attemptId,
    projectId: sourceAttempt.projectId,
    schemaVersion: sourceAttempt.schemaVersion,
    parentAttemptId: sourceAttempt.attemptId,
    attemptNumber: nextAttemptNumber,
    status: "DRAFT",
    printerContext: clone(input.printerContext),
    materialContext: clone(input.materialContext),
    processContext: {
      ...clone(input.processContext),
      changesFromParentAttempt: plannedChanges,
    },
    sourceReferences: clone(sourceAttempt.sourceReferences),
    comparisonIds: [],
    printerTechnologyIndex: input.printerContext.technology,
    materialClassIndex: input.materialContext.materialClass,
    createdAt: now,
    updatedAt: now,
  });
}

export async function duplicateAttemptInProject(
  database: PrintPalDatabase,
  projectId: string,
  sourceAttemptId: string,
  input: DuplicateAttemptInput,
  now = new Date().toISOString(),
  ids: DuplicateAttemptIdentifiers = { attemptId: crypto.randomUUID() },
): Promise<{ project: Project; attempt: Attempt; sourceAttempt: Attempt }> {
  return database.transaction("rw", database.projects, database.attempts, async () => {
    const [project, sourceAttempt, projectAttempts] = await Promise.all([
      database.projects.get(projectId),
      database.attempts.get(sourceAttemptId),
      database.attempts.where("projectId").equals(projectId).toArray(),
    ]);

    if (!project) throw new Error(`Project not found: ${projectId}`);
    if (!sourceAttempt) throw new Error(`Source Attempt not found: ${sourceAttemptId}`);
    if (sourceAttempt.projectId !== project.projectId) {
      throw new Error("The source Attempt does not belong to the selected Project.");
    }
    if (project.status === "ARCHIVED") {
      throw new Error("Restore the Project before creating a new Attempt.");
    }
    if (projectAttempts.some((attempt) => attempt.attemptId === ids.attemptId)) {
      throw new Error("The generated Attempt identifier already exists.");
    }

    const nextAttemptNumber =
      projectAttempts.reduce((maximum, attempt) => Math.max(maximum, attempt.attemptNumber), 0) + 1;
    const attempt = buildDuplicatedAttempt(
      sourceAttempt,
      nextAttemptNumber,
      input,
      now,
      ids,
    );

    const updatedProject = projectSchema.parse({
      ...project,
      status: project.status === "COMPLETED" ? "ACTIVE" : project.status,
      attemptIds: [...project.attemptIds, attempt.attemptId],
      updatedAt: now,
    });

    await database.attempts.add(attempt);
    await database.projects.put(updatedProject);

    return { project: updatedProject, attempt, sourceAttempt };
  });
}

export async function duplicateAttempt(
  projectId: string,
  sourceAttemptId: string,
  input: DuplicateAttemptInput,
): Promise<{ project: Project; attempt: Attempt; sourceAttempt: Attempt }> {
  return duplicateAttemptInProject(applicationDb, projectId, sourceAttemptId, input);
}

export function isInheritedValue<T>(sourceValue: T, candidateValue: T): boolean {
  return JSON.stringify(sourceValue) === JSON.stringify(candidateValue);
}
