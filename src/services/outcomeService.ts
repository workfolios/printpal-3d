import type { PrintPalDatabase } from "../data/db";
import { db as applicationDb } from "../data/db";
import {
  canTransitionAttemptStatus,
  type AttemptStatus,
} from "../domain/lifecycle";
import { attemptSchema } from "../domain/schemas/attemptSchema";
import { outcomeSchema } from "../domain/schemas/outcomeSchema";
import { projectSchema } from "../domain/schemas/projectSchema";
import type { Attempt, Outcome, Project, SuccessCriterionResult } from "../domain/types";

export type OutcomeStatus = Outcome["status"];
export type SuccessCriterionResultStatus = SuccessCriterionResult["status"];

export interface OutcomeCaptureInput {
  status: OutcomeStatus;
  completedAt?: string;
  successCriteriaResults: SuccessCriterionResult[];
  observedResult: string;
  detailedObservations?: string[];
  deviationsOrDefects?: string[];
  unexpectedConditions?: string[];
  postProcessingPerformed?: string[];
  lessonsLearned?: string[];
  userNotes?: string;
}

function uniqueNonEmpty(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function validateSuccessCriteriaResults(
  project: Project,
  results: SuccessCriterionResult[],
): SuccessCriterionResult[] {
  const resultMap = new Map<string, SuccessCriterionResult>();
  for (const result of results) {
    const criterion = result.criterion.trim();
    if (resultMap.has(criterion)) {
      throw new Error(`Duplicate success-criterion result: ${criterion}`);
    }
    resultMap.set(criterion, { ...result, criterion });
  }

  const missing = project.successCriteria.filter((criterion) => !resultMap.has(criterion));
  const unknown = Array.from(resultMap.keys()).filter(
    (criterion) => !project.successCriteria.includes(criterion),
  );

  if (missing.length > 0 || unknown.length > 0) {
    throw new Error(
      "Outcome success-criterion results must match the current Project success criteria exactly.",
    );
  }

  return project.successCriteria.map((criterion) => resultMap.get(criterion)!);
}

export function buildOutcome(
  project: Project,
  input: OutcomeCaptureInput,
  now = new Date().toISOString(),
): Outcome {
  const observedResult = input.observedResult.trim();
  if (!observedResult) {
    throw new Error("Observed result is required before the Outcome can be saved.");
  }

  const completedAt = input.completedAt || now;
  const successCriteriaResults = validateSuccessCriteriaResults(
    project,
    input.successCriteriaResults,
  );

  return outcomeSchema.parse({
    status: input.status,
    completedAt,
    successCriteriaResults,
    observations: uniqueNonEmpty([
      observedResult,
      ...(input.detailedObservations ?? []),
    ]),
    deviationsOrDefects: uniqueNonEmpty(input.deviationsOrDefects ?? []),
    unexpectedConditions: uniqueNonEmpty(input.unexpectedConditions ?? []),
    postProcessingPerformed: uniqueNonEmpty(input.postProcessingPerformed ?? []),
    lessonsLearned: uniqueNonEmpty(input.lessonsLearned ?? []),
    userNotes: input.userNotes?.trim() || undefined,
    summary: observedResult,
    summaryOrigin: "USER_AUTHORED",
  });
}

export function resolveOutcomeAttemptStatus(
  currentStatus: AttemptStatus,
  outcomeStatus: OutcomeStatus,
): AttemptStatus {
  if (currentStatus === "ARCHIVED") {
    throw new Error("Restore the Attempt before recording or editing its Outcome.");
  }

  const targetStatus: AttemptStatus =
    outcomeStatus === "NOT_YET_EVALUATED" ? "PRINTED" : "OUTCOME_RECORDED";
  let status: AttemptStatus = currentStatus;

  const transition = (nextStatus: AttemptStatus) => {
    if (!canTransitionAttemptStatus(status, nextStatus)) {
      throw new Error(`Invalid Attempt lifecycle transition: ${status} -> ${nextStatus}`);
    }
    status = nextStatus;
  };

  if (status === "DRAFT") transition("PLANNED");
  if (status === "PLANNED") transition("PRINTED");

  if (targetStatus === "PRINTED") {
    if (status !== "PRINTED") {
      throw new Error(
        `Cannot change an Attempt in ${status} status back to a not-yet-evaluated Outcome.`,
      );
    }
    return status;
  }

  if (status === "PRINTED") transition("OUTCOME_RECORDED");
  if (status === "COMPARED") transition("OUTCOME_RECORDED");

  if (status !== "OUTCOME_RECORDED") {
    throw new Error(
      `Cannot record an evaluated Outcome while the Attempt is in ${status} status.`,
    );
  }

  return status;
}

export async function saveOutcomeForAttempt(
  database: PrintPalDatabase,
  projectId: string,
  attemptId: string,
  input: OutcomeCaptureInput,
  now = new Date().toISOString(),
): Promise<{ project: Project; attempt: Attempt; outcome: Outcome }> {
  return database.transaction("rw", database.projects, database.attempts, async () => {
    const [project, currentAttempt] = await Promise.all([
      database.projects.get(projectId),
      database.attempts.get(attemptId),
    ]);

    if (!project) throw new Error(`Project not found: ${projectId}`);
    if (!currentAttempt) throw new Error(`Attempt not found: ${attemptId}`);
    if (currentAttempt.projectId !== project.projectId) {
      throw new Error("The selected Attempt does not belong to the selected Project.");
    }

    const outcome = buildOutcome(project, input, now);
    const nextAttemptStatus = resolveOutcomeAttemptStatus(
      currentAttempt.status,
      outcome.status,
    );

    const attempt = attemptSchema.parse({
      ...currentAttempt,
      outcome,
      status: nextAttemptStatus,
      completedAt: outcome.completedAt ?? currentAttempt.completedAt ?? now,
      updatedAt: now,
    });

    const updatedProject = projectSchema.parse({
      ...project,
      updatedAt: now,
    });

    await database.attempts.put(attempt);
    await database.projects.put(updatedProject);

    return { project: updatedProject, attempt, outcome };
  });
}

export async function saveOutcomeToAttempt(
  projectId: string,
  attemptId: string,
  input: OutcomeCaptureInput,
): Promise<{ project: Project; attempt: Attempt; outcome: Outcome }> {
  return saveOutcomeForAttempt(applicationDb, projectId, attemptId, input);
}
