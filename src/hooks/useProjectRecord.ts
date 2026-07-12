import { useLiveQuery } from "dexie-react-hooks";
import { attemptRepository, projectRepository } from "../data/repositories/instances";

export function useProjectRecord(projectId: string, attemptId: string) {
  return useLiveQuery(async () => {
    const [project, attempt, attempts] = await Promise.all([
      projectRepository.get(projectId),
      attemptRepository.get(attemptId),
      attemptRepository.listByProject(projectId),
    ]);

    return { project, attempt, attempts };
  }, [projectId, attemptId]);
}
