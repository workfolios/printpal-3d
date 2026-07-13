import { ArrowLeft, BrainCircuit, GitCompareArrows, ShieldCheck } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import type { PresentationMode } from "../app/presentationMode";
import {
  attemptRepository,
  comparisonRepository,
  projectRepository,
} from "../data/repositories/instances";
import type { FieldChange, FieldSnapshot } from "../domain/types";

interface ComparisonRecordScreenProps {
  projectId: string;
  comparisonId: string;
  mode: PresentationMode;
  onBack: () => void;
  onOpenAttempt: (attemptId: string) => void;
  onOpenDecisionSupport: () => void;
}

const LABEL_CLASS =
  "text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]";

function displayValue(value: unknown): string {
  if (value === undefined || value === null || value === "")
    return "Not recorded";
  if (Array.isArray(value))
    return value.length ? value.map(String).join("; ") : "None recorded";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function ListSection({
  title,
  values,
  emptyText,
}: {
  title: string;
  values: string[];
  emptyText: string;
}) {
  return (
    <section className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">
        {title}
      </h2>
      {values.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm text-[#333333]">
          {values.map((value) => (
            <li
              key={value}
              className="break-words rounded border border-[#EEEDE7] bg-[#FCFBF7] px-4 py-3"
            >
              {value}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-[#6F6F6F]">{emptyText}</p>
      )}
    </section>
  );
}

function Constants({ values }: { values: FieldSnapshot[] }) {
  return (
    <section className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">
        Recorded Constants
      </h2>
      <p className="mt-1 text-xs text-[#6F6F6F]">
        Fields with matching normalized values.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {values.map((field) => (
          <div
            key={field.fieldPath}
            className="rounded border border-[#EEEDE7] bg-[#FCFBF7] p-3"
          >
            <p className={LABEL_CLASS}>{field.label}</p>
            <p className="mt-1 break-words text-sm text-[#333333]">
              {displayValue(field.value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Changes({ values }: { values: FieldChange[] }) {
  return (
    <section className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">
        Changed Fields
      </h2>
      <p className="mt-1 text-xs text-[#6F6F6F]">
        Recorded differences only. These differences do not establish causation.
      </p>
      <div className="mt-4 space-y-3">
        {values.length > 0 ? (
          values.map((field) => (
            <div
              key={field.fieldPath}
              className="rounded border border-[#D8B59F] bg-[#FFF9F4] p-4"
            >
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#9A5A3F]">
                {field.label}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className={LABEL_CLASS}>Attempt A</p>
                  <p className="mt-1 break-words text-sm text-[#333333]">
                    {displayValue(field.attemptAValue)}
                  </p>
                </div>
                <div>
                  <p className={LABEL_CLASS}>Attempt B</p>
                  <p className="mt-1 break-words text-sm text-[#333333]">
                    {displayValue(field.attemptBValue)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#6F6F6F]">
            No governed field differences were identified.
          </p>
        )}
      </div>
    </section>
  );
}

export function ComparisonRecordScreen({
  projectId,
  comparisonId,
  mode,
  onBack,
  onOpenAttempt,
  onOpenDecisionSupport,
}: ComparisonRecordScreenProps) {
  const record = useLiveQuery(async () => {
    const comparison = await comparisonRepository.get(comparisonId);
    if (!comparison || comparison.projectId !== projectId)
      return {
        comparison: undefined,
        project: undefined,
        attemptA: undefined,
        attemptB: undefined,
      };
    const [project, attemptA, attemptB] = await Promise.all([
      projectRepository.get(projectId),
      attemptRepository.get(comparison.attemptAId),
      attemptRepository.get(comparison.attemptBId),
    ]);
    return { comparison, project, attemptA, attemptB };
  }, [projectId, comparisonId]);

  if (!record)
    return (
      <div className="grid min-h-[360px] place-items-center rounded-lg border border-[#E2E1DB] bg-white text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
        Loading Comparison…
      </div>
    );
  if (
    !record.comparison ||
    !record.project ||
    !record.attemptA ||
    !record.attemptB
  )
    return (
      <div className="rounded-lg border border-[#E2E1DB] bg-white p-8 text-center">
        <h1 className="text-xl font-bold">Comparison not found</h1>
        <button
          type="button"
          onClick={onBack}
          className="mt-5 rounded bg-[#4B7270] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white"
        >
          Return To Attempt
        </button>
      </div>
    );

  const { comparison, project, attemptA, attemptB } = record;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <header className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#4B7270]"
        >
          <ArrowLeft className="h-4 w-4" /> Attempt Detail
        </button>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <GitCompareArrows className="mt-1 h-6 w-6 text-[#4B7270]" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">
                Stored Comparison Record
              </p>
              <h1 className="mt-1 text-2xl font-light tracking-tight text-[#333333] md:text-3xl">
                Deterministic Comparison
              </h1>
              <p className="mt-2 text-sm text-[#6F6F6F]">
                {project.title} · Attempt {attemptA.attemptNumber} versus
                Attempt {attemptB.attemptNumber}
              </p>
            </div>
          </div>
          <span className="self-start rounded-full border border-[#C9DAD7] bg-[#F1F7F6] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">
            Deterministic Rules
          </span>
        </div>
      </header>

      <div className="rounded border border-[#C9DAD7] bg-[#F5FAF9] p-4 text-xs leading-relaxed text-[#4B7270]">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong className="uppercase">Factual Layer Only.</strong> Supported
            observations restate recorded data. Model inferences, causal
            diagnosis, and Next-Test recommendations are not generated in this
            slice.
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-[#B8CFCC] bg-[#F5FAF9] p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <BrainCircuit className="mt-0.5 h-5 w-5 shrink-0 text-[#4B7270]" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">Optional Interpretive Layer</p>
              <h2 className="mt-1 text-lg font-semibold text-[#333333]">AI Interpretation And Next-Test Planning</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6F6F6F]">Use the deterministic facts as the fixed evidence layer. AI or rules-based support can frame hypotheses, alternate explanations, uncertainty, and one controlled next test without changing the stored Attempt facts.</p>
              {comparison.interpretationOrigin && (
                <p className="mt-3 text-xs font-semibold text-[#4B7270]">Saved interpretation: {comparison.interpretationOrigin.replaceAll("_", " ")}{comparison.nextTestPlanId ? " · Next-Test Plan linked" : ""}</p>
              )}
            </div>
          </div>
          <button type="button" onClick={onOpenDecisionSupport} className="inline-flex shrink-0 items-center justify-center gap-2 rounded bg-[#4B7270] px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white">
            <BrainCircuit className="h-4 w-4" /> Interpret And Plan
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {[attemptA, attemptB].map((attempt, index) => (
          <button
            key={attempt.attemptId}
            type="button"
            onClick={() => onOpenAttempt(attempt.attemptId)}
            className="rounded-lg border border-[#E2E1DB] bg-white p-5 text-left shadow-sm transition hover:border-[#4B7270]"
          >
            <p className={LABEL_CLASS}>Attempt {index === 0 ? "A" : "B"}</p>
            <h2 className="mt-2 text-xl font-semibold text-[#333333]">
              Attempt {attempt.attemptNumber}
            </h2>
            <p className="mt-2 text-sm text-[#6F6F6F]">
              {attempt.printerContext.technology.replaceAll("_", " ")} ·{" "}
              {attempt.materialContext.materialClass}
            </p>
            <p className="mt-3 text-xs text-[#6F6F6F]">
              Outcome: {attempt.outcome?.status.replaceAll("_", " ")}
            </p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Constants values={comparison.constants} />
        <Changes values={comparison.changes} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ListSection
          title="Declared Planned Changes"
          values={comparison.intentionalChanges}
          emptyText="No declared planned-change text links these Attempts."
        />
        <ListSection
          title="Unexplained Recorded Changes"
          values={comparison.unknownChanges}
          emptyText="Every changed field matched recorded planned-change evidence."
        />
        <ListSection
          title="Missing Information"
          values={comparison.missingInformation}
          emptyText="No comparison-critical missing information was identified."
        />
        <ListSection
          title="Outcome Differences"
          values={comparison.outcomeDifferences}
          emptyText="No recorded Outcome differences were identified."
        />
      </div>

      <ListSection
        title="Supported Observations"
        values={comparison.supportedObservations}
        emptyText="No supported observations were generated."
      />
      <ListSection
        title="Uncertainties And Boundaries"
        values={comparison.uncertainties}
        emptyText="No uncertainty statements were recorded."
      />

      {mode === "TECHNICAL" && (
        <section className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">
            Comparison Metadata
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
            <div>
              <dt className={LABEL_CLASS}>Method</dt>
              <dd className="mt-1 text-[#333333]">
                {comparison.promptVersion}
              </dd>
            </div>
            <div>
              <dt className={LABEL_CLASS}>Created</dt>
              <dd className="mt-1 text-[#333333]">
                {new Date(comparison.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className={LABEL_CLASS}>Model Inferences</dt>
              <dd className="mt-1 text-[#333333]">
                {comparison.modelInferences.length} generated
              </dd>
            </div>
          </dl>
        </section>
      )}
    </section>
  );
}
