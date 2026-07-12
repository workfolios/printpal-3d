import { CURRENT_RECORD_SCHEMA_VERSION } from "../domain/schemas/commonSchema";
import { attemptSchema } from "../domain/schemas/attemptSchema";
import { projectSchema } from "../domain/schemas/projectSchema";
import type { Attempt, Project } from "../domain/types";
import type { PrintPalDatabase } from "../data/db";
import { createProjectWithFirstAttempt } from "../data/transactions";

export interface NewProjectInput {
  title: string;
  purpose: string;
  description?: string;
  successCriteria: string[];
  tags?: string[];
  printerTechnology: Attempt["printerTechnologyIndex"];
  printerManufacturer?: string;
  printerModel?: string;
  materialClass: string;
  materialManufacturer?: string;
  materialProductName?: string;
  plannedAttemptDescription?: string;
  knownConcerns?: string[];
  slicerName?: string;
  profileReference?: string;
  technicalNotes?: string;
  sourceTitle?: string;
  sourceUrl?: string;
}

export interface RecordIdentifiers {
  projectId: string;
  attemptId: string;
  sourceId: string;
}

export function buildProjectAndFirstAttempt(
  input: NewProjectInput,
  now: string,
  ids: RecordIdentifiers,
): { project: Project; attempt: Attempt } {
  const project = projectSchema.parse({
    projectId: ids.projectId,
    schemaVersion: CURRENT_RECORD_SCHEMA_VERSION,
    title: input.title,
    purpose: input.purpose,
    description: input.description || undefined,
    successCriteria: input.successCriteria,
    tags: input.tags ?? [],
    status: "ACTIVE",
    attemptIds: [ids.attemptId],
    createdAt: now,
    updatedAt: now,
  });

  const sourceReferences = input.sourceTitle?.trim()
    ? [
        {
          sourceId: ids.sourceId,
          category: "OTHER" as const,
          title: input.sourceTitle.trim(),
          url: input.sourceUrl?.trim() || undefined,
          authorityClassification: "UNVERIFIED" as const,
          createdAt: now,
        },
      ]
    : [];

  const attempt = attemptSchema.parse({
    attemptId: ids.attemptId,
    projectId: ids.projectId,
    schemaVersion: CURRENT_RECORD_SCHEMA_VERSION,
    attemptNumber: 1,
    status: "DRAFT",
    printerContext: {
      technology: input.printerTechnology,
      manufacturer: input.printerManufacturer || undefined,
      model: input.printerModel || undefined,
      unknownInformation: false,
    },
    materialContext: {
      materialClass: input.materialClass,
      manufacturer: input.materialManufacturer || undefined,
      productOrResinName: input.materialProductName || undefined,
      unknownInformation: false,
    },
    processContext: {
      slicerName: input.slicerName || undefined,
      profileReference: input.profileReference || undefined,
      plannedAttemptDescription: input.plannedAttemptDescription || undefined,
      knownConcerns: input.knownConcerns ?? [],
      settingsSnapshotOrNotes: input.technicalNotes || undefined,
      plannedVariables: [],
      changesFromParentAttempt: [],
    },
    sourceReferences,
    comparisonIds: [],
    printerTechnologyIndex: input.printerTechnology,
    materialClassIndex: input.materialClass,
    createdAt: now,
    updatedAt: now,
  });

  return { project, attempt };
}

export async function createNewProject(
  db: PrintPalDatabase,
  input: NewProjectInput,
): Promise<{ project: Project; attempt: Attempt }> {
  const now = new Date().toISOString();
  const records = buildProjectAndFirstAttempt(input, now, {
    projectId: crypto.randomUUID(),
    attemptId: crypto.randomUUID(),
    sourceId: crypto.randomUUID(),
  });

  return createProjectWithFirstAttempt(db, records.project, records.attempt);
}
