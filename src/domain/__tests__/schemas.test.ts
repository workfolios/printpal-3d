import { describe, expect, it } from "vitest";
import {
  attemptSchema,
  canTransitionAttemptStatus,
  canTransitionProjectStatus,
  comparisonSchema,
  createApiResponseEnvelopeSchema,
  fullBackupEnvelopeSchema,
  nextTestPlanSchema,
  planSchema,
  projectSchema,
} from "../index";

const now = "2026-07-12T04:30:00.000Z";
const projectId = "11111111-1111-4111-8111-111111111111";
const attemptAId = "22222222-2222-4222-8222-222222222222";
const attemptBId = "33333333-3333-4333-8333-333333333333";
const comparisonId = "44444444-4444-4444-8444-444444444444";
const nextTestPlanId = "55555555-5555-4555-8555-555555555555";

const validProject = {
  projectId,
  schemaVersion: 1,
  title: "PETG cable clip",
  purpose: "Create a repeatable functional part",
  successCriteria: ["Clip fits the target cable"],
  tags: ["PETG"],
  status: "ACTIVE",
  attemptIds: [attemptAId],
  createdAt: now,
  updatedAt: now,
};

const validAttempt = {
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
};

describe("projectSchema", () => {
  it("accepts a valid active project", () => {
    expect(projectSchema.safeParse(validProject).success).toBe(true);
  });

  it("requires archivedAt for archived projects", () => {
    const result = projectSchema.safeParse({ ...validProject, status: "ARCHIVED" });
    expect(result.success).toBe(false);
  });

  it("requires at least one success criterion", () => {
    const result = projectSchema.safeParse({ ...validProject, successCriteria: [] });
    expect(result.success).toBe(false);
  });
});

describe("attemptSchema", () => {
  it("accepts a valid attempt", () => {
    expect(attemptSchema.safeParse(validAttempt).success).toBe(true);
  });

  it("rejects a self-parent relationship", () => {
    const result = attemptSchema.safeParse({ ...validAttempt, parentAttemptId: attemptAId });
    expect(result.success).toBe(false);
  });

  it("rejects denormalized index mismatches", () => {
    const result = attemptSchema.safeParse({ ...validAttempt, materialClassIndex: "PLA" });
    expect(result.success).toBe(false);
  });
});

describe("planSchema", () => {
  it("accepts transparent AI-origin metadata", () => {
    const result = planSchema.safeParse({
      objectiveSummary: "Prepare a controlled PETG attempt",
      readinessConsiderations: [],
      printerWatchOuts: [],
      materialWatchOuts: [],
      assumptions: [],
      missingInformation: [],
      sourceChecks: ["Verify the material technical data sheet"],
      variablesToRecord: ["Orientation"],
      expectedOutcomeCriteria: ["Clip fits"],
      origin: "AI_ASSISTED",
      promptVersion: "planning-v1",
      generatedAt: now,
    });
    expect(result.success).toBe(true);
  });
});

describe("comparisonSchema", () => {
  it("accepts two different attempts", () => {
    const result = comparisonSchema.safeParse({
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
    });
    expect(result.success).toBe(true);
  });

  it("rejects comparison of an attempt with itself", () => {
    const result = comparisonSchema.safeParse({
      comparisonId,
      projectId,
      schemaVersion: 1,
      attemptAId,
      attemptBId: attemptAId,
      origin: "USER_AUTHORED",
      createdAt: now,
    });
    expect(result.success).toBe(false);
  });
});

describe("nextTestPlanSchema", () => {
  it("requires a primary variable", () => {
    const result = nextTestPlanSchema.safeParse({
      nextTestPlanId,
      projectId,
      schemaVersion: 1,
      originatingComparisonId: comparisonId,
      testQuestion: "Does orientation improve fit?",
      primaryVariable: "",
      constants: [],
      observationOrMeasurementPlan: [],
      sourceChecks: [],
      expectedLearning: "Understand orientation impact",
      uncertainty: [],
      approvalStatus: "DRAFT",
      origin: "AI_ASSISTED",
      createdAt: now,
      updatedAt: now,
    });
    expect(result.success).toBe(false);
  });
});

describe("API envelopes", () => {
  it("validates typed fallback data and origin", () => {
    const schema = createApiResponseEnvelopeSchema(planSchema);
    const result = schema.safeParse({
      ok: true,
      data: {
        objectiveSummary: "Fallback plan",
        readinessConsiderations: [],
        printerWatchOuts: [],
        materialWatchOuts: [],
        assumptions: [],
        missingInformation: [],
        sourceChecks: [],
        variablesToRecord: [],
        expectedOutcomeCriteria: [],
        origin: "RULES_BASED_FALLBACK",
        rulesVersion: "rules-v1",
        generatedAt: now,
      },
      origin: "RULES_BASED_FALLBACK",
      rulesVersion: "rules-v1",
      warnings: ["AI service unavailable"],
      generatedAt: now,
    });
    expect(result.success).toBe(true);
  });
});

describe("export envelopes", () => {
  it("accepts a complete local backup envelope", () => {
    const result = fullBackupEnvelopeSchema.safeParse({
      format: "PRINTPAL_3D",
      schemaVersion: 1,
      appVersion: "0.4.0-dev",
      exportType: "FULL_BACKUP",
      exportedAt: now,
      sourceOrigin: "USER_AUTHORED",
      payload: {
        projects: [validProject],
        attempts: [validAttempt],
        comparisons: [],
        nextTestPlans: [],
        appSettings: { preferredMode: "TECHNICAL" },
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("lifecycle transitions", () => {
  it("permits planned attempts to become printed", () => {
    expect(canTransitionAttemptStatus("PLANNED", "PRINTED")).toBe(true);
  });

  it("blocks draft attempts from skipping directly to compared", () => {
    expect(canTransitionAttemptStatus("DRAFT", "COMPARED")).toBe(false);
  });

  it("permits completed projects to be reopened", () => {
    expect(canTransitionProjectStatus("COMPLETED", "ACTIVE")).toBe(true);
  });
});
