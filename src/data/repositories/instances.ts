import { db } from "../db";
import { AttemptRepository } from "./attemptRepository";
import { ComparisonRepository } from "./comparisonRepository";
import { NextTestPlanRepository } from "./nextTestPlanRepository";
import { ProjectRepository } from "./projectRepository";
import { SettingsRepository } from "./settingsRepository";

export const projectRepository = new ProjectRepository(db);
export const attemptRepository = new AttemptRepository(db);
export const comparisonRepository = new ComparisonRepository(db);
export const nextTestPlanRepository = new NextTestPlanRepository(db);
export const settingsRepository = new SettingsRepository(db);
