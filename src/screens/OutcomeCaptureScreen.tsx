import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Info,
  Save,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { PresentationMode } from "../app/presentationMode";
import type { Outcome, SuccessCriterionResult } from "../domain/types";
import { useProjectRecord } from "../hooks/useProjectRecord";
import {
  saveOutcomeToAttempt,
  type OutcomeCaptureInput,
  type OutcomeStatus,
  type SuccessCriterionResultStatus,
} from "../services/outcomeService";

interface OutcomeCaptureScreenProps {
  projectId: string;
  attemptId: string;
  mode: PresentationMode;
  onCancel: () => void;
  onSaved: () => void;
}

interface OutcomeFormState {
  status: OutcomeStatus;
  observedResult: string;
  detailedObservations: string;
  deviationsOrDefects: string;
  unexpectedConditions: string;
  postProcessingPerformed: string;
  lessonsLearned: string;
  userNotes: string;
  successCriteriaResults: SuccessCriterionResult[];
}

const FIELD_CLASS =
  "mt-1.5 w-full rounded border border-[#D6D4CC] bg-[#FCFBF7] px-3 py-2.5 text-sm text-[#333333] outline-none transition placeholder:text-[#A8A8A2] focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]";
const LABEL_CLASS = "text-xs font-bold uppercase tracking-wider text-[#5F5F5F]";

const OUTCOME_STATUS_OPTIONS: Array<{ value: OutcomeStatus; label: string }> = [
  { value: "SUCCESSFUL", label: "Successful" },
  { value: "PARTIALLY_SUCCESSFUL", label: "Partially Successful" },
  { value: "FAILED", label: "Failed" },
  { value: "ABORTED", label: "Aborted" },
  { value: "NOT_YET_EVALUATED", label: "Not Yet Evaluated" },
];

const CRITERION_STATUS_OPTIONS: Array<{
  value: SuccessCriterionResultStatus;
  label: string;
}> = [
  { value: "MET", label: "Met" },
  { value: "PARTIALLY_MET", label: "Partially Met" },
  { value: "NOT_MET", label: "Not Met" },
  { value: "NOT_EVALUATED", label: "Not Evaluated" },
];

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(values: string[] | undefined): string {
  return values?.join("\n") ?? "";
}

function createFormState(
  successCriteria: string[],
  outcome?: Outcome,
): OutcomeFormState {
  const resultByCriterion = new Map(
    outcome?.successCriteriaResults.map((result) => [result.criterion, result]) ?? [],
  );

  return {
    status: outcome?.status ?? "NOT_YET_EVALUATED",
    observedResult: outcome?.summary ?? outcome?.observations[0] ?? "",
    detailedObservations: joinLines(
      outcome?.observations.filter((observation) => observation !== outcome.summary),
    ),
    deviationsOrDefects: joinLines(outcome?.deviationsOrDefects),
    unexpectedConditions: joinLines(outcome?.unexpectedConditions),
    postProcessingPerformed: joinLines(outcome?.postProcessingPerformed),
    lessonsLearned: joinLines(outcome?.lessonsLearned),
    userNotes: outcome?.userNotes ?? "",
    successCriteriaResults: successCriteria.map((criterion) =>
      resultByCriterion.get(criterion) ?? {
        criterion,
        status: "NOT_EVALUATED",
      },
    ),
  };
}

