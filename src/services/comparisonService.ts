import type { PrintPalDatabase } from "../data/db";
import { db as applicationDb } from "../data/db";
import { canTransitionAttemptStatus } from "../domain/lifecycle";
import { attemptSchema } from "../domain/schemas/attemptSchema";
import { comparisonSchema } from "../domain/schemas/comparisonSchema";
import { projectSchema } from "../domain/schemas/projectSchema";
import type { JsonValue } from "../domain/schemas/commonSchema";
import type { Attempt, Comparison, FieldChange, FieldSnapshot, Project } from "../domain/types";

export const DETERMINISTIC_COMPARISON_VERSION = "deterministic-comparison-v1";

type ComparableValue = JsonValue | undefined;

interface FieldDescriptor {
  fieldPath: string;
  label: string;
  value: (attempt: Attempt) => unknown;
  importantWhenMissing?: boolean;
  intentionalAliases?: string[];
}

const FIELD_DESCRIPTORS: FieldDescriptor[] = [
  { fieldPath: "printerContext.technology", label: "Printer Technology", value: (a) => a.printerContext.technology, importantWhenMissing: true, intentionalAliases: ["printer", "technology"] },
  { fieldPath: "printerContext.manufacturer", label: "Printer Manufacturer", value: (a) => a.printerContext.manufacturer, importantWhenMissing: true, intentionalAliases: ["printer", "manufacturer"] },
  { fieldPath: "printerContext.model", label: "Printer Model", value: (a) => a.printerContext.model, importantWhenMissing: true, intentionalAliases: ["printer", "model"] },
  { fieldPath: "printerContext.configurationNotes", label: "Printer Configuration", value: (a) => a.printerContext.configurationNotes, intentionalAliases: ["printer", "configuration", "hardware"] },
  { fieldPath: "printerContext.hardwareReference", label: "Hardware Reference", value: (a) => a.printerContext.hardwareReference, intentionalAliases: ["hardware", "nozzle", "plate"] },
  { fieldPath: "printerContext.firmwareOrModificationNote", label: "Firmware Or Modification", value: (a) => a.printerContext.firmwareOrModificationNote, intentionalAliases: ["firmware", "modification"] },
  { fieldPath: "materialContext.materialClass", label: "Material Class", value: (a) => a.materialContext.materialClass, importantWhenMissing: true, intentionalAliases: ["material", "filament", "resin"] },
  { fieldPath: "materialContext.manufacturer", label: "Material Manufacturer", value: (a) => a.materialContext.manufacturer, importantWhenMissing: true, intentionalAliases: ["material", "manufacturer", "brand"] },
  { fieldPath: "materialContext.productOrResinName", label: "Material Product", value: (a) => a.materialContext.productOrResinName, importantWhenMissing: true, intentionalAliases: ["material", "product", "resin", "filament"] },
  { fieldPath: "materialContext.color", label: "Material Color", value: (a) => a.materialContext.color, intentionalAliases: ["color", "material"] },
  { fieldPath: "materialContext.batchOrLotReference", label: "Material Batch Or Lot", value: (a) => a.materialContext.batchOrLotReference, intentionalAliases: ["batch", "lot", "material"] },
  { fieldPath: "materialContext.openedAt", label: "Material Opened Date", value: (a) => a.materialContext.openedAt, intentionalAliases: ["opened", "age", "material"] },
  { fieldPath: "materialContext.approximateAge", label: "Material Approximate Age", value: (a) => a.materialContext.approximateAge, intentionalAliases: ["age", "material"] },
  { fieldPath: "materialContext.storageOrConditioningNotes", label: "Material Storage Or Conditioning", value: (a) => a.materialContext.storageOrConditioningNotes, importantWhenMissing: true, intentionalAliases: ["storage", "conditioning", "drying", "material"] },
  { fieldPath: "materialContext.observedConditionNotes", label: "Material Observed Condition", value: (a) => a.materialContext.observedConditionNotes, intentionalAliases: ["condition", "moisture", "material"] },
  { fieldPath: "processContext.slicerName", label: "Slicer", value: (a) => a.processContext.slicerName, importantWhenMissing: true, intentionalAliases: ["slicer"] },
  { fieldPath: "processContext.slicerVersion", label: "Slicer Version", value: (a) => a.processContext.slicerVersion, intentionalAliases: ["slicer", "version"] },
  { fieldPath: "processContext.profileReference", label: "Profile Reference", value: (a) => a.processContext.profileReference, importantWhenMissing: true, intentionalAliases: ["profile", "preset"] },
  { fieldPath: "processContext.fileOrDesignReference", label: "File Or Design Reference", value: (a) => a.processContext.fileOrDesignReference, importantWhenMissing: true, intentionalAliases: ["file", "design", "model", "stl"] },
  { fieldPath: "processContext.plannedAttemptDescription", label: "Planned Attempt Description", value: (a) => a.processContext.plannedAttemptDescription, intentionalAliases: ["plan", "attempt", "description"] },
  { fieldPath: "processContext.knownConcerns", label: "Known Concerns", value: (a) => a.processContext.knownConcerns, intentionalAliases: ["concern", "risk"] },
  { fieldPath: "processContext.settingsSnapshotOrNotes", label: "Settings Snapshot Or Notes", value: (a) => a.processContext.settingsSnapshotOrNotes, importantWhenMissing: true, intentionalAliases: ["setting", "temperature", "speed", "orientation", "support", "layer", "exposure"] },
  { fieldPath: "processContext.plannedVariables", label: "Planned Variables", value: (a) => a.processContext.plannedVariables, importantWhenMissing: true, intentionalAliases: ["variable", "orientation", "temperature", "speed", "support", "layer", "exposure"] },
  { fieldPath: "processContext.environmentalObservations", label: "Environmental Observations", value: (a) => a.processContext.environmentalObservations, importantWhenMissing: true, intentionalAliases: ["environment", "temperature", "humidity", "room"] },
  { fieldPath: "processContext.postProcessingPlan", label: "Post-Processing Plan", value: (a) => a.processContext.postProcessingPlan, intentionalAliases: ["post-processing", "postprocessing", "cure", "wash", "support"] },
  { fieldPath: "sourceReferences", label: "Source References", value: (a) => a.sourceReferences.map((source) => `${source.category}: ${source.title} [${source.authorityClassification}]`), importantWhenMissing: true, intentionalAliases: ["source", "documentation", "guide"] },
];

