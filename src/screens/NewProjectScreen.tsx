import { ArrowLeft, ArrowRight, Check, Info, Plus, Save } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { PresentationMode } from "../app/presentationMode";
import { db } from "../data/db";
import type { PrinterContext } from "../domain/types";
import { createNewProject } from "../services/projectCreationService";

interface NewProjectScreenProps {
  mode: PresentationMode;
  onCancel: () => void;
  onCreated: (projectId: string, attemptId: string) => void;
}

type FormState = {
  title: string;
  purpose: string;
  description: string;
  successCriteria: string;
  tags: string;
  printerTechnology: PrinterContext["technology"];
  printerManufacturer: string;
  printerModel: string;
  materialClass: string;
  materialManufacturer: string;
  materialProductName: string;
  plannedAttemptDescription: string;
  knownConcerns: string;
  slicerName: string;
  profileReference: string;
  technicalNotes: string;
  sourceTitle: string;
  sourceUrl: string;
};

const INITIAL_FORM: FormState = {
  title: "",
  purpose: "",
  description: "",
  successCriteria: "",
  tags: "",
  printerTechnology: "FFF_FDM",
  printerManufacturer: "",
  printerModel: "",
  materialClass: "",
  materialManufacturer: "",
  materialProductName: "",
  plannedAttemptDescription: "",
  knownConcerns: "",
  slicerName: "",
  profileReference: "",
  technicalNotes: "",
  sourceTitle: "",
  sourceUrl: "",
};

