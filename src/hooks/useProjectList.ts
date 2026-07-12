import { useLiveQuery } from "dexie-react-hooks";
import { attemptRepository, projectRepository } from "../data/repositories/instances";
import { buildRecordLibrarySummaries } from "../services/recordLibraryService";

export function useProjectList() {
  return useLiveQuery(async () => {
    const [projects, attempts] = await Promise.all([
      projectRepository.listAll(),
      attemptRepository.listAll(),
    ]);
    return buildRecordLibrarySummaries(projects, attempts);
  }, []);
}
