import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Attempt, Comparison, NextTestPlan, Project } from "../../domain/types";
import { createPrintPalDatabase, type PrintPalDatabase } from "../../data/db";
import {
  createFullBackupEnvelope,
  createProjectExportEnvelope,
  importProjectAsNew,
  parseImportText,
  previewImport,
  renderProjectMarkdown,
  restoreFullBackupReplaceAll,
  safeFileStem,
  serializeExport,
} from "../dataTransferService";

const now = "2026-07-13T20:00:00.000Z";
const later = "2026-07-13T21:00:00.000Z";
const projectId = "11111111-1111-4111-8111-111111111111";
const attemptAId = "22222222-2222-4222-8222-222222222222";
const attemptBId = "33333333-3333-4333-8333-333333333333";
const comparisonId = "44444444-4444-4444-8444-444444444444";
const nextTestPlanId = "55555555-5555-4555-8555-555555555555";
const sourceAId = "66666666-6666-4666-8666-666666666666";
const sourceBId = "77777777-7777-4777-8777-777777777777";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    projectId,
    schemaVersion: 1,
    title: "PETG Cable Clip",
    purpose: "Create a repeatable functional clip",
    successCriteria: ["Clip fits the target cable"],
    tags: ["PETG", "functional"],
    status: "ACTIVE",
    attemptIds: [attemptAId, attemptBId],
    createdAt: now,
    updatedAt: later,
    ...overrides,
  };
}

function makeAttemptA(overrides: Partial<Attempt> = {}): Attempt {
  return {
    attemptId: attemptAId,
    projectId,
    schemaVersion: 1,
    attemptNumber: 1,
    status: "COMPARED",
    printerContext: {
      technology: "FFF_FDM",
      manufacturer: "Example Printer Maker",
      model: "Model One",
      unknownInformation: false,
    },
    materialContext: {
      materialClass: "PETG",
      manufacturer: "Example Material Maker",
      productOrResinName: "PETG Standard",
      unknownInformation: false,
    },
    processContext: {
      plannedAttemptDescription: "Baseline orientation",
      knownConcerns: ["Dimensional fit"],
      plannedVariables: ["Orientation"],
      changesFromParentAttempt: [],
    },
    sourceReferences: [
      {
        sourceId: sourceAId,
        category: "MANUFACTURER_DOCUMENTATION",
        title: "Printer Manual",
        url: "https://example.com/manual",
        authorityClassification: "AUTHORITATIVE",
        createdAt: now,
      },
    ],
    plan: {
      objectiveSummary: "Establish a documented baseline.",
      readinessConsiderations: ["Verify the printer state."],
      printerWatchOuts: [],
      materialWatchOuts: [],
      assumptions: [],
      missingInformation: [],
      sourceChecks: ["Review the printer manual."],
      variablesToRecord: ["Orientation"],
      expectedOutcomeCriteria: ["Clip fits"],
      origin: "USER_AUTHORED",
      generatedAt: now,
    },
    outcome: {
      status: "PARTIALLY_SUCCESSFUL",
      completedAt: now,
      successCriteriaResults: [
        { criterion: "Clip fits the target cable", status: "PARTIALLY_MET" },
      ],
      observations: ["Fit was close."],
      deviationsOrDefects: ["Minor flex"],
      unexpectedConditions: [],
      postProcessingPerformed: [],
      lessonsLearned: ["Test orientation."],
    },
    comparisonIds: [comparisonId],
    printerTechnologyIndex: "FFF_FDM",
    materialClassIndex: "PETG",
    createdAt: now,
    updatedAt: later,
    completedAt: now,
    ...overrides,
  };
}

function makeAttemptB(overrides: Partial<Attempt> = {}): Attempt {
  return {
    ...makeAttemptA(),
    attemptId: attemptBId,
    parentAttemptId: attemptAId,
    attemptNumber: 2,
    processContext: {
      ...makeAttemptA().processContext,
      plannedAttemptDescription: "Rotated orientation",
      changesFromParentAttempt: ["Rotate the part orientation"],
    },
    sourceReferences: [
      {
        sourceId: sourceBId,
        category: "PERSONAL_NOTE",
        title: "Attempt note",
        authorityClassification: "PERSONAL",
        createdAt: later,
      },
    ],
    outcome: {
      status: "SUCCESSFUL",
      completedAt: later,
      successCriteriaResults: [{ criterion: "Clip fits the target cable", status: "MET" }],
      observations: ["Fit was stable."],
      deviationsOrDefects: [],
      unexpectedConditions: [],
      postProcessingPerformed: [],
      lessonsLearned: ["Retain orientation as a candidate."],
    },
    nextTestPlanId,
    ...overrides,
  };
}

