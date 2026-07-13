import { db as applicationDb, type PrintPalDatabase } from "../data/db";
import {
  attemptRepository,
  comparisonRepository,
  nextTestPlanRepository,
  projectRepository,
} from "../data/repositories/instances";
import { comparisonSchema } from "../domain/schemas/comparisonSchema";
import {
  nextTestPlanContentSchema,
  nextTestPlanSchema,
} from "../domain/schemas/nextTestPlanSchema";
import type {
  Attempt,
  Comparison,
  NextTestPlan,
  NextTestPlanContent,
  OutputOrigin,
  Project,
} from "../domain/types";
import {
  comparisonInterpretationContentSchema,
  deterministicComparisonPackageSchema,
  interpretationResponseEnvelopeSchema,
  nextTestResponseEnvelopeSchema,
  type ComparisonInterpretationContent,
  type DeterministicComparisonPackage,
  type InterpretationResponseEnvelope,
  type NextTestResponseEnvelope,
} from "../decisionSupport/contracts";
import {
  generateRulesBasedInterpretationEnvelope,
  generateRulesBasedNextTestEnvelope,
} from "../decisionSupport/fallback";
import { assertDecisionSupportOutputSafe } from "../decisionSupport/outputSafety";
import { attemptSchema } from "../domain/schemas/attemptSchema";

export type NextTestApprovalStatus = "DRAFT" | "ACCEPTED" | "REJECTED";

export interface DecisionSupportRecord {
  project: Project;
  comparison: Comparison;
  attemptA: Attempt;
  attemptB: Attempt;
  nextTestPlan?: NextTestPlan;
  isCurrent: boolean;
}

export function buildDeterministicComparisonPackage(
  comparison: Comparison,
): DeterministicComparisonPackage {
  return deterministicComparisonPackageSchema.parse({
    projectId: comparison.projectId,
    comparisonId: comparison.comparisonId,
    attemptAId: comparison.attemptAId,
    attemptBId: comparison.attemptBId,
    constants: comparison.constants.map(({ label, value }) => ({ label, value })),
    changes: comparison.changes.map(({ label, attemptAValue, attemptBValue }) => ({
      label,
      attemptAValue,
      attemptBValue,
    })),
    intentionalChanges: comparison.intentionalChanges,
    unknownChanges: comparison.unknownChanges,
    missingInformation: comparison.missingInformation,
    outcomeDifferences: comparison.outcomeDifferences,
    supportedObservations: comparison.supportedObservations,
    deterministicUncertainties: comparison.uncertainties,
  });
}

export function isComparisonCurrent(
  comparison: Comparison,
  attemptA: Attempt,
  attemptB: Attempt,
): boolean {
  return (
    attemptA.status === "COMPARED" &&
    attemptB.status === "COMPARED" &&
    attemptA.comparisonIds.includes(comparison.comparisonId) &&
    attemptB.comparisonIds.includes(comparison.comparisonId) &&
    attemptA.updatedAt <= comparison.createdAt &&
    attemptB.updatedAt <= comparison.createdAt
  );
}

export async function loadDecisionSupportRecord(
  comparisonId: string,
): Promise<DecisionSupportRecord> {
  const comparison = await comparisonRepository.get(comparisonId);
  if (!comparison) throw new Error(`Comparison not found: ${comparisonId}`);
  const [project, attemptA, attemptB, plans] = await Promise.all([
    projectRepository.get(comparison.projectId),
    attemptRepository.get(comparison.attemptAId),
    attemptRepository.get(comparison.attemptBId),
    nextTestPlanRepository.listByProject(comparison.projectId),
  ]);
  if (!project) throw new Error(`Project not found: ${comparison.projectId}`);
  if (!attemptA) throw new Error(`Attempt not found: ${comparison.attemptAId}`);
  if (!attemptB) throw new Error(`Attempt not found: ${comparison.attemptBId}`);
  const nextTestPlan = comparison.nextTestPlanId
    ? plans.find((plan) => plan.nextTestPlanId === comparison.nextTestPlanId)
    : plans.find((plan) => plan.originatingComparisonId === comparison.comparisonId);
  return {
    project,
    comparison,
    attemptA,
    attemptB,
    nextTestPlan,
    isCurrent: isComparisonCurrent(comparison, attemptA, attemptB),
  };
}

