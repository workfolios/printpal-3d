import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createPrintPalDatabase, type PrintPalDatabase } from "../../data/db";
import { comparisonSchema } from "../../domain/schemas/comparisonSchema";
import type { Attempt, Comparison, Project } from "../../domain/types";
import { findDecisionSupportSafetyViolations } from "../../decisionSupport/outputSafety";
import {
  buildRulesBasedInterpretation,
  buildRulesBasedNextTest,
} from "../../decisionSupport/fallback";
import {
  applyInterpretationEdits,
  applyNextTestEdits,
  buildDeterministicComparisonPackage,
  isComparisonCurrent,
  nextTestPlanFromEnvelope,
  requestComparisonInterpretation,
  requestNextTestPlan,
  saveNextTestPlanForComparisonInDatabase,
} from "../decisionSupportService";
import { createDeterministicComparisonInProject } from "../comparisonService";

const projectId = "11111111-1111-4111-8111-111111111111";
const attemptAId = "22222222-2222-4222-8222-222222222222";
const attemptBId = "33333333-3333-4333-8333-333333333333";
const comparisonId = "44444444-4444-4444-8444-444444444444";
const planId = "55555555-5555-4555-8555-555555555555";
const createdAt = "2026-07-13T12:00:00.000Z";
const comparedAt = "2026-07-13T14:00:00.000Z";

function makeProject(): Project {
  return {
    projectId,
    schemaVersion: 1,
    title: "PETG clip",
    purpose: "Compare two attempts",
    successCriteria: ["Clip fits"],
    tags: ["PETG"],
    status: "ACTIVE",
    attemptIds: [attemptAId, attemptBId],
    createdAt,
    updatedAt: createdAt,
  };
}

function makeAttempt(id: string, attemptNumber: number): Attempt {
  const second = attemptNumber === 2;
  return {
    attemptId: id,
    projectId,
    schemaVersion: 1,
    parentAttemptId: second ? attemptAId : undefined,
    attemptNumber,
    status: "OUTCOME_RECORDED",
    printerContext: {
      technology: "FFF_FDM",
      manufacturer: "Example Maker",
      model: "P1",
      unknownInformation: false,
    },
    materialContext: {
      materialClass: "PETG",
      manufacturer: "Example Material",
      productOrResinName: "PETG Pro",
      unknownInformation: false,
    },
    processContext: {
      plannedAttemptDescription: second ? "Rotate the part" : "Baseline orientation",
      knownConcerns: [],
      settingsSnapshotOrNotes: second ? "Rotated orientation" : "Baseline orientation",
      plannedVariables: second ? ["Orientation"] : [],
      changesFromParentAttempt: second ? ["Rotate the part orientation"] : [],
    },
    sourceReferences: [],
    outcome: {
      status: second ? "SUCCESSFUL" : "PARTIALLY_SUCCESSFUL",
      completedAt: createdAt,
      successCriteriaResults: [
        { criterion: "Clip fits", status: second ? "MET" : "PARTIALLY_MET" },
      ],
      observations: [second ? "Stable fit" : "Minor flex"],
      deviationsOrDefects: [],
      unexpectedConditions: [],
      postProcessingPerformed: [],
      lessonsLearned: [],
      summary: second ? "Stable fit" : "Minor flex",
      summaryOrigin: "USER_AUTHORED",
    },
    comparisonIds: [],
    printerTechnologyIndex: "FFF_FDM",
    materialClassIndex: "PETG",
    createdAt,
    updatedAt: createdAt,
    completedAt: createdAt,
  };
}

let db: PrintPalDatabase;
let comparison: Comparison;

beforeEach(async () => {
  db = createPrintPalDatabase(`printpal-decision-${crypto.randomUUID()}`);
  await db.projects.add(makeProject());
  await db.attempts.bulkAdd([
    makeAttempt(attemptAId, 1),
    makeAttempt(attemptBId, 2),
  ]);
  const result = await createDeterministicComparisonInProject(
    db,
    projectId,
    attemptAId,
    attemptBId,
    comparedAt,
    comparisonId,
  );
  comparison = result.comparison;
});

afterEach(async () => {
  db.close();
  await db.delete();
});