function makeComparison(overrides: Partial<Comparison> = {}): Comparison {
  return {
    comparisonId,
    projectId,
    schemaVersion: 1,
    attemptAId,
    attemptBId,
    constants: [],
    changes: [
      {
        fieldPath: "processContext.plannedAttemptDescription",
        label: "Planned Attempt Description",
        attemptAValue: "Baseline orientation",
        attemptBValue: "Rotated orientation",
      },
    ],
    intentionalChanges: ["Rotate the part orientation"],
    unknownChanges: [],
    missingInformation: [],
    outcomeDifferences: ["Outcome status changed."],
    supportedObservations: ["The stored outcomes differ."],
    modelInferences: [],
    alternateExplanations: [],
    uncertainties: ["The comparison does not establish causation."],
    origin: "USER_AUTHORED",
    nextTestPlanId,
    createdAt: later,
    ...overrides,
  };
}

function makeNextTestPlan(overrides: Partial<NextTestPlan> = {}): NextTestPlan {
  return {
    nextTestPlanId,
    projectId,
    schemaVersion: 1,
    originatingComparisonId: comparisonId,
    testQuestion: "Does orientation improve fit?",
    primaryVariable: "Orientation",
    constants: ["Material", "Printer"],
    observationOrMeasurementPlan: ["Record fit."],
    sourceChecks: ["Review official profile guidance."],
    expectedLearning: "Understand whether the result repeats.",
    uncertainty: ["Only one repeat is planned."],
    approvalStatus: "ACCEPTED",
    origin: "USER_AUTHORED",
    createdAt: later,
    updatedAt: later,
    ...overrides,
  };
}

async function seedCompleteProject(db: PrintPalDatabase): Promise<void> {
  await db.projects.add(makeProject());
  await db.attempts.bulkAdd([makeAttemptA(), makeAttemptB()]);
  await db.comparisons.add(makeComparison());
  await db.nextTestPlans.add(makeNextTestPlan());
  await db.appSettings.add({ key: "preferredMode", value: "TECHNICAL", updatedAt: later });
}

let db: PrintPalDatabase;

beforeEach(() => {
  db = createPrintPalDatabase(`printpal-transfer-test-${crypto.randomUUID()}`);
});

afterEach(async () => {
  db.close();
  await db.delete();
});

