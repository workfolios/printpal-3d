import type { PrintPalDatabase } from "../data/db";
import { db as applicationDb } from "../data/db";
import {
  printPalExportEnvelopeSchema,
  projectExportEnvelopeSchema,
  type AppSettingExportRecord,
  type FullBackupPayload,
  type PrintPalExportEnvelope,
  type ProjectExportPayload,
} from "../domain/schemas/exportSchema";
import type {
  Attempt,
  Comparison,
  NextTestPlan,
  Project,
  SourceReference,
} from "../domain/types";

export const PRINTPAL_APP_VERSION = "0.3.1-beta.1";
export const PRINTPAL_EXPORT_FORMAT = "PRINTPAL_3D" as const;

export interface ImportPreview {
  exportType: "PROJECT" | "FULL_BACKUP";
  appVersion: string;
  schemaVersion: number;
  exportedAt: string;
  projectTitle?: string;
  counts: {
    projects: number;
    attempts: number;
    comparisons: number;
    nextTestPlans: number;
    appSettings: number;
  };
}

export interface ImportedProjectResult {
  projectId: string;
  firstAttemptId?: string;
  projectTitle: string;
}

function unique(values: string[], label: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} contains duplicate identifiers.`);
  }
}

function sameMembers(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((value) => rightSet.has(value));
}

function normalizeAppSettings(
  settings: FullBackupPayload["appSettings"],
  fallbackUpdatedAt: string,
): AppSettingExportRecord[] {
  if (Array.isArray(settings)) return settings;
  return Object.entries(settings).map(([key, value]) => ({ key, value, updatedAt: fallbackUpdatedAt }));
}

function validateProjectRelationships(payload: ProjectExportPayload): void {
  const { project, attempts, comparisons, nextTestPlans } = payload;
  const attemptIds = attempts.map((attempt) => attempt.attemptId);
  const comparisonIds = comparisons.map((comparison) => comparison.comparisonId);
  const planIds = nextTestPlans.map((plan) => plan.nextTestPlanId);
  const sourceIds = attempts.flatMap((attempt) => attempt.sourceReferences.map((source) => source.sourceId));

  unique(attemptIds, "Attempt collection");
  unique(comparisonIds, "Comparison collection");
  unique(planIds, "Next-Test Plan collection");
  unique(sourceIds, "Source Reference collection");
  unique(attempts.map((attempt) => String(attempt.attemptNumber)), "Attempt numbers");

  if (!sameMembers(project.attemptIds, attemptIds)) {
    throw new Error("Project attemptIds must exactly match the exported Attempt collection.");
  }

  const attemptMap = new Map(attempts.map((attempt) => [attempt.attemptId, attempt]));
  const comparisonMap = new Map(comparisons.map((comparison) => [comparison.comparisonId, comparison]));
  const planMap = new Map(nextTestPlans.map((plan) => [plan.nextTestPlanId, plan]));

  for (const attempt of attempts) {
    if (attempt.projectId !== project.projectId) {
      throw new Error(`Attempt ${attempt.attemptId} belongs to a different Project.`);
    }
    if (attempt.parentAttemptId && !attemptMap.has(attempt.parentAttemptId)) {
      throw new Error(`Attempt ${attempt.attemptId} references a missing parent Attempt.`);
    }
    for (const comparisonId of attempt.comparisonIds) {
      const comparison = comparisonMap.get(comparisonId);
      if (!comparison) throw new Error(`Attempt ${attempt.attemptId} references a missing Comparison.`);
      if (comparison.attemptAId !== attempt.attemptId && comparison.attemptBId !== attempt.attemptId) {
        throw new Error(`Attempt ${attempt.attemptId} references an unrelated Comparison.`);
      }
    }
    if (attempt.nextTestPlanId && !planMap.has(attempt.nextTestPlanId)) {
      throw new Error(`Attempt ${attempt.attemptId} references a missing Next-Test Plan.`);
    }
  }

  for (const comparison of comparisons) {
    if (comparison.projectId !== project.projectId) {
      throw new Error(`Comparison ${comparison.comparisonId} belongs to a different Project.`);
    }
    if (!attemptMap.has(comparison.attemptAId) || !attemptMap.has(comparison.attemptBId)) {
      throw new Error(`Comparison ${comparison.comparisonId} references a missing Attempt.`);
    }
    if (!attemptMap.get(comparison.attemptAId)?.comparisonIds.includes(comparison.comparisonId) ||
        !attemptMap.get(comparison.attemptBId)?.comparisonIds.includes(comparison.comparisonId)) {
      throw new Error(`Comparison ${comparison.comparisonId} is not linked from both Attempts.`);
    }
    if (comparison.nextTestPlanId) {
      const plan = planMap.get(comparison.nextTestPlanId);
      if (!plan || plan.originatingComparisonId !== comparison.comparisonId) {
        throw new Error(`Comparison ${comparison.comparisonId} has an invalid Next-Test Plan link.`);
      }
    }
  }

  for (const plan of nextTestPlans) {
    if (plan.projectId !== project.projectId) {
      throw new Error(`Next-Test Plan ${plan.nextTestPlanId} belongs to a different Project.`);
    }
    const comparison = comparisonMap.get(plan.originatingComparisonId);
    if (!comparison) {
      throw new Error(`Next-Test Plan ${plan.nextTestPlanId} references a missing Comparison.`);
    }
    if (comparison.nextTestPlanId !== plan.nextTestPlanId) {
      throw new Error(`Next-Test Plan ${plan.nextTestPlanId} is not linked from its Comparison.`);
    }
  }
}

function validateFullBackupRelationships(payload: FullBackupPayload): void {
  unique(payload.projects.map((project) => project.projectId), "Project collection");
  unique(payload.attempts.map((attempt) => attempt.attemptId), "Attempt collection");
  unique(payload.comparisons.map((comparison) => comparison.comparisonId), "Comparison collection");
  unique(payload.nextTestPlans.map((plan) => plan.nextTestPlanId), "Next-Test Plan collection");
  unique(
    Array.isArray(payload.appSettings) ? payload.appSettings.map((setting) => setting.key) : Object.keys(payload.appSettings),
    "Application settings",
  );
  unique(
    payload.attempts.flatMap((attempt) => attempt.sourceReferences.map((source) => source.sourceId)),
    "Source Reference collection",
  );

  const attemptsByProject = new Map<string, Attempt[]>();
  const comparisonsByProject = new Map<string, Comparison[]>();
  const plansByProject = new Map<string, NextTestPlan[]>();

  for (const attempt of payload.attempts) {
    attemptsByProject.set(attempt.projectId, [...(attemptsByProject.get(attempt.projectId) ?? []), attempt]);
  }
  for (const comparison of payload.comparisons) {
    comparisonsByProject.set(comparison.projectId, [...(comparisonsByProject.get(comparison.projectId) ?? []), comparison]);
  }
  for (const plan of payload.nextTestPlans) {
    plansByProject.set(plan.projectId, [...(plansByProject.get(plan.projectId) ?? []), plan]);
  }

  const projectIds = new Set(payload.projects.map((project) => project.projectId));
  for (const id of [...attemptsByProject.keys(), ...comparisonsByProject.keys(), ...plansByProject.keys()]) {
    if (!projectIds.has(id)) throw new Error(`Backup contains records for missing Project ${id}.`);
  }

  for (const project of payload.projects) {
    validateProjectRelationships({
      project,
      attempts: attemptsByProject.get(project.projectId) ?? [],
      comparisons: comparisonsByProject.get(project.projectId) ?? [],
      nextTestPlans: plansByProject.get(project.projectId) ?? [],
    });
  }
}

export function validateExportRelationships(envelope: PrintPalExportEnvelope): void {
  if (envelope.exportType === "PROJECT") validateProjectRelationships(envelope.payload);
  else validateFullBackupRelationships(envelope.payload);
}

export async function createProjectExportEnvelope(
  projectId: string,
  database: PrintPalDatabase = applicationDb,
  exportedAt = new Date().toISOString(),
): Promise<PrintPalExportEnvelope> {
  const project = await database.projects.get(projectId);
  if (!project) throw new Error("The selected Project could not be found.");

  const attempts = await database.attempts.where("projectId").equals(projectId).sortBy("attemptNumber");
  const comparisons = await database.comparisons.where("projectId").equals(projectId).sortBy("createdAt");
  const nextTestPlans = await database.nextTestPlans.where("projectId").equals(projectId).sortBy("updatedAt");

  const envelope = projectExportEnvelopeSchema.parse({
    format: PRINTPAL_EXPORT_FORMAT,
    schemaVersion: 1,
    appVersion: PRINTPAL_APP_VERSION,
    exportType: "PROJECT",
    exportedAt,
    sourceOrigin: "USER_AUTHORED",
    payload: { project, attempts, comparisons, nextTestPlans },
  });
  validateExportRelationships(envelope);
  return envelope;
}

export async function createFullBackupEnvelope(
  database: PrintPalDatabase = applicationDb,
  exportedAt = new Date().toISOString(),
): Promise<PrintPalExportEnvelope> {
  const [projects, attempts, comparisons, nextTestPlans, appSettings] = await Promise.all([
    database.projects.toArray(),
    database.attempts.toArray(),
    database.comparisons.toArray(),
    database.nextTestPlans.toArray(),
    database.appSettings.toArray(),
  ]);

  const envelope = printPalExportEnvelopeSchema.parse({
    format: PRINTPAL_EXPORT_FORMAT,
    schemaVersion: 1,
    appVersion: PRINTPAL_APP_VERSION,
    exportType: "FULL_BACKUP",
    exportedAt,
    sourceOrigin: "USER_AUTHORED",
    payload: { projects, attempts, comparisons, nextTestPlans, appSettings },
  });
  validateExportRelationships(envelope);
  return envelope;
}

export function serializeExport(envelope: PrintPalExportEnvelope): string {
  return `${JSON.stringify(envelope, null, 2)}\n`;
}

export function parseImportText(text: string): PrintPalExportEnvelope {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }
  const parsed = printPalExportEnvelopeSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`The selected file is not a compatible PrintPal export: ${parsed.error.issues[0]?.message ?? "validation failed"}`);
  }
  validateExportRelationships(parsed.data);
  return parsed.data;
}

export function previewImport(envelope: PrintPalExportEnvelope): ImportPreview {
  if (envelope.exportType === "PROJECT") {
    return {
      exportType: envelope.exportType,
      appVersion: envelope.appVersion,
      schemaVersion: envelope.schemaVersion,
      exportedAt: envelope.exportedAt,
      projectTitle: envelope.payload.project.title,
      counts: {
        projects: 1,
        attempts: envelope.payload.attempts.length,
        comparisons: envelope.payload.comparisons.length,
        nextTestPlans: envelope.payload.nextTestPlans.length,
        appSettings: 0,
      },
    };
  }
  return {
    exportType: envelope.exportType,
    appVersion: envelope.appVersion,
    schemaVersion: envelope.schemaVersion,
    exportedAt: envelope.exportedAt,
    counts: {
      projects: envelope.payload.projects.length,
      attempts: envelope.payload.attempts.length,
      comparisons: envelope.payload.comparisons.length,
      nextTestPlans: envelope.payload.nextTestPlans.length,
      appSettings: Array.isArray(envelope.payload.appSettings)
        ? envelope.payload.appSettings.length
        : Object.keys(envelope.payload.appSettings).length,
    },
  };
}

function mapId(map: Map<string, string>, id: string | undefined): string | undefined {
  if (!id) return undefined;
  const replacement = map.get(id);
  if (!replacement) throw new Error(`Import relationship could not be rebuilt for ${id}.`);
  return replacement;
}

export async function importProjectAsNew(
  envelope: PrintPalExportEnvelope,
  database: PrintPalDatabase = applicationDb,
  idFactory: () => string = () => crypto.randomUUID(),
  importedAt = new Date().toISOString(),
): Promise<ImportedProjectResult> {
  if (envelope.exportType !== "PROJECT") throw new Error("A Full Backup cannot be imported as one Project.");
  validateExportRelationships(envelope);

  const source = envelope.payload;
  const projectId = idFactory();
  const attemptIds = new Map(source.attempts.map((attempt) => [attempt.attemptId, idFactory()]));
  const comparisonIds = new Map(source.comparisons.map((comparison) => [comparison.comparisonId, idFactory()]));
  const planIds = new Map(source.nextTestPlans.map((plan) => [plan.nextTestPlanId, idFactory()]));
  const sourceIds = new Map(
    source.attempts.flatMap((attempt) => attempt.sourceReferences.map((reference) => [reference.sourceId, idFactory()] as const)),
  );

  const remapSource = (reference: SourceReference): SourceReference => ({
    ...reference,
    sourceId: mapId(sourceIds, reference.sourceId)!,
  });

  const project: Project = {
    ...source.project,
    projectId,
    attemptIds: source.project.attemptIds.map((id) => mapId(attemptIds, id)!),
    tags: Array.from(new Set([...source.project.tags, "imported"])),
    updatedAt: importedAt,
  };
  const attempts: Attempt[] = source.attempts.map((attempt) => ({
    ...attempt,
    attemptId: mapId(attemptIds, attempt.attemptId)!,
    projectId,
    parentAttemptId: mapId(attemptIds, attempt.parentAttemptId),
    sourceReferences: attempt.sourceReferences.map(remapSource),
    comparisonIds: attempt.comparisonIds.map((id) => mapId(comparisonIds, id)!),
    nextTestPlanId: mapId(planIds, attempt.nextTestPlanId),
    updatedAt: importedAt,
  }));
  const comparisons: Comparison[] = source.comparisons.map((comparison) => ({
    ...comparison,
    comparisonId: mapId(comparisonIds, comparison.comparisonId)!,
    projectId,
    attemptAId: mapId(attemptIds, comparison.attemptAId)!,
    attemptBId: mapId(attemptIds, comparison.attemptBId)!,
    nextTestPlanId: mapId(planIds, comparison.nextTestPlanId),
  }));
  const nextTestPlans: NextTestPlan[] = source.nextTestPlans.map((plan) => ({
    ...plan,
    nextTestPlanId: mapId(planIds, plan.nextTestPlanId)!,
    projectId,
    originatingComparisonId: mapId(comparisonIds, plan.originatingComparisonId)!,
    updatedAt: importedAt,
  }));

  const regenerated = projectExportEnvelopeSchema.parse({
    ...envelope,
    exportedAt: importedAt,
    payload: { project, attempts, comparisons, nextTestPlans },
  });
  validateExportRelationships(regenerated);

  await database.transaction(
    "rw",
    database.projects,
    database.attempts,
    database.comparisons,
    database.nextTestPlans,
    async () => {
      await database.projects.add(project);
      if (attempts.length) await database.attempts.bulkAdd(attempts);
      if (comparisons.length) await database.comparisons.bulkAdd(comparisons);
      if (nextTestPlans.length) await database.nextTestPlans.bulkAdd(nextTestPlans);
    },
  );

  return {
    projectId,
    firstAttemptId: [...attempts].sort((a, b) => a.attemptNumber - b.attemptNumber)[0]?.attemptId,
    projectTitle: project.title,
  };
}

export async function restoreFullBackupReplaceAll(
  envelope: PrintPalExportEnvelope,
  database: PrintPalDatabase = applicationDb,
): Promise<ImportPreview> {
  if (envelope.exportType !== "FULL_BACKUP") throw new Error("Only a Full Backup can replace all local data.");
  validateExportRelationships(envelope);
  const payload = envelope.payload;
  const appSettings = normalizeAppSettings(payload.appSettings, envelope.exportedAt);

  await database.transaction(
    "rw",
    database.projects,
    database.attempts,
    database.comparisons,
    database.nextTestPlans,
    database.appSettings,
    async () => {
      await Promise.all([
        database.projects.clear(),
        database.attempts.clear(),
        database.comparisons.clear(),
        database.nextTestPlans.clear(),
        database.appSettings.clear(),
      ]);
      if (payload.projects.length) await database.projects.bulkAdd(payload.projects);
      if (payload.attempts.length) await database.attempts.bulkAdd(payload.attempts);
      if (payload.comparisons.length) await database.comparisons.bulkAdd(payload.comparisons);
      if (payload.nextTestPlans.length) await database.nextTestPlans.bulkAdd(payload.nextTestPlans);
      if (appSettings.length) await database.appSettings.bulkAdd(appSettings);

      const counts = await Promise.all([
        database.projects.count(),
        database.attempts.count(),
        database.comparisons.count(),
        database.nextTestPlans.count(),
        database.appSettings.count(),
      ]);
      const expected = [
        payload.projects.length,
        payload.attempts.length,
        payload.comparisons.length,
        payload.nextTestPlans.length,
        appSettings.length,
      ];
      if (counts.some((count, index) => count !== expected[index])) {
        throw new Error("Backup restoration verification failed. The prior local data was retained.");
      }
    },
  );

  return previewImport(envelope);
}

function listMarkdown(values: string[] | undefined, empty = "None recorded."): string {
  return values?.length ? values.map((value) => `- ${value}`).join("\n") : `- ${empty}`;
}

export function renderProjectMarkdown(payload: ProjectExportPayload): string {
  validateProjectRelationships(payload);
  const attempts = [...payload.attempts].sort((a, b) => a.attemptNumber - b.attemptNumber);
  const comparisons = new Map(payload.comparisons.map((comparison) => [comparison.comparisonId, comparison]));
  const plans = new Map(payload.nextTestPlans.map((plan) => [plan.nextTestPlanId, plan]));
  const lines: string[] = [
    `# ${payload.project.title}`,
    "",
    `**Purpose:** ${payload.project.purpose}`,
    `**Status:** ${payload.project.status}`,
    `**Created:** ${payload.project.createdAt}`,
    `**Last Updated:** ${payload.project.updatedAt}`,
    "",
    "## Success Criteria",
    "",
    listMarkdown(payload.project.successCriteria),
  ];

  for (const attempt of attempts) {
    lines.push(
      "",
      `## Attempt ${attempt.attemptNumber}`,
      "",
      `**Status:** ${attempt.status}`,
      `**Printer:** ${attempt.printerContext.manufacturer ?? "Not recorded"} ${attempt.printerContext.model ?? ""}`.trim(),
      `**Technology:** ${attempt.printerContext.technology}`,
      `**Material:** ${attempt.materialContext.manufacturer ?? ""} ${attempt.materialContext.productOrResinName ?? attempt.materialContext.materialClass}`.trim(),
      `**Slicer:** ${attempt.processContext.slicerName ?? "Not recorded"}`,
      "",
      "### Planned Context",
      "",
      attempt.processContext.plannedAttemptDescription ?? "No planned-attempt description recorded.",
      "",
      "### Known Concerns",
      "",
      listMarkdown(attempt.processContext.knownConcerns),
    );

    if (attempt.plan) {
      lines.push(
        "",
        "### Planning Record",
        "",
        `**Origin:** ${attempt.plan.origin}`,
        `**Objective:** ${attempt.plan.objectiveSummary}`,
        "",
        "**Readiness Considerations**",
        listMarkdown(attempt.plan.readinessConsiderations),
        "",
        "**Missing Information**",
        listMarkdown(attempt.plan.missingInformation),
        "",
        "**Source Checks**",
        listMarkdown(attempt.plan.sourceChecks),
      );
    }

    lines.push("", "### Sources", "");
    if (attempt.sourceReferences.length) {
      for (const source of attempt.sourceReferences) {
        lines.push(`- **${source.title}** — ${source.category}; ${source.url ?? "No URL"}; authority: ${source.authorityClassification}`);
      }
    } else lines.push("- No source references recorded.");

    if (attempt.outcome) {
      lines.push(
        "",
        "### Outcome",
        "",
        `**Status:** ${attempt.outcome.status}`,
        `**Observed Result:** ${attempt.outcome.observations.length ? attempt.outcome.observations.join("; ") : "Not recorded"}`,
        "",
        "**Deviations Or Defects**",
        listMarkdown(attempt.outcome.deviationsOrDefects),
        "",
        "**Lessons Learned**",
        listMarkdown(attempt.outcome.lessonsLearned),
      );
    } else {
      lines.push("", "### Outcome", "", "No Outcome recorded.");
    }

    for (const comparisonId of attempt.comparisonIds) {
      const comparison = comparisons.get(comparisonId);
      if (!comparison || comparison.attemptAId !== attempt.attemptId) continue;
      lines.push(
        "",
        `### Comparison ${comparison.comparisonId}`,
        "",
        `**Attempts:** ${comparison.attemptAId} and ${comparison.attemptBId}`,
        "",
        "**Changed Fields**",
        comparison.changes.length
          ? comparison.changes.map((change) => `- ${change.label}: ${JSON.stringify(change.attemptAValue)} → ${JSON.stringify(change.attemptBValue)}`).join("\n")
          : "- No changed fields recorded.",
        "",
        "**Outcome Differences**",
        listMarkdown(comparison.outcomeDifferences),
        "",
        "**Supported Observations**",
        listMarkdown(comparison.supportedObservations),
        "",
        "**Interpretation**",
        comparison.interpretationSummary ?? "No interpretation recorded.",
        "",
        "**Interpretation Origin:** " + (comparison.interpretationOrigin ?? "Not applicable"),
      );

      if (comparison.nextTestPlanId) {
        const next = plans.get(comparison.nextTestPlanId);
        if (next) {
          lines.push(
            "",
            "### Next-Test Plan",
            "",
            `**Status:** ${next.approvalStatus}`,
            `**Origin:** ${next.origin}`,
            `**Test Question:** ${next.testQuestion}`,
            `**Primary Variable:** ${next.primaryVariable}`,
            "",
            "**Constants**",
            listMarkdown(next.constants),
            "",
            "**Observation Or Measurement Plan**",
            listMarkdown(next.observationOrMeasurementPlan),
            "",
            `**Expected Learning:** ${next.expectedLearning}`,
          );
        }
      }
    }
  }

  lines.push(
    "",
    "## Advisory Boundary",
    "",
    "PrintPal 3D is an advisory decision-memory tool. Manufacturer documentation, printer manuals, slicer documentation, verified profiles, Technical Data Sheets, Safety Data Sheets, technical validation, and user judgment remain authoritative.",
    "",
  );
  return lines.join("\n");
}

export function safeFileStem(value: string): string {
  const stem = value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return stem || "printpal-record";
}
