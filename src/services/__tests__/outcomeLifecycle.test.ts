import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createPrintPalDatabase, type PrintPalDatabase } from "../../data/db";
import { createProjectWithFirstAttempt } from "../../data/transactions";
import type { Attempt, Project } from "../../domain/types";
import {
  resolveOutcomeAttemptStatus,
  saveOutcomeForAttempt,
  type OutcomeCaptureInput,
} from "../outcomeService";

const createdAt = "2026-07-12T12:00:00.000Z";
const outcomeAt = "2026-07-12T13:00:00.000Z";
const projectId = "11111111-1111-4111-8111-111111111111";
const attemptId = "22222222-2222-4222-8222-222222222222";

function makeProject(): Project {
  return {
    projectId,
    schemaVersion: 1,
    title: "Lifecycle test project",
    purpose: "Verify governed Outcome transitions",
    successCriteria: ["Result can be evaluated"],
    tags: [],
    status: "ACTIVE",
    attemptIds: [attemptId],
    createdAt,
    updatedAt: createdAt,
  };
}

function makeDraftAttempt(): Attempt {
  return {
    attemptId,
    projectId,
    schemaVersion: 1,
    attemptNumber: 1,
    status: "DRAFT",
    printerContext: {
      technology: "FFF_FDM",
      unknownInformation: true,
    },
    materialContext: {
      materialClass: "UNKNOWN",
      unknownInformation: true,
    },
    processContext: {
      plannedVariables: [],
      changesFromParentAttempt: [],
    },
    sourceReferences: [],
    comparisonIds: [],
    printerTechnologyIndex: "FFF_FDM",
    materialClassIndex: "UNKNOWN",
    createdAt,
    updatedAt: createdAt,
  };
}

function makeOutcomeInput(
  status: OutcomeCaptureInput["status"],
): OutcomeCaptureInput {
  return {
    status,
    successCriteriaResults: [
      {
        criterion: "Result can be evaluated",
        status: status === "NOT_YET_EVALUATED" ? "NOT_EVALUATED" : "MET",
      },
    ],
    observedResult:
      status === "NOT_YET_EVALUATED"
        ? "The print completed and remains pending evaluation."
        : "The completed print was evaluated.",
  };
}

let db: PrintPalDatabase;

beforeEach(async () => {
  db = createPrintPalDatabase(`printpal-outcome-lifecycle-${crypto.randomUUID()}`);
  await createProjectWithFirstAttempt(db, makeProject(), makeDraftAttempt());
});

afterEach(async () => {
  db.close();
  await db.delete();
});

describe("governed Outcome lifecycle transitions", () => {
  it("resolves an evaluated Draft through Planned and Printed before Outcome Recorded", async () => {
    expect(resolveOutcomeAttemptStatus("DRAFT", "SUCCESSFUL")).toBe("OUTCOME_RECORDED");

    const result = await saveOutcomeForAttempt(
      db,
      projectId,
      attemptId,
      makeOutcomeInput("SUCCESSFUL"),
      outcomeAt,
    );

    expect(result.attempt.status).toBe("OUTCOME_RECORDED");
    expect(result.attempt.outcome?.status).toBe("SUCCESSFUL");
  });

  it("resolves a not-yet-evaluated Draft through Planned to Printed", async () => {
    expect(resolveOutcomeAttemptStatus("DRAFT", "NOT_YET_EVALUATED")).toBe("PRINTED");

    const result = await saveOutcomeForAttempt(
      db,
      projectId,
      attemptId,
      makeOutcomeInput("NOT_YET_EVALUATED"),
      outcomeAt,
    );

    expect(result.attempt.status).toBe("PRINTED");
    expect(result.attempt.outcome?.status).toBe("NOT_YET_EVALUATED");
  });

  it("rejects an invalid lifecycle regression from Outcome Recorded to not yet evaluated", () => {
    expect(() =>
      resolveOutcomeAttemptStatus("OUTCOME_RECORDED", "NOT_YET_EVALUATED"),
    ).toThrow("Cannot change an Attempt in OUTCOME_RECORDED status back");
  });
});
