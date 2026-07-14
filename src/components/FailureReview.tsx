import { useState, type ChangeEvent, type FormEvent } from "react";
import type { FailureReviewCard, FailureReviewFormData } from "../types";

interface Props {
  onBack: () => void;
}

const FIELD_CLASS = "mt-1.5 w-full rounded border border-[#D6D4CC] bg-white px-3 py-2.5 text-sm text-[#333333] outline-none transition focus:border-[#4B7270] focus:ring-2 focus:ring-[#4B7270]/30";
const LABEL_CLASS = "block text-[10px] font-bold uppercase tracking-wider text-[#5F5F5F]";

export function FailureReview({ onBack }: Props) {
  const [formData, setFormData] = useState<FailureReviewFormData>({
    whatHappened: "",
    printerTech: "",
    material: "",
    whenAppeared: "",
    whatChanged: "",
    photosAvailable: "No",
    whatTried: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FailureReviewCard | null>(null);
  const [notice, setNotice] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);
    setNotice("");

    try {
      const response = await fetch("/api/generate-failure-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failure review service unavailable");
      setResult(await response.json());
    } catch {
      setNotice("The AI service was unavailable. PrintPal created a labeled rules-based documentation frame instead.");
      setResult({
        likelyAreasToCheck: ["Printer and hardware state", "Slicer profile or process context", "Material condition and environment"],
        missingContext: ["Exact recorded settings or profile reference", "Environmental and material-condition observations"],
        nextSafeDocumentationStep: "Preserve the current printer, material, slicer, environment, and observed-failure context before changing another variable.",
        sourceCheckReminder: "Review the applicable printer manual, slicer documentation, manufacturer material guidance, TDS, and SDS.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <section className="mx-auto w-full max-w-7xl overflow-hidden rounded-lg border border-[#E2E1DB] bg-white shadow-sm" aria-busy={isLoading}>
      <header className="flex flex-col gap-3 bg-[#4B7270] p-4 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/75">Standalone Reference Tool</p>
          <h1 className="mt-1 text-lg font-semibold">Failure Review</h1>
        </div>
        <button type="button" onClick={onBack} className="rounded border border-white/40 px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition hover:bg-white/10">
          Back To Reference Tools
        </button>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <div className="border-b border-[#E2E1DB] p-5 lg:border-b-0 lg:border-r md:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <label htmlFor="failure-what-happened" className={LABEL_CLASS}>
              What Happened?
              <textarea id="failure-what-happened" required name="whatHappened" value={formData.whatHappened} onChange={handleChange} rows={3} placeholder="Describe the observed issue without assigning unsupported cause." className={`${FIELD_CLASS} resize-y`} />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label htmlFor="failure-printer-tech" className={LABEL_CLASS}>
                Printer Technology
                <select id="failure-printer-tech" required name="printerTech" value={formData.printerTech} onChange={handleChange} className={FIELD_CLASS}>
                  <option value="" disabled>Select technology</option>
                  <option value="Bed Slinger FDM">Bed Slinger FDM</option>
                  <option value="CoreXY / Enclosed FDM">CoreXY / Enclosed FDM</option>
                  <option value="LCD Resin">LCD Resin</option>
                  <option value="SLA Resin">SLA Resin</option>
                  <option value="Unknown">Other Or Unknown</option>
                </select>
              </label>
              <label htmlFor="failure-material" className={LABEL_CLASS}>
                Material
                <input id="failure-material" required name="material" value={formData.material} onChange={handleChange} className={FIELD_CLASS} />
              </label>
            </div>
            <label htmlFor="failure-when" className={LABEL_CLASS}>
              When Did The Issue Appear?
              <input id="failure-when" required name="whenAppeared" value={formData.whenAppeared} onChange={handleChange} placeholder="First layer, after five hours, or during cure" className={FIELD_CLASS} />
            </label>
            <label htmlFor="failure-changed" className={LABEL_CLASS}>
              What Changed Since The Last Known-Good Attempt?
              <input id="failure-changed" required name="whatChanged" value={formData.whatChanged} onChange={handleChange} placeholder="New spool, nozzle, profile, orientation, or environment" className={FIELD_CLASS} />
            </label>
            <label htmlFor="failure-tried" className={LABEL_CLASS}>
              What Has Already Been Tried?
              <textarea id="failure-tried" required name="whatTried" value={formData.whatTried} onChange={handleChange} rows={3} placeholder="Record actions already taken without requesting unsafe repair steps." className={`${FIELD_CLASS} resize-y`} />
            </label>
            <label htmlFor="failure-photos" className={LABEL_CLASS}>
              Photos Available For Your Reference?
              <select id="failure-photos" required name="photosAvailable" value={formData.photosAvailable} onChange={handleChange} className={FIELD_CLASS}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
            <button disabled={isLoading} type="submit" className="w-full rounded bg-[#4B7270] py-3 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-[#3D5D5B] disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? "Creating Review…" : "Create Review Frame"}
            </button>
          </form>
        </div>

        <div className="min-h-[480px] bg-[#F8F7F2] p-5 md:p-6" aria-live="polite">
          {notice && <div role="status" className="mb-5 rounded border border-[#E9D9B7] bg-[#FFFCF0] p-4 text-xs leading-5 text-[#7D6B45]">{notice}</div>}
          {isLoading ? (
            <div className="grid min-h-80 place-items-center text-center text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F]">Creating documentation frame…</div>
          ) : result ? (
            <div className="mx-auto max-w-3xl space-y-6 text-[#333333]">
              <h2 className="border-b border-[#D6D4CC] pb-3 text-sm font-bold uppercase tracking-widest">Non-Diagnostic Review Frame</h2>
              <ListBlock title="Areas To Check" values={result.likelyAreasToCheck} />
              <ListBlock title="Missing Context" values={result.missingContext} />
              <TextBlock title="Next Safe Documentation Step" value={result.nextSafeDocumentationStep} />
              <TextBlock title="Source Check Reminder" value={result.sourceCheckReminder} />
              <div className="rounded border border-[#F5EAD2] bg-[#FFFCF0] p-4 text-[10px] leading-5 text-[#7D6B45]">
                <strong>Advisory boundary:</strong> This tool does not diagnose failures, provide repair authority, or analyze images. Verify any corrective action against manufacturer manuals, slicer documentation, verified profiles, TDS, SDS, and qualified technical guidance.
              </div>
            </div>
          ) : (
            <div className="grid min-h-80 place-items-center text-center text-sm leading-6 text-[#6F6F6F]">
              <p className="max-w-md">Capture what happened, what changed, and what remains unknown. The result is a documentation frame, not a diagnosis, and is not saved to a Project.</p>
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

function TextBlock({ title, value }: { title: string; value: string }) {
  return (
    <section className="rounded border border-[#E2E1DB] bg-white p-4 text-sm leading-6">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#4B7270]">{title}</h3>
      <p className="mt-2">{value}</p>
    </section>
  );
}
