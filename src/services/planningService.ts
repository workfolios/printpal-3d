import type { Attempt, Plan, PlanContent, Project } from "../domain/types";
import { planSchema } from "../domain/schemas/planSchema";
import { planningResponseEnvelopeSchema, type PlanningRequest } from "../planning/contracts";
import { generateRulesBasedPlanEnvelope } from "../planning/fallbackPlan";
import type { PrintPlanningFormData, PrintPlanningEnvelope } from "../types";
import { attemptRepository, projectRepository } from "../data/repositories/instances";

export interface PlanningRequestOverrides {
  priority?: string;
  freeformContext?: string;
}

export function buildPlanningRequestFromRecord(
  project: Project,
  attempt: Attempt,
  overrides: PlanningRequestOverrides = {},
): PrintPlanningFormData {
  const printerName = [attempt.printerContext.manufacturer, attempt.printerContext.model]
    .filter(Boolean)
    .join(" ");
  const material = [
    attempt.materialContext.manufacturer,
    attempt.materialContext.productOrResinName,
    attempt.materialContext.materialClass,
  ]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(" · ");

  const contextParts = [
    attempt.processContext.plannedAttemptDescription,
    attempt.processContext.settingsSnapshotOrNotes
      ? `User-entered settings or technical context: ${attempt.processContext.settingsSnapshotOrNotes}`
      : undefined,
    overrides.freeformContext?.trim() || undefined,
  ].filter(Boolean);

  return {
    projectName: project.title,
    printGoal: attempt.processContext.plannedAttemptDescription || project.description || project.purpose,
    printerTech: attempt.printerContext.technology,
    printerName,
    material: material || attempt.materialContext.materialClass,
    purpose: project.purpose,
    priority: overrides.priority?.trim() || "Meet the recorded project success criteria",
    concerns: attempt.processContext.knownConcerns,
    notes: contextParts.join("\n\n"),
    successCriteria: project.successCriteria,
    sourceReferenceSummaries: attempt.sourceReferences.map((source) => {
      const category = source.category.replaceAll("_", " ");
      const owner = source.publisherOrOwner ? ` — ${source.publisherOrOwner}` : "";
      return `${source.title} [${category}]${owner}`;
    }),
  };
}

export async function requestPlanningEnvelope(
  input: PrintPlanningFormData,
  fetchImpl: typeof fetch = fetch,
): Promise<PrintPlanningEnvelope> {
  const request: PlanningRequest = {
    projectName: input.projectName,
    printGoal: input.printGoal,
    printerTech: input.printerTech,
    printerName: input.printerName,
    material: input.material,
    purpose: input.purpose,
    priority: input.priority,
    concerns: input.concerns,
    notes: input.notes,
    successCriteria: input.successCriteria ?? [],
    sourceReferenceSummaries: input.sourceReferenceSummaries ?? [],
  };

  try {
    const response = await fetchImpl("/api/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Planning request failed with status ${response.status}`);
    }

    const parsed = planningResponseEnvelopeSchema.safeParse(await response.json());
    if (!parsed.success || !parsed.data.data) {
      return generateRulesBasedPlanEnvelope(request, {
        warning: "The planning service returned an invalid or empty response. A labeled local rules-based draft was generated.",
        errorCode: "INVALID_AI_RESPONSE",
      });
    }

    return parsed.data as PrintPlanningEnvelope;
  } catch {
    return generateRulesBasedPlanEnvelope(request, {
      warning: "The planning service could not be reached. A labeled local rules-based draft was generated.",
      errorCode: "NETWORK_OR_RESPONSE_FAILURE",
    });
  }
}

export function planFromEnvelope(envelope: PrintPlanningEnvelope): Plan {
  if (!envelope.data) {
    throw new Error("Cannot create a Plan from an empty planning envelope.");
  }

  return planSchema.parse({
    ...envelope.data,
    origin: envelope.origin,
    promptVersion: envelope.promptVersion,
    rulesVersion: envelope.rulesVersion,
    generatedAt: envelope.generatedAt,
  });
}

export function createUserAuthoredPlan(project: Project, attempt: Attempt, now = new Date().toISOString()): Plan {
  return planSchema.parse({
    objectiveSummary:
      attempt.processContext.plannedAttemptDescription ||
      project.description ||
      `Create a documented plan for ${project.title}.`,
    readinessConsiderations: [],
    printerWatchOuts: [],
    materialWatchOuts: [],
    assumptions: [],
    missingInformation: [],
    sourceChecks: attempt.sourceReferences.map((source) => `Review the user-provided source reference: ${source.title}`),
    variablesToRecord: attempt.processContext.plannedVariables,
    expectedOutcomeCriteria: project.successCriteria,
    origin: "USER_AUTHORED",
    generatedAt: now,
  });
}

export function applyPlanEdits(current: Plan, content: PlanContent, userEdits?: string): Plan {
  const origin = current.origin === "AI_ASSISTED" ? "AI_ASSISTED_USER_EDITED" : current.origin;
  return {
    ...content,
    userEdits: userEdits?.trim() || undefined,
    origin,
    promptVersion: current.promptVersion,
    rulesVersion: current.rulesVersion,
    generatedAt: current.generatedAt,
  };
}

export async function savePlanToAttempt(attemptId: string, plan: Plan): Promise<Attempt> {
  const current = await attemptRepository.get(attemptId);
  if (!current) throw new Error(`Attempt not found: ${attemptId}`);

  const saved = await attemptRepository.update(attemptId, {
    plan,
    status: current.status === "DRAFT" ? "PLANNED" : current.status,
  });
  await projectRepository.update(current.projectId, {});
  return saved;
}
