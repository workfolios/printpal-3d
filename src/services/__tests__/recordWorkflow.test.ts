import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createPrintPalDatabase, type PrintPalDatabase } from "../../data/db";
import type { Attempt, Project } from "../../domain/types";
import {
  buildProjectAndFirstAttempt,
  createNewProject,
  type NewProjectInput,
} from "../projectCreationService";
import {
  buildRecordLibrarySummaries,
  filterRecordLibrary,
  uniqueFilterOptions,
} from "../recordLibraryService";

const now = "2026-07-12T08:00:00.000Z";
const projectId = "11111111-1111-4111-8111-111111111111";
const attemptId = "22222222-2222-4222-8222-222222222222";
const sourceId = "33333333-3333-4333-8333-333333333333";

const input: NewProjectInput = {
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
  plannedAttemptDescription: "Establish fit with the baseline geometry",
  knownConcerns: ["Bed adhesion", "Dimensional fit"],
  slicerName: "Example Slicer",
  profileReference: "PETG baseline",
  sourceTitle: "Manufacturer PETG guide",
  sourceUrl: "https://example.com/petg",
};

function build(overrides: Partial<NewProjectInput> = {}) {
  return buildProjectAndFirstAttempt({ ...input, ...overrides }, now, {
    projectId,
    attemptId,
    sourceId,
  });
}

let db: PrintPalDatabase;

beforeEach(() => {
  db = createPrintPalDatabase(`printpal-slice3-${crypto.randomUUID()}`);
});

afterEach(async () => {
  db.close();
  await db.delete();
});

describe("project creation workflow", () => {
  it("builds linked Project and Attempt 1 records", () => {
    const { project, attempt } = build();

    expect(project.attemptIds).toEqual([attemptId]);
    expect(attempt.projectId).toBe(projectId);
    expect(attempt.attemptNumber).toBe(1);
    expect(attempt.status).toBe("DRAFT");
  });

  it("preserves guided and technical context in one attempt schema", () => {
    const { attempt } = build();

    expect(attempt.processContext.plannedAttemptDescription).toContain("baseline geometry");
    expect(attempt.processContext.knownConcerns).toEqual(["Bed adhesion", "Dimensional fit"]);
    expect(attempt.processContext.slicerName).toBe("Example Slicer");
    expect(attempt.sourceReferences[0]?.title).toBe("Manufacturer PETG guide");
  });

  it("rejects project creation without success criteria", () => {
    expect(() => build({ successCriteria: [] })).toThrow();
  });

  it("commits the user-facing creation service to IndexedDB", async () => {
    const { project, attempt } = await createNewProject(db, input);

    expect(await db.projects.get(project.projectId)).toBeDefined();
    expect(await db.attempts.get(attempt.attemptId)).toBeDefined();
  });
});

describe("Record Library model", () => {
  const { project, attempt } = build();
  const archivedProject: Project = {
    ...project,
    projectId: "44444444-4444-4444-8444-444444444444",
    title: "Archived resin miniature",
    status: "ARCHIVED",
    archivedAt: "2026-07-12T09:00:00.000Z",
    updatedAt: "2026-07-12T09:00:00.000Z",
    attemptIds: ["55555555-5555-4555-8555-555555555555"],
  };
  const resinAttempt: Attempt = {
    ...attempt,
    attemptId: "55555555-5555-4555-8555-555555555555",
    projectId: archivedProject.projectId,
    printerContext: { technology: "MSLA_LCD_RESIN", unknownInformation: false },
    materialContext: { materialClass: "STANDARD_RESIN", unknownInformation: false },
    printerTechnologyIndex: "MSLA_LCD_RESIN",
    materialClassIndex: "STANDARD_RESIN",
    updatedAt: archivedProject.updatedAt,
  };
  const records = buildRecordLibrarySummaries([project, archivedProject], [attempt, resinAttempt]);

  it("filters by title and purpose search", () => {
    expect(filterRecordLibrary(records, { search: "cable", status: "ALL", printerTechnology: "", materialClass: "" })).toHaveLength(1);
  });

  it("filters by lifecycle status", () => {
    const result = filterRecordLibrary(records, { search: "", status: "ARCHIVED", printerTechnology: "", materialClass: "" });
    expect(result.map((record) => record.project.title)).toEqual(["Archived resin miniature"]);
  });

  it("filters by printer technology and material class", () => {
    const result = filterRecordLibrary(records, { search: "", status: "ALL", printerTechnology: "MSLA_LCD_RESIN", materialClass: "STANDARD_RESIN" });
    expect(result).toHaveLength(1);
  });

  it("sorts recently updated first and provides filter options", () => {
    const result = filterRecordLibrary(records, { search: "", status: "ALL", printerTechnology: "", materialClass: "" });
    const options = uniqueFilterOptions(records);

    expect(result[0]?.project.projectId).toBe(archivedProject.projectId);
    expect(options.printerTechnologies).toEqual(["FFF_FDM", "MSLA_LCD_RESIN"]);
    expect(options.materialClasses).toEqual(["PETG", "STANDARD_RESIN"]);
  });
});