function uniqueNonEmpty(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function normalize(value: unknown): ComparableValue {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => normalize(item))
      .filter((item): item is JsonValue => item !== undefined)
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    return normalized.length > 0 ? normalized : undefined;
  }
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

function equalValues(a: ComparableValue, b: ComparableValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function formatValue(value: ComparableValue): string {
  if (value === undefined) return "not recorded";
  if (Array.isArray(value)) return value.length > 0 ? value.map(String).join("; ") : "none recorded";
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

function tokenize(value: string): Set<string> {
  const stopWords = new Set(["from", "with", "this", "that", "then", "next", "attempt", "change", "changed", "planned", "using", "while", "other"]);
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 4 && !stopWords.has(token)),
  );
}

function isExplainedChange(
  descriptor: FieldDescriptor,
  declaredChanges: string[],
  directParentChildRelationship: boolean,
): boolean {
  if (
    directParentChildRelationship &&
    (descriptor.fieldPath === "processContext.plannedAttemptDescription" ||
      descriptor.fieldPath === "processContext.plannedVariables")
  ) return true;
  const evidence = tokenize(declaredChanges.join(" "));
  const fieldTokens = tokenize([descriptor.label, descriptor.fieldPath, ...(descriptor.intentionalAliases ?? [])].join(" "));
  return Array.from(fieldTokens).some((token) => evidence.has(token));
}

function directParentChildRelationship(attemptA: Attempt, attemptB: Attempt): boolean {
  return attemptB.parentAttemptId === attemptA.attemptId || attemptA.parentAttemptId === attemptB.attemptId;
}

function declaredChangesBetween(attemptA: Attempt, attemptB: Attempt): string[] {
  if (attemptB.parentAttemptId === attemptA.attemptId) return uniqueNonEmpty(attemptB.processContext.changesFromParentAttempt);
  if (attemptA.parentAttemptId === attemptB.attemptId) return uniqueNonEmpty(attemptA.processContext.changesFromParentAttempt);
  return [];
}

function compareStringLists(label: string, attemptA: string[], attemptB: string[]): string[] {
  const a = new Set(uniqueNonEmpty(attemptA));
  const b = new Set(uniqueNonEmpty(attemptB));
  const added = Array.from(b).filter((value) => !a.has(value));
  const removed = Array.from(a).filter((value) => !b.has(value));
  const output: string[] = [];
  if (added.length > 0) output.push(`${label} recorded only in Attempt B: ${added.join("; ")}.`);
  if (removed.length > 0) output.push(`${label} recorded only in Attempt A: ${removed.join("; ")}.`);
  return output;
}

