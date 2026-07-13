export type AppRoute =
  | { name: "RECORD_LIBRARY" }
  | { name: "NEW_PROJECT" }
  | { name: "ATTEMPT_DETAIL"; projectId: string; attemptId: string }
  | { name: "PLANNING_RECORD"; projectId: string; attemptId: string }
  | { name: "RECORD_OUTCOME"; projectId: string; attemptId: string }
  | { name: "DUPLICATE_ATTEMPT"; projectId: string; sourceAttemptId: string }
  | { name: "COMPARE_ATTEMPTS"; projectId: string; baselineAttemptId: string }
  | { name: "COMPARISON_RECORD"; projectId: string; comparisonId: string; returnAttemptId: string }
  | { name: "DECISION_SUPPORT"; projectId: string; comparisonId: string; returnAttemptId: string }
  | { name: "LEGACY_PLANNER" }
  | { name: "MATERIAL_COMPASS" }
  | { name: "FAILURE_REVIEW" };

export const RECORD_LIBRARY_ROUTE: AppRoute = { name: "RECORD_LIBRARY" };
export const NEW_PROJECT_ROUTE: AppRoute = { name: "NEW_PROJECT" };
