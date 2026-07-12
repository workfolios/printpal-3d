import {
  Archive,
  ArrowLeft,
  Beaker,
  BookOpen,
  ClipboardCheck,
  CopyPlus,
  GitBranch,
  Printer,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { PresentationMode } from "../app/presentationMode";
import { projectRepository } from "../data/repositories/instances";
import type { Outcome, Plan } from "../domain/types";
import { useProjectRecord } from "../hooks/useProjectRecord";

interface AttemptDetailScreenProps {
  projectId: string;
  attemptId: string;
  mode: PresentationMode;
  onBack: () => void;
  onOpenPlan: () => void;
  onOpenPlanner: () => void;
  onRecordOutcome: () => void;
  onDuplicateAttempt: () => void;
  onOpenAttempt: (attemptId: string) => void;
}

const LABEL_CLASS = "text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]";

const ORIGIN_LABELS: Record<Plan["origin"], string> = {
  AI_ASSISTED: "AI-Assisted",
  RULES_BASED_FALLBACK: "Rules-Based Fallback",
  USER_AUTHORED: "User-Authored",
  AI_ASSISTED_USER_EDITED: "AI-Assisted · User Edited",
};

const OUTCOME_STATUS_LABELS: Record<Outcome["status"], string> = {
  SUCCESSFUL: "Successful",
  PARTIALLY_SUCCESSFUL: "Partially Successful",
  FAILED: "Failed",
  ABORTED: "Aborted",
  NOT_YET_EVALUATED: "Not Yet Evaluated",
};

const CRITERION_STATUS_LABELS: Record<
  Outcome["successCriteriaResults"][number]["status"],
  string
> = {
  MET: "Met",
  PARTIALLY_MET: "Partially Met",
  NOT_MET: "Not Met",
  NOT_EVALUATED: "Not Evaluated",
};

function OutcomeList({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div>
      <p className={LABEL_CLASS}>{label}</p>
      <ul className="mt-2 space-y-2 text-sm text-[#333333]">
        {values.map((value) => (
          <li key={value} className="rounded border border-[#EEEDE7] bg-[#FCFBF7] px-3 py-2">
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AttemptDetailScreen({
  projectId,
  attemptId,
  mode,
  onBack,
  onOpenPlan,
  onOpenPlanner,
  onRecordOutcome,
  onDuplicateAttempt,
  onOpenAttempt,
}: AttemptDetailScreenProps) {
  const record = useProjectRecord(projectId, attemptId);

  if (!record) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-lg border border-[#E2E1DB] bg-white text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
        Loading record…
      </div>
    );
  }

  if (!record.project || !record.attempt) {
    return (
      <div className="rounded-lg border border-[#E2E1DB] bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-[#333333]">Record not found</h1>
        <p className="mt-2 text-sm text-[#6F6F6F]">
          The project or attempt is no longer available in this browser.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded bg-[#4B7270] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white"
        >
          Return To Records
        </button>
      </div>
    );
  }

  const { project, attempt, attempts } = record;
  const isArchived = project.status === "ARCHIVED";
  const plan = attempt.plan;
  const outcome = attempt.outcome;
  const parentAttempt = attempt.parentAttemptId
    ? attempts.find((candidate) => candidate.attemptId === attempt.parentAttemptId)
    : undefined;

  const changeProjectStatus = async () => {
    await projectRepository.transitionStatus(
      project.projectId,
      isArchived ? "ACTIVE" : "ARCHIVED",
    );
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <header className="flex flex-col gap-4 rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:flex-row md:items-start md:justify-between md:p-6">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] hover:text-[#3D5D5B]"
          >
            <ArrowLeft className="h-4 w-4" /> Record Library
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#EDF3F2] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">
              {project.status}
            </span>
            <span className="rounded-full border border-[#D6D4CC] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#6F6F6F]">
              Attempt {attempt.attemptNumber} · {attempt.status}
            </span>
            {plan && (
              <span className="rounded-full border border-[#C9DAD7] bg-[#F1F7F6] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">
                Plan Saved
              </span>
            )}
            {outcome && (
              <span className="rounded-full border border-[#D9C7A4] bg-[#FFF9ED] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#8A6A2E]">
                Outcome Saved
              </span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-light tracking-tight text-[#333333] md:text-3xl">
            {project.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6F6F6F]">
            {project.purpose}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap md:max-w-sm md:justify-end">
          <button
            type="button"
            onClick={onOpenPlan}
            className="inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#3D5D5B]"
          >
            <Sparkles className="h-4 w-4" /> {plan ? "Edit Saved Plan" : "Create Saved Plan"}
          </button>
          <button
            type="button"
            onClick={onRecordOutcome}
            className="inline-flex items-center justify-center gap-2 rounded border border-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] hover:bg-[#EDF3F2]"
          >
            <ClipboardCheck className="h-4 w-4" /> {outcome ? "Edit Outcome" : "Record Outcome"}
          </button>
          <button
            type="button"
            onClick={onDuplicateAttempt}
            className="inline-flex items-center justify-center gap-2 rounded border border-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] hover:bg-[#EDF3F2]"
          >
            <CopyPlus className="h-4 w-4" /> Duplicate Attempt
          </button>
          <button
            type="button"
            onClick={onOpenPlanner}
            className="inline-flex items-center justify-center gap-2 rounded border border-[#D6D4CC] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F] hover:bg-[#F8F7F2]"
          >
            <BookOpen className="h-4 w-4" /> Quick Planner
          </button>
          <button
            type="button"
            onClick={changeProjectStatus}
            className="inline-flex items-center justify-center gap-2 rounded border border-[#D6D4CC] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F] hover:bg-[#F8F7F2]"
          >
            {isArchived ? (
              <>
                <RotateCcw className="h-4 w-4" /> Restore Project
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" /> Archive Project
              </>
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <article className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#4B7270]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">
                Project Definition
              </h2>
            </div>
            {project.description && (
              <p className="mb-5 text-sm leading-relaxed text-[#6F6F6F]">{project.description}</p>
            )}
            <p className={LABEL_CLASS}>Success Criteria</p>
            <ul className="mt-2 space-y-2">
              {project.successCriteria.map((criterion) => (
                <li
                  key={criterion}
                  className="flex gap-3 rounded border border-[#EEEDE7] bg-[#FCFBF7] px-4 py-3 text-sm text-[#333333]"
                >
                  <span className="font-bold text-[#4B7270]">✓</span>
                  {criterion}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 border-b border-[#EEEDE7] pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">Saved Plan</h2>
                <p className="mt-1 text-xs leading-relaxed text-[#6F6F6F]">
                  The Plan is embedded in this Attempt and remains editable.
                </p>
              </div>
              {plan && (
                <span className="self-start rounded-full border border-[#C9DAD7] bg-[#F1F7F6] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">
                  {ORIGIN_LABELS[plan.origin]}
                </span>
              )}
            </div>

            {!plan ? (
              <div className="mt-5 rounded border border-dashed border-[#C9DAD7] bg-[#F7FBFA] p-6 text-center">
                <p className="text-sm font-semibold text-[#333333]">
                  No Plan is attached to Attempt {attempt.attemptNumber}.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#6F6F6F]">
                  Create a user-authored Plan or generate an AI-assisted or explicitly labeled rules-based draft.
                </p>
                <button
                  type="button"
                  onClick={onOpenPlan}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white"
                >
                  <Sparkles className="h-4 w-4" /> Create Saved Plan
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div>
                  <p className={LABEL_CLASS}>Objective Summary</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#333333]">
                    {plan.objectiveSummary}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <OutcomeList label="Readiness Considerations" values={plan.readinessConsiderations} />
                  <OutcomeList label="Missing Information" values={plan.missingInformation} />
                </div>
                <OutcomeList label="Source Checks" values={plan.sourceChecks} />
                <dl className="grid grid-cols-1 gap-4 border-t border-[#EEEDE7] pt-4 text-xs sm:grid-cols-3">
                  <div><dt className={LABEL_CLASS}>Origin</dt><dd className="mt-1 text-[#333333]">{ORIGIN_LABELS[plan.origin]}</dd></div>
                  <div><dt className={LABEL_CLASS}>Prompt Version</dt><dd className="mt-1 text-[#333333]">{plan.promptVersion || "Not applicable"}</dd></div>
                  <div><dt className={LABEL_CLASS}>Rules Version</dt><dd className="mt-1 text-[#333333]">{plan.rulesVersion || "Not applicable"}</dd></div>
                </dl>
                <button
                  type="button"
                  onClick={onOpenPlan}
                  className="inline-flex items-center justify-center gap-2 rounded border border-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] hover:bg-[#EDF3F2]"
                >
                  <Sparkles className="h-4 w-4" /> Edit Saved Plan
                </button>
              </div>
            )}
          </article>

          <article className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">
                Attempt {attempt.attemptNumber} Context
              </h2>
              {parentAttempt && (
                <span className="inline-flex items-center gap-2 self-start rounded-full border border-[#D6D4CC] bg-[#F8F7F2] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#6F6F6F]">
                  <GitBranch className="h-3.5 w-3.5" /> Inherited From Attempt {parentAttempt.attemptNumber}
                </span>
              )}
            </div>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded border border-[#EEEDE7] bg-[#FCFBF7] p-4">
                <p className={`flex items-center gap-2 ${LABEL_CLASS}`}><Printer className="h-4 w-4" /> Printer</p>
                <p className="mt-2 font-semibold text-[#333333]">{attempt.printerContext.technology.replaceAll("_", " ")}</p>
                {(attempt.printerContext.manufacturer || attempt.printerContext.model) && (
                  <p className="mt-1 text-xs text-[#6F6F6F]">{[attempt.printerContext.manufacturer, attempt.printerContext.model].filter(Boolean).join(" · ")}</p>
                )}
              </div>
              <div className="rounded border border-[#EEEDE7] bg-[#FCFBF7] p-4">
                <p className={`flex items-center gap-2 ${LABEL_CLASS}`}><Beaker className="h-4 w-4" /> Material</p>
                <p className="mt-2 font-semibold text-[#333333]">{attempt.materialContext.materialClass}</p>
                {(attempt.materialContext.manufacturer || attempt.materialContext.productOrResinName) && (
                  <p className="mt-1 text-xs text-[#6F6F6F]">{[attempt.materialContext.manufacturer, attempt.materialContext.productOrResinName].filter(Boolean).join(" · ")}</p>
                )}
              </div>
            </div>
            {attempt.processContext.plannedAttemptDescription && (
              <div className="mt-5"><p className={LABEL_CLASS}>Planned Attempt</p><p className="mt-2 text-sm leading-relaxed text-[#333333]">{attempt.processContext.plannedAttemptDescription}</p></div>
            )}
            {attempt.processContext.changesFromParentAttempt.length > 0 && (
              <div className="mt-5 rounded border border-[#D8B59F] bg-[#FFF9F4] p-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#9A5A3F]">Planned Changes From Parent</p>
                <ul className="mt-2 space-y-1 text-sm text-[#5F4B44]">
                  {attempt.processContext.changesFromParentAttempt.map((change) => <li key={change}>• {change}</li>)}
                </ul>
              </div>
            )}
            {attempt.processContext.knownConcerns.length > 0 && (
              <div className="mt-5"><p className={LABEL_CLASS}>Known Concerns</p><div className="mt-2 flex flex-wrap gap-2">{attempt.processContext.knownConcerns.map((concern) => <span key={concern} className="rounded-full border border-[#E2E1DB] bg-[#F8F7F2] px-3 py-1.5 text-xs text-[#6F6F6F]">{concern}</span>)}</div></div>
            )}
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

          <article className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 border-b border-[#EEEDE7] pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-[#4B7270]" /><h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">Outcome</h2></div>
                <p className="mt-1 text-xs leading-relaxed text-[#6F6F6F]">Post-print facts and lessons remain usable without AI assistance.</p>
              </div>
              {outcome && (
                <span className="self-start rounded-full border border-[#D9C7A4] bg-[#FFF9ED] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#8A6A2E]">
                  {OUTCOME_STATUS_LABELS[outcome.status]}
                </span>
              )}
            </div>

            {!outcome ? (
              <div className="mt-5 rounded border border-dashed border-[#D9C7A4] bg-[#FFFCF5] p-6 text-center">
                <p className="text-sm font-semibold text-[#333333]">No Outcome has been recorded for Attempt {attempt.attemptNumber}.</p>
                <p className="mt-2 text-xs leading-relaxed text-[#6F6F6F]">Capture the observed result, criteria status, defects, and lessons in several minutes.</p>
                <button type="button" onClick={onRecordOutcome} className="mt-4 inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white"><ClipboardCheck className="h-4 w-4" /> Record Outcome</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div><p className={LABEL_CLASS}>Observed Result</p><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#333333]">{outcome.summary || outcome.observations[0] || "No summary recorded."}</p></div>
                <div>
                  <p className={LABEL_CLASS}>Success Criteria Results</p>
                  <div className="mt-2 space-y-2">
                    {outcome.successCriteriaResults.map((result) => (
                      <div key={result.criterion} className="flex flex-col gap-2 rounded border border-[#EEEDE7] bg-[#FCFBF7] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-[#333333]">{result.criterion}</span>
                        <span className="rounded-full border border-[#D6D4CC] bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#6F6F6F]">{CRITERION_STATUS_LABELS[result.status]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <OutcomeList label="Deviations Or Defects" values={outcome.deviationsOrDefects} />
                  <OutcomeList label="Lessons Learned" values={outcome.lessonsLearned} />
                </div>
                <div className="flex flex-wrap items-center gap-3 border-t border-[#EEEDE7] pt-4">
                  <button type="button" onClick={onRecordOutcome} className="inline-flex items-center justify-center gap-2 rounded border border-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] hover:bg-[#EDF3F2]"><ClipboardCheck className="h-4 w-4" /> Edit Outcome</button>
                  {(outcome.status === "FAILED" || outcome.status === "PARTIALLY_SUCCESSFUL" || outcome.status === "ABORTED") && <span className="text-[10px] text-[#8A6A2E]">Failure Review prompts are available inside Outcome Capture.</span>}
                </div>
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

          <div className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-[#4B7270]" /><p className={LABEL_CLASS}>Attempt History</p></div>
            <div className="mt-3 space-y-2">
              {attempts.map((candidate) => (
                <button
                  key={candidate.attemptId}
                  type="button"
                  onClick={() => onOpenAttempt(candidate.attemptId)}
                  className={`flex w-full items-center justify-between rounded border px-3 py-2.5 text-left text-xs transition ${candidate.attemptId === attempt.attemptId ? "border-[#4B7270] bg-[#EDF3F2] text-[#333333]" : "border-[#EEEDE7] bg-[#FCFBF7] text-[#6F6F6F] hover:border-[#C9DAD7]"}`}
                  aria-label={`Open Attempt ${candidate.attemptNumber}`}
                >
                  <span className="font-semibold">Attempt {candidate.attemptNumber}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest">{candidate.status}</span>
                </button>
              ))}
            </div>
            {parentAttempt && <p className="mt-3 text-[10px] leading-relaxed text-[#7A7974]">Current parent relationship: Attempt {parentAttempt.attemptNumber}.</p>}
          </div>

          <div className="rounded border border-[#DDE9E7] bg-[#F5FAF9] p-4 text-xs leading-relaxed text-[#4B7270]">
            <strong className="mb-1 block uppercase">Slice Five Plan-To-Outcome Loop</strong>
            Outcome Capture and relationship-preserving Attempt duplication are now available. Deterministic comparison remains reserved for Slice Six.
          </div>

          {attempt.sourceReferences.length > 0 && (
            <div className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm">
              <p className={LABEL_CLASS}>Source References</p>
              <ul className="mt-3 space-y-3">
                {attempt.sourceReferences.map((source) => (
                  <li key={source.sourceId} className="text-sm">
                    <p className="font-semibold text-[#333333]">{source.title}</p>
                    {source.url && <a href={source.url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-xs text-[#4B7270] underline">{source.url}</a>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