function ensureComparableAttempt(attempt: Attempt, project: Project): void {
  if (attempt.projectId !== project.projectId) throw new Error("Both Attempts must belong to the selected Project.");
  if (!project.attemptIds.includes(attempt.attemptId)) throw new Error(`Attempt ${attempt.attemptNumber} is not indexed by the selected Project.`);
  if (!attempt.outcome) throw new Error(`Attempt ${attempt.attemptNumber} needs a recorded Outcome before comparison.`);
  if (attempt.outcome.status === "NOT_YET_EVALUATED") throw new Error(`Attempt ${attempt.attemptNumber} must be evaluated before comparison.`);
  if (attempt.status !== "OUTCOME_RECORDED" && attempt.status !== "COMPARED") {
    throw new Error(`Attempt ${attempt.attemptNumber} is not in a comparison-ready lifecycle state.`);
  }
}

export function buildDeterministicComparison(
  project: Project,
  attemptA: Attempt,
  attemptB: Attempt,
  now = new Date().toISOString(),
  comparisonId = crypto.randomUUID(),
): Comparison {
  if (attemptA.attemptId === attemptB.attemptId) throw new Error("A comparison requires two different Attempts.");
  ensureComparableAttempt(attemptA, project);
  ensureComparableAttempt(attemptB, project);

  const constants: FieldSnapshot[] = [];
  const changes: FieldChange[] = [];
  const missingInformation: string[] = [];
  const directlyRelated = directParentChildRelationship(attemptA, attemptB);
  const declaredChanges = declaredChangesBetween(attemptA, attemptB);
  const unknownChanges: string[] = [];

  for (const descriptor of FIELD_DESCRIPTORS) {
    const valueA = normalize(descriptor.value(attemptA));
    const valueB = normalize(descriptor.value(attemptB));
    if (valueA === undefined && valueB === undefined) {
      if (descriptor.importantWhenMissing) missingInformation.push(`${descriptor.label} is not recorded for either Attempt.`);
      continue;
    }
    if (equalValues(valueA, valueB)) {
      constants.push({ fieldPath: descriptor.fieldPath, label: descriptor.label, value: valueA as JsonValue });
      continue;
    }
    changes.push({ fieldPath: descriptor.fieldPath, label: descriptor.label, attemptAValue: valueA, attemptBValue: valueB });
    if (descriptor.importantWhenMissing && (valueA === undefined || valueB === undefined)) {
      missingInformation.push(`${descriptor.label} is not recorded for ${valueA === undefined ? "Attempt A" : "Attempt B"}.`);
    }
    if (!isExplainedChange(descriptor, declaredChanges, directlyRelated)) {
      unknownChanges.push(`${descriptor.label} changed without a matching declared planned-change reference.`);
    }
  }

  if (attemptA.printerContext.unknownInformation) missingInformation.push("Attempt A identifies unknown printer information.");
  if (attemptB.printerContext.unknownInformation) missingInformation.push("Attempt B identifies unknown printer information.");
  if (attemptA.materialContext.unknownInformation) missingInformation.push("Attempt A identifies unknown material information.");
  if (attemptB.materialContext.unknownInformation) missingInformation.push("Attempt B identifies unknown material information.");

  const outcomeDifferences: string[] = [];
  const outcomeA = attemptA.outcome!;
  const outcomeB = attemptB.outcome!;
  if (outcomeA.status !== outcomeB.status) outcomeDifferences.push(`Outcome status changed from ${outcomeA.status} to ${outcomeB.status}.`);

  const criteriaA = new Map(outcomeA.successCriteriaResults.map((result) => [result.criterion, result]));
  const criteriaB = new Map(outcomeB.successCriteriaResults.map((result) => [result.criterion, result]));
  for (const criterion of project.successCriteria) {
    const resultA = criteriaA.get(criterion);
    const resultB = criteriaB.get(criterion);
    if (!resultA || !resultB) {
      missingInformation.push(`Success-criterion result is incomplete for: ${criterion}.`);
    } else if (resultA.status !== resultB.status || (resultA.notes ?? "") !== (resultB.notes ?? "")) {
      outcomeDifferences.push(`Criterion “${criterion}” changed from ${resultA.status} to ${resultB.status}.`);
    }
  }
  if ((outcomeA.summary ?? "") !== (outcomeB.summary ?? "")) outcomeDifferences.push("Observed-result summary text differs between the Attempts.");
  outcomeDifferences.push(...compareStringLists("Deviation or defect", outcomeA.deviationsOrDefects, outcomeB.deviationsOrDefects));
  outcomeDifferences.push(...compareStringLists("Unexpected condition", outcomeA.unexpectedConditions, outcomeB.unexpectedConditions));
  outcomeDifferences.push(...compareStringLists("Post-processing step", outcomeA.postProcessingPerformed, outcomeB.postProcessingPerformed));
  outcomeDifferences.push(...compareStringLists("Lesson", outcomeA.lessonsLearned, outcomeB.lessonsLearned));

  const supportedObservations = [
    ...changes.map((change) => `${change.label}: Attempt A records “${formatValue(change.attemptAValue)}”; Attempt B records “${formatValue(change.attemptBValue)}”.`),
    ...outcomeDifferences,
  ];
  if (supportedObservations.length === 0) supportedObservations.push("No recorded field or Outcome differences were identified across the governed comparison set.");

  const uncertainties = [
    "This deterministic comparison identifies recorded similarities and differences; it does not establish causation.",
    "Unrecorded conditions, measurement variation, and interactions among variables may affect the observed Outcomes.",
  ];
  if (!directlyRelated) {
    uncertainties.push(
      "The selected Attempts are not a direct parent-child pair; planned-change declarations from other Attempt relationships were not treated as evidence between this pair.",
    );
  }
  if (missingInformation.length > 0) uncertainties.push("Missing or unknown record fields limit the completeness of this comparison.");

  return comparisonSchema.parse({
    comparisonId,
    projectId: project.projectId,
    schemaVersion: project.schemaVersion,
    attemptAId: attemptA.attemptId,
    attemptBId: attemptB.attemptId,
    constants,
    changes,
    intentionalChanges: declaredChanges,
    unknownChanges: uniqueNonEmpty(unknownChanges),
    missingInformation: uniqueNonEmpty(missingInformation),
    outcomeDifferences: uniqueNonEmpty(outcomeDifferences),
    supportedObservations: uniqueNonEmpty(supportedObservations),
    modelInferences: [],
    alternateExplanations: [],
    uncertainties,
    origin: "RULES_BASED_FALLBACK",
    promptVersion: DETERMINISTIC_COMPARISON_VERSION,
    createdAt: now,
  });
}

