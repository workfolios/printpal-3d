import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createPrintPalDatabase, type PrintPalDatabase } from "../../data/db";
import { createProjectWithFirstAttempt } from "../../data/transactions";
import type { Attempt, Project } from "../../domain/types";
import {
  buildDuplicatedAttempt,
  duplicateAttemptInProject,
  type DuplicateAttemptInput,
} from "../attemptDuplicationService";
import {
  buildOutcome,
  saveOutcomeForAttempt,
  type OutcomeCaptureInput,
} from "../outcomeService";

const createdAt = "2026-07-12T12:00:00.000Z";
const outcomeAt = "2026-07-12T13:00:00.000Z";
const duplicateAt = "2026-07-12T14:00:00.000Z";
const projectId = "11111111-1111-4111-8111-111111111111";
const attempt1Id = "22222222-2222-4222-8222-222222222222";
const attempt2Id = "33333333-3333-4333-8333-333333333333";
const sourceId = "44444444-4444-4444-8444-444444444444";

function makeProject(): Project {
  return {
    projectId,
    schemaVersion: 1,
    title: "PETG cable clip",
    purpose: "Create a repeatable functional part",
    description: "Workshop cable clip",
    successCriteria: ["Clip fits the cable", "Clip survives normal handling"],
    tags: ["PETG"],
    status: "ACTIVE",
    attemptIds: [attempt1Id],
    createdAt,
    updatedAt: createdAt,
  };
}

function makeAttempt(): Attempt {
  return {
    attemptId: attempt1Id,
    projectId,
    schemaVersion: 1,
    attemptNumber: 1,
    status: "PLANNED",
    printerContext: {
      technology: "FFF_FDM",
      manufacturer: "Example Maker",
      model: "Example Printer",
      unknownInformation: false,
    },
    materialContext: {
      materialClass: "PETG",
      manufacturer: "Example Material Maker",
      productOrResinName: "PETG Pro",
      color: "Black",
      unknownInformation: false,
    },
    processContext: {
      slicerName: "Example Slicer",
      profileReference: "PETG baseline",
      plannedAttemptDescription: "Establish fit with baseline orientation",
      knownConcerns: ["Bed adhesion"],
      settingsSnapshotOrNotes: "User-entered baseline settings",
      plannedVariables: ["Orientation"],
      changesFromParentAttempt: [],
    },
    sourceReferences: [
      {
        sourceId,
        category: "MANUFACTURER_DOCUMENTATION",
        title: "Manufacturer PETG guide",
        authorityClassification: "AUTHORITATIVE",
        createdAt,
      },
    ],
    plan: {
      objectiveSummary: "Prepare a documented baseline attempt",
      readinessConsiderations: [],
      printerWatchOuts: [],
      materialWatchOuts: [],
      assumptions: [],
      missingInformation: [],
      sourceChecks: ["Review the manufacturer PETG guide"],
      variablesToRecord: ["Orientation"],
      expectedOutcomeCriteria: ["Clip fits the cable"],
      origin: "USER_AUTHORED",
      generatedAt: createdAt,
    },
    comparisonIds: [],
    printerTechnologyIndex: "FFF_FDM",
    materialClassIndex: "PETG",
    createdAt,
    updatedAt: createdAt,
  };
}

function makeOutcomeInput(
  status: OutcomeCaptureInput["status"] = "PARTIALLY_SUCCESSFUL",
): OutcomeCaptureInput {
  return {
    status,
    successCriteriaResults: [
      { criterion: "Clip fits the cable", status: "MET" },
      {
        criterion: "Clip survives normal handling",
        status: status === "SUCCESSFUL" ? "MET" : "PARTIALLY_MET",
        notes: "Minor flex observed",
      },
    ],
    observedResult: "The clip fit and retained the cable, with minor flex at the opening.",
    detailedObservations: ["First layer remained attached"],
    deviationsOrDefects: ["Small edge lift"],
    unexpectedConditions: ["Room temperature changed during the print"],
    postProcessingPerformed: ["Removed support material"],
    lessonsLearned: ["Record orientation explicitly on the next attempt"],
    userNotes: "No causal conclusion recorded.",
  };
}

function makeDuplicateInput(source: Attempt): DuplicateAttemptInput {
  const { changesFromParentAttempt: _changes, ...processContext } = source.processContext;
  return {
    printerContext: structuredClone(source.printerContext),
    materialContext: structuredClone(source.materialContext),
    processContext: {
      ...structuredClone(processContext),
      plannedAttemptDescription: "Test a rotated orientation while preserving other context",
      plannedVariables: ["Orientation"],
    },
    plannedChanges: ["Rotate the part orientation"],
  };
}

let db: PrintPalDatabase;

beforeEach(async () => {
  db = createPrintPalDatabase(`printpal-slice5-${crypto.randomUUID()}`);
  await createProjectWithFirstAttempt(db, makeProject(), makeAttempt());
});