export async function requestComparisonInterpretation(
  facts: DeterministicComparisonPackage,
  fetchImpl: typeof fetch = fetch,
): Promise<InterpretationResponseEnvelope> {
  try {
    const response = await fetchImpl("/api/interpret-comparison", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(facts),
    });
    if (!response.ok) throw new Error(`Interpretation request failed with status ${response.status}`);
    const parsed = interpretationResponseEnvelopeSchema.safeParse(await response.json());
    if (!parsed.success || !parsed.data.data) {
      return generateRulesBasedInterpretationEnvelope(facts, {
        warning: "The interpretation service returned an invalid or empty response. A labeled rules-based interpretation was generated.",
        errorCode: "INVALID_AI_RESPONSE",
      });
    }
    const data = assertDecisionSupportOutputSafe(parsed.data.data);
    return { ...parsed.data, data };
  } catch {
    return generateRulesBasedInterpretationEnvelope(facts, {
      warning: "The interpretation service could not be reached. A labeled rules-based interpretation was generated.",
      errorCode: "NETWORK_OR_RESPONSE_FAILURE",
    });
  }
}

export async function requestNextTestPlan(
  facts: DeterministicComparisonPackage,
  fetchImpl: typeof fetch = fetch,
): Promise<NextTestResponseEnvelope> {
  try {
    const response = await fetchImpl("/api/generate-next-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(facts),
    });
    if (!response.ok) throw new Error(`Next-test request failed with status ${response.status}`);
    const parsed = nextTestResponseEnvelopeSchema.safeParse(await response.json());
    if (!parsed.success || !parsed.data.data) {
      return generateRulesBasedNextTestEnvelope(facts, {
        warning: "The next-test service returned an invalid or empty response. A labeled rules-based plan was generated.",
        errorCode: "INVALID_AI_RESPONSE",
      });
    }
    const data = assertDecisionSupportOutputSafe(parsed.data.data);
    return { ...parsed.data, data };
  } catch {
    return generateRulesBasedNextTestEnvelope(facts, {
      warning: "The next-test service could not be reached. A labeled rules-based plan was generated.",
      errorCode: "NETWORK_OR_RESPONSE_FAILURE",
    });
  }
}

export function applyInterpretationEdits(
  current: Comparison,
  content: ComparisonInterpretationContent,
  userEdits?: string,
): Comparison {
  if (!current.interpretationOrigin || !current.interpretedAt) {
    throw new Error("Generate or create an interpretation before applying edits.");
  }
  const origin: OutputOrigin =
    current.interpretationOrigin === "AI_ASSISTED"
      ? "AI_ASSISTED_USER_EDITED"
      : current.interpretationOrigin;
  return comparisonSchema.parse({
    ...current,
    ...comparisonInterpretationContentSchema.parse(content),
    userEdits: userEdits?.trim() || undefined,
    interpretationOrigin: origin,
  });
}

export async function saveInterpretationToComparison(
  comparisonId: string,
  content: ComparisonInterpretationContent,
  envelope: InterpretationResponseEnvelope,
  userEdits?: string,
  now = new Date().toISOString(),
): Promise<Comparison> {
  const record = await loadDecisionSupportRecord(comparisonId);
  if (!record.isCurrent) {
    throw new Error("Refresh the deterministic Comparison before saving interpretation.");
  }
  const saved = comparisonSchema.parse({
    ...record.comparison,
    ...comparisonInterpretationContentSchema.parse(content),
    userEdits: userEdits?.trim() || undefined,
    interpretationOrigin: envelope.origin,
    interpretationPromptVersion: envelope.promptVersion,
    interpretationRulesVersion: envelope.rulesVersion,
    interpretationModel: envelope.model,
    interpretedAt: envelope.generatedAt || now,
  });
  await comparisonRepository.update(comparisonId, saved);
  return saved;
}

export async function saveEditedInterpretation(
  comparisonId: string,
  content: ComparisonInterpretationContent,
  userEdits?: string,
): Promise<Comparison> {
  const record = await loadDecisionSupportRecord(comparisonId);
  if (!record.isCurrent) {
    throw new Error("Refresh the deterministic Comparison before saving interpretation edits.");
  }
  const edited = applyInterpretationEdits(record.comparison, content, userEdits);
  await comparisonRepository.update(comparisonId, edited);
  return edited;
}

export function nextTestPlanFromEnvelope(
  projectId: string,
  comparisonId: string,
  envelope: NextTestResponseEnvelope,
  existing?: NextTestPlan,
  now = new Date().toISOString(),
): NextTestPlan {
  if (!envelope.data) throw new Error("Cannot create a Next-Test Plan from an empty envelope.");
  return nextTestPlanSchema.parse({
    ...nextTestPlanContentSchema.parse(envelope.data),
    nextTestPlanId: existing?.nextTestPlanId ?? crypto.randomUUID(),
    projectId,
    schemaVersion: 1,
    originatingComparisonId: comparisonId,
    approvalStatus: existing?.approvalStatus ?? "DRAFT",
    userEdits: existing?.userEdits,
    origin: envelope.origin,
    model: envelope.model,
    promptVersion: envelope.promptVersion,
    rulesVersion: envelope.rulesVersion,
    createdAt: existing?.createdAt ?? envelope.generatedAt ?? now,
    updatedAt: now,
  });
}

