import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Attempt, Comparison, NextTestPlan, Project } from "../../domain/types";
import { createPrintPalDatabase, type PrintPalDatabase } from "../db";
import { AttemptRepository } from "../repositories/attemptRepository";
import { ComparisonRepository } from "../repositories/comparisonRepository";
import { NextTestPlanRepository } from "../repositories/nextTestPlanRepository";
import { ProjectRepository } from "../repositories/projectRepository";
import { SettingsRepository } from "../repositories/settingsRepository";
import {
  clearAllLocalData,
  createProjectWithFirstAttempt,
  deleteProjectCascade,
  getStorageCounts,
} from "../transactions";

const now = "2026-07-12T06:00:00.000Z";
const later = "2026-07-12T06:05:00.000Z";
const projectId = "11111111-1111-4111-8111-111111111111";
const otherProjectId = "99999999-9999-4999-8999-999999999999";
const attemptAId = "22222222-2222-4222-8222-222222222222";
const attemptBId = "33333333-3333-4333-8333-333333333333";
const comparisonId = "44444444-4444-4444-8444-444444444444";
const nextTestPlanId = "55555555-5555-4555-8555-555555555555";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    projectId,
    schemaVersion: 1,
    title: "PETG cable clip",
    purpose: "Create a repeatable functional part",
    successCriteria: ["Clip fits the target cable"],
    tags: ["PETG"],
    status: "ACTIVE",
    attemptIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeAttempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    attemptId: attemptAId,
    projectId,
    schemaVersion: 1,
    attemptNumber: 1,
    status: "PLANNED",
    printerContext: {
      technology: "FFF_FDM",
      manufacturer: "Example Manufacturer",
      model: "Example Printer",
      unknownInformation: false,
    },
    materialContext: {
      materialClass: "PETG",
      manufacturer: "Example Material Maker",
      unknownInformation: false,
    },
    processContext: {
      plannedVariables: ["Orientation"],
      changesFromParentAttempt: [],
    },
    sourceReferences: [],
    comparisonIds: [],
    printerTechnologyIndex: "FFF_FDM",
    materialClassIndex: "PETG",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeComparison(): Comparison {
  return {
    comparisonId,
    projectId,
    schemaVersion: 1,
    attemptAId,
    attemptBId,
    constants: [],
    changes: [],
    intentionalChanges: ["Orientation"],
    unknownChanges: [],
    missingInformation: [],
    outcomeDifferences: [],
    supportedObservations: [],
    modelInferences: [],
    alternateExplanations: [],
    uncertainties: [],
    origin: "USER_AUTHORED",
    createdAt: now,
  };
}

function makeNextTestPlan(): NextTestPlan {
  return {
    nextTestPlanId,
    projectId,
    schemaVersion: 1,
    originatingComparisonId: comparisonId,
    testQuestion: "Does orientation improve fit?",
    primaryVariable: "Orientation",
    constants: ["Material", "Printer"],
    observationOrMeasurementPlan: ["Check fit"],
    sourceChecks: [],
    expectedLearning: "Understand orientation impact",
    uncertainty: [],
    approvalStatus: "DRAFT",
    origin: "AI_ASSISTED",
    createdAt: now,
    updatedAt: now,
  };
}

let db: PrintPalDatabase;
let dbName: string;

beforeEach(() => {
  dbName = `printpal-test-${crypto.randomUUID()}`;
  db = createPrintPalDatabase(dbName);
});

afterEach(async () => {
  db.close();
  await db.delete();
});

