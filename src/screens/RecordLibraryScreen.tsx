import { Archive, Database, Plus, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { projectRepository } from "../data/repositories/instances";
import { useProjectList } from "../hooks/useProjectList";
import {
  filterRecordLibrary,
  type LibraryStatusFilter,
  uniqueFilterOptions,
} from "../services/recordLibraryService";
import { ProjectRecordCard } from "../components/records/ProjectRecordCard";

interface RecordLibraryScreenProps {
  onNewProject: () => void;
  onOpenProject: (projectId: string, attemptId: string) => void;
  onOpenReferenceTools: () => void;
}

export function RecordLibraryScreen({
  onNewProject,
  onOpenProject,
  onOpenReferenceTools,
}: RecordLibraryScreenProps) {
  const records = useProjectList();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LibraryStatusFilter>("ALL");
  const [printerTechnology, setPrinterTechnology] = useState("");
  const [materialClass, setMaterialClass] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const options = useMemo(() => uniqueFilterOptions(records ?? []), [records]);
  const filteredRecords = useMemo(
    () =>
      filterRecordLibrary(records ?? [], {
        search,
        status,
        printerTechnology,
        materialClass,
      }),
    [records, search, status, printerTechnology, materialClass],
  );

  const handleStatusChange = async (projectId: string, nextStatus: "ARCHIVED" | "ACTIVE") => {
    setActionError(null);
    try {
      await projectRepository.transitionStatus(projectId, nextStatus);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The record could not be updated.");
    }
  };

  if (records === undefined) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-[#E2E1DB] bg-white text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
        Loading local records…
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:flex-row md:items-end md:justify-between md:p-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4B7270]">
            <Database className="h-4 w-4" /> Local Decision Memory
          </div>
          <h1 className="text-2xl font-light tracking-tight text-[#333333] md:text-3xl">Record Library</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6F6F6F]">
            Preserve print intent, context, and attempt history in this browser. Records remain local to this browser and application address.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewProject}
          className="inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm transition hover:bg-[#3D5D5B]"
        >
          <Plus className="h-4 w-4" /> New Print Record
        </button>
      </div>

      {records.length === 0 ? (
        <div className="grid min-h-[440px] place-items-center rounded-lg border border-dashed border-[#CFCFC7] bg-white p-8 text-center shadow-sm">
          <div className="max-w-xl">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#EDF3F2] text-[#4B7270]">
              <Archive className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-[#333333]">Build your first reusable print record</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6F6F6F]">
              Start with a project objective and Attempt 1. PrintPal will retain the record locally so planning, outcomes, comparisons, and next tests remain connected without reconstructing the work from memory.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onNewProject}
                className="inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-[#3D5D5B]"
              >
                <Plus className="h-4 w-4" /> Start New Print Record
              </button>
              <button
                type="button"
                onClick={onOpenReferenceTools}
                className="inline-flex items-center justify-center gap-2 rounded border border-[#4B7270] px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] transition hover:bg-[#EDF3F2]"
              >
                <Sparkles className="h-4 w-4" /> Open Reference Tools
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-[#E2E1DB] bg-white p-4 shadow-sm md:p-5">
            <div className="mb-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">
              <SlidersHorizontal className="h-4 w-4" /> Search And Filter
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="relative">
                <span className="sr-only">Search records</span>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8A8A]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, purpose, or tag"
                  className="w-full rounded border border-[#D6D4CC] bg-[#FCFBF7] py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]"
                />
              </label>
              <select
                aria-label="Filter by lifecycle status"
                value={status}
                onChange={(event) => setStatus(event.target.value as LibraryStatusFilter)}
                className="rounded border border-[#D6D4CC] bg-[#FCFBF7] px-3 py-2.5 text-sm outline-none focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]"
              >
                <option value="ALL">All lifecycle statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <select
                aria-label="Filter by printer technology"
                value={printerTechnology}
                onChange={(event) => setPrinterTechnology(event.target.value)}
                className="rounded border border-[#D6D4CC] bg-[#FCFBF7] px-3 py-2.5 text-sm outline-none focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]"
              >
                <option value="">All printer technologies</option>
                {options.printerTechnologies.map((value) => (
                  <option key={value} value={value}>{value.replaceAll("_", " ")}</option>
                ))}
              </select>
              <select
                aria-label="Filter by material class"
                value={materialClass}
                onChange={(event) => setMaterialClass(event.target.value)}
                className="rounded border border-[#D6D4CC] bg-[#FCFBF7] px-3 py-2.5 text-sm outline-none focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]"
              >
                <option value="">All material classes</option>
                {options.materialClasses.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          {actionError && (
            <div role="alert" className="rounded border border-[#C98C78] bg-[#FFF7F3] px-4 py-3 text-sm text-[#8A4C39]">
              {actionError}
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
            <span>{filteredRecords.length} record{filteredRecords.length === 1 ? "" : "s"}</span>
            <span>Recently updated first</span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="rounded-lg border border-[#E2E1DB] bg-white p-10 text-center text-sm text-[#6F6F6F]">
              No records match the current search and filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredRecords.map((record) => (
                <ProjectRecordCard
                  key={record.project.projectId}
                  record={record}
                  onOpen={() => {
                    if (record.latestAttempt) {
                      onOpenProject(record.project.projectId, record.latestAttempt.attemptId);
                    }
                  }}
                  onArchive={() => handleStatusChange(record.project.projectId, "ARCHIVED")}
                  onRestore={() => handleStatusChange(record.project.projectId, "ACTIVE")}
                />
              ))}
            </div>
          )}
        </>
      )}

      <div className="rounded border border-[#F5EAD2] bg-[#FFFCF0] p-4 text-xs leading-relaxed text-[#7D6B45]">
        <strong className="mb-1 block text-sm uppercase">Advisory Reminder</strong>
        PrintPal 3D is a planning and documentation aid only. Verify printer settings, material handling, post-processing, ventilation, and safety practices against manufacturer documentation, slicer guidance, Technical Data Sheets, and Safety Data Sheets.
      </div>
    </section>
  );
}
