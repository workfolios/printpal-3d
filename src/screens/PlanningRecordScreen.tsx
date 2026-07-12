import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Check,
  CloudOff,
  Edit3,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PresentationMode } from "../app/presentationMode";
import type { Plan, PlanContent } from "../domain/types";
import { useProjectRecord } from "../hooks/useProjectRecord";
import { LatestRevisionSaveQueue } from "../services/latestRevisionSaveQueue";
import {
  applyPlanEdits,
  buildPlanningRequestFromRecord,
  createUserAuthoredPlan,
  planFromEnvelope,
  requestPlanningEnvelope,
  savePlanToAttempt,
} from "../services/planningService";
import type { PrintPlanningEnvelope } from "../types";

interface PlanningRecordScreenProps {
  projectId: string;
  attemptId: string;
  mode: PresentationMode;
  onBack: () => void;
}

type SaveState = "IDLE" | "UNSAVED" | "SAVING" | "SAVED" | "ERROR";

const FIELD_CLASS =
  "mt-2 w-full rounded border border-[#D8D6CF] bg-white px-3 py-2.5 text-sm text-[#333333] outline-none transition focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]";
const LABEL_CLASS = "text-[9px] font-bold uppercase tracking-widest text-[#77756F]";

const ORIGIN_LABELS: Record<Plan["origin"], string> = {
  AI_ASSISTED: "AI-Assisted",
  RULES_BASED_FALLBACK: "Rules-Based Fallback",
  USER_AUTHORED: "User-Authored",
  AI_ASSISTED_USER_EDITED: "AI-Assisted · User Edited",
};

const PLAN_LIST_FIELDS: Array<{
  key: Exclude<keyof PlanContent, "objectiveSummary">;
  label: string;
  guidance: string;
}> = [
  {
    key: "readinessConsiderations",
    label: "Readiness Considerations",
    guidance: "Preparation checks and questions to resolve before printing.",
  },
  {
    key: "printerWatchOuts",
    label: "Printer Watch-Outs",
    guidance: "Printer-specific issues to verify against the manual and slicer documentation.",
  },
  {
    key: "materialWatchOuts",
    label: "Material Watch-Outs",
    guidance: "Material behavior or handling items to verify against manufacturer documentation, TDS, and SDS.",
  },
  {
    key: "assumptions",
    label: "Assumptions",
    guidance: "Statements currently used for planning but not independently verified by PrintPal.",
  },
  {
    key: "missingInformation",
    label: "Missing Information",
    guidance: "Context that remains unknown and may affect the usefulness of the Plan.",
  },
  {
    key: "sourceChecks",
    label: "Source Checks",
    guidance: "Authoritative documents or user-provided references to review.",
  },
  {
    key: "variablesToRecord",
    label: "Variables To Record",
    guidance: "Conditions, settings, or observations worth preserving for later comparison.",
  },
  {
    key: "expectedOutcomeCriteria",
    label: "Expected Outcome Criteria",
    guidance: "Observable conditions that define a useful result.",
  },
];

function extractPlanContent(plan: Plan): PlanContent {
  return {
    objectiveSummary: plan.objectiveSummary,
    readinessConsiderations: plan.readinessConsiderations,
    printerWatchOuts: plan.printerWatchOuts,
    materialWatchOuts: plan.materialWatchOuts,
    assumptions: plan.assumptions,
    missingInformation: plan.missingInformation,
    sourceChecks: plan.sourceChecks,
    variablesToRecord: plan.variablesToRecord,
    expectedOutcomeCriteria: plan.expectedOutcomeCriteria,
  };
}

