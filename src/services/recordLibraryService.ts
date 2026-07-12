import type { Attempt, Project, ProjectStatus } from "../domain/types";

export type LibraryStatusFilter = "ALL" | ProjectStatus;

export interface RecordLibraryFilters {
  search: string;
  status: LibraryStatusFilter;
  printerTechnology: string;
  materialClass: string;
}

export interface ProjectRecordSummary {
  project: Project;
  attempts: Attempt[];
  latestAttempt?: Attempt;
  printerTechnology: string;
  materialClass: string;
  nextRecommendedAction: string;
}

function getNextRecommendedAction(attempt?: Attempt): string {
  if (!attempt) return "Create the first attempt";

  switch (attempt.status) {
    case "DRAFT":
      return "Complete attempt context";
    case "PLANNED":
      return "Run the print and record the outcome";
    case "PRINTED":
      return "Record the outcome";
    case "OUTCOME_RECORDED":
      return "Create or compare the next attempt";
    case "COMPARED":
      return "Review the next-test plan";
    case "ARCHIVED":
      return "Restore the attempt when needed";
  }
}

export function buildRecordLibrarySummaries(
  projects: Project[],
  attempts: Attempt[],
): ProjectRecordSummary[] {
  return projects.map((project) => {
    const projectAttempts = attempts
      .filter((attempt) => attempt.projectId === project.projectId)
      .sort((a, b) => a.attemptNumber - b.attemptNumber);
    const latestAttempt = projectAttempts.at(-1);

    return {
      project,
      attempts: projectAttempts,
      latestAttempt,
      printerTechnology: latestAttempt?.printerTechnologyIndex ?? "UNKNOWN",
      materialClass: latestAttempt?.materialClassIndex ?? "Unknown",
      nextRecommendedAction: getNextRecommendedAction(latestAttempt),
    };
  });
}

export function filterRecordLibrary(
  records: ProjectRecordSummary[],
  filters: RecordLibraryFilters,
): ProjectRecordSummary[] {
  const search = filters.search.trim().toLocaleLowerCase();

  return records
    .filter(({ project, printerTechnology, materialClass }) => {
      const matchesSearch =
        !search ||
        project.title.toLocaleLowerCase().includes(search) ||
        project.purpose.toLocaleLowerCase().includes(search) ||
        project.tags.some((tag) => tag.toLocaleLowerCase().includes(search));
      const matchesStatus = filters.status === "ALL" || project.status === filters.status;
      const matchesTechnology =
        !filters.printerTechnology || printerTechnology === filters.printerTechnology;
      const matchesMaterial =
        !filters.materialClass || materialClass === filters.materialClass;

      return matchesSearch && matchesStatus && matchesTechnology && matchesMaterial;
    })
    .sort((a, b) => b.project.updatedAt.localeCompare(a.project.updatedAt));
}

export function uniqueFilterOptions(records: ProjectRecordSummary[]) {
  return {
    printerTechnologies: Array.from(
      new Set(records.map((record) => record.printerTechnology).filter(Boolean)),
    ).sort(),
    materialClasses: Array.from(
      new Set(records.map((record) => record.materialClass).filter(Boolean)),
    ).sort(),
  };
}
