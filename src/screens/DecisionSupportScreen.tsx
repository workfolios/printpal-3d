import {
  AlertCircle,
  ArrowLeft,
  Check,
  CloudOff,
  FlaskConical,
  Loader2,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";
import type { PresentationMode } from "../app/presentationMode";
import type {
  Comparison,
  NextTestPlan,
  NextTestPlanContent,
} from "../domain/types";
import type { ComparisonInterpretationContent } from "../decisionSupport/contracts";
import {
  applyNextTestEdits,
  buildDeterministicComparisonPackage,
  createUserAuthoredNextTestPlan,
  loadDecisionSupportRecord,
  nextTestPlanFromEnvelope,
  requestComparisonInterpretation,
  requestNextTestPlan,
  saveEditedInterpretation,
  saveInterpretationToComparison,
  saveNextTestPlanForComparison,
  type NextTestApprovalStatus,
} from "../services/decisionSupportService";

interface DecisionSupportScreenProps {
  projectId: string;
  comparisonId: string;
  mode: PresentationMode;
  onBack: () => void;
  onOpenAttempt: (attemptId: string) => void;
}

const FIELD_CLASS =
  "mt-2 w-full rounded border border-[#D8D6CF] bg-white px-3 py-2.5 text-sm text-[#333333] outline-none transition focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]";
const LABEL_CLASS =
  "text-[9px] font-bold uppercase tracking-widest text-[#77756F]";

const ORIGIN_LABELS: Record<string, string> = {
  AI_ASSISTED: "AI-Assisted",
  RULES_BASED_FALLBACK: "Rules-Based Fallback",
  USER_AUTHORED: "User-Authored",
  AI_ASSISTED_USER_EDITED: "AI-Assisted · User Edited",
};

function listToText(values: string[]): string {
  return values.join("\n");
}

function textToList(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function interpretationFromComparison(
  comparison: Comparison,
): ComparisonInterpretationContent | null {
  if (!comparison.interpretationSummary) return null;
  return {
    interpretationSummary: comparison.interpretationSummary,
    modelInferences: comparison.modelInferences,
    alternateExplanations: comparison.alternateExplanations,
    interpretationUncertainties: comparison.interpretationUncertainties,
    interpretationSourceChecks: comparison.interpretationSourceChecks,
  };
}

function nextTestContent(plan: NextTestPlan): NextTestPlanContent {
  return {
    testQuestion: plan.testQuestion,
    primaryVariable: plan.primaryVariable,
    supportingVariable: plan.supportingVariable,
    constants: plan.constants,
    observationOrMeasurementPlan: plan.observationOrMeasurementPlan,
    sourceChecks: plan.sourceChecks,
    expectedLearning: plan.expectedLearning,
    uncertainty: plan.uncertainty,
  };
}

function OriginBadge({ origin }: { origin?: string }) {
  if (!origin) return null;
  return (
    <span className="rounded-full border border-[#C9DAD7] bg-[#F1F7F6] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">
      {ORIGIN_LABELS[origin] ?? origin.replaceAll("_", " ")}
    </span>
  );
}

export function DecisionSupportScreen({
  projectId,
  comparisonId,
  mode,
  onBack,
  onOpenAttempt,
}: DecisionSupportScreenProps) {
  const record = useLiveQuery(
    () => loadDecisionSupportRecord(comparisonId).catch(() => undefined),
    [comparisonId],
  );
  const [initializedKey, setInitializedKey] = useState<string>();
  const [interpretation, setInterpretation] =
    useState<ComparisonInterpretationContent | null>(null);
  const [interpretationUserEdits, setInterpretationUserEdits] = useState("");
  const [planDraft, setPlanDraft] = useState<NextTestPlan | null>(null);
  const [interpretationBusy, setInterpretationBusy] = useState(false);
  const [planBusy, setPlanBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!record || record.comparison.projectId !== projectId) return;
    const key = `${record.comparison.comparisonId}:${record.comparison.interpretedAt ?? "none"}:${record.nextTestPlan?.updatedAt ?? "none"}`;
    if (initializedKey === key) return;
    setInterpretation(interpretationFromComparison(record.comparison));
    setInterpretationUserEdits(record.comparison.userEdits ?? "");
    setPlanDraft(record.nextTestPlan ?? null);
    setInitializedKey(key);
  }, [record, projectId, initializedKey]);

  const facts = useMemo(
    () => (record ? buildDeterministicComparisonPackage(record.comparison) : undefined),
    [record],
  );

  if (record === undefined) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-lg border border-[#E2E1DB] bg-white text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
        Loading decision support…
      </div>
    );
  }

  if (!record || record.comparison.projectId !== projectId || !facts) {
    return (
      <div className="rounded-lg border border-[#E2E1DB] bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-[#333333]">Decision-support record not found</h1>
        <button type="button" onClick={onBack} className="mt-6 rounded bg-[#4B7270] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white">
          Return To Comparison
        </button>
      </div>
    );
  }

  const updateInterpretationList = (
    field: Exclude<keyof ComparisonInterpretationContent, "interpretationSummary">,
    value: string,
  ) => {
    if (!interpretation) return;
    setInterpretation({ ...interpretation, [field]: textToList(value) });
    setMessage(undefined);
  };

  const generateInterpretation = async () => {
    if (!record.isCurrent) return;
    setInterpretationBusy(true);
    setError(undefined);
    setMessage(undefined);
    try {
      const envelope = await requestComparisonInterpretation(facts);
      if (!envelope.data) throw new Error("No interpretation was returned.");
      const saved = await saveInterpretationToComparison(
        comparisonId,
        envelope.data,
        envelope,
      );
      setInterpretation(interpretationFromComparison(saved));
      setInterpretationUserEdits("");
      setMessage(
        envelope.warnings[0] ??
          `${ORIGIN_LABELS[envelope.origin]} interpretation saved locally.`,
      );
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "The interpretation could not be generated or saved.",
      );
    } finally {
      setInterpretationBusy(false);
    }
  };

  const saveInterpretation = async () => {
    if (!interpretation) return;
    setError(undefined);
    setMessage(undefined);
    try {
      const saved = await saveEditedInterpretation(
        comparisonId,
        interpretation,
        interpretationUserEdits,
      );
      setInterpretation(interpretationFromComparison(saved));
      setMessage("Interpretation edits saved locally.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "The interpretation edits could not be saved.",
      );
    }
  };

  const generateNextTest = async () => {
    if (!record.isCurrent) return;
    setPlanBusy(true);
    setError(undefined);
    setMessage(undefined);
    try {
      const envelope = await requestNextTestPlan(facts);
      const plan = nextTestPlanFromEnvelope(
        projectId,
        comparisonId,
        envelope,
        record.nextTestPlan,
      );
      const saved = await saveNextTestPlanForComparison(comparisonId, plan);
      setPlanDraft(saved);
      setMessage(
        envelope.warnings[0] ?? `${ORIGIN_LABELS[envelope.origin]} Next-Test Plan saved as a draft.`,
      );
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "The Next-Test Plan could not be generated or saved.",
      );
    } finally {
      setPlanBusy(false);
    }
  };

  const createUserPlan = async () => {
    setError(undefined);
    setMessage(undefined);
    try {
      const plan = createUserAuthoredNextTestPlan(
        projectId,
        comparisonId,
        facts,
        record.nextTestPlan,
      );
      const saved = await saveNextTestPlanForComparison(comparisonId, plan);
      setPlanDraft(saved);
      setMessage("User-authored Next-Test Plan saved as a draft.");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "The user-authored Next-Test Plan could not be saved.",
      );
    }
  };

  const updatePlan = <K extends keyof NextTestPlanContent>(
    field: K,
    value: NextTestPlanContent[K],
  ) => {
    if (!planDraft) return;
    setPlanDraft({ ...planDraft, [field]: value });
    setMessage(undefined);
  };

  const savePlan = async (approvalStatus: NextTestApprovalStatus) => {
    if (!planDraft) return;
    setError(undefined);
    setMessage(undefined);
    try {
      const saved = applyNextTestEdits(
        planDraft,
        nextTestContent(planDraft),
        approvalStatus,
        planDraft.userEdits,
      );
      const persisted = await saveNextTestPlanForComparison(comparisonId, saved);
      setPlanDraft(persisted);
      setMessage(
        approvalStatus === "ACCEPTED"
          ? "Next-Test Plan accepted and linked to the latest compared Attempt."
          : approvalStatus === "REJECTED"
            ? "Next-Test Plan rejected and retained as an auditable record."
            : "Next-Test Plan saved as a draft.",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "The Next-Test Plan could not be saved.",
      );
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
        <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">
          <ArrowLeft className="h-4 w-4" /> Return To Comparison
        </button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className={LABEL_CLASS}>Phase 3D Slice Seven</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#333333] md:text-3xl">Interpret & Plan The Next Test</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6F6F6F]">
              PrintPal adds bounded interpretation above the verified deterministic Comparison. These suggestions are not diagnoses or causal claims.
            </p>
          </div>
          <div className="flex flex-wrap gap-2"><OriginBadge origin={record.comparison.interpretationOrigin} />{record.nextTestPlan && <OriginBadge origin={record.nextTestPlan.origin} />}</div>
        </div>
      </header>

      <section className="flex items-start gap-3 rounded-lg inset-redacted p-4 text-[A36451] bg-[FCF1F0]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="text-sm font-semibold">Federated Facts Remain Separate</h2>
          <p className="mt-1 text-xs leading-relaxed">Deterministic constants, changes, Outcome differences, and missing information remain unedited. Interpretation and Next-Test Planning are labeled, editable, and user-controlled.</p>
        </div>
      </section>

      {!record.isCurrent && (
        <section className="flex items-start gap-3 rounded-lg inset redacted p-4 text-[A55B47] bg-[F9F0ED]">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h2 className="text-sm font-semibold">Refresh The Deterministic Comparison</h2>
            <p className="mt-1 text-xs leading-relaxed">A compared Attempt changed after this Comparison was created. Return to the Comparison and rebuild it before generating or saving interpretation or a next test.</p>
          </div>
        </section>
      )}

      {message && <div className="rounded border border-[#C9DAD7] bg-[#F1F7F6] p-4 text-sm text-[#4B7270]">{message}</div>}
      {error && <div className="rounded border border-[#D99989] bg-[#FFF1F0] p-4 text-sm text-[#A5RB4W]">{error}</div>}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className={LABEL_CLASS}>Bounded Reasoning</p>
              <h2 className="mt-1 text-xl font-semibold text-[#333333]">Comparison Interpretation</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#6F6F6F]">Use conditional language and keep alternate explanations visible.</p>
            </div>
            <button type="button" disabled={interpretationBusy || !record.isCurrent} onClick={generateInterpretation} className="inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-50">
              {interpretationBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {interpretation ? "Regenerate" : "Generate Interpretation"}
            </button>
          </div>

          {interpretation ? (
            <div className="mt-5 space-y-5">
              <label className={`block ${LABEL_CLASS}`}>Interpretation Summary<textarea value={interpretation.interpretationSummary} onChange={(event) => setInterpretation({ ...interpretation, interpretationSummary: event.target.value })} rows={4} className={FIELD_CLASS} /></label>
              <label className={`block ${LABEL_CLASS}`}>Conditional Inferences<textarea value={listToText(interpretation.modelInferences)} onChange={(event) => updateInterpretationList("modelInferences", event.target.value)} rows={5} className={FIELD_CLASS} /></label>
              <label className={`block ${LABEL_CLASS}`}>Alternate Explanations<textarea value={listToText(interpretation.alternateExplanations)} onChange={(event) => updateInterpretationList("alternateExplanations", event.target.value)} rows={5} className={FIELD_CLASS} /></label>
              <label className={`block ${LABEL_CLASS}`}>Interpretation Uncertainty<textarea value={listToText(interpretation.interpretationUncertainties)} onChange={(event) => updateInterpretationList("interpretationUncertainties", event.target.value)} rows={5} className={FIELD_CLASS} /></label>
              <label className={`block ${LABEL_CLASS}`}>Source Checks<textarea value={listToText(interpretation.interpretationSourceChecks)} onChange={(event) => updateInterpretationList("interpretationSourceChecks", event.target.value)} rows={4} className={FIELD_CLASS} /></label>
              <label className={`block ${LABEL_CLASS}`}>User Edit Note<textarea value={interpretationUserEdits} onChange={(event) => setInterpretationUserEdits(event.target.value)} rows={2} className={FIELD_CLASS} /></label>
              <button type="button" disabled={!record.isCurrent} onClick={saveInterpretation} className="inline-flex items-center gap-2 rounded border border-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] disabled:opacity-50"><Save className="h-4 w-4" /> Save Interpretation</button>
            </div>
          ) : (
            <div className="mt-5 rounded border border-dashed border-[#D8D6CF] bg-[#FCFBF7] p-5 text-sm text-[#6F6F6F]">Generate a bounded interpretation. If Gemini is unavailable, PrintPal creates and labels a rules-based interpretation so the workflow remains usable.</div>
          )}
        </section>

        <section className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className={LABEL_CLASS}>Controlled Experiment</p>
              <h2 className="mt-1 text-xl font-semibold text-[#333333]">Next-Test Plan</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#6F6F6F]">Default to one primary variable, explicit constants, and observable evidence.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={!record.isCurrent || planBusy} onClick={generateNextTest} className="inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-50">{planBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}{planDraft ? "Regenerate" : "Generate Plan"}</button>
              {!planDraft && <button type="button" disabled={!record.isCurrent} onClick={createUserPlan} className="rounded border border-[#4B7270] px-3 py-2.5 text-[9px] font-bold uppercase tracking-widest text-[#4B7270] disabled:opacity-50">Start Manually</button>}
            </div>
          </div>

          {planDraft ? (
            <div className="mt-5 space-y-5">
              <div className="flex flex-wrap items-center gap-2"><OriginBadge origin={planDraft.origin} /><span className="rounded-full border border-[#E2E1DB] bg-[#F8F7F2] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#6F6F6F]">{planDraft.approvalStatus}</span></div>
              <label className={`block ${LABEL_CLASS}`}>Test Question<textarea value={planDraft.testQuestion} onChange={(event) => updatePlan("testQuestion", event.target.value)} rows={3} className={FIELD_CLASS} /></label>
              <label className={`block ${LABEL_CLASS}`}>Primary Variable<input value={planDraft.primaryVariable} onChange={(event) => updatePlan("primaryVariable", event.target.value)} className={FIELD_CLASS} /></label>
              <label className={`block ${LABEL_CLASS}`}>Supporting Variable · Optional<input value={planDraft.supportingVariable ?? ""} onChange={(event) => updatePlan("supportingVariable", event.target.value || undefined)} className={FIELD_CLASS} /></label>
              <label className={`block ${LABEL_CLASS}`}>Constants<textarea value={listToText(planDraft.constants)} onChange={(event) => updatePlan( "constants", textToList(event.target.value))} rows={5} className={FIELD_CLASS} /></label>
              <label className={`block ${LABEL_CLASS}`}>Observation Or Measurement Plan<textarea value={listToText(planDraft.observationOrMeasurementPlan)} onChange={(event) => updatePlan("observationOrMeasurementPlan", textToList(event.target.value))} rows={5} className={FIELD_CLASS} /></label>
              <label className={`block ${LABEL_CLASS}`}>Source Checks<textarea value={listToText(planDraft.sourceChecks)} onChange={(event) => updatePlan("sourceChecks", textToList(event.target.value))} rows={4} className={FIELD_CLASS} /></label>
              <label className={`block ${LABEL_CLASS}`}>Expected Learning<textarea value={planDraft.expectedLearning} onChange={(event) => updatePlan("expectedLearning", event.target.value)} rows={3} className={FIELD_CLASS} /></label>
              <label className={`block ${LABEL_CLASS}`}>Uncertainty<textarea value={listToText(planDraft.uncertainty)} onChange={(event) => updatePlan("uncertainty", textToList(event.target.value))} rows={4} className={FIELD_CLASS} /></label>
              <label className={`block ${LABEL_CLASS}`}>User Edit Note<textarea value={planDraft.userEdits ?? ""} onChange={(event) => setPlanDraft({ ...planDraft, userEdits: event.target.value })} rows={2} className={FIELD_CLASS} /></label>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={!record.isCurrent} onClick={() => savePlan("DRAFT")} className="inline-flex items-center gap-2 rounded border border-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] disabled:opacity-50"><Save className="h-4 w-4" /> Save Draft</button>
                <button type="button" disabled={!record.isCurrent} onClick={() => savePlan("ACCEPTED")} className="inline-flex items-center gap-2 rounded bg-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-50"><Check className="h-4 w-4" /> Accept Plan</button>
                <button type="button" disabled={!record.isCurrent} onClick={() => savePlan("REJECTED")} className="inline-flex items-center gap-2 rounded border border-[#A55B47] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#A55B47] disabled:opacity-50"><CloudOff className="h-4 w-4" /> Reject Plan</button>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded border border-dashed border-[#D8D6CF] bg-[#FCFBF7] p-5 text-sm text-[#6F6F6F]">Generate a plan or start manually. AI or fallback content remains editable and is not executed by PrintPal.</div>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">Deterministic Evidence Reference</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <button type="button" onClick={() => onOpenAttempt(record.attemptA.attemptId)} className="rounded border border-[#EEEDE7] bg-[#FCFBF7] p-4 text-left"><p className={LABEL_CLASS}>Attempt A</p><p className="mt-2 text-sm font-semibold">Attempt {record.attemptA.attemptNumber}</p></button>
          <button type="button" onClick={() => onOpenAttempt(record.attemptB.attemptId)} className="rounded border border-[#EEEDE7] bg-[#FCFBF7] p-4 text-left"><p className={LABEL_CLASS}>Attempt B</p><p className="mt-2 text-sm font-semibold">Attempt {record.attemptB.attemptNumber}</p></button>
          <div className="rounded border border-[#EEEDE7] bg-[#FCFBF7] p-4"><p className={LABEL_CLASS}>Factual Package</p><p className="mt-2 text-sm">{facts.changes.length} changed fields · {facts.outcomeDifferences.length} Outcome differences · {facts.missingInformation.length} missing-information items</p></div>
        </div>
        {mode === "TECHNICAL" && (
          <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-[#EEEDE7] pt-4 text-xs sm:grid-cols-3">
            <div><dt className={LABEL_CLASS}>Interpretation Prompt</dt><dd className="mt-1 break-words">{record.comparison.interpretationPromptVersion ?? "Not generated"}</dd></div>
            <div><dt className={LABEL_CLASS}>Interpretation Rules</dt><dd className="mt-1 break-words">{record.comparison.interpretationRulesVersion ?? "Not generated"}</dd></div>
            <div><dt className={LABEL_CLASS}>Model</dt><dd className="mt-1 break-words">{record.comparison.interpretationModel ?? "No model recorded"}</dd></div>
          </dl>
        )}
      </section>
    </section>
  );
}