export function PlanningRecordScreen({
  projectId,
  attemptId,
  mode,
  onBack,
}: PlanningRecordScreenProps) {
  const record = useProjectRecord(projectId, attemptId);
  const [initializedAttemptId, setInitializedAttemptId] = useState<string>();
  const [priority, setPriority] = useState("Meet the recorded project success criteria");
  const [freeformContext, setFreeformContext] = useState("");
  const [planDraft, setPlanDraft] = useState<Plan | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("IDLE");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationEnvelope, setGenerationEnvelope] = useState<PrintPlanningEnvelope | null>(null);
  const [error, setError] = useState<string>();
  const saveCoordinatorRef = useRef(new LatestRevisionSaveQueue());

  const project = record?.project;
  const attempt = record?.attempt;

  const queuePlanSave = useCallback(
    async (nextPlan: Plan, revision: number): Promise<boolean> => {
      setSaveState("SAVING");
      try {
        const savedCurrentRevision = await saveCoordinatorRef.current.enqueue(revision, () =>
          savePlanToAttempt(attemptId, nextPlan).then(() => undefined),
        );

        if (savedCurrentRevision) {
          setDirty(false);
          setSaveState("SAVED");
        }
        return savedCurrentRevision;
      } catch (saveError) {
        if (saveCoordinatorRef.current.isCurrent(revision)) {
          setDirty(true);
          setSaveState("ERROR");
        }
        throw saveError;
      }
    },
    [attemptId],
  );

  useEffect(() => {
    if (!attempt || initializedAttemptId === attempt.attemptId) return;
    saveCoordinatorRef.current.invalidate();
    setPlanDraft(attempt.plan ?? null);
    setInitializedAttemptId(attempt.attemptId);
    setDirty(false);
    setSaveState(attempt.plan ? "SAVED" : "IDLE");
  }, [attempt, initializedAttemptId]);

  useEffect(() => {
    if (!dirty || !planDraft || !planDraft.objectiveSummary.trim()) return;
    const revision = saveCoordinatorRef.current.currentRevision;
    const snapshot = planDraft;
    const timeout = window.setTimeout(() => {
      void queuePlanSave(snapshot, revision).catch(() => undefined);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [dirty, planDraft, queuePlanSave]);

  const sourceSummary = useMemo(
    () => attempt?.sourceReferences.map((source) => source.title).join(", ") || "No source references attached",
    [attempt],
  );

  if (!record) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-lg border border-[#E2E1DB] bg-white text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
        Loading planning record…
      </div>
    );
  }

  if (!project || !attempt) {
    return (
      <div className="rounded-lg border border-[#E2E1DB] bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-[#333333]">Record not found</h1>
        <p className="mt-2 text-sm text-[#6F6F6F]">
          The saved Project or Attempt is no longer available in this browser.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded bg-[#4B7270] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white"
        >
          Return To Attempt
        </button>
      </div>
    );
  }

  const persistPlan = async (nextPlan: Plan) => {
    const revision = saveCoordinatorRef.current.markChanged();
    setPlanDraft(nextPlan);
    setDirty(false);
    await queuePlanSave(nextPlan, revision);
  };

  const markDraftChanged = (nextPlan: Plan) => {
    saveCoordinatorRef.current.markChanged();
    setPlanDraft(nextPlan);
    setDirty(true);
    setSaveState("UNSAVED");
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(undefined);
    try {
      const request = buildPlanningRequestFromRecord(project, attempt, { priority, freeformContext });
      const envelope = await requestPlanningEnvelope(request);
      setGenerationEnvelope(envelope);
      await persistPlan(planFromEnvelope(envelope));
    } catch {
      setError("The planning draft could not be created. You can still start and save a user-authored Plan.");
      setSaveState("ERROR");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUserAuthored = async () => {
    setError(undefined);
    try {
      await persistPlan(createUserAuthoredPlan(project, attempt));
      setGenerationEnvelope(null);
    } catch {
      setError("The user-authored Plan could not be saved locally.");
      setSaveState("ERROR");
    }
  };

  const updateObjective = (value: string) => {
    if (!planDraft) return;
    markDraftChanged(
      applyPlanEdits(
        planDraft,
        { ...extractPlanContent(planDraft), objectiveSummary: value },
        planDraft.userEdits,
      ),
    );
  };

  const updateListField = (
    field: Exclude<keyof PlanContent, "objectiveSummary">,
    value: string,
  ) => {
    if (!planDraft) return;
    const items = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    markDraftChanged(
      applyPlanEdits(
        planDraft,
        { ...extractPlanContent(planDraft), [field]: items },
        planDraft.userEdits,
      ),
    );
  };

  const updateUserEdits = (value: string) => {
    if (!planDraft) return;
    markDraftChanged(applyPlanEdits(planDraft, extractPlanContent(planDraft), value));
  };

  const handleExplicitSave = async () => {
    if (!planDraft) return;
    setError(undefined);
    try {
      await queuePlanSave(planDraft, saveCoordinatorRef.current.currentRevision);
    } catch {
      setError("The Plan could not be saved. Your current draft remains visible in this screen.");
    }
  };

  const handleBack = async () => {
    if (dirty && planDraft?.objectiveSummary.trim()) {
      try {
        const savedCurrentRevision = await queuePlanSave(
          planDraft,
          saveCoordinatorRef.current.currentRevision,
        );
        if (!savedCurrentRevision) return;
      } catch {
        setError("The latest Plan changes could not be saved. Resolve the save error before leaving this screen.");
        return;
      }
    }
    onBack();
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] hover:text-[#3D5D5B]"
        >
          <ArrowLeft className="h-4 w-4" /> Attempt Detail
        </button>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4B7270]">
              Saved Planning Record
            </p>
            <h1 className="mt-1 text-2xl font-light tracking-tight text-[#333333] md:text-3xl">
              {project.title} · Attempt {attempt.attemptNumber}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6F6F6F]">
              Generate a bounded planning draft or create the Plan manually. Every saved field remains editable and attached to this Attempt.
            </p>
          </div>
          <div
            className="flex items-center gap-2 rounded border border-[#D6D4CC] bg-[#F8F7F2] px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-[#6F6F6F]"
            aria-live="polite"
          >
            {saveState === "UNSAVED" && <><Edit3 className="h-4 w-4" /> Unsaved Changes</>}
            {saveState === "SAVING" && <><Loader2 className="h-4 w-4 animate-spin" /> Saving</>}
            {saveState === "SAVED" && <><Check className="h-4 w-4 text-[#4B7270]" /> Saved Locally</>}
            {saveState === "ERROR" && <><AlertCircle className="h-4 w-4 text-[#A55B47]" /> Save Failed</>}
            {saveState === "IDLE" && <><BookOpen className="h-4 w-4" /> No Plan Yet</>}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <div className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#333333]">Saved Attempt Context</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div><dt className={LABEL_CLASS}>Purpose</dt><dd className="mt-1">{project.purpose}</dd></div>
              <div><dt className={LABEL_CLASS}>Printer</dt><dd className="mt-1">{attempt.printerContext.technology.replaceAll("_", " ")}</dd></div>
              <div><dt className={LABEL_CLASS}>Material</dt><dd className="mt-1">{attempt.materialContext.materialClass}</dd></div>
              <div><dt className={LABEL_CLASS}>Known Concerns</dt><dd className="mt-1">{attempt.processContext.knownConcerns.join(", ") || "None recorded"}</dd></div>
              <div><dt className={LABEL_CLASS}>Attached Sources</dt><dd className="mt-1">{sourceSummary}</dd></div>
            </dl>
          </div>

          <div className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#333333]">Planning Inputs</h2>
            <label className={`mt-4 block ${LABEL_CLASS}`}>
              Planning Emphasis
              <input value={priority} onChange={(event) => setPriority(event.target.value)} className={FIELD_CLASS} />
            </label>
            <details open={mode === "TECHNICAL"} className="mt-4 rounded border border-[#E2E1DB] bg-[#FCFBF7] p-3">
              <summary className="cursor-pointer text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">
                Additional Planning Context
              </summary>
              <label className={`mt-3 block ${LABEL_CLASS}`}>
                User-Entered Context
                <textarea
                  value={freeformContext}
                  onChange={(event) => setFreeformContext(event.target.value)}
                  className={`${FIELD_CLASS} min-h-28 resize-y`}
                  placeholder="Optional process, environment, settings, or end-use context. Exact values remain user-entered context, not PrintPal recommendations."
                />
              </label>
            </details>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#3D5D5B] disabled:opacity-60"
              >
                {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating</> : <><Sparkles className="h-4 w-4" /> {planDraft ? "Regenerate Planning View" : "Generate Planning View"}</>}
              </button>
              {!planDraft && (
                <button
                  type="button"
                  onClick={handleUserAuthored}
                  className="inline-flex items-center justify-center gap-2 rounded border border-[#4B7270] px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] hover:bg-[#EDF3F2]"
                >
                  <Edit3 className="h-4 w-4" /> Start User-Authored Plan
                </button>
              )}
            </div>
          </div>

          <div className="rounded border border-[#F5EAD2] bg-[#FFFCF0] p-4 text-[10px] leading-relaxed text-[#7D6B45]">
            <strong className="mb-1 block uppercase tracking-wider">Advisory Boundary</strong>
            Verify printer settings, material handling, post-processing, ventilation, and safety practices against the applicable manual, slicer documentation, manufacturer guidance, TDS, and SDS.
          </div>
        </aside>

        <main className="min-w-0 rounded-lg border border-[#E2E1DB] bg-white shadow-sm">
          {!planDraft ? (
            <div className="grid min-h-[520px] place-items-center p-8 text-center">
              <div className="max-w-lg">
                <CloudOff className="mx-auto h-10 w-10 text-[#4B7270]" />
                <h2 className="mt-4 text-xl font-bold text-[#333333]">Create the saved Plan</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#6F6F6F]">
                  Generate an AI-assisted or labeled rules-based draft, or begin with a fully user-authored Plan. AI availability never controls whether the record can be saved.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 md:p-6">
              <div className="flex flex-col gap-3 border-b border-[#EEEDE7] pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">Editable Plan</h2>
                  <span className="rounded-full border border-[#C9DAD7] bg-[#F1F7F6] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">
                    {ORIGIN_LABELS[planDraft.origin]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleExplicitSave}
                  disabled={!planDraft.objectiveSummary.trim() || saveState === "SAVING"}
                  className="inline-flex items-center justify-center gap-2 rounded border border-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] hover:bg-[#EDF3F2] disabled:opacity-40"
                >
                  <Save className="h-4 w-4" /> Save Plan
                </button>
              </div>

              {generationEnvelope && generationEnvelope.warnings.length > 0 && (
                <div className="mt-5 rounded border border-[#E9D9B7] bg-[#FFFCF0] p-4 text-xs leading-relaxed text-[#7D6B45]" role="status">
                  <strong className="mb-1 block uppercase tracking-wider">Generation Notice</strong>
                  {generationEnvelope.warnings.map((warning) => <p key={warning}>{warning}</p>)}
                </div>
              )}
              {error && <div role="alert" className="mt-5 rounded border border-[#C98C78] bg-[#FFF7F3] px-4 py-3 text-sm text-[#8A4C39]">{error}</div>}

              <div className="mt-6 space-y-6">
                <label className={`block ${LABEL_CLASS}`}>
                  Objective Summary <span className="text-[#A55B47]">*</span>
                  <textarea
                    value={planDraft.objectiveSummary}
                    onChange={(event) => updateObjective(event.target.value)}
                    className={`${FIELD_CLASS} min-h-28 resize-y`}
                  />
                </label>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {PLAN_LIST_FIELDS.map((field) => (
                    <label key={field.key} className={`block ${LABEL_CLASS}`}>
                      {field.label}
                      <span className="mt-1 block text-[10px] font-normal normal-case leading-relaxed tracking-normal text-[#8A8A8A]">
                        {field.guidance}
                      </span>
                      <textarea
                        value={planDraft[field.key].join("\n")}
                        onChange={(event) => updateListField(field.key, event.target.value)}
                        className={`${FIELD_CLASS} min-h-32 resize-y`}
                        placeholder="Enter one item per line"
                      />
                    </label>
                  ))}
                </div>

                <label className={`block ${LABEL_CLASS}`}>
                  User Edit Note
                  <textarea
                    value={planDraft.userEdits ?? ""}
                    onChange={(event) => updateUserEdits(event.target.value)}
                    className={`${FIELD_CLASS} min-h-20 resize-y`}
                    placeholder="Optional note explaining substantive edits, decisions, or user-added context."
                  />
                </label>

                <dl className="grid grid-cols-1 gap-4 border-t border-[#EEEDE7] pt-5 text-[10px] text-[#77756F] sm:grid-cols-2">
                  <div><dt className={LABEL_CLASS}>Prompt Version</dt><dd className="mt-1">{planDraft.promptVersion || "Not applicable"}</dd></div>
                  <div><dt className={LABEL_CLASS}>Rules Version</dt><dd className="mt-1">{planDraft.rulesVersion || "Not applicable"}</dd></div>
                </dl>
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
