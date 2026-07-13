import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createPrintPalDatabase, type PrintPalDatabase } from "../../data/db";
import { createProjectWithFirstAttempt } from "../../data/transactions";
import type { Attempt, Project } from "../../domain/types";
import {
  buildDeterministicComparison,
  createDeterministicComparisonInProject,
} from "../comparisonService";

const projectId = "11111111-1111-4111-8111-111111111111";
const attemptAId = "22222222-2222-4222-8222-222222222222";
const attemptBId = "33333333-3333-4333-8333-333333333333";
const attemptCId = "55555555-5555-4555-8555-555555555555";
const comparisonId = "44444444-4444-4444-8444-444444444444";
const createdAt = "2026-07-13T12:00:00.000Z";
const comparedAt = "2026-07-13T14:00:00.000Z";

function project(): Project {
  return {
    projectId,
    schemaVersion: 1,
    title: "PETG clip",
    purpose: "Compare two documented attempts",
    successCriteria: ["Clip fits", "Clip survives handling"],
    tags: ["PETG"],
    status: "ACTIVE",
    attemptIds: [attemptAId, attemptBId],
    createdAt,
    updatedAt: createdAt,
  };
}

function attempt(id: string, number: number): Attempt {
  const second = number === 2;
  return {
    attemptId: id,
    projectId,
    schemaVersion: 1,
    parentAttemptId: second ? attemptAId : undefined,
    attemptNumber: number,
    status: "OUTCOME_RECORDED",
    printerContext: { technology: "FFF_FDM", manufacturer: "Example Maker", model: "P1", unknownInformation: false },
    materialContext: { materialClass: "PETG", manufacturer: "Example Material", productOrResinName: "PETG Pro", color: "Black", unknownInformation: false },
    processContext: {
      slicerName: "Example Slicer",
      profileReference: "PETG baseline",
      plannedAttemptDescription: second ? "Rotate the part" : "Baseline orientation",
      knownConcerns: ["Bed adhesion"],
      settingsSnapshotOrNotes: second ? "Orientation rotated 90 degrees" : "Baseline orientation",
      plannedVariables: second ? ["Orientation"] : [],
      environmentalObservations: second ? undefined : "Room stable",
      changesFromParentAttempt: second ? ["Rotate the part orientation"] : [],
    },
    sourceReferences: [],
    outcome: {
      status: second ? "SUCCESSFUL" : "PARTIALLY_SUCCESSFUL",
      completedAt: createdAt,
      successCriteriaResults: [
        { criterion: "Clip fits", status: "MET" },
        { criterion: "Clip survives handling", status: second ? "MET" : "PARTIALLY_MET" },
      ],
      observations: [second ? "Clip fit without flex" : "Clip fit with minor flex"],
      deviationsOrDefects: second ? [] : ["Minor edge lift"],
      unexpectedConditions: [],
      postProcessingPerformed: [],
      lessonsLearned: second ? ["Rotated orientation was recorded"] : ["Test orientation"],
      summary: second ? "Clip fit without flex" : "Clip fit with minor flex",
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

beforeEach(async () => {
  db = createPrintPalDatabase(`printpal-comparison-${crypto.randomUUID()}`);
  await createProjectWithFirstAttempt(db, project(), attempt(attemptAId, 1));
  await db.attempts.add(attempt(attemptBId, 2));
});

afterEach(async () => {
  db.close();
  await db.delete();
});

describe("deterministic comparison", () => {
  it("separates constants, recorded changes, declared changes, missing information, and Outcome differences", () => {
    const comparison = buildDeterministicComparison(
      project(),
      attempt(attemptAId, 1),
      attempt(attemptBId, 2),
      comparedAt,
      comparisonId,
    );

    expect(comparison.constants.some((field) => field.fieldPath === "printerContext.model")).toBe(true);
    expect(comparison.changes.some((field) => field.fieldPath === "processContext.settingsSnapshotOrNotes")).toBe(true);
    expect(comparison.intentionalChanges).toEqual(["Rotate the part orientation"]);
    expect(comparison.missingInformation).toContain("Source References is not recorded for either Attempt.");
    expect(comparison.outcomeDifferences).toContain("Outcome status changed from PARTIALLY_SUCCESSFUL to SUCCESSFUL.");
    expect(comparison.outcomeDifferences).toContain("Criterion “Clip survives handling” changed from PARTIALLY_MET to MET.");
    expect(comparison.modelInferences).toEqual([]);
    expect(comparison.supportedObservations.join(" ")).not.toMatch(/caused|because of/i);
    expect(comparison.uncertainties.join(" ")).toMatch(/does not establish causation/i);
  });

  it("stores the Comparison and links both Attempts transactionally", async () => {
    const result = await createDeterministicComparisonInProject(
      db,
      projectId,
      attemptAId,
      attemptBId,
      comparedAt,
      comparisonId,
    );

    expect(result.created).toBe(true);
    expect(result.attemptA.status).toBe("COMPARED");
    expect(result.attemptB.status).toBe("COMPARED");
    expect(result.attemptA.comparisonIds).toEqual([comparisonId]);
    expect(result.attemptB.comparisonIds).toEqual([comparisonId]);
    expect((await db.comparisons.get(comparisonId))?.comparisonId).toBe(comparisonId);
    expect((await db.attempts.get(attemptAId))?.completedAt).toBe(createdAt);
  });

  it("returns the existing record for the same unordered Attempt pair", async () => {
    await createDeterministicComparisonInProject(db, projectId, attemptAId, attemptBId, comparedAt, comparisonId);
    const repeated = await createDeterministicComparisonInProject(
      db,
      projectId,
      attemptBId,
      attemptAId,
      "2026-07-13T15:00:00.000Z",
      "55555555-5555-4555-8555-555555555555",
    );

    expect(repeated.created).toBe(false);
    expect(repeated.comparison.comparisonId).toBe(comparisonId);
    expect(await db.comparisons.count()).toBe(1);
  });

  it("does not reuse planned-change declarations from unrelated Attempt relationships", () => {
    const siblingA = attempt(attemptBId, 2);
    const siblingB: Attempt = {
      ...attempt(attemptCId, 3),
      parentAttemptId: attemptAId,
      materialContext: {
        ...attempt(attemptCId, 3).materialContext,
        color: "White",
      },
      processContext: {
        ...attempt(attemptCId, 3).processContext,
        changesFromParentAttempt: ["Change material color"],
      },
    };
    const siblingProject = { ...project(), attemptIds: [attemptAId, attemptBId, attemptCId] };

    const comparison = buildDeterministicComparison(
      siblingProject,
      siblingA,
      siblingB,
      comparedAt,
      comparisonId,
    );

    expect(comparison.intentionalChanges).toEqual([]);
    expect(comparison.unknownChanges).toContain(
      "Material Color changed without a matching declared planned-change reference.",
    );
    expect(comparison.uncertainties.join(" ")).toMatch(/not a direct parent-child pair/i);
  });

  it("rejects an Attempt that is not indexed by the selected Project", () => {
    const orphan = attempt(attemptCId, 3);
    expect(() => buildDeterministicComparison(project(), attempt(attemptAId, 1), orphan)).toThrow(
      "is not indexed by the selected Project",
    );
  });

  it("rejects unevaluated Attempts", () => {
    const unevaluated = attempt(attemptBId, 2);
    unevaluated.status = "PRINTED";
    unevaluated.outcome = { ...unevaluated.outcome!, status: "NOT_YET_EVALUATED" };
    expect(() => buildDeterministicComparison(project(), attempt(attemptAId, 1), unevaluated)).toThrow("must be evaluated");
  });
});