export function OutcomeCaptureScreen({
  projectId,
  attemptId,
  mode,
  onCancel,
  onSaved,
}: OutcomeCaptureScreenProps) {
  const record = useProjectRecord(projectId, attemptId);
  const [initializedAttemptId, setInitializedAttemptId] = useState<string>();
  const [form, setForm] = useState<OutcomeFormState>();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  const project = record?.project;
  const attempt = record?.attempt;

  useEffect(() => {
    if (!project || !attempt || initializedAttemptId === attempt.attemptId) return;
    setForm(createFormState(project.successCriteria, attempt.outcome));
    setInitializedAttemptId(attempt.attemptId);
  }, [attempt, initializedAttemptId, project]);

  const showFailurePrompts = useMemo(
    () =>
      form?.status === "FAILED" ||
      form?.status === "PARTIALLY_SUCCESSFUL" ||
      form?.status === "ABORTED",
    [form?.status],
  );

  if (!record || !form) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-lg border border-[#E2E1DB] bg-white text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
        Loading Outcome Capture…
      </div>
    );
  }

  if (!project || !attempt) {
    return (
      <div className="rounded-lg border border-[#E2E1DB] bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-[#333333]">Record not found</h1>
        <p className="mt-2 text-sm text-[#6F6F6F]">
          The selected Project or Attempt is no longer available in this browser.
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-6 rounded bg-[#4B7270] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white"
        >
          Return To Attempt
        </button>
      </div>
    );
  }

  const updateCriterion = (
    criterion: string,
    patch: Partial<SuccessCriterionResult>,
  ) => {
    setForm((current) =>
      current
        ? {
            ...current,
            successCriteriaResults: current.successCriteriaResults.map((result) =>
              result.criterion === criterion ? { ...result, ...patch } : result,
            ),
          }
        : current,
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.observedResult.trim()) return;

    setIsSaving(true);
    setError(undefined);
    try {
      const input: OutcomeCaptureInput = {
        status: form.status,
        successCriteriaResults: form.successCriteriaResults,
        observedResult: form.observedResult,
        detailedObservations: splitLines(form.detailedObservations),
        deviationsOrDefects: splitLines(form.deviationsOrDefects),
        unexpectedConditions: splitLines(form.unexpectedConditions),
        postProcessingPerformed: splitLines(form.postProcessingPerformed),
        lessonsLearned: splitLines(form.lessonsLearned),
        userNotes: form.userNotes || undefined,
      };
      await saveOutcomeToAttempt(project.projectId, attempt.attemptId, input);
      onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The Outcome could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl">
      <header className="mb-5 flex flex-col gap-4 rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between md:p-6">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] hover:text-[#3D5D5B]"
          >
            <ArrowLeft className="h-4 w-4" /> Attempt Detail
          </button>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4B7270]">
            Outcome Capture
          </p>
          <h1 className="mt-1 text-2xl font-light text-[#333333]">
            {project.title} · Attempt {attempt.attemptNumber}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6F6F6F]">
            Record the observed result, success-criteria status, deviations, and learning while the print is still fresh.
          </p>
        </div>
        <span className="self-start rounded-full border border-[#C9DAD7] bg-[#F1F7F6] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">
          Fully Usable Without AI
        </span>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <article className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-7">
          <div className="mb-5 flex items-center gap-2 border-b border-[#EEEDE7] pb-4">
            <ClipboardCheck className="h-5 w-5 text-[#4B7270]" />
            <div>
              <h2 className="text-lg font-bold text-[#333333]">Fast Outcome Record</h2>
              <p className="mt-1 text-sm text-[#6F6F6F]">
                Complete the required fields first. Additional detail remains optional.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className={LABEL_CLASS}>
              Outcome Status <span className="text-[#A55B47]">*</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? { ...current, status: event.target.value as OutcomeStatus }
                      : current,
                  )
                }
                className={FIELD_CLASS}
              >
                {OUTCOME_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded border border-[#DDE9E7] bg-[#F5FAF9] p-4 text-xs leading-relaxed text-[#4B7270]">
              <div className="flex gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  “Not Yet Evaluated” preserves a printed record without treating the result as final. Any other status completes the Outcome stage.
                </span>
              </div>
            </div>
          </div>

          <label className={`mt-5 block ${LABEL_CLASS}`}>
            Observed Result <span className="text-[#A55B47]">*</span>
            <textarea
              value={form.observedResult}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, observedResult: event.target.value } : current,
                )
              }
              className={`${FIELD_CLASS} min-h-28 resize-y`}
              placeholder="What happened? Describe the result without assigning unsupported cause."
            />
          </label>

          <div className="mt-6">
            <p className={LABEL_CLASS}>Success Criteria</p>
            <div className="mt-3 space-y-3">
              {form.successCriteriaResults.map((result) => (
                <div
                  key={result.criterion}
                  className="grid gap-3 rounded border border-[#EEEDE7] bg-[#FCFBF7] p-4 md:grid-cols-[minmax(0,1fr)_190px]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#333333]">{result.criterion}</p>
                    <label className="mt-3 block text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">
                      Criterion Note
                      <input
                        value={result.notes ?? ""}
                        onChange={(event) =>
                          updateCriterion(result.criterion, {
                            notes: event.target.value || undefined,
                          })
                        }
                        className={FIELD_CLASS}
                        placeholder="Optional evidence or observation"
                      />
                    </label>
                  </div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">
                    Criterion: {result.criterion}
                    <select
                      value={result.status}
                      onChange={(event) =>
                        updateCriterion(result.criterion, {
                          status: event.target.value as SuccessCriterionResultStatus,
                        })
                      }
                      className={FIELD_CLASS}
                    >
                      {CRITERION_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className={LABEL_CLASS}>
              Deviations Or Defects
              <textarea
                value={form.deviationsOrDefects}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? { ...current, deviationsOrDefects: event.target.value }
                      : current,
                  )
                }
                className={`${FIELD_CLASS} min-h-24 resize-y`}
                placeholder={"One item per line\nCorner lift\nUnexpected surface mark"}
              />
            </label>
            <label className={LABEL_CLASS}>
              Lessons Learned
              <textarea
                value={form.lessonsLearned}
                onChange={(event) =>
                  setForm((current) =>
                    current ? { ...current, lessonsLearned: event.target.value } : current,
                  )
                }
                className={`${FIELD_CLASS} min-h-24 resize-y`}
                placeholder="One lesson per line. Distinguish observation from hypothesis."
              />
            </label>
          </div>
        </article>

        {showFailurePrompts && (
          <article className="rounded-lg border border-[#E8CFC6] bg-[#FFF9F6] p-5 shadow-sm md:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#A55B47]" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#7F4939]">
                  Failure Review Prompts
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#7A5B51]">
                  Use these prompts to strengthen the record. They are documentation prompts, not a diagnosis.
                </p>
                <ul className="mt-4 grid gap-2 text-sm text-[#5F4B44] md:grid-cols-2">
                  <li className="rounded border border-[#EEDDD6] bg-white/70 px-3 py-2">When did the issue first become visible?</li>
                  <li className="rounded border border-[#EEDDD6] bg-white/70 px-3 py-2">What changed from the last known-good attempt?</li>
                  <li className="rounded border border-[#EEDDD6] bg-white/70 px-3 py-2">Which context or settings remain unknown?</li>
                  <li className="rounded border border-[#EEDDD6] bg-white/70 px-3 py-2">What photos, observations, or tests are available?</li>
                </ul>
                <p className="mt-3 text-[10px] leading-relaxed text-[#7A5B51]">
                  Verify corrective action against printer, slicer, material-manufacturer, TDS, and SDS guidance.
                </p>
              </div>
            </div>
          </article>
        )}

        <details
          open={mode === "TECHNICAL"}
          className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6"
        >
          <summary className="cursor-pointer text-sm font-bold uppercase tracking-widest text-[#4B7270]">
            Optional Outcome Detail
          </summary>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className={LABEL_CLASS}>
              Detailed Observations
              <textarea
                value={form.detailedObservations}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? { ...current, detailedObservations: event.target.value }
                      : current,
                  )
                }
                className={`${FIELD_CLASS} min-h-24 resize-y`}
                placeholder="One observation per line"
              />
            </label>
            <label className={LABEL_CLASS}>
              Unexpected Conditions
              <textarea
                value={form.unexpectedConditions}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? { ...current, unexpectedConditions: event.target.value }
                      : current,
                  )
                }
                className={`${FIELD_CLASS} min-h-24 resize-y`}
                placeholder="Environment, material condition, interruption, or other unexpected context"
              />
            </label>
            <label className={LABEL_CLASS}>
              Post-Processing Performed
              <textarea
                value={form.postProcessingPerformed}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? { ...current, postProcessingPerformed: event.target.value }
                      : current,
                  )
                }
                className={`${FIELD_CLASS} min-h-24 resize-y`}
                placeholder="Record what was actually performed. Do not use PrintPal as procedural safety authority."
              />
            </label>
            <label className={LABEL_CLASS}>
              Additional Notes
              <textarea
                value={form.userNotes}
                onChange={(event) =>
                  setForm((current) =>
                    current ? { ...current, userNotes: event.target.value } : current,
                  )
                }
                className={`${FIELD_CLASS} min-h-24 resize-y`}
              />
            </label>
          </div>
        </details>

        {error && (
          <div role="alert" className="rounded border border-[#C98C78] bg-[#FFF7F3] px-4 py-3 text-sm text-[#8A4C39]">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 rounded-lg border border-[#E2E1DB] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-2 rounded border border-[#D6D4CC] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F] hover:bg-[#F8F7F2]"
          >
            <ArrowLeft className="h-4 w-4" /> Cancel
          </button>
          <button
            type="submit"
            disabled={!form.observedResult.trim() || isSaving}
            className="inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-[#3D5D5B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? (
              <>
                <Save className="h-4 w-4 animate-pulse" /> Saving Outcome…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Save Outcome
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