describe("Slice Seven decision support", () => {
  it("builds a normalized package from deterministic facts only", () => {
    const facts = buildDeterministicComparisonPackage(comparison);
    expect(facts.comparisonId).toBe(comparisonId);
    expect(facts.changes.length).toBeGreaterThan(0);
    expect(facts).not.toHaveProperty("modelInferences");
    expect(facts).not.toHaveProperty("interpretationSummary");
    expect(facts).not.toHaveProperty("nextTestPlanId");
  });

  it("creates bounded fallback interpretation and one-variable planning content", () => {
    const facts = buildDeterministicComparisonPackage(comparison);
    const interpretation = buildRulesBasedInterpretation(facts);
    const plan = buildRulesBasedNextTest(facts);

    expect(interpretation.interpretationSummary).toMatch(/do not identify a proven cause/i);
    expect(plan.primaryVariable).toBeTruthy();
    expect(plan.testQuestion).toContain(plan.primaryVariable);
    expect(findDecisionSupportSafetyViolations(interpretation)).toEqual([]);
    expect(findDecisionSupportSafetyViolations(plan)).toEqual([]);
  });

  it("detects disallowed certainty and operating-value language", () => {
    const facts = buildDeterministicComparisonPackage(comparison);
    const interpretation = buildRulesBasedInterpretation(facts);
    const plan = buildRulesBasedNextTest(facts);
    interpretation.interpretationSummary = ["The root", "cause is orientation."].join(" ");
    plan.observationOrMeasurementPlan = [["Set temperature", "to 250 C."].join(" ")];

    expect(findDecisionSupportSafetyViolations(interpretation).length).toBeGreaterThan(0);
    expect(findDecisionSupportSafetyViolations(plan).length).toBeGreaterThan(0);
  });

  it("uses labeled fallback envelopes when the AI routes are unavailable", async () => {
    const facts = buildDeterministicComparisonPackage(comparison);
    const failingFetch = async () => {
      throw new Error("offline");
    };

    const interpretation = await requestComparisonInterpretation(
      facts,
      failingFetch as typeof fetch,
    );
    const nextTest = await requestNextTestPlan(facts, failingFetch as typeof fetch);

    expect(interpretation.origin).toBe("RULES_BASED_FALLBACK");
    expect(interpretation.data?.interpretationSummary).toBeTruthy();
    expect(nextTest.origin).toBe("RULES_BASED_FALLBACK");
    expect(nextTest.data?.primaryVariable).toBeTruthy();
  });

  it("marks AI-authored interpretation as user edited while retaining metadata", () => {
    const content = buildRulesBasedInterpretation(
      buildDeterministicComparisonPackage(comparison),
    );
    const interpreted = comparisonSchema.parse({
      ...comparison,
      ...content,
      interpretationOrigin: "AI_ASSISTED",
      interpretationPromptVersion: "test-prompt",
      interpretationRulesVersion: "test-rules",
      interpretationModel: "test-model",
      interpretedAt: comparedAt,
    });
    const edited = applyInterpretationEdits(
      interpreted,
      { ...content, interpretationSummary: "User-refined cautious summary." },
      "Clarified wording",
    );

    expect(edited.interpretationOrigin).toBe("AI_ASSISTED_USER_EDITED");
    expect(edited.interpretationModel).toBe("test-model");
    expect(edited.userEdits).toBe("Clarified wording");
  });

  it("persists one accepted plan and links it to the latest compared Attempt", async () => {
    const facts = buildDeterministicComparisonPackage(comparison);
    const envelope = {
      ok: true as const,
      data: buildRulesBasedNextTest(facts),
      origin: "RULES_BASED_FALLBACK" as const,
      promptVersion: "next-test-test",
      rulesVersion: "next-test-rules-test",
      warnings: [],
      generatedAt: comparedAt,
    };
    const draft = nextTestPlanFromEnvelope(projectId, comparisonId, envelope);
    const accepted = applyNextTestEdits(
      { ...draft, nextTestPlanId: planId },
      {
        testQuestion: draft.testQuestion,
        primaryVariable: draft.primaryVariable,
        supportingVariable: draft.supportingVariable,
        constants: draft.constants,
        observationOrMeasurementPlan: draft.observationOrMeasurementPlan,
        sourceChecks: draft.sourceChecks,
        expectedLearning: draft.expectedLearning,
        uncertainty: draft.uncertainty,
      },
      "ACCEPTED",
    );

    await saveNextTestPlanForComparisonInDatabase(db, comparisonId, accepted);
    expect((await db.comparisons.get(comparisonId))?.nextTestPlanId).toBe(planId);
    expect((await db.attempts.get(attemptBId))?.nextTestPlanId).toBe(planId);
    expect((await db.attempts.get(attemptAId))?.nextTestPlanId).toBeUndefined();
  });

  it("removes the Attempt link when an accepted plan is later rejected", async () => {
    const facts = buildDeterministicComparisonPackage(comparison);
    const envelope = {
      ok: true as const,
      data: buildRulesBasedNextTest(facts),
      origin: "RULES_BASED_FALLBACK" as const,
      warnings: [],
      generatedAt: comparedAt,
    };
    const draft = nextTestPlanFromEnvelope(projectId, comparisonId, envelope);
    const content = {
      testQuestion: draft.testQuestion,
      primaryVariable: draft.primaryVariable,
      supportingVariable: draft.supportingVariable,
      constants: draft.constants,
      observationOrMeasurementPlan: draft.observationOrMeasurementPlan,
      sourceChecks: draft.sourceChecks,
      expectedLearning: draft.expectedLearning,
      uncertainty: draft.uncertainty,
    };
    const accepted = applyNextTestEdits(draft, content, "ACCEPTED");
    await saveNextTestPlanForComparisonInDatabase(db, comparisonId, accepted);
    const rejected = applyNextTestEdits(accepted, content, "REJECTED");
    await saveNextTestPlanForComparisonInDatabase(db, comparisonId, rejected);

    expect((await db.attempts.get(attemptBId))?.nextTestPlanId).toBeUndefined();
    expect((await db.nextTestPlans.get(rejected.nextTestPlanId))?.approvalStatus).toBe("REJECTED");
  });

  it("recognizes when a deterministic comparison has become stale", async () => {
    const currentA = await db.attempts.get(attemptAId);
    const currentB = await db.attempts.get(attemptBId);
    expect(currentA && currentB && isComparisonCurrent(comparison, currentA, currentB)).toBe(true);

    await db.attempts.update(attemptBId, {
      status: "OUTCOME_RECORDED",
      updatedAt: "2026-07-13T15:00:00.000Z",
    });
    const changedB = await db.attempts.get(attemptBId);
    expect(currentA && changedB && isComparisonCurrent(comparison, currentA, changedB)).toBe(false);
  });
});