export function applyNextTestEdits(
  current: NextTestPlan,
  content: NextTestPlanContent,
  approvalStatus: NextTestApprovalStatus,
  userEdits?: string,
  now = new Date().toISOString(),
): NextTestPlan {
  const origin: OutputOrigin =
    current.origin === "AI_ASSISTED" ? "AI_ASSISTED_USER_EDITED" : current.origin;
  return nextTestPlanSchema.parse({
    ...current,
    ...nextTestPlanContentSchema.parse(content),
    approvalStatus,
    userEdits: userEdits?.trim() || undefined,
    origin,
    updatedAt: now,
  });
}

export function createUserAuthoredNextTestPlan(
  projectId: string,
  comparisonId: string,
  facts: DeterministicComparisonPackage,
  existing?: NextTestPlan,
  now = new Date().toISOString(),
): NextTestPlan {
  const primaryVariable = facts.intentionalChanges[0] || facts.changes[0]?.label || "User-selected primary variable";
  return nextTestPlanSchema.parse({
    nextTestPlanId: existing?.nextTestPlanId ?? crypto.randomUUID(),
    projectId,
    schemaVersion: 1,
    originatingComparisonId: comparisonId,
    testQuestion: `What should the next controlled Attempt test about ${primaryVariable}?`,
    primaryVariable,
    constants: facts.constants.slice(0, 6).map((constant) => constant.label),
    observationOrMeasurementPlan: facts.outcomeDifferences.slice(0, 4),
    sourceChecks: [],
    expectedLearning: "Document the learning objective before running the next Attempt.",
    uncertainty: facts.missingInformation,
    approvalStatus: "DRAFT",
    origin: "USER_AUTHORED",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });
}

export async function saveNextTestPlanForComparisonInDatabase(
  database: PrintPalDatabase,
  comparisonId: string,
  plan: NextTestPlan,
): Promise<NextTestPlan> {
  return database.transaction(
    "rw",
    database.comparisons,
    database.nextTestPlans,
    database.attempts,
    async () => {
      const comparison = await database.comparisons.get(comparisonId);
      if (!comparison) throw new Error(`Comparison not found: ${comparisonId}`);
      if (plan.originatingComparisonId !== comparisonId || plan.projectId !== comparison.projectId) {
        throw new Error("Next-Test Plan relationship does not match the Comparison.");
      }
      const [attemptA, attemptB] = await Promise.all([
        database.attempts.get(comparison.attemptAId),
        database.attempts.get(comparison.attemptBId),
      ]);
      if (!attemptA || !attemptB) throw new Error("Compared Attempts are unavailable.");
      if (!isComparisonCurrent(comparison, attemptA, attemptB)) {
        throw new Error("Refresh the deterministic Comparison before saving a Next-Test Plan.");
      }

      const validatedPlan = nextTestPlanSchema.parse(plan);
      if (
        comparison.nextTestPlanId &&
        comparison.nextTestPlanId !== validatedPlan.nextTestPlanId
      ) {
        await database.nextTestPlans.delete(comparison.nextTestPlanId);
      }
      await database.nextTestPlans.put(validatedPlan);
      await database.comparisons.put(
        comparisonSchema.parse({ ...comparison, nextTestPlanId: validatedPlan.nextTestPlanId }),
      );

      const latestAttempt = attemptA.attemptNumber >= attemptB.attemptNumber ? attemptA : attemptB;
      const otherAttempt = latestAttempt.attemptId === attemptA.attemptId ? attemptB : attemptA;
      const updatedLatest = attemptSchema.parse({
        ...latestAttempt,
        nextTestPlanId:
          validatedPlan.approvalStatus === "ACCEPTED"
            ? validatedPlan.nextTestPlanId
            : latestAttempt.nextTestPlanId === validatedPlan.nextTestPlanId
              ? undefined
              : latestAttempt.nextTestPlanId,
      });
      const updatedOther = attemptSchema.parse({
        ...otherAttempt,
        nextTestPlanId:
          otherAttempt.nextTestPlanId === validatedPlan.nextTestPlanId
            ? undefined
            : otherAttempt.nextTestPlanId,
      });
      await database.attempts.put(updatedLatest);
      await database.attempts.put(updatedOther);
      return validatedPlan;
    },
  );
}

export async function saveNextTestPlanForComparison(
  comparisonId: string,
  plan: NextTestPlan,
): Promise<NextTestPlan> {
  return saveNextTestPlanForComparisonInDatabase(applicationDb, comparisonId, plan);
}
