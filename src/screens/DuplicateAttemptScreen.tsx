import {
  ArrowLeft,
  Beaker,
  Check,
  CopyPlus,
  GitBranch,
  Info,
  Printer,
  Save,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { PresentationMode } from "../app/presentationMode";
import type { Attempt, PrinterContext } from "../domain/types";
import { useProjectRecord } from "../hooks/useProjectRecord";
import {
  duplicateAttempt,
  isInheritedValue,
  type DuplicateAttemptInput,
} from "../services/attemptDuplicationService";

interface DuplicateAttemptScreenProps {
  projectId: string;
  sourceAttemptId: string;
  mode: PresentationMode;
  onCancel: () => void;
  onCreated: (projectId: string, attemptId: string) => void;
}

interface DuplicateFormState {
  printerTechnology: PrinterContext["technology"];
  printerAlias: string;
  printerManufacturer: string;
  printerModel: string;
  printerConfigurationNotes: string;
  materialClass: string;
  materialManufacturer: string;
  materialProductName: string;
  materialColor: string;
  materialConditionNotes: string;
  plannedAttemptDescription: string;
  knownConcerns: string;
  plannedVariables: string;
  slicerName: string;
  slicerVersion: string;
  profileReference: string;
  fileOrDesignReference: string;
  technicalNotes: string;
  environmentalObservations: string;
  postProcessingPlan: string;
  plannedChanges: string;
}

const FIELD_CLASS =
  "mt-1.5 w-full rounded border border-[#D6D4CC] bg-[#FCFBF7] px-3 py-2.5 text-sm text-[#333333] outline-none transition placeholder:text-[#A8A8A2] focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]";
const LABEL_CLASS = "text-xs font-bold uppercase tracking-wider text-[#5F5F5F]";

function splitList(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createFormState(attempt: Attempt): DuplicateFormState {
  return {
    printerTechnology: attempt.printerContext.technology,
    printerAlias: attempt.printerContext.alias ?? "",
    printerManufacturer: attempt.printerContext.manufacturer ?? "",
    printerModel: attempt.printerContext.model ?? "",
    printerConfigurationNotes: attempt.printerContext.configurationNotes ?? "",
    materialClass: attempt.materialContext.materialClass,
    materialManufacturer: attempt.materialContext.manufacturer ?? "",
    materialProductName: attempt.materialContext.productOrResinName ?? "",
    materialColor: attempt.materialContext.color ?? "",
    materialConditionNotes: attempt.materialContext.observedConditionNotes ?? "",
    plannedAttemptDescription: attempt.processContext.plannedAttemptDescription ?? "",
    knownConcerns: attempt.processContext.knownConcerns.join("\n"),
    plannedVariables: attempt.processContext.plannedVariables.join("\n"),
    slicerName: attempt.processContext.slicerName ?? "",
    slicerVersion: attempt.processContext.slicerVersion ?? "",
    profileReference: attempt.processContext.profileReference ?? "",
    fileOrDesignReference: attempt.processContext.fileOrDesignReference ?? "",
    technicalNotes: attempt.processContext.settingsSnapshotOrNotes ?? "",
    environmentalObservations: attempt.processContext.environmentalObservations ?? "",
    postProcessingPlan: attempt.processContext.postProcessingPlan ?? "",
    plannedChanges: "",
  };
}

function FieldStateBadge({ inherited }: { inherited: boolean }) {
  return (
    <span
      className={`ml-2 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest ${
        inherited
          ? "border border-[#D6D4CC] bg-white text-[#7A7974]"
          : "border border-[#D8B59F] bg-[#FFF7F0] text-[#9A5A3F]"
      }`}
    >
      {inherited ? "Inherited" : "Changed"}
    </span>
  );
}

export function DuplicateAttemptScreen({
  projectId,
  sourceAttemptId,
  mode,
  onCancel,
  onCreated,
}: DuplicateAttemptScreenProps) {
  const record = useProjectRecord(projectId, sourceAttemptId);
  const [initializedAttemptId, setInitializedAttemptId] = useState<string>();
  const [form, setForm] = useState<DuplicateFormState>();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  const project = record?.project;
  const sourceAttempt = record?.attempt;
  const attempts = record?.attempts ?? [];

  useEffect(() => {
    if (!sourceAttempt || initializedAttemptId === sourceAttempt.attemptId) return;
    setForm(createFormState(sourceAttempt));
    setInitializedAttemptId(sourceAttempt.attemptId);
  }, [initializedAttemptId, sourceAttempt]);

  const nextAttemptNumber = useMemo(
    () => attempts.reduce((maximum, attempt) => Math.max(maximum, attempt.attemptNumber), 0) + 1,
    [attempts],
  );

  if (!record || !form) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-lg border border-[#E2E1DB] bg-white text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
        Loading Attempt Duplication…
      </div>
    );
  }

  if (!project || !sourceAttempt) {
    return (
      <div className="rounded-lg border border-[#E2E1DB] bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-[#333333]">Record not found</h1>
        <p className="mt-2 text-sm text-[#6F6F6F]">
          The source Attempt is no longer available in this browser.
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

  const sourceForm = createFormState(sourceAttempt);
  const update = <K extends keyof DuplicateFormState>(key: K, value: DuplicateFormState[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };
  const inherited = <K extends keyof DuplicateFormState>(key: K) =>
    key === "plannedChanges" || isInheritedValue(sourceForm[key], form[key]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const plannedChanges = splitList(form.plannedChanges);
    if (!form.materialClass.trim() || !form.plannedAttemptDescription.trim() || plannedChanges.length === 0) {
      return;
    }

    setIsSaving(true);
    setError(undefined);
    try {
      const { changesFromParentAttempt: _discardedChanges, ...inheritedProcessContext } =
        sourceAttempt.processContext;
      const input: DuplicateAttemptInput = {
        printerContext: {
          ...sourceAttempt.printerContext,
          technology: form.printerTechnology,
          alias: form.printerAlias.trim() || undefined,
          manufacturer: form.printerManufacturer.trim() || undefined,
          model: form.printerModel.trim() || undefined,
          configurationNotes: form.printerConfigurationNotes.trim() || undefined,
        },
        materialContext: {
          ...sourceAttempt.materialContext,
          materialClass: form.materialClass.trim(),
          manufacturer: form.materialManufacturer.trim() || undefined,
          productOrResinName: form.materialProductName.trim() || undefined,
          color: form.materialColor.trim() || undefined,
          observedConditionNotes: form.materialConditionNotes.trim() || undefined,
        },
        processContext: {
          ...inheritedProcessContext,
          plannedAttemptDescription: form.plannedAttemptDescription.trim(),
          knownConcerns: splitList(form.knownConcerns),
          plannedVariables: splitList(form.plannedVariables),
          slicerName: form.slicerName.trim() || undefined,
          slicerVersion: form.slicerVersion.trim() || undefined,
          profileReference: form.profileReference.trim() || undefined,
          fileOrDesignReference: form.fileOrDesignReference.trim() || undefined,
          settingsSnapshotOrNotes: form.technicalNotes.trim() || undefined,
          environmentalObservations: form.environmentalObservations.trim() || undefined,
          postProcessingPlan: form.postProcessingPlan.trim() || undefined,
        },
        plannedChanges,
      };

      const result = await duplicateAttempt(project.projectId, sourceAttempt.attemptId, input);
      onCreated(project.projectId, result.attempt.attemptId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The next Attempt could not be created.");
    } finally {
      setIsSaving(false);
    }
  };

  const requiredReady = Boolean(
    form.materialClass.trim() &&
      form.plannedAttemptDescription.trim() &&
      splitList(form.plannedChanges).length,
  );

  return (
    <section className="mx-auto w-full max-w-6xl">
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
            Attempt Duplication
          </p>
          <h1 className="mt-1 text-2xl font-light text-[#333333]">
            Create Attempt {nextAttemptNumber} From Attempt {sourceAttempt.attemptNumber}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6F6F6F]">
            Applicable context is inherited and editable. The new Attempt receives a new identity and parent relationship; the prior Plan and Outcome are not copied.
          </p>
        </div>
        <div className="self-start rounded border border-[#DDE9E7] bg-[#F5FAF9] px-4 py-3 text-xs text-[#4B7270]">
          <div className="flex items-center gap-2 font-semibold"><GitBranch className="h-4 w-4" /> Parent: Attempt {sourceAttempt.attemptNumber}</div>
          <p className="mt-1">{sourceAttempt.sourceReferences.length} source reference(s) inherited</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <article className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-7">
          <div className="mb-5 border-b border-[#EEEDE7] pb-4">
            <div className="flex items-center gap-2">
              <CopyPlus className="h-5 w-5 text-[#4B7270]" />
              <h2 className="text-lg font-bold text-[#333333]">Inherited Attempt Context</h2>
            </div>
            <p className="mt-2 text-sm text-[#6F6F6F]">
              Fields remain marked Inherited until their value differs from Attempt {sourceAttempt.attemptNumber}.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className={LABEL_CLASS}>
              <span>Printer Technology<FieldStateBadge inherited={inherited("printerTechnology")} /></span>
              <select
                value={form.printerTechnology}
                onChange={(event) => update("printerTechnology", event.target.value as PrinterContext["technology"])}
                className={FIELD_CLASS}
              >
                <option value="FFF_FDM">FFF / FDM</option>
                <option value="MSLA_LCD_RESIN">MSLA / LCD Resin</option>
                <option value="SLA_RESIN">SLA Resin</option>
                <option value="DLP_RESIN">DLP Resin</option>
                <option value="OTHER">Other</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
            </label>
            <label className={LABEL_CLASS}>
              <span>Material Class <span className="text-[#A55B47]">*</span><FieldStateBadge inherited={inherited("materialClass")} /></span>
              <input
                value={form.materialClass}
                onChange={(event) => update("materialClass", event.target.value)}
                className={FIELD_CLASS}
              />
            </label>
          </div>

          <label className={`mt-5 block ${LABEL_CLASS}`}>
            <span>Planned Attempt Description <span className="text-[#A55B47]">*</span><FieldStateBadge inherited={inherited("plannedAttemptDescription")} /></span>
            <textarea
              value={form.plannedAttemptDescription}
              onChange={(event) => update("plannedAttemptDescription", event.target.value)}
              className={`${FIELD_CLASS} min-h-24 resize-y`}
            />
          </label>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className={LABEL_CLASS}>
              <span>Known Concerns<FieldStateBadge inherited={inherited("knownConcerns")} /></span>
              <textarea
                value={form.knownConcerns}
                onChange={(event) => update("knownConcerns", event.target.value)}
                className={`${FIELD_CLASS} min-h-24 resize-y`}
                placeholder="One concern per line"
              />
            </label>
            <label className={LABEL_CLASS}>
              <span>Planned Variables<FieldStateBadge inherited={inherited("plannedVariables")} /></span>
              <textarea
                value={form.plannedVariables}
                onChange={(event) => update("plannedVariables", event.target.value)}
                className={`${FIELD_CLASS} min-h-24 resize-y`}
                placeholder="One variable per line"
              />
            </label>
          </div>

          {mode === "GUIDED" && (
            <div className="mt-5 rounded border border-[#DDE9E7] bg-[#F5FAF9] p-4 text-xs leading-relaxed text-[#4B7270]">
              <div className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span>Technical values are inherited even when this section is closed. Open it only when a technical field should change for Attempt {nextAttemptNumber}.</span></div>
            </div>
          )}

          <details open={mode === "TECHNICAL"} className="mt-5 rounded border border-[#E2E1DB] bg-[#FCFBF7] p-4">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-[#4B7270]">Inherited Technical Context</summary>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className={LABEL_CLASS}><span>Printer Alias<FieldStateBadge inherited={inherited("printerAlias")} /></span><input value={form.printerAlias} onChange={(event) => update("printerAlias", event.target.value)} className={FIELD_CLASS} /></label>
              <label className={LABEL_CLASS}><span>Printer Manufacturer<FieldStateBadge inherited={inherited("printerManufacturer")} /></span><input value={form.printerManufacturer} onChange={(event) => update("printerManufacturer", event.target.value)} className={FIELD_CLASS} /></label>
              <label className={LABEL_CLASS}><span>Printer Model<FieldStateBadge inherited={inherited("printerModel")} /></span><input value={form.printerModel} onChange={(event) => update("printerModel", event.target.value)} className={FIELD_CLASS} /></label>
              <label className={LABEL_CLASS}><span>Printer Configuration Notes<FieldStateBadge inherited={inherited("printerConfigurationNotes")} /></span><input value={form.printerConfigurationNotes} onChange={(event) => update("printerConfigurationNotes", event.target.value)} className={FIELD_CLASS} /></label>
              <label className={LABEL_CLASS}><span>Material Manufacturer<FieldStateBadge inherited={inherited("materialManufacturer")} /></span><input value={form.materialManufacturer} onChange={(event) => update("materialManufacturer", event.target.value)} className={FIELD_CLASS} /></label>
              <label className={LABEL_CLASS}><span>Material Product / Resin<FieldStateBadge inherited={inherited("materialProductName")} /></span><input value={form.materialProductName} onChange={(event) => update("materialProductName", event.target.value)} className={FIELD_CLASS} /></label>
              <label className={LABEL_CLASS}><span>Material Color<FieldStateBadge inherited={inherited("materialColor")} /></span><input value={form.materialColor} onChange={(event) => update("materialColor", event.target.value)} className={FIELD_CLASS} /></label>
              <label className={LABEL_CLASS}><span>Observed Material Condition<FieldStateBadge inherited={inherited("materialConditionNotes")} /></span><input value={form.materialConditionNotes} onChange={(event) => update("materialConditionNotes", event.target.value)} className={FIELD_CLASS} /></label>
              <label className={LABEL_CLASS}><span>Slicer Name<FieldStateBadge inherited={inherited("slicerName")} /></span><input value={form.slicerName} onChange={(event) => update("slicerName", event.target.value)} className={FIELD_CLASS} /></label>
              <label className={LABEL_CLASS}><span>Slicer Version<FieldStateBadge inherited={inherited("slicerVersion")} /></span><input value={form.slicerVersion} onChange={(event) => update("slicerVersion", event.target.value)} className={FIELD_CLASS} /></label>
              <label className={LABEL_CLASS}><span>Profile Reference<FieldStateBadge inherited={inherited("profileReference")} /></span><input value={form.profileReference} onChange={(event) => update("profileReference", event.target.value)} className={FIELD_CLASS} /></label>
              <label className={LABEL_CLASS}><span>File Or Design Reference<FieldStateBadge inherited={inherited("fileOrDesignReference")} /></span><input value={form.fileOrDesignReference} onChange={(event) => update("fileOrDesignReference", event.target.value)} className={FIELD_CLASS} /></label>
              <label className={`${LABEL_CLASS} md:col-span-2`}><span>Settings Snapshot Or Notes<FieldStateBadge inherited={inherited("technicalNotes")} /></span><textarea value={form.technicalNotes} onChange={(event) => update("technicalNotes", event.target.value)} className={`${FIELD_CLASS} min-h-24 resize-y`} /></label>
              <label className={LABEL_CLASS}><span>Environmental Observations<FieldStateBadge inherited={inherited("environmentalObservations")} /></span><textarea value={form.environmentalObservations} onChange={(event) => update("environmentalObservations", event.target.value)} className={`${FIELD_CLASS} min-h-20 resize-y`} /></label>
              <label className={LABEL_CLASS}><span>Post-Processing Plan<FieldStateBadge inherited={inherited("postProcessingPlan")} /></span><textarea value={form.postProcessingPlan} onChange={(event) => update("postProcessingPlan", event.target.value)} className={`${FIELD_CLASS} min-h-20 resize-y`} /></label>
            </div>
          </details>
        </article>

        <article className="rounded-lg border border-[#D8B59F] bg-[#FFF9F4] p-5 shadow-sm md:p-7">
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#9A5A3F]" />
            <div className="w-full">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#7F4939]">Planned Changes <span className="text-[#A55B47]">*</span></h2>
              <p className="mt-2 text-xs leading-relaxed text-[#7A5B51]">Explicitly identify what should differ from Attempt {sourceAttempt.attemptNumber}. These entries become the child Attempt’s governed change record.</p>
              <textarea
                aria-label="Planned Changes"
                value={form.plannedChanges}
                onChange={(event) => update("plannedChanges", event.target.value)}
                className={`${FIELD_CLASS} mt-4 min-h-28 resize-y bg-white`}
                placeholder={"One planned change per line\nChange part orientation\nUse revised profile reference"}
              />
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm">
          <div className="grid gap-4 text-xs md:grid-cols-3">
            <div className="rounded border border-[#EEEDE7] bg-[#FCFBF7] p-4"><Printer className="mb-2 h-4 w-4 text-[#4B7270]" /><p className="font-bold uppercase tracking-widest text-[#8A8A8A]">New Identity</p><p className="mt-2 text-[#333333]">A new Attempt ID and timestamps will be generated.</p></div>
            <div className="rounded border border-[#EEEDE7] bg-[#FCFBF7] p-4"><Beaker className="mb-2 h-4 w-4 text-[#4B7270]" /><p className="font-bold uppercase tracking-widest text-[#8A8A8A]">Inherited Context</p><p className="mt-2 text-[#333333]">Printer, material, process, and source context will be copied.</p></div>
            <div className="rounded border border-[#EEEDE7] bg-[#FCFBF7] p-4"><GitBranch className="mb-2 h-4 w-4 text-[#4B7270]" /><p className="font-bold uppercase tracking-widest text-[#8A8A8A]">Clean Attempt</p><p className="mt-2 text-[#333333]">Plan, Outcome, comparison links, and completion date will not be copied.</p></div>
          </div>
        </article>

        {error && <div role="alert" className="rounded border border-[#C98C78] bg-[#FFF7F3] px-4 py-3 text-sm text-[#8A4C39]">{error}</div>}

        <div className="flex flex-col-reverse gap-3 rounded-lg border border-[#E2E1DB] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onCancel} className="inline-flex items-center justify-center gap-2 rounded border border-[#D6D4CC] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F] hover:bg-[#F8F7F2]"><ArrowLeft className="h-4 w-4" /> Cancel</button>
          <button type="submit" disabled={!requiredReady || isSaving} className="inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-[#3D5D5B] disabled:cursor-not-allowed disabled:opacity-40">
            {isSaving ? <><Save className="h-4 w-4 animate-pulse" /> Creating Attempt…</> : <><CopyPlus className="h-4 w-4" /> Create Attempt {nextAttemptNumber}</>}
          </button>
        </div>
      </form>
    </section>
  );
}