describe("local persistence foundation", () => {
  it("creates a project and first attempt in one transaction", async () => {
    const result = await createProjectWithFirstAttempt(db, makeProject(), makeAttempt());

    expect(result.project.attemptIds).toEqual([attemptAId]);
    expect(await db.projects.get(projectId)).toBeDefined();
    expect(await db.attempts.get(attemptAId)).toBeDefined();
  });

  it("rolls back the project when the first-attempt write fails", async () => {
    await db.attempts.add(makeAttempt());

    await expect(createProjectWithFirstAttempt(db, makeProject(), makeAttempt())).rejects.toThrow();
    expect(await db.projects.get(projectId)).toBeUndefined();
    expect(await db.attempts.count()).toBe(1);
  });

  it("rejects mismatched project and attempt relationships before writing", async () => {
    await expect(
      createProjectWithFirstAttempt(
        db,
        makeProject(),
        makeAttempt({ projectId: otherProjectId }),
      ),
    ).rejects.toThrow("must share the same projectId");

    expect(await getStorageCounts(db)).toEqual({
      projects: 0,
      attempts: 0,
      comparisons: 0,
      nextTestPlans: 0,
      appSettings: 0,
    });
  });

  it("preserves records after closing and reopening the same browser database", async () => {
    await createProjectWithFirstAttempt(db, makeProject(), makeAttempt());
    db.close();

    const reopened = createPrintPalDatabase(dbName);
    expect((await reopened.projects.get(projectId))?.title).toBe("PETG cable clip");
    expect(await reopened.attempts.get(attemptAId)).toBeDefined();
    reopened.close();
  });

  it("supports validated project and attempt CRUD with lifecycle transitions", async () => {
    await createProjectWithFirstAttempt(db, makeProject(), makeAttempt());
    const projectRepository = new ProjectRepository(db);
    const attemptRepository = new AttemptRepository(db);

    const archived = await projectRepository.transitionStatus(projectId, "ARCHIVED", later);
    expect(archived.status).toBe("ARCHIVED");
    expect(archived.archivedAt).toBe(later);

    const restored = await projectRepository.transitionStatus(projectId, "ACTIVE", later);
    expect(restored.status).toBe("ACTIVE");
    expect(restored.archivedAt).toBeUndefined();

    const printed = await attemptRepository.transitionStatus(attemptAId, "PRINTED", later);
    expect(printed.status).toBe("PRINTED");
    expect(printed.completedAt).toBe(later);
  });

  it("stores comparison, next-test, and setting records through repositories", async () => {
    await createProjectWithFirstAttempt(
      db,
      makeProject({ attemptIds: [attemptAId, attemptBId] }),
      makeAttempt(),
    );
    await db.attempts.add(makeAttempt({ attemptId: attemptBId, attemptNumber: 2 }));

    const comparisonRepository = new ComparisonRepository(db);
    const nextTestRepository = new NextTestPlanRepository(db);
    const settingsRepository = new SettingsRepository(db);

    await comparisonRepository.create(makeComparison());
    await nextTestRepository.create(makeNextTestPlan());
    await settingsRepository.set("preferredMode", "TECHNICAL", later);

    expect(await comparisonRepository.listByProject(projectId)).toHaveLength(1);
    expect(await nextTestRepository.listByProject(projectId)).toHaveLength(1);
    expect((await settingsRepository.get("preferredMode"))?.value).toBe("TECHNICAL");
  });

  it("cascades project deletion across related local records", async () => {
    await createProjectWithFirstAttempt(
      db,
      makeProject({ attemptIds: [attemptAId, attemptBId] }),
      makeAttempt(),
    );
    await db.attempts.add(makeAttempt({ attemptId: attemptBId, attemptNumber: 2 }));
    await db.comparisons.add(makeComparison());
    await db.nextTestPlans.add(makeNextTestPlan());

    await deleteProjectCascade(db, projectId);

    expect(await getStorageCounts(db)).toEqual({
      projects: 0,
      attempts: 0,
      comparisons: 0,
      nextTestPlans: 0,
      appSettings: 0,
    });
  });

  it("clears every local table without deleting the database definition", async () => {
    await createProjectWithFirstAttempt(db, makeProject(), makeAttempt());
    await new SettingsRepository(db).set("preferredMode", "GUIDED", later);

    await clearAllLocalData(db);

    expect(await getStorageCounts(db)).toEqual({
      projects: 0,
      attempts: 0,
      comparisons: 0,
      nextTestPlans: 0,
      appSettings: 0,
    });
    expect(db.isOpen()).toBe(true);
  });

  it("rejects invalid domain records before persistence", async () => {
    const repository = new ProjectRepository(db);
    const invalidProject = makeProject({ successCriteria: [] });

    await expect(repository.create(invalidProject)).rejects.toThrow();
    expect(await db.projects.count()).toBe(0);
  });
});
