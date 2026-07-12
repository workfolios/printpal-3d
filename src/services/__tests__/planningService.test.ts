import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { db } from "../../data/db";
import { clearAllLocalData } from "../../data/transactions";
import { planSchema } from "../../domain/schemas/planSchema";
import { PLANNING_PROMPT_VERSION, PLANNING_RULES_VERSION } from "../../planning/contracts";
import { generateRulesBasedPlanEnvelope } from "../../planning/fallbackPlan";
import { findPlanningSafetyViolations } from "../../planning/outputSafety";
import { buildPlanningSafetyInstructions, PROHIBITED_PLANNING_OUTPUTS } from "../../planning/safety";
import type { PrintPlanningFormData } from "../../types";
import {
  applyPlanEdits,
  buildPlanningRequestFromRecord,
  createUserAuthoredPlan,
  planFromEnvelope,
  requestPlanningEnvelope,
  savePlanToAttempt,
} from "../planningService";
import { createNewProject, type NewProjectInput } from "../projectCreationService";

const now = "2026-07-12T12:00:00.000Z";

const projectInput: NewProjectInput = {
  title: "PETG cable clip",
  purpose: "Create a repeatable functional part",
  description: "Clip for a workshop cable",
  successCriteria: ["Clip fits the cable", "Clip survives normal handling"],
  tags: ["PETG", "functional"],
  printerTechnology: "FFF_FDM",
  printerManufacturer: "Example Maker",
  printerModel: "Example Printer",
  materialClass: "PETG",
  materialManufacturer: "Example Material Maker",
  materialProductName: "PETG Pro",
  plannedAttemptDescription: "Establish fit with the baseline geometry",
  knownConcerns: ["Bed adhesion", "Dimensional fit"],
  slicerName: "Example Slicer",
  profileReference: "PETG baseline",
  technicalNotes: "User-entered layer height 0.20 mm",
  sourceTitle: "Manufacturer PETG guide",
  sourceUrl: "https://example.com/petg",
};

const standaloneInput: PrintPlanningFormData = {
  projectName: "PETG cable clip",
  printGoal: "Establish fit with the baseline geometry",
  printerTech: "FFF_FDM",
  printerName: "Example Maker Example Printer",
  material: "Example Material Maker · PETG Pro · PETG",
  purpose: "Create a repeatable functional part",
  priority: "Meet the recorded project success criteria",
  concerns: ["Bed adhesion"],
  notes: "User-entered context",
  successCriteria: ["Clip fits the cable"],
  sourceReferenceSummaries: ["Manufacturer PETG guide [MANUFACTURER DOCUMENTATION]"],
};

beforeEach(async () => {
  await clearAllLocalData(db);
});

afterEach(async () => {
  await clearAllLocalData(db);
});

