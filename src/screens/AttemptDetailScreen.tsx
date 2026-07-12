import { Archive, ArrowLeft, Beaker, BookOpen, Printer, RotateCcw, Sparkles } from "lucide-react";
import type { PresentationMode } from "../app/presentationMode";
import { projectRepository } from "../data/repositories/instances";
import { useProjectRecord } from "../hooks/useProjectRecord";

interface AttemptDetailScreenProps {
  projectId: string;
  attemptId: string;
  mode: PresentationMode;
  onBack: () => void;
  onOpenPlanner: () => void;
}

const LABEL_CLASS = "text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]";

export function AttemptDetailScreen({
  projectId,
  attemptId,
  mode,
  onBack,
  onOpenPlanner,
}: AttemptDetailScreenProps) {
  const record = useProjectRecord(projectId, attemptId);

  if (!record) {
    return <div className="grid min-h-[360px] place-items-center rounded-lg border border-[#E2E1DB] bg-white text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">Loading record…</div>;
  }

  if (!record.project || !record.attempt) {
    return (
      <div className="rounded-lg border border-[#E2E1DB] bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-[#333333]">Record not found</h1>
        <p className="mt-2 text-sm text-[#6F6F6F]">The project or attempt is no longer available in this browser.</p>
        <button type="button" onClick={onBack} className="mt-6 rounded bg-[#4B7270] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white">Return To Records</button>
      </div>
    );
  }

  const { project, attempt, attempts } = record;
  const isArchived = project.status === "ARCHIVED";

  const changeProjectStatus = async () => {
    await projectRepository.transitionStatus(project.projectId, isArchived ? "ACTIVE" : "ARCHIVED");
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:flex-row md:items-start md:justify-between md:p-6">
        <div>
          <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] hover:text-[#3D5D5B]"><ArrowLeft className="h-4 w-4" /> Record Library</button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#EDF3F2] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">{project.status}</span>
            <span className="rounded-full border border-[#D6D4CC] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#6F6F6F]">Attempt {attempt.attemptNumber} · {attempt.status}</span>
          </div>
          <h1 className="mt-3 text-2xl font-light tracking-tight text-[#333333] md:text-3xl">{project.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6F6F6F]">{project.purpose}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
          <button type="button" onClick={onOpenPlanner} className="inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#3D5D5B]"><Sparkles className="h-4 w-4" /> Open Planner</button>
          <button type="button" onClick={changeProjectStatus} className="inline-flex items-center justify-center gap-2 rounded border border-[#D6D4CC] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F] hover:bg-[#F8F7F2]">
            {isArchived ? <><RotateCcw className="h-4 w-4" /> Restore Project</> : <><Archive className="h-4 w-4" /> Archive Project</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <article className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-[#4B7270]" /><h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">Project Definition</h2></div>
            {project.description && <p className="mb-5 text-sm leading-relaxed text-[#6F6F6F]">{project.description}</p>}
            <p className={LABEL_CLASS}>Success Criteria</p>
            <ul className="mt-2 space-y-2">
              {project.successCriteria.map((criterion) => <li key={criterion} className="flex gap-3 rounded border border-[#EEEDE7] bg-[#FCFBF7] px-4 py-3 text-sm text-[#333333]"><span className="font-bold text-[#4B7270]">✓</span>{criterion}</li>)}
            </ul>
          </article>

          <article className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">Attempt 1 Context</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded border border-[#EEEDE7] bg-[#FCFBF7] p-4">
                <p className={`flex items-center gap-2 ${LABEL_CLASS}`}><Printer className="h-4 w-4" /> Printer</p>
                <p className="mt-2 font-semibold text-[#333333]">{attempt.printerContext.technology.replaceAll("_", " ")}</p>
                {(attempt.printerContext.manufacturer || attempt.printerContext.model) && <p className="mt-1 text-xs text-[#6F6F6F]">{[attempt.printerContext.manufacturer, attempt.printerContext.model].filter(Boolean).join(" · ")}</p>}
              </div>
              <div className="rounded border border-[#EEEDE7] bg-[#FCFBF7] p-4">
                <p className={`flex items-center gap-2 ${LABEL_CLASS}`}><Beaker className="h-4 w-4" /> Material</p>
                <p className="mt-2 font-semibold text-[#333333]">{attempt.materialContext.materialClass}</p>
                {(attempt.materialContext.manufacturer || attempt.materialContext.productOrResinName) && <p className="mt-1 text-xs text-[#6F6F6F]">{[attempt.materialContext.manufacturer, attempt.materialContext.productOrResinName].filter(Boolean).join(" · ")}</p>}
              </div>
            </div>

            {attempt.processContext.plannedAttemptDescription && <div className="mt-5"><p className={LABEL_CLASS}>Planned Attempt</p><p className="mt-2 text-sm leading-relaxed text-[#333333]">{attempt.processContext.plannedAttemptDescription}</p></div>}

            {attempt.processContext.knownConcerns.length > 0 && <div className="mt-5"><p className={LABEL_CLASS}>Known Concerns</p><div className="mt-2 flex flex-wrap gap-2">{attempt.processContext.knownConcerns.map((concern) => <span key={concern} className="rounded-full border border-[#E2E1DB] bg-[#F8F7F2] px-3 py-1.5 text-xs text-[#6F6F6F]">{concern}</span>)}</div></div>}

            {mode === "TECHNICAL" && (
              <div className="mt-6 border-t border-[#EEEDE7] pt-5">
                <p className={LABEL_CLASS}>Technical Context</p>
                <dl className="mt-3 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div><dt className={LABEL_CLASS}>Slicer</dt><dd className="mt-1 text-[#333333]">{attempt.processContext.slicerName || "Not recorded"}</dd></div>
                  <div><dt className={LABEL_CLASS}>Profile</dt><dd className="mt-1 text-[#333333]">{attempt.processContext.profileReference || "Not recorded"}</dd></div>
                  <div className="sm:col-span-2"><dt className={LABEL_CLASS}>Settings / Notes</dt><dd className="mt-1 whitespace-pre-wrap text-[#333333]">{attempt.processContext.settingsSnapshotOrNotes || "Not recorded"}</dd></div>
                </dl>
              </div>
            )}
          </article>
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm">
            <p className={LABEL_CLASS}>Record Summary</p>
            <dl className="mt-4 space-y-4 text-sm">
              <div><dt className={LABEL_CLASS}>Attempts</dt><dd className="mt-1 font-semibold text-[#333333]">{attempts.length}</dd></div>
              <div><dt className={LABEL_CLASS}>Created</dt><dd className="mt-1 text-[#333333]">{new Date(project.createdAt).toLocaleDateString()}</dd></div>
              <div><dt className={LABEL_CLASS}>Updated</dt><dd className="mt-1 text-[#333333]">{new Date(project.updatedAt).toLocaleDateString()}</dd></div>
              <div><dt className={LABEL_CLASS}>Presentation</dt><dd className="mt-1 text-[#333333]">{mode === "GUIDED" ? "Guided" : "Technical"}</dd></div>
            </dl>
          </div>

          <div className="rounded border border-[#DDE9E7] bg-[#F5FAF9] p-4 text-xs leading-relaxed text-[#4B7270]">
            <strong className="mb-1 block uppercase">Slice Three Boundary</strong>
            The existing Planner remains available, but its output is not yet attached to this saved attempt. Planning-record integration is reserved for Slice Four.
          </div>

          {attempt.sourceReferences.length > 0 && <div className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm"><p className={LABEL_CLASS}>Source References</p><ul className="mt-3 space-y-3">{attempt.sourceReferences.map((source) => <li key={source.sourceId} className="text-sm"><p className="font-semibold text-[#333333]">{source.title}</p>{source.url && <a href={source.url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-xs text-[#4B7270] underline">{source.url}</a>}</li>)}</ul></div>}
        </aside>
      </div>
    </section>
  );
}
