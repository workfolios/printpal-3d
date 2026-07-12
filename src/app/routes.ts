export type AppRoute =
  | { name: "RECORD_LIBRARY" }
  | { name: "NEW_PROJECT" }
  | { name: "ATTEMPT_DETAIL"; projectId: string; attemptId: string }
  | { name: "PLANNING_RECORD"; projectId: string; attemptId: string }
  | { name: "LEGACY_PLANNER" }
  | { name: "MATERIAL_COMPASS" }
  | { name: "FAILURE_REVIEW" };

export const RECORD_LIBRARY_ROUTE: AppRoute = { name: "RECORD_LIBRARY" };
export const NEW_PROJECT_ROUTE: AppRoute = { name: "NEW_PROJECT" };