function splitList(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const FIELD_CLASS =
  "mt-1.5 w-full rounded border border-[#D6D4CC] bg-[#FCFBF7] px-3 py-2.5 text-sm text-[#333333] outline-none transition placeholder:text-[#A8A8A2] focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]";

export function NewProjectScreen({ mode, onCancel, onCreated }: NewProjectScreenProps) {
  const [stage, setStage] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stageOneReady = useMemo(
    () => Boolean(form.title.trim() && form.purpose.trim() && splitList(form.successCriteria).length),
    [form.title, form.purpose, form.successCriteria],
  );
  const stageTwoReady = Boolean(form.materialClass.trim() && form.plannedAttemptDescription.trim());

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stageOneReady || !stageTwoReady) return;

    setIsSaving(true);
    setError(null);
    try {
      const { project, attempt } = await createNewProject(db, {
        title: form.title,
        purpose: form.purpose,
        description: form.description || undefined,
        successCriteria: splitList(form.successCriteria),
        tags: splitList(form.tags),
        printerTechnology: form.printerTechnology,
        printerManufacturer: form.printerManufacturer || undefined,
        printerModel: form.printerModel || undefined,
        materialClass: form.materialClass,
        materialManufacturer: form.materialManufacturer || undefined,
        materialProductName: form.materialProductName || undefined,
        plannedAttemptDescription: form.plannedAttemptDescription,
        knownConcerns: splitList(form.knownConcerns),
        slicerName: form.slicerName || undefined,
        profileReference: form.profileReference || undefined,
        technicalNotes: form.technicalNotes || undefined,
        sourceTitle: form.sourceTitle || undefined,
        sourceUrl: form.sourceUrl || undefined,
      });
      onCreated(project.projectId, attempt.attemptId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The print record could not be created.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-5 flex flex-col gap-4 rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4B7270]">New Print Record</p>
          <h1 className="mt-1 text-2xl font-light text-[#333333]">Create a project and Attempt 1</h1>
          <p className="mt-2 text-sm text-[#6F6F6F]">Both records will be validated and saved together in this browser.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 rounded border border-[#D6D4CC] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F] hover:bg-[#F8F7F2]"
        >
          <ArrowLeft className="h-4 w-4" /> Records
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-lg border border-[#E2E1DB] bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setStage(1)}
          className={`flex items-center gap-3 p-4 text-left transition ${stage === 1 ? "bg-[#4B7270] text-white" : "text-[#6F6F6F] hover:bg-[#F8F7F2]"}`}
        >
          <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${stage === 1 ? "bg-white text-[#4B7270]" : "bg-[#EDF3F2] text-[#4B7270]"}`}>1</span>
          <span>
            <span className="block text-[9px] font-bold uppercase tracking-widest">Stage One</span>
            <span className="text-sm font-semibold">Project Essentials</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => stageOneReady && setStage(2)}
          disabled={!stageOneReady}
          className={`flex items-center gap-3 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${stage === 2 ? "bg-[#4B7270] text-white" : "text-[#6F6F6F] hover:bg-[#F8F7F2]"}`}
        >
          <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${stage === 2 ? "bg-white text-[#4B7270]" : "bg-[#EDF3F2] text-[#4B7270]"}`}>2</span>
          <span>
            <span className="block text-[9px] font-bold uppercase tracking-widest">Stage Two</span>
            <span className="text-sm font-semibold">Attempt Context</span>
          </span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-7">
        {stage === 1 ? (
          <div className="space-y-5">
            <div className="border-b border-[#EEEDE7] pb-4">
              <h2 className="text-lg font-bold text-[#333333]">What are you trying to accomplish?</h2>
              <p className="mt-1 text-sm text-[#6F6F6F]">Define the durable project objective before documenting a specific print attempt.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">
                Project Name <span className="text-[#A55B47]">*</span>
                <input value={form.title} onChange={(event) => update("title", event.target.value)} className={FIELD_CLASS} placeholder="PETG cable clip" maxLength={160} />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">
                Print Purpose <span className="text-[#A55B47]">*</span>
                <input value={form.purpose} onChange={(event) => update("purpose", event.target.value)} className={FIELD_CLASS} placeholder="Create a repeatable functional part" />
              </label>
            </div>

            <label className="block text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">
              Description
              <textarea value={form.description} onChange={(event) => update("description", event.target.value)} className={`${FIELD_CLASS} min-h-24 resize-y`} placeholder="Optional context about the object, use environment, fit, or constraints." />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">
              Success Criteria <span className="text-[#A55B47]">*</span>
              <textarea value={form.successCriteria} onChange={(event) => update("successCriteria", event.target.value)} className={`${FIELD_CLASS} min-h-28 resize-y`} placeholder={"Enter one criterion per line\nClip fits the target cable\nPart survives normal handling"} />
              <span className="mt-1.5 block text-[10px] font-normal normal-case tracking-normal text-[#8A8A8A]">State what would make the project successful. Use one line per criterion.</span>
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">
              Tags
              <input value={form.tags} onChange={(event) => update("tags", event.target.value)} className={FIELD_CLASS} placeholder="PETG, functional, workshop" />
            </label>

            <div className="flex justify-end border-t border-[#EEEDE7] pt-5">
              <button
                type="button"
                onClick={() => setStage(2)}
                disabled={!stageOneReady}
                className="inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-[#3D5D5B] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue To Attempt Context <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="border-b border-[#EEEDE7] pb-4">
              <h2 className="text-lg font-bold text-[#333333]">Document Attempt 1</h2>
              <p className="mt-1 text-sm text-[#6F6F6F]">Capture enough context to return to this attempt later without rebuilding it from memory.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">
                Printer Technology <span className="text-[#A55B47]">*</span>
                <select value={form.printerTechnology} onChange={(event) => update("printerTechnology", event.target.value as PrinterContext["technology"])} className={FIELD_CLASS}>
                  <option value="FFF_FDM">FFF / FDM</option>
                  <option value="MSLA_LCD_RESIN">MSLA / LCD Resin</option>
                  <option value="SLA_RESIN">SLA Resin</option>
                  <option value="DLP_RESIN">DLP Resin</option>
                  <option value="OTHER">Other</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">
                Material Class <span className="text-[#A55B47]">*</span>
                <input value={form.materialClass} onChange={(event) => update("materialClass", event.target.value)} className={FIELD_CLASS} placeholder="PETG, PLA, ABS, Standard Resin" />
              </label>
            </div>

            <label className="block text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">
              Planned Attempt Description <span className="text-[#A55B47]">*</span>
              <textarea value={form.plannedAttemptDescription} onChange={(event) => update("plannedAttemptDescription", event.target.value)} className={`${FIELD_CLASS} min-h-24 resize-y`} placeholder="Describe what you intend to print and what this first attempt should establish." />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">
              Known Concerns
              <textarea value={form.knownConcerns} onChange={(event) => update("knownConcerns", event.target.value)} className={`${FIELD_CLASS} min-h-20 resize-y`} placeholder={"Enter one concern per line\nBed adhesion\nDimensional fit"} />
            </label>

            {mode === "GUIDED" && (
              <div className="rounded border border-[#DDE9E7] bg-[#F5FAF9] p-4 text-xs leading-relaxed text-[#4B7270]">
                <div className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span>Technical details are optional. Open the section below when you already know the printer, material, slicer, profile, or source information you want to retain.</span></div>
              </div>
            )}

            <details open={mode === "TECHNICAL"} className="rounded border border-[#E2E1DB] bg-[#FCFBF7] p-4">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-[#4B7270]">Optional Technical Context</summary>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">Printer Manufacturer<input value={form.printerManufacturer} onChange={(event) => update("printerManufacturer", event.target.value)} className={FIELD_CLASS} /></label>
                <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">Printer Model<input value={form.printerModel} onChange={(event) => update("printerModel", event.target.value)} className={FIELD_CLASS} /></label>
                <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">Material Manufacturer<input value={form.materialManufacturer} onChange={(event) => update("materialManufacturer", event.target.value)} className={FIELD_CLASS} /></label>
                <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">Material Product / Resin Name<input value={form.materialProductName} onChange={(event) => update("materialProductName", event.target.value)} className={FIELD_CLASS} /></label>
                <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">Slicer Name<input value={form.slicerName} onChange={(event) => update("slicerName", event.target.value)} className={FIELD_CLASS} /></label>
                <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">Profile Reference<input value={form.profileReference} onChange={(event) => update("profileReference", event.target.value)} className={FIELD_CLASS} /></label>
                <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F5F] md:col-span-2">Technical Notes<textarea value={form.technicalNotes} onChange={(event) => update("technicalNotes", event.target.value)} className={`${FIELD_CLASS} min-h-24 resize-y`} placeholder="Settings snapshot, file reference, environment, or preparation notes." /></label>
                <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">Source Title<input value={form.sourceTitle} onChange={(event) => update("sourceTitle", event.target.value)} className={FIELD_CLASS} placeholder="Manufacturer material guide" /></label>
                <label className="text-xs font-bold uppercase tracking-wider text-[#5F5F5F]">Source URL<input value={form.sourceUrl} onChange={(event) => update("sourceUrl", event.target.value)} className={FIELD_CLASS} placeholder="https://…" inputMode="url" /></label>
              </div>
            </details>

            {error && <div role="alert" className="rounded border border-[#C98C78] bg-[#FFF7F3] px-4 py-3 text-sm text-[#8A4C39]">{error}</div>}

            <div className="flex flex-col-reverse gap-3 border-t border-[#EEEDE7] pt-5 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStage(1)} className="inline-flex items-center justify-center gap-2 rounded border border-[#D6D4CC] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F] hover:bg-[#F8F7F2]"><ArrowLeft className="h-4 w-4" /> Project Essentials</button>
              <button type="submit" disabled={!stageTwoReady || isSaving} className="inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-[#3D5D5B] disabled:cursor-not-allowed disabled:opacity-40">
                {isSaving ? <><Save className="h-4 w-4 animate-pulse" /> Saving Record…</> : <><Check className="h-4 w-4" /> Create Project And Attempt 1</>}
              </button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}
