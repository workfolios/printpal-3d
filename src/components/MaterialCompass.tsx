import { useState, type ChangeEvent, type FormEvent } from "react";
import type { MaterialCompassCard, MaterialCompassFormData } from "../types";

interface Props {
  onBack: () => void;
}

const FIELD_CLASS = "mt-1.5 w-full rounded border border-[#D6D4CC] bg-white px-3 py-2.5 text-sm text-[#333333] outline-none transition focus:border-[#4B7270] focus:ring-2 focus:ring-[#4B7270]/30";
const LABEL_CLASS = "block text-[10px] font-bold uppercase tracking-wider text-[#5F5F5F]";

export function MaterialCompass({ onBack }: Props) {
  const [formData, setFormData] = useState<MaterialCompassFormData>({
    material: "",
    purpose: "",
    property: "",
    concerns: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MaterialCompassCard | null>(null);
  const [notice, setNotice] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);
    setNotice("");

    try {
      const response = await fetch("/api/generate-material-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Material context service unavailable");
      setResult(await response.json());
    } catch {
      setNotice("The AI service was unavailable. PrintPal created a labeled rules-based reference frame instead.");
      setResult({
        questionsToVerify: [
          "Is the exact material or resin product known?",
          "Are storage, drying, age, batch, or environmental conditions relevant?",
        ],
        sourceDocsToCheck: [
          "Manufacturer material guide and verified profile",
          "Technical Data Sheet and Safety Data Sheet",
        ],
        materialBehavior: [
          "Review manufacturer guidance for dimensional behavior, adhesion, moisture sensitivity, and post-processing.",
        ],
        documentationPrompts: [
          "Record the exact material product and condition.",
          "Record the printer, slicer profile reference, and observed environment.",
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <section className="mx-auto w-full max-w-7xl overflow-hidden rounded-lg border border-[#E2E1DB] bg-white shadow-sm" aria-busy={isLoading}>
      <header className="flex flex-col gap-3 bg-[#4B7270] p-4 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/75">Standalone Reference Tool</p>
          <h1 className="mt-1 text-lg font-semibold">Materials Compass</h1>
        </div>
        <button type="button" onClick={onBack} className="rounded border border-white/40 px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition hover:bg-white/10">
          Back To Reference Tools
        </button>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="border-b border-[#E2E1DB] p-5 lg:border-b-0 lg:border-r md:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <label htmlFor="material-compass-material" className={LABEL_CLASS}>
              Material Or Resin
              <input id="material-compass-material" required name="material" value={formData.material} onChange={handleChange} placeholder="ABS, PETG, Tough Resin" className={FIELD_CLASS} />
            </label>
            <label htmlFor="material-compass-purpose" className={LABEL_CLASS}>
              Print Purpose
              <input id="material-compass-purpose" required name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Outdoor mounting bracket" className={FIELD_CLASS} />
            </label>
            <label htmlFor="material-compass-property" className={LABEL_CLASS}>
              Priority Property
              <input id="material-compass-property" required name="property" value={formData.property} onChange={handleChange} placeholder="UV resistance or impact strength" className={FIELD_CLASS} />
            </label>
            <label htmlFor="material-compass-concerns" className={LABEL_CLASS}>
              Environmental Or Safety Context
              <textarea id="material-compass-concerns" name="concerns" value={formData.concerns} onChange={handleChange} rows={4} placeholder="Sunlight exposure, indoor location, unknown ventilation, or end-use constraints" className={`${FIELD_CLASS} resize-y`} />
            </label>
            <button disabled={isLoading} type="submit" className="w-full rounded bg-[#4B7270] py-3 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-[#3D5D5B] disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? "Creating Context…" : "Create Material Context"}
            </button>
          </form>
        </div>

        <div className="min-h-[420px] bg-[#F8F7F2] p-5 md:p-6" aria-live="polite">
          {notice && <div role="status" className="mb-5 rounded border border-[#E9D9B7] bg-[#FFFCF0] p-4 text-xs leading-5 text-[#7D6B45]">{notice}</div>}
          {isLoading ? (
            <div className="grid min-h-80 place-items-center text-center text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F]">Creating advisory context…</div>
          ) : result ? (
            <div className="mx-auto max-w-3xl space-y-6 text-[#333333]">
              <h2 className="border-b border-[#D6D4CC] pb-3 text-sm font-bold uppercase tracking-widest">Material Context: {formData.material}</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <ListBlock title="Questions To Verify" values={result.questionsToVerify} />
                <ListBlock title="Source Documents To Check" values={result.sourceDocsToCheck} />
              </div>
              <ListBlock title="Material Behavior Considerations" values={result.materialBehavior} />
              <ListBlock title="Documentation Prompts" values={result.documentationPrompts} />
              <div className="rounded border border-[#F5EAD2] bg-[#FFFCF0] p-4 text-[10px] leading-5 text-[#7D6B45]">
                <strong>Advisory boundary:</strong> Verify material handling, printer compatibility, post-processing, ventilation, and end-use claims against the exact manufacturer guidance, TDS, SDS, slicer documentation, and technical validation applicable to the product.
              </div>
            </div>
          ) : (
            <div className="grid min-h-80 place-items-center text-center text-sm leading-6 text-[#6F6F6F]">
              <p className="max-w-md">Provide material, purpose, and priority context to create a source-aware checklist. This standalone tool does not save the result to a Project.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ListBlock({ title, values }: { title: string; values: string[] }) {
  return (
    <section>
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#4B7270]">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm leading-5">
        {values.map((value) => <li key={value} className="rounded border border-[#E2E1DB] bg-white px-3 py-2">{value}</li>)}
      </ul>
    </section>
  );
}
