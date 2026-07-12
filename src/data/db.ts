import Dexie, { type Table } from "dexie";
import type { Attempt, Comparison, NextTestPlan, Project } from "../domain/types";
import type { AppSettingRecord } from "./appSettings";

export const PRINTPAL_DB_NAME = "printpal-3d-local";
export const PRINTPAL_DB_VERSION = 1;

export class PrintPalDatabase extends Dexie {
  projects!: Table<Project, string>;
  attempts!: Table<Attempt, string>;
  comparisons!: Table<Comparison, string>;
  nextTestPlans!: Table<NextTestPlan, string>;
  appSettings!: Table<AppSettingRecord, string>;

  constructor(name = PRINTPAL_DB_NAME) {
    super(name);

    this.version(PRINTPAL_DB_VERSION).stores({
      projects: "projectId, status, updatedAt, *tags",
      attempts:
        "attemptId, projectId, parentAttemptId, attemptNumber, status, printerTechnologyIndex, materialClassIndex, updatedAt, [projectId+attemptNumber]",
      comparisons: "comparisonId, projectId, attemptAId, attemptBId, createdAt",
      nextTestPlans:
        "nextTestPlanId, projectId, originatingComparisonId, approvalStatus, updatedAt",
      appSettings: "key, updatedAt",
    });
  }
}

export function createPrintPalDatabase(name = PRINTPAL_DB_NAME): PrintPalDatabase {
  return new PrintPalDatabase(name);
}

export const db = createPrintPalDatabase();
