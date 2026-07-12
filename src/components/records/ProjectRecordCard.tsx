import {
  Archive,
  CalendarDays,
  FolderOpen,
  Printer,
  RotateCcw,
} from "lucide-react";
import type { ProjectRecordSummary } from "../../services/recordLibraryService";

interface ProjectRecordCardProps {
  record: ProjectRecordSummary;
  onOpen: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function ProjectRecordCard({
  record,
  onOpen,
  onArchive,
  onRestore,
}: ProjectRecordCardProps) {
  const { project, latestAttempt } = record;
  const isArchived = project.status === "ARCHIVED";

  return (
    <article className="flex min-h-[280px] flex-col rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm transition hover:border-[#4B7270] hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="mb-2 inline-flex rounded-full bg-[#EDF3F2] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">
            {project.status}
          </span>
          <h2 className="truncate text-lg font-bold text-[#333333]">{project.title}</h2>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#6F6F6F]">{project.purpose}</p>
        </div>
        <div className="shrink-0 rounded-md border border-[#E2E1DB] bg-[#F8F7F2] px-3 py-2 text-center">
          <div className="text-lg font-bold text-[#333333]">{record.attempts.length}</div>
          <div className="text-[8px] font-bold uppercase tracking-widest text-[#8A8A8A]">Attempts</div>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-3 border-y border-[#EEEDE7] py-4 text-xs sm:grid-cols-2">
        <div>
          <dt className="mb-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">
            <Printer className="h-3.5 w-3.5" /> Printer
          </dt>
          <dd className="font-medium text-[#333333]">{record.printerTechnology.replaceAll("_", " ")}</dd>
        </div>
        <div>
          <dt className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">Material</dt>
          <dd className="font-medium text-[#333333]">{record.materialClass}</dd>
        </div>
        <div>
          <dt className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">Latest Attempt</dt>
          <dd className="font-medium text-[#333333]">
            {latestAttempt ? `Attempt ${latestAttempt.attemptNumber} · ${latestAttempt.status}` : "Not created"}
          </dd>
        </div>
        <div>
          <dt className="mb-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">
            <CalendarDays className="h-3.5 w-3.5" /> Updated
          </dt>
          <dd className="font-medium text-[#333333]">{formatDate(project.updatedAt)}</dd>
        </div>
      </dl>

      <div className="flex-1 py-4">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">Next Recommended Action</p>
        <p className="mt-1 text-sm text-[#4B7270]">{record.nextRecommendedAction}</p>
      </div>

      <div className="flex flex-col gap-2 border-t border-[#EEEDE7] pt-4 sm:flex-row">
        <button
          type="button"
          onClick={onOpen}
          disabled={!latestAttempt}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-[#3D5D5B] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FolderOpen className="h-4 w-4" /> Open Record
        </button>
        {isArchived ? (
          <button
            type="button"
            onClick={onRestore}
            className="inline-flex items-center justify-center gap-2 rounded border border-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] transition hover:bg-[#EDF3F2]"
          >
            <RotateCcw className="h-4 w-4" /> Restore
          </button>
        ) : (
          <button
            type="button"
            onClick={onArchive}
            className="inline-flex items-center justify-center gap-2 rounded border border-[#D6D4CC] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F] transition hover:bg-[#F8F7F2]"
          >
            <Archive className="h-4 w-4" /> Archive
          </button>
        )}
      </div>
    </article>
  );
}