describe("PrintPal export, import, and recovery", () => {
  it("creates a relationship-complete Project JSON export and readable Markdown", async () => {
    await seedCompleteProject(db);
    const envelope = await createProjectExportEnvelope(projectId, db, later);

    expect(envelope.exportType).toBe("PROJECT");
    if (envelope.exportType !== "PROJECT") throw new Error("Unexpected export type");
    expect(envelope.payload.attempts).toHaveLength(2);
    expect(envelope.payload.comparisons).toHaveLength(1);
    expect(envelope.payload.nextTestPlans).toHaveLength(1);
    expect(parseImportText(serializeExport(envelope))).toEqual(envelope);

    const markdown = renderProjectMarkdown(envelope.payload);
    expect(markdown).toContain("# PETG Cable Clip");
    expect(markdown).toContain("## Attempt 1");
    expect(markdown).toContain("### Next-Test Plan");
    expect(markdown).toContain("## Advisory Boundary");
  });

  it("creates a complete Full Backup including exact application settings", async () => {
    await seedCompleteProject(db);
    const envelope = await createFullBackupEnvelope(db, later);

    expect(envelope.exportType).toBe("FULL_BACKUP");
    if (envelope.exportType !== "FULL_BACKUP") throw new Error("Unexpected export type");
    expect(envelope.payload.projects).toHaveLength(1);
    expect(envelope.payload.appSettings).toEqual([
      { key: "preferredMode", value: "TECHNICAL", updatedAt: later },
    ]);
    expect(previewImport(envelope).counts).toEqual({
      projects: 1,
      attempts: 2,
      comparisons: 1,
      nextTestPlans: 1,
      appSettings: 1,
    });
  });

  it("rejects malformed files and broken relationships before any write", async () => {
    expect(() => parseImportText("not-json")).toThrow("not valid JSON");

    await seedCompleteProject(db);
    const envelope = await createProjectExportEnvelope(projectId, db, later);
    if (envelope.exportType !== "PROJECT") throw new Error("Unexpected export type");
    const broken = structuredClone(envelope);
    broken.payload.project.attemptIds = [attemptAId];

    expect(() => parseImportText(JSON.stringify(broken))).toThrow("attemptIds");
  });

  it("imports a Project as a new record with regenerated identifiers and rebuilt relationships", async () => {
    await seedCompleteProject(db);
    const envelope = await createProjectExportEnvelope(projectId, db, later);
    const ids = [
      "81111111-1111-4111-8111-111111111111",
      "82222222-2222-4222-8222-222222222222",
      "83333333-3333-4333-8333-333333333333",
      "84444444-4444-4444-8444-444444444444",
      "85555555-5555-4555-8555-555555555555",
      "86666666-6666-4666-8666-666666666666",
      "87777777-7777-4777-8777-777777777777",
    ];
    const result = await importProjectAsNew(envelope, db, () => ids.shift()!, later);

    expect(result.projectId).not.toBe(projectId);
    expect(await db.projects.count()).toBe(2);
    const imported = await db.projects.get(result.projectId);
    expect(imported?.tags).toContain("imported");

    const importedAttempts = await db.attempts.where("projectId").equals(result.projectId).sortBy("attemptNumber");
    expect(importedAttempts).toHaveLength(2);
    expect(importedAttempts[0].attemptId).not.toBe(attemptAId);
    expect(importedAttempts[1].parentAttemptId).toBe(importedAttempts[0].attemptId);
    expect(importedAttempts[0].sourceReferences[0].sourceId).not.toBe(sourceAId);

    const importedComparison = (await db.comparisons.where("projectId").equals(result.projectId).toArray())[0];
    const importedPlan = (await db.nextTestPlans.where("projectId").equals(result.projectId).toArray())[0];
    expect(importedComparison.attemptAId).toBe(importedAttempts[0].attemptId);
    expect(importedComparison.nextTestPlanId).toBe(importedPlan.nextTestPlanId);
    expect(importedPlan.originatingComparisonId).toBe(importedComparison.comparisonId);
  });

  it("replaces all local records atomically from a validated Full Backup", async () => {
    await seedCompleteProject(db);
    const backup = await createFullBackupEnvelope(db, later);

    await db.projects.clear();
    await db.attempts.clear();
    await db.comparisons.clear();
    await db.nextTestPlans.clear();
    await db.appSettings.clear();
    await db.projects.add(
      makeProject({
        projectId: "99999999-9999-4999-8999-999999999999",
        title: "Temporary Project",
        attemptIds: [],
      }),
    );

    await restoreFullBackupReplaceAll(backup, db);
    expect(await db.projects.count()).toBe(1);
    expect((await db.projects.get(projectId))?.title).toBe("PETG Cable Clip");
    expect((await db.appSettings.get("preferredMode"))?.value).toBe("TECHNICAL");
  });

  it("rolls back a failed replace-all restore and retains the prior local records", async () => {
    await seedCompleteProject(db);
    const backup = await createFullBackupEnvelope(db, later);
    const spy = vi.spyOn(db.attempts, "bulkAdd").mockRejectedValueOnce(new Error("simulated write failure"));

    await expect(restoreFullBackupReplaceAll(backup, db)).rejects.toThrow("simulated write failure");
    spy.mockRestore();

    expect((await db.projects.get(projectId))?.title).toBe("PETG Cable Clip");
    expect(await db.attempts.count()).toBe(2);
  });

  it("creates safe portable filenames", () => {
    expect(safeFileStem("PETG Cable Clip — V0.4")).toBe("petg-cable-clip-v0-4");
    expect(safeFileStem("***")).toBe("printpal-record");
  });
});
