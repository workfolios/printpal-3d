import { ArrowLeft, GitCompareArrows, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PresentationMode } from "../app/presentationMode";
import type { Attempt } from "../domain/types";
import { useProjectRecord } from "../hooks/useProjectRecord";
import { createDeterministicComparison } from "../services/comparisonService";

interface ComparisonSetupScreenProps {
  projectId: string;
  baselineAttemptId: string;
  mode: PresentationMode;
  onCancel: () => void;
  onCreated: (comparisonId: string) => void;
}

function isEligible(attempt: Attempt): boolean {
  return Boolean(
    attempt.outcome &&
      attempt.outcome.status !== "NOT_YET_EVALUATED" &&
      (attempt.status === "OUTCOME_RECORDED" || attempt.status === "COMPARED"),
  );
}

export function ComparisonSetupScreen({
  projectId,
  baselineAttemptId,
  mode,
  onCancel,
  onCreated,
}: ComparisonSetupScreenProps) {
  const record = useProjectRecord(projectId, baselineAttemptId);
  const [comparisonAttemptId, setComparisonAttemptId] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const eligibleAttempts = useMemo(
    () => record?.attempts.filter((attempt) => attempt.attemptId !== baselineAttemptId && isEligible(attempt)) ?? [],
    [record?.attempts, baselineAttemptId],
  );

  useEffect(() => {
    if (!comparisonAttemptId && eligibleAttempts.length > 0) {
      const baseline = record?.attempt;
      const related = eligibleAttempts.find(
        (attempt) => attempt.parentAttemptId === baselineAttemptId || baseline?.parentAttemptId === attempt.attemptId,
      );
      setComparisonAttemptId((related ?? eligibleAttempts[0]).attemptId);
    }
  }, [comparisonAttemptId, eligibleAttempts, baselineAttemptId, record?.attempt]);

  if (!record) {
    return <div className="grid min-h-[360px] place-items-center rounded-lg border border-[#E2E1DB] bg-white text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">Loading comparison setup…</div>;
  }

  if (!record.project || !record.attempt) {
    return <div className="rounded-lg border border-[#E2E1DB] bg-white p-8 text-center"><h1 className="text-xl font-bold">Record not found</h1><button type="button" onClick={onCancel} className="mt-5 rounded bg-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white">Return To Attempt</button></div>;
  }

  const { project, attempt } = record;
  const selected = eligibleAttempts.find((candidate) => candidate.attemptId === comparisonAttemptId);
  const baselineEligible = isEligible(attempt);

  const createComparison = async () => {
    if (!selected) return;
    setSaving(true);
    setError(undefined);
    try {
      const result = await createDeterministicComparison(projectId, baselineAttemptId, selected.attemptId);
      onCreated(result.comparison.comparisonId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The Comparison could not be created.");
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
        <button type="button" onClick={onCancel} className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#4B7270]"><ArrowLeft className="h-4 w-4" /> Attempt Detail</button>
        <div className="flex items-start gap-3">
          <GitCompareArrows className="mt-1 h-6 w-6 text-[#4B7270]" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">Phase 3D Slice Six</p>
            <h1 className="mt-1 text-2xl font-light tracking-tight text-[#333333] md:text-3xl">Compare Attempt {attempt.attemptNumber}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6F6F6F]">Select another evaluated Attempt from {project.title}. PrintPal will compare recorded fields and Outcomes deterministically and store the factual record locally.</p>
          </div>
        </div>
      </header>

      <div className="rounded border border-[#C9DAD7] bg-[#F5FAF9] p-4 text-xs leading-relaxed text-[#4B7270]">
        <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /><p><strong className="uppercase">Interpretation Boundary.</strong> This workflow identifies recorded constants, changes, missing information, and Outcome differences. It does not determine which change caused an Outcome.</p></div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <article className="rounded-lg border border-[#4B7270] bg-white p-5 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">Attempt A · Baseline</p>
          <h2 className="mt-2 text-xl font-semibold text-[#333333]">Attempt {attempt.attemptNumber}</h2>
          <p className="mt-2 text-sm text-[#6F6F6F]">{attempt.printerContext.technology.replaceAll("_", " ")} · {attempt.materialContext.materialClass}</p>
          <p className="mt-3 text-xs text-[#6F6F6F]">Outcome: {attempt.outcome?.status.replaceAll("_", " ") ?? "Not recorded"}</p>
          {!baselineEligible && <p className="mt-4 rounded border border-[#E5C1B4] bg-[#FFF6F2] p-3 text-xs text-[#8A4F3D]">This Attempt needs an evaluated Outcome before it can be compared.</p>}
        </article>

        <article className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm">
          <label htmlFor="comparison-attempt" className="text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">Attempt B · Comparison</label>
          {eligibleAttempts.length > 0 ? (
            <>
              <select id="comparison-attempt" value={comparisonAttemptId} onChange={(event) => setComparisonAttemptId(event.target.value)} className="mt-3 w-full rounded border border-[#D6D4CC] bg-white px-3 py-3 text-sm text-[#333333]">
                {eligibleAttempts.map((candidate) => <option key={candidate.attemptId} value={candidate.attemptId}>Attempt {candidate.attemptNumber} · {candidate.outcome?.status.replaceAll("_", " ")}</option>)}
              </select>
              {selected && <div className="mt-4 rounded border border-[#EEEDE7] bg-[#FCFBF7] p-4"><p className="font-semibold text-[#333333]">Attempt {selected.attemptNumber}</p><p className="mt-1 text-sm text-[#6F6F6F]">{selected.printerContext.technology.replaceAll("_", " ")} · {selected.materialContext.materialClass}</p>{selected.processContext.changesFromParentAttempt.length > 0 && <ul className="mt-3 space-y-1 text-xs text-[#6F6F6F]">{selected.processContext.changesFromParentAttempt.map((change) => <li key={change}>• {change}</li>)}</ul>}</div>}
            </>
          ) : (
            <div className="mt-3 rounded border border-dashed border-[#D9C7A4] bg-[#FFFCF5] p-5 text-sm text-[#6F6F6F]">No other evaluated Attempt is available. Record an evaluated Outcome on another Attempt first.</div>
          )}
        </article>
      </div>

      {mode === "TECHNICAL" && <div className="rounded border border-[#E2E1DB] bg-white p-4 text-xs leading-relaxed text-[#6F6F6F]"><strong className="block text-[#333333]">Technical Scope</strong> The governed comparison set includes printer, material, process, source-reference, Outcome-status, success-criterion, defect, condition, post-processing, and lesson fields. List order is normalized before equality checks.</div>}

      {error && <div role="alert" className="rounded border border-[#E5C1B4] bg-[#FFF6F2] p-4 text-sm text-[#8A4F3D]">{error}</div>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded border border-[#D6D4CC] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F]">Cancel</button>
        <button type="button" disabled={!baselineEligible || !selected || saving} onClick={createComparison} className="inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-50"><GitCompareArrows className="h-4 w-4" /> {saving ? "Creating Comparison…" : "Create Deterministic Comparison"}</button>
      </div>
    </section>
  );
}