afterEach(async () => {
  db.close();
  await db.delete();
});

describe("Outcome Capture", () => {
  it.each([
    "SUCCESSFUL",
    "PARTIALLY_SUCCESSFUL",
    "FAILED",
    "ABORTED",
    "NOT_YET_EVALUATED",
  ] as const)("supports the %s outcome state", (status) => {
    expect(buildOutcome(makeProject(), makeOutcomeInput(status), outcomeAt).status).toBe(status);
  });

  it("saves a completed Outcome and advances the Attempt lifecycle", async () => {
    const result = await saveOutcomeForAttempt(
      db,
      projectId,
      attempt1Id,
      makeOutcomeInput(),
      outcomeAt,
    );

    expect(result.attempt.status).toBe("OUTCOME_RECORDED");
    expect(result.attempt.completedAt).toBe(outcomeAt);
    expect(result.outcome.summaryOrigin).toBe("USER_AUTHORED");
    expect(result.outcome.successCriteriaResults).toHaveLength(2);
    expect((await db.projects.get(projectId))?.updatedAt).toBe(outcomeAt);
  });

  it("keeps a not-yet-evaluated Outcome in the printed lifecycle state", async () => {
    const result = await saveOutcomeForAttempt(
      db,
      projectId,
      attempt1Id,
      makeOutcomeInput("NOT_YET_EVALUATED"),
      outcomeAt,
    );

    expect(result.attempt.status).toBe("PRINTED");
    expect(result.attempt.outcome?.status).toBe("NOT_YET_EVALUATED");
  });

  it("rejects criterion results that do not match the Project", () => {
    const invalid = makeOutcomeInput();
    invalid.successCriteriaResults = [
      { criterion: "Different criterion", status: "MET" },
    ];

    expect(() => buildOutcome(makeProject(), invalid, outcomeAt)).toThrow(
      "must match the current Project success criteria exactly",
    );
  });
});

describe("Attempt Duplication", () => {
  it("builds a clean child Attempt with inherited context and no prior Plan or Outcome", () => {
    const source = {
      ...makeAttempt(),
      outcome: buildOutcome(makeProject(), makeOutcomeInput(), outcomeAt),
      status: "OUTCOME_RECORDED" as const,
      completedAt: outcomeAt,
    };

    const duplicated = buildDuplicatedAttempt(
      source,
      2,
      makeDuplicateInput(source),
      duplicateAt,
      { attemptId: attempt2Id },
    );

    expect(duplicated.attemptId).toBe(attempt2Id);
    expect(duplicated.parentAttemptId).toBe(attempt1Id);
    expect(duplicated.attemptNumber).toBe(2);
    expect(duplicated.status).toBe("DRAFT");
    expect(duplicated.printerContext).toEqual(source.printerContext);
    expect(duplicated.sourceReferences).toEqual(source.sourceReferences);
    expect(duplicated.processContext.changesFromParentAttempt).toEqual([
      "Rotate the part orientation",
    ]);
    expect(duplicated.plan).toBeUndefined();
    expect(duplicated.outcome).toBeUndefined();
    expect(duplicated.completedAt).toBeUndefined();
    expect(duplicated.comparisonIds).toEqual([]);
  });

  it("duplicates an Attempt and updates the Project in one transaction", async () => {
    await saveOutcomeForAttempt(db, projectId, attempt1Id, makeOutcomeInput(), outcomeAt);
    const sourceBefore = await db.attempts.get(attempt1Id);
    if (!sourceBefore) throw new Error("Missing source fixture");

    const result = await duplicateAttemptInProject(
      db,
      projectId,
      attempt1Id,
      makeDuplicateInput(sourceBefore),
      duplicateAt,
      { attemptId: attempt2Id },
    );

    expect(result.project.attemptIds).toEqual([attempt1Id, attempt2Id]);
    expect(result.attempt.parentAttemptId).toBe(attempt1Id);
    expect(result.attempt.materialContext.materialClass).toBe("PETG");
    expect(result.attempt.outcome).toBeUndefined();
    expect(result.attempt.plan).toBeUndefined();
    expect(await db.attempts.count()).toBe(2);
    expect(await db.attempts.get(attempt1Id)).toEqual(sourceBefore);
  });

  it("rolls back when planned changes are missing", async () => {
    const source = await db.attempts.get(attempt1Id);
    if (!source) throw new Error("Missing source fixture");
    const input = makeDuplicateInput(source);
    input.plannedChanges = [];

    await expect(
      duplicateAttemptInProject(
        db,
        projectId,
        attempt1Id,
        input,
        duplicateAt,
        { attemptId: attempt2Id },
      ),
    ).rejects.toThrow("Identify at least one planned change");

    expect(await db.attempts.count()).toBe(1);
    expect((await db.projects.get(projectId))?.attemptIds).toEqual([attempt1Id]);
  });
});
