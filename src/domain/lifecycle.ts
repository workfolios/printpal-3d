export const PROJECT_STATUSES = ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const ATTEMPT_STATUSES = [
  "DRAFT",
  "PLANNED",
  "PRINTED",
  "OUTCOME_RECORDED",
  "COMPARED",
  "ARCHIVED",
] as const;
export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];

const projectTransitions: Record<ProjectStatus, readonly ProjectStatus[]> = {
  DRAFT: ["ACTIVE", "ARCHIVED"],
  ACTIVE: ["COMPLETED", "ARCHIVED"],
  COMPLETED: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: ["DRAFT", "ACTIVE", "COMPLETED"],
};

const attemptTransitions: Record<AttemptStatus, readonly AttemptStatus[]> = {
  DRAFT: ["PLANNED", "ARCHIVED"],
  PLANNED: ["DRAFT", "PRINTED", "ARCHIVED"],
  PRINTED: ["OUTCOME_RECORDED", "ARCHIVED"],
  OUTCOME_RECORDED: ["COMPARED", "ARCHIVED"],
  COMPARED: ["OUTCOME_RECORDED", "ARCHIVED"],
  ARCHIVED: ["DRAFT", "PLANNED", "PRINTED", "OUTCOME_RECORDED", "COMPARED"],
};

export function canTransitionProjectStatus(from: ProjectStatus, to: ProjectStatus): boolean {
  return from === to || projectTransitions[from].includes(to);
}

export function canTransitionAttemptStatus(from: AttemptStatus, to: AttemptStatus): boolean {
  return from === to || attemptTransitions[from].includes(to);
}