describe("saved planning workflow", () => {
  it("maps a saved Project and Attempt into a bounded planning request", async () => {
    const { project, attempt } = await createNewProject(db, projectInput);
    const request = buildPlanningRequestFromRecord(project, attempt, {
      priority: "Dimensional fit",
      freeformContext: "Observe fit without treating exact values as recommendations.",
    });

    expect(request.projectName).toBe(project.title);
    expect(request.successCriteria).toEqual(project.successCriteria);
    expect(request.concerns).toEqual(["Bed adhesion", "Dimensional fit"]);
    expect(request.notes).toContain("User-entered layer height 0.20 mm");
    expect(request.sourceReferenceSummaries?.[0]).toContain("Manufacturer PETG guide");
  });

  it("stores a generated Plan inside the selected Attempt", async () => {
    const { project, attempt } = await createNewProject(db, projectInput);
    const request = buildPlanningRequestFromRecord(project, attempt);
    const envelope = generateRulesBasedPlanEnvelope(request, { generatedAt: now });
    const plan = planFromEnvelope(envelope);

    await savePlanToAttempt(attempt.attemptId, plan);
    const saved = await db.attempts.get(attempt.attemptId);

    expect(saved?.plan?.origin).toBe("RULES_BASED_FALLBACK");
    expect(saved?.status).toBe("PLANNED");
    expect(saved?.plan?.rulesVersion).toBe(PLANNING_RULES_VERSION);
    expect(saved?.plan?.expectedOutcomeCriteria).toEqual(project.successCriteria);
    expect(planSchema.safeParse(saved?.plan).success).toBe(true);
  });

  it("marks AI content as user edited while retaining generation metadata", async () => {
    const { project, attempt } = await createNewProject(db, projectInput);
    const request = buildPlanningRequestFromRecord(project, attempt);
    const envelope = {
      ...generateRulesBasedPlanEnvelope(request, { generatedAt: now }),
      origin: "AI_ASSISTED" as const,
      model: "gemini-2.5-flash",
      warnings: [],
      errorCode: undefined,
    };
    const plan = planFromEnvelope(envelope);
    const edited = applyPlanEdits(
      plan,
      { ...envelope.data!, objectiveSummary: "User-refined objective" },
      "Clarified the target fit.",
    );

    expect(edited.origin).toBe("AI_ASSISTED_USER_EDITED");
    expect(edited.promptVersion).toBe(PLANNING_PROMPT_VERSION);
    expect(edited.rulesVersion).toBe(PLANNING_RULES_VERSION);
    expect(edited.userEdits).toBe("Clarified the target fit.");
  });

  it("creates a valid user-authored Plan when AI is unavailable", async () => {
    const { project, attempt } = await createNewProject(db, projectInput);
    const plan = createUserAuthoredPlan(project, attempt, now);

    expect(plan.origin).toBe("USER_AUTHORED");
    expect(plan.expectedOutcomeCriteria).toEqual(project.successCriteria);
    expect(planSchema.safeParse(plan).success).toBe(true);
  });
});

describe("planning response transparency", () => {
  it("returns a labeled local fallback when the service cannot be reached", async () => {
    const fetchFailure = async () => {
      throw new Error("offline");
    };

    const envelope = await requestPlanningEnvelope(standaloneInput, fetchFailure as typeof fetch);

    expect(envelope.origin).toBe("RULES_BASED_FALLBACK");
    expect(envelope.errorCode).toBe("NETWORK_OR_RESPONSE_FAILURE");
    expect(envelope.rulesVersion).toBe(PLANNING_RULES_VERSION);
    expect(envelope.warnings[0]).toContain("could not be reached");
  });

  it("returns a labeled fallback for an invalid server envelope", async () => {
    const invalidResponse = async () => new Response(JSON.stringify({ quickRead: "legacy shape" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    const envelope = await requestPlanningEnvelope(standaloneInput, invalidResponse as typeof fetch);

    expect(envelope.origin).toBe("RULES_BASED_FALLBACK");
    expect(envelope.errorCode).toBe("INVALID_AI_RESPONSE");
  });
});

describe("planning safety boundary", () => {
  it("includes every prohibited planning-output category", () => {
    const instructions = buildPlanningSafetyInstructions();

    for (const prohibited of PROHIBITED_PLANNING_OUTPUTS) {
      expect(instructions).toContain(prohibited);
    }
    expect(instructions).toContain("Do not invent or imply that a source was consulted");
    expect(instructions).toContain("exact values in user-entered notes as record context");
  });

  it("rejects prescriptive settings and fabricated URLs in model output", () => {
    const unsafe = {
      objectiveSummary: "Print the part at 240 C and cure for 20 minutes.",
      readinessConsiderations: [],
      printerWatchOuts: [],
      materialWatchOuts: [],
      assumptions: [],
      missingInformation: [],
      sourceChecks: ["Use https://fabricated.example/guide"],
      variablesToRecord: [],
      expectedOutcomeCriteria: [],
    };

    expect(findPlanningSafetyViolations(unsafe)).toEqual(
      expect.arrayContaining(["prescriptive universal operating value", "fabricated URL"]),
    );
  });
});