function comparedAttempt(attempt: Attempt, comparisonId: string, now: string): Attempt {
  if (attempt.status !== "OUTCOME_RECORDED" && attempt.status !== "COMPARED") {
    throw new Error(`Attempt ${attempt.attemptNumber} is not in a comparison-ready lifecycle state.`);
  }
  if (attempt.status === "OUTCOME_RECORDED" && !canTransitionAttemptStatus(attempt.status, "COMPARED")) {
    throw new Error(`Invalid Attempt lifecycle transition: ${attempt.status} -> COMPARED`);
  }
  return attemptSchema.parse({
    ...attempt,
    status: "COMPARED",
    comparisonIds: Array.from(new Set([...attempt.comparisonIds, comparisonId])),
    updatedAt: now,
  });
}

export async function createDeterministicComparisonInProject(
  database: PrintPalDatabase,
  projectId: string,
  attemptAId: string,
  attemptBId: string,
  now = new Date().toISOString(),
  comparisonId = crypto.randomUUID(),
): Promise<{ comparison: Comparison; attemptA: Attempt; attemptB: Attempt; created: boolean }> {
  return database.transaction("rw", database.projects, database.attempts, database.comparisons, async () => {
    const [project, attemptA, attemptB, existingComparisons] = await Promise.all([
      database.projects.get(projectId),
      database.attempts.get(attemptAId),
      database.attempts.get(attemptBId),
      database.comparisons.where("projectId").equals(projectId).toArray(),
    ]);
    if (!project) throw new Error(`Project not found: ${projectId}`);
    if (!attemptA) throw new Error(`Attempt not found: ${attemptAId}`);
    if (!attemptB) throw new Error(`Attempt not found: ${attemptBId}`);
    if (project.status === "ARCHIVED") throw new Error("Restore the Project before creating a Comparison.");

    const existing = existingComparisons.find((candidate) =>
      (candidate.attemptAId === attemptAId && candidate.attemptBId === attemptBId) ||
      (candidate.attemptAId === attemptBId && candidate.attemptBId === attemptAId),
    );
    if (existing) return { comparison: existing, attemptA, attemptB, created: false };
    if (existingComparisons.some((candidate) => candidate.comparisonId === comparisonId)) throw new Error("The generated Comparison identifier already exists.");

    const comparison = buildDeterministicComparison(project, attemptA, attemptB, now, comparisonId);
    const updatedA = comparedAttempt(attemptA, comparison.comparisonId, now);
    const updatedB = comparedAttempt(attemptB, comparison.comparisonId, now);

    const updatedProject = projectSchema.parse({ ...project, updatedAt: now });
    await database.comparisons.add(comparison);
    await database.attempts.put(updatedA);
    await database.attempts.put(updatedB);
    await database.projects.put(updatedProject);
    return { comparison, attemptA: updatedA, attemptB: updatedB, created: true };
  });
}

export async function createDeterministicComparison(
  projectId: string,
  attemptAId: string,
  attemptBId: string,
): Promise<{ comparison: Comparison; attemptA: Attempt; attemptB: Attempt; created: boolean }> {
  return createDeterministicComparisonInProject(applicationDb, projectId, attemptAId, attemptBId);
}
